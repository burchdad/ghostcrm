import React, { useState } from "react";

const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
];

const translations: Record<string, Record<string, string>> = {
  en: {
    title: "🌐 Multi-Language & Localization",
    select: "Select Language",
    welcome: "Welcome to GhostCRM!",
  },
  es: {
    title: "🌐 Multi-Idioma y Localización",
    select: "Seleccionar idioma",
    welcome: "¡Bienvenido a GhostCRM!",
  },
  fr: {
    title: "🌐 Multi-Langue et Localisation",
    select: "Choisir la langue",
    welcome: "Bienvenue à GhostCRM!",
  },
};

export default function MultiLanguageLocalization() {
  const [lang, setLang] = useState("en");

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">{translations[lang].title}</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <label className="font-bold mb-2 block">{translations[lang].select}</label>
        <select value={lang} onChange={e => setLang(e.target.value)} className="border rounded px-2 py-1 mb-4">
          {languages.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <div className="text-lg">{translations[lang].welcome}</div>
      </div>
    </div>
  );
}
