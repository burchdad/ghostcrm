"use client";
import { useEffect, useState } from "react";
import DashboardCardSettingsModal from "./DashboardCardSettingsModal";

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

  // Generate campaign data from API or database
  const generateCampaignData = () => {
    // Return empty array if no data available - async loading should be handled in useEffect
    return [];
  };

  // Load campaign data on component mount
  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        const response = await fetch('/api/campaigns/analytics');
        if (response.ok) {
          const data = await response.json();
          // You would set this data to state here
          // setCampaignData(data.campaigns || []);
        }
      } catch (error) {
        console.error('Failed to fetch campaign data:', error);
      }
    };

    loadCampaignData();
  }, []);

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

      {/* Campaign Analytics Settings Modal */}
      <DashboardCardSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        title="📧 Campaign Analytics Settings"
        cardSettings={cardSettings}
        onSettingsChange={handleSettingsChange}
        themeColors={themeColors}
        cardType="analytics"
      />
      
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
