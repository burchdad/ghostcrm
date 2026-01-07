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
  aiResponse?: {
    type: 'lead_info' | 'deal_info' | 'navigation' | 'error';
    action?: string;
    data?: any;
    message?: string;
    route?: string;
    quickActions?: { label: string; action: string }[];
    suggestions?: string[];
  };
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
  
  // Device Management States
  const [showDeviceSetup, setShowDeviceSetup] = useState(false);
  const [callType, setCallType] = useState<'video' | 'audio' | null>(null);
  const [availableDevices, setAvailableDevices] = useState({
    cameras: [] as MediaDeviceInfo[],
    microphones: [] as MediaDeviceInfo[],
    speakers: [] as MediaDeviceInfo[]
  });
  const [selectedDevices, setSelectedDevices] = useState({
    camera: '',
    microphone: '',
    speaker: ''
  });
  const [devicePermissions, setDevicePermissions] = useState({
    camera: false,
    microphone: false
  });
  const [isTestingDevices, setIsTestingDevices] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

  // Handler functions for button functionality
  const handleVideoCall = async () => {
    setCallType('video');
    setShowDeviceSetup(true);
  };

  const handleAudioCall = async () => {
    setCallType('audio');
    setShowDeviceSetup(true);
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
      // Check if this is an AI assistant command
      const aiResponse = await processAICommand(messageText.trim());
      
      const messageData = {
        chatId: selectedChat,
        text: messageText.trim(),
        attachments: attachedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
        timestamp: new Date().toISOString(),
        sender: user?.email || 'Unknown User',
        aiResponse: aiResponse
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

  // AI Assistant Command Processing
  const processAICommand = async (message: string): Promise<any> => {
    const lowerMessage = message.toLowerCase();
    
    // Lead lookup patterns
    if (lowerMessage.includes('locate') || lowerMessage.includes('find') || lowerMessage.includes('search')) {
      if (lowerMessage.includes('lead')) {
        // Extract lead name
        const leadNameMatch = message.match(/(?:locate|find|search).*?(?:lead|for)\s+([\w\s]+)/i);
        if (leadNameMatch) {
          const leadName = leadNameMatch[1].trim();
          return await handleLeadLookup(leadName);
        }
      }
    }
    
    // Deal lookup patterns
    if (lowerMessage.includes('deal') && (lowerMessage.includes('show') || lowerMessage.includes('find'))) {
      const dealMatch = message.match(/(?:show|find).*?deal\s+([\w\s]+)/i);
      if (dealMatch) {
        const dealName = dealMatch[1].trim();
        return await handleDealLookup(dealName);
      }
    }
    
    // Navigation patterns
    if (lowerMessage.includes('go to') || lowerMessage.includes('navigate to')) {
      const navigationMatch = message.match(/(?:go to|navigate to)\s+([\w\s]+)/i);
      if (navigationMatch) {
        const destination = navigationMatch[1].trim();
        return await handleNavigation(destination);
      }
    }
    
    return null;
  };
  
  const handleLeadLookup = async (leadName: string) => {
    // Mock lead data - in production, fetch from your API
    const mockLeads = [
      {
        id: '1',
        name: 'Kaisyn Burch',
        email: 'kaisyn.burch@email.com',
        phone: '(555) 123-4567',
        status: 'New',
        source: 'Website',
        created: '2024-01-06',
        assignedTo: 'Sales Rep',
        value: '$45,000',
        vehicle: '2024 Honda Accord'
      },
      {
        id: '2', 
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '(555) 987-6543',
        status: 'Qualified',
        source: 'Referral',
        created: '2024-01-05',
        assignedTo: 'Sales Rep',
        value: '$52,000',
        vehicle: '2024 Toyota Camry'
      }
    ];
    
    const foundLead = mockLeads.find(lead => 
      lead.name.toLowerCase().includes(leadName.toLowerCase())
    );
    
    if (foundLead) {
      // Option 1: Navigate to lead (simulate)
      console.log('Navigating to lead:', foundLead.id);
      // In production: window.location.href = `/leads/${foundLead.id}`;
      
      // Option 2: Return lead data for inline display
      return {
        type: 'lead_info',
        action: 'Found and displaying lead information',
        data: foundLead,
        quickActions: [
          { label: 'View Full Lead', action: `navigate:/leads/${foundLead.id}` },
          { label: 'Send Email', action: `email:${foundLead.email}` },
          { label: 'Call Lead', action: `call:${foundLead.phone}` },
          { label: 'Schedule Meeting', action: `schedule:${foundLead.id}` }
        ]
      };
    } else {
      return {
        type: 'error',
        action: 'Lead not found',
        message: `No lead found matching "${leadName}". Would you like me to search by partial name or create a new lead?`,
        suggestions: [
          'Search partial name',
          'Show recent leads',
          'Create new lead'
        ]
      };
    }
  };
  
  const handleDealLookup = async (dealName: string) => {
    // Mock deal lookup
    return {
      type: 'deal_info',
      action: 'Deal lookup functionality',
      message: `Searching for deal: ${dealName}`,
      data: {
        name: dealName,
        value: '$75,000',
        stage: 'Negotiation',
        closeDate: '2024-02-15'
      }
    };
  };
  
  const handleNavigation = async (destination: string) => {
    const routes: { [key: string]: string } = {
      'leads': '/leads',
      'deals': '/deals', 
      'dashboard': '/dashboard',
      'calendar': '/calendar',
      'reports': '/reports',
      'contacts': '/leads',
      'inventory': '/inventory'
    };
    
    const route = routes[destination.toLowerCase()];
    if (route) {
      console.log('Navigating to:', route);
      // In production: window.location.href = route;
      
      return {
        type: 'navigation',
        action: `Navigating to ${destination}`,
        route: route
      };
    }
    
    return {
      type: 'error', 
      action: 'Navigation failed',
      message: `Unknown destination: ${destination}. Available: leads, deals, dashboard, calendar, reports, inventory`
    };
  };

  // Handle quick action clicks from AI responses
  const handleQuickAction = (action: string) => {
    const [actionType, value] = action.split(':');
    
    switch (actionType) {
      case 'navigate':
        console.log('Navigating to:', value);
        // In production: window.location.href = value;
        alert(`Would navigate to: ${value}`);
        break;
        
      case 'email':
        console.log('Opening email to:', value);
        window.open(`mailto:${value}`);
        break;
        
      case 'call':
        console.log('Calling:', value);
        window.open(`tel:${value}`);
        break;
        
      case 'schedule':
        console.log('Scheduling meeting for lead:', value);
        // In production: open calendar modal or navigate to scheduling
        alert(`Would open scheduling for lead ID: ${value}`);
        break;
        
      default:
        console.log('Unknown action:', action);
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
        message: "Locate the new lead Kaisyn Burch",
        timestamp: "Today at 2:36 PM",
        isOwn: true
      },
      {
        id: "3",
        sender: "AI Assistant", 
        avatar: "🤖",
        message: "Found lead information for Kaisyn Burch:",
        timestamp: "Today at 2:36 PM",
        isOwn: false,
        aiResponse: {
          type: 'lead_info',
          data: {
            name: 'Kaisyn Burch',
            email: 'kaisyn.burch@email.com',
            phone: '(555) 123-4567',
            status: 'New',
            source: 'Website',
            created: '2024-01-06',
            value: '$45,000',
            vehicle: '2024 Honda Accord'
          },
          quickActions: [
            { label: 'View Full Lead', action: 'navigate:/leads/1' },
            { label: 'Send Email', action: 'email:kaisyn.burch@email.com' },
            { label: 'Call Lead', action: 'call:(555) 123-4567' },
            { label: 'Schedule Meeting', action: 'schedule:1' }
          ]
        }
      },
      {
        id: "4",
        sender: "Mike Johnson", 
        avatar: "MJ",
        message: "Thanks for the quick lookup! The AI assistant is really helpful.",
        timestamp: "Today at 2:38 PM",
        isOwn: false
      }
    ];
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Device Management Functions
  const enumerateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const cameras = devices.filter(device => device.kind === 'videoinput');
      const microphones = devices.filter(device => device.kind === 'audioinput');
      const speakers = devices.filter(device => device.kind === 'audiooutput');
      
      setAvailableDevices({ cameras, microphones, speakers });
      
      // Set default devices if not already selected
      if (!selectedDevices.camera && cameras.length > 0) {
        setSelectedDevices(prev => ({ ...prev, camera: cameras[0].deviceId }));
      }
      if (!selectedDevices.microphone && microphones.length > 0) {
        setSelectedDevices(prev => ({ ...prev, microphone: microphones[0].deviceId }));
      }
      if (!selectedDevices.speaker && speakers.length > 0) {
        setSelectedDevices(prev => ({ ...prev, speaker: speakers[0].deviceId }));
      }
      
    } catch (error) {
      console.error('Error enumerating devices:', error);
    }
  };
  
  const checkPermissions = async () => {
    try {
      // Check camera permission
      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      setDevicePermissions({
        camera: cameraPermission.state === 'granted',
        microphone: micPermission.state === 'granted'
      });
      
    } catch (error) {
      console.log('Permission API not supported, will check during device access');
    }
  };
  
  const requestDeviceAccess = async (type: 'video' | 'audio') => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: type === 'video'
      };
      
      if (selectedDevices.microphone) {
        constraints.audio = { deviceId: selectedDevices.microphone };
      }
      
      if (type === 'video' && selectedDevices.camera) {
        constraints.video = { deviceId: selectedDevices.camera };
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setDevicePermissions({
        camera: type === 'video',
        microphone: true
      });
      
      return stream;
    } catch (error: any) {
      console.error('Device access error:', error);
      throw new Error(`Failed to access ${type === 'video' ? 'camera and microphone' : 'microphone'}: ${error.message}`);
    }
  };
  
  const testDevices = async () => {
    setIsTestingDevices(true);
    
    try {
      // Stop any existing preview stream
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
      
      const stream = await requestDeviceAccess(callType || 'video');
      setPreviewStream(stream);
      
      // Show preview for 5 seconds then stop
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        setPreviewStream(null);
        setIsTestingDevices(false);
      }, 5000);
      
    } catch (error: any) {
      alert(error.message);
      setIsTestingDevices(false);
    }
  };
  
  const startCallWithDevices = async () => {
    try {
      const stream = await requestDeviceAccess(callType!);
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      
      // Close device setup
      setShowDeviceSetup(false);
      
      // Proceed with call
      const callWindow = window.open(
        `/${callType}-call?chat=${selectedChat}&participants=${encodeURIComponent(selectedChatData?.name || '')}&camera=${selectedDevices.camera}&microphone=${selectedDevices.microphone}`,
        `${callType}call`,
        callType === 'video' ? 'width=1200,height=800,resizable=yes,scrollbars=no' : 'width=400,height=300,resizable=no,scrollbars=no'
      );
      
      if (!callWindow) {
        throw new Error('Popup blocked. Please allow popups for calls.');
      }
      
    } catch (error: any) {
      console.error('Call start error:', error);
      alert(`Failed to start ${callType} call: ${error.message}`);
    }
  };
  
  // Initialize devices on component mount
  React.useEffect(() => {
    enumerateDevices();
    checkPermissions();
    
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
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
                          
                          {/* AI Response Rendering */}
                          {message.aiResponse && (
                            <div className="teams-ai-response">
                              {message.aiResponse.type === 'lead_info' && (
                                <div className="teams-lead-card">
                                  <div className="teams-lead-header">
                                    <div className="teams-lead-avatar">
                                      {message.aiResponse.data.name.split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                    <div className="teams-lead-info">
                                      <h4>{message.aiResponse.data.name}</h4>
                                      <p className="teams-lead-status">{message.aiResponse.data.status} • {message.aiResponse.data.source}</p>
                                    </div>
                                    <div className="teams-lead-value">{message.aiResponse.data.value}</div>
                                  </div>
                                  
                                  <div className="teams-lead-details">
                                    <div className="teams-lead-detail">
                                      <span className="teams-detail-label">📧 Email:</span>
                                      <span className="teams-detail-value">{message.aiResponse.data.email}</span>
                                    </div>
                                    <div className="teams-lead-detail">
                                      <span className="teams-detail-label">📱 Phone:</span>
                                      <span className="teams-detail-value">{message.aiResponse.data.phone}</span>
                                    </div>
                                    <div className="teams-lead-detail">
                                      <span className="teams-detail-label">🚗 Vehicle:</span>
                                      <span className="teams-detail-value">{message.aiResponse.data.vehicle}</span>
                                    </div>
                                    <div className="teams-lead-detail">
                                      <span className="teams-detail-label">📅 Created:</span>
                                      <span className="teams-detail-value">{message.aiResponse.data.created}</span>
                                    </div>
                                  </div>
                                  
                                  {message.aiResponse.quickActions && (
                                    <div className="teams-quick-actions">
                                      {message.aiResponse.quickActions.map((action, idx) => (
                                        <button 
                                          key={idx}
                                          className="teams-quick-action-btn"
                                          onClick={() => handleQuickAction(action.action)}
                                        >
                                          {action.label}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {message.aiResponse.type === 'error' && (
                                <div className="teams-error-response">
                                  <div className="teams-error-icon">❌</div>
                                  <div className="teams-error-content">
                                    <p>{message.aiResponse.message}</p>
                                    {message.aiResponse.suggestions && (
                                      <div className="teams-suggestions">
                                        <p><strong>Try these instead:</strong></p>
                                        {message.aiResponse.suggestions.map((suggestion, idx) => (
                                          <button 
                                            key={idx}
                                            className="teams-suggestion-btn"
                                            onClick={() => setMessageText(suggestion)}
                                          >
                                            {suggestion}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {message.aiResponse.type === 'navigation' && (
                                <div className="teams-nav-response">
                                  <div className="teams-nav-icon">🧭</div>
                                  <p>{message.aiResponse.action}</p>
                                  <button 
                                    className="teams-nav-btn"
                                    onClick={() => window.location.href = message.aiResponse?.route || '/'}
                                  >
                                    Go Now
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          
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

      {/* Device Setup Modal */}
      {showDeviceSetup && (
        <div className="teams-modal-backdrop" onClick={() => setShowDeviceSetup(false)}>
          <div className="teams-device-setup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="teams-modal-header">
              <h3>Setup {callType === 'video' ? 'Video' : 'Audio'} Call</h3>
              <button 
                className="teams-modal-close" 
                onClick={() => setShowDeviceSetup(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="teams-modal-content">
              <div className="teams-device-section">
                <h4>📹 Camera</h4>
                {callType === 'video' && (
                  <>
                    <select 
                      value={selectedDevices.camera} 
                      onChange={(e) => setSelectedDevices(prev => ({ ...prev, camera: e.target.value }))}
                      className="teams-device-select"
                      disabled={availableDevices.cameras.length === 0}
                    >
                      {availableDevices.cameras.length === 0 ? (
                        <option>No cameras found</option>
                      ) : (
                        availableDevices.cameras.map(device => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${device.deviceId.substring(0, 8)}`}
                          </option>
                        ))
                      )}
                    </select>
                    <div className="teams-permission-status">
                      {devicePermissions.camera ? (
                        <span className="teams-permission-granted">✅ Camera access granted</span>
                      ) : (
                        <span className="teams-permission-denied">❌ Camera access needed</span>
                      )}
                    </div>
                  </>
                )}
                {callType === 'audio' && (
                  <p className="teams-device-note">🔇 Camera disabled for audio-only call</p>
                )}
              </div>
              
              <div className="teams-device-section">
                <h4>🎤 Microphone</h4>
                <select 
                  value={selectedDevices.microphone} 
                  onChange={(e) => setSelectedDevices(prev => ({ ...prev, microphone: e.target.value }))}
                  className="teams-device-select"
                  disabled={availableDevices.microphones.length === 0}
                >
                  {availableDevices.microphones.length === 0 ? (
                    <option>No microphones found</option>
                  ) : (
                    availableDevices.microphones.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.substring(0, 8)}`}
                      </option>
                    ))
                  )}
                </select>
                <div className="teams-permission-status">
                  {devicePermissions.microphone ? (
                    <span className="teams-permission-granted">✅ Microphone access granted</span>
                  ) : (
                    <span className="teams-permission-denied">❌ Microphone access needed</span>
                  )}
                </div>
              </div>
              
              <div className="teams-device-section">
                <h4>🔊 Speaker</h4>
                <select 
                  value={selectedDevices.speaker} 
                  onChange={(e) => setSelectedDevices(prev => ({ ...prev, speaker: e.target.value }))}
                  className="teams-device-select"
                  disabled={availableDevices.speakers.length === 0}
                >
                  {availableDevices.speakers.length === 0 ? (
                    <option>Default speaker</option>
                  ) : (
                    availableDevices.speakers.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Speaker ${device.deviceId.substring(0, 8)}`}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              {/* Device Preview */}
              {callType === 'video' && previewStream && (
                <div className="teams-device-preview">
                  <h4>📺 Camera Preview</h4>
                  <video 
                    ref={(video) => {
                      if (video && previewStream) {
                        video.srcObject = previewStream;
                      }
                    }}
                    autoPlay 
                    muted 
                    className="teams-video-preview"
                  />
                </div>
              )}
              
              {/* Test Button */}
              <div className="teams-device-test">
                <button 
                  className="teams-btn teams-btn-secondary"
                  onClick={testDevices}
                  disabled={isTestingDevices}
                >
                  {isTestingDevices ? 'Testing...' : `Test ${callType === 'video' ? 'Camera & Mic' : 'Microphone'}`}
                </button>
              </div>
              
              {/* Device Info */}
              <div className="teams-device-info">
                <p><strong>📋 Setup Instructions:</strong></p>
                <ol>
                  <li>Select your preferred camera, microphone, and speaker</li>
                  <li>Click "Test" to verify your devices work correctly</li>
                  <li>Grant permissions when prompted by your browser</li>
                  <li>Click "Start Call" to begin your {callType} call</li>
                </ol>
                
                {(!devicePermissions.camera && callType === 'video') || !devicePermissions.microphone ? (
                  <div className="teams-permission-warning">
                    ⚠️ <strong>Permission Required:</strong> Your browser will ask for camera/microphone access when you start the call.
                  </div>
                ) : null}
              </div>
            </div>
            
            <div className="teams-modal-footer">
              <button 
                className="teams-btn teams-btn-secondary" 
                onClick={() => setShowDeviceSetup(false)}
              >
                Cancel
              </button>
              <button 
                className="teams-btn teams-btn-primary"
                onClick={startCallWithDevices}
                disabled={availableDevices.microphones.length === 0 || (callType === 'video' && availableDevices.cameras.length === 0)}
              >
                Start {callType === 'video' ? 'Video' : 'Audio'} Call
              </button>
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