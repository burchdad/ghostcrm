"use client";
import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import TeamsStyleCollaborationModal from "@/components/collaboration/TeamsStyleCollaborationModal";
import { useFloatingUI } from "@/contexts/floating-ui-context";
import "./GlobalCollaborationButton.css";

export default function GlobalCollaborationButton() {
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { shouldShowFloatingButtons } = useFloatingUI();

  // Fetch notification count from API - always set up, but conditionally fetch
  React.useEffect(() => {
    // Don't fetch if buttons shouldn't be visible
    if (!shouldShowFloatingButtons) return;
    
    const fetchNotificationCount = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/collaboration/activity');
        if (response.ok) {
          const data = await response.json();
          setNotificationCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Failed to fetch notification count:', error);
        setNotificationCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotificationCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [shouldShowFloatingButtons]);

  // Don't render if floating buttons should be hidden
  if (!shouldShowFloatingButtons) {
    return null;
  }



  return (
    <>
      {/* Global Floating Collaboration Button */}
      <button
        onClick={() => setShowCollaboration(true)}
        className="global-collaboration-btn"
        title="Team Collaboration"
        aria-label="Open team collaboration"
      >
        <MessageSquare className="w-5 h-5" />
        
        {/* Notification Badge */}
        {notificationCount > 0 && (
          <div className="global-collaboration-badge">
            {notificationCount > 99 ? '99+' : notificationCount}
          </div>
        )}
      </button>

      {/* Teams-style Collaboration Modal */}
      {showCollaboration && (
        <TeamsStyleCollaborationModal
          isOpen={showCollaboration}
          onClose={() => setShowCollaboration(false)}
        />
      )}
    </>
  );
}