"use client";
import React, { useState, useRef, useEffect } from "react";
import { useVoiceChat } from "@/hooks/useVoiceChat";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "data" | "action";
  isVoiceMessage?: boolean;
}

interface QuickAction {
  label: string;
  prompt: string;
  icon: string;
}

export default function ChatAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant", 
      content: "Hi! I'm your AI sales assistant. I can help you analyze leads, suggest follow-ups, generate reports, and answer questions about your CRM data. What would you like to know?",
      timestamp: new Date(),
      type: "text"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceInputMode, setVoiceInputMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice chat functionality
  const {
    isListening,
    isSpeaking,
    isSupported: isVoiceSupported,
    transcript,
    startListening,
    stopListening,
    toggleListening,
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
    }
  });

  const quickActions: QuickAction[] = [
    { label: "Show top leads", prompt: "Show me my top 5 highest-value leads", icon: "👥" },
    { label: "Lead insights", prompt: "Give me insights about my recent leads", icon: "📊" },
    { label: "Follow-up suggestions", prompt: "What leads need follow-up today?", icon: "📅" },
    { label: "Deal pipeline", prompt: "Analyze my current sales pipeline", icon: "💰" },
    { label: "Performance summary", prompt: "Summarize my sales performance this month", icon: "📈" },
    { label: "Email templates", prompt: "Help me write a follow-up email", icon: "✉️" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string, isVoiceMessage = false) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      type: "text",
      isVoiceMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: content, 
          conversationHistory: messages.slice(-10), // Send last 10 messages for context
          isAuthenticated: true
        })
      });

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I apologize, but I encountered an error processing your request.",
        timestamp: new Date(),
        type: data.type || "text"
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-speak response if voice mode is enabled and user used voice input
      if (autoSpeak && (isVoiceMessage || voiceInputMode)) {
        speak(assistantMessage.content);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        type: "text"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
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
      speak(content);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Chat Assistant</h1>
              <p className="text-gray-600">Ask questions about your CRM data and get intelligent insights</p>
            </div>
            
            {/* Voice Controls */}
            {isVoiceSupported && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoSpeak"
                    checked={autoSpeak}
                    onChange={(e) => setAutoSpeak(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="autoSpeak" className="text-sm text-gray-700">
                    Auto-speak responses
                  </label>
                </div>
                
                {(isListening || isSpeaking) && (
                  <div className="flex items-center space-x-2 text-sm">
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-3xl px-4 py-3 rounded-lg relative group ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-900"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {message.isVoiceMessage && (
                      <div className={`flex items-center mb-2 text-xs ${
                        message.role === "user" ? "text-blue-100" : "text-gray-500"
                      }`}>
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                        </svg>
                        Voice message
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                  
                  {/* Speak button for assistant messages */}
                  {message.role === "assistant" && isVoiceSupported && (
                    <button
                      onClick={() => handleSpeakMessage(message.content)}
                      className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
                      title={isSpeaking ? "Stop speaking" : "Speak message"}
                    >
                      {isSpeaking ? (
                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.814L4.186 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.186l4.197-3.814zm6.28 3.924a1 1 0 011.414 0 6.995 6.995 0 010 9.9 1 1 0 01-1.414-1.414 4.995 4.995 0 000-7.072 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 2.995 2.995 0 010 4.242 1 1 0 01-1.415-1.414 1.995 1.995 0 000-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                
                <div
                  className={`text-xs mt-2 ${
                    message.role === "user" ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg mb-1">{action.icon}</span>
                  <span className="text-xs text-center text-gray-700">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          {voiceInputMode && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
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
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={voiceInputMode ? "Speak your message or type here..." : "Ask me anything about your CRM data..."}
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  voiceInputMode ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                rows={1}
                disabled={isLoading}
              />
            </div>
            
            {/* Voice Input Button */}
            {isVoiceSupported && (
              <button
                onClick={voiceInputMode ? handleStopVoice : handleVoiceInput}
                disabled={isLoading}
                className={`px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  voiceInputMode || isListening
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                title={voiceInputMode ? "Stop voice input" : "Start voice input"}
              >
                {voiceInputMode || isListening ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )}
            
            {/* Send Button */}
            <button
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isLoading || voiceInputMode}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
