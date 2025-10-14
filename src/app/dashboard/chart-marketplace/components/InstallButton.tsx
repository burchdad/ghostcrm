"use client";
import React, { useState } from 'react';
import { ChartTemplate } from '../lib/types';

interface InstallButtonProps {
  chart: ChartTemplate;
  onInstall: (chart: ChartTemplate) => Promise<void>;
  className?: string;
}

export default function InstallButton({ chart, onInstall, className = '' }: InstallButtonProps) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const handleInstall = async () => {
    if (isInstalling || isInstalled) return;

    setIsInstalling(true);
    try {
      await onInstall(chart);
      setIsInstalled(true);
      setTimeout(() => setIsInstalled(false), 3000); // Reset after 3 seconds
    } catch (error) {
      console.error('Failed to install chart:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const getButtonContent = () => {
    if (isInstalling) {
      return (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
          Installing...
        </>
      );
    }
    
    if (isInstalled) {
      return (
        <>
          <span>✅</span>
          Installed!
        </>
      );
    }

    return (
      <>
        <span>⬇️</span>
        Install Chart
      </>
    );
  };

  const getButtonStyles = () => {
    if (isInstalled) {
      return 'bg-green-500 hover:bg-green-600';
    }
    if (isInstalling) {
      return 'bg-blue-400 cursor-not-allowed';
    }
    return 'bg-blue-500 hover:bg-blue-600';
  };

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling || isInstalled}
      className={`px-4 py-2 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${getButtonStyles()} ${className}`}
    >
      {getButtonContent()}
    </button>
  );
}