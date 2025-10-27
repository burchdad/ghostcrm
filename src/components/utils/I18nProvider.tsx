"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface I18nContextType {
  lang: string;
  setLang: (l: string) => void;
  t: (key: string, namespace?: string, count?: number) => string;
  loadedLanguages: string[];
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
  loadedLanguages: [],
});

export function useI18n() {
  return useContext(I18nContext);
}

// Translation cache
const translationCache: Record<string, Record<string, any>> = {};

// Available languages
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

// Load translations for a specific language
async function loadTranslations(lang: string): Promise<Record<string, any>> {
  if (translationCache[lang]) {
    return translationCache[lang];
  }

  try {
    // Import all translation files for the language
    const [common, features, ui] = await Promise.all([
      import(`@/locales/${lang}/common.json`),
      import(`@/locales/${lang}/features.json`),
      import(`@/locales/${lang}/ui.json`)
    ]);
    
    // Merge all translation files with namespace preservation
    translationCache[lang] = {
      common: common.default || common,
      features: features.default || features,
      ui: ui.default || ui
    };
    
    return translationCache[lang];
  } catch (error) {
    console.warn(`Failed to load translations for language: ${lang}`, error);
    // Fallback to English if available
    if (lang !== "en" && !translationCache["en"]) {
      try {
        const [fallbackCommon, fallbackFeatures, fallbackUI] = await Promise.all([
          import(`@/locales/en/common.json`),
          import(`@/locales/en/features.json`),
          import(`@/locales/en/ui.json`)
        ]);
        
        translationCache["en"] = {
          common: fallbackCommon.default || fallbackCommon,
          features: fallbackFeatures.default || fallbackFeatures,
          ui: fallbackUI.default || fallbackUI
        };
        
        return translationCache["en"];
      } catch (fallbackError) {
        console.error("Failed to load fallback English translations", fallbackError);
        return {};
      }
    }
    return translationCache["en"] || {};
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState("en");
  const [loadedLanguages, setLoadedLanguages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial translations and auto-detect browser language
  useEffect(() => {
    const initializeI18n = async () => {
      let initialLang = "en";
      
      // Check for saved language preference
      if (typeof window !== "undefined") {
        const savedLang = localStorage.getItem("ghostcrm-language");
        if (savedLang && SUPPORTED_LANGUAGES.some(l => l.code === savedLang)) {
          initialLang = savedLang;
        } else {
          // Auto-detect browser language
          const browserLang = navigator.language?.split("-")[0];
          if (browserLang && SUPPORTED_LANGUAGES.some(l => l.code === browserLang)) {
            initialLang = browserLang;
          }
        }
      }

      // Load the initial language translations
      await loadTranslations(initialLang);
      setLang(initialLang);
      setLoadedLanguages([initialLang]);
      setIsLoading(false);
    };

    initializeI18n();
  }, []);

  // Handle language change
  const handleSetLang = async (newLang: string) => {
    if (newLang === lang) return;
    
    setIsLoading(true);
    await loadTranslations(newLang);
    setLang(newLang);
    
    if (!loadedLanguages.includes(newLang)) {
      setLoadedLanguages(prev => [...prev, newLang]);
    }
    
    // Save language preference
    if (typeof window !== "undefined") {
      localStorage.setItem("ghostcrm-language", newLang);
    }
    
    setIsLoading(false);
  };

  // Translation function with namespace support
  const t = (key: string, namespace: string = "common", count?: number) => {
    const translations = translationCache[lang];
    if (!translations) return key;

    // Navigate through nested object using key path
    const keys = namespace ? `${namespace}.${key}` : key;
    const keyPath = keys.split(".");
    let value = translations;

    for (const k of keyPath) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        if (lang !== "en" && translationCache["en"]) {
          let fallbackValue = translationCache["en"];
          for (const fallbackK of keyPath) {
            if (fallbackValue && typeof fallbackValue === "object" && fallbackK in fallbackValue) {
              fallbackValue = fallbackValue[fallbackK];
            } else {
              return key; // Return key if not found in fallback either
            }
          }
          value = fallbackValue;
          break;
        }
        return key; // Return key if translation not found
      }
    }

    // Handle pluralization
    if (Array.isArray(value) && typeof count === "number") {
      const pluralForm = count === 1 ? value[0] : value[1];
      return pluralForm ? pluralForm.replace("{count}", count.toString()) : key;
    }

    return typeof value === "string" ? value : key;
  };

  if (isLoading) {
    return <div>Loading translations...</div>;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t, loadedLanguages }}>
      {children}
    </I18nContext.Provider>
  );
}
