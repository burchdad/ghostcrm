"use client";
import React, { useState, useEffect } from "react";

interface CombinedMetricsCardProps {
  analytics: {
    messageCount: number;
    alertCount: number;
    orgScore: number;
    totalLeads: number;
    revenue?: number;
    activeDeals?: number;
    conversionRate?: number;
    teamMembers?: number;
  };
}

export default function CombinedMetricsCard({ analytics }: CombinedMetricsCardProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'syncing'>('online');
  const [lastSync, setLastSync] = useState(new Date());
  const [cardSettings, setCardSettings] = useState({
    showTitle: true,
    showDescriptions: true,
    colorTheme: 'default',
    borderStyle: 'bold',
    visibleMetrics: {
      messages: true,
      aiAlerts: true,
      totalLeads: true,
      orgScore: true,
      revenue: false,
      activeDeals: false,
      conversionRate: false,
      teamMembers: false
    }
  });

  const handleSettingsChange = (setting: string, value: any) => {
    setCardSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleMetricVisibilityChange = (metric: string, visible: boolean) => {
    setCardSettings(prev => ({
      ...prev,
      visibleMetrics: {
        ...prev.visibleMetrics,
        [metric]: visible
      }
    }));
  };

  // Simulate connection status changes and periodic sync
  useEffect(() => {
    const syncInterval = setInterval(() => {
      setConnectionStatus('syncing');
      setLastSync(new Date());
      
      // Simulate sync completion after 1 second
      setTimeout(() => {
        setConnectionStatus('online');
      }, 1000);
    }, 30000); // Sync every 30 seconds

    // Simulate occasional connection issues
    const connectionCheckInterval = setInterval(() => {
      if (Math.random() < 0.05) { // 5% chance of connection issue
        setConnectionStatus('offline');
        setTimeout(() => {
          setConnectionStatus('online');
        }, 2000);
      }
    }, 10000); // Check every 10 seconds

    return () => {
      clearInterval(syncInterval);
      clearInterval(connectionCheckInterval);
    };
  }, []);

  // Get all available metrics with their data
  const getAllMetrics = () => [
    {
      key: 'messages',
      label: 'Messages',
      icon: '💬',
      value: analytics.messageCount,
      description: 'Active conversations',
      color: 'green'
    },
    {
      key: 'aiAlerts',
      label: 'AI Alerts',
      icon: '🔔',
      value: analytics.alertCount,
      description: 'System notifications',
      color: 'blue'
    },
    {
      key: 'totalLeads',
      label: 'Total Leads',
      icon: '👥',
      value: analytics.totalLeads,
      description: 'In pipeline',
      color: 'orange'
    },
    {
      key: 'orgScore',
      label: 'Org Score',
      icon: '🏆',
      value: analytics.orgScore,
      description: 'Performance',
      color: 'purple',
      suffix: '/100'
    },
    {
      key: 'revenue',
      label: 'Revenue',
      icon: '💰',
      value: analytics.revenue || 152000,
      description: 'This month',
      color: 'emerald',
      prefix: '$'
    },
    {
      key: 'activeDeals',
      label: 'Active Deals',
      icon: '🤝',
      value: analytics.activeDeals || 34,
      description: 'In progress',
      color: 'indigo'
    },
    {
      key: 'conversionRate',
      label: 'Conversion Rate',
      icon: '📈',
      value: analytics.conversionRate || 23.5,
      description: 'Lead to deal',
      color: 'pink',
      suffix: '%'
    },
    {
      key: 'teamMembers',
      label: 'Team Members',
      icon: '👨‍👩‍👧‍👦',
      value: analytics.teamMembers || 12,
      description: 'Active users',
      color: 'yellow'
    }
  ];

  // Get visible metrics based on user selection
  const getVisibleMetrics = () => {
    return getAllMetrics().filter(metric => cardSettings.visibleMetrics[metric.key as keyof typeof cardSettings.visibleMetrics]);
  };

  // Get theme-based styles
  const getThemeStyles = () => {
    switch (cardSettings.colorTheme) {
      case 'dark':
        return {
          cardBg: 'bg-gray-800',
          titleColor: 'text-white',
          textColor: 'text-gray-200',
          numberColor: 'text-white',
          descColor: 'text-gray-400'
        };
      case 'minimal':
        return {
          cardBg: 'bg-gray-50',
          titleColor: 'text-gray-800',
          textColor: 'text-gray-600',
          numberColor: 'text-gray-800',
          descColor: 'text-gray-500'
        };
      default:
        return {
          cardBg: 'bg-white',
          titleColor: 'text-gray-700',
          textColor: 'text-gray-700',
          numberColor: '', // Will use color-specific classes
          descColor: 'text-gray-500'
        };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <div className={`${themeStyles.cardBg} rounded-lg shadow-lg p-6 h-full flex flex-col border-4 border-gray-300 relative`}>
      {/* Header with title and settings gear */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-1">
          {cardSettings.showTitle && (
            <h3 className={`text-lg font-bold ${themeStyles.titleColor}`}>Dashboard Metrics</h3>
          )}
          
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'online' ? 'bg-green-500' :
              connectionStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span className={`text-xs ${
              connectionStatus === 'online' ? 'text-green-600' :
              connectionStatus === 'syncing' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {connectionStatus === 'online' ? 'Live' :
               connectionStatus === 'syncing' ? 'Syncing...' :
               'Offline'}
            </span>
            <span className="text-xs text-gray-400">
              {lastSync.toLocaleTimeString()}
            </span>
          </div>
        </div>
        
        {/* Settings Gear Icon */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors ml-2"
          title="Card Settings"
        >
          <span className="text-lg">⚙️</span>
        </button>
      </div>

      {/* Settings Dropdown */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50 p-4 w-80 max-h-96 overflow-y-auto">
          <h4 className="font-bold text-sm mb-3">Card Settings</h4>
          
          {/* Visible Metrics Section */}
          <div className="mb-4 border-b border-gray-200 pb-3">
            <h5 className="font-semibold text-xs mb-2 text-gray-700">Visible Metrics (Select up to 4):</h5>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {getAllMetrics().map(metric => (
                <label key={metric.key} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={cardSettings.visibleMetrics[metric.key as keyof typeof cardSettings.visibleMetrics]}
                    onChange={(e) => {
                      const visibleCount = Object.values(cardSettings.visibleMetrics).filter(Boolean).length;
                      if (e.target.checked && visibleCount >= 4) {
                        alert('Maximum 4 metrics can be displayed');
                        return;
                      }
                      handleMetricVisibilityChange(metric.key, e.target.checked);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{metric.icon}</span>
                  <span className="text-xs">{metric.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Show Title Toggle */}
          <div className="mb-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={cardSettings.showTitle}
                onChange={(e) => handleSettingsChange('showTitle', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Title</span>
            </label>
          </div>

          {/* Show Descriptions Toggle */}
          <div className="mb-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={cardSettings.showDescriptions}
                onChange={(e) => handleSettingsChange('showDescriptions', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Descriptions</span>
            </label>
          </div>

          {/* Color Theme Selection */}
          <div className="mb-3">
            <label className="block text-sm mb-1">Color Theme:</label>
            <select
              value={cardSettings.colorTheme}
              onChange={(e) => handleSettingsChange('colorTheme', e.target.value)}
              className="w-full p-1 border border-gray-300 rounded text-sm"
            >
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          {/* Border Style Selection */}
          <div className="mb-3">
            <label className="block text-sm mb-1">Border Style:</label>
            <select
              value={cardSettings.borderStyle}
              onChange={(e) => handleSettingsChange('borderStyle', e.target.value)}
              className="w-full p-1 border border-gray-300 rounded text-sm"
            >
              <option value="bold">Bold</option>
              <option value="thin">Thin</option>
              <option value="none">None</option>
            </select>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowSettings(false)}
            className="w-full mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      )}
      
      {/* Dynamic Grid layout based on visible metrics */}
      <div className={`grid gap-4 flex-1 ${
        getVisibleMetrics().length === 1 ? 'grid-cols-1 grid-rows-1' :
        getVisibleMetrics().length === 2 ? 'grid-cols-2 grid-rows-1' :
        getVisibleMetrics().length === 3 ? 'grid-cols-2 grid-rows-2' :
        'grid-cols-2 grid-rows-2'
      }`}>
        {getVisibleMetrics().map((metric, index) => (
          <div 
            key={metric.key}
            className={`${cardSettings.colorTheme === 'minimal' ? 'bg-white' : `bg-${metric.color}-50`} rounded-lg p-4 flex flex-col justify-center items-center text-center h-full w-full ${
              cardSettings.borderStyle === 'bold' ? `border-4 border-${metric.color}-500` :
              cardSettings.borderStyle === 'thin' ? `border-2 border-${metric.color}-500` :
              cardSettings.borderStyle === 'none' ? 'border-0' : `border-4 border-${metric.color}-500`
            } ${getVisibleMetrics().length === 3 && index === 2 ? 'col-span-2' : ''}`}
          >
            <span className="text-2xl mb-2">{metric.icon}</span>
            <h4 className={`font-semibold ${themeStyles.textColor} text-sm`}>{metric.label}</h4>
            <div className={`text-2xl font-bold ${themeStyles.numberColor || `text-${metric.color}-600`}`}>
              {metric.prefix || ''}{metric.value}{metric.suffix || ''}
            </div>
            {cardSettings.showDescriptions && (
              <p className={`text-xs ${themeStyles.descColor} mt-1`}>{metric.description}</p>
            )}
          </div>
        ))}
        
        {/* Fill empty slots if less than 4 metrics */}
        {getVisibleMetrics().length < 4 && getVisibleMetrics().length !== 3 && Array.from({ length: 4 - getVisibleMetrics().length }).map((_, index) => (
          <div key={`empty-${index}`} className="bg-gray-100 rounded-lg p-4 flex flex-col justify-center items-center text-center h-full w-full border-2 border-dashed border-gray-300">
            <span className="text-2xl mb-2 text-gray-400">➕</span>
            <p className="text-xs text-gray-400">Add Metric</p>
            <p className="text-xs text-gray-300 mt-1">Use settings ⚙️</p>
          </div>
        ))}
      </div>
    </div>
  );
}