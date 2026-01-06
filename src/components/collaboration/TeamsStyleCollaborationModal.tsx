"use client";
import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Phone,
  Video,
  FileText,
  Search,
  MoreHorizontal,
  Plus,
  Users,
  Hash,
  Send,
  Paperclip,
  Smile,
  X,
  ArrowLeft
} from "lucide-react";
import "./TeamsStyleCollaborationModal.css";

// Safe auth hook that handles missing context
function useSafeAuth() {
  try {
    // Import auth hook dynamically to avoid context errors
    const { useAuth } = require('@/context/SupabaseAuthContext');
    return useAuth();
  } catch (error) {
    return { user: null, isLoading: false };
  }
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
  type: 'direct' | 'group' | 'channel';
}

interface Message {
  id: string;
  sender: string;
  avatar: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
  hasAttachment?: boolean;
  attachmentName?: string;
  reactions?: string[];
  reactionCount?: number;
}

interface TeamsStyleCollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamsStyleCollaborationModal({ isOpen, onClose }: TeamsStyleCollaborationModalProps) {
  const { user, isLoading: authLoading } = useSafeAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Mock data
  useEffect(() => {
    const timer = setTimeout(() => {
      setChats([
        {
          id: "1",
          name: "Sales Team",
          lastMessage: "Great job on the Q4 numbers everyone! 🎉",
          timestamp: "2:45 PM",
          unreadCount: 2,
          isOnline: true,
          type: "group"
        },
        {
          id: "2", 
          name: "Sarah Chen",
          lastMessage: "The client meeting went really well, thanks for the prep!",
          timestamp: "1:30 PM",
          unreadCount: 0,
          isOnline: true,
          type: "direct"
        },
        {
          id: "3",
          name: "Marketing Updates",
          lastMessage: "New campaign metrics are looking promising",
          timestamp: "12:15 PM",
          unreadCount: 1,
          isOnline: false,
          type: "channel"
        },
        {
          id: "4",
          name: "Mike Johnson",
          lastMessage: "Thanks for the quick turnaround!",
          timestamp: "11:30 AM",
          unreadCount: 0,
          isOnline: false,
          type: "direct"
        }
      ]);
      setIsLoadingData(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Mock messages for selected chat
  const getMockMessages = (chatId: string): Message[] => {
    return [
      {
        id: "1",
        sender: "Sarah Chen",
        avatar: "SC",
        message: "Hey team! Just wanted to update everyone on the Q4 progress. We're ahead of schedule by 15%! 🎉",
        timestamp: "Today at 2:34 PM",
        isOwn: false,
        reactions: ["👏", "🎉"],
        reactionCount: 3
      },
      {
        id: "2", 
        sender: "You",
        avatar: "SB",
        message: "That's fantastic news! Great work everyone. What's our next milestone?",
        timestamp: "Today at 2:36 PM",
        isOwn: true
      },
      {
        id: "3",
        sender: "Mike Johnson", 
        avatar: "MJ",
        message: "Thanks Sarah! The next big milestone is the product launch preparation. I'll share the timeline in our next meeting.",
        timestamp: "Today at 2:38 PM",
        isOwn: false
      },
      {
        id: "4",
        sender: "Sarah Chen",
        avatar: "SC", 
        message: "Perfect! Looking forward to it. Also attaching the latest metrics report for everyone to review.",
        timestamp: "Today at 2:40 PM",
        isOwn: false,
        hasAttachment: true,
        attachmentName: "Q4_Metrics_Report.pdf"
      }
    ];
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChatData = selectedChat ? chats.find(c => c.id === selectedChat) : null;
  const messages = selectedChat ? getMockMessages(selectedChat) : [];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="teams-modal-backdrop" onClick={onClose}>
        {/* Modal Content */}
        <div className="teams-modal-container" onClick={(e) => e.stopPropagation()}>
          {selectedChat ? (
            // Teams-style conversation view
            <div className="teams-conversation">
              {/* Header */}
              <div className="teams-conversation-header">
                <div className="teams-conversation-info">
                  <button onClick={() => setSelectedChat(null)} className="teams-back-btn">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="teams-conversation-avatar">
                    {selectedChatData?.type === 'channel' ? (
                      <Hash className="w-5 h-5" />
                    ) : (
                      selectedChatData?.avatar || selectedChatData?.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                    )}
                  </div>
                  <div className="teams-conversation-details">
                    <h3>{selectedChatData?.name}</h3>
                    <p>{selectedChatData?.isOnline ? 'Active now' : 'Last seen recently'}</p>
                  </div>
                </div>
                <div className="teams-conversation-actions">
                  <button className="teams-action-btn">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="teams-action-btn">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="teams-action-btn">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <button onClick={onClose} className="teams-action-btn" style={{ marginLeft: '0.5rem' }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="teams-messages-area">
                <div className="teams-messages-container">
                  {messages.map((message) => (
                    <div key={message.id} className={`teams-message ${message.isOwn ? 'teams-message-own' : ''}`}>
                      {!message.isOwn && (
                        <div className="teams-message-avatar">
                          {message.avatar}
                        </div>
                      )}
                      <div className={`teams-message-content ${message.isOwn ? 'teams-message-content-own' : ''}`}>
                        {!message.isOwn && (
                          <div className="teams-message-header">
                            <span className="teams-message-sender">{message.sender}</span>
                            <span className="teams-message-time">{message.timestamp}</span>
                          </div>
                        )}
                        <div className={`teams-message-bubble ${
                          message.isOwn ? 'teams-message-bubble-own' : 'teams-message-bubble-other'
                        }`}>
                          <p className="teams-message-text">{message.message}</p>
                          {message.hasAttachment && (
                            <div className={`teams-message-attachment ${
                              message.isOwn ? 'teams-attachment-own' : 'teams-attachment-other'
                            }`}>
                              <div className="teams-attachment-content">
                                <FileText className="w-4 h-4" />
                                <span className="teams-attachment-name">{message.attachmentName}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {message.reactions && (
                          <div className="teams-message-reactions">
                            {message.reactions.map((reaction, idx) => (
                              <div key={idx} className="teams-reaction">
                                <span className="teams-reaction-emoji">{reaction}</span>
                                {idx === 0 && <span className="teams-reaction-count">{message.reactionCount}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                        {message.isOwn && (
                          <span className="teams-message-time-own">{message.timestamp}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="teams-input-section">
                <div className="teams-input-container">
                  <div className="teams-input-wrapper">
                    <textarea
                      placeholder={`Message ${selectedChatData?.name}...`}
                      className="teams-input"
                      rows={1}
                    />
                    <div className="teams-input-actions">
                      <button className="teams-input-btn">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button className="teams-input-btn">
                        <Smile className="w-5 h-5" />
                      </button>
                      <button className="teams-send-btn">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Chat list view
            <div className="teams-chat-list">
              {/* Header */}
              <div className="teams-header">
                <div className="teams-header-title">
                  <h2>Chat</h2>
                  <button className="teams-btn">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <button onClick={onClose} className="teams-btn">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="teams-search-section">
                <div className="teams-search-container">
                  <Search className="teams-search-icon" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="teams-search-input"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="teams-chat-list-container">
                {isLoadingData ? (
                  <div className="teams-loading">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="teams-loading-item">
                        <div className="teams-loading-avatar"></div>
                        <div className="teams-loading-content">
                          <div className="teams-loading-title"></div>
                          <div className="teams-loading-text"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat.id)}
                        className="teams-chat-item"
                      >
                        <div className="teams-avatar-container">
                          <div className={`teams-avatar ${chat.type === 'channel' ? 'teams-avatar-hash' : 'teams-avatar-blue'}`}>
                            {chat.type === 'channel' ? (
                              <Hash className="w-6 h-6" />
                            ) : (
                              chat.avatar || chat.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                            )}
                          </div>
                          {chat.isOnline && (
                            <div className={`teams-status-indicator ${chat.isOnline ? 'teams-status-online' : 'teams-status-offline'}`}></div>
                          )}
                        </div>
                        <div className="teams-chat-content">
                          <div className="teams-chat-header">
                            <h4 className="teams-chat-name">{chat.name}</h4>
                            <span className="teams-chat-time">{chat.timestamp}</span>
                          </div>
                          <p className="teams-chat-message">{chat.lastMessage}</p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <div className="teams-unread-indicator"></div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}