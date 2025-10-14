"use client";
import React from 'react';
import { ChartTemplate } from '../lib/types';

interface ChartCardProps {
  chart: ChartTemplate;
  onInstall: (chart: ChartTemplate) => void;
  showCategory?: boolean;
}

export default function ChartCard({ chart, onInstall, showCategory = false }: ChartCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300">
      {/* Chart Preview */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-4xl">{chart.preview}</div>
        <div className="flex items-center gap-2">
          {chart.featured && (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full font-medium">
              ⭐ Featured
            </span>
          )}
          {showCategory && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium capitalize">
              {chart.category}
            </span>
          )}
        </div>
      </div>

      {/* Chart Info */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-2">
          {chart.name}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          {chart.description}
        </p>
      </div>

      {/* Chart Meta */}
      <div className="mb-4 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>By {chart.author}</span>
          <span>Updated {new Date(chart.lastUpdated).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Install Button */}
      <button
        onClick={() => onInstall(chart)}
        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <span>⬇️</span>
        Install Chart
      </button>
    </div>
  );
}