"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
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
  CheckCircle2,
  X
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

// ===============================================
// COLLABORATION MODAL TYPES (Same as sidebar)
// ===============================================

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

interface ActivityItem {
  id: string;
  type: 'call' | 'message' | 'file' | 'mention' | 'join' | 'leave';
  user: string;
  userAvatar?: string;
  action: string;
  target?: string;
  timestamp: string;
  channel?: string;
}

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpandMode?: (mode: "video" | "whiteboard" | "documents" | null) => void;
}

// ===============================================
// COLLABORATION MODAL COMPONENT
// ===============================================

export default function CollaborationModal({ isOpen, onClose, onExpandMode }: CollaborationModalProps) {
  // Helper function for presence indicator
  const presenceDot = (online?: boolean) =>
    online ? "bg-green-500" : "bg-gray-400";

  // Core state management (same as sidebar)
  const [activeTab, setActiveTab] = useState<"chat" | "calls" | "activity">("chat");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Enhanced features state (same as sidebar)
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    unread: false,
    pinned: false,
    online: false,
    channels: true,
    direct: true,
    groups: true
  });
  const [incomingCall, setIncomingCall] = useState<any>(null);

  // Enhanced data with API integration (same as sidebar)
  const [chats, setChats] = useState<Chat[]>([]);
  const [recentCalls, setRecentCalls] = useState<Array<{
    name: string;
    type: "video" | "audio";
    duration: string;
    time: string;
    status: "completed" | "missed";
    avatar?: string;
  }>>([]);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { user, isLoading: authLoading } = useSafeAuth();
  
  // Teams-like presence tracking (same as sidebar)
  const [userPresence, setUserPresence] = useState<'online' | 'away' | 'busy' | 'offline'>('online');
  const [isPresenting, setIsPresenting] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const awayThresholdMs = 5 * 60 * 1000; // 5 minutes for away status

  // Track user activity for presence (same as sidebar)
  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (userPresence === 'away') {
      setUserPresence('online');
    }
  }, [userPresence]);

  // Monitor user activity (same as sidebar)
  useEffect(() => {
    if (!user) return;
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.addEventListener(event, updateLastActivity, true);
    });
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateLastActivity, true);
      });
    };
  }, [user, updateLastActivity]);

  // Mock data (same as sidebar)
  useEffect(() => {
    if (authLoading || !user) {
      setIsLoadingData(false);
      return;
    }

    // Simulate loading delay
    const timer = setTimeout(() => {
      // Mock chats data
      setChats([
        {
          id: "1",
          name: "Sales Team",
          lastMessage: "Great work on the quarterly targets!",
          timestamp: "2:34 PM",
          unreadCount: 3,
          isOnline: true,
          type: "channel",
          participants: 8,
          isPinned: true,
          status: 'active'
        },
        {
          id: "2", 
          name: "Sarah Chen",
          lastMessage: "The client meeting is confirmed for tomorrow",
          timestamp: "1:45 PM",
          unreadCount: 0,
          isOnline: true,
          type: "direct",
          status: 'active'
        },
        {
          id: "3",
          name: "Marketing Updates",
          lastMessage: "New campaign performance data available",
          timestamp: "12:20 PM", 
          unreadCount: 1,
          isOnline: false,
          type: "channel",
          participants: 12,
          status: 'active'
        },
        {
          id: "4",
          name: "John Smith",
          lastMessage: "Thanks for the quick turnaround!",
          timestamp: "11:30 AM",
          unreadCount: 0,
          isOnline: false,
          type: "direct",
          status: 'away'
        }
      ]);

      // Mock recent calls
      setRecentCalls([
        {
          name: "Sarah Chen",
          type: "video",
          duration: "45:32",
          time: "2 hours ago",
          status: "completed",
          avatar: "SC"
        },
        {
          name: "Sales Team",
          type: "audio", 
          duration: "23:15",
          time: "4 hours ago",
          status: "completed"
        },
        {
          name: "Mike Johnson",
          type: "video",
          duration: "Not answered",
          time: "Yesterday",
          status: "missed"
        }
      ]);

      // Mock activity items
      setActivityItems([
        {
          id: "1",
          type: "message",
          user: "Sarah Chen",
          userAvatar: "SC",
          action: "mentioned you in",
          target: "Sales Team",
          timestamp: "5 minutes ago",
          channel: "sales-team"
        },
        {
          id: "2", 
          type: "join",
          user: "Mike Johnson",
          userAvatar: "MJ",
          action: "joined",
          target: "Marketing Updates",
          timestamp: "1 hour ago",
          channel: "marketing"
        },
        {
          id: "3",
          type: "call",
          user: "Alex Kim",
          userAvatar: "AK", 
          action: "started a video call in",
          target: "Development Team",
          timestamp: "2 hours ago"
        },
        {
          id: "4",
          type: "file",
          user: "Emily Davis",
          userAvatar: "ED",
          action: "shared a document in",
          target: "Project Alpha",
          timestamp: "3 hours ago"
        }
      ]);

      setIsLoadingData(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [user, authLoading]);

  // Filter chats based on search and filters (same as sidebar)
  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilters = 
      (!activeFilters.unread || chat.unreadCount > 0) &&
      (!activeFilters.pinned || chat.isPinned) &&
      (!activeFilters.online || chat.isOnline) &&
      (
        (activeFilters.channels && chat.type === 'channel') ||
        (activeFilters.direct && chat.type === 'direct') ||
        (activeFilters.groups && chat.type === 'group')
      );

    return matchesSearch && matchesFilters;
  });

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Chat Tab Content (same as sidebar)
  const ChatTabContent = () => (
    <div className="flex flex-col h-full">
      {/* Search and filters */}
      <div className="p-3 border-b border-gray-200 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg text-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors duration-200 ${
              showFilters ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(activeFilters).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setActiveFilters(prev => ({ ...prev, [key]: !value }))}
                className={`p-2.5 rounded-lg text-left capitalize font-medium transition-all duration-200 ${
                  value 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {key === 'unread' ? '🔴' : key === 'pinned' ? '📌' : key === 'online' ? '🟢' : 
                 key === 'channels' ? '#' : key === 'direct' ? '👤' : '👥'} {key}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoadingData ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm font-medium">No chats found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedChat === chat.id
                    ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 
                               flex items-center justify-center font-medium text-blue-700">
                    {chat.type === 'channel' ? <Hash className="w-5 h-5" /> : 
                     chat.avatar || chat.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${presenceDot(chat.isOnline)}`}></div>
                  {chat.isPinned && (
                    <Pin className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500 fill-current" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 truncate flex items-center gap-1">
                      {chat.name}
                      {chat.type === 'group' && <Users className="w-3 h-3 text-gray-400" />}
                      {chat.isMuted && <VolumeX className="w-3 h-3 text-gray-400" />}
                    </h4>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">{chat.timestamp}</span>
                      {chat.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    {chat.participants && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {chat.participants}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 p-3 space-y-2">
        <button
          onClick={() => onExpandMode?.("video")}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Video className="w-4 h-4" />
          Start Video Call
        </button>
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <Phone className="w-4 h-4" />
          Start Audio Call
        </button>
      </div>
    </div>
  );

  // Calls Tab Content (same as sidebar)
  const CallsTabContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Recent Calls</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          View all
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isLoadingData ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentCalls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📞</div>
            <p className="text-sm">No recent calls</p>
            <p className="text-xs mt-1">Your call history will appear here</p>
          </div>
        ) : (
          recentCalls.map((call, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                {call.avatar || call.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 text-sm">{call.name}</p>
                  <span className="text-xs text-gray-500">{call.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {call.type === "video" ? <Video className="w-3 h-3 text-gray-400" /> : <Phone className="w-3 h-3 text-gray-400" />}
                    <span className={`text-xs ${call.status === 'missed' ? 'text-red-600' : 'text-gray-600'}`}>
                      {call.duration}
                    </span>
                  </div>
                  <button className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                    <Phone className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Activity Tab Content (same as sidebar)
  const ActivityTabContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Recent Activity</h3>
        <button className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100">
          <Filter className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isLoadingData ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-2 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activityItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">⚡</div>
            <p className="text-sm">No recent activity</p>
            <p className="text-xs mt-1">Team activity will appear here</p>
          </div>
        ) : (
          activityItems.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                {item.userAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900">
                  <span className="font-medium">{item.user}</span>
                  <span className="text-gray-600"> {item.action} </span>
                  {item.target && (
                    <span className="font-medium text-blue-600">{item.target}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-96 h-[600px] 
                     bg-gradient-to-b from-slate-50 to-white rounded-lg shadow-2xl 
                     border border-gray-200 flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 
                       rounded-t-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 
                           flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-semibold text-gray-900">Collaboration</h2>
            </div>

            <div className="flex items-center gap-1">
              {/* Menu Button */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 rounded text-gray-600 hover:bg-gray-100"
                  title="More"
                >
                  <MenuIcon className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 
                             rounded-lg shadow-lg z-50"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onExpandMode?.("documents");
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      📄 Files
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onExpandMode?.("whiteboard");
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      🧑‍🏫 Whiteboard
                    </button>
                  </div>
                )}
              </div>

              {/* Settings Button */}
              <button className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="Settings">
                <Settings className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-gray-50 p-2 flex-shrink-0">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {[
              { id: "chat", label: "Chat", icon: MessageSquare },
              { id: "calls", label: "Calls", icon: Phone },
              { id: "activity", label: "Activity", icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium 
                         transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" && <ChatTabContent />}
          {activeTab === "calls" && <CallsTabContent />}
          {activeTab === "activity" && <ActivityTabContent />}
        </div>

        {/* Incoming Call Overlay */}
        {incomingCall && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-blue-600 
                         text-white flex flex-col items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 
                           flex items-center justify-center mb-4">
                <Video className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Incoming Call</h3>
              <p className="text-lg mb-6">{incomingCall.name}</p>
              <div className="flex justify-center gap-8 mt-3 text-sm">
                <button
                  onClick={() => setIncomingCall(null)}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg"
                >
                  Decline
                </button>
                <button
                  onClick={() => {
                    setIncomingCall(null);
                    onExpandMode?.("video");
                  }}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}