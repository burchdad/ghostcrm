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
  const [messageText, setMessageText] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAddPeopleModal, setShowAddPeopleModal] = useState(false);
  const [showChatDetailsModal, setShowChatDetailsModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notificationsMuted, setNotificationsMuted] = useState(false);

  // Handler functions for button functionality
  const handleVideoCall = async () => {
    try {
      console.log('Starting video call...');
      
      // Check for camera/microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      
      // In production, integrate with your video service:
      // - WebRTC peer-to-peer connection
      // - Twilio Video, Agora, or similar service
      // - Microsoft Teams SDK integration
      
      // For now, open a new window for video call (replace with your service)
      const videoWindow = window.open(
        `/video-call?chat=${selectedChat}&participants=${encodeURIComponent(selectedChatData?.name || '')}`,
        'videocall',
        'width=1200,height=800,resizable=yes,scrollbars=no'
      );
      
      if (!videoWindow) {
        throw new Error('Popup blocked. Please allow popups for video calls.');
      }
      
    } catch (error: any) {
      console.error('Video call error:', error);
      alert(`Video call failed: ${error.message}`);
    }
  };

  const handleAudioCall = async () => {
    try {
      console.log('Starting audio call...');
      
      // Check for microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      
      // In production, integrate with your audio service:
      // - WebRTC audio-only connection
      // - Twilio Voice, Vonage, or similar
      // - SIP.js for VoIP integration
      
      // For now, open audio call interface
      const audioWindow = window.open(
        `/audio-call?chat=${selectedChat}&participants=${encodeURIComponent(selectedChatData?.name || '')}&mode=audio`,
        'audiocall',
        'width=400,height=300,resizable=no,scrollbars=no'
      );
      
      if (!audioWindow) {
        throw new Error('Popup blocked. Please allow popups for audio calls.');
      }
      
    } catch (error: any) {
      console.error('Audio call error:', error);
      alert(`Audio call failed: ${error.message}`);
    }
  };

  const handleMoreOptions = (option?: string) => {
    if (option) {
      setShowMoreMenu(false);
      
      switch (option) {
        case 'add-people':
          setShowAddPeopleModal(true);
          break;
        case 'chat-details':
          setShowChatDetailsModal(true);
          break;
        case 'mute-notifications':
          setNotificationsMuted(prev => {
            const newMuted = !prev;
            console.log(`Notifications ${newMuted ? 'muted' : 'unmuted'}`);
            // In production, save this preference to backend
            return newMuted;
          });
          break;
        default:
          console.log(`More option selected: ${option}`);
      }
    } else {
      setShowMoreMenu(!showMoreMenu);
    }
  };

  const handleAttachment = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar';
    
    fileInput.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      
      const fileArray = Array.from(files);
      const maxFileSize = 25 * 1024 * 1024; // 25MB limit
      const maxFiles = 10;
      
      // Validate files
      const oversizedFiles = fileArray.filter(f => f.size > maxFileSize);
      if (oversizedFiles.length > 0) {
        alert(`Files too large (max 25MB): ${oversizedFiles.map(f => f.name).join(', ')}`);
        return;
      }
      
      if (fileArray.length > maxFiles) {
        alert(`Too many files selected (max ${maxFiles})`);
        return;
      }
      
      try {
        setIsUploading(true);
        setAttachedFiles(prev => [...prev, ...fileArray]);
        
        // In production, upload files to your server:
        // const uploadPromises = fileArray.map(file => uploadFile(file));
        // const uploadedFiles = await Promise.all(uploadPromises);
        
        console.log('Files attached:', fileArray.map(f => ({ name: f.name, size: f.size, type: f.type })));
        
      } catch (error) {
        console.error('File attachment error:', error);
        alert('Failed to attach files. Please try again.');
      } finally {
        setIsUploading(false);
      }
    };
    
    fileInput.click();
  };

  const handleEmoji = () => {
    // Production emoji categories
    const emojiCategories = {
      'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
      'Gestures': ['👍', '👎', '👌', '🤞', '✌️', '🤟', '🤘', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🦵'],
      'Objects': ['📱', '💻', '⌨️', '🖱️', '🖨️', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️'],
      'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️']
    };
    
    // Create emoji picker modal (in production, use a library like emoji-picker-react)
    const picker = document.createElement('div');
    picker.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 100px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1001;
      max-width: 300px;
      max-height: 200px;
      overflow-y: auto;
    `;
    
    let html = '<div style="margin-bottom: 8px; font-weight: bold; font-size: 14px;">Choose an emoji:</div>';
    
    Object.entries(emojiCategories).forEach(([category, emojis]) => {
      html += `<div style="margin-bottom: 8px;"><strong style="font-size: 12px; color: #666;">${category}</strong><br>`;
      emojis.forEach(emoji => {
        html += `<span style="cursor: pointer; font-size: 18px; margin: 2px; padding: 4px; border-radius: 4px; display: inline-block; hover: background-color: #f0f0f0;" onclick="
          document.querySelector('textarea[placeholder*=\"Message\"]').value += '${emoji}';
          document.querySelector('textarea[placeholder*=\"Message\"]').focus();
          this.parentElement.parentElement.parentElement.remove();
        ">${emoji}</span>`;
      });
      html += '</div>';
    });
    
    html += '<button onclick="this.parentElement.remove()" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: #f5f5f5; cursor: pointer;">Close</button>';
    
    picker.innerHTML = html;
    document.body.appendChild(picker);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (picker.parentElement) {
        picker.remove();
      }
    }, 10000);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && attachedFiles.length === 0) return;
    if (isSending) return;
    
    setIsSending(true);
    
    try {
      const messageData = {
        chatId: selectedChat,
        text: messageText.trim(),
        attachments: attachedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
        timestamp: new Date().toISOString(),
        sender: user?.email || 'Unknown User'
      };
      
      // In production, send to your API:
      // const response = await fetch('/api/collaboration/messages', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(messageData)
      // });
      // 
      // if (!response.ok) throw new Error('Failed to send message');
      
      console.log('Message sent:', messageData);
      
      // Clear the input
      setMessageText('');
      setAttachedFiles([]);
      
      // In production, you would also:
      // - Add message to local state/cache
      // - Send real-time notification via WebSocket
      // - Update chat list with latest message
      
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreMenu) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMoreMenu]);

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
                  <button onClick={handleVideoCall} className="teams-action-btn" title="Start video call">
                    <Video className="w-5 h-5" />
                  </button>
                  <button onClick={handleAudioCall} className="teams-action-btn" title="Start audio call">
                    <Phone className="w-5 h-5" />
                  </button>
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="teams-action-btn" title="More options">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {showMoreMenu && (
                      <div className="teams-more-menu">
                        <button 
                          onClick={() => handleMoreOptions('add-people')}
                          className="teams-more-menu-item"
                        >
                          Add people
                        </button>
                        <button 
                          onClick={() => handleMoreOptions('chat-details')}
                          className="teams-more-menu-item"
                        >
                          Chat details
                        </button>
                        <button 
                          onClick={() => handleMoreOptions('mute-notifications')}
                          className="teams-more-menu-item"
                        >
                          {notificationsMuted ? 'Unmute notifications' : 'Mute notifications'}
                        </button>
                      </div>
                    )}
                  </div>
                  <button onClick={onClose} className="teams-action-btn" style={{ marginLeft: '0.5rem' }} title="Close">
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
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <div className="teams-input-actions">
                      <button onClick={handleAttachment} className="teams-input-btn" title="Attach file">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button onClick={handleEmoji} className="teams-input-btn" title="Add emoji">
                        <Smile className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={handleSendMessage} 
                        className="teams-send-btn"
                        disabled={!messageText.trim()}
                        title="Send message"
                        style={{
                          opacity: messageText.trim() ? 1 : 0.5,
                          cursor: messageText.trim() ? 'pointer' : 'not-allowed'
                        }}
                      >
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
                  <button onClick={handleNewChat} className="teams-btn" title="Start new chat">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <button onClick={onClose} className="teams-btn" title="Close">
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
      
      {/* Production Modals */}
      {/* Add People Modal */}
      {showAddPeopleModal && (
        <div className="teams-modal-backdrop" onClick={() => setShowAddPeopleModal(false)}>
          <div className="teams-add-people-modal" onClick={(e) => e.stopPropagation()}>
            <div className="teams-modal-header">
              <h3>Add People to Chat</h3>
              <button 
                className="teams-modal-close" 
                onClick={() => setShowAddPeopleModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="teams-modal-content">
              <input 
                type="text" 
                placeholder="Search by name or email..."
                className="teams-search-input"
              />
              <div className="teams-user-list">
                <div className="teams-user-item">
                  <div className="teams-user-avatar">JD</div>
                  <div className="teams-user-info">
                    <div className="teams-user-name">John Doe</div>
                    <div className="teams-user-email">john@company.com</div>
                  </div>
                  <button className="teams-add-user-btn">Add</button>
                </div>
                <div className="teams-user-item">
                  <div className="teams-user-avatar">SM</div>
                  <div className="teams-user-info">
                    <div className="teams-user-name">Sarah Miller</div>
                    <div className="teams-user-email">sarah@company.com</div>
                  </div>
                  <button className="teams-add-user-btn">Add</button>
                </div>
              </div>
            </div>
            <div className="teams-modal-footer">
              <button 
                className="teams-btn teams-btn-secondary" 
                onClick={() => setShowAddPeopleModal(false)}
              >
                Cancel
              </button>
              <button className="teams-btn teams-btn-primary">
                Add Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Details Modal */}
      {showChatDetailsModal && (
        <div className="teams-modal-backdrop" onClick={() => setShowChatDetailsModal(false)}>
          <div className="teams-chat-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="teams-modal-header">
              <h3>Chat Details</h3>
              <button 
                className="teams-modal-close" 
                onClick={() => setShowChatDetailsModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="teams-modal-content">
              <div className="teams-chat-info">
                <div className="teams-chat-avatar-large">ST</div>
                <h4>{selectedChatData?.name || 'Chat Name'}</h4>
                <p className="teams-chat-status">Active now • 3 members</p>
              </div>
              <div className="teams-detail-section">
                <h5>Members</h5>
                <div className="teams-members-list">
                  <div className="teams-member-item">
                    <div className="teams-user-avatar">SC</div>
                    <div className="teams-user-info">
                      <div className="teams-user-name">Sarah Chen</div>
                      <div className="teams-user-role">Owner</div>
                    </div>
                  </div>
                  <div className="teams-member-item">
                    <div className="teams-user-avatar">JD</div>
                    <div className="teams-user-info">
                      <div className="teams-user-name">John Doe</div>
                      <div className="teams-user-role">Member</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="teams-detail-section">
                <h5>Settings</h5>
                <label className="teams-setting-item">
                  <span>Notifications</span>
                  <input 
                    type="checkbox" 
                    checked={!notificationsMuted}
                    onChange={(e) => setNotificationsMuted(!e.target.checked)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="teams-modal-backdrop" onClick={() => setShowNewChatModal(false)}>
          <div className="teams-new-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="teams-modal-header">
              <h3>Start New Chat</h3>
              <button 
                className="teams-modal-close" 
                onClick={() => setShowNewChatModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="teams-modal-content">
              <div className="teams-new-chat-options">
                <button className="teams-chat-option" onClick={() => {
                  // Start individual chat
                  setShowNewChatModal(false);
                  console.log('Starting individual chat');
                }}>
                  <div className="teams-option-icon">👤</div>
                  <div className="teams-option-text">
                    <h4>Individual Chat</h4>
                    <p>Start a private conversation</p>
                  </div>
                </button>
                <button className="teams-chat-option" onClick={() => {
                  // Start group chat
                  setShowNewChatModal(false);
                  console.log('Starting group chat');
                }}>
                  <div className="teams-option-icon">👥</div>
                  <div className="teams-option-text">
                    <h4>Group Chat</h4>
                    <p>Create a group conversation</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Attachments Display */}
      {attachedFiles.length > 0 && (
        <div className="teams-attachments-overlay">
          <div className="teams-attachments">
            <div className="teams-attachments-header">
              <span>Attached Files ({attachedFiles.length})</span>
              <button 
                className="teams-clear-attachments"
                onClick={() => setAttachedFiles([])}
                disabled={isUploading}
              >
                Clear All
              </button>
            </div>
            <div className="teams-attachments-list">
              {attachedFiles.map((file, index) => (
                <div key={index} className="teams-attachment-item">
                  <div className="teams-file-icon">
                    {file.type.startsWith('image/') ? '🖼️' : 
                     file.type.startsWith('video/') ? '🎥' : 
                     file.type.startsWith('audio/') ? '🎵' : '📄'}
                  </div>
                  <div className="teams-file-info">
                    <div className="teams-file-name">{file.name}</div>
                    <div className="teams-file-size">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
                  </div>
                  <button 
                    className="teams-remove-file"
                    onClick={() => {
                      setAttachedFiles(prev => prev.filter((_, i) => i !== index));
                    }}
                    disabled={isUploading}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {isUploading && (
              <div className="teams-upload-progress">
                <div className="teams-progress-bar">
                  <div className="teams-progress-fill"></div>
                </div>
                <span>Uploading files...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}