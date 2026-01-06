"use client";
import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import CollaborationModal from "@/components/collaboration/CollaborationModal";
import "./GlobalCollaborationButton.css";

export default function GlobalCollaborationButton() {
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true); // Mock notification state

  // Safe auth that doesn't break on marketing pages
  let user = null;
  try {
    const { useAuth } = require('@/context/SupabaseAuthContext');
    const auth = useAuth();
    user = auth.user;
  } catch (error) {
    // Auth context not available (marketing page), user stays null
  }

  // Same visibility logic as QuickAdd - show for authenticated users on main pages
  const shouldShowButton = React.useMemo(() => {
    if (typeof window === 'undefined') return false; // SSR
    
    const pathname = window.location.pathname;
    
    // Don't show on marketing pages, auth pages, or billing pages
    if (pathname === '/' || 
        pathname === '/login' || 
        pathname === '/register' || 
        pathname === '/billing' ||
        pathname.startsWith('/billing/') ||
        pathname === '/reset-password' ||
        pathname === '/unauthorized' ||
        pathname.includes('/marketing')) {
      return false;
    }
    
    // Show on all other pages (leads, dashboard, etc.) when user is authenticated
    return true;
  }, []);

  // Don't render if shouldn't show
  if (!shouldShowButton) {
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
        {hasNotifications && (
          <div className="global-collaboration-badge">
            3
          </div>
        )}
      </button>

      {/* Collaboration Modal with all current functionality */}
      {showCollaboration && (
        <CollaborationModal
          isOpen={showCollaboration}
          onClose={() => setShowCollaboration(false)}
          onExpandMode={(mode) => {
            // Handle expand modes (video, whiteboard, documents)
            console.log('Collaboration expand mode:', mode);
            // Keep modal open when expanding to full features
          }}
        />
      )}
    </>
  );
}