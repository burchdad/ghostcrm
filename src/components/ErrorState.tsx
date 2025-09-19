"use client";
import React from "react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  errorCode?: string | number;
  details?: string;
  onRetry?: () => void;
  animate?: boolean;
}

export function ErrorState({ title = "Error", description = "Something went wrong.", icon, errorCode, details, onRetry, animate }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-red-500" aria-label="Error State" aria-live="assertive">
      {icon || <span className={`text-4xl mb-2 ${animate ? 'animate-shake' : ''}`}>❌</span>}
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm mb-2">{description}</p>
      {errorCode && <div className="text-xs font-mono bg-red-100 text-red-700 rounded px-2 py-1 mb-2">Error Code: {errorCode}</div>}
      {details && <pre className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-1 mb-2 max-w-md overflow-x-auto">{details}</pre>}
      {onRetry && (
        <button className="mt-2 px-4 py-2 bg-red-500 text-white rounded shadow hover:scale-105 transition-all" onClick={onRetry} aria-label="Retry">Retry</button>
      )}
    </div>
  );
}
