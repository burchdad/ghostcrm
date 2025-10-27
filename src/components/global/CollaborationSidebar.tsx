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
} from "lucide-react";

interface Chat {
  id: string;
  name: string;
  type: "direct" | "channel" | "group";
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline?: boolean;
  isTyping?: boolean;
}

interface CollaborationSidebarProps {
  onExpandMode?: (mode: "video" | "whiteboard" | "documents" | null) => void;
}

export default function CollaborationSidebar({ onExpandMode }: CollaborationSidebarProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "calls">("chat");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);

  // Simulate incoming call once
  useEffect(() => {
    // Removed incoming call simulation - will be driven by real events
  }, [incomingCall]);

  // Initialize with empty data
  const chats: Chat[] = [];

  const recentCalls: Array<{
    name: string;
    type: "video" | "audio";
    duration: string;
    time: string;
    status: "completed" | "missed";
  }> = [];

  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presenceDot = (online?: boolean) =>
    online ? "bg-green-500" : "bg-gray-400";

  /** CHAT TAB */
  const ChatTab = (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search chats…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chats */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredChats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">No chats yet</p>
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
                {/* Name row with small unread badge + tiny video button */}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900 truncate">
                    {chat.name}
                  </span>

                  {/* Unread count badge next to name */}
                  {chat.unread > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500 text-white leading-none">
                      {chat.unread > 99 ? "99+" : chat.unread}
                    </span>
                  )}

                  {/* Tiny video-call button (hover reveal or if online) */}
                  {isDirect && chat.isOnline && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExpandMode?.("video");
                      }}
                      className="ml-1 p-1 rounded hover:bg-green-50 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title={`Start video call with ${chat.name}`}
                    >
                      <Video className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Preview + time */}
                <div className="mt-0.5 flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate">
                    {chat.isTyping ? (
                      <span className="text-green-600 italic">typing…</span>
                    ) : (
                      chat.lastMessage
                    )}
                  </span>
                  <span className="text-[11px] text-gray-500 ml-2 flex-shrink-0">
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

  /** CALLS TAB */
  const CallsTab = (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Recent Calls</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {recentCalls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📞</div>
            <p className="text-sm">No recent calls</p>
            <p className="text-xs mt-1">Your call history will appear here</p>
          </div>
        ) : (
          recentCalls.map((call, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                call.status === "missed" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
              }`}
            >
              {call.type === "video" ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{call.name}</div>
              <div className="text-xs text-gray-500">{call.duration} • {call.time}</div>
            </div>
            <div className="flex gap-1">
              <button className="p-1.5 rounded text-green-600 hover:bg-green-50" title="Audio call">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded text-blue-600 hover:bg-blue-50" title="Video call">
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))
        )}
      </div>

      <div className="border-t border-gray-200 p-3">
        <button
          onClick={() => onExpandMode?.("video")}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Start Call
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

        {/* Tabs: Chat / Calls */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: "chat", label: "Chat", icon: MessageSquare },
              { id: "calls", label: "Calls", icon: Phone },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "chat" | "calls")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" ? ChatTab : CallsTab}
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
