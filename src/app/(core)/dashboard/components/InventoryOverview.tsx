"use client";
import React, { useState, useEffect } from "react";
import DashboardCardSettingsModal from "./DashboardCardSettingsModal";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  reserved: number;
  available: number;
  category: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
  value: number;
}

const demoInventory: InventoryItem[] = [
  { id: "1", name: "Premium License", quantity: 150, reserved: 25, available: 125, category: "Software", status: "in-stock", value: 299 },
  { id: "2", name: "Consultation Hours", quantity: 80, reserved: 65, available: 15, category: "Services", status: "low-stock", value: 150 },
  { id: "3", name: "Training Credits", quantity: 0, reserved: 0, available: 0, category: "Education", status: "out-of-stock", value: 75 },
  { id: "4", name: "Support Tickets", quantity: 500, reserved: 120, available: 380, category: "Support", status: "in-stock", value: 25 }
];

export default function InventoryOverview() {
  const [inventory, setInventory] = useState<InventoryItem[]>(demoInventory);
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline" | "syncing">("online");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [dataRefreshing, setDataRefreshing] = useState(false);

  const [cardSettings, setCardSettings] = useState({
    showSummaryStats: true,
    showItemDetails: true,
    autoRefresh: true,
    refreshInterval: 45,
    alertThreshold: 20,
    showCategories: true,
    compactView: false,
    searchQuery: "",
    filterByCategory: "all",
    filterByStatus: "all",
    sortBy: "name",
    sortOrder: "asc",
    theme: "gray" as "orange" | "blue" | "green" | "purple" | "pink" | "gray",
    borderStyle: "solid" as "solid" | "dashed" | "dotted" | "gradient",
    showLiveStatus: true,
    showCardTitle: true,
    dataSource: "demo" as "demo" | "live"
  });

  const [pendingSettings, setPendingSettings] = useState({ dataSource: "demo" as "demo" | "live" });

  // --- Settings Handlers ---
  const handleSettingsChange = (setting: string, value: any) => {
    if (setting === "dataSource") {
      setPendingSettings((prev) => ({ ...prev, [setting]: value }));
    } else {
      setCardSettings((prev) => ({ ...prev, [setting]: value }));
    }
  };

  const applyDataSourceChanges = async () => {
    setDataRefreshing(true);
    setConnectionStatus("syncing");
    await new Promise((r) => setTimeout(r, 1200));
    setCardSettings((prev) => ({ ...prev, dataSource: pendingSettings.dataSource }));

    setInventory(pendingSettings.dataSource === "live" ? generateLiveInventory() : demoInventory);
    setLastUpdate(new Date());
    setDataRefreshing(false);
    setConnectionStatus("online");
  };

  // --- Inventory Generation ---
  const generateLiveInventory = (): InventoryItem[] => {
    const categories = ["Software", "Services", "Education", "Support", "Hardware", "Cloud"];
    const names = [
      "Premium License", "Enterprise Suite", "Consultation Hours", "Training Credits",
      "Support Tickets", "Cloud Storage", "API Access", "Security Modules", "Analytics Package"
    ];
    return Array.from({ length: 8 }, (_, i) => {
      const quantity = Math.floor(Math.random() * 200) + 10;
      const reserved = Math.floor(Math.random() * Math.min(50, quantity));
      const available = quantity - reserved;
      const status = available === 0 ? "out-of-stock" : available < cardSettings.alertThreshold ? "low-stock" : "in-stock";
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

  const getFilteredInventory = () => {
    let filtered = [...inventory];
    const { searchQuery, filterByCategory, filterByStatus, sortBy, sortOrder } = cardSettings;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    if (filterByCategory !== "all") filtered = filtered.filter((i) => i.category === filterByCategory);
    if (filterByStatus !== "all") filtered = filtered.filter((i) => i.status === filterByStatus);

    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "quantity") cmp = a.quantity - b.quantity;
      else if (sortBy === "value") cmp = a.value - b.value;
      else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
      return sortOrder === "desc" ? -cmp : cmp;
    });

    return filtered;
  };

  // --- Theme & Border ---
  const getThemeColors = (theme: string) => ({
    orange: { accent: "bg-orange-500 hover:bg-orange-600" },
    blue: { accent: "bg-blue-500 hover:bg-blue-600" },
    green: { accent: "bg-green-500 hover:bg-green-600" },
    purple: { accent: "bg-purple-500 hover:bg-purple-600" },
    pink: { accent: "bg-pink-500 hover:bg-pink-600" },
    gray: { accent: "bg-gray-500 hover:bg-gray-600" }
  }[theme as keyof any] || { accent: "bg-gray-500 hover:bg-gray-600" });

  const getStatusColor = (status: string) =>
    status === "in-stock"
      ? "text-green-700 bg-green-100 border-green-200"
      : status === "low-stock"
      ? "text-yellow-700 bg-yellow-100 border-yellow-200"
      : "text-red-700 bg-red-100 border-red-200";

  const getStatusIcon = (status: string) =>
    status === "in-stock" ? "✅" : status === "low-stock" ? "⚠️" : "❌";

  // --- Auto refresh simulation ---
  useEffect(() => {
    if (!cardSettings.autoRefresh) return;
    const interval = setInterval(() => {
      setConnectionStatus("syncing");
      setTimeout(() => {
        setInventory((prev) =>
          prev.map((i) => {
            const change = Math.floor(Math.random() * 10) - 5;
            const quantity = Math.max(0, i.quantity + change);
            const available = Math.max(0, quantity - i.reserved);
            const status =
              available === 0
                ? "out-of-stock"
                : available < cardSettings.alertThreshold
                ? "low-stock"
                : "in-stock";
            return { ...i, quantity, available, status };
          })
        );
        setConnectionStatus("online");
        setLastUpdate(new Date());
      }, 1500);
    }, cardSettings.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [cardSettings.autoRefresh, cardSettings.refreshInterval, cardSettings.alertThreshold]);

  const themeColors = getThemeColors(cardSettings.theme);
  const filteredInventory = getFilteredInventory();
  const totalValue = filteredInventory.reduce((sum, i) => sum + i.available * i.value, 0);
  const totalItems = filteredInventory.reduce((sum, i) => sum + i.available, 0);
  const lowStockItems = filteredInventory.filter((i) => i.status !== "in-stock").length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full relative hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {cardSettings.dataSource && (
              <span
                className={`px-2 py-1 text-xs rounded-full font-medium ${
                  cardSettings.dataSource === "demo"
                    ? "bg-orange-100 text-orange-700 border border-orange-200"
                    : "bg-green-100 text-green-700 border border-green-200"
                }`}
              >
                {cardSettings.dataSource === "demo" ? "📋 Demo" : "🔴 Live"}
              </span>
            )}
          </div>

          {cardSettings.showLiveStatus && (
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "online"
                    ? "bg-green-500"
                    : connectionStatus === "syncing"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-red-500"
                }`}
              />
              <span
                className={`text-xs ${
                  connectionStatus === "online"
                    ? "text-green-600"
                    : connectionStatus === "syncing"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {connectionStatus === "online" ? "Live" : connectionStatus === "syncing" ? "Sync" : "Offline"}
              </span>
              <span className="text-xs text-gray-400">{lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowSettings(true)}
          className={`p-2 rounded-full ${themeColors.accent} text-white transition`}
          title="Inventory Settings"
        >
          ⚙️
        </button>
      </div>

      {/* Settings Modal */}
      <DashboardCardSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        title="📦 Inventory Overview Settings"
        cardSettings={cardSettings}        
        onSettingsChange={handleSettingsChange}
        themeColors={themeColors}
        cardType="inventory"
      />

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
        <div className={`space-y-3 max-h-60 overflow-y-auto ${cardSettings.compactView ? "max-h-40" : ""}`}>
          {filteredInventory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📦</div>
              <div>No inventory items found</div>
            </div>
          ) : (
            filteredInventory.map((item) => (
              <div
                key={item.id}
                className={`bg-gray-50 rounded-md border border-gray-100 p-${cardSettings.compactView ? "2" : "3"} hover:shadow-sm transition`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{getStatusIcon(item.status)}</span>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                      {cardSettings.showCategories && <div className="text-xs text-gray-500">{item.category}</div>}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(item.status)}`}>
                    {item.status.replace("-", " ")}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Available: <strong>{item.available}</strong></span>
                  <span>Reserved: <strong>{item.reserved}</strong></span>
                  <span>Value: <strong>${item.value}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
