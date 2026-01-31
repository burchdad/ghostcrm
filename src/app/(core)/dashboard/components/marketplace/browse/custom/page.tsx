"use client";
import React from 'react';
import { useToast } from '@/components/utils/ToastProvider';
import ChartGrid from '../components/ChartGrid';
import { customCharts } from './data/customCharts';
import { ChartTemplate } from '../lib/types';

export default function CustomChartsPage() {
  const { show: showToast } = useToast();

  const handleInstallChart = async (chart: ChartTemplate) => {
    try {
      console.log('Installing chart:', chart);
      showToast(`Successfully installed "${chart.name}"`, 'success');
    } catch (error) {
      showToast(`Failed to install chart: ${error}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">🎨</div>
          <div>
            <h1 className="text-3xl font-bold">Custom Charts</h1>
            <p className="text-pink-100 text-lg">
              Build your own charts with custom configurations and data sources
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{customCharts.length}</div>
            <div className="text-pink-100">Chart Templates</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">Unlimited</div>
            <div className="text-pink-100">Customization</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">Your</div>
            <div className="text-pink-100">Data</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <ChartGrid
        charts={customCharts}
        onInstall={handleInstallChart}
        title="Custom Chart Library"
        description="Create personalized visualizations with our flexible chart builder and custom data integration tools."
      />

      {/* Custom Builder Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need Something Specific?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our custom chart builder allows you to create exactly what you need with your own data sources, 
            styling preferences, and interactive features.
          </p>
          <button className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors">
            🚀 Launch Chart Builder
          </button>
        </div>
      </div>
    </div>
  );
}
