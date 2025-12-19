"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Loader2 } from "lucide-react";
import { useI18n } from "../utils/I18nProvider";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update welcome message when authentication status or page changes
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        content: getWelcomeMessage(),
        role: "assistant",
        timestamp: new Date()
      }
    ]);
  }, [isAuthenticated, currentPage]);

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

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date()
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
        content: data.response,
        role: "assistant",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Assistant error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: t('ai_assistant.error_message', 'features'),
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
              <h2 className="text-xl font-semibold">
                {t('ai_assistant.title', 'features')}
              </h2>
              <p className="text-sm text-gray-500">
                {isAuthenticated 
                  ? `${t('helping_with', 'ui')} ${currentPage || 'CRM'} ${t('page', 'ui')}`
                  : t('ai_assistant.subtitle', 'features')
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="modal-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="ai-chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`ai-message ${message.role}`}
            >
              <div className="ai-message-content">
                <p className="whitespace-pre-wrap">{message.content}</p>
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
                    <span className="text-sm text-gray-600">{t('ai_assistant.thinking', 'features')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

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
                isAuthenticated
                  ? t('ai_assistant.placeholder_authenticated', 'features')
                  : t('ai_assistant.placeholder_guest', 'features')
              }
              className="ai-chat-input"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="ai-chat-send-btn"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {!isAuthenticated && (
            <div className="text-xs text-gray-500 mt-2 text-center space-y-1">
              <p>💡 <strong>Sign in</strong> to unlock personalized CRM assistance with your data</p>
              <p>For now, I can help with product questions and getting started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}