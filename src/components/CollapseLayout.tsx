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
        style={{ height: "var(--header-h, 60px)" }}
      >
        <Topbar />
      </header>

      {/* Ribbon under the header */}
      <div
        className="fixed z-40 right-0 left-0 bg-gray-100 border-b flex items-center px-3"
        style={{ top: "var(--header-h, 60px)", height: "var(--ribbon-h, 45px)" }}
      >
        <Ribbon />
      </div>

      {/* Sidebar (width via collapse state, smooth animation) */}
      <aside
        className="fixed left-0 bottom-0 z-30 bg-white shadow-lg border-r border-gray-200"
        style={{
          top: "calc(var(--header-h, 60px) + var(--ribbon-h, 45px))",
          width: `${mounted ? width : 280}px`,
          transition: "width 200ms ease",
        }}
      >
        {/* Toggle on right edge */}
        <CollapseToggle className="absolute right-0 top-2 z-20 shadow" />
        <div className="h-full overflow-hidden">
          <Sidebar />
        </div>
      </aside>

      {/* Main content (to the right of sidebar; below header+ribbon) */}
      <main 
        className="bg-gray-50"
        style={{ 
          paddingTop: "calc(var(--header-h, 60px) + var(--ribbon-h, 45px) + 10px)",
          paddingLeft: mounted ? `${width}px` : "280px",
          minHeight: "100vh",
          transition: "padding-left 200ms ease"
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
