"use client";
import React from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  cta?: { label: string; onClick: () => void };
  animate?: boolean;
  lang?: string;
  ariaHint?: string;
}

const translations: Record<string, { title: string; description: string }> = {
  es: { title: "Sin datos", description: "No hay nada para mostrar aquí." },
  fr: { title: "Aucune donnée", description: "Il n'y a rien à afficher ici." },
  de: { title: "Keine Daten", description: "Es gibt nichts anzuzeigen." },
};

export function EmptyState({ title = "No Data", description = "There is nothing to show here.", icon, illustration, cta, animate, lang = "en", ariaHint }: EmptyStateProps) {
  const t = translations[lang] || { title, description };
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500" aria-label="Empty State" aria-live="polite" aria-describedby={ariaHint ? "empty-hint" : undefined}>
      {illustration ? (
        <div className={`mb-4 ${animate ? 'animate-bounce' : ''}`}>{illustration}</div>
      ) : (
        icon || <span className={`text-4xl mb-2 ${animate ? 'animate-bounce' : ''}`}>📭</span>
      )}
      <h3 className="font-bold text-lg mb-1">{t.title}</h3>
      <p className="text-sm mb-2" id="empty-hint">{t.description}</p>
      {cta && (
        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded shadow hover:scale-105 transition-all" onClick={cta.onClick} aria-label={cta.label}>{cta.label}</button>
      )}
    </div>
  );
}
