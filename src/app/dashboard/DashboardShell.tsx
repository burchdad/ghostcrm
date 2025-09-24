"use client";

import React from "react";
import Topbar from "@/components/Topbar";
import Ribbon from "@/components/ribbon/Ribbon";
import Sidebar from "@/components/Sidebar";
import {
  ShellProvider,
  useShell,
  HEADER_H,
  RIBBON_H,
  MIN_W,
  MAX_W,
  COLLAPSED_W,
} from "@/components/shell/ShellContext";

function GridShell({ children }: { children: React.ReactNode }) {
  const { width, setWidth, toggle } = useShell();
  const [resizing, setResizing] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!resizing || !wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x <= COLLAPSED_W + 12) {
        setWidth(COLLAPSED_W);
        return;
      }
      setWidth(Math.max(MIN_W, Math.min(MAX_W, x)));
    }
    function onUp() {
      if (resizing) setResizing(false);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [resizing, setWidth]);

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateRows: `${HEADER_H}px ${RIBBON_H}px 1fr`,
    gridTemplateColumns: `${width}px 1fr`,
    transition: resizing ? "none" : "grid-template-columns 200ms ease",
    minHeight: "100vh",
  };

  const resizerLeft = width - 2;

  return (
    <div ref={wrapRef} style={gridStyle} className="relative">
      <header className="col-span-2 sticky top-0 z-50 bg-white shadow-sm flex items-center px-3">
        <Topbar />
      </header>
      <div className="col-span-2 sticky z-40 bg-gray-100 border-b flex items-center px-3" style={{ top: HEADER_H }}>
        <Ribbon />
      </div>
      <aside className="row-start-3 col-start-1 bg-white border-r">
        <div className="h-full overflow-y-auto">
          <Sidebar />
        </div>
      </aside>
      <main className="row-start-3 col-start-2">
        <div className="h-full overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto px-4 py-4">{children}</div>
        </div>
      </main>
      <div
        role="separator"
        aria-orientation="vertical"
        title="Drag to resize. Double-click to collapse/expand."
        onMouseDown={() => setResizing(true)}
        onDoubleClick={toggle}
        className="hidden md:block absolute z-50"
        style={{
          top: HEADER_H + RIBBON_H,
          bottom: 0,
          left: resizerLeft,
          width: 4,
          cursor: "col-resize",
          background: "transparent",
        }}
      />
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <ShellProvider>
      <GridShell>{children}</GridShell>
    </ShellProvider>
  );
}
