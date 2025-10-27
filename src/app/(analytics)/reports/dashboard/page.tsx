"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardReportsPage() {
  const router = useRouter();
  const [selectedTimeframe, setSelectedTimeframe] = useState("last-30-days");
  const [selectedMetrics, setSelectedMetrics] = useState(["revenue", "leads", "deals"]);
  const [dashboardLayout, setDashboardLayout] = useState("grid");

  const timeframes = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last-7-days", label: "Last 7 Days" },
    { value: "last-30-days", label: "Last 30 Days" },
    { value: "last-quarter", label: "Last Quarter" },
    { value: "last-year", label: "Last Year" },
    { value: "custom", label: "Custom Range" }
  ];

  const availableMetrics = [
    { id: "revenue", name: "Revenue", icon: "💰", color: "green" },
    { id: "leads", name: "Leads Generated", icon: "👤", color: "blue" },
    { id: "deals", name: "Deals Closed", icon: "🤝", color: "purple" },
    { id: "conversion", name: "Conversion Rate", icon: "📈", color: "orange" },
    { id: "pipeline", name: "Pipeline Value", icon: "🔄", color: "teal" },
    { id: "activities", name: "Activities", icon: "📋", color: "indigo" },
    { id: "team", name: "Team Performance", icon: "👥", color: "pink" },
    { id: "forecasting", name: "Sales Forecasting", icon: "🔮", color: "cyan" }
  ];

  const dashboardTemplates = [
    { id: "executive", name: "Executive Overview", description: "High-level KPIs and trends" },
    { id: "sales", name: "Sales Performance", description: "Detailed sales metrics and pipeline" },
    { id: "marketing", name: "Marketing Analytics", description: "Lead generation and campaign performance" },
    { id: "team", name: "Team Dashboard", description: "Individual and team performance metrics" },
    { id: "custom", name: "Custom Dashboard", description: "Build your own custom dashboard" }
  ];

  const mockData = {
    revenue: { value: "$125,450", change: "+12.5%", trend: "up" },
    leads: { value: "348", change: "+8.3%", trend: "up" },
    deals: { value: "23", change: "-2.1%", trend: "down" },
    conversion: { value: "6.6%", change: "+1.2%", trend: "up" },
    pipeline: { value: "$1.2M", change: "+15.8%", trend: "up" },
    activities: { value: "1,247", change: "+5.4%", trend: "up" },
    team: { value: "8.5/10", change: "+0.3", trend: "up" },
    forecasting: { value: "$890K", change: "+22.1%", trend: "up" }
  };

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleExportDashboard = () => {
    console.log("Exporting dashboard...");
    // Implementation for exporting dashboard
  };

  const handleSaveDashboard = () => {
    console.log("Saving dashboard...");
    // Implementation for saving dashboard
  };

  const handleShareDashboard = () => {
    console.log("Sharing dashboard...");
    // Implementation for sharing dashboard
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <span className="text-4xl">📊</span>
                Dashboard Reports
              </h1>
              <p className="text-slate-600 mt-2">Create and customize your business intelligence dashboards</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportDashboard}
                className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <span>📤</span>
                Export
              </button>
              <button
                onClick={handleShareDashboard}
                className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <span>🔗</span>
                Share
              </button>
              <button
                onClick={handleSaveDashboard}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>💾</span>
                Save Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span>⚙️</span>
            Dashboard Configuration
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timeframe Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Time Period</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeframes.map(timeframe => (
                  <option key={timeframe.value} value={timeframe.value}>
                    {timeframe.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Layout Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Layout</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDashboardLayout("grid")}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                    dashboardLayout === "grid" 
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-300" 
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  📊 Grid
                </button>
                <button
                  onClick={() => setDashboardLayout("list")}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                    dashboardLayout === "list" 
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-300" 
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  📋 List
                </button>
              </div>
            </div>

            {/* Quick Templates */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Quick Templates</label>
              <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Choose a template</option>
                {dashboardTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Metrics Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span>📈</span>
            Select Metrics to Display
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableMetrics.map(metric => (
              <div
                key={metric.id}
                onClick={() => handleMetricToggle(metric.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMetrics.includes(metric.id)
                    ? `border-${metric.color}-300 bg-${metric.color}-50`
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{metric.icon}</span>
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric.id)}
                    onChange={() => handleMetricToggle(metric.id)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="font-medium text-slate-800">{metric.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span>👁️</span>
            Dashboard Preview
          </h2>
          
          {dashboardLayout === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {selectedMetrics.map(metricId => {
                const metric = availableMetrics.find(m => m.id === metricId);
                const data = mockData[metricId as keyof typeof mockData];
                return (
                  <div key={metricId} className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">{metric?.icon}</span>
                      <span className={`text-sm font-medium ${
                        data.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                        {data.change}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 mb-1">{data.value}</div>
                    <div className="text-sm text-slate-600">{metric?.name}</div>
                    <div className="mt-4 h-2 bg-slate-100 rounded-full">
                      <div className={`h-2 bg-${metric?.color}-500 rounded-full`} style={{ width: "65%" }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {selectedMetrics.map(metricId => {
                const metric = availableMetrics.find(m => m.id === metricId);
                const data = mockData[metricId as keyof typeof mockData];
                return (
                  <div key={metricId} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{metric?.icon}</span>
                      <div>
                        <div className="font-medium text-slate-800">{metric?.name}</div>
                        <div className="text-sm text-slate-600">Current period</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-slate-800">{data.value}</div>
                      <div className={`text-sm font-medium ${
                        data.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                        {data.change}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedMetrics.length === 0 && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📊</span>
              <div className="text-xl font-medium text-slate-600 mb-2">No Metrics Selected</div>
              <div className="text-slate-500">Choose metrics above to see your dashboard preview</div>
            </div>
          )}
        </div>

        {/* Chart Suggestions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span>📈</span>
            Recommended Charts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-lg font-medium text-slate-800 mb-2">📊 Revenue Trend</div>
              <div className="text-sm text-slate-600 mb-4">Monthly revenue growth over time</div>
              <div className="h-20 bg-gradient-to-r from-green-100 to-green-200 rounded flex items-center justify-center">
                <span className="text-green-700 font-medium">Line Chart</span>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-lg font-medium text-slate-800 mb-2">🥧 Lead Sources</div>
              <div className="text-sm text-slate-600 mb-4">Distribution of lead sources</div>
              <div className="h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded flex items-center justify-center">
                <span className="text-blue-700 font-medium">Pie Chart</span>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-lg font-medium text-slate-800 mb-2">📈 Pipeline Forecast</div>
              <div className="text-sm text-slate-600 mb-4">Predicted deal closures</div>
              <div className="h-20 bg-gradient-to-r from-purple-100 to-purple-200 rounded flex items-center justify-center">
                <span className="text-purple-700 font-medium">Bar Chart</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
