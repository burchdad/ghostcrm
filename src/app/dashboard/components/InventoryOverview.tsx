"use client";
import React, { useState, useEffect } from "react";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  reserved: number;
  available: number;
  category: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  value: number;
}

const demoInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Premium License",
    quantity: 150,
    reserved: 25,
    available: 125,
    category: "Software",
    status: 'in-stock',
    value: 299
  },
  {
    id: "2", 
    name: "Consultation Hours",
    quantity: 80,
    reserved: 65,
    available: 15,
    category: "Services",
    status: 'low-stock',
    value: 150
  },
  {
    id: "3",
    name: "Training Credits",
    quantity: 0,
    reserved: 0,
    available: 0,
    category: "Education",
    status: 'out-of-stock',
    value: 75
  },
  {
    id: "4",
    name: "Support Tickets",
    quantity: 500,
    reserved: 120,
    available: 380,
    category: "Support",
    status: 'in-stock',
    value: 25
  }
];

export default function InventoryOverview() {
  const [inventory, setInventory] = useState<InventoryItem[]>(demoInventory);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'syncing'>('online');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [dataRefreshing, setDataRefreshing] = useState(false);
  const [cardSettings, setCardSettings] = useState({
    showSummaryStats: true,
    showItemDetails: true,
    autoRefresh: true,
    refreshInterval: 45, // seconds
    alertThreshold: 20, // low stock threshold
    showCategories: true,
    compactView: false,
    searchQuery: '', // search filter for inventory items
    filterByCategory: 'all', // 'all', 'Software', 'Services', 'Education', 'Support'
    filterByStatus: 'all', // 'all', 'in-stock', 'low-stock', 'out-of-stock'
    sortBy: 'name', // 'name', 'quantity', 'value', 'status'
    sortOrder: 'asc', // 'asc', 'desc'
    // New theme and visibility settings
    theme: 'gray', // 'orange', 'blue', 'green', 'purple', 'pink', 'gray'
    borderStyle: 'solid', // 'solid', 'dashed', 'dotted', 'gradient'
    showLiveStatus: true,
    showCardTitle: true,
    dataSource: 'demo' // 'demo' or 'live'
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

  const applyDataSourceChanges = async () => {
    setDataRefreshing(true);
    setConnectionStatus('syncing');
    
    // Simulate API delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Apply data source changes
    setCardSettings(prev => ({
      ...prev,
      dataSource: pendingSettings.dataSource
    }));
    
    // Refresh inventory based on new source
    if (pendingSettings.dataSource === 'live') {
      // Generate live-looking data with more variation
      const liveInventory = generateLiveInventory();
      setInventory(liveInventory);
    } else {
      // Reset to demo data
      setInventory(demoInventory);
    }
    
    setLastUpdate(new Date());
    setDataRefreshing(false);
    setConnectionStatus('online');
  };

  // Generate live inventory data
  const generateLiveInventory = (): InventoryItem[] => {
    const categories = ["Software", "Services", "Education", "Support", "Hardware", "Cloud"];
    const names = [
      "Premium License", "Enterprise Suite", "Professional Tools", "Consultation Hours", 
      "Training Credits", "Support Tickets", "Cloud Storage", "API Access", 
      "Security Modules", "Analytics Package", "Mobile App License", "Database Access"
    ];
    
    return Array.from({ length: 8 }, (_, i) => {
      const quantity = Math.floor(Math.random() * 200) + 10;
      const reserved = Math.floor(Math.random() * Math.min(50, quantity));
      const available = quantity - reserved;
      
      let status: 'in-stock' | 'low-stock' | 'out-of-stock';
      if (available === 0) status = 'out-of-stock';
      else if (available < cardSettings.alertThreshold) status = 'low-stock';
      else status = 'in-stock';
      
      return {
        id: `live-${i + 1}`,
        name: names[Math.floor(Math.random() * names.length)],
        quantity,
        reserved,
        available,
        category: categories[Math.floor(Math.random() * categories.length)],
        status,
        value: Math.floor(Math.random() * 300) + 25
      };
    });
  };

  // Function to filter and process inventory based on settings
  const getFilteredInventory = () => {
    let filteredItems = [...inventory];

    // Apply search filter
    if (cardSettings.searchQuery.trim()) {
      const query = cardSettings.searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (cardSettings.filterByCategory !== 'all') {
      filteredItems = filteredItems.filter(item => 
        item.category === cardSettings.filterByCategory
      );
    }

    // Apply status filter
    if (cardSettings.filterByStatus !== 'all') {
      filteredItems = filteredItems.filter(item => 
        item.status === cardSettings.filterByStatus
      );
    }

    // Sort items
    filteredItems.sort((a, b) => {
      let comparison = 0;
      
      switch (cardSettings.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'value':
          comparison = a.value - b.value;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      
      return cardSettings.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filteredItems;
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
    return themes[theme as keyof typeof themes] || themes.gray;
  };

  const getBorderStyle = (style: string) => {
    switch (style) {
      case 'dashed': return 'border-dashed';
      case 'dotted': return 'border-dotted';
      case 'gradient': return 'border-2 bg-gradient-to-br';
      default: return 'border';
    }
  };

  useEffect(() => {
    if (!cardSettings.autoRefresh) return;

    // Simulate periodic inventory updates
    const interval = setInterval(() => {
      setConnectionStatus('syncing');
      
      // Simulate data refresh
      setTimeout(() => {
        setInventory(prev => prev.map(item => {
          const change = Math.floor(Math.random() * 10) - 5; // Random change -5 to +5
          const newQuantity = Math.max(0, item.quantity + change);
          const newAvailable = Math.max(0, newQuantity - item.reserved);
          
          let newStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
          if (newAvailable === 0) newStatus = 'out-of-stock';
          else if (newAvailable < cardSettings.alertThreshold) newStatus = 'low-stock';
          else newStatus = 'in-stock';
          
          return {
            ...item,
            quantity: newQuantity,
            available: newAvailable,
            status: newStatus
          };
        }));
        
        setConnectionStatus('online');
        setLastUpdate(new Date());
      }, 1500);
    }, cardSettings.refreshInterval * 1000); // Use settings refresh interval

    // Simulate occasional connection issues
    const connectionCheckInterval = setInterval(() => {
      if (Math.random() < 0.03) { // 3% chance of connection issue
        setConnectionStatus('offline');
        setTimeout(() => {
          setConnectionStatus('online');
          setLastUpdate(new Date());
        }, 2000);
      }
    }, 20000); // Check every 20 seconds

    return () => {
      clearInterval(interval);
      clearInterval(connectionCheckInterval);
    };
  }, [cardSettings.autoRefresh, cardSettings.refreshInterval, cardSettings.alertThreshold]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'text-green-700 bg-green-100 border-green-200';
      case 'low-stock': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'out-of-stock': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock': return '✅';
      case 'low-stock': return '⚠️';
      case 'out-of-stock': return '❌';
      default: return '📦';
    }
  };

  const filteredInventory = getFilteredInventory();
  const totalValue = filteredInventory.reduce((sum, item) => sum + (item.available * item.value), 0);
  const totalItems = filteredInventory.reduce((sum, item) => sum + item.available, 0);
  const lowStockItems = filteredInventory.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length;

  const themeColors = getThemeColors(cardSettings.theme);

  return (
    <div className={`${themeColors.bg} rounded-xl shadow-lg ${getBorderStyle(cardSettings.borderStyle)} ${themeColors.border} border-t-4 ${themeColors.topBorder} p-6 hover:shadow-xl transition-all duration-300 h-full relative`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {cardSettings.showCardTitle && (
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-black">
                📦 Inventory Overview
              </h2>
              {/* Filter indicator */}
              {(cardSettings.searchQuery || cardSettings.filterByCategory !== 'all' || cardSettings.filterByStatus !== 'all') && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium border border-blue-200">
                  🔍 Filtered
                </span>
              )}
              {/* Data source indicator */}
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                cardSettings.dataSource === 'demo' 
                  ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}>
                {cardSettings.dataSource === 'demo' ? '📋 Demo' : '🔴 Live'}
              </span>
            </div>
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
          title="Inventory Settings"
        >
          <span className="text-lg">⚙️</span>
        </button>
      </div>

      {/* Settings Dropdown */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 rounded-xl shadow-2xl z-50 w-96 max-h-[500px] overflow-hidden">
          {/* Modern Header */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-4 border-b border-gray-300">
            <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <span className="text-xl">📦</span>
              Inventory Overview Settings
            </h4>
          </div>
          
          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-96 p-6 space-y-6">
          
          {/* Theme Customization */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 shadow-sm">
            <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-lg">🎨</span>
              Theme Customization
            </h5>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-2 font-medium text-gray-600">Color Theme:</label>
                <select
                  value={cardSettings.theme}
                  onChange={(e) => handleSettingsChange('theme', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="gray">🌫️ Gray</option>
                  <option value="orange">🧡 Orange</option>
                  <option value="blue">💙 Blue</option>
                  <option value="green">💚 Green</option>
                  <option value="purple">💜 Purple</option>
                  <option value="pink">💖 Pink</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs mb-2 font-medium text-gray-600">Border Style:</label>
                <select
                  value={cardSettings.borderStyle}
                  onChange={(e) => handleSettingsChange('borderStyle', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="solid">━ Solid</option>
                  <option value="dashed">┅ Dashed</option>
                  <option value="dotted">┈ Dotted</option>
                  <option value="gradient">🌈 Gradient</option>
                </select>
              </div>
            </div>
          </div>

          {/* Visibility Controls */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm">
            <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-lg">👁️</span>
              Visibility Controls
            </h5>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition-all">
                <input
                  type="checkbox"
                  checked={cardSettings.showCardTitle}
                  onChange={(e) => handleSettingsChange('showCardTitle', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="font-medium text-gray-700">Show Card Title</span>
              </label>
              
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition-all">
                <input
                  type="checkbox"
                  checked={cardSettings.showLiveStatus}
                  onChange={(e) => handleSettingsChange('showLiveStatus', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="font-medium text-gray-700">Show Live Status Indicator</span>
              </label>
            </div>
          </div>

          {/* Data Source Control */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
            <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-lg">🔗</span>
              Data Source
            </h5>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-2 font-medium text-gray-600">Source Type:</label>
                <select
                  value={pendingSettings.dataSource}
                  onChange={(e) => handleSettingsChange('dataSource', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="demo">📋 Demo Data</option>
                  <option value="live">🔴 Live Data</option>
                </select>
              </div>
              
              {/* Apply Data Source Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={applyDataSourceChanges}
                  disabled={dataRefreshing}
                  className={`flex-1 px-4 py-2 text-white rounded-lg text-sm font-medium transition-all ${themeColors.buttonBg} ${themeColors.buttonHover} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {dataRefreshing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Applying...
                    </>
                  ) : (
                    '✓ Apply Changes'
                  )}
                </button>
                
                {pendingSettings.dataSource !== cardSettings.dataSource && !dataRefreshing && (
                  <div className="flex items-center text-xs text-orange-600 px-2 py-1 bg-orange-100 rounded-lg border border-orange-200">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-1 animate-pulse"></span>
                    Pending
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 shadow-sm">
            <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-lg">🔍</span>
              Search & Filters
            </h5>
            
            {/* Search Field */}
            <div className="mb-4">
              <label className="block text-xs mb-2 font-medium text-gray-600">Search Items:</label>
              <input
                type="text"
                placeholder="Search by name, category..."
                value={cardSettings.searchQuery || ''}
                onChange={(e) => handleSettingsChange('searchQuery', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all placeholder-gray-400"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs mb-2 font-medium text-gray-600">Category:</label>
                <select
                  value={cardSettings.filterByCategory}
                  onChange={(e) => handleSettingsChange('filterByCategory', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                >
                  <option value="all">🌐 All Categories</option>
                  <option value="Software">💻 Software</option>
                  <option value="Services">🛠️ Services</option>
                  <option value="Education">📚 Education</option>
                  <option value="Support">🎧 Support</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs mb-2 font-medium text-gray-600">Status:</label>
                <select
                  value={cardSettings.filterByStatus}
                  onChange={(e) => handleSettingsChange('filterByStatus', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                >
                  <option value="all">📊 All Status</option>
                  <option value="in-stock">✅ In Stock</option>
                  <option value="low-stock">⚠️ Low Stock</option>
                  <option value="out-of-stock">❌ Out of Stock</option>
                </select>
              </div>
            </div>
            
            {/* Clear filters button */}
            {(cardSettings.searchQuery || cardSettings.filterByCategory !== 'all' || cardSettings.filterByStatus !== 'all') && (
              <div className="pt-3 border-t border-yellow-200">
                <button
                  onClick={() => {
                    handleSettingsChange('searchQuery', '');
                    handleSettingsChange('filterByCategory', 'all');
                    handleSettingsChange('filterByStatus', 'all');
                  }}
                  className="text-xs px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-all font-medium"
                >
                  🗑️ Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Display Options */}
          <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200 shadow-sm">
            <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-lg">⚙️</span>
              Display Options
            </h5>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-teal-50 p-2 rounded-lg transition-all">
                <input
                  type="checkbox"
                  checked={cardSettings.showSummaryStats}
                  onChange={(e) => handleSettingsChange('showSummaryStats', e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 focus:ring-2"
                />
                <span className="font-medium text-gray-700">Show Summary Statistics</span>
              </label>
              
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-teal-50 p-2 rounded-lg transition-all">
                <input
                  type="checkbox"
                  checked={cardSettings.showItemDetails}
                  onChange={(e) => handleSettingsChange('showItemDetails', e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 focus:ring-2"
                />
                <span className="font-medium text-gray-700">Show Item Details</span>
              </label>
              
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-teal-50 p-2 rounded-lg transition-all">
                <input
                  type="checkbox"
                  checked={cardSettings.showCategories}
                  onChange={(e) => handleSettingsChange('showCategories', e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 focus:ring-2"
                />
                <span className="font-medium text-gray-700">Show Categories</span>
              </label>
              
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-teal-50 p-2 rounded-lg transition-all">
                <input
                  type="checkbox"
                  checked={cardSettings.compactView}
                  onChange={(e) => handleSettingsChange('compactView', e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 focus:ring-2"
                />
                <span className="font-medium text-gray-700">Compact View</span>
              </label>
            </div>
          </div>

          {/* Auto Refresh Settings */}
          <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200 shadow-sm">
            <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-lg">⏱️</span>
              Auto Refresh Settings
            </h5>
            
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-rose-50 p-2 rounded-lg transition-all mb-3">
              <input
                type="checkbox"
                checked={cardSettings.autoRefresh}
                onChange={(e) => handleSettingsChange('autoRefresh', e.target.checked)}
                className="rounded border-gray-300 text-rose-600 focus:ring-rose-500 focus:ring-2"
              />
              <span className="font-medium text-gray-700">Enable Auto Refresh</span>
            </label>
            
            {cardSettings.autoRefresh && (
              <div className="ml-4 pl-4 border-l-2 border-rose-200">
                <label className="block text-xs mb-2 font-medium text-gray-600">Refresh Interval:</label>
                <select
                  value={cardSettings.refreshInterval}
                  onChange={(e) => handleSettingsChange('refreshInterval', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                >
                  <option value={15}>⚡ 15 seconds</option>
                  <option value={30}>🔄 30 seconds</option>
                  <option value={45}>⏰ 45 seconds</option>
                  <option value={60}>🕐 1 minute</option>
                  <option value={120}>🕑 2 minutes</option>
                </select>
              </div>
            )}
          </div>

          {/* Alert Settings */}
          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 shadow-sm">
            <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
              <span className="text-lg">🚨</span>
              Alert Settings
            </h5>
            
            <div>
              <label className="block text-xs mb-2 font-medium text-gray-600">Low Stock Threshold:</label>
              <input
                type="number"
                value={cardSettings.alertThreshold}
                onChange={(e) => handleSettingsChange('alertThreshold', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                min="1"
                max="100"
                placeholder="Enter threshold..."
              />
              <div className="text-xs text-gray-500 mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                💡 Items with quantity below this number will show as low stock
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
        </div>
      )}

      {/* Summary Stats */}
      {cardSettings.showSummaryStats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalItems}</div>
            <div className="text-xs text-gray-600">Available Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">${totalValue.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Total Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
            <div className="text-xs text-gray-600">Low Stock</div>
          </div>
        </div>
      )}

      {/* Inventory Items */}
      {cardSettings.showItemDetails && (
        <div className={`space-y-3 max-h-60 overflow-y-auto ${cardSettings.compactView ? 'max-h-40' : ''}`}>
          {getFilteredInventory().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📦</div>
              <div>No inventory items found</div>
              <div className="text-sm">
                {(cardSettings.searchQuery || cardSettings.filterByCategory !== 'all' || cardSettings.filterByStatus !== 'all')
                  ? 'Try adjusting your filters in settings' 
                  : 'Inventory items will appear here'}
              </div>
            </div>
          ) : (
            filteredInventory.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 ${
                cardSettings.compactView ? 'p-2' : 'p-3'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cardSettings.compactView ? 'text-sm' : 'text-lg'}>
                    {getStatusIcon(item.status)}
                  </span>
                  <div>
                    <div className={`font-medium text-gray-900 ${cardSettings.compactView ? 'text-xs' : 'text-sm'}`}>
                      {item.name}
                    </div>
                    {cardSettings.showCategories && (
                      <div className="text-xs text-gray-500">{item.category}</div>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(item.status)}`}>
                  {item.status.replace('-', ' ')}
                </span>
              </div>
              
              <div className="flex justify-between text-xs text-gray-600">
                <span>Available: <strong className="text-gray-900">{item.available}</strong></span>
                <span>Reserved: <strong className="text-gray-900">{item.reserved}</strong></span>
                <span>Value: <strong className="text-gray-900">${item.value}</strong></span>
              </div>
            </div>
          ))
          )}
        </div>
      )}
    </div>
  );
}