"use client";
import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import TeamsStyleCollaborationModal from "@/components/collaboration/TeamsStyleCollaborationModal";
import "./GlobalCollaborationButton.css";

export default function GlobalCollaborationButton() {
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Safe auth that doesn't break on marketing pages
  let user: any = null;
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

  // Fetch notification count from API
  React.useEffect(() => {
    if (!user?.id || !shouldShowButton) return;
    
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
  }, [user?.id, shouldShowButton]);

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