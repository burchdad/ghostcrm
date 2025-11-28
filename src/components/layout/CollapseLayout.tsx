"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import UnifiedToolbar from "@/components/navigation/UnifiedToolbar";
import Sidebar from "@/components/layout/Sidebar";
import CollaborationSidebar from "@/components/global/CollaborationSidebar";
import { useAuth } from "@/context/AuthContext";

export default function CollapseLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const [expandedMode, setExpandedMode] = React.useState<"video" | "whiteboard" | "documents" | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  
  React.useEffect(() => { setMounted(true); }, []);

  // Check if we're on the landing page
  const isLandingPage = pathname === "/";
  
  // Check if we're on auth pages (should have no layout wrapper)
  const isAuthPage = pathname === "/login" || 
                     pathname === "/register" || 
                     pathname === "/reset-password" || 
                     pathname === "/billing" ||
                     pathname.startsWith("/billing/") ||
                     pathname === "/login-owner" ||
                     pathname === "/login-admin" ||
                     pathname === "/login-salesmanager" ||
                     pathname === "/login-salesrep" ||
                     pathname.startsWith("/login-");
  
  // Check if we're on a marketing page (should use marketing layout)
  const isMarketingPage = pathname.startsWith("/marketing");
  
  // Fixed sidebar widths - reduced for more dashboard space
  const sidebarWidth = 200; // w-50 = 200px (reduced from 256px)
  const collaborationSidebarWidth = 240; // w-60 = 240px (reduced from 320px)

  // If on auth pages (login/register), render children directly with no layout
  if (isAuthPage) {
    return <>{children}</>;
  }

  // If on marketing page, render children directly (marketing layout handles its own layout)
  if (isMarketingPage) {
    return <>{children}</>;
  }

  // If on landing page, show minimal layout
  if (isLandingPage) {
    return (
      <div data-page="landing" style={{ height: 'auto', overflow: 'visible' }}>
        {/* Clean header for landing page - no buttons needed */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-center px-6 py-4">
            {/* Clean minimal header */}
          </div>
        </header>

        {/* Main content with proper top spacing */}
        <main className="pt-16" style={{ height: 'auto', overflow: 'visible' }}>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen themed-bg-tertiary">
      {/* Unified Toolbar - combines Topbar + Ribbon */}
      <UnifiedToolbar />

      {/* Left Sidebar (CRM Navigation) */}
      <aside
        className="fixed left-0 bottom-0 z-30 themed-bg-primary shadow-lg border-r themed-border overflow-hidden"
        style={{
          top: "var(--unified-toolbar-h, 64px)",
          width: `${sidebarWidth}px`,
          height: "calc(100vh - var(--unified-toolbar-h, 64px))"
        }}
      >
        <div className="h-full overflow-hidden w-full">
          <Sidebar />
        </div>
      </aside>

      {/* Right Sidebar (Collaboration) */}
      {!expandedMode && (
        <aside
          className="fixed right-0 bottom-0 z-30 shadow-lg overflow-hidden collaboration-sidebar-container"
          style={{
            top: "var(--unified-toolbar-h, 64px)",
            width: `${collaborationSidebarWidth}px`,
            height: "calc(100vh - var(--unified-toolbar-h, 64px))",
            position: "fixed",
            right: "0",
          }}
        >
          <CollaborationSidebar onExpandMode={setExpandedMode} />
        </aside>
      )}

      {/* Expanded Mode Overlay */}
      {expandedMode && (
        <div
          className="fixed inset-0 z-40 bg-white"
          style={{ top: "var(--unified-toolbar-h, 64px)" }}
        >
          <div className="h-full flex flex-col">
            {/* Expanded Mode Header */}
            <div className="border-b border-gray-200 p-4 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {expandedMode === "video" && "Video Call"}
                  {expandedMode === "whiteboard" && "Collaborative Whiteboard"}
                  {expandedMode === "documents" && "Shared Documents"}
                </h2>
                <button
                  onClick={() => setExpandedMode(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                >
                  Exit {expandedMode}
                </button>
              </div>
            </div>
            
            {/* Expanded Mode Content */}
            <div className="flex-1 bg-gray-50 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {expandedMode === "video" && "📹"}
                  {expandedMode === "whiteboard" && "🎨"}
                  {expandedMode === "documents" && "📄"}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {expandedMode === "video" && "Video Call Interface"}
                  {expandedMode === "whiteboard" && "Whiteboard Canvas"}
                  {expandedMode === "documents" && "Document Editor"}
                </h3>
                <p className="text-gray-600">
                  {expandedMode === "video" && "Full-screen video calling experience"}
                  {expandedMode === "whiteboard" && "Real-time collaborative whiteboard"}
                  {expandedMode === "documents" && "Shared document editing workspace"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content (between left sidebar and right sidebar/expanded mode) */}
      <main 
        className="main-content themed-bg-tertiary"
        style={{ 
          paddingTop: "calc(var(--unified-toolbar-h, 64px) + 10px)",
          paddingLeft: `${sidebarWidth + 16}px`,
          paddingRight: expandedMode ? "16px" : `${collaborationSidebarWidth + 16}px`,
          minHeight: "calc(100vh - var(--unified-toolbar-h, 64px))",
          paddingBottom: "40px", // Extra space at bottom
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
