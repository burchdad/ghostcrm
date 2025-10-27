"use client";
import React from 'react';
import { useToast } from '@/components/utils/ToastProvider';
import ChartGrid from '../components/ChartGrid';
import { analyticsCharts } from './data/analyticsCharts';
import { ChartTemplate } from '../lib/types';

export default function AnalyticsChartsPage() {
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
      <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">🔍</div>
          <div>
            <h1 className="text-3xl font-bold">Analytics Charts</h1>
            <p className="text-purple-100 text-lg">
              Data insights, user behavior, and advanced analytics visualizations
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{analyticsCharts.length}</div>
            <div className="text-purple-100">Chart Templates</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">Advanced</div>
            <div className="text-purple-100">Analytics</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">Insights</div>
            <div className="text-purple-100">Driven</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <ChartGrid
        charts={analyticsCharts}
        onInstall={handleInstallChart}
        title="Analytics Chart Library"
        description="Dive deep into your data with advanced analytics charts that reveal user patterns, conversion flows, and business insights."
      />
    </div>
  );
}
