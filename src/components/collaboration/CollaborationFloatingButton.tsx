"use client";
import React, { useState } from "react";
import { MessageSquare, Users, Video, Phone, Bell } from "lucide-react";
import CollaborationModal from "./CollaborationModal";

interface CollaborationFloatingButtonProps {
  className?: string;
}

export default function CollaborationFloatingButton({ className = "" }: CollaborationFloatingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true); // Mock notification state

  return (
    <>
      {/* Floating Collaboration Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`fixed bottom-6 left-20 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 
                   text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 
                   transition-all duration-200 flex items-center justify-center group ${className}`}
        title="Open Collaboration"
      >
        <MessageSquare className="w-6 h-6" />
        
        {/* Notification Badge */}
        {hasNotifications && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs 
                         rounded-full flex items-center justify-center font-medium">
            3
          </div>
        )}
        
        {/* Hover Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                       bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 
                       group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Team Collaboration
        </div>
      </button>

      {/* Collaboration Modal */}
      {isModalOpen && (
        <CollaborationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onExpandMode={(mode) => {
            // Handle expand modes (video, whiteboard, documents)
            console.log('Expand mode:', mode);
          }}
        />
      )}
    </>
  );
}