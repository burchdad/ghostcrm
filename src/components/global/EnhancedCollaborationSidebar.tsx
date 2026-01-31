"use client";
import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Phone,
  Video,
  FileText,
  Search,
  MoreHorizontal,
  Settings,
  Plus,
  Menu as MenuIcon,
  Users,
  Hash,
  Lock,
  Volume2,
  VolumeX,
  Star,
  Archive,
  UserPlus,
  Calendar,
  Paperclip,
  Smile,
  Send,
  MoreVertical,
  Circle,
  Bell,
  BellOff,
  Pin,
  Filter,
  Sparkles,
  Activity,
  Clock,
  CheckCircle2
} from "lucide-react";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
  type: 'direct' | 'group' | 'channel';
  participants?: number;
  isPinned?: boolean;
  isMuted?: boolean;
  lastActivity?: string;
  status?: 'active' | 'away' | 'busy' | 'offline';
}

interface CollaborationSidebarProps {
  onExpandMode?: (mode: string) => void;
}

const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Sales Team',
    lastMessage: 'Great job on the Johnson deal! 🎉',
    timestamp: '2m ago',
    unreadCount: 3,
    isOnline: false,
    type: 'group',
    participants: 5,
    isPinned: true,
    status: 'active'
  },
  {
    id: '2',
    name: 'John Smith',
    lastMessage: 'Can we schedule a call for tomorrow?',
    timestamp: '15m ago',
    unreadCount: 0,
    isOnline: true,
    type: 'direct',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    status: 'active'
  },
  {
    id: '3',
    name: '# general',
    lastMessage: 'Updated the pricing sheet',
    timestamp: '1h ago',
    unreadCount: 1,
    isOnline: false,
    type: 'channel',
    participants: 12,
    status: 'active'
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    lastMessage: 'Thanks for the follow-up!',
    timestamp: '2h ago',
    unreadCount: 0,
    isOnline: false,
    type: 'direct',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b814?w=32&h=32&fit=crop&crop=face',
    status: 'away'
  },
  {
    id: '5',
    name: 'Marketing Team',
    lastMessage: 'New campaign is live',
    timestamp: '3h ago',
    unreadCount: 0,
    isOnline: false,
    type: 'group',
    participants: 8,
    isMuted: true,
    status: 'active'
  },
  {
    id: '6',
    name: 'Mike Wilson',
    lastMessage: 'Let me know when you are free',
    timestamp: '1d ago',
    unreadCount: 0,
    isOnline: false,
    type: 'direct',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    status: 'busy'
  }
];

export default function EnhancedCollaborationSidebar({ onExpandMode }: CollaborationSidebarProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "calls" | "activity">("chat");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    unread: false,
    pinned: false,
    groups: false,
    direct: false
  });

  // Filter chats based on search and filters
  const filteredChats = mockChats.filter(chat => {
    // Search filter
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Active filters
    if (activeFilters.unread && chat.unreadCount === 0) return false;
    if (activeFilters.pinned && !chat.isPinned) return false;
    if (activeFilters.groups && chat.type !== 'group') return false;
    if (activeFilters.direct && chat.type !== 'direct') return false;
    
    return matchesSearch;
  });

  // Sort chats: pinned first, then by timestamp
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Circle className="w-2 h-2 fill-green-400 text-green-400" />;
      case 'away': return <Circle className="w-2 h-2 fill-yellow-400 text-yellow-400" />;
      case 'busy': return <Circle className="w-2 h-2 fill-red-400 text-red-400" />;
      default: return <Circle className="w-2 h-2 fill-gray-300 text-gray-300" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'group': return <Users className="w-3 h-3 text-blue-500" />;
      case 'channel': return <Hash className="w-3 h-3 text-purple-500" />;
      case 'direct': return <MessageSquare className="w-3 h-3 text-green-500" />;
      default: return <MessageSquare className="w-3 h-3" />;
    }
  };

  const totalUnreadCount = mockChats.reduce((sum, chat) => sum + chat.unreadCount, 0);
  const pinnedCount = mockChats.filter(chat => chat.isPinned).length;
  const activeCount = mockChats.filter(chat => chat.isOnline).length;

  return (
    <div className="enhanced-collaboration-sidebar flex flex-col h-full bg-white border-r border-gray-200 w-80">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Collaboration</h2>
              <p className="text-xs text-gray-500">{activeCount} online</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-md transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            >
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Bell className="w-3 h-3" />
            <span>{totalUnreadCount} unread</span>
          </div>
          <div className="flex items-center gap-1">
            <Pin className="w-3 h-3" />
            <span>{pinnedCount} pinned</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-3 space-y-2 border-b border-gray-100">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-1">
            {Object.entries(activeFilters).map(([key, active]) => (
              <button
                key={key}
                onClick={() => setActiveFilters(prev => ({ ...prev, [key]: !active }))}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  active 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {[
          { id: 'chat', label: 'Chats', icon: MessageSquare, count: totalUnreadCount },
          { id: 'calls', label: 'Calls', icon: Phone, count: 0 },
          { id: 'activity', label: 'Activity', icon: Activity, count: 3 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {sortedChats.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No chats found</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {sortedChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat.id)}
                      className={`relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all group ${
                        selectedChat === chat.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {chat.avatar ? (
                          <img
                            src={chat.avatar}
                            alt={chat.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {chat.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        
                        {/* Status indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
                          {getStatusIcon(chat.status || 'offline')}
                        </div>
                        
                        {/* Type badge */}
                        <div className="absolute -top-1 -right-1">
                          {getTypeIcon(chat.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 truncate text-sm">
                              {chat.name}
                            </h4>
                            {chat.isPinned && <Pin className="w-3 h-3 text-gray-400" />}
                            {chat.isMuted && <VolumeX className="w-3 h-3 text-gray-400" />}
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {chat.timestamp}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {chat.lastMessage}
                          </p>
                          
                          <div className="flex items-center gap-1">
                            {chat.participants && chat.participants > 1 && (
                              <span className="text-xs text-gray-400">
                                {chat.participants}
                              </span>
                            )}
                            {chat.unreadCount > 0 && (
                              <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium min-w-[18px] text-center">
                                {chat.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions (on hover) */}
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                          <Phone className="w-3 h-3" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                          <Video className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'calls' && (
          <div className="p-6 text-center text-gray-500">
            <Phone className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No recent calls</p>
            <button className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
              Start a Call
            </button>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-3 space-y-3">
            <div className="space-y-2">
              {[
                { icon: CheckCircle2, text: "John marked deal #1234 as won", time: "2m ago", color: "text-green-600" },
                { icon: FileText, text: "Sarah shared pricing document", time: "5m ago", color: "text-blue-600" },
                { icon: Calendar, text: "Team meeting scheduled", time: "10m ago", color: "text-purple-600" }
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className={`p-1.5 rounded-md bg-gray-100 ${activity.color}`}>
                    <activity.icon className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.text}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">U</span>
            </div>
            <span className="text-sm font-medium text-gray-700">You</span>
            <Circle className="w-2 h-2 fill-green-400 text-green-400" />
          </div>
          
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-md">
              <Settings className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onExpandMode?.('video')}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-md"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {menuOpen && (
        <div
          className="absolute right-3 top-16 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite Team Members
          </button>
          <button 
            onClick={() => onExpandMode?.('documents')}
            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Shared Documents
          </button>
          <button 
            onClick={() => onExpandMode?.('whiteboard')}
            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Collaborative Whiteboard
          </button>
          <hr className="my-1" />
          <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Archive All
          </button>
          <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      )}
    </div>
  );
}