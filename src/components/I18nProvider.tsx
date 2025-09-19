"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface I18nContextType {
  lang: string;
  setLang: (l: string) => void;
  t: (s: string, count?: number) => string;
  loadTranslations?: (lang: string, data: Record<string, string>) => void;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (s: string) => s,
});

export function useI18n() {
  return useContext(I18nContext);
}

const defaultTranslations: Record<string, Record<string, string | [string, string]>> = {
  es: { "Welcome to GhostCRM!": "¡Bienvenido a GhostCRM!", "You have 2 new leads.": ["Tienes {count} nuevo cliente potencial.", "Tienes {count} nuevos clientes potenciales."] },
  fr: { "Welcome to GhostCRM!": "Bienvenue sur GhostCRM!", "You have 2 new leads.": ["Vous avez {count} nouveau prospect.", "Vous avez {count} nouveaux prospects."] },
  de: { "Welcome to GhostCRM!": "Willkommen bei GhostCRM!", "You have 2 new leads.": ["Sie haben {count} neuen Lead.", "Sie haben {count} neue Leads."] },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState("en");
  const [translations, setTranslations] = useState(defaultTranslations);

  // Auto-detect browser language
  useEffect(() => {
    if (typeof window !== "undefined") {
      const browserLang = navigator.language?.split("-")[0];
      if (browserLang && translations[browserLang]) {
        setLang(browserLang);
      }
    }
  }, [translations]);

  // Dynamic translation loading
  const loadTranslations = (newLang: string, data: Record<string, string | [string, string]>) => {
    setTranslations(prev => ({ ...prev, [newLang]: data }));
  };

  // Pluralization logic
  const t = (s: string, count?: number) => {
    const entry = translations[lang]?.[s];
    if (Array.isArray(entry) && typeof count === "number") {
      return entry[count === 1 ? 0 : 1].replace("{count}", count.toString());
    }
    return typeof entry === "string" ? entry : s;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, loadTranslations }}>
      {children}
    </I18nContext.Provider>
  );
}
