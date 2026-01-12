"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Loader2, Mic, Volume2, VolumeX, Settings, MoreVertical } from "lucide-react";
import { useI18n } from "../utils/I18nProvider";
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice';

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
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isRealtimeMode, setIsRealtimeMode] = useState(false); // Toggle between modes
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice: 'default',
    rate: 1,
    pitch: 1,
    volume: 1,
    language: 'en-US',
    autoSpeak: true,
    voiceGender: 'female'
  });
  const [shouldBeListening, setShouldBeListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voiceSubmitLock = useRef(false);
  const shouldBeListeningRef = useRef(false);

  // Browser voice chat functionality (legacy mode)
  const {
    isListening: isBrowserListening,
    isSpeaking: isBrowserSpeaking,
    isSupported: isVoiceSupported,
    transcript: browserTranscript,
    startListening: startBrowserListening,
    stopListening: stopBrowserListening,
    speak,
    stopSpeaking
  } = useVoiceChat({
    onTranscriptChange: (transcript) => {
      if (voiceInputMode && !isRealtimeMode) {
        setInputMessage(transcript);
      }
    },
    onSpeechEnd: (finalTranscript) => {
      console.log('🎤 BROWSER onSpeechEnd:', finalTranscript, 'voiceInputMode:', voiceInputMode);
      
      // Don't auto-send on first final result - accumulate text instead
      if (voiceInputMode && !isRealtimeMode && finalTranscript.trim()) {
        setInputMessage(prev => (prev ? prev + " " : "") + finalTranscript);
      }
    },
    onError: (error) => {
      console.error('Browser voice error:', error);
      setVoiceError(typeof error === 'string' ? error : 'Voice input failed. Please try again.');
      setVoiceInputMode(false);
      setShouldBeListening(false);
      shouldBeListeningRef.current = false;
      setTimeout(() => setVoiceError(null), 5000);
    },
    language: voiceSettings.language,
    continuous: true,
    shouldBeListeningRef // Pass ref for auto-restart
  });

  // Voice control handlers
  const handleStartVoice = async () => {
    if (isRealtimeMode) {
      // Realtime mode
      if (!isRealtimeConnected) {
        const connected = await connectRealtime();
        if (!connected) return;
      }
      setVoiceInputMode(true);
      startRealtimeListening();
    } else {
      // Browser mode - fixed implementation
      setVoiceInputMode(true);
      setShouldBeListening(true);
      shouldBeListeningRef.current = true;
      startBrowserListening();
    }
  };

  const handleStopVoice = () => {
    if (isRealtimeMode) {
      stopRealtimeListening();
      setVoiceInputMode(false);
    } else {
      // Browser mode - send accumulated message
      setShouldBeListening(false);
      shouldBeListeningRef.current = false;
      stopBrowserListening();
      setVoiceInputMode(false);
      
      // Send the accumulated message
      if (inputMessage.trim()) {
        if (voiceSubmitLock.current) return;
        
        voiceSubmitLock.current = true;
        sendMessage(inputMessage, true).finally(() => {
          voiceSubmitLock.current = false;
        });
      }
    }
  };

  const handleToggleVoiceMode = () => {
    if (isRealtimeMode && isRealtimeConnected) {
      disconnectRealtime();
    }
    setIsRealtimeMode(!isRealtimeMode);
    setVoiceInputMode(false);
  };

  // Determine current voice state
  const isListening = isRealtimeMode ? isRealtimeListening : isBrowserListening;
  const isSpeaking = isRealtimeMode ? isRealtimeSpeaking : isBrowserSpeaking;
  const currentTranscript = isRealtimeMode ? realtimeTranscript : browserTranscript;
  const currentError = realtimeError || voiceError;

  // Clear messages when modal opens - no default welcome message in production
  const {
    isConnected: isRealtimeConnected,
    isListening: isRealtimeListening,
    isSpeaking: isRealtimeSpeaking,
    isSupported: isRealtimeSupported,
    transcript: realtimeTranscript,
    connectionStatus,
    error: realtimeError,
    connect: connectRealtime,
    disconnect: disconnectRealtime,
    startListening: startRealtimeListening,
    stopListening: stopRealtimeListening,
    sendMessage: sendRealtimeMessage,
    interrupt: interruptRealtime
  } = useRealtimeVoice({
    onTranscriptChange: (transcript) => {
      if (isRealtimeMode) {
        setInputMessage(transcript);
      }
    },
    onResponse: (response) => {
      // Handle streaming response from realtime API
      console.log('🚀 Realtime response:', response);
    },
    onError: (error) => {
      console.error('Realtime voice error:', error);
      setVoiceError(error);
      setTimeout(() => setVoiceError(null), 5000);
    },
    onConnectionChange: (status) => {
      console.log('🔗 Connection status:', status);
    }
  });
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

    // Fix: Build history from next state, not stale state
    setMessages(prev => {
      const nextMessages = [...prev, userMessage];
      
      // Use nextMessages for API call to avoid stale state
      handleApiCall(messageContent, nextMessages.slice(-10), isVoiceMessage);
      
      return nextMessages;
    });
    
    setInputMessage("");
    setIsLoading(true);
  };
  
  const handleApiCall = async (messageContent: string, conversationHistory: Message[], isVoiceMessage: boolean) => {

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: messageContent, // Fixed: use messageContent instead of inputMessage
          isAuthenticated,
          currentPage,
          pageContext: getPageSpecificHelp(currentPage),
          conversationHistory: conversationHistory // Use passed history, not stale state
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

  // Legacy handler for backward compatibility - now uses new handleStartVoice
  const handleVoiceInput = async () => {
    await handleStartVoice();
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
              className="modal-settings-btn"
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
                <div className="ai-message-welcome">
                  <div className="ai-message-avatar-wrapper">
                    <div className="ai-message-avatar-small">
                      <Bot className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="ai-message-bubble">
                    <p className="ai-message-text">
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
                  <div className="ai-voice-indicator">
                    <Mic className="w-3 h-3" />
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

        {/* Voice Error Alert */}
        {currentError && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    {isRealtimeMode && realtimeError ? `Realtime Voice: ${realtimeError}` : currentError}
                  </p>
                  {currentError.includes('microphone') && (
                    <div className="mt-2 text-xs text-red-700">
                      <p>💡 <strong>Troubleshooting:</strong></p>
                      <p>• Make sure your headset/microphone is connected</p>
                      <p>• Check browser permissions: Click the 🔒 icon in address bar → Allow microphone</p>
                      <p>• Try refreshing the page if no permission prompt appeared</p>
                      {!isRealtimeMode && (
                        <button
                          onClick={async () => {
                            try {
                              setVoiceError(null);
                              await navigator.mediaDevices.getUserMedia({ audio: true });
                              alert('✅ Microphone permission granted! You can now try voice input again.');
                            } catch (e: any) {
                              setVoiceError(`Manual permission failed: ${e.message}`);
                            }
                          }}
                          className="mt-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Request Permission Manually
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setVoiceError(null);
                  // Clear realtime errors would need to be handled by the hook
                }}
                className="text-red-600 hover:text-red-800 p-1"
                title="Dismiss error"
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
            {(isVoiceSupported || isRealtimeSupported) && (
              <button
                onClick={voiceInputMode ? handleStopVoice : handleVoiceInput}
                disabled={isLoading || (isRealtimeMode && connectionStatus === 'connecting')}
                className={`voice-input-btn ${
                  isRealtimeMode ? 'realtime-mode' : ''
                } ${
                  voiceInputMode || isListening
                    ? "voice-input-active active"
                    : "voice-input-inactive"
                }`}
                title={
                  isRealtimeMode 
                    ? (voiceInputMode ? "Stop realtime voice" : "Start realtime voice")
                    : (voiceInputMode ? "Stop voice input" : "Start voice input")
                }
              >
                <Mic className={`w-4 h-4 ${voiceInputMode || isListening ? 'text-white' : (isRealtimeMode ? 'text-white' : 'text-gray-600')}`} />
                {isRealtimeMode && connectionStatus === 'connecting' && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                )}
                {isRealtimeMode && connectionStatus === 'connected' && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                )}
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
            <div className="ai-chat-disclaimer">
              <p>💡 <strong>Sign in</strong> to unlock personalized CRM assistance with your real data</p>
              <p>For now, I can help with product questions and getting started!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="aria-settings-overlay">
          <div className="aria-settings-modal">
            {/* Settings Header */}
            <div className="aria-settings-header">
              <div className="aria-settings-header-content">
                <div className="aria-settings-header-left">
                  <div className="aria-settings-icon">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="aria-settings-title">ARIA Settings</h3>
                    <p className="aria-settings-subtitle">Customize your AI assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="aria-settings-close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Settings Content */}
            <div className="aria-settings-content">
              {/* Voice Settings */}
              <div className="aria-settings-section">
                <h4 className="aria-settings-section-title">
                  <Mic className="aria-settings-section-icon" />
                  Voice & Speech
                </h4>
                
                {/* Voice Mode Toggle */}
                <div className="aria-settings-item">
                  <div className="aria-settings-toggle">
                    <label className="aria-settings-label">
                      ChatGPT-Quality Voice
                      <span className="aria-settings-badge">✨ PREMIUM</span>
                    </label>
                    <div className="aria-voice-mode-toggle">
                      <input
                        type="checkbox"
                        checked={isRealtimeMode}
                        onChange={handleToggleVoiceMode}
                        className="aria-settings-checkbox"
                        disabled={!isRealtimeSupported}
                      />
                      <div className="aria-voice-mode-status">
                        {isRealtimeMode ? (
                          <span className="aria-status-realtime">
                            🚀 Realtime Mode {connectionStatus === 'connected' ? '(Connected)' : '(Disconnected)'}
                          </span>
                        ) : (
                          <span className="aria-status-browser">🌐 Browser Mode</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="aria-settings-description">
                    {isRealtimeMode 
                      ? "Stream audio directly to/from OpenAI with barge-in capability, lower latency, and natural conversation flow."
                      : "Use browser speech recognition and synthesis. Simple but may have delays and interruptions."
                    }
                  </p>
                </div>
                
                {/* Auto-speak Toggle */}
                <div className="aria-settings-item">
                  <div className="aria-settings-toggle">
                    <label className="aria-settings-label">Auto-speak responses</label>
                    <input
                      type="checkbox"
                      checked={voiceSettings.autoSpeak}
                      onChange={(e) => handleVoiceSettingsChange({ autoSpeak: e.target.checked })}
                      className="aria-settings-checkbox"
                    />
                  </div>
                </div>
                
                {/* Voice Gender */}
                <div className="aria-settings-item">
                  <label className="aria-settings-label">Voice Gender</label>
                  <select
                    value={voiceSettings.voiceGender}
                    onChange={(e) => handleVoiceSettingsChange({ voiceGender: e.target.value as 'male' | 'female' | 'neutral' })}
                    className="aria-settings-select"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
                
                {/* Language */}
                <div className="aria-settings-item">
                  <label className="aria-settings-label">Language</label>
                  <select
                    value={voiceSettings.language}
                    onChange={(e) => handleVoiceSettingsChange({ language: e.target.value })}
                    className="aria-settings-select"
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
                <div className="aria-settings-item">
                  <div className="aria-settings-slider-container">
                    <label className="aria-settings-slider-label">
                      Speech Rate: {voiceSettings.rate.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voiceSettings.rate}
                      onChange={(e) => handleVoiceSettingsChange({ rate: parseFloat(e.target.value) })}
                      className="aria-settings-slider"
                    />
                    <div className="aria-settings-slider-labels">
                      <span>Slow</span>
                      <span>Fast</span>
                    </div>
                  </div>
                </div>
                
                {/* Pitch */}
                <div className="aria-settings-item">
                  <div className="aria-settings-slider-container">
                    <label className="aria-settings-slider-label">
                      Voice Pitch: {voiceSettings.pitch.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voiceSettings.pitch}
                      onChange={(e) => handleVoiceSettingsChange({ pitch: parseFloat(e.target.value) })}
                      className="aria-settings-slider"
                    />
                    <div className="aria-settings-slider-labels">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
                
                {/* Volume */}
                <div className="aria-settings-item">
                  <div className="aria-settings-slider-container">
                    <label className="aria-settings-slider-label">
                      Volume: {Math.round(voiceSettings.volume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={voiceSettings.volume}
                      onChange={(e) => handleVoiceSettingsChange({ volume: parseFloat(e.target.value) })}
                      className="aria-settings-slider"
                    />
                    <div className="aria-settings-slider-labels">
                      <span>Quiet</span>
                      <span>Loud</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AI Behavior Settings */}
              <div className="aria-settings-section aria-settings-divider">
                <h4 className="aria-settings-section-title">
                  <Bot className="aria-settings-section-icon" />
                  AI Behavior
                </h4>
                
                <div className="aria-settings-item">
                  <div className="aria-settings-toggle">
                    <label className="aria-settings-label">Detailed responses</label>
                    <input type="checkbox" defaultChecked className="aria-settings-checkbox" />
                  </div>
                </div>
                
                <div className="aria-settings-item">
                  <div className="aria-settings-toggle">
                    <label className="aria-settings-label">Proactive suggestions</label>
                    <input type="checkbox" defaultChecked className="aria-settings-checkbox" />
                  </div>
                </div>
                
                <div className="aria-settings-item">
                  <div className="aria-settings-toggle">
                    <label className="aria-settings-label">Context memory</label>
                    <input type="checkbox" defaultChecked className="aria-settings-checkbox" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Settings Footer */}
            <div className="aria-settings-footer">
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
                className="aria-settings-reset"
              >
                Reset to Defaults
              </button>
              
              <button
                onClick={() => setShowSettings(false)}
                className="aria-settings-done"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}