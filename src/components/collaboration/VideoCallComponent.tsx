"use client";
import React, { useState, useRef, useEffect } from "react";

interface CallParticipant {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing?: boolean;
  connectionQuality: "excellent" | "good" | "fair" | "poor";
}

interface VideoCallProps {
  callId: string;
  participants: CallParticipant[];
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
}

export default function VideoCallComponent({
  callId,
  participants,
  isMinimized = false,
  onToggleMinimize,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare
}: VideoCallProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: string;
    message: string;
    timestamp: string;
  }>>([]);
  const [newMessage, setNewMessage] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Initialize empty chat messages
  useEffect(() => {
    setChatMessages([]);
  }, []);

  // Update call duration
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now().toString(),
      sender: "You",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const toggleFullScreen = () => {
    if (!isFullScreen && videoContainerRef.current) {
      videoContainerRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const getConnectionIcon = (quality: string) => {
    switch (quality) {
      case "excellent": return "📶";
      case "good": return "📶";
      case "fair": return "📶";
      default: return "📶";
    }
  };

  const getConnectionColor = (quality: string) => {
    switch (quality) {
      case "excellent": return "text-green-500";
      case "good": return "text-yellow-500";
      case "fair": return "text-orange-500";
      default: return "text-red-500";
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-40">
        <div className="p-3 border-b border-slate-200 bg-slate-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium text-sm">Call in progress</span>
              <span className="text-xs text-slate-500">{formatDuration(callDuration)}</span>
            </div>
            <button
              onClick={onToggleMinimize}
              className="p-1 text-slate-500 hover:text-slate-700 rounded"
            >
              ⬆️
            </button>
          </div>
        </div>
        
        <div className="p-3">
          <div className="flex items-center gap-2 mb-3">
            {participants.slice(0, 3).map(participant => (
              <div key={participant.id} className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs">
                  {participant.avatar}
                </div>
                {participant.isMuted && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔇</span>
                  </div>
                )}
              </div>
            ))}
            {participants.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                +{participants.length - 3}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onToggleMute}
              className={`flex-1 p-2 rounded text-xs ${
                participants.find(p => p.id === "current_user")?.isMuted
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              🔇
            </button>
            <button
              onClick={onToggleVideo}
              className={`flex-1 p-2 rounded text-xs ${
                participants.find(p => p.id === "current_user")?.isVideoOff
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              📷
            </button>
            <button
              onClick={onEndCall}
              className="p-2 bg-red-500 text-white rounded text-xs"
            >
              📞
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={videoContainerRef}
      className="fixed top-4 right-4 w-96 h-80 bg-slate-900 z-50 flex flex-col rounded-lg shadow-2xl border border-slate-700"
    >
      {/* Call Header */}
      <div className="p-3 bg-slate-800 border-b border-slate-700 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-white font-medium text-sm">Video Call</span>
              <span className="text-slate-300 text-xs">{formatDuration(callDuration)}</span>
            </div>
            
            {isRecording && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-full text-sm">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Recording
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm"
            >
              👥 {participants.length}
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm relative"
            >
              💬 Chat
              {chatMessages.length > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {chatMessages.length}
                </div>
              )}
            </button>
            <button
              onClick={onToggleMinimize}
              className="p-2 text-slate-400 hover:text-white rounded"
            >
              ⬇️
            </button>
            <button
              onClick={onEndCall}
              className="p-2 text-slate-400 hover:text-white rounded"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          {/* Video Grid */}
          <div className={`h-full p-4 grid gap-4 ${
            participants.length === 1 ? 'grid-cols-1' :
            participants.length === 2 ? 'grid-cols-2' :
            participants.length <= 4 ? 'grid-cols-2 grid-rows-2' :
            'grid-cols-3 grid-rows-2'
          }`}>
            {participants.map(participant => (
              <div 
                key={participant.id}
                className="relative bg-slate-800 rounded-lg overflow-hidden group"
              >
                {/* Video Placeholder */}
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  {participant.isVideoOff ? (
                    <div className="text-center text-white">
                      <div className="text-6xl mb-2">{participant.avatar}</div>
                      <div className="text-lg font-medium">{participant.name}</div>
                      <div className="text-sm opacity-75">Video Off</div>
                    </div>
                  ) : (
                    <div className="text-center text-white">
                      <div className="text-6xl mb-2">{participant.avatar}</div>
                      <div className="text-lg font-medium">{participant.name}</div>
                    </div>
                  )}
                </div>
                
                {/* Participant Controls Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{participant.name}</span>
                    <span className={`text-xs ${getConnectionColor(participant.connectionQuality)}`}>
                      {getConnectionIcon(participant.connectionQuality)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {participant.isMuted && (
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🔇</span>
                      </div>
                    )}
                    {participant.isScreenSharing && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🖥️</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Screen Share Overlay */}
          {participants.some(p => p.isScreenSharing) && (
            <div className="absolute inset-4 bg-slate-700 rounded-lg p-4 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-4xl mb-4">🖥️</div>
                <div className="text-xl font-medium">Screen Share Active</div>
                <div className="text-sm opacity-75">
                  {participants.find(p => p.isScreenSharing)?.name} is sharing their screen
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Participants Panel */}
        {showParticipants && (
          <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-white font-medium">Participants ({participants.length})</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {participants.map(participant => (
                  <div key={participant.id} className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                        {participant.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-slate-700 ${
                        participant.connectionQuality === "excellent" ? "bg-green-500" :
                        participant.connectionQuality === "good" ? "bg-yellow-500" :
                        participant.connectionQuality === "fair" ? "bg-orange-500" : "bg-red-500"
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">{participant.name}</div>
                      <div className="text-slate-400 text-xs">
                        {participant.connectionQuality} connection
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {participant.isMuted && <span className="text-red-400">🔇</span>}
                      {participant.isVideoOff && <span className="text-slate-400">📷</span>}
                      {participant.isScreenSharing && <span className="text-blue-400">🖥️</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-white font-medium">Chat</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map(message => (
                <div key={message.id} className="bg-slate-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">{message.sender}</span>
                    <span className="text-slate-400 text-xs">{message.timestamp}</span>
                  </div>
                  <div className="text-slate-300 text-sm">{message.message}</div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="p-3 bg-slate-800 border-t border-slate-700 rounded-b-lg">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onToggleMute}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              participants.find(p => p.id === "current_user")?.isMuted
                ? "bg-red-500 text-white"
                : "bg-slate-700 text-white hover:bg-slate-600"
            }`}
          >
            🔇
          </button>
          
          <button
            onClick={onToggleVideo}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              participants.find(p => p.id === "current_user")?.isVideoOff
                ? "bg-red-500 text-white"
                : "bg-slate-700 text-white hover:bg-slate-600"
            }`}
          >
            📷
          </button>
          
          <button
            onClick={onToggleScreenShare}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              participants.find(p => p.id === "current_user")?.isScreenSharing
                ? "bg-blue-500 text-white"
                : "bg-slate-700 text-white hover:bg-slate-600"
            }`}
          >
            🖥️
          </button>
          
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              isRecording
                ? "bg-red-500 text-white"
                : "bg-slate-700 text-white hover:bg-slate-600"
            }`}
          >
            ⚫
          </button>
          
          <button
            onClick={onEndCall}
            className="w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center text-sm"
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
}