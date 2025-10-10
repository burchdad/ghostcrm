"use client";
import { useEffect, useState } from "react";

export default function CampaignAnalytics({ orgId = "1" }) {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'syncing'>('online');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [dataRefreshing, setDataRefreshing] = useState(false);
  const [cardSettings, setCardSettings] = useState({
    showTableHeaders: true,
    compactView: false,
    autoRefresh: true,
    refreshInterval: 30, // seconds
    showPerformanceColors: true,
    hideZeroValues: false,
    sortBy: 'campaign_name', // 'campaign_name', 'sent_count', 'opened_count', etc.
    sortOrder: 'asc', // 'asc' or 'desc'
    // Column visibility controls
    visibleColumns: {
      campaign_name: true,
      sent_count: true,
      opened_count: true,
      clicked_count: true,
      called_count: true,
      converted_count: true,
      error_count: true
    },
    // Search and filter settings
    searchTerm: '',
    performanceThreshold: {
      minSent: 0,
      minOpened: 0,
      maxErrors: 999
    },
    // New theme and visibility settings
    theme: 'orange', // 'orange', 'blue', 'green', 'purple', 'pink', 'gray'
    borderStyle: 'solid', // 'solid', 'dashed', 'dotted', 'gradient'
    showLiveStatus: true,
    showCardTitle: true,
    dataSource: 'demo' // 'demo' or 'live'
  });

  // Separate state for pending changes that require apply button
  const [pendingSettings, setPendingSettings] = useState({
    sortBy: 'campaign_name',
    sortOrder: 'asc',
    dataSource: 'demo'
  });

  const handleSettingsChange = (setting: string, value: any) => {
    if (setting === 'sortBy' || setting === 'sortOrder' || setting === 'dataSource') {
      // For sorting and data source, update pending state only
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

  // Dedicated handler for column visibility changes
  const handleColumnVisibilityChange = (column: string, visible: boolean) => {
    console.log(`Column visibility change: ${column} = ${visible}`);
    console.log('Current visibleColumns:', cardSettings.visibleColumns);
    setCardSettings(prev => {
      const newSettings = {
        ...prev,
        visibleColumns: {
          ...prev.visibleColumns,
          [column]: visible
        }
      };
      console.log('New visibleColumns:', newSettings.visibleColumns);
      return newSettings;
    });
  };

  const applySortChanges = () => {
    setCardSettings(prev => ({
      ...prev,
      sortBy: pendingSettings.sortBy,
      sortOrder: pendingSettings.sortOrder
    }));
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
      setLastUpdate(new Date());
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
    return themes[theme as keyof typeof themes] || themes.orange;
  };

  const getBorderStyle = (style: string) => {
    switch (style) {
      case 'dashed': return 'border-dashed';
      case 'dotted': return 'border-dotted';
      case 'gradient': return 'border-2 bg-gradient-to-br';
      default: return 'border';
    }
  };

  // Generate demo data based on data source
  const generateCampaignData = () => {
    if (cardSettings.dataSource === 'demo') {
      return [
        { campaign_id: 1, campaign_name: "Email Campaign Q4", sent_count: 150, opened_count: 45, clicked_count: 12, called_count: 8, converted_count: 3, error_count: 2 },
        { campaign_id: 2, campaign_name: "Social Media Outreach", sent_count: 200, opened_count: 60, clicked_count: 18, called_count: 12, converted_count: 5, error_count: 1 },
        { campaign_id: 3, campaign_name: "Holiday Special Campaign", sent_count: 320, opened_count: 96, clicked_count: 28, called_count: 15, converted_count: 8, error_count: 3 },
        { campaign_id: 4, campaign_name: "Product Launch Announcement", sent_count: 275, opened_count: 82, clicked_count: 22, called_count: 18, converted_count: 12, error_count: 4 },
        { campaign_id: 5, campaign_name: "Customer Retention Drive", sent_count: 180, opened_count: 54, clicked_count: 16, called_count: 9, converted_count: 6, error_count: 1 }
      ];
    } else {
      // Generate live-looking data with some variation
      return [
        { campaign_id: 1, campaign_name: "Live Campaign Alpha", sent_count: Math.floor(120 + Math.random() * 60), opened_count: Math.floor(30 + Math.random() * 25), clicked_count: Math.floor(8 + Math.random() * 10), called_count: Math.floor(5 + Math.random() * 8), converted_count: Math.floor(2 + Math.random() * 4), error_count: Math.floor(Math.random() * 3) },
        { campaign_id: 2, campaign_name: "Live Campaign Beta", sent_count: Math.floor(160 + Math.random() * 80), opened_count: Math.floor(40 + Math.random() * 30), clicked_count: Math.floor(12 + Math.random() * 12), called_count: Math.floor(8 + Math.random() * 10), converted_count: Math.floor(3 + Math.random() * 5), error_count: Math.floor(Math.random() * 2) },
        { campaign_id: 3, campaign_name: "Real-time Campaign Gamma", sent_count: Math.floor(250 + Math.random() * 100), opened_count: Math.floor(65 + Math.random() * 40), clicked_count: Math.floor(18 + Math.random() * 15), called_count: Math.floor(10 + Math.random() * 12), converted_count: Math.floor(5 + Math.random() * 7), error_count: Math.floor(Math.random() * 4) },
        { campaign_id: 4, campaign_name: "Active Outreach Delta", sent_count: Math.floor(190 + Math.random() * 70), opened_count: Math.floor(50 + Math.random() * 35), clicked_count: Math.floor(14 + Math.random() * 13), called_count: Math.floor(12 + Math.random() * 15), converted_count: Math.floor(7 + Math.random() * 8), error_count: Math.floor(Math.random() * 5) }
      ];
    }
  };

  // Function to process analytics data based on settings
  const getProcessedAnalytics = () => {
    let processedData = cardSettings.dataSource === 'demo' ? 
      (analytics.length > 0 ? [...analytics] : generateCampaignData()) : 
      generateCampaignData();

    // Apply search filter
    if (cardSettings.searchTerm) {
      processedData = processedData.filter(row => 
        row.campaign_name.toLowerCase().includes(cardSettings.searchTerm.toLowerCase())
      );
    }

    // Apply performance threshold filters
    processedData = processedData.filter(row => 
      row.sent_count >= cardSettings.performanceThreshold.minSent &&
      row.opened_count >= cardSettings.performanceThreshold.minOpened &&
      row.error_count <= cardSettings.performanceThreshold.maxErrors
    );

    // Filter out zero values if enabled
    if (cardSettings.hideZeroValues) {
      processedData = processedData.filter(row => 
        row.sent_count > 0 || row.opened_count > 0 || row.clicked_count > 0 || 
        row.called_count > 0 || row.converted_count > 0
      );
    }

    // Sort data
    processedData.sort((a, b) => {
      let aVal = a[cardSettings.sortBy];
      let bVal = b[cardSettings.sortBy];
      
      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return cardSettings.sortOrder === 'asc' ? 1 : -1;
      if (bVal == null) return cardSettings.sortOrder === 'asc' ? -1 : 1;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
        return cardSettings.sortOrder === 'asc' ? comparison : -comparison;
      } else {
        // Convert to numbers for numeric comparison
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
        const comparison = aVal - bVal;
        return cardSettings.sortOrder === 'asc' ? comparison : -comparison;
      }
    });

    console.log('Processed analytics:', {
      original: analytics.length,
      filtered: processedData.length,
      sortBy: cardSettings.sortBy,
      sortOrder: cardSettings.sortOrder,
      compactView: cardSettings.compactView
    });

    return processedData;
  };

  useEffect(() => {
    // Simulate connection status
    setConnectionStatus('syncing');
    
    fetch(`/api/campaigns/analytics?orgId=${orgId}`)
      .then(res => res.json())
      .then(data => {
        // Ensure analytics is always an array
        const analyticsData = Array.isArray(data.analytics) ? data.analytics : [];
        setAnalytics(analyticsData);
        setLoading(false);
        setConnectionStatus('online');
        setLastUpdate(new Date());
      })
      .catch(err => {
        setError(String(err));
        setLoading(false);
        setConnectionStatus('offline');
      });

    if (!cardSettings.autoRefresh) return;

    // Simulate periodic updates
    const interval = setInterval(() => {
      setConnectionStatus('syncing');
      setTimeout(() => {
        setConnectionStatus('online');
        setLastUpdate(new Date());
      }, 1200);
    }, cardSettings.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [orgId, cardSettings.autoRefresh, cardSettings.refreshInterval]);

  // Handle data source changes
  useEffect(() => {
    if (cardSettings.dataSource) {
      setLastUpdate(new Date());
    }
  }, [cardSettings.dataSource]);

  if (loading) return (
    <div className="bg-orange-50 rounded-xl shadow-lg border border-gray-100 border-t-4 border-t-orange-500 p-6 hover:shadow-xl transition-shadow duration-300 h-full relative">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 border-t-4 border-t-red-500 rounded-xl shadow-lg p-6 h-full relative">
      <div className="text-red-600 font-medium">Error loading analytics</div>
      <div className="text-red-500 text-sm mt-1">{error}</div>
    </div>
  );
  
  const themeColors = getThemeColors(cardSettings.theme);
  
  return (
    <div className={`${themeColors.bg} rounded-xl shadow-lg ${getBorderStyle(cardSettings.borderStyle)} ${themeColors.border} border-t-4 ${themeColors.topBorder} p-6 hover:shadow-xl transition-all duration-300 h-full relative`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {cardSettings.showCardTitle && (
            <h2 className="text-lg font-bold text-black">
              📧 Campaign Analytics
            </h2>
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
                 connectionStatus === 'syncing' ? 'Sync' :
                 'Offline'}
              </span>
              <span className="text-xs text-gray-400">
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* Settings Gear Icon */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-full transition-colors ${themeColors.accentHover.replace('hover:bg-', 'hover:bg-').replace('-600', '-100')}`}
          title="Campaign Settings"
        >
          <span className="text-lg">⚙️</span>
        </button>
      </div>

      {/* Settings Dropdown */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl shadow-2xl z-50 p-6 w-96 max-h-[600px] overflow-y-auto backdrop-blur-sm">
          <div className="flex items-center justify-between mb-5">
            <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <span className="text-xl">📧</span>
              Campaign Settings
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
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="orange">🟠 Orange</option>
                  <option value="blue">🔵 Blue</option>
                  <option value="green">🟢 Green</option>
                  <option value="purple">🟣 Purple</option>
                  <option value="pink">🩷 Pink</option>
                  <option value="gray">⚫ Gray</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs mb-2 font-medium text-gray-600">Border Style:</label>
                <select
                  value={cardSettings.borderStyle}
                  onChange={(e) => handleSettingsChange('borderStyle', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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
                  className="rounded-md border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Show Card Title</span>
              </label>
              
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cardSettings.showLiveStatus}
                  onChange={(e) => handleSettingsChange('showLiveStatus', e.target.checked)}
                  className="rounded-md border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Show Live Status</span>
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

          {/* Display Options */}
          <div className="mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-lg">📋</span>
              Table Display Options
            </h5>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cardSettings.showTableHeaders}
                  onChange={(e) => handleSettingsChange('showTableHeaders', e.target.checked)}
                  className="rounded-md border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Show Table Headers</span>
              </label>
              
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cardSettings.compactView}
                  onChange={(e) => handleSettingsChange('compactView', e.target.checked)}
                  className="rounded-md border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Compact View</span>
              </label>
              
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cardSettings.showPerformanceColors}
                  onChange={(e) => handleSettingsChange('showPerformanceColors', e.target.checked)}
                  className="rounded-md border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Performance Colors</span>
              </label>
              
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cardSettings.hideZeroValues}
                  onChange={(e) => handleSettingsChange('hideZeroValues', e.target.checked)}
                  className="rounded-md border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Hide Zero Values</span>
              </label>
            </div>
          </div>

          {/* Column Visibility Controls */}
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 shadow-sm">
            <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-lg">👁️‍🗨️</span>
              Column Visibility
            </h5>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Debug info */}
              <div className="col-span-2 mb-2 p-2 bg-gray-100 rounded text-xs">
                <strong>Debug:</strong> {JSON.stringify(cardSettings.visibleColumns)}
              </div>
              
              <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:bg-opacity-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cardSettings.visibleColumns.campaign_name}
                  onChange={(e) => handleColumnVisibilityChange('campaign_name', e.target.checked)}
                  className="rounded-md border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-xs font-medium text-gray-700">📝 Campaign</span>
              </label>
              
              <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:bg-opacity-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cardSettings.visibleColumns.sent_count}
                  onChange={(e) => handleColumnVisibilityChange('sent_count', e.target.checked)}
                  className="rounded-md border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-xs font-medium text-gray-700">📤 Sent</span>
              </label>
              
              <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:bg-opacity-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cardSettings.visibleColumns.opened_count}
                  onChange={(e) => handleColumnVisibilityChange('opened_count', e.target.checked)}
                  className="rounded-md border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-xs font-medium text-gray-700">📬 Opened</span>
              </label>
              
              <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:bg-opacity-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cardSettings.visibleColumns.clicked_count}
                  onChange={(e) => handleColumnVisibilityChange('clicked_count', e.target.checked)}
                  className="rounded-md border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-xs font-medium text-gray-700">👆 Clicked</span>
              </label>
              
              <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:bg-opacity-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cardSettings.visibleColumns.called_count}
                  onChange={(e) => handleColumnVisibilityChange('called_count', e.target.checked)}
                  className="rounded-md border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-xs font-medium text-gray-700">📞 Called</span>
              </label>
              
              <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:bg-opacity-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cardSettings.visibleColumns.converted_count}
                  onChange={(e) => handleColumnVisibilityChange('converted_count', e.target.checked)}
                  className="rounded-md border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-xs font-medium text-gray-700">✅ Converted</span>
              </label>
              
              <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:bg-opacity-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cardSettings.visibleColumns.error_count}
                  onChange={(e) => handleColumnVisibilityChange('error_count', e.target.checked)}
                  className="rounded-md border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-xs font-medium text-gray-700">❌ Errors</span>
              </label>
            </div>
          </div>

          {/* Auto Refresh Settings */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
            <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-lg">⏱️</span>
              Auto Refresh Settings
            </h5>
            
            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:bg-opacity-50 transition-colors mb-3">
              <input
                type="checkbox"
                checked={cardSettings.autoRefresh}
                onChange={(e) => handleSettingsChange('autoRefresh', e.target.checked)}
                className="rounded-md border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">Enable Auto Refresh</span>
            </label>
            
            {cardSettings.autoRefresh && (
              <div className="pl-6 border-l-2 border-green-300">
                <label className="block text-xs mb-2 font-medium text-gray-600">Refresh Interval:</label>
                <select
                  value={cardSettings.refreshInterval}
                  onChange={(e) => handleSettingsChange('refreshInterval', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value={15}>⏰ 15 seconds</option>
                  <option value={30}>⏰ 30 seconds</option>
                  <option value={60}>⏰ 1 minute</option>
                  <option value={120}>⏰ 2 minutes</option>
                  <option value={300}>⏰ 5 minutes</option>
                </select>
              </div>
            )}
          </div>

          {/* Sorting Options */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 shadow-sm">
            <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-lg">🔽</span>
              Sort & Filter Options
            </h5>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs mb-2 font-medium text-gray-600">Sort By:</label>
                <select
                  value={pendingSettings.sortBy}
                  onChange={(e) => handleSettingsChange('sortBy', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="campaign_name">📝 Campaign Name</option>
                  <option value="sent_count">📤 Sent Count</option>
                  <option value="opened_count">📬 Opened Count</option>
                  <option value="clicked_count">👆 Clicked Count</option>
                  <option value="called_count">📞 Called Count</option>
                  <option value="converted_count">✅ Converted Count</option>
                  <option value="error_count">❌ Error Count</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs mb-2 font-medium text-gray-600">Order:</label>
                <select
                  value={pendingSettings.sortOrder}
                  onChange={(e) => handleSettingsChange('sortOrder', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="asc">⬆️ Ascending</option>
                  <option value="desc">⬇️ Descending</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={applySortChanges}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-all hover:shadow-md"
              >
                Apply Sort Changes
              </button>
              
              {(pendingSettings.sortBy !== cardSettings.sortBy || 
                pendingSettings.sortOrder !== cardSettings.sortOrder) && (
                <div className="flex items-center text-xs text-orange-600 bg-orange-100 px-2 rounded-lg">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
                  Pending
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Filtering System */}
          <div className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200 shadow-sm">
            <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-lg">🔍</span>
              Search & Filters
            </h5>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-2 font-medium text-gray-600">Search Campaigns:</label>
                <input
                  type="text"
                  value={cardSettings.searchTerm}
                  onChange={(e) => handleSettingsChange('searchTerm', e.target.value)}
                  placeholder="Type campaign name..."
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs mb-1 font-medium text-gray-600">Min Sent:</label>
                  <input
                    type="number"
                    value={cardSettings.performanceThreshold.minSent}
                    onChange={(e) => handleSettingsChange('performanceThreshold', {
                      ...cardSettings.performanceThreshold,
                      minSent: parseInt(e.target.value) || 0
                    })}
                    className="w-full p-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs mb-1 font-medium text-gray-600">Min Opened:</label>
                  <input
                    type="number"
                    value={cardSettings.performanceThreshold.minOpened}
                    onChange={(e) => handleSettingsChange('performanceThreshold', {
                      ...cardSettings.performanceThreshold,
                      minOpened: parseInt(e.target.value) || 0
                    })}
                    className="w-full p-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs mb-1 font-medium text-gray-600">Max Errors:</label>
                  <input
                    type="number"
                    value={cardSettings.performanceThreshold.maxErrors}
                    onChange={(e) => handleSettingsChange('performanceThreshold', {
                      ...cardSettings.performanceThreshold,
                      maxErrors: parseInt(e.target.value) || 999
                    })}
                    className="w-full p-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
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
      
      <div className={`overflow-hidden rounded-lg border border-gray-200 overflow-y-auto ${cardSettings.compactView ? 'max-h-40' : 'max-h-80'}`}>
        <table className={`w-full ${cardSettings.compactView ? 'text-xs' : 'text-xs'}`}>
          {cardSettings.showTableHeaders && (
            <thead className="sticky top-0">
              <tr className={`bg-gradient-to-r ${themeColors.headerBg} border-b border-gray-200`}>
                {cardSettings.visibleColumns.campaign_name && (
                  <th className={`text-left font-semibold text-gray-700 ${cardSettings.compactView ? 'p-1 text-xs leading-tight' : 'p-3'}`}>📝 Campaign</th>
                )}
                {cardSettings.visibleColumns.sent_count && (
                  <th className={`text-left font-semibold text-gray-700 ${cardSettings.compactView ? 'p-1 text-xs leading-tight' : 'p-3'}`}>📤 Sent</th>
                )}
                {cardSettings.visibleColumns.opened_count && (
                  <th className={`text-left font-semibold text-gray-700 ${cardSettings.compactView ? 'p-1 text-xs leading-tight' : 'p-3'}`}>📬 Opened</th>
                )}
                {cardSettings.visibleColumns.clicked_count && (
                  <th className={`text-left font-semibold text-gray-700 ${cardSettings.compactView ? 'p-1 text-xs leading-tight' : 'p-3'}`}>👆 Clicked</th>
                )}
                {cardSettings.visibleColumns.called_count && (
                  <th className={`text-left font-semibold text-gray-700 ${cardSettings.compactView ? 'p-1 text-xs leading-tight' : 'p-3'}`}>📞 Called</th>
                )}
                {cardSettings.visibleColumns.converted_count && (
                  <th className={`text-left font-semibold text-gray-700 ${cardSettings.compactView ? 'p-1 text-xs leading-tight' : 'p-3'}`}>✅ Converted</th>
                )}
                {cardSettings.visibleColumns.error_count && (
                  <th className={`text-left font-semibold text-gray-700 ${cardSettings.compactView ? 'p-1 text-xs leading-tight' : 'p-3'}`}>❌ Error</th>
                )}
              </tr>
            </thead>
          )}
          <tbody>
            {getProcessedAnalytics().map((row, index) => (
              <tr 
                key={`${row.campaign_id}-${cardSettings.dataSource}-${lastUpdate.getTime()}`}
                className={`border-b border-gray-100 hover:bg-orange-100 transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } ${cardSettings.compactView ? 'text-xs leading-tight' : ''} ${
                  dataRefreshing ? 'opacity-70 animate-pulse' : ''
                }`}
              >
                {cardSettings.visibleColumns.campaign_name && (
                  <td className={`font-medium text-gray-900 max-w-24 truncate ${cardSettings.compactView ? 'p-1 text-xs leading-tight' : 'p-3'}`} title={row.campaign_name}>
                    {row.campaign_name}
                  </td>
                )}
                {cardSettings.visibleColumns.sent_count && (
                  <td className={`text-gray-700 font-medium ${cardSettings.compactView ? 'p-1 text-xs leading-tight' : 'p-3'}`}>
                    {row.sent_count.toLocaleString()}
                  </td>
                )}
                {cardSettings.visibleColumns.opened_count && (
                  <td className={`font-medium ${cardSettings.compactView ? 'p-1 text-xs leading-tight' : 'p-3'} ${
                    cardSettings.showPerformanceColors ? 'text-green-600' : 'text-gray-700'
                  }`}>
                    {row.opened_count.toLocaleString()}
                  </td>
                )}
                {cardSettings.visibleColumns.clicked_count && (
                  <td className={`font-medium ${cardSettings.compactView ? 'p-1 text-xs leading-tight' : 'p-3'} ${
                    cardSettings.showPerformanceColors ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {row.clicked_count.toLocaleString()}
                  </td>
                )}
                {cardSettings.visibleColumns.called_count && (
                  <td className={`font-medium ${cardSettings.compactView ? 'p-1 text-xs leading-tight' : 'p-3'} ${
                    cardSettings.showPerformanceColors ? 'text-purple-600' : 'text-gray-700'
                  }`}>
                    {row.called_count.toLocaleString()}
                  </td>
                )}
                {cardSettings.visibleColumns.converted_count && (
                  <td className={`font-medium ${cardSettings.compactView ? 'p-1 text-xs leading-tight' : 'p-3'} ${
                    cardSettings.showPerformanceColors ? 'text-emerald-600' : 'text-gray-700'
                  }`}>
                    {row.converted_count.toLocaleString()}
                  </td>
                )}
                {cardSettings.visibleColumns.error_count && (
                  <td className={`font-semibold ${cardSettings.compactView ? 'p-1 text-xs leading-tight' : 'p-3'} ${
                    cardSettings.showPerformanceColors ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    {row.error_count.toLocaleString()}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
