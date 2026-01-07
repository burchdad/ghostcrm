"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import AIAssistantModal from "@/components/modals/AIAssistantModal";

// Marketing routes that don't need auth
const MARKETING_ROUTES = ['/', '/marketing', '/demo', '/terms', '/privacy', '/about', '/careers', '/press', '/roadmap', '/help', '/contact'];

export default function GlobalAIAssistant() {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const pathname = usePathname();
  
  // Check if we're on a marketing page
  const isMarketingPage = MARKETING_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });

  // Safe auth hook that handles missing context
  let user = null;
  if (!isMarketingPage) {
    try {
      const { useAuth } = require('@/context/SupabaseAuthContext');
      const auth = useAuth();
      user = auth.user;
    } catch (error) {
      // Auth context not available, user stays null
    }
  }

  // Convert pathname to readable page name
  const getCurrentPage = () => {
    switch (pathname) {
      case '/':
        return 'home';
      case '/login':
        return 'login';
      case '/register':
        return 'register';
      case '/dashboard':
        return 'dashboard';
      case '/leads':
        return 'leads';
      case '/deals':
        return 'deals';
      case '/calendar':
        return 'calendar';
      case '/reports':
        return 'reports';
      case '/settings':
        return 'settings';
      default:
        // Extract page name from path like /some/nested/page -> 'page'
        const segments = pathname.split('/').filter(Boolean);
        return segments[segments.length - 1] || 'page';
    }
  };

  return (
    <>
      {/* Global AI Assistant floating button - Positioned between QuickAdd and Collaboration */}
      <div style={{ 
        position: 'fixed', 
        bottom: '8rem', 
        left: '2rem', 
        zIndex: 1000 
      }}>
        <button 
          onClick={() => setShowAIAssistant(true)}
          className="ai-assistant-fab"
          title={user 
            ? "AI Assistant - Your personal CRM helper" 
            : "AI Assistant - Learn about Ghost Auto CRM"
          }
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Global AI Assistant Modal */}
      <AIAssistantModal 
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        isAuthenticated={!!user}
        currentPage={getCurrentPage()}
      />
    </>
  );
}