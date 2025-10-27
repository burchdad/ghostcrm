"use client";
import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Phone, 
  Bell, 
  Users, 
  Video,
  PhoneCall,
  UserCheck,
  MessageCircle,
  Calendar,
  Settings
} from "lucide-react";
import CollaborationPanel from "@/components/collaboration/CollaborationPanel";
import TeamChat from "@/components/collaboration/TeamChat";
import SharedWorkspace from "@/components/collaboration/SharedWorkspace";
import CollaborativeWhiteboard from "@/components/collaboration/CollaborativeWhiteboard";
import VideoCallComponent from "@/components/collaboration/VideoCallComponent";

export default function CollaborationPage() {
    const [activePanel, setActivePanel] = useState<"chat" | "calls" | "files" | "whiteboard" | "comments" | "workspace" | null>(null);
  const [selectedEntity] = useState({
    id: "",
    type: "",
    title: "No Record Selected"
  });

  // Centralized call state
  const [videoCallState, setVideoCallState] = useState<{
    isActive: boolean;
    isMinimized: boolean;
    participants: Array<{
      id: string;
      name: string;
      avatar: string;
      isMuted: boolean;
      isVideoOff: boolean;
      connectionQuality: "excellent" | "good" | "fair" | "poor";
    }>;
    currentUserMuted: boolean;
    currentUserVideoOff: boolean;
    isScreenSharing: boolean;
  }>({
    isActive: false,
    isMinimized: false,
    participants: [],
    currentUserMuted: false,
    currentUserVideoOff: false,
    isScreenSharing: false
  });

  // Centralized call functions
  const startVideoCall = (participants?: Array<any>) => {
    setVideoCallState({
      isActive: true,
      isMinimized: false,
      participants: participants || [],
      currentUserMuted: false,
      currentUserVideoOff: false,
      isScreenSharing: false
    });
  };

  const endCall = () => {
    setVideoCallState(prev => ({ ...prev, isActive: false }));
  };

  const toggleMute = () => {
    setVideoCallState(prev => ({ ...prev, currentUserMuted: !prev.currentUserMuted }));
  };

  const toggleVideo = () => {
    setVideoCallState(prev => ({ ...prev, currentUserVideoOff: !prev.currentUserVideoOff }));
  };

  const toggleScreenShare = () => {
    setVideoCallState(prev => ({ ...prev, isScreenSharing: !prev.isScreenSharing }));
  };

  const toggleMinimize = () => {
    setVideoCallState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Collaboration Center</h1>
          <div className="text-sm text-gray-500">0 team members online</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg" title="Settings">
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Layout - Teams Style */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2">
          <button
            onClick={() => setActivePanel("chat")}
            className={`p-3 rounded-lg transition-colors ${
              activePanel === "chat" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActivePanel("calls")}
            className={`p-3 rounded-lg transition-colors ${
              activePanel === "calls" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Calls"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActivePanel("files")}
            className={`p-3 rounded-lg transition-colors ${
              activePanel === "files" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Files"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActivePanel("whiteboard")}
            className={`p-3 rounded-lg transition-colors ${
              activePanel === "whiteboard" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Whiteboard"
          >
            <Users className="w-5 h-5" />
          </button>
          
          <div className="mt-auto">
            <button
              onClick={() => startVideoCall()}
              className="p-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              title="Start Video Call"
            >
              <Video className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Content based on active panel */}
          {activePanel === "chat" && (
            <div className="flex-1 flex">
              {/* Chat Channels List */}
              <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900">Team Chat</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  <div className="space-y-1">
                    <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <div className="font-medium text-sm"># General</div>
                      <div className="text-xs text-gray-500">No messages</div>
                    </div>
                    <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <div className="font-medium text-sm"># Sales Team</div>
                      <div className="text-xs text-gray-500">No messages</div>
                    </div>
                    <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <div className="font-medium text-sm"># Leads</div>
                      <div className="text-xs text-gray-500">No messages</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chat Messages Area */}
              <div className="flex-1 flex flex-col bg-white">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold"># General</h3>
                  <p className="text-sm text-gray-500">Team general discussion</p>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="text-center text-gray-500 mt-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePanel === "calls" && (
            <div className="flex-1 flex flex-col bg-white">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Calls & Meetings</h2>
              </div>
              <div className="flex-1 p-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button 
                    onClick={() => startVideoCall()}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-center"
                  >
                    <Video className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="font-medium">Start Video Call</div>
                    <div className="text-sm text-gray-500">Start instant meeting</div>
                  </button>
                  <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-medium">Schedule Meeting</div>
                    <div className="text-sm text-gray-500">Plan for later</div>
                  </button>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Recent Calls</h3>
                  <div className="text-center text-gray-500 py-8">
                    <Phone className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No recent calls</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePanel === "files" && (
            <div className="flex-1 flex flex-col bg-white">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Shared Files</h2>
              </div>
              <div className="flex-1 p-4">
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No shared files yet</p>
                  <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Upload File
                  </button>
                </div>
              </div>
            </div>
          )}

          {activePanel === "whiteboard" && (
            <div className="flex-1 flex flex-col bg-white">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Collaborative Whiteboard</h2>
              </div>
              <div className="flex-1 p-4">
                <div className="text-center text-gray-500 py-8">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Start a whiteboard session</p>
                  <button className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                    Create Whiteboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Team Status */}
        <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Team (0 online)</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-center text-gray-500 py-8">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No team members online</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="p-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-gray-50 rounded text-center">
                <div className="font-medium">0</div>
                <div className="text-gray-600">Messages</div>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <div className="font-medium">0</div>
                <div className="text-gray-600">Files</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collaboration Panels - Modal Overlays */}
      {activePanel === "comments" && (
        <CollaborationPanel
          isOpen={true}
          onClose={() => setActivePanel(null)}
          entityType={selectedEntity.type}
          entityId={selectedEntity.id}
          entityTitle={selectedEntity.title}
          onStartVideoCall={startVideoCall}
        />
      )}

      {activePanel && ["chat", "workspace", "whiteboard"].includes(activePanel) && activePanel !== "chat" && (
        <>
          {activePanel === "workspace" && (
            <SharedWorkspace
              isOpen={true}
              onClose={() => setActivePanel(null)}
              entityType={selectedEntity.type}
              entityId={selectedEntity.id}
              onStartVideoCall={startVideoCall}
            />
          )}

          {activePanel === "whiteboard" && (
            <CollaborativeWhiteboard
              isOpen={true}
              onClose={() => setActivePanel(null)}
              entityType={selectedEntity.type}
              entityId={selectedEntity.id}
              onStartVideoCall={startVideoCall}
            />
          )}
        </>
      )}

      {/* Floating Video Call Component */}
      {videoCallState.isActive && (
        <VideoCallComponent
          callId="call_001"
          participants={videoCallState.participants}
          isMinimized={videoCallState.isMinimized}
          onToggleMinimize={toggleMinimize}
          onEndCall={endCall}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={toggleScreenShare}
        />
      )}
    </div>
  );
}
