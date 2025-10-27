"use client";
import React, { useState } from "react";
import { useI18n, SUPPORTED_LANGUAGES } from "@/components/utils/I18nProvider";
import { ChevronDownIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

interface LanguageSelectorProps {
  variant?: "dropdown" | "button" | "minimal";
  showLabel?: boolean;
  className?: string;
}

export default function LanguageSelector({ 
  variant = "dropdown", 
  showLabel = true,
  className = ""
}: LanguageSelectorProps) {
  const { lang, setLang, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === lang);

  const handleLanguageChange = async (newLang: string) => {
    await setLang(newLang);
    setIsOpen(false);
  };

  if (variant === "minimal") {
    return (
      <select
        value={lang}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className={`bg-transparent border border-gray-600 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-500 ${className}`}
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <option key={language.code} value={language.code} className="bg-gray-800 text-gray-300">
            {language.flag} {language.label}
          </option>
        ))}
      </select>
    );
  }

  if (variant === "button") {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 text-gray-300 text-sm transition-colors"
        >
          <GlobeAltIcon className="w-4 h-4" />
          <span>{currentLanguage?.flag}</span>
          {showLabel && <span>{currentLanguage?.label}</span>}
          <ChevronDownIcon className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-50 min-w-full">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 flex items-center space-x-2 ${
                  language.code === lang ? 'bg-gray-700 text-blue-400' : 'text-gray-300'
                }`}
              >
                <span>{language.flag}</span>
                <span>{language.label}</span>
                {language.code === lang && <span className="ml-auto text-blue-400">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {t("select", "language")}
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-300 text-sm hover:bg-gray-700 focus:outline-none focus:border-blue-500"
        >
          <div className="flex items-center space-x-2">
            <span>{currentLanguage?.flag}</span>
            <span>{currentLanguage?.label}</span>
          </div>
          <ChevronDownIcon className="w-4 h-4" />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-50">
              {SUPPORTED_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 flex items-center space-x-2 ${
                    language.code === lang ? 'bg-gray-700 text-blue-400' : 'text-gray-300'
                  }`}
                >
                  <span>{language.flag}</span>
                  <span>{language.label}</span>
                  {language.code === lang && <span className="ml-auto text-blue-400">✓</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Quick language switcher for navigation bars
export function QuickLanguageSelector({ className = "" }: { className?: string }) {
  return (
    <LanguageSelector 
      variant="button" 
      showLabel={false} 
      className={className}
    />
  );
}

// Minimal language selector for settings
export function MinimalLanguageSelector({ className = "" }: { className?: string }) {
  return (
    <LanguageSelector 
      variant="minimal" 
      showLabel={false} 
      className={className}
    />
  );
}