"use client";
import React, { useState } from "react";
import Link from "next/link";

// Import chart data from the marketplace
import { salesCharts } from "../chart-marketplace/sales/data/salesCharts";
import { marketingCharts } from "../chart-marketplace/marketing/data/marketingCharts";
import { analyticsCharts } from "../chart-marketplace/analytics/data/analyticsCharts";
import { financeCharts } from "../chart-marketplace/finance/data/financeCharts";
import { operationsCharts } from "../chart-marketplace/operations/data/operationsCharts";
import { customCharts } from "../chart-marketplace/custom/data/customCharts";

import { ChartTemplate } from "../chart-marketplace/lib/types";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  charts: ChartTemplate[];
}

interface ChartMarketplaceDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallChart: (chart: ChartTemplate) => void;
}

const categories: Category[] = [
  {
    id: "sales",
    name: "Sales",
    icon: "💰",
    color: "text-green-600",
    bgColor: "bg-green-50",
    charts: salesCharts,
  },
  {
    id: "marketing",
    name: "Marketing", 
    icon: "📊",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    charts: marketingCharts,
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: "📈",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    charts: analyticsCharts,
  },
  {
    id: "finance",
    name: "Finance",
    icon: "💼",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    charts: financeCharts,
  },
  {
    id: "operations",
    name: "Operations",
    icon: "⚙️",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    charts: operationsCharts,
  },
  {
    id: "custom",
    name: "Custom",
    icon: "🎨",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    charts: customCharts,
  },
];

export default function ChartMarketplaceDropdown({
  isOpen,
  onClose,
  onInstallChart,
}: ChartMarketplaceDropdownProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("sales");

  if (!isOpen) return null;

  const currentCategory = categories.find(cat => cat.id === selectedCategory);
  const filteredCharts = currentCategory?.charts || [];

  // Helper function to get chart type icon
  const getChartTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'line':
        return '📈';
      case 'bar':
        return '📊';
      case 'pie':
        return '🥧';
      case 'doughnut':
        return '🍩';
      case 'radar':
        return '🎯';
      case 'scatter':
        return '🔵';
      case 'area':
        return '📈';
      default:
        return '📊';
    }
  };

  const handleInstall = (chart: ChartTemplate) => {
    onInstallChart(chart);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-blue-500 rounded-lg shadow-xl w-[900px] h-[600px] max-w-[90vw] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-center p-6 border-b relative">
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Chart Marketplace</h2>              
            </div>
          </div>
          <div className="absolute right-6 flex items-center space-x-3">            
          </div>
        </div>

        <div className="flex h-[calc(100%-80px)]">
          {/* Category Sidebar */}
          <div className="w-48 bg-gray-200 rounded-lg border-r">
            <div className="p-4">              
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category.id
                        ? `${category.bgColor} ${category.color} font-medium`
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                    <span className="ml-auto text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full">
                      {category.charts.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Charts Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {currentCategory && (
                <div className="mb-4">
                  <div className={`inline-flex items-center space-x-2 px-6 py-4 rounded-full ${currentCategory.bgColor}`}>
                    <span className="text-xl">{currentCategory.icon}</span>
                    <span className={`font-medium ${currentCategory.color}`}>{currentCategory.name}</span>                   
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {filteredCharts.map((chart) => (
                  <div
                    key={chart.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-blue-100 hover:border-blue-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl">{getChartTypeIcon(chart.type)}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-base mb-1">{chart.name}</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{chart.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleInstall(chart)}
                        className="ml-4 flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        title="Download Chart"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7,10 12,15 17,10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCharts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">�</div>
                  <div className="text-sm">No charts available in this category</div>
                  <div className="text-xs text-gray-400 mt-1">Try selecting a different category</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}