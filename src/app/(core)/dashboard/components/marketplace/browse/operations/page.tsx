"use client";
import React from 'react';
import { useToast } from '@/components/utils/ToastProvider';
import ChartGrid from '../components/ChartGrid';
import { operationsCharts } from './data/operationsCharts';
import { ChartTemplate } from '../lib/types';

export default function OperationsChartsPage() {
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
      <div className="bg-gradient-to-r from-gray-500 to-slate-600 rounded-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">⚙️</div>
          <div>
            <h1 className="text-3xl font-bold">Operations Charts</h1>
            <p className="text-gray-100 text-lg">
              Process monitoring, inventory management, and operational KPI visualizations
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{operationsCharts.length}</div>
            <div className="text-gray-100">Chart Templates</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">Process</div>
            <div className="text-gray-100">Monitoring</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">KPI</div>
            <div className="text-gray-100">Tracking</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <ChartGrid
        charts={operationsCharts}
        onInstall={handleInstallChart}
        title="Operations Chart Library"
        description="Monitor operational efficiency with charts that track inventory, processes, and key performance indicators."
      />
    </div>
  );
}
