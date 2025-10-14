"use client";

import React from "react";
import Topbar from "@/components/Topbar";
import Ribbon from "@/components/ribbon/Ribbon";
import Sidebar from "@/components/Sidebar";
import { CollapseToggle, useCollapse } from "@/components/collapse";

export default function CollapseLayout({ children }: { children: React.ReactNode }) {
  const { width } = useCollapse();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

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

      {/* Sidebar (width via collapse state, smooth animation) */}
      <aside
        className="fixed left-0 bottom-0 z-30 bg-none shadow-none border-r"
        style={{
          top: "80px",
          width: `${mounted ? width : 420}px`,
          transition: "width 200ms ease",
        }}
      >
        {/* Toggle on right edge */}
        <CollapseToggle className="absolute right-0 top-2 z-20 shadow" />
        <div className="h-full overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      {/* Main content (to the right of sidebar; below header+ribbon) */}
      <main 
        className=""
        style={{ 
          paddingTop: "85px", // header (50px) + ribbon (30px)
          paddingLeft: mounted ? `${width}px` : "420px",
          height: "100vh", // full viewport height
          overflowY: "auto",
          backgroundColor: "white",
          borderLeft: "1px solid #eee",
          transition: "padding-left 200ms ease"
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 py-4">{children}</div>
      </main>
    </div>
  );
}
