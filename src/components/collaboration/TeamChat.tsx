"use client";
import React, { useState, useRef, useEffect } from "react";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: "text" | "file" | "system" | "reaction";
  editedAt?: string;
  reactions: { [emoji: string]: string[] };
  attachments: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
  mentions: string[];
}

interface ChatChannel {
  id: string;
  name: string;
  description: string;
  type: "public" | "private" | "direct";
  members: string[];
  unreadCount: number;
  lastMessage?: ChatMessage;
  isArchived?: boolean;
}

interface TeamChatProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVideoCall?: (participants?: Array<{
    id: string;
    name: string;
    avatar: string;
    isMuted?: boolean;
    isVideoOff?: boolean;
    connectionQuality?: "excellent" | "good" | "fair" | "poor";
  }>) => void;
  className?: string;
}

export default function TeamChat({ isOpen, onClose, onStartVideoCall, className = "" }: TeamChatProps) {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const [showChannelSelector, setShowChannelSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize empty state
  useEffect(() => {
    setChannels([]);
    setMessages([]);
  }, []);

  useEffect(() => {
    if (activeChannel) {
      // Load messages for the active channel (empty for now)
      setMessages([]);
      
      // Mark channel as read
      setChannels(prev => prev.map(ch => 
        ch.id === activeChannel ? { ...ch, unreadCount: 0 } : ch
      ));
    }
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const teamMembers = [
    { id: "user_1", name: "John Smith", avatar: "🧑‍💼", status: "online" },
    { id: "user_2", name: "Jane Doe", avatar: "👩‍💼", status: "online" },
    { id: "user_3", name: "Mike Johnson", avatar: "👨‍💻", status: "away" },
    { id: "user_4", name: "Sarah Wilson", avatar: "👩‍🎨", status: "offline" },
    { id: "user_5", name: "David Brown", avatar: "👨‍📊", status: "online" }
  ];

  const emojis = ["👍", "👎", "❤️", "😊", "😮", "😢", "😡", "🔥", "✅", "❌", "💡", "🎉"];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: "current_user",
      senderName: "You",
      senderAvatar: "👤",
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: "text",
      reactions: {},
      attachments: [],
      mentions: extractMentions(newMessage),
      replyTo: replyingTo ? {
        messageId: replyingTo.id,
        content: replyingTo.content.substring(0, 50) + "...",
        senderName: replyingTo.senderName
      } : undefined
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
    setReplyingTo(null);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    const currentUserId = "current_user";
    setMessages(prev => prev.map(message => {
      if (message.id === messageId) {
        const reactions = { ...message.reactions };
        if (reactions[emoji]) {
          if (reactions[emoji].includes(currentUserId)) {
            reactions[emoji] = reactions[emoji].filter(id => id !== currentUserId);
            if (reactions[emoji].length === 0) {
              delete reactions[emoji];
            }
          } else {
            reactions[emoji] = [...reactions[emoji], currentUserId];
          }
        } else {
          reactions[emoji] = [currentUserId];
        }
        return { ...message, reactions };
      }
      return message;
    }));
    setShowEmojiPicker(null);
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@([a-zA-Z0-9-_]+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): string => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
    if (type.includes('document') || type.includes('word')) return '📝';
    return '📎';
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "online": return "🟢";
      case "away": return "🟡";
      case "busy": return "🔴";
      default: return "⚫";
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isCurrentUser = message.senderId === "current_user";
    const isSystem = message.type === "system";

    if (isSystem) {
      return (
        <div key={message.id} className="text-center py-2">
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {message.content}
          </span>
        </div>
      );
    }

    return (
      <div key={message.id} className={`flex gap-3 mb-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm">
            {message.senderAvatar}
          </div>
        </div>
        
        <div className={`flex-1 max-w-xs ${isCurrentUser ? 'text-right' : ''}`}>
          {/* Reply Context */}
          {message.replyTo && (
            <div className={`mb-2 p-2 border-l-4 border-blue-300 bg-blue-50 rounded text-xs ${isCurrentUser ? 'border-r-4 border-l-0' : ''}`}>
              <div className="font-medium text-blue-800">{message.replyTo.senderName}</div>
              <div className="text-blue-600">{message.replyTo.content}</div>
            </div>
          )}
          
          <div className={`rounded-lg p-3 ${
            isCurrentUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-100 text-slate-800'
          }`}>
            {!isCurrentUser && (
              <div className="text-xs font-medium mb-1 text-slate-600">
                {message.senderName}
              </div>
            )}
            
            <div className="text-sm whitespace-pre-wrap">
              {message.content.split(/(@[a-zA-Z0-9-_]+)/g).map((part, index) => 
                part.match(/^@[a-zA-Z0-9-_]+$/) ? (
                  <span key={index} className={`font-medium px-1 rounded ${
                    isCurrentUser 
                      ? 'bg-blue-500 text-blue-100' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {part}
                  </span>
                ) : part
              )}
            </div>
            
            {/* Attachments */}
            {message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map(attachment => (
                  <div key={attachment.id} className={`flex items-center gap-2 p-2 rounded ${
                    isCurrentUser ? 'bg-blue-500' : 'bg-white border border-slate-200'
                  }`}>
                    <span className="text-lg">{getFileIcon(attachment.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{attachment.name}</div>
                      <div className="text-xs opacity-75">{formatFileSize(attachment.size)}</div>
                    </div>
                    <button className="text-xs underline">Download</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className={`flex items-center gap-2 mt-1 text-xs text-slate-500 ${isCurrentUser ? 'justify-end' : ''}`}>
            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
            {message.editedAt && <span>(edited)</span>}
            
            <div className="flex gap-1">
              <button
                onClick={() => setReplyingTo(message)}
                className="hover:text-slate-700"
              >
                Reply
              </button>
              <button
                onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                className="hover:text-slate-700"
              >
                😊
              </button>
            </div>
          </div>
          
          {/* Reactions */}
          {Object.keys(message.reactions).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(message.reactions).map(([emoji, userIds]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(message.id, emoji)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    userIds.includes("current_user") 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{userIds.length}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* Emoji Picker */}
          {showEmojiPicker === message.id && (
            <div className="mt-2 p-2 bg-white border border-slate-200 rounded-lg shadow-lg grid grid-cols-6 gap-1 absolute z-10">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(message.id, emoji)}
                  className="p-1 hover:bg-slate-100 rounded text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderChannelList = () => (
    <div className="w-80 border-r border-slate-200 bg-slate-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800">Team Chat</h3>
          <button
            onClick={() => setShowChannelSelector(true)}
            className="p-1 text-slate-500 hover:text-slate-700 rounded"
            title="Browse channels"
          >
            ⚙️
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full px-3 py-2 pl-8 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <span className="absolute left-2 top-2.5 text-slate-400">🔍</span>
        </div>
      </div>
      
      {/* Channels */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="text-xs font-medium text-slate-500 mb-2 px-2">CHANNELS</div>
          {channels.filter(ch => ch.type === "public").map(channel => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-white transition-colors ${
                activeChannel === channel.id ? 'bg-white shadow-sm border border-slate-200' : ''
              }`}
            >
              <span className="text-lg"># </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 text-sm">{channel.name}</div>
                <div className="text-xs text-slate-500 truncate">{channel.description}</div>
              </div>
              {channel.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {channel.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="p-2">
          <div className="text-xs font-medium text-slate-500 mb-2 px-2">DIRECT MESSAGES</div>
          {channels.filter(ch => ch.type === "direct").map(channel => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-white transition-colors ${
                activeChannel === channel.id ? 'bg-white shadow-sm border border-slate-200' : ''
              }`}
            >
              <div className="relative">
                <span className="text-lg">👤</span>
                <span className="absolute -bottom-1 -right-1 text-xs">🟢</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 text-sm">{channel.name}</div>
              </div>
              {channel.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {channel.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="p-2">
          <div className="text-xs font-medium text-slate-500 mb-2 px-2">PRIVATE CHANNELS</div>
          {channels.filter(ch => ch.type === "private").map(channel => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-white transition-colors ${
                activeChannel === channel.id ? 'bg-white shadow-sm border border-slate-200' : ''
              }`}
            >
              <span className="text-lg">🔒</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 text-sm">{channel.name}</div>
                <div className="text-xs text-slate-500 truncate">{channel.description}</div>
              </div>
              {channel.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {channel.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Team Members */}
      <div className="border-t border-slate-200 p-2">
        <div className="text-xs font-medium text-slate-500 mb-2 px-2">TEAM MEMBERS</div>
        {teamMembers.slice(0, 5).map(member => (
          <div
            key={member.id}
            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors"
          >
            <span className="text-xs">{getStatusIcon(member.status)}</span>
            <span className="text-sm">{member.avatar}</span>
            <span className="text-sm text-slate-700 flex-1">{member.name}</span>
            {member.status === "online" && onStartVideoCall && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartVideoCall([{
                    id: member.id,
                    name: member.name,
                    avatar: member.avatar,
                    isMuted: false,
                    isVideoOff: false,
                    connectionQuality: "excellent" as const
                  }]);
                }}
                className="w-6 h-6 flex items-center justify-center text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                title={`Video call ${member.name}`}
              >
                📹
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderChatArea = () => {
    const currentChannel = channels.find(ch => ch.id === activeChannel);
    
    return (
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {currentChannel?.type === "direct" ? "👤" : 
                 currentChannel?.type === "private" ? "🔒" : "#"}
              </span>
              <div>
                <h3 className="font-semibold text-slate-800">{currentChannel?.name}</h3>
                <p className="text-sm text-slate-500">{currentChannel?.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                📞
              </button>
              <button 
                onClick={() => {
                  if (onStartVideoCall) {
                    // Start video call with all online channel members
                    const onlineMembers = teamMembers.filter(m => m.status === "online").map(member => ({
                      id: member.id,
                      name: member.name,
                      avatar: member.avatar,
                      isMuted: false,
                      isVideoOff: false,
                      connectionQuality: "excellent" as const
                    }));
                    onStartVideoCall(onlineMembers);
                  }
                }}
                className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                title="Start video call with channel"
              >
                🎥
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                ℹ️
              </button>
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {messages.map(message => renderMessage(message))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Composer */}
        <div className="border-t border-slate-200 p-4">
          {replyingTo && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-blue-800">Replying to {replyingTo.senderName}</span>
                  <div className="text-sm text-blue-600 truncate">{replyingTo.content}</div>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <div className="flex-1">
              <textarea
                ref={messageInputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${currentChannel?.name || 'channel'}...`}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 text-slate-500 hover:text-slate-700 rounded"
                    title="Attach file"
                  >
                    📎
                  </button>
                  <button
                    className="p-1 text-slate-500 hover:text-slate-700 rounded"
                    title="Add emoji"
                  >
                    😊
                  </button>
                  <button
                    className="p-1 text-slate-500 hover:text-slate-700 rounded"
                    title="Mention someone"
                  >
                    @
                  </button>
                  <button
                    className="p-1 text-slate-500 hover:text-slate-700 rounded"
                    title="Record voice message"
                  >
                    🎤
                  </button>
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-sm"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
          
          {isTyping.length > 0 && (
            <div className="mt-2 text-xs text-slate-500">
              {isTyping.join(", ")} {isTyping.length === 1 ? "is" : "are"} typing...
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            console.log('Files selected:', e.target.files);
          }}
        />
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${className}`} style={{ top: 'var(--unified-toolbar-h, 64px)', height: 'calc(100vh - var(--unified-toolbar-h, 64px))' }}>
      <div 
        className="absolute right-0 w-4/5 bg-white shadow-2xl flex"
        style={{
          top: '0',
          height: '100%'
        }}
      >
        {renderChannelList()}
        {renderChatArea()}
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 z-10"
        >
          ✕
        </button>
      </div>
    </div>
  );
}