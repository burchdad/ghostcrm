"use client";
import React from 'react';
import { useToast } from '@/components/ToastProvider';
import ChartGrid from '../components/ChartGrid';
import { financeCharts } from './data/financeCharts';
import { ChartTemplate } from '../lib/types';

export default function FinanceChartsPage() {
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
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">💵</div>
          <div>
            <h1 className="text-3xl font-bold">Finance Charts</h1>
            <p className="text-yellow-100 text-lg">
              Financial reports, budget tracking, and expense analysis visualizations
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{financeCharts.length}</div>
            <div className="text-yellow-100">Chart Templates</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">Budget</div>
            <div className="text-yellow-100">Tracking</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">Expense</div>
            <div className="text-yellow-100">Analysis</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <ChartGrid
        charts={financeCharts}
        onInstall={handleInstallChart}
        title="Finance Chart Library"
        description="Track financial performance with comprehensive charts for budget analysis, expense monitoring, and financial reporting."
      />
    </div>
  );
}