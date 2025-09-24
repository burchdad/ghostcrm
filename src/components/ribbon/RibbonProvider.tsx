"use client";
import React, { createContext, useContext, useMemo, useState } from "react";
import type { ControlId, RibbonContext, RibbonState} from "./types";

type Ctx = {
  state: RibbonState;
  setContext: (c: RibbonContext) => void;
  setTheme: (t: RibbonState["theme"]) => void;
  setLanguage: (l: RibbonState["language"]) => void;
  enable: (ids: ControlId[]) => void;
  disable: (ids: ControlId[]) => void;
  clearPageOverrides: () => void;
};

const RibbonCtx = createContext<Ctx | null>(null);

export function RibbonProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<RibbonContext>("dashboard");  
  const [theme, setTheme] = useState<RibbonState["theme"]>("system");
  const [language, setLanguage] = useState<RibbonState["language"]>("en");
  const [pageEnable, setPageEnable] = useState<Set<ControlId>>(new Set());
  const [pageDisable, setPageDisable] = useState<Set<ControlId>>(new Set());

  const state: RibbonState = useMemo(() => ({
    context, theme, language, pageEnable, pageDisable
  }), [context, theme, language, pageEnable, pageDisable]);

  const enable = (ids: ControlId[]) => setPageEnable(new Set(ids));
  const disable = (ids: ControlId[]) => setPageDisable(new Set(ids));
  const clearPageOverrides = () => { setPageEnable(new Set()); setPageDisable(new Set()); };

  const value: Ctx = { state, setContext, setTheme, setLanguage, enable, disable, clearPageOverrides };
  return <RibbonCtx.Provider value={value}>{children}</RibbonCtx.Provider>;
}

export function useRibbon() {
  const ctx = useContext(RibbonCtx);
  if (!ctx) throw new Error("useRibbon must be used inside <RibbonProvider>");
  return ctx;
}
