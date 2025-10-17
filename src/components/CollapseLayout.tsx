"use client";

import React from "react";
import Topbar from "@/components/Topbar";
import Ribbon from "@/components/ribbon/Ribbon";
import Sidebar from "@/components/Sidebar";

export default function CollapseLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  // Fixed sidebar width
  const sidebarWidth = 256; // w-64 = 256px

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
