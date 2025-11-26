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

// ===============================================
// UNIFIED COLLABORATION SIDEBAR TYPES
// ===============================================

interface Chat {
  id: string;
  name: string;
  type: "direct" | "channel" | "group";
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  unreadCount?: number;
  isOnline?: boolean;
  isTyping?: boolean;
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

interface CollaborationSidebarProps {
  onExpandMode?: (mode: "video" | "whiteboard" | "documents" | null) => void;
}

// ===============================================
// UNIFIED COLLABORATION SIDEBAR COMPONENT
// ===============================================

export default function CollaborationSidebar({ onExpandMode }: CollaborationSidebarProps) {
  // Helper function for presence indicator
  const presenceDot = (online?: boolean) =>
    online ? "bg-green-500" : "bg-gray-400";

  // Core state management
  const [activeTab, setActiveTab] = useState<"chat" | "calls" | "activity">("chat");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Enhanced features state
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

  // Simulate incoming call once
  useEffect(() => {
    // Removed incoming call simulation - will be driven by real events
  }, [incomingCall]);

  // Enhanced data with API integration
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

  // Fetch real collaboration data
  useEffect(() => {
    const fetchCollaborationData = async () => {
      try {
        setIsLoadingData(true);
        
        // Fetch chats, calls, and activity in parallel
        const [chatsRes, callsRes, activityRes] = await Promise.allSettled([
          fetch('/api/collaboration/channels'),
          fetch('/api/collaboration/recent-calls'),
          fetch('/api/collaboration/activity')
        ]);

        // Process chats
        if (chatsRes.status === 'fulfilled' && chatsRes.value.ok) {
          const chatsData = await chatsRes.value.json();
          // API returns array directly or in .data property
          setChats(Array.isArray(chatsData) ? chatsData : (chatsData.data?.channels || chatsData.channels || []));
        } else {
          // Fallback to empty state
          setChats([]);
        }

        // Process recent calls
        if (callsRes.status === 'fulfilled' && callsRes.value.ok) {
          const callsData = await callsRes.value.json();
          setRecentCalls(callsData.data?.calls || callsData.calls || []);
        } else {
          setRecentCalls([]);
        }

        // Process activity
        if (activityRes.status === 'fulfilled' && activityRes.value.ok) {
          const activityData = await activityRes.value.json();
          setActivityItems(activityData.data?.activities || activityData.activities || []);
        } else {
          setActivityItems([]);
        }
      } catch (error) {
        console.error('Failed to load collaboration data:', error);
        // Set empty states on error
        setChats([]);
        setRecentCalls([]);
        setActivityItems([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchCollaborationData();

    // Refresh data every 30 seconds for live updates
    const interval = setInterval(fetchCollaborationData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter chats based on active filters
  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnread = !activeFilters.unread || chat.unread > 0;
    const matchesPinned = !activeFilters.pinned || chat.isPinned;
    const matchesOnline = !activeFilters.online || chat.isOnline;
    const matchesType = 
      (activeFilters.channels && chat.type === "channel") ||
      (activeFilters.direct && chat.type === "direct") ||
      (activeFilters.groups && chat.type === "group");

    return matchesSearch && matchesUnread && matchesPinned && matchesOnline && matchesType;
  });

  /** ACTIVITY TAB */
  const ActivityTab = (
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
                  <span className="text-gray-600 ml-1">{item.action}</span>
                  {item.target && (
                    <span className="font-medium text-blue-600 ml-1">{item.target}</span>
                  )}
                  {item.channel && (
                    <span className="text-gray-500 ml-1">in {item.channel}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  {item.type === "call" && <Phone className="w-3 h-3" />}
                  {item.type === "message" && <MessageSquare className="w-3 h-3" />}
                  {item.type === "file" && <FileText className="w-3 h-3" />}
                  {item.type === "join" && <UserPlus className="w-3 h-3" />}
                  {item.type === "mention" && <Sparkles className="w-3 h-3" />}
                  {item.timestamp}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  /** CHAT TAB WITH FILTERS */
  const ChatTab = (
    <div className="flex flex-col h-full">
      {/* Search and Filters */}
      <div className="p-3 border-b border-gray-200 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search chats…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded ${showFilters ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-1 text-xs">
            {Object.entries(activeFilters).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setActiveFilters(prev => ({ ...prev, [key]: !value }))}
                className={`p-2 rounded text-left capitalize ${
                  value ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {key === 'unread' && '🔴'} {key === 'pinned' && '📌'} {key === 'online' && '🟢'}
                {key === 'channels' && '#'} {key === 'direct' && '@'} {key === 'groups' && '👥'}
                {' '}{key}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chats */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoadingData ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">
              {searchQuery || Object.values(activeFilters).some(v => v && activeFilters.unread) 
                ? 'No chats match your filters' 
                : 'No chats yet'}
            </p>
            <p className="text-xs mt-1">Start a conversation with your team</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isSel = selectedChat === chat.id;
            const isDirect = chat.type === "direct";
            return (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`group w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                  isSel ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      chat.type === "channel"
                        ? "bg-purple-100 text-purple-700"
                        : chat.type === "group"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {chat.avatar}
                  </div>
                  {isDirect && (
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${presenceDot(chat.isOnline)}`} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Name row with badges */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900 truncate flex items-center gap-1">
                      {chat.isPinned && <Pin className="w-3 h-3 text-gray-400" />}
                      {chat.isMuted && <VolumeX className="w-3 h-3 text-gray-400" />}
                      {chat.name}
                    </span>

                    {/* Unread count badge */}
                    {chat.unread > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500 text-white leading-none">
                        {chat.unread > 99 ? "99+" : chat.unread}
                      </span>
                    )}

                    {/* Quick action buttons */}
                    {isDirect && chat.isOnline && (
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onExpandMode?.("video");
                          }}
                          className="p-1 rounded hover:bg-green-50 text-green-600 cursor-pointer"
                          title={`Video call ${chat.name}`}
                        >
                          <Video className="w-3 h-3" />
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            // Start audio call
                          }}
                          className="p-1 rounded hover:bg-blue-50 text-blue-600 cursor-pointer"
                          title={`Audio call ${chat.name}`}
                        >
                          <Phone className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preview + time */}
                  <div className="mt-0.5 flex items-center justify-between">
                    <span className="text-sm text-gray-600 truncate">
                      {chat.isTyping ? (
                        <span className="text-green-600 italic flex items-center gap-1">
                          <Circle className="w-2 h-2 animate-pulse" />
                          typing…
                        </span>
                      ) : (
                        chat.lastMessage
                      )}
                    </span>
                    <span className="text-[11px] text-gray-500 ml-2 flex-shrink-0 flex items-center gap-1">
                      {chat.participants && chat.participants > 2 && (
                        <Users className="w-3 h-3" />
                      )}
                      {chat.timestamp}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  /** ENHANCED CALLS TAB */
  const CallsTab = (
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
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
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
          recentCalls.map((call, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                  {call.avatar || call.name.charAt(0)}
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                    call.status === "missed" ? "bg-red-500 text-white" : "bg-green-500 text-white"
                  }`}
                >
                  {call.type === "video" ? <Video className="w-2.5 h-2.5" /> : <Phone className="w-2.5 h-2.5" />}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{call.name}</span>
                  {call.status === "missed" && (
                    <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full">
                      Missed
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span>{call.duration}</span>
                  <span>•</span>
                  <span>{call.time}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  className="p-1.5 rounded text-green-600 hover:bg-green-50" 
                  title="Audio call"
                  onClick={() => {
                    // Handle audio call
                  }}
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button 
                  className="p-1.5 rounded text-blue-600 hover:bg-blue-50" 
                  title="Video call"
                  onClick={() => onExpandMode?.("video")}
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
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
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Start Audio Call
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* RIGHT SIDEBAR (uses parent positioning from CollapseLayout) */}
      <aside className="h-full w-full bg-white border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Collaboration</h2>

            <div className="relative">
              <div className="flex items-center gap-1">
                {/* Hamburger menu for Files / Whiteboard */}
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  className="p-1.5 rounded text-gray-600 hover:bg-gray-100"
                  title="More"
                >
                  <MenuIcon className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="Settings">
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
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
          </div>
        </div>

        {/* Enhanced Tabs: Chat / Calls / Activity */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: "chat", label: "Chat", icon: MessageSquare },
              { id: "calls", label: "Calls", icon: Phone },
              { id: "activity", label: "Activity", icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "chat" | "calls" | "activity")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" && ChatTab}
          {activeTab === "calls" && CallsTab} 
          {activeTab === "activity" && ActivityTab}
        </div>
      </aside>

      {/* INCOMING CALL: centered popup */}
      {incomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl border border-blue-200">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-blue-500 animate-ping opacity-20"></div>
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-3xl shadow-lg">
                  {incomingCall.from.avatar}
                </div>
              </div>

              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2 inline-block">
                📞 Incoming {incomingCall.type === "video" ? "Video" : "Audio"} Call
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {incomingCall.from.name}
              </h3>

              <div className="flex gap-4 justify-center mt-4">
                <button
                  onClick={() => setIncomingCall(null)}
                  className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xl"
                  title="Decline"
                >
                  📞
                </button>
                <button
                  onClick={() => {
                    setIncomingCall(null);
                    onExpandMode?.("video");
                  }}
                  className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-xl"
                  title="Accept"
                >
                  📞
                </button>
              </div>

              <div className="flex justify-center gap-8 mt-3 text-sm text-gray-600">
                <span>Decline</span>
                <span>Accept</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
