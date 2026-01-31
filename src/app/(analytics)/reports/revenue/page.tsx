"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RevenueReportsPage() {
  const router = useRouter();
  const [selectedTimeframe, setSelectedTimeframe] = useState("last-12-months");
  const [selectedMetric, setSelectedMetric] = useState("total-revenue");
  const [selectedView, setSelectedView] = useState("chart");

  const timeframes = [
    { value: "last-30-days", label: "Last 30 Days" },
    { value: "last-quarter", label: "Last Quarter" },
    { value: "last-12-months", label: "Last 12 Months" },
    { value: "year-to-date", label: "Year to Date" },
    { value: "custom", label: "Custom Range" }
  ];

  const metrics = [
    { value: "total-revenue", label: "Total Revenue" },
    { value: "recurring-revenue", label: "Recurring Revenue" },
    { value: "new-customer-revenue", label: "New Customer Revenue" },
    { value: "expansion-revenue", label: "Expansion Revenue" },
    { value: "churn-revenue", label: "Churn Revenue" }
  ];

  const revenueData = {
    totalRevenue: 2847350,
    recurringRevenue: 1924500,
    newCustomerRevenue: 672800,
    expansionRevenue: 250050,
    churnRevenue: 145230,
    projectedRevenue: 3245000,
    growth: 23.4,
    monthlyGrowth: [
      { month: "Jan", revenue: 198450, recurring: 145230, new: 53220 },
      { month: "Feb", revenue: 215780, recurring: 156890, new: 58890 },
      { month: "Mar", revenue: 234560, recurring: 167450, new: 67110 },
      { month: "Apr", revenue: 256780, recurring: 178920, new: 77860 },
      { month: "May", revenue: 278450, recurring: 189340, new: 89110 },
      { month: "Jun", revenue: 295670, recurring: 198760, new: 96910 },
      { month: "Jul", revenue: 312890, recurring: 208450, new: 104440 },
      { month: "Aug", revenue: 329560, recurring: 217890, new: 111670 },
      { month: "Sep", revenue: 345780, recurring: 226340, new: 119440 },
      { month: "Oct", revenue: 362450, recurring: 234780, new: 127670 },
      { month: "Nov", revenue: 378920, recurring: 243120, new: 135800 },
      { month: "Dec", revenue: 395670, recurring: 251460, new: 144210 }
    ],
    byProduct: [
      { product: "CRM Pro", revenue: 1245670, percentage: 43.7, growth: 18.5 },
      { product: "CRM Enterprise", revenue: 892340, percentage: 31.3, growth: 28.2 },
      { product: "Marketing Suite", revenue: 445890, percentage: 15.7, growth: 15.8 },
      { product: "Sales Analytics", revenue: 198760, percentage: 7.0, growth: 32.1 },
      { product: "Custom Integration", revenue: 64690, percentage: 2.3, growth: 45.3 }
    ],
    byRegion: [
      { region: "North America", revenue: 1423450, percentage: 50.0, deals: 234 },
      { region: "Europe", revenue: 854070, percentage: 30.0, deals: 156 },
      { region: "Asia Pacific", revenue: 427035, percentage: 15.0, deals: 89 },
      { region: "Latin America", revenue: 142345, percentage: 5.0, deals: 34 }
    ],
    byTeam: [
      { name: "Sarah Johnson", revenue: 567890, deals: 23, avgDeal: 24691 },
      { name: "John Smith", revenue: 445670, deals: 19, avgDeal: 23456 },
      { name: "Mike Wilson", revenue: 389450, deals: 17, avgDeal: 22909 },
      { name: "Lisa Chen", revenue: 334560, deals: 15, avgDeal: 22304 },
      { name: "David Brown", revenue: 278340, deals: 12, avgDeal: 23195 }
    ]
  };

  const handleExport = () => {
    console.log("Exporting revenue report...");
  };

  const handleForecast = () => {
    console.log("Opening revenue forecast...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <span className="text-4xl">💰</span>
                Revenue Reports
              </h1>
              <p className="text-slate-600 mt-2">Track and analyze your revenue performance across all dimensions</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleForecast}
                className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <span>🔮</span>
                Forecast
              </button>
              <button
                onClick={handleExport}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <span>📤</span>
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span>⚙️</span>
            Report Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Time Period</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {timeframes.map(timeframe => (
                  <option key={timeframe.value} value={timeframe.value}>
                    {timeframe.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Primary Metric</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {metrics.map(metric => (
                  <option key={metric.value} value={metric.value}>
                    {metric.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">View Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedView("chart")}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                    selectedView === "chart" 
                      ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300" 
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  📊 Chart
                </button>
                <button
                  onClick={() => setSelectedView("table")}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                    selectedView === "table" 
                      ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300" 
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  📋 Table
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">💰</span>
              <span className="text-sm font-medium text-emerald-600">+{revenueData.growth}%</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">${(revenueData.totalRevenue / 1000000).toFixed(2)}M</div>
            <div className="text-sm text-slate-600">Total Revenue</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🔄</span>
              <span className="text-sm font-medium text-blue-600">+18.2%</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">${(revenueData.recurringRevenue / 1000000).toFixed(2)}M</div>
            <div className="text-sm text-slate-600">Recurring Revenue</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🆕</span>
              <span className="text-sm font-medium text-purple-600">+31.5%</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">${(revenueData.newCustomerRevenue / 1000).toFixed(0)}K</div>
            <div className="text-sm text-slate-600">New Customer Revenue</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📈</span>
              <span className="text-sm font-medium text-orange-600">+12.8%</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">${(revenueData.expansionRevenue / 1000).toFixed(0)}K</div>
            <div className="text-sm text-slate-600">Expansion Revenue</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🔮</span>
              <span className="text-sm font-medium text-teal-600">+14.0%</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">${(revenueData.projectedRevenue / 1000000).toFixed(2)}M</div>
            <div className="text-sm text-slate-600">Projected Revenue</div>
          </div>
        </div>

        {/* Monthly Revenue Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span>📈</span>
            Monthly Revenue Trend
          </h2>
          {selectedView === "chart" ? (
            <div className="h-80 flex items-end justify-between gap-2 bg-gradient-to-t from-emerald-50 to-transparent rounded-lg p-4">
              {revenueData.monthlyGrowth.map((month, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="bg-emerald-500 rounded-t w-full min-h-4 flex items-end justify-center text-white text-xs font-medium pb-1"
                    style={{ height: `${(month.revenue / 400000) * 100}%` }}
                  >
                    ${(month.revenue / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-slate-600 font-medium">{month.month}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Month</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Total Revenue</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Recurring Revenue</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">New Customer Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.monthlyGrowth.map((month, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-800">{month.month}</td>
                      <td className="py-3 px-4 text-slate-600">${month.revenue.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-600">${month.recurring.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-600">${month.new.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Revenue by Product */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span>📦</span>
            Revenue by Product
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {revenueData.byProduct.map((product, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium text-slate-800">{product.product}</div>
                  <div className="text-sm font-medium text-emerald-600">+{product.growth}%</div>
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-1">
                  ${(product.revenue / 1000000).toFixed(2)}M
                </div>
                <div className="text-sm text-slate-600 mb-3">{product.percentage}% of total</div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div
                    className="h-2 bg-emerald-500 rounded-full"
                    style={{ width: `${product.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Region & Team Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue by Region */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <span>🌍</span>
              Revenue by Region
            </h2>
            <div className="space-y-4">
              {revenueData.byRegion.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-800">{region.region}</div>
                    <div className="text-sm text-slate-600">{region.deals} deals</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">${(region.revenue / 1000000).toFixed(2)}M</div>
                    <div className="text-sm text-slate-600">{region.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <span>👥</span>
              Team Performance
            </h2>
            <div className="space-y-4">
              {revenueData.byTeam.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-800">{member.name}</div>
                    <div className="text-sm text-slate-600">{member.deals} deals</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">${(member.revenue / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-slate-600">${member.avgDeal.toLocaleString()} avg</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span>💡</span>
            Revenue Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="text-lg font-medium text-emerald-800 mb-2">🚀 Strong Growth</div>
              <div className="text-sm text-emerald-700 mb-3">
                Revenue has grown 23.4% compared to last year, with CRM Enterprise leading expansion.
              </div>
              <button className="text-sm text-emerald-600 hover:text-emerald-800 font-medium">
                View Growth Drivers →
              </button>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-lg font-medium text-blue-800 mb-2">🎯 Top Performer</div>
              <div className="text-sm text-blue-700 mb-3">
                Sarah Johnson leads with $568K in revenue. Her average deal size is 7% above team average.
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Analyze Performance →
              </button>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-lg font-medium text-purple-800 mb-2">📊 Opportunity</div>
              <div className="text-sm text-purple-700 mb-3">
                Asia Pacific region shows 32% growth potential based on market analysis.
              </div>
              <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                Explore Opportunities →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
