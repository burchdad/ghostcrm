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
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[700px] max-h-[90vh] 
                     flex flex-col overflow-hidden border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {selectedChat ? (
            // Teams-style conversation view
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedChat(null)}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                      {selectedChatData?.type === 'channel' ? (
                        <Hash className="w-5 h-5" />
                      ) : (
                        selectedChatData?.avatar || selectedChatData?.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{selectedChatData?.name}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedChatData?.isOnline ? 'Active now' : 'Last seen recently'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={onClose}
                    className="p-2.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.isOwn ? 'flex-row-reverse' : ''}`}>
                    {!message.isOwn && (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {message.avatar}
                      </div>
                    )}
                    <div className={`max-w-[70%] ${message.isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                      {!message.isOwn && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm text-gray-900">{message.sender}</span>
                          <span className="text-xs text-gray-500">{message.timestamp}</span>
                        </div>
                      )}
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.isOwn 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.message}</p>
                        {message.hasAttachment && (
                          <div className={`mt-3 p-3 rounded-lg border ${
                            message.isOwn 
                              ? 'bg-white bg-opacity-10 border-white border-opacity-20' 
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm font-medium">{message.attachmentName}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      {message.reactions && (
                        <div className="flex items-center gap-1 mt-2">
                          {message.reactions.map((reaction, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm">
                              <span className="text-sm">{reaction}</span>
                              {idx === 0 && <span className="text-xs text-gray-500 font-medium">{message.reactionCount}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                      {message.isOwn && (
                        <span className="text-xs text-gray-400 mt-2">{message.timestamp}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="bg-white border border-gray-300 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <div className="flex items-end gap-3 p-4">
                    <textarea
                      placeholder={`Message ${selectedChatData?.name}...`}
                      className="flex-1 resize-none border-0 focus:ring-0 focus:outline-none text-sm placeholder:text-gray-400"
                      rows={1}
                      style={{ minHeight: '24px', maxHeight: '120px' }}
                    />
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <Smile className="w-5 h-5" />
                      </button>
                      <button className="p-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Chat list view
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Chat</h2>
                  <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="p-6 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm 
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {isLoadingData ? (
                  <div className="p-6 space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 animate-pulse">
                        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-48"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat.id)}
                        className="flex items-center gap-4 p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                            {chat.type === 'channel' ? (
                              <Hash className="w-6 h-6" />
                            ) : (
                              chat.avatar || chat.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                            )}
                          </div>
                          {chat.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 truncate">{chat.name}</h4>
                            <span className="text-sm text-gray-500">{chat.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}