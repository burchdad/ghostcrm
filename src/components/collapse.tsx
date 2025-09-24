"use client";
import React, { createContext, useContext, useMemo, useEffect, useState } from "react";

const DEFAULTS = {
  expanded: 256,
  collapsed: 72,
  min: 180,
  max: 420,
  header: 64,
  ribbon: 40,
};

type Ctx = {
  collapsed: boolean;
  width: number;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
  setWidth: (px: number) => void;
};

const CollapseCtx = createContext<Ctx | null>(null);

export function CollapseProvider({
  children,
  tokens,
  initialCollapsed,
  initialWidth,
}: {
  children: React.ReactNode;
  tokens?: Partial<typeof DEFAULTS>;
  initialCollapsed?: boolean;
  initialWidth?: number;
}) {
  const T = { ...DEFAULTS, ...tokens };

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return !!initialCollapsed;
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? saved === "1" : !!initialCollapsed;
  });

  const [widthState, setWidthState] = useState<number>(() => {
    if (typeof window === "undefined") return initialWidth ?? T.expanded;
    const saved = Number(localStorage.getItem("sidebarWidth"));
    return Number.isFinite(saved) ? saved : (initialWidth ?? T.expanded);
  });

  const [lastExpanded, setLastExpanded] = useState<number>(() => {
    if (typeof window === "undefined") return T.expanded;
    const saved = Number(localStorage.getItem("lastExpandedWidth"));
    return Number.isFinite(saved) ? saved : T.expanded;
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--header-h", `${T.header}px`);
    root.style.setProperty("--ribbon-h", `${T.ribbon}px`);
  }, [T.header, T.ribbon]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const w = collapsed ? T.collapsed : clamp(widthState, T.min, T.max);
    root.style.setProperty("--sidebar-w", `${w}px`);
    root.classList.toggle("sidebar-collapsed", collapsed);
    localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0");
    localStorage.setItem("sidebarWidth", String(w));
    if (!collapsed) {
      setLastExpanded(w);
      localStorage.setItem("lastExpandedWidth", String(w));
    }
  }, [collapsed, widthState, T.min, T.max, T.collapsed]);

  const setWidth = (px: number) => setWidthState(clamp(px, T.min, T.max));
  const toggle = () => setCollapsed((v) => !v);

  const value = useMemo<Ctx>(
    () => ({
      collapsed,
      width: collapsed ? T.collapsed : clamp(widthState, T.min, T.max),
      toggle,
      setCollapsed,
      setWidth,
    }),
    [collapsed, widthState, T.collapsed, T.min, T.max]
  );

  return <CollapseCtx.Provider value={value}>{children}</CollapseCtx.Provider>;
}

export function useCollapse() {
  const ctx = useContext(CollapseCtx);
  if (!ctx) throw new Error("useCollapse must be used inside <CollapseProvider>");
  return ctx;
}

export function CollapseToggle({ className = "", title }: { className?: string; title?: string }) {
  const { collapsed, toggle } = useCollapse();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={title ?? (collapsed ? "Expand" : "Collapse")}
      className={`ml-auto p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      <span className="inline-block align-middle">{collapsed ? "›" : "‹"}</span>
    </button>
  );
}

export function CollapseResizer({ doubleClickToggle = true }: { doubleClickToggle?: boolean }) {
  const { setWidth, toggle } = useCollapse();
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!resizing) return;
      setWidth(e.clientX);
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

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      title="Drag to resize. Double-click to collapse/expand."
      onMouseDown={() => setResizing(true)}
      onDoubleClick={doubleClickToggle ? toggle : undefined}
      style={{
        position: "fixed",
        top: "calc(var(--header-h) + var(--ribbon-h))",
        bottom: 0,
        left: "calc(var(--sidebar-w) - 2px)",
        width: "4px",
        cursor: "col-resize",
        zIndex: 60,
        background: "transparent",
      }}
    />
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
