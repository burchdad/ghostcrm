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
      text: 'text-red-600',
      bg: 'bg-red-100',
      textBg: 'text-red-700',
      button: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      text: 'text-yellow-600',
      bg: 'bg-yellow-100',
      textBg: 'text-yellow-700',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      text: 'text-blue-600',
      bg: 'bg-blue-100',
      textBg: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const colors = severityColors[severity];
  
  const defaultIcons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 text-center ${colors.text}`} aria-label="Error State" aria-live="assertive">
      {icon || <span className={`text-2xl mb-2 ${animate ? 'animate-bounce' : ''}`}>{defaultIcons[severity]}</span>}
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-lg mb-2 text-gray-600">{description}</p>
      {errorCode && (
        <div className={`text-xs font-mono ${colors.bg} ${colors.textBg} rounded px-3 py-1 mb-3`}>
          Error Code: {errorCode}
        </div>
      )}
      {details && (
        <details className="mb-4">
          <summary className="cursor-pointer text-xs text-gray-700 hover-bg-gray-100">
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
            className={`btn ${colors.button}`} 
            onClick={onRetry} 
            aria-label="Retry"
          >
            Try Again
          </button>
        )}
        {onSupport && (
          <button 
            className="btn btn-secondary" 
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
