"use client";
import React from 'react';
import { useToast } from '@/components/ToastProvider';
import ChartGrid from '../components/ChartGrid';
import { salesCharts } from './data/salesCharts';
import { ChartTemplate } from '../lib/types';

export default function SalesChartsPage() {
  const { show: showToast } = useToast();

  const handleInstallChart = async (chart: ChartTemplate) => {
    try {
      // Here you would integrate with your existing chart installation logic
      // For now, we'll just show a success message
      console.log('Installing chart:', chart);
      showToast(`Successfully installed "${chart.name}"`, 'success');
    } catch (error) {
      showToast(`Failed to install chart: ${error}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">💰</div>
          <div>
            <h1 className="text-3xl font-bold">Sales Charts</h1>
            <p className="text-green-100 text-lg">
              Revenue tracking, conversion funnels, and sales performance visualizations
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{salesCharts.length}</div>
            <div className="text-green-100">Chart Templates</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{salesCharts.filter(c => c.featured).length}</div>
            <div className="text-green-100">Featured Charts</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">Easy</div>
            <div className="text-green-100">Integration</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <ChartGrid
        charts={salesCharts}
        onInstall={handleInstallChart}
        title="Sales Chart Library"
        description="Choose from our collection of sales-focused charts to track revenue, monitor pipeline performance, and analyze team productivity."
      />
    </div>
  );
}