"use client";
import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { Bar, Line, Pie, Doughnut, Radar, Scatter } from "react-chartjs-2";
import ChartMarketplace, { ChartTemplate } from "./ChartMarketplace";
import { useToast } from "@/components/ToastProvider";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

export interface DynamicChart {
  id: string;
  name: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'scatter' | 'area';
  config: any;
  data: any;
  position: { x: number; y: number; width: number; height: number };
  created: string;
  source: 'marketplace' | 'ai' | 'custom';
  category: string;
}

interface ChartSuggestion {
  id: string;
  title: string;
  description: string;
  chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'scatter' | 'area';
  category: string;
  config: any;
  sampleData: any;
  confidence: number;
}

// Extend Window interface for global chart building function
declare global {
  interface Window {
    buildChartFromAI?: (suggestion: ChartSuggestion) => void;
  }
}

interface DynamicChartBuilderProps {
  charts: DynamicChart[];
  onChartsChange: (charts: DynamicChart[]) => void;
  showMarketplace?: boolean;
  onToggleMarketplace?: () => void;
  currentData?: any; // Real data from dashboard
}

export default function DynamicChartBuilder({ 
  charts, 
  onChartsChange, 
  showMarketplace = false,
  onToggleMarketplace,
  currentData 
}: DynamicChartBuilderProps) {
  const [selectedChart, setSelectedChart] = useState<DynamicChart | null>(null);
  const [editMode, setEditMode] = useState(false);
  const { show: showToast } = useToast();

  // Build chart from marketplace template
  const handleInstallFromMarketplace = async (template: ChartTemplate) => {
    try {
      const newChart: DynamicChart = {
        id: `chart-${Date.now()}`,
        name: template.name,
        type: template.type,
        config: {
          ...template.config,
          options: {
            ...template.config.options,
            responsive: true,
            maintainAspectRatio: false
          }
        },
        data: mergeWithRealData(template.dataStructure.sampleData, template.category),
        position: getNextChartPosition(),
        created: new Date().toISOString(),
        source: 'marketplace',
        category: template.category
      };

      const updatedCharts = [...charts, newChart];
      onChartsChange(updatedCharts);
      showToast(`Chart "${template.name}" added to dashboard`, 'success');
      
      // Close marketplace after install
      if (onToggleMarketplace) {
        onToggleMarketplace();
      }
    } catch (error) {
      showToast(`Failed to install chart: ${error}`, 'error');
    }
  };

  // Build chart from AI suggestion
  const handleBuildFromAI = (suggestion: ChartSuggestion) => {
    try {
      const newChart: DynamicChart = {
        id: `ai-chart-${Date.now()}`,
        name: suggestion.title,
        type: suggestion.chartType,
        config: {
          ...suggestion.config,
          options: {
            ...suggestion.config.options,
            responsive: true,
            maintainAspectRatio: false
          }
        },
        data: mergeWithRealData(suggestion.sampleData, suggestion.category),
        position: getNextChartPosition(),
        created: new Date().toISOString(),
        source: 'ai',
        category: suggestion.category
      };

      const updatedCharts = [...charts, newChart];
      onChartsChange(updatedCharts);
      showToast(`AI-suggested chart "${suggestion.title}" created`, 'success');
    } catch (error) {
      showToast(`Failed to create AI chart: ${error}`, 'error');
    }
  };

  // Get next available position for new chart
  const getNextChartPosition = () => {
    const gridSize = 4; // 4 columns
    const existingPositions = charts.map(chart => ({ x: chart.position.x, y: chart.position.y }));
    
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < gridSize; x++) {
        const position = { x, y };
        const isOccupied = existingPositions.some(pos => pos.x === x && pos.y === y);
        if (!isOccupied) {
          return { x, y, width: 1, height: 1 };
        }
      }
    }
    
    // If all positions are taken, stack vertically
    return { x: 0, y: charts.length, width: 1, height: 1 };
  };

  // Merge template data with real dashboard data when available
  const mergeWithRealData = (templateData: any, category: string) => {
    if (!currentData) return templateData;

    // Try to match category with available data
    switch (category) {
      case 'sales':
        if (currentData.sales) {
          return {
            ...templateData,
            datasets: templateData.datasets.map((dataset: any) => ({
              ...dataset,
              data: currentData.sales.data || dataset.data
            })),
            labels: currentData.sales.labels || templateData.labels
          };
        }
        break;
      case 'marketing':
        if (currentData.marketing) {
          return {
            ...templateData,
            datasets: templateData.datasets.map((dataset: any) => ({
              ...dataset,
              data: currentData.marketing.data || dataset.data
            })),
            labels: currentData.marketing.labels || templateData.labels
          };
        }
        break;
      case 'operations':
        if (currentData.inventory) {
          return {
            ...templateData,
            datasets: templateData.datasets.map((dataset: any) => ({
              ...dataset,
              data: currentData.inventory.data || dataset.data
            })),
            labels: currentData.inventory.labels || templateData.labels
          };
        }
        break;
    }

    return templateData;
  };

  // Remove chart
  const handleRemoveChart = (chartId: string) => {
    const updatedCharts = charts.filter(chart => chart.id !== chartId);
    onChartsChange(updatedCharts);
    showToast('Chart removed from dashboard', 'info');
  };

  // Render specific chart type
  const renderChart = (chart: DynamicChart) => {
    const commonProps = {
      data: chart.data,
      options: chart.config.options,
      key: chart.id
    };

    try {
      switch (chart.type) {
        case 'bar':
          return <Bar {...commonProps} />;
        case 'line':
          return <Line {...commonProps} />;
        case 'area':
          // Area charts are line charts with filled areas
          const areaProps = {
            ...commonProps,
            data: {
              ...chart.data,
              datasets: chart.data.datasets.map((dataset: any) => ({
                ...dataset,
                fill: true,
                backgroundColor: dataset.backgroundColor || 'rgba(59, 130, 246, 0.1)',
                borderColor: dataset.borderColor || '#3b82f6'
              }))
            }
          };
          return <Line {...areaProps} />;
        case 'pie':
          return <Pie {...commonProps} />;
        case 'doughnut':
          return <Doughnut {...commonProps} />;
        case 'radar':
          return <Radar {...commonProps} />;
        case 'scatter':
          return <Scatter {...commonProps} />;
        default:
          return <div className="text-center text-gray-500 p-4">Unsupported chart type: {chart.type}</div>;
      }
    } catch (error) {
      return (
        <div className="text-center text-red-500 p-4">
          <div className="text-sm">Chart Error</div>
          <div className="text-xs">{String(error)}</div>
        </div>
      );
    }
  };

  // Export chart configuration
  const handleExportChart = (chart: DynamicChart) => {
    const exportData = {
      name: chart.name,
      type: chart.type,
      config: chart.config,
      data: chart.data,
      category: chart.category,
      exported: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chart.name.replace(/\s+/g, '_')}_chart.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Chart configuration exported', 'success');
  };

  if (showMarketplace) {
    return (
      <ChartMarketplace
        onSelectChart={(template) => setSelectedChart({
          id: 'preview',
          name: template.name,
          type: template.type,
          config: template.config,
          data: template.dataStructure.sampleData,
          position: { x: 0, y: 0, width: 1, height: 1 },
          created: new Date().toISOString(),
          source: 'marketplace',
          category: template.category
        })}
        onInstallChart={handleInstallFromMarketplace}
        currentCategory={undefined}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart Builder Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Dynamic Charts ({charts.length})
          </h3>
          <div className="flex gap-2">
            {onToggleMarketplace && (
              <button
                onClick={onToggleMarketplace}
                className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              >
                🏪 Browse Marketplace
              </button>
            )}
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                editMode 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {editMode ? '❌ Exit Edit' : '✏️ Edit Mode'}
            </button>
          </div>
        </div>

        {charts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📈</div>
            <div className="text-lg mb-2">No charts yet</div>
            <div className="text-sm mb-4">Browse the marketplace or ask the AI assistant to suggest charts</div>
            {onToggleMarketplace && (
              <button
                onClick={onToggleMarketplace}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                🏪 Browse Chart Marketplace
              </button>
            )}
          </div>
        )}
      </div>

      {/* Charts Grid */}
      {charts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {charts.map((chart) => (
            <div
              key={chart.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
            >
              {/* Chart Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-800 text-sm">{chart.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span className={`px-1.5 py-0.5 rounded ${
                      chart.source === 'ai' ? 'bg-purple-100 text-purple-700' :
                      chart.source === 'marketplace' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {chart.source === 'ai' ? '🤖 AI' : chart.source === 'marketplace' ? '🏪 Store' : '🎨 Custom'}
                    </span>
                    <span>{chart.type}</span>
                  </div>
                </div>
                {editMode && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleExportChart(chart)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Export chart"
                    >
                      📤
                    </button>
                    <button
                      onClick={() => handleRemoveChart(chart.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Remove chart"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>

              {/* Chart Canvas */}
              <div className="h-48 mb-2">
                {renderChart(chart)}
              </div>

              {/* Chart Footer */}
              <div className="text-xs text-gray-500 text-center">
                Created {new Date(chart.created).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Export types and utils for other components
export { type ChartSuggestion };
export { DynamicChartBuilder };