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
    // Use static imports for better Next.js compatibility
    let translations: Record<string, any>;
    
    if (lang === 'en') {
      const commonEn = await import('@/locales/en/common.json');
      const featuresEn = await import('@/locales/en/features.json');
      const uiEn = await import('@/locales/en/ui.json');
      
      translations = {
        common: commonEn.default || commonEn,
        features: featuresEn.default || featuresEn,
        ui: uiEn.default || uiEn
      };
    } else if (lang === 'es') {
      const commonEs = await import('@/locales/es/common.json');
      const featuresEs = await import('@/locales/es/features.json');
      const uiEs = await import('@/locales/es/ui.json');
      
      translations = {
        common: commonEs.default || commonEs,
        features: featuresEs.default || featuresEs,
        ui: uiEs.default || uiEs
      };
    } else if (lang === 'fr') {
      const commonFr = await import('@/locales/fr/common.json');
      const featuresFr = await import('@/locales/fr/features.json');
      const uiFr = await import('@/locales/fr/ui.json');
      
      translations = {
        common: commonFr.default || commonFr,
        features: featuresFr.default || featuresFr,
        ui: uiFr.default || uiFr
      };
    } else {
      // Fallback to English for unsupported languages
      return loadTranslations('en');
    }
    
    translationCache[lang] = translations;
    return translations;
  } catch (error) {
    console.warn(`Failed to load translations for language: ${lang}`, error);
    // Fallback to English if not already trying English
    if (lang !== "en" && !translationCache["en"]) {
      try {
        return await loadTranslations('en');
      } catch (fallbackError) {
        console.error("Failed to load fallback English translations", fallbackError);
        return { common: {}, features: {}, ui: {} };
      }
    }
    return translationCache["en"] || { common: {}, features: {}, ui: {} };
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState("en");
  const [loadedLanguages, setLoadedLanguages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false); // ✨ Start as false for instant render

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

      // Load translations in background without blocking render
      try {
        await loadTranslations(initialLang);
        setLang(initialLang);
        setLoadedLanguages([initialLang]);
      } catch (error) {
        console.warn("Translation loading failed, using fallbacks:", error);
        setLang("en");
        setLoadedLanguages(["en"]);
      }
    };

    // Initialize async without blocking render
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
    // 🚀 NON-BLOCKING: Render children immediately with fallback translations
    return (
      <I18nContext.Provider value={{ 
        lang: "en", 
        setLang: handleSetLang, 
        t: (key: string) => key, // Fallback to key if translations not loaded
        loadedLanguages: [] 
      }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t, loadedLanguages }}>
      {children}
    </I18nContext.Provider>
  );
}
