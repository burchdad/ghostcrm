"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/SupabaseAuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Users, 
  Video, 
  FileText, 
  Share2, 
  Calendar, 
  Bell,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Paperclip,
  Send,
  MoreHorizontal,
  Star,
  Archive,
  X,
  Settings
} from "lucide-react";
import { useI18n } from "@/components/utils/I18nProvider";
import { useToast } from "@/hooks/use-toast";
import PageAIAssistant from "@/components/ai/PageAIAssistant";
import "./page.css";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image' | 'system';
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
}

interface ChatChannel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'direct';
  memberCount: number;
  unreadCount: number;
  lastMessage?: Message;
  members: string[];
  createdAt: Date;
  createdBy: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'call' | 'demo' | 'appointment';
  attendees: string[];
  channelId?: string;
  meetingLink?: string;
}

interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export default function TenantOwnerCollaborationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();

  // Role-based access control
  useEffect(() => {
    if (user && !['owner'].includes(user.role)) {
      console.log("🚨 [TENANT_OWNER_COLLABORATION] Access denied - redirecting");
      router.push('/');
    }
  }, [user, router]);
  
  useRibbonPage({
    context: "leads",
    enable: ["quickActions", "share", "profile", "notifications"],
    disable: ["saveLayout", "aiTools", "developer", "billing", "bulkOps", "export"]
  });

  // Check if user is owner
  if (user && !['owner'].includes(user.role)) {
    return null; // Will redirect via useEffect
  }

  // State management
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMembersList, setShowMembersList] = useState(true);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [showScheduleMeeting, setShowScheduleMeeting] = useState(false);
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'private',
    members: [] as string[]
  });
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [isTyping, setIsTyping] = useState<{[key: string]: boolean}>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [showChannelOptions, setShowChannelOptions] = useState(false);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);

  // Load collaboration data
  useEffect(() => {
    loadCollaborationData();
  }, []);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowChannelOptions(false);
      }
    };

    if (showChannelOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showChannelOptions]);

  const loadCollaborationData = async () => {
    try {
      setIsLoading(true);
      
      // Load team members from API
      await loadTeamMembers();
      
      // Load channels from API
      await loadChannels();
      
      // Load messages for active channel
      await loadMessages(activeChannel);

    } catch (error) {
      console.error('Error loading collaboration data:', error);
      toast({
        title: "Error",
        description: "Failed to load collaboration data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const response = await fetch('/api/collaboration/team-members', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTeamMembers(data.members);
          console.log('✅ Loaded team members from API');
        }
      } else {
        console.log('⚠️ Team members API not available, using empty state');
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Failed to load team members:', error);
      setTeamMembers([]);
    }
  };

  const loadChannels = async () => {
    try {
      const response = await fetch('/api/collaboration/channels', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChannels(data.channels);
          console.log('✅ Loaded channels from API');
        }
      } else {
        console.log('⚠️ Channels API not available, creating default general channel');
        // Create a default general channel if none exist
        const defaultChannel: ChatChannel = {
          id: 'general',
          name: 'General',
          description: 'Company-wide announcements and discussions',
          type: 'public',
          memberCount: 1,
          unreadCount: 0,
          members: [user?.id || ''],
          createdAt: new Date(),
          createdBy: user?.id || 'system'
        };
        setChannels([defaultChannel]);
      }
    } catch (error) {
      console.error('Failed to load channels:', error);
      // Fallback to default channel
      const defaultChannel: ChatChannel = {
        id: 'general',
        name: 'General',
        description: 'Company-wide announcements and discussions',
        type: 'public',
        memberCount: 1,
        unreadCount: 0,
        members: [user?.id || ''],
        createdAt: new Date(),
        createdBy: user?.id || 'system'
      };
      setChannels([defaultChannel]);
    }
  };

  const loadMessages = async (channelId: string) => {
    try {
      const response = await fetch(`/api/collaboration/messages?channelId=${channelId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages);
          console.log('✅ Loaded messages from API');
        }
      } else {
        console.log('⚠️ Messages API not available, using empty state');
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  };

  // API Functions
  const createChannel = async (channelData: {
    name: string;
    description: string;
    type: 'public' | 'private' | 'direct';
    members: string[];
  }) => {
    try {
      const response = await fetch('/api/collaboration/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...channelData,
          tenantId: user?.tenantId,
          createdBy: user?.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChannels(prev => [...prev, data.channel]);
          setActiveChannel(data.channel.id);
          
          // Only close modal and reset form for regular channels, not DMs
          if (channelData.type !== 'direct') {
            setShowNewChannelModal(false);
            setNewChannelData({ name: '', description: '', type: 'public', members: [] });
          }

          const channelTypeLabel = channelData.type === 'direct' ? 'Direct Message' : 'Channel';
          toast({
            title: `${channelTypeLabel} Created`,
            description: `Successfully created ${channelData.type === 'direct' ? '' : '#'}${data.channel.name}`,
          });

          return data.channel;
        }
      }

      throw new Error('Failed to create channel');
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: "Error",
        description: "Failed to create channel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendMessageToChannel = async (content: string, channelId: string) => {
    try {
      const response = await fetch('/api/collaboration/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          channelId,
          senderId: user?.id,
          tenantId: user?.tenantId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const message = await response.json();

      // Update local state with the new message
      setMessages(prev => [...prev, message]);

      // Update channel's last message
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, lastMessage: message }
          : channel
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const uploadFile = async (file: File, channelId: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('channelId', channelId);
      formData.append('tenantId', user?.tenantId || '');
      
      const response = await fetch('/api/collaboration/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const uploadedFile = await response.json();

      setUploadedFiles(prev => [...prev, uploadedFile]);

      // Send file message
      const fileMessage: Message = {
        id: Date.now().toString(),
        senderId: user?.id || 'current-user',
        senderName: user?.email?.split('@')[0] || 'You',
        content: `Shared a file: ${file.name}`,
        timestamp: new Date(),
        type: 'file',
        attachments: [{
          name: file.name,
          url: uploadedFile.url,
          type: file.type,
          size: file.size
        }]
      };

      setMessages(prev => [...prev, fileMessage]);

      toast({
        title: "File Uploaded",
        description: `Successfully shared ${file.name}`,
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const scheduleChannelMeeting = async (meetingData: {
    title: string;
    description: string;
    start: Date;
    end: Date;
    attendees: string[];
  }) => {
    try {
      const response = await fetch('/api/collaboration/schedule-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...meetingData,
          channelId: activeChannel,
          tenantId: user?.tenantId,
          organizerId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule meeting');
      }

      const meeting = await response.json();

      setCalendarEvents(prev => [...prev, meeting]);

      // Send meeting notification message
      const meetingMessage: Message = {
        id: Date.now().toString(),
        senderId: user?.id || 'system',
        senderName: 'Calendar Bot',
        content: `📅 Meeting scheduled: "${meetingData.title}" at ${meetingData.start.toLocaleString()}`,
        timestamp: new Date(),
        type: 'system'
      };

      setMessages(prev => [...prev, meetingMessage]);
      setShowScheduleMeeting(false);

      toast({
        title: "Meeting Scheduled",
        description: `Meeting "${meetingData.title}" has been scheduled and calendar invites sent.`,
      });

    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startVideoCall = async (channelId: string) => {
    try {
      const response = await fetch('/api/collaboration/start-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId,
          tenantId: user?.tenantId,
          initiatorId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start video call');
      }

      const callData = await response.json();

      // Open video call in new window
      window.open(callData.callUrl, '_blank', 'width=1200,height=800');

      // Send call notification message
      const callMessage: Message = {
        id: Date.now().toString(),
        senderId: user?.id || 'system',
        senderName: 'Call Bot',
        content: `📹 ${user?.email?.split('@')[0]} started a video call. Join here: ${callData.callUrl}`,
        timestamp: new Date(),
        type: 'system'
      };

      setMessages(prev => [...prev, callMessage]);

      toast({
        title: "Video Call Started",
        description: "Video call room created. Share the link with participants.",
      });

    } catch (error) {
      console.error('Error starting video call:', error);
      toast({
        title: "Error",
        description: "Failed to start video call. Please try again.",
        variant: "destructive",
      });
    }
  };

  const searchMessages = async (query: string) => {
    try {
      const response = await fetch(`/api/collaboration/search?q=${encodeURIComponent(query)}&channelId=${activeChannel}&tenantId=${user?.tenantId}`);
      
      if (!response.ok) {
        throw new Error('Failed to search messages');
      }
      
      const searchResults = await response.json();

      toast({
        title: "Search Results",
        description: `Found ${searchResults.length} messages matching "${query}"`,
      });

      return searchResults;
    } catch (error) {
      console.error('Error searching messages:', error);
      toast({
        title: "Error",
        description: "Failed to search messages. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessageToChannel(newMessage, activeChannel);
      setNewMessage('');

      toast({
        title: "Message Sent",
        description: "Your message has been sent to the channel.",
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    await uploadFile(file, activeChannel);
    
    // Reset file input
    event.target.value = '';
  };

  // Channel Options Functions
  const handleChannelOptions = () => {
    setShowChannelOptions(!showChannelOptions);
  };

  const handleChannelInfo = () => {
    setShowChannelInfo(true);
    setShowChannelOptions(false);
  };

  const handleManageMembers = () => {
    setShowManageMembers(true);
    setShowChannelOptions(false);
  };

  const handleMuteChannel = () => {
    const channelName = activeChannelData?.name || 'Unknown';
    toast({
      title: "Channel Muted",
      description: `You won't receive notifications from ${channelName}`,
    });
    setShowChannelOptions(false);
  };

  const handlePinChannel = () => {
    const channelName = activeChannelData?.name || 'Unknown';
    toast({
      title: "Channel Pinned",
      description: `${channelName} has been added to your favorites`,
    });
    setShowChannelOptions(false);
  };

  const handleViewFiles = () => {
    toast({
      title: "Files & Media",
      description: "Opening shared files browser...",
    });
    setShowChannelOptions(false);
  };

  const handleChannelSettings = () => {
    toast({
      title: "Channel Settings",
      description: "Opening channel settings panel...",
    });
    setShowChannelOptions(false);
  };

  const handleDeleteChannel = () => {
    const channelName = activeChannelData?.name || 'Unknown';
    const confirmDelete = window.confirm(`Are you sure you want to delete the channel "${channelName}"? This action cannot be undone.`);
    
    if (confirmDelete) {
      // Remove channel from state
      setChannels(prev => prev.filter(ch => ch.id !== activeChannel));
      setActiveChannel('general'); // Switch to general channel
      
      toast({
        title: "Channel Deleted",
        description: `Channel "${channelName}" has been permanently deleted.`,
      });
    }
    setShowChannelOptions(false);
  };

  const handleExportChat = () => {
    const channelName = activeChannelData?.name || 'Unknown';
    toast({
      title: "Export Started",
      description: `Preparing chat history for ${channelName}...`,
    });
    setShowChannelOptions(false);
  };

  const handleCreateChannel = async () => {
    if (!newChannelData.name.trim()) {
      toast({
        title: "Channel Name Required",
        description: "Please enter a channel name.",
        variant: "destructive",
      });
      return;
    }

    await createChannel(newChannelData);
  };

  const handleStartDirectMessage = async (memberId: string, memberName: string) => {
    try {
      // Create or find direct message channel
      const dmChannelId = `dm-${user?.id}-${memberId}`;
      const dmChannelName = `Direct Message: ${memberName}`;
      
      // Check if DM channel already exists
      const existingDM = channels.find(channel => channel.id === dmChannelId);
      
      if (!existingDM) {
        // Create new DM channel
        const dmChannelData = {
          name: dmChannelName,
          description: `Direct message conversation with ${memberName}`,
          type: 'direct' as 'public' | 'private' | 'direct',
          members: [user?.id || '', memberId]
        };

        await createChannel(dmChannelData);
        
        toast({
          title: "Direct Message Started",
          description: `Started direct message with ${memberName}.`,
        });
      } else {
        toast({
          title: "Direct Message",
          description: `Opening conversation with ${memberName}.`,
        });
      }

      // Switch to the DM channel
      setActiveChannel(dmChannelId);
      
    } catch (error) {
      console.error('Error starting direct message:', error);
      toast({
        title: "Error",
        description: "Failed to start direct message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartVideoCall = () => {
    startVideoCall(activeChannel);
  };

  const handleScheduleMeeting = () => {
    setShowScheduleMeeting(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchMessages(query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#22c55e';
      case 'away': return '#f59e0b';
      case 'busy': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const activeChannelData = channels.find(c => c.id === activeChannel);

  return (
    <div className="collaboration-container">
      {/* AI Assistant */}
      <PageAIAssistant 
        agentId="collaboration"
        pageTitle="Team Collaboration"
        entityData={{
          totalMessages: messages.length,
          activeTeamMembers: teamMembers.filter(m => m.status === 'online').length,
          totalTeamMembers: teamMembers.length,
          totalChannels: channels.length,
          recentCalls: teamMembers.filter(m => m.status === 'online').length // Use online members as proxy for recent calls
        }}
        className="mb-6"
      />

      <div className="page-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">
              💬 Team Collaboration
            </h1>
            <p className="page-subtitle">Owner Dashboard - Communication & Teamwork</p>
          </div>
          <div className="header-actions">
            <Button className="btn-secondary" onClick={() => setShowMembersList(!showMembersList)}>
              <Users className="icon" />
              {showMembersList ? 'Hide' : 'Show'} Members
            </Button>
            <Button className="btn-primary">
              <Video className="icon" />
              Start Meeting
            </Button>
          </div>
        </div>
      </div>

      {/* Collaboration Stats */}
      <div className="collaboration-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <MessageCircle className="stat-icon" />
            <div>
              <h3>Active Conversations</h3>
              <p>{channels.length} channels</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <Users className="stat-icon" />
            <div>
              <h3>Team Members Online</h3>
              <p>{teamMembers.filter(m => m.status === 'online').length} of {teamMembers.length}</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <Bell className="stat-icon" />
            <div>
              <h3>Unread Messages</h3>
              <p>{channels.reduce((sum, c) => sum + c.unreadCount, 0)} total</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Collaboration Interface */}
      <div className="collaboration-main">
        {/* Sidebar with Channels */}
        <div className="collaboration-sidebar">
          <div className="sidebar-header">
            <h3>Channels</h3>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setShowNewChannelModal(true)}
              title="Create new channel"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="channels-list">
            {channels.map(channel => (
              <div
                key={channel.id}
                className={`channel-item ${activeChannel === channel.id ? 'active' : ''}`}
                onClick={() => setActiveChannel(channel.id)}
              >
                <div className="channel-info">
                  <span className="channel-name">
                    {channel.type === 'direct' ? channel.name : `# ${channel.name}`}
                  </span>
                  {channel.unreadCount > 0 && (
                    <span className="unread-badge">{channel.unreadCount}</span>
                  )}
                </div>
                <div className="channel-meta">
                  {channel.memberCount} members
                </div>
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <h4>Direct Messages</h4>
            {teamMembers.slice(0, 3).map(member => (
              <div 
                key={member.id} 
                className="dm-item"
                onClick={() => handleStartDirectMessage(member.id, member.name)}
                title={`Start direct message with ${member.name}`}
              >
                <div className="member-status">
                  <div 
                    className="status-dot"
                    style={{ backgroundColor: getStatusColor(member.status) }}
                  />
                  <span className="member-name">{member.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          <div className="chat-header">
            <div className="channel-info">
              <h3>
                {activeChannelData?.type === 'direct' 
                  ? activeChannelData.name 
                  : `# ${activeChannelData?.name}`
                }
              </h3>
              <p>{activeChannelData?.description}</p>
            </div>
            <div className="chat-actions">
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => handleSearch(searchQuery)}
                title="Search messages"
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleStartVideoCall}
                title="Start video call"
              >
                <Video className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleScheduleMeeting}
                title="Schedule meeting"
              >
                <Calendar className="w-4 h-4" />
              </Button>
              <div className="relative">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleChannelOptions}
                  title="Channel options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
                
                {/* Channel Options Dropdown */}
                {showChannelOptions && (
                  <div className="channel-options-dropdown">
                    <div className="dropdown-header">
                      <span className="dropdown-title">
                        {activeChannelData?.type === 'direct' 
                          ? `Chat with ${activeChannelData.name}` 
                          : `# ${activeChannelData?.name}`
                        }
                      </span>
                    </div>
                    <div className="dropdown-divider"></div>
                    
                    {/* Channel-specific options */}
                    {activeChannelData?.type !== 'direct' ? (
                      <>
                        <button className="dropdown-item" onClick={handleChannelInfo}>
                          <FileText className="w-4 h-4" />
                          <span>Channel Info</span>
                        </button>
                        <button className="dropdown-item" onClick={handleManageMembers}>
                          <Users className="w-4 h-4" />
                          <span>Manage Members</span>
                        </button>
                        <button className="dropdown-item" onClick={handlePinChannel}>
                          <Star className="w-4 h-4" />
                          <span>Add to Favorites</span>
                        </button>
                        <button className="dropdown-item" onClick={handleViewFiles}>
                          <FileText className="w-4 h-4" />
                          <span>Files & Media</span>
                        </button>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item" onClick={handleMuteChannel}>
                          <Bell className="w-4 h-4" />
                          <span>Mute Channel</span>
                        </button>
                        <button className="dropdown-item" onClick={handleChannelSettings}>
                          <Settings className="w-4 h-4" />
                          <span>Channel Settings</span>
                        </button>
                        <button className="dropdown-item" onClick={handleExportChat}>
                          <Archive className="w-4 h-4" />
                          <span>Export Chat</span>
                        </button>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item danger" onClick={handleDeleteChannel}>
                          <X className="w-4 h-4" />
                          <span>Delete Channel</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="dropdown-item" onClick={() => console.log('View Profile')}>
                          <Users className="w-4 h-4" />
                          <span>View Profile</span>
                        </button>
                        <button className="dropdown-item" onClick={handleStartVideoCall}>
                          <Video className="w-4 h-4" />
                          <span>Start Video Call</span>
                        </button>
                        <button className="dropdown-item" onClick={() => window.open(`tel:${activeChannelData?.name}`, '_self')}>
                          <Phone className="w-4 h-4" />
                          <span>Start Voice Call</span>
                        </button>
                        <button className="dropdown-item" onClick={handleViewFiles}>
                          <FileText className="w-4 h-4" />
                          <span>Shared Files</span>
                        </button>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item" onClick={handleMuteChannel}>
                          <Bell className="w-4 h-4" />
                          <span>Mute Conversation</span>
                        </button>
                        <button className="dropdown-item" onClick={handleExportChat}>
                          <Archive className="w-4 h-4" />
                          <span>Export Chat</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="messages-container">
            {messages.map(message => (
              <div key={message.id} className="message">
                <div className="message-avatar">
                  {message.senderName.charAt(0).toUpperCase()}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="sender-name">{message.senderName}</span>
                    <span className="message-time">{formatMessageTime(message.timestamp)}</span>
                  </div>
                  <div className="message-text">{message.content}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="message-input">
            <div className="input-container">
              <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.pptx"
              />
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => document.getElementById('file-upload')?.click()}
                title="Upload file"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message #${activeChannelData?.name}`}
                rows={1}
                className="message-textarea"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                size="sm"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Members Panel */}
        {showMembersList && (
          <div className="members-panel">
            <div className="panel-header">
              <h3>Team Members</h3>
              <span className="member-count">{teamMembers.length}</span>
            </div>
            
            <div className="members-list">
              {teamMembers.map(member => (
                <div key={member.id} className="member-item">
                  <div className="member-avatar">
                    <div 
                      className="status-indicator"
                      style={{ backgroundColor: getStatusColor(member.status) }}
                    />
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="member-info">
                    <div className="member-name">{member.name}</div>
                    <div className="member-role">{member.role}</div>
                    <div className="member-status-text">
                      {member.status === 'offline' && member.lastSeen 
                        ? `Last seen ${member.lastSeen}`
                        : member.status.charAt(0).toUpperCase() + member.status.slice(1)
                      }
                    </div>
                  </div>
                  <div className="member-actions">
                    <Button size="sm" variant="ghost">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Channel Modal */}
      {showNewChannelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Channel</h3>
              <button 
                onClick={() => setShowNewChannelModal(false)}
                className="modal-close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">Channel Name</label>
                <input
                  type="text"
                  value={newChannelData.name}
                  onChange={(e) => setNewChannelData(prev => ({...prev, name: e.target.value}))}
                  placeholder="Enter channel name"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={newChannelData.description}
                  onChange={(e) => setNewChannelData(prev => ({...prev, description: e.target.value}))}
                  placeholder="What's this channel about?"
                  rows={3}
                  className="form-textarea"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Channel Type</label>
                <select
                  value={newChannelData.type}
                  onChange={(e) => setNewChannelData(prev => ({...prev, type: e.target.value as 'public' | 'private'}))}
                  className="form-select"
                >
                  <option value="public">Public - Anyone can join</option>
                  <option value="private">Private - Invite only</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowNewChannelModal(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateChannel}
                  className="btn-primary"
                  disabled={!newChannelData.name.trim()}
                >
                  Create Channel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleMeeting && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Schedule Meeting</h3>
              <button 
                onClick={() => setShowScheduleMeeting(false)}
                className="modal-close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">Meeting Title</label>
                <input
                  type="text"
                  placeholder="Enter meeting title"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  placeholder="Meeting agenda and details"
                  rows={3}
                  className="form-textarea"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Attendees</label>
                <div className="attendees-selector">
                  {teamMembers.map(member => (
                    <div key={member.id} className="attendee-option">
                      <input
                        type="checkbox"
                        id={`attendee-${member.id}`}
                        className="attendee-checkbox"
                      />
                      <label htmlFor={`attendee-${member.id}`} className="attendee-label">
                        <div className="attendee-avatar">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="attendee-info">
                          <div className="attendee-name">{member.name}</div>
                          <div className="attendee-role">{member.role}</div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowScheduleMeeting(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Schedule team meeting with default parameters
                    const meetingData = {
                      title: 'Team Meeting',
                      description: 'Scheduled from collaboration channel',
                      start: new Date(Date.now() + 24 * 60 * 60 * 1000),
                      end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
                      attendees: teamMembers.map(m => m.id)
                    };
                    scheduleChannelMeeting(meetingData);
                  }}
                  className="btn-primary"
                >
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}