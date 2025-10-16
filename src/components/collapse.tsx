"use client";
import React, { createContext, useContext, useMemo, useEffect, useState } from "react";

const DEFAULTS = {
  expanded: 280,
  collapsed: 72,
  min: 200,
  max: 400,
  header: 60,
  ribbon: 45,
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
    // Always use T.expanded (420) on server for initial render
    if (typeof window === "undefined") return T.expanded;
    // On client, use localStorage if available
    const saved = Number(localStorage.getItem("sidebarWidth"));
    return Number.isFinite(saved) ? saved : T.expanded;
  });

  // After mount, update widthState from localStorage if needed
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = Number(localStorage.getItem("sidebarWidth"));
    if (Number.isFinite(saved) && saved !== widthState) {
      setWidthState(saved);
    }
  }, []);

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
      className={`p-2 rounded-full bg-black text-white focus:ring-1 focus:ring-blue-500 ${className}`}
    >
      <span className="inline-block align-middle">
      {collapsed ? (
        <span className="inline-block">
          {/* Triple chevron right */}
          <svg width="18" height="18" viewBox="7 3 10 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      ) : (
        <span className="inline-block scale-x-[-1]">
          {/* Triple chevron left (mirrored to point right) */}
          <svg width="18" height="18" viewBox="7 3 10 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
      </span>
    </button>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

