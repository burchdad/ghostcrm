"use client";

import React from "react";
import Topbar from "@/components/Topbar";
import Ribbon from "@/components/ribbon/Ribbon";
import Sidebar from "@/components/Sidebar";

const FIXED_SIDEBAR_WIDTH = 280; // Fixed width in pixels

export default function CollapseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-hidden bg-gray-50">
      {/* Topbar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm"
        style={{ height: "50px" }}
      >
        <Topbar />
      </header>

      {/* Ribbon under the header */}
      <div
        className="fixed z-40 right-0 left-0 bg-gray-100 border-b flex items-center px-3"
        style={{ top: "50px", height: "30px" }}
      >
        <Ribbon />
      </div>

      {/* Sidebar - Fixed width, no collapse */}
      <aside
        className="fixed left-0 bottom-0 z-30 bg-white"
        style={{
          top: "80px",
          width: `${FIXED_SIDEBAR_WIDTH}px`,
        }}
      >
        <div className="h-full overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      {/* Main content (to the right of sidebar; below header+ribbon) */}
      <main 
        className="overflow-y-auto"
        style={{ 
          paddingTop: "80px", // header (50px) + ribbon (30px)
          paddingLeft: `${FIXED_SIDEBAR_WIDTH}px`,
          height: "100vh",
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 py-4">{children}</div>
      </main>
    </div>
  );
}
