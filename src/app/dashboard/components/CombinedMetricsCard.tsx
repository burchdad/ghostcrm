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
  const [dataRefreshing, setDataRefreshing] = useState(false);
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
    },
    // New theme and visibility settings
    theme: 'green', // 'orange', 'blue', 'green', 'purple', 'pink', 'gray'
    borderStyleNew: 'solid', // 'solid', 'dashed', 'dotted', 'gradient'
    showLiveStatus: true,
    showCardTitle: true,
    dataSource: 'demo', // 'demo' or 'live'
    // Individual metric color customization
    metricColors: {
      messages: 'green',
      aiAlerts: 'blue', 
      totalLeads: 'orange',
      orgScore: 'purple',
      revenue: 'emerald',
      activeDeals: 'indigo',
      conversionRate: 'pink',
      teamMembers: 'yellow'
    }
  });

  // Separate state for pending changes that require apply button
  const [pendingSettings, setPendingSettings] = useState({
    dataSource: 'demo'
  });

  const handleSettingsChange = (setting: string, value: any) => {
    if (setting === 'dataSource') {
      // For data source, update pending state only
      setPendingSettings(prev => ({
        ...prev,
        [setting]: value
      }));
    } else {
      // For other settings, apply immediately
      setCardSettings(prev => ({
        ...prev,
        [setting]: value
      }));
    }
  };

  const applyDataSourceChanges = () => {
    setDataRefreshing(true);
    setConnectionStatus('syncing');
    
    // Simulate data source change delay
    setTimeout(() => {
      setCardSettings(prev => ({
        ...prev,
        dataSource: pendingSettings.dataSource
      }));
      setLastSync(new Date());
      setDataRefreshing(false);
      setConnectionStatus('online');
    }, 1500); // 1.5 second delay to show loading state
  };

  // Theme helper functions
  const getThemeColors = (theme: string) => {
    const themes = {
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        topBorder: 'border-t-orange-500',
        headerBg: 'from-orange-100 to-orange-200',
        accent: 'bg-orange-500',
        accentHover: 'hover:bg-orange-600',
        text: 'text-orange-600',
        buttonBg: 'bg-orange-500',
        buttonHover: 'hover:bg-orange-600'
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        topBorder: 'border-t-blue-500',
        headerBg: 'from-blue-100 to-blue-200',
        accent: 'bg-blue-500',
        accentHover: 'hover:bg-blue-600',
        text: 'text-blue-600',
        buttonBg: 'bg-blue-500',
        buttonHover: 'hover:bg-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        topBorder: 'border-t-green-500',
        headerBg: 'from-green-100 to-green-200',
        accent: 'bg-green-500',
        accentHover: 'hover:bg-green-600',
        text: 'text-green-600',
        buttonBg: 'bg-green-500',
        buttonHover: 'hover:bg-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        topBorder: 'border-t-purple-500',
        headerBg: 'from-purple-100 to-purple-200',
        accent: 'bg-purple-500',
        accentHover: 'hover:bg-purple-600',
        text: 'text-purple-600',
        buttonBg: 'bg-purple-500',
        buttonHover: 'hover:bg-purple-600'
      },
      pink: {
        bg: 'bg-pink-50',
        border: 'border-pink-200',
        topBorder: 'border-t-pink-500',
        headerBg: 'from-pink-100 to-pink-200',
        accent: 'bg-pink-500',
        accentHover: 'hover:bg-pink-600',
        text: 'text-pink-600',
        buttonBg: 'bg-pink-500',
        buttonHover: 'hover:bg-pink-600'
      },
      gray: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        topBorder: 'border-t-gray-500',
        headerBg: 'from-gray-100 to-gray-200',
        accent: 'bg-gray-500',
        accentHover: 'hover:bg-gray-600',
        text: 'text-gray-600',
        buttonBg: 'bg-gray-500',
        buttonHover: 'hover:bg-gray-600'
      }
    };
    return themes[theme as keyof typeof themes] || themes.green;
  };

  const getBorderStyle = (style: string) => {
    switch (style) {
      case 'dashed': return 'border-dashed border-2';
      case 'dotted': return 'border-dotted border-2';
      case 'gradient': return 'border-4 bg-gradient-to-br';
      default: return 'border-2';
    }
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

  const handleMetricColorChange = (metric: string, color: string) => {
    setCardSettings(prev => ({
      ...prev,
      metricColors: {
        ...prev.metricColors,
        [metric]: color
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

  // Force re-render when data source changes
  useEffect(() => {
    if (cardSettings.dataSource) {
      setLastSync(new Date());
    }
  }, [cardSettings.dataSource]);

  // Get all available metrics with their data
  // Generate data based on source setting
  const generateMetricValue = (baseValue: number | undefined, demoValue: number, liveMultiplier: number = 1) => {
    if (cardSettings.dataSource === 'live') {
      // For live data, use base value if available, otherwise generate realistic live data
      return baseValue || Math.floor(demoValue * liveMultiplier * (0.8 + Math.random() * 0.4));
    } else {
      // For demo data, use the demo value or base value
      return baseValue || demoValue;
    }
  };

  const getAllMetrics = () => [
    {
      key: 'messages',
      label: 'Messages',
      icon: '💬',
      value: generateMetricValue(analytics.messageCount, analytics.messageCount || 247, 0.7),
      description: 'Active conversations',
      color: cardSettings.metricColors.messages
    },
    {
      key: 'aiAlerts',
      label: 'AI Alerts',
      icon: '🔔',
      value: generateMetricValue(analytics.alertCount, analytics.alertCount || 12, 1.2),
      description: 'System notifications',
      color: cardSettings.metricColors.aiAlerts
    },
    {
      key: 'totalLeads',
      label: 'Total Leads',
      icon: '👥',
      value: generateMetricValue(analytics.totalLeads, analytics.totalLeads || 1247, 0.6),
      description: 'In pipeline',
      color: cardSettings.metricColors.totalLeads
    },
    {
      key: 'orgScore',
      label: 'Org Score',
      icon: '🏆',
      value: generateMetricValue(analytics.orgScore, analytics.orgScore || 87, 1.1),
      description: 'Performance',
      color: cardSettings.metricColors.orgScore,
      suffix: '/100'
    },
    {
      key: 'revenue',
      label: 'Revenue',
      icon: '💰',
      value: generateMetricValue(analytics.revenue, 152000, 0.8),
      description: 'This month',
      color: cardSettings.metricColors.revenue,
      prefix: '$'
    },
    {
      key: 'activeDeals',
      label: 'Active Deals',
      icon: '🤝',
      value: generateMetricValue(analytics.activeDeals, 34, 1.3),
      description: 'In progress',
      color: cardSettings.metricColors.activeDeals
    },
    {
      key: 'conversionRate',
      label: 'Conversion Rate',
      icon: '📈',
      value: parseFloat(generateMetricValue(analytics.conversionRate, 23.5, 0.9).toFixed(1)),
      description: 'Lead to deal',
      color: cardSettings.metricColors.conversionRate,
      suffix: '%'
    },
    {
      key: 'teamMembers',
      label: 'Team Members',
      icon: '👨‍👩‍👧‍👦',
      value: generateMetricValue(analytics.teamMembers, 12, 1.1),
      description: 'Active users',
      color: cardSettings.metricColors.teamMembers
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

  const themeColors = getThemeColors(cardSettings.theme);

  return (
    <div className={`${themeColors.bg} rounded-xl shadow-lg ${getBorderStyle(cardSettings.borderStyleNew)} ${themeColors.border} border-t-4 ${themeColors.topBorder} p-6 hover:shadow-xl transition-all duration-300 h-full relative`}>
      {/* Header with title and settings gear */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-1">
          {cardSettings.showCardTitle && (
            <h3 className="text-lg font-bold text-black">Dashboard Metrics</h3>
          )}
          
          {/* Connection Status Indicator */}
          {cardSettings.showLiveStatus && (
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
          )}
        </div>
        
        {/* Settings Gear Icon */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-full transition-colors ml-2 ${themeColors.accentHover.replace('hover:bg-', 'hover:bg-').replace('-600', '-100')}`}
          title="Card Settings"
        >
          <span className="text-lg">⚙️</span>
        </button>
      </div>

      {/* Settings Dropdown */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl shadow-2xl z-50 p-6 w-96 max-h-[500px] overflow-y-auto backdrop-blur-sm">
          <div className="flex items-center justify-between mb-5">
            <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              Card Settings
            </h4>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <span className="text-gray-500">✕</span>
            </button>
          </div>
          
          {/* Theme Customization */}
          <div className="mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-lg">🎨</span>
              Theme & Style
            </h5>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-2 font-medium text-gray-600">Card Theme:</label>
                <select
                  value={cardSettings.theme}
                  onChange={(e) => handleSettingsChange('theme', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="green">🟢 Green</option>
                  <option value="blue">🔵 Blue</option>
                  <option value="orange">🟠 Orange</option>
                  <option value="purple">🟣 Purple</option>
                  <option value="pink">🩷 Pink</option>
                  <option value="gray">⚫ Gray</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs mb-2 font-medium text-gray-600">Border Style:</label>
                <select
                  value={cardSettings.borderStyleNew}
                  onChange={(e) => handleSettingsChange('borderStyleNew', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="solid">━ Solid</option>
                  <option value="dashed">┅ Dashed</option>
                  <option value="dotted">⋯ Dotted</option>
                  <option value="gradient">🌈 Gradient</option>
                </select>
              </div>
            </div>
          </div>

          {/* Visibility Controls */}
          <div className="mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-lg">👁️</span>
              Visibility Options
            </h5>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cardSettings.showCardTitle}
                  onChange={(e) => handleSettingsChange('showCardTitle', e.target.checked)}
                  className="rounded-md border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Show Card Title</span>
              </label>
              
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cardSettings.showLiveStatus}
                  onChange={(e) => handleSettingsChange('showLiveStatus', e.target.checked)}
                  className="rounded-md border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Show Live Status</span>
              </label>
              
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cardSettings.showDescriptions}
                  onChange={(e) => handleSettingsChange('showDescriptions', e.target.checked)}
                  className="rounded-md border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Show Descriptions</span>
              </label>
            </div>
          </div>

          {/* Data Source Control */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
            <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-lg">🔄</span>
              Data Source
            </h5>
            
            <div className="mb-3">
              <label className="block text-xs mb-2 font-medium text-gray-600">Source Type:</label>
              <select
                value={pendingSettings.dataSource}
                onChange={(e) => handleSettingsChange('dataSource', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="demo">🎭 Demo Data</option>
                <option value="live">📡 Live Data</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={applyDataSourceChanges}
                disabled={dataRefreshing}
                className={`flex-1 px-4 py-2 text-white rounded-lg text-sm font-medium transition-all hover:shadow-md ${themeColors.buttonBg} ${themeColors.buttonHover} ${dataRefreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {dataRefreshing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Switching...
                  </div>
                ) : (
                  'Apply Data Source'
                )}
              </button>
              
              {pendingSettings.dataSource !== cardSettings.dataSource && !dataRefreshing && (
                <div className="flex items-center text-xs text-orange-600 bg-orange-100 px-2 rounded-lg">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
                  Pending
                </div>
              )}
              
              {dataRefreshing && (
                <div className="flex items-center text-xs text-blue-600 bg-blue-100 px-2 rounded-lg">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                  Updating...
                </div>
              )}
            </div>
          </div>

          {/* Visible Metrics Section */}
          <div className="mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-lg">📊</span>
              Visible Metrics <span className="text-xs text-gray-500">(Select up to 4)</span>
            </h5>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {getAllMetrics().map(metric => (
                <label key={metric.key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
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
                    className="rounded-md border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-lg">{metric.icon}</span>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                    <div className="text-xs text-gray-500">{metric.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full bg-${metric.color}-500`}></div>
                    <select
                      value={metric.color}
                      onChange={(e) => handleMetricColorChange(metric.key, e.target.value)}
                      className="text-xs border border-gray-300 rounded p-1 focus:ring-1 focus:ring-green-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="red">🔴 Red</option>
                      <option value="orange">🟠 Orange</option>
                      <option value="yellow">🟡 Yellow</option>
                      <option value="green">🟢 Green</option>
                      <option value="blue">🔵 Blue</option>
                      <option value="indigo">🟣 Indigo</option>
                      <option value="purple">🟪 Purple</option>
                      <option value="pink">🩷 Pink</option>
                      <option value="emerald">💚 Emerald</option>
                      <option value="teal">🩵 Teal</option>
                      <option value="cyan">🔷 Cyan</option>
                      <option value="gray">⚫ Gray</option>
                    </select>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowSettings(false)}
            className={`w-full px-4 py-3 text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg ${themeColors.buttonBg} ${themeColors.buttonHover}`}
          >
            Save & Close Settings
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
            key={`${metric.key}-${cardSettings.dataSource}-${lastSync.getTime()}`}
            className={`${cardSettings.colorTheme === 'minimal' ? 'bg-white' : `bg-${metric.color}-50`} rounded-lg p-4 flex flex-col justify-center items-center text-center h-full w-full ${
              cardSettings.borderStyle === 'bold' ? `border-4 border-${metric.color}-500` :
              cardSettings.borderStyle === 'thin' ? `border-2 border-${metric.color}-500` :
              cardSettings.borderStyle === 'none' ? 'border-0' : `border-4 border-${metric.color}-500`
            } ${getVisibleMetrics().length === 3 && index === 2 ? 'col-span-2' : ''} ${
              dataRefreshing ? 'opacity-70 animate-pulse' : ''
            }`}
          >
            <span className="text-2xl mb-2">{metric.icon}</span>
            <h4 className="font-semibold text-gray-700 text-sm">{metric.label}</h4>
            <div className={`text-2xl font-bold text-${metric.color}-600`}>
              {metric.prefix || ''}{metric.value}{metric.suffix || ''}
            </div>
            {cardSettings.showDescriptions && (
              <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
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