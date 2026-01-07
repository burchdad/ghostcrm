"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Loader2, Mic, Volume2, VolumeX, Settings, MoreVertical } from "lucide-react";
import { useI18n } from "../utils/I18nProvider";
import { useVoiceChat } from "@/hooks/useVoiceChat";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isVoiceMessage?: boolean;
}

interface VoiceSettings {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  language: string;
  autoSpeak: boolean;
  voiceGender: 'male' | 'female' | 'neutral';
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  currentPage?: string;
}

export default function AIAssistantModal({ isOpen, onClose, isAuthenticated, currentPage }: AIAssistantModalProps) {
  const { t } = useI18n();
  
  // Create context-aware welcome message
  const getWelcomeMessage = () => {
    if (isAuthenticated) {
      const pageContext = currentPage ? t(`ai_assistant.page_context_${currentPage}`, 'features') : '';
      return `${t('ai_assistant.welcome_authenticated', 'features')} ${pageContext}

${t('ai_assistant.authenticated_help', 'features')}`;
    } else {
      const pageHelp = getPageSpecificHelp(currentPage);
      return `${t('ai_assistant.welcome_guest', 'features')}${pageHelp}

${t('ai_assistant.guest_help', 'features')}`;
    }
  };

  const getPageSpecificHelp = (page?: string) => {
    switch (page) {
      case 'login':
        return ` ${t('ai_assistant.page_context_login', 'features')}`;
      case 'register':
        return ` ${t('ai_assistant.page_context_register', 'features')}`;
      case 'home':
        return ` ${t('ai_assistant.page_context_home', 'features')}`;
      case 'dashboard':
        return ` ${t('ai_assistant.page_context_dashboard', 'features')}`;
      case 'leads':
        return ` ${t('ai_assistant.page_context_leads', 'features')}`;
      case 'deals':
        return ` ${t('ai_assistant.page_context_deals', 'features')}`;
      default:
        return '';
    }
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceInputMode, setVoiceInputMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice: 'default',
    rate: 1,
    pitch: 1,
    volume: 1,
    language: 'en-US',
    autoSpeak: true,
    voiceGender: 'female'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice chat functionality with custom settings
  const {
    isListening,
    isSpeaking,
    isSupported: isVoiceSupported,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  } = useVoiceChat({
    onTranscriptChange: (transcript) => {
      if (voiceInputMode) {
        setInputMessage(transcript);
      }
    },
    onSpeechEnd: (finalTranscript) => {
      if (voiceInputMode && finalTranscript.trim()) {
        sendMessage(finalTranscript, true);
        setVoiceInputMode(false);
      }
    },
    onError: (error) => {
      console.error('Voice error:', error);
      setVoiceInputMode(false);
    },
    language: voiceSettings.language,
    continuous: true
  });

  // Clear messages when modal opens - no default welcome message in production
  useEffect(() => {
    if (isOpen) {
      setMessages([]);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (content?: string, isVoiceMessage = false) => {
    const messageContent = content || inputMessage;
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      role: "user",
      timestamp: new Date(),
      isVoiceMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: inputMessage,
          isAuthenticated,
          currentPage,
          pageContext: getPageSpecificHelp(currentPage),
          conversationHistory: messages.slice(-10) // Last 10 messages for context
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I apologize, but I encountered an error processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-speak response if voice mode is enabled and user used voice input
      if (autoSpeak && (isVoiceMessage || voiceInputMode)) {
        speak(assistantMessage.content);
      }
    } catch (error) {
      console.error("AI Assistant error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing technical difficulties right now. Please try again in a moment.",
        role: "assistant",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Voice control handlers
  const handleVoiceInput = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setVoiceInputMode(true);
    startListening();
  };

  const handleStopVoice = () => {
    setVoiceInputMode(false);
    stopListening();
  };

  const handleSpeakMessage = (content: string) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      // Use custom voice settings with proper parameters
      speak(content, {
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch
        // Note: volume and language are handled differently in the Web Speech API
      });
    }
  };

  // Settings handlers
  const handleVoiceSettingsChange = (newSettings: Partial<VoiceSettings>) => {
    setVoiceSettings(prev => ({ ...prev, ...newSettings }));
    if (newSettings.autoSpeak !== undefined) {
      setAutoSpeak(newSettings.autoSpeak);
    }
  };

  const getAvailableVoices = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.getVoices().filter(voice => {
        if (voiceSettings.voiceGender === 'male') return voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('man');
        if (voiceSettings.voiceGender === 'female') return voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman');
        return true;
      });
    }
    return [];
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container ai-modal-container">
        {/* Header */}
        <div className="ai-modal-header">
          <div className="ai-modal-title">
            <div className="ai-modal-icon">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold gradient-text">
                ARIA
              </h2>
              <p className="text-sm text-gray-500">
                Advanced Responsive Intelligence Assistant
              </p>
            </div>
          </div>
          
          {/* Settings and Controls */}
          <div className="flex items-center space-x-2">
            {/* Voice Status Indicator */}
            {isVoiceSupported && (isListening || isSpeaking) && (
              <div className="flex items-center space-x-2 text-sm mr-2">
                {isListening && (
                  <span className="flex items-center text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></div>
                    Listening...
                  </span>
                )}
                {isSpeaking && (
                  <span className="flex items-center text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-2"></div>
                    Speaking...
                  </span>
                )}
              </div>
            )}
            
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="AI Assistant Settings"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            <button
              onClick={onClose}
              className="modal-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="ai-chat-messages">
          {messages.length === 0 && (
            <div className="flex justify-start">
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-blue-50 rounded-2xl px-4 py-3 max-w-sm">
                  <p className="text-sm text-gray-700">
                    Hello! I'm your AI Assistant. I can help you with:
                    {"\n\n"}• Finding and analyzing leads, deals, and inventory
                    {"\n"}• Providing predictive insights and market intelligence  
                    {"\n"}• Voice-enabled hands-free CRM operations
                    {"\n"}• Real-time business analytics and reporting
                    {"\n\n"}What can I help you with today?
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`ai-message ${message.role}`}
            >
              <div className="ai-message-content">
                {message.isVoiceMessage && (
                  <div className="flex items-center mb-2 text-xs text-gray-500">
                    <Mic className="w-3 h-3 mr-1" />
                    Voice message
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <p className="whitespace-pre-wrap flex-1">{message.content}</p>
                  
                  {/* Speak button for assistant messages */}
                  {message.role === "assistant" && isVoiceSupported && (
                    <button
                      onClick={() => handleSpeakMessage(message.content)}
                      className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
                      title={isSpeaking ? "Stop speaking" : "Speak message"}
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-4 h-4 text-red-600" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  )}
                </div>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                    <span className="text-sm text-gray-600">AI is processing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Voice Input Alert */}
        {voiceInputMode && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-red-800">Listening for voice input...</p>
                  {transcript && (
                    <p className="text-xs text-red-600 mt-1">"{transcript}"</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleStopVoice}
                className="text-red-600 hover:text-red-800 p-1"
                title="Stop voice input"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="ai-chat-input-container">
          <div className="ai-chat-input-form">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                voiceInputMode
                  ? "Speak your message or type here..."
                  : isAuthenticated
                  ? "Ask me about your CRM data..."
                  : "Ask me about Ghost Auto CRM features..."
              }
              className={`ai-chat-input ${
                voiceInputMode ? "border-red-300 bg-red-50" : ""
              }`}
              disabled={isLoading}
            />
            
            {/* Voice Input Button */}
            {isVoiceSupported && (
              <button
                onClick={voiceInputMode ? handleStopVoice : handleVoiceInput}
                disabled={isLoading}
                className={`px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  voiceInputMode || isListening
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                title={voiceInputMode ? "Stop voice input" : "Start voice input"}
              >
                <Mic className={`w-4 h-4 ${voiceInputMode || isListening ? 'text-white' : 'text-gray-600'}`} />
              </button>
            )}
            
            <button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading || voiceInputMode}
              className="ai-chat-send-btn"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {!isAuthenticated && (
            <div className="text-xs text-gray-500 mt-2 text-center space-y-1">
              <p>💡 <strong>Sign in</strong> to unlock personalized CRM assistance with your real data</p>
              <p>For now, I can help with product questions and getting started!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Settings Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">ARIA Settings</h3>
                    <p className="text-sm text-gray-600">Customize your AI assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Settings Content */}
            <div className="px-6 py-4 space-y-6 max-h-96 overflow-y-auto">
              {/* Voice Settings */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-900 flex items-center">
                  <Mic className="w-4 h-4 mr-2 text-blue-600" />
                  Voice & Speech
                </h4>
                
                {/* Auto-speak Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Auto-speak responses</label>
                  <input
                    type="checkbox"
                    checked={voiceSettings.autoSpeak}
                    onChange={(e) => handleVoiceSettingsChange({ autoSpeak: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                
                {/* Voice Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Voice Gender</label>
                  <select
                    value={voiceSettings.voiceGender}
                    onChange={(e) => handleVoiceSettingsChange({ voiceGender: e.target.value as 'male' | 'female' | 'neutral' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
                
                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={voiceSettings.language}
                    onChange={(e) => handleVoiceSettingsChange({ language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es-ES">Spanish (Spain)</option>
                    <option value="es-MX">Spanish (Mexico)</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                    <option value="it-IT">Italian</option>
                    <option value="pt-BR">Portuguese (Brazil)</option>
                    <option value="zh-CN">Chinese (Mandarin)</option>
                    <option value="ja-JP">Japanese</option>
                    <option value="ko-KR">Korean</option>
                  </select>
                </div>
                
                {/* Speech Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speech Rate: {voiceSettings.rate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.rate}
                    onChange={(e) => handleVoiceSettingsChange({ rate: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>
                
                {/* Pitch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice Pitch: {voiceSettings.pitch.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.pitch}
                    onChange={(e) => handleVoiceSettingsChange({ pitch: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
                
                {/* Volume */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volume: {Math.round(voiceSettings.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.volume}
                    onChange={(e) => handleVoiceSettingsChange({ volume: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Quiet</span>
                    <span>Loud</span>
                  </div>
                </div>
              </div>
              
              {/* AI Behavior Settings */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-900 flex items-center">
                  <Bot className="w-4 h-4 mr-2 text-purple-600" />
                  AI Behavior
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Detailed responses</label>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Proactive suggestions</label>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Context memory</label>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Settings Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    // Reset to defaults
                    setVoiceSettings({
                      voice: 'default',
                      rate: 1,
                      pitch: 1,
                      volume: 1,
                      language: 'en-US',
                      autoSpeak: true,
                      voiceGender: 'female'
                    });
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Reset to Defaults
                </button>
                
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}