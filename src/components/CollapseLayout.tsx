"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import Ribbon from "@/components/ribbon/Ribbon";
import Sidebar from "@/components/Sidebar";
import AIAssistantModal from "@/components/AIAssistantModal";
import { useAuth } from "@/lib/auth/AuthContext";

export default function CollapseLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const [showAIAssistant, setShowAIAssistant] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  React.useEffect(() => { setMounted(true); }, []);

  // Check if we're on the landing page
  const isLandingPage = pathname === "/";
  
  // Check if we're on the login page (should have no layout wrapper)
  const isLoginPage = pathname === "/login";
  
  // Fixed sidebar width
  const sidebarWidth = 256; // w-64 = 256px

  // If on login page, render children directly with no layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If on landing page, show minimal layout
  if (isLandingPage) {
    return (
      <div className="min-h-screen">
        {/* Clean header for landing page - no buttons needed */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-center px-6 py-4">
            {/* Clean minimal header */}
          </div>
        </header>

        {/* AI Assistant for landing page */}
        <div className="fixed bottom-6 right-6 z-40">
          <button 
            onClick={() => setShowAIAssistant(true)}
            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
            title="AI Assistant"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>

        {/* AI Assistant Modal */}
        <AIAssistantModal 
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
          isAuthenticated={isAuthenticated}
        />

        {/* Main content for landing page */}
        <main>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden themed-bg-tertiary">
      {/* Topbar */}
      <header
        className="topbar fixed top-0 left-0 right-0 z-50 themed-bg-primary shadow-sm"
        style={{ height: "var(--header-h, 60px)" }}
      >
        <Topbar />
      </header>

      {/* Ribbon under the header */}
      <div
        className="fixed z-40 right-0 left-0 themed-bg-secondary themed-border border-b flex items-center px-3"
        style={{ top: "var(--header-h, 60px)", height: "var(--ribbon-h, 45px)" }}
      >
        <Ribbon />
      </div>

      {/* Sidebar (fixed width, no collapse) */}
      <aside
        className="fixed left-0 bottom-0 z-30 themed-bg-primary shadow-lg border-r themed-border overflow-hidden"
        style={{
          top: "calc(var(--header-h, 60px) + var(--ribbon-h, 45px))",
          width: `${sidebarWidth}px`,
        }}
      >
        <div className="h-full overflow-hidden w-full">
          <Sidebar />
        </div>
      </aside>

      {/* AI Assistant for authenticated users */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => setShowAIAssistant(true)}
          className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          title="AI Assistant"
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal 
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        isAuthenticated={isAuthenticated}
      />

      {/* Main content (to the right of sidebar; below header+ribbon) */}
      <main 
        className="main-content themed-bg-tertiary overflow-y-auto"
        style={{ 
          paddingTop: "calc(var(--header-h, 60px) + var(--ribbon-h, 45px) + 10px)",
          paddingLeft: `${sidebarWidth + 16}px`,
          height: "100vh",
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
