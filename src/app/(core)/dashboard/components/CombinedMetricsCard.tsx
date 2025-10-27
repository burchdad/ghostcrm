"use client";
import React, { useEffect, useState } from "react";
import DashboardCardSettingsModal from "./DashboardCardSettingsModal";

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

type Connection = "online" | "offline" | "syncing";

export default function CombinedMetricsCard({ analytics }: CombinedMetricsCardProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<Connection>("online");
  const [lastSync, setLastSync] = useState(new Date());
  const [dataRefreshing, setDataRefreshing] = useState(false);

  const [cardSettings, setCardSettings] = useState({
    showTitle: true,
    showDescriptions: true,
    colorTheme: "default" as "default" | "dark" | "minimal",
    borderStyle: "bold" as "bold" | "thin" | "none",
    visibleMetrics: {
      messages: true,
      aiAlerts: true,
      totalLeads: true,
      orgScore: true,
      revenue: false,
      activeDeals: false,
      conversionRate: false,
      teamMembers: false,
    },
    // New theme and visibility settings
    theme: "green" as "orange" | "blue" | "green" | "purple" | "pink" | "gray",
    borderStyleNew: "solid" as "solid" | "dashed" | "dotted" | "gradient",
    showLiveStatus: true,
    showCardTitle: true,
    dataSource: "demo" as "demo" | "live",
    // Individual metric color customization
    metricColors: {
      messages: "green",
      aiAlerts: "blue",
      totalLeads: "orange",
      orgScore: "purple",
      revenue: "emerald",
      activeDeals: "indigo",
      conversionRate: "pink",
      teamMembers: "yellow",
    },
  });

  // Separate state for pending changes that require apply button
  const [pendingSettings, setPendingSettings] = useState({
    dataSource: "demo" as "demo" | "live",
  });

  // --- Settings handlers (used by modal) ---
  const handleSettingsChange = (setting: string, value: any) => {
    if (setting === "dataSource") {
      // Only stage this; apply via applyDataSourceChanges()
      setPendingSettings((prev) => ({ ...prev, [setting]: value }));
      return;
    }
    setCardSettings((prev) => ({ ...prev, [setting]: value }));
  };

  const handleMetricVisibilityChange = (metric: string, visible: boolean) => {
    setCardSettings((prev) => ({
      ...prev,
      visibleMetrics: { ...prev.visibleMetrics, [metric]: visible },
    }));
  };

  const handleMetricColorChange = (metric: string, color: string) => {
    setCardSettings((prev) => ({
      ...prev,
      metricColors: { ...prev.metricColors, [metric]: color },
    }));
  };

  const applyDataSourceChanges = () => {
    setDataRefreshing(true);
    setConnectionStatus("syncing");
    setTimeout(() => {
      setCardSettings((prev) => ({ ...prev, dataSource: pendingSettings.dataSource }));
      setLastSync(new Date());
      setDataRefreshing(false);
      setConnectionStatus("online");
    }, 1500);
  };

  // --- Theme helpers ---
  const getThemeColors = (theme: string) => {
    const themes = {
      orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        topBorder: "border-t-orange-500",
        headerBg: "from-orange-100 to-orange-200",
        accent: "bg-orange-500",
        accentHover: "hover:bg-orange-600",
        text: "text-orange-600",
        buttonBg: "bg-orange-500",
        buttonHover: "hover:bg-orange-600",
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        topBorder: "border-t-blue-500",
        headerBg: "from-blue-100 to-blue-200",
        accent: "bg-blue-500",
        accentHover: "hover:bg-blue-600",
        text: "text-blue-600",
        buttonBg: "bg-blue-500",
        buttonHover: "hover:bg-blue-600",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        topBorder: "border-t-green-500",
        headerBg: "from-green-100 to-green-200",
        accent: "bg-green-500",
        accentHover: "hover:bg-green-600",
        text: "text-green-600",
        buttonBg: "bg-green-500",
        buttonHover: "hover:bg-green-600",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        topBorder: "border-t-purple-500",
        headerBg: "from-purple-100 to-purple-200",
        accent: "bg-purple-500",
        accentHover: "hover:bg-purple-600",
        text: "text-purple-600",
        buttonBg: "bg-purple-500",
        buttonHover: "hover:bg-purple-600",
      },
      pink: {
        bg: "bg-pink-50",
        border: "border-pink-200",
        topBorder: "border-t-pink-500",
        headerBg: "from-pink-100 to-pink-200",
        accent: "bg-pink-500",
        accentHover: "hover:bg-pink-600",
        text: "text-pink-600",
        buttonBg: "bg-pink-500",
        buttonHover: "hover:bg-pink-600",
      },
      gray: {
        bg: "bg-gray-50",
        border: "border-gray-200",
        topBorder: "border-t-gray-500",
        headerBg: "from-gray-100 to-gray-200",
        accent: "bg-gray-500",
        accentHover: "hover:bg-gray-600",
        text: "text-gray-600",
        buttonBg: "bg-gray-500",
        buttonHover: "hover:bg-gray-600",
      },
    };
    return themes[theme as keyof typeof themes] || themes.green;
  };

  const getBorderStyle = (style: string) => {
    switch (style) {
      case "dashed":
        return "border-dashed border-2";
      case "dotted":
        return "border-dotted border-2";
      case "gradient":
        return "border-4 bg-gradient-to-br";
      default:
        return "border-2";
    }
  };

  // Connection status simulation (kept)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      setConnectionStatus("syncing");
      setLastSync(new Date());
      setTimeout(() => setConnectionStatus("online"), 1000);
    }, 30000);

    const connectionCheckInterval = setInterval(() => {
      if (Math.random() < 0.05) {
        setConnectionStatus("offline");
        setTimeout(() => setConnectionStatus("online"), 2000);
      }
    }, 10000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(connectionCheckInterval);
    };
  }, []);

  // Re-render on data source change
  useEffect(() => {
    if (cardSettings.dataSource) setLastSync(new Date());
  }, [cardSettings.dataSource]);

  // Data helpers
  const generateMetricValue = (
    baseValue: number | undefined,
    demoValue: number,
    liveMultiplier: number = 1
  ) => {
    if (cardSettings.dataSource === "live") {
      return (
        baseValue ||
        Math.floor(demoValue * liveMultiplier * (0.8 + Math.random() * 0.4))
      );
    }
    return baseValue || demoValue;
  };

  const getAllMetrics = () => [
    {
      key: "messages",
      label: "Messages",
      icon: "💬",
      value: generateMetricValue(analytics.messageCount, analytics.messageCount || 247, 0.7),
      description: "Active conversations",
      color: cardSettings.metricColors.messages,
    },
    {
      key: "aiAlerts",
      label: "AI Alerts",
      icon: "🔔",
      value: generateMetricValue(analytics.alertCount, analytics.alertCount || 12, 1.2),
      description: "System notifications",
      color: cardSettings.metricColors.aiAlerts,
    },
    {
      key: "totalLeads",
      label: "Total Leads",
      icon: "👥",
      value: generateMetricValue(analytics.totalLeads, analytics.totalLeads || 1247, 0.6),
      description: "In pipeline",
      color: cardSettings.metricColors.totalLeads,
    },
    {
      key: "orgScore",
      label: "Org Score",
      icon: "🏆",
      value: generateMetricValue(analytics.orgScore, analytics.orgScore || 87, 1.1),
      description: "Performance",
      color: cardSettings.metricColors.orgScore,
      suffix: "/100",
    },
    {
      key: "revenue",
      label: "Revenue",
      icon: "💰",
      value: generateMetricValue(analytics.revenue, 152000, 0.8),
      description: "This month",
      color: cardSettings.metricColors.revenue,
      prefix: "$",
    },
    {
      key: "activeDeals",
      label: "Active Deals",
      icon: "🤝",
      value: generateMetricValue(analytics.activeDeals, 34, 1.3),
      description: "In progress",
      color: cardSettings.metricColors.activeDeals,
    },
    {
      key: "conversionRate",
      label: "Conversion Rate",
      icon: "📈",
      value: parseFloat(
        generateMetricValue(analytics.conversionRate, 23.5, 0.9).toFixed(1)
      ),
      description: "Lead to deal",
      color: cardSettings.metricColors.conversionRate,
      suffix: "%",
    },
    {
      key: "teamMembers",
      label: "Team Members",
      icon: "👨‍👩‍👧‍👦",
      value: generateMetricValue(analytics.teamMembers, 12, 1.1),
      description: "Active users",
      color: cardSettings.metricColors.teamMembers,
    },
  ];

  const getVisibleMetrics = () =>
    getAllMetrics().filter(
      (m) => cardSettings.visibleMetrics[m.key as keyof typeof cardSettings.visibleMetrics]
    );

  const getThemeStyles = () => {
    switch (cardSettings.colorTheme) {
      case "dark":
        return {
          cardBg: "bg-gray-800",
          titleColor: "text-white",
          textColor: "text-gray-200",
          numberColor: "text-white",
          descColor: "text-gray-400",
        };
      case "minimal":
        return {
          cardBg: "bg-gray-50",
          titleColor: "text-gray-800",
          textColor: "text-gray-600",
          numberColor: "text-gray-800",
          descColor: "text-gray-500",
        };
      default:
        return {
          cardBg: "bg-white",
          titleColor: "text-gray-700",
          textColor: "text-gray-700",
          numberColor: "",
          descColor: "text-gray-500",
        };
    }
  };

  const themeColors = getThemeColors(cardSettings.theme);
  const theme = getThemeStyles();

  return (
    <div
      className={`${themeColors.bg} rounded-xl shadow-lg ${getBorderStyle(
        cardSettings.borderStyleNew
      )} ${themeColors.border} border-t-4 ${themeColors.topBorder} p-6 hover:shadow-xl transition-all duration-300 h-full relative`}
    >
      {/* Header with status + settings gear */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-1">
          {cardSettings.showCardTitle && (
            <h3 className={`font-semibold ${theme.titleColor}`}>Combined Metrics</h3>
          )}
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
                {connectionStatus === "online"
                  ? "Live"
                  : connectionStatus === "syncing"
                  ? "Syncing..."
                  : "Offline"}
              </span>
              <span className="text-xs text-gray-400">{lastSync.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors ml-2"
          title="Card Settings"
        >
          <span className="text-lg">⚙️</span>
        </button>
      </div>

      {/* Settings Modal (single source of truth) */}
      <DashboardCardSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        title="Combined Metrics Card Settings"
        cardSettings={cardSettings}
        onSettingsChange={handleSettingsChange}
        themeColors={themeColors}
        cardType="metrics"
      />

      {/* Metrics grid */}
      <div
        className={`grid gap-4 flex-1 ${
          getVisibleMetrics().length === 1
            ? "grid-cols-1 grid-rows-1"
            : getVisibleMetrics().length === 2
            ? "grid-cols-2 grid-rows-1"
            : "grid-cols-2 grid-rows-2"
        }`}
      >
        {getVisibleMetrics().map((metric, index) => (
          <div
            key={`${metric.key}-${cardSettings.dataSource}-${lastSync.getTime()}`}
            className={`${
              cardSettings.colorTheme === "minimal" ? "bg-white" : `bg-${metric.color}-50`
            } rounded-lg p-4 flex flex-col justify-center items-center text-center h-full w-full ${
              cardSettings.borderStyle === "bold"
                ? `border-4 border-${metric.color}-500`
                : cardSettings.borderStyle === "thin"
                ? `border-2 border-${metric.color}-500`
                : "border-0"
            } ${getVisibleMetrics().length === 3 && index === 2 ? "col-span-2" : ""} ${
              dataRefreshing ? "opacity-70 animate-pulse" : ""
            }`}
          >
            <span className="text-2xl mb-2">{metric.icon}</span>
            <h4 className={`font-semibold ${theme.textColor} text-sm`}>{metric.label}</h4>
            <div className={`text-2xl font-bold text-${metric.color}-600`}>
              {metric.prefix || ""}
              {metric.value}
              {metric.suffix || ""}
            </div>
            {cardSettings.showDescriptions && (
              <p className={`text-xs ${theme.descColor} mt-1`}>{metric.description}</p>
            )}
          </div>
        ))}

        {/* Empty slots to keep a 2x2 look when fewer than 4 (except 3, already handled) */}
        {getVisibleMetrics().length < 4 &&
          getVisibleMetrics().length !== 3 &&
          Array.from({ length: 4 - getVisibleMetrics().length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="bg-gray-100 rounded-lg p-4 flex flex-col justify-center items-center text-center h-full w-full border-2 border-dashed border-gray-300"
            >
              <span className="text-2xl mb-2 text-gray-400">➕</span>
              <p className="text-xs text-gray-400">Add Metric</p>
              <p className="text-xs text-gray-300 mt-1">Use settings ⚙️</p>
            </div>
          ))}
      </div>
    </div>
  );
}
