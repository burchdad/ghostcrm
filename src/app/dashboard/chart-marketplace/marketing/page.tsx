"use client";
import React from 'react';
import { useToast } from '@/components/ToastProvider';
import ChartGrid from '../components/ChartGrid';
import { marketingCharts } from './data/marketingCharts';
import { ChartTemplate } from '../lib/types';

export default function MarketingChartsPage() {
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
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">📈</div>
          <div>
            <h1 className="text-3xl font-bold">Marketing Charts</h1>
            <p className="text-blue-100 text-lg">
              Campaign analytics, customer acquisition, and marketing ROI visualizations
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{marketingCharts.length}</div>
            <div className="text-blue-100">Chart Templates</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{marketingCharts.filter(c => c.featured).length}</div>
            <div className="text-blue-100">Featured Charts</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">ROI</div>
            <div className="text-blue-100">Focused</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <ChartGrid
        charts={marketingCharts}
        onInstall={handleInstallChart}
        title="Marketing Chart Library"
        description="Optimize your marketing efforts with charts that track campaigns, analyze customer segments, and measure channel performance."
      />
    </div>
  );
}