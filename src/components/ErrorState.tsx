"use client";
import React from "react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  errorCode?: string | number;
  details?: string;
  onRetry?: () => void;
  onSupport?: () => void;
  animate?: boolean;
  severity?: 'error' | 'warning' | 'info';
  actionButton?: React.ReactNode;
}

export function ErrorState({ 
  title = "Error", 
  description = "Something went wrong.", 
  icon, 
  errorCode, 
  details, 
  onRetry, 
  onSupport,
  animate,
  severity = 'error',
  actionButton
}: ErrorStateProps) {
  const severityColors = {
    error: {
      text: 'text-red-500',
      bg: 'bg-red-100',
      textBg: 'text-red-700',
      button: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      text: 'text-yellow-500',
      bg: 'bg-yellow-100',
      textBg: 'text-yellow-700',
      button: 'bg-yellow-500 hover:bg-yellow-600'
    },
    info: {
      text: 'text-blue-500',
      bg: 'bg-blue-100',
      textBg: 'text-blue-700',
      button: 'bg-blue-500 hover:bg-blue-600'
    }
  };

  const colors = severityColors[severity];
  
  const defaultIcons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${colors.text}`} aria-label="Error State" aria-live="assertive">
      {icon || <span className={`text-4xl mb-2 ${animate ? 'animate-bounce' : ''}`}>{defaultIcons[severity]}</span>}
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm mb-2 text-gray-600 max-w-md">{description}</p>
      {errorCode && (
        <div className={`text-xs font-mono ${colors.bg} ${colors.textBg} rounded px-3 py-1 mb-3`}>
          Error Code: {errorCode}
        </div>
      )}
      {details && (
        <details className="mb-4">
          <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
            Show Details
          </summary>
          <pre className="text-xs bg-gray-100 text-gray-700 rounded px-3 py-2 mt-2 max-w-md overflow-x-auto text-left">
            {details}
          </pre>
        </details>
      )}
      <div className="flex gap-2 mt-2">
        {onRetry && (
          <button 
            className={`px-4 py-2 ${colors.button} text-white rounded-md shadow hover:scale-105 transition-all duration-200`} 
            onClick={onRetry} 
            aria-label="Retry"
          >
            Try Again
          </button>
        )}
        {onSupport && (
          <button 
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md shadow hover:scale-105 transition-all duration-200" 
            onClick={onSupport} 
            aria-label="Contact Support"
          >
            Contact Support
          </button>
        )}
        {actionButton}
      </div>
    </div>
  );
}
