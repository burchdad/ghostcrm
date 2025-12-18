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
          className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl border border-gray-200 text-gray-700 text-sm transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
        >
          <GlobeAltIcon className="w-4 h-4" />
          <span className="font-medium">{currentLanguage?.flag}</span>
          {showLabel && <span className="font-medium">{currentLanguage?.label}</span>}
          <ChevronDownIcon className="w-3 h-3 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 min-w-full overflow-hidden backdrop-blur-sm">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 flex items-center space-x-3 transition-all duration-200 ${
                  language.code === lang ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium flex-1">{language.label}</span>
                {language.code === lang && <span className="text-blue-500 font-bold">✓</span>}
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