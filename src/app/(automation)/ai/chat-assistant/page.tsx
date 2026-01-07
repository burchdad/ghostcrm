"use client";
import React, { useState, useRef, useEffect } from "react";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import "./styles.css";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "data" | "action";
  isVoiceMessage?: boolean;
}

export default function ChatAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
          conversationHistory: messages.slice(-10),
          isAuthenticated: true
        })
      });

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I apologize, but I encountered an error processing your request. Please try again.",
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
        content: "I'm experiencing technical difficulties right now. Please try again in a moment.",
        timestamp: new Date(),
        type: "text"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
    <div className="ai-chat-container">
      {/* Header */}
      <div className="ai-chat-header">
        <div className="ai-chat-header-content">
          <div>
            <h1 className="ai-chat-title">AI Assistant</h1>
            <p className="ai-chat-subtitle">Your intelligent CRM assistant for real-time business operations</p>
          </div>
          
          {/* Voice Controls */}
          {isVoiceSupported && (
            <div className="ai-voice-controls">
              <div className="ai-voice-checkbox-container">
                <input
                  type="checkbox"
                  id="autoSpeak"
                  checked={autoSpeak}
                  onChange={(e) => setAutoSpeak(e.target.checked)}
                  className="ai-voice-checkbox"
                />
                <label htmlFor="autoSpeak" className="ai-voice-checkbox-label">
                  Auto-speak responses
                </label>
              </div>
              
              {(isListening || isSpeaking) && (
                <div className="ai-voice-status">
                  {isListening && (
                    <span className="ai-voice-status listening">
                      <div className="ai-voice-status-dot listening"></div>
                      Listening...
                    </span>
                  )}
                  {isSpeaking && (
                    <span className="ai-voice-status speaking">
                      <div className="ai-voice-status-dot speaking"></div>
                      Speaking...
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="ai-chat-messages">
        <div className="ai-chat-messages-container">
          {messages.length === 0 && (
            <div className="ai-message assistant">
              <div className="ai-message-bubble assistant">
                <div className="ai-message-header">
                  <div className="ai-message-content">
                    <div className="ai-message-text">
                      Hello! I'm your AI Assistant. I can help you with:
                      {'\n\n'}• Finding and analyzing leads, deals, and inventory
                      {'\n'}• Providing predictive insights and market intelligence  
                      {'\n'}• Voice-enabled hands-free CRM operations
                      {'\n'}• Real-time business analytics and reporting
                      {'\n\n'}What can I help you with today?
                    </div>
                  </div>
                </div>
                <div className="ai-message-timestamp assistant">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`ai-message ${message.role}`}>
              <div className={`ai-message-bubble ${message.role}`}>
                <div className="ai-message-header">
                  <div className="ai-message-content">
                    {message.isVoiceMessage && (
                      <div className={`ai-voice-message-indicator ${message.role}`}>
                        <svg className="ai-voice-message-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7 4a3 3 0 616 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 715 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                        </svg>
                        Voice message
                      </div>
                    )}
                    <div className="ai-message-text">{message.content}</div>
                  </div>
                  
                  {/* Speak button for assistant messages */}
                  {message.role === "assistant" && isVoiceSupported && (
                    <button
                      onClick={() => handleSpeakMessage(message.content)}
                      className={`ai-speak-button ${isSpeaking ? 'speaking' : ''}`}
                      title={isSpeaking ? "Stop speaking" : "Speak message"}
                    >
                      {isSpeaking ? (
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.814L4.186 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.186l4.197-3.814zm6.28 3.924a1 1 0 011.414 0 6.995 6.995 0 010 9.9 1 1 0 01-1.414-1.414 4.995 4.995 0 000-7.072 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 2.995 2.995 0 010 4.242 1 1 0 01-1.415-1.414 1.995 1.995 0 000-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                
                <div className={`ai-message-timestamp ${message.role}`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="ai-loading-indicator">
              <div className="ai-loading-bubble">
                <div className="ai-loading-content">
                  <div className="ai-loading-spinner"></div>
                  <span className="ai-loading-text">AI is processing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="ai-chat-input-container">
        <div className="ai-chat-input-wrapper">
          {voiceInputMode && (
            <div className="ai-voice-input-alert">
              <div className="ai-voice-input-content">
                <div className="ai-voice-input-dot"></div>
                <div>
                  <p className="ai-voice-input-text">Listening for voice input...</p>
                  {transcript && (
                    <p className="ai-voice-transcript">"{transcript}"</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleStopVoice}
                className="ai-voice-stop-button"
                title="Stop voice input"
              >
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="ai-chat-input-row">
            <div className="ai-chat-input-field-wrapper">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={voiceInputMode ? "Speak your message or type here..." : "Ask me anything about your CRM data..."}
                className={`ai-chat-input-field ${voiceInputMode ? 'voice-mode' : ''}`}
                rows={1}
                disabled={isLoading}
              />
            </div>
            
            {/* Voice Input Button */}
            {isVoiceSupported && (
              <button
                onClick={voiceInputMode ? handleStopVoice : handleVoiceInput}
                disabled={isLoading}
                className={`ai-voice-input-button ${voiceInputMode || isListening ? 'active' : 'inactive'}`}
                title={voiceInputMode ? "Stop voice input" : "Start voice input"}
              >
                {voiceInputMode || isListening ? (
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 616 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 715 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )}
            
            {/* Send Button */}
            <button
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isLoading || voiceInputMode}
              className="ai-send-button"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
