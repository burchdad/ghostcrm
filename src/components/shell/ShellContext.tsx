"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ShellCtx = {
  collapsed: boolean;
  width: number;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
  setWidth: (px: number) => void;
};

const Ctx = createContext<ShellCtx | null>(null);

export const HEADER_H = 64;
export const RIBBON_H = 40;
export const COLLAPSED_W = 72;
export const EXPANDED_DEFAULT = 250;
export const MIN_W = 180;
export const MAX_W = 420;

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebarCollapsed") === "1";
  });

  const [width, setWidthState] = useState<number>(() => {
    if (typeof window === "undefined") return EXPANDED_DEFAULT;
    const saved = Number(localStorage.getItem("sidebarWidth"));
    if (collapsed) return COLLAPSED_W;
    return Number.isFinite(saved) && saved >= MIN_W && saved <= MAX_W ? saved : EXPANDED_DEFAULT;
  });

  const [lastExpanded, setLastExpanded] = useState<number>(() => {
    if (typeof window === "undefined") return EXPANDED_DEFAULT;
    const saved = Number(localStorage.getItem("lastExpandedWidth"));
    return Number.isFinite(saved) ? saved : EXPANDED_DEFAULT;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0");
    }
  }, [collapsed]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarWidth", String(width));
    }
  }, [width]);

  const setWidth = (px: number) => {
    const clamped = Math.max(MIN_W, Math.min(MAX_W, px));
    setWidthState(clamped);
    if (!collapsed) {
      setLastExpanded(clamped);
      if (typeof window !== "undefined") {
        localStorage.setItem("lastExpandedWidth", String(clamped));
      }
    }
  };

  const collapse = () => {
    setCollapsed(true);
    setWidthState(COLLAPSED_W);
  };

  const expand = () => {
    setCollapsed(false);
    setWidthState(lastExpanded || EXPANDED_DEFAULT);
  };

  const toggle = () => (collapsed ? expand() : collapse());

  const value = useMemo(
    () => ({ collapsed, width, toggle, collapse, expand, setWidth }),
    [collapsed, width, lastExpanded]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShell() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShell must be used inside <ShellProvider>");
  return ctx;
}
