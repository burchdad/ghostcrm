"use client";
import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Phone, 
  Bell, 
  Users, 
  X, 
  Send, 
  Video,
  PhoneCall,
  UserCheck,
  MessageCircle,
  Calendar
} from "lucide-react";
import VideoCallComponent from "../collaboration/VideoCallComponent";

interface CollaborationNotification {
  id: string;
  type: "mention" | "direct_message" | "team_message" | "comment" | "file_share" | "meeting_invite" | "call_incoming";
  from: {
    id: string;
    name: string;
    avatar: string;
    status: "online" | "away" | "busy" | "offline";
  };
  content: string;
  timestamp: string;
  isRead: boolean;
  channel?: string;
  entity?: {
    type: string;
    id: string;
    name: string;
  };
  callInfo?: {
    type: "audio" | "video";
    roomId: string;
    participants: string[];
  };
}

interface ActiveCall {
  id: string;
  type: "audio" | "video";
  participants: Array<{
    id: string;
    name: string;
    avatar: string;
    isMuted: boolean;
    isVideoOff: boolean;
    isScreenSharing?: boolean;
    connectionQuality: "excellent" | "good" | "fair" | "poor";
  }>;
  startTime: string;
  status: "connecting" | "active" | "on_hold";
  isMinimized?: boolean;
}

export default function GlobalCollaborationHub() {
  // FAB positioning helpers
  const FAB_PADDING = 24;    // px  -> matches your `right-6/bottom-6`
  const FAB_SIZE    = 56;    // px  -> your AI button is ~56px
  const FAB_GAP     = 16;    // px  -> space between FABs
  const COLLAB_BOTTOM = FAB_PADDING + FAB_SIZE + FAB_GAP; // sits above AI FAB

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"messages" | "calls" | "notifications" | "team">("messages");
  const [notifications, setNotifications] = useState<CollaborationNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [incomingCall, setIncomingCall] = useState<CollaborationNotification | null>(null);
  const [userStatus, setUserStatus] = useState<"online" | "away" | "busy" | "offline">("online");
  const hubRef = useRef<HTMLDivElement>(null);

  // Initialize empty notifications
  useEffect(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const handleAcceptCall = (callNotif: CollaborationNotification) => {
    if (callNotif.callInfo) {
      const call: ActiveCall = {
        id: callNotif.callInfo.roomId,
        type: callNotif.callInfo.type,
        participants: [
          {
            id: "current_user",
            name: "You",
            avatar: "👤",
            isMuted: false,
            isVideoOff: false,
            connectionQuality: "excellent"
          },
          {
            id: callNotif.from.id,
            name: callNotif.from.name,
            avatar: callNotif.from.avatar,
            isMuted: false,
            isVideoOff: false,
            connectionQuality: "good"
          }
        ],
        startTime: new Date().toISOString(),
        status: "active",
        isMinimized: false
      };
      setActiveCall(call);
      setIncomingCall(null);
    }
  };

  const handleDeclineCall = () => {
    setIncomingCall(null);
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  const handleToggleMute = () => {
    if (activeCall) {
      setActiveCall(prev => prev ? {
        ...prev,
        participants: prev.participants.map(p => 
          p.id === "current_user" ? { ...p, isMuted: !p.isMuted } : p
        )
      } : null);
    }
  };

  const handleToggleVideo = () => {
    if (activeCall) {
      setActiveCall(prev => prev ? {
        ...prev,
        participants: prev.participants.map(p => 
          p.id === "current_user" ? { ...p, isVideoOff: !p.isVideoOff } : p
        )
      } : null);
    }
  };

  const handleToggleScreenShare = () => {
    if (activeCall) {
      setActiveCall(prev => prev ? {
        ...prev,
        participants: prev.participants.map(p => 
          p.id === "current_user" ? { ...p, isScreenSharing: !p.isScreenSharing } : p
        )
      } : null);
    }
  };

  const handleToggleMinimize = () => {
    if (activeCall) {
      setActiveCall(prev => prev ? {
        ...prev,
        isMinimized: !prev.isMinimized
      } : null);
    }
  };

  const startVideoCall = (targetUserId: string) => {
    const targetUser = [
      { id: "user_1", name: "John Smith", avatar: "🧑‍💼" },
      { id: "user_2", name: "Jane Doe", avatar: "👩‍💼" },
      { id: "user_3", name: "Mike Johnson", avatar: "👨‍💻" },
      { id: "user_4", name: "Sarah Wilson", avatar: "👩‍🎨" },
      { id: "user_5", name: "David Brown", avatar: "👨‍📊" }
    ].find(u => u.id === targetUserId);

    if (targetUser) {
      const call: ActiveCall = {
        id: `call_${Date.now()}`,
        type: "video",
        participants: [
          {
            id: "current_user",
            name: "You",
            avatar: "👤",
            isMuted: false,
            isVideoOff: false,
            connectionQuality: "excellent"
          },
          {
            id: targetUser.id,
            name: targetUser.name,
            avatar: targetUser.avatar,
            isMuted: false,
            isVideoOff: false,
            connectionQuality: "good"
          }
        ],
        startTime: new Date().toISOString(),
        status: "active",
        isMinimized: false
      };
      setActiveCall(call);
    }
  };

  const startAudioCall = (targetUserId: string) => {
    const targetUser = [
      { id: "user_1", name: "John Smith", avatar: "🧑‍💼" },
      { id: "user_2", name: "Jane Doe", avatar: "👩‍💼" },
      { id: "user_3", name: "Mike Johnson", avatar: "👨‍💻" },
      { id: "user_4", name: "Sarah Wilson", avatar: "👩‍🎨" },
      { id: "user_5", name: "David Brown", avatar: "👨‍📊" }
    ].find(u => u.id === targetUserId);

    if (targetUser) {
      const call: ActiveCall = {
        id: `call_${Date.now()}`,
        type: "audio",
        participants: [
          {
            id: "current_user",
            name: "You",
            avatar: "👤",
            isMuted: false,
            isVideoOff: true, // Audio call - video is off
            connectionQuality: "excellent"
          },
          {
            id: targetUser.id,
            name: targetUser.name,
            avatar: targetUser.avatar,
            isMuted: false,
            isVideoOff: true, // Audio call - video is off
            connectionQuality: "good"
          }
        ],
        startTime: new Date().toISOString(),
        status: "active",
        isMinimized: false
      };
      setActiveCall(call);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500";
      case "busy": return "bg-red-500";
      default: return "bg-slate-400";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "mention": return "📣";
      case "direct_message": return "💬";
      case "team_message": return "👥";
      case "comment": return "💭";
      case "file_share": return "📎";
      case "meeting_invite": return "📅";
      case "call_incoming": return "📞";
      default: return "🔔";
    }
  };

  const renderMessagesTab = () => (
    <div className="flex flex-col h-full">
      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {[
            { id: "conv_1", name: "John Smith", avatar: "🧑‍💼", lastMessage: "Can you review the proposal?", time: "2m ago", unread: 2, status: "online" },
            { id: "conv_2", name: "Sales Team", avatar: "👥", lastMessage: "Great work on the Q4 numbers!", time: "15m ago", unread: 0, status: "online", isChannel: true },
            { id: "conv_3", name: "Jane Doe", avatar: "👩‍💼", lastMessage: "Let's schedule that call", time: "1h ago", unread: 1, status: "away" },
            { id: "conv_4", name: "Project Alpha", avatar: "🔒", lastMessage: "Mike: Updated the timeline", time: "2h ago", unread: 0, status: "online", isChannel: true, isPrivate: true }
          ].map(conv => (
            <div key={conv.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                  {conv.avatar}
                </div>
                {!conv.isChannel && (
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conv.status)}`} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-800 text-sm flex items-center gap-1">
                    {conv.isChannel && (conv.isPrivate ? "🔒" : "#")}
                    {conv.name}
                  </div>
                  <span className="text-xs text-slate-500">{conv.time}</span>
                </div>
                <div className="text-sm text-slate-600 truncate">{conv.lastMessage}</div>
              </div>
              
              {conv.unread > 0 && (
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {conv.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="border-t border-slate-200 p-4">
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center gap-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <span>💬</span> New Message
          </button>
          <button className="flex items-center gap-2 p-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm">
            <span>👥</span> New Channel
          </button>
        </div>
      </div>
    </div>
  );

  const renderCallsTab = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Active Call */}
        {activeCall && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-green-800">Active Call</div>
              <div className="text-sm text-green-600">
                {Math.floor((Date.now() - new Date(activeCall.startTime).getTime()) / 60000)}m
              </div>
            </div>
            
            <div className="space-y-2">
              {activeCall.participants.map(participant => (
                <div key={participant.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm">
                    {participant.avatar}
                  </div>
                  <span className="flex-1 text-sm">{participant.name}</span>
                  <div className="flex gap-1">
                    {participant.isMuted && <span className="text-red-500">🔇</span>}
                    {participant.isVideoOff && <span className="text-slate-500">📷</span>}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                End Call
              </button>
              <button className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
                🔇
              </button>
              <button className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
                📷
              </button>
            </div>
          </div>
        )}
        
        {/* Recent Calls */}
        <div className="space-y-3">
          <h3 className="font-medium text-slate-800">Recent Calls</h3>
          {[
            { name: "John Smith", avatar: "🧑‍💼", type: "video", duration: "15m 32s", time: "1h ago", status: "completed" },
            { name: "Sales Team Meeting", avatar: "👥", type: "video", duration: "45m 18s", time: "3h ago", status: "completed" },
            { name: "Jane Doe", avatar: "👩‍💼", type: "audio", duration: "8m 45s", time: "Yesterday", status: "missed" },
            { name: "Client Check-in", avatar: "🏢", type: "video", duration: "22m 12s", time: "Yesterday", status: "completed" }
          ].map((call, index) => (
            <div key={index} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                {call.avatar}
              </div>
              
              <div className="flex-1">
                <div className="font-medium text-slate-800 text-sm">{call.name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{call.type === "video" ? "📹" : "📞"}</span>
                  <span>{call.duration}</span>
                  <span>•</span>
                  <span>{call.time}</span>
                </div>
              </div>
              
              <div className="flex gap-1">
                <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                  📞
                </button>
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  📹
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Call Actions */}
      <div className="border-t border-slate-200 p-4">
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center gap-2 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            <span>📞</span> Audio Call
          </button>
          <button className="flex items-center gap-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <span>📹</span> Video Call
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {notifications.map(notification => (
            <div 
              key={notification.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                notification.isRead ? 'bg-slate-50' : 'bg-blue-50 border border-blue-200'
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-800 text-sm">{notification.from.name}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  
                  <div className="text-sm text-slate-600">{notification.content}</div>
                  
                  {notification.entity && (
                    <div className="mt-2 p-2 bg-white rounded border border-slate-200">
                      <div className="text-xs text-slate-500 capitalize">{notification.entity.type}</div>
                      <div className="text-sm font-medium text-slate-700">{notification.entity.name}</div>
                    </div>
                  )}
                  
                  {notification.channel && (
                    <div className="mt-1 text-xs text-blue-600">{notification.channel}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="border-t border-slate-200 p-4">
        <button className="w-full p-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg">
          ⚙️ Notification Settings
        </button>
      </div>
    </div>
  );

  const renderTeamTab = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Status Selector */}
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <div className="text-sm font-medium text-slate-700 mb-2">Your Status</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { status: "online", label: "Online", color: "green" },
              { status: "away", label: "Away", color: "yellow" },
              { status: "busy", label: "Busy", color: "red" },
              { status: "offline", label: "Offline", color: "slate" }
            ].map(({ status, label, color }) => (
              <button
                key={status}
                onClick={() => setUserStatus(status as any)}
                className={`flex items-center gap-2 p-2 rounded text-sm ${
                  userStatus === status 
                    ? `bg-${color}-100 text-${color}-800 border border-${color}-300`
                    : 'hover:bg-slate-100'
                }`}
              >
                <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                {label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Team Members */}
        <div className="space-y-3">
          <h3 className="font-medium text-slate-800">Team Members</h3>
          {[
            { name: "John Smith", avatar: "🧑‍💼", status: "online", role: "Sales Manager" },
            { name: "Jane Doe", avatar: "👩‍💼", status: "online", role: "Account Executive" },
            { name: "Mike Johnson", avatar: "👨‍💻", status: "away", role: "Technical Lead" },
            { name: "Sarah Wilson", avatar: "👩‍🎨", status: "busy", role: "Marketing Specialist" },
            { name: "David Brown", avatar: "👨‍📊", status: "online", role: "Data Analyst" },
            { name: "Lisa Chen", avatar: "👩‍💻", status: "offline", role: "Developer" }
          ].map((member, index) => (
            <div key={index} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                  {member.avatar}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
              </div>
              
              <div className="flex-1">
                <div className="font-medium text-slate-800 text-sm">{member.name}</div>
                <div className="text-xs text-slate-500">{member.role}</div>
              </div>
              
              <div className="flex gap-1">
                <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">💬</button>
                <button className="p-1 text-green-600 hover:bg-green-50 rounded">📞</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Global Collaboration Icon - positioned above the AI Assistant icon (bottom-right) */}
      <div
        className="fixed z-50"
        style={{ right: FAB_PADDING, bottom: COLLAB_BOTTOM }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ai-assistant-fab"
          style={{ background: 'linear-gradient(to right, #059669, #10b981)' }}
          title="Collaboration Hub - Team chat, calls, and notifications"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Collaboration Panel */}
      {isOpen && (
        <div ref={hubRef} className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-slate-200 z-40 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">Collaboration Hub</h3>
                <p className="text-sm text-slate-600">Stay connected with your team</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="mt-4 flex border border-slate-200 rounded-lg bg-white">
              {[
                { id: "messages", label: "Messages", icon: "💬" },
                { id: "calls", label: "Calls", icon: "📞" },
                { id: "notifications", label: "Alerts", icon: "🔔" },
                { id: "team", label: "Team", icon: "👥" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors relative ${
                    activeTab === tab.id
                      ? "bg-green-100 text-green-800"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                  {tab.id === "notifications" && unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "messages" && renderMessagesTab()}
            {activeTab === "calls" && renderCallsTab()}
            {activeTab === "notifications" && renderNotificationsTab()}
            {activeTab === "team" && renderTeamTab()}
          </div>
        </div>
      )}

      {/* Incoming Call Popover (bottom-right, above FABs) */}
      {incomingCall && (
        <div
          className="fixed z-50"
          style={{ right: FAB_PADDING, bottom: COLLAB_BOTTOM + 96 }} // 96px above collab FAB
        >
          <div className="bg-white rounded-xl p-6 max-w-sm shadow-2xl border-2 border-blue-200">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-blue-500 animate-ping opacity-20"></div>
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-3xl shadow-lg">
                  {incomingCall.from.avatar}
                </div>
              </div>

              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2 inline-block">
                📞 Incoming Call
              </div>

              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {incomingCall.from.name}
              </h3>

              <p className="text-slate-600 mb-6">
                {incomingCall.callInfo?.type === "video" ? "📹 Video" : "📞 Audio"} Call
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleDeclineCall}
                  className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xl"
                  title="Decline"
                >
                  📞
                </button>
                <button
                  onClick={() => handleAcceptCall(incomingCall)}
                  className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-xl"
                  title="Accept"
                >
                  📞
                </button>
              </div>

              <div className="flex justify-center gap-8 mt-4 text-sm text-slate-600">
                <span>Decline</span>
                <span>Accept</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Call Overlay */}
      {activeCall && (
        <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-40 min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium text-slate-800">
              {activeCall.type === "video" ? "📹" : "📞"} Active Call
            </div>
            <div className="text-sm text-slate-600">
              {Math.floor((Date.now() - new Date(activeCall.startTime).getTime()) / 60000)}:{
                String(Math.floor(((Date.now() - new Date(activeCall.startTime).getTime()) % 60000) / 1000)).padStart(2, '0')
              }
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            {activeCall.participants.map(participant => (
              <div key={participant.id} className="text-center">
                <div className="w-12 h-12 mx-auto mb-1 rounded bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                  {participant.avatar}
                </div>
                <div className="text-xs text-slate-600">{participant.name}</div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-sm">
              🔇 Mute
            </button>
            <button className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-sm">
              📷 Video
            </button>
            <button 
              onClick={handleEndCall}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
            >
              📞 End
            </button>
          </div>
        </div>
      )}
    </>
  );
}