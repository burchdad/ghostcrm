"use client";
import React, { useState, useCallback } from "react";
import Link from "next/link";
import { Chart as ChartJS, ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { Bar, Line, Pie, Doughnut, Radar, Scatter } from "react-chartjs-2";
import { useDrag, useDrop } from 'react-dnd';
import { useToast } from "@/components/utils/ToastProvider";
import ChartMarketplaceModal from "./marketplace/Modal/ChartMarketplaceModal";

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

// Drag and drop item types
const ItemTypes = {
  CHART: 'chart'
};

export interface CustomChart {
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

interface CustomChartsManagerProps {
  charts: CustomChart[];
  onChartsChange: (charts: CustomChart[]) => void;
  currentData?: any;
}

// Draggable Chart Component
interface DraggableChartProps {
  chart: CustomChart;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onExport: (chart: CustomChart) => void;
  onRemove: (chartId: string) => void;
  renderChart: (chart: CustomChart) => React.ReactNode;
}

function DraggableChart({ 
  chart, 
  index, 
  onMove, 
  onExport, 
  onRemove, 
  renderChart 
}: DraggableChartProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CHART,
    item: { id: chart.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.CHART,
    hover: (item: { id: string; index: number }, monitor) => {
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => {
        drag(node);
        drop(node);
      }}
      className={`bg-white rounded-lg border border-gray-200 p-4 transition-all cursor-move relative group ${
        isDragging ? 'opacity-50 rotate-1 scale-105 shadow-xl z-50' : 'hover:shadow-md'
      } ${isOver ? 'ring-2 ring-blue-300 bg-blue-50' : ''}`}
    >
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(chart.id);
        }}
        className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        title="Remove chart"
      >
        ✕
      </button>

      {/* Drag Handle */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-gray-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <span>⋮⋮</span>
          <span className="text-xs">Drag</span>
        </div>
      </div>

      {/* Chart Header */}
      <div className="flex justify-between items-start mb-3 mt-2">
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExport(chart);
          }}
          className="p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          title="Export chart"
        >
          📄
        </button>
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
  );
}

export default function CustomChartsManager({ 
  charts, 
  onChartsChange, 
  currentData 
}: CustomChartsManagerProps) {
  const { show: showToast } = useToast();
  const [showMarketplace, setShowMarketplace] = useState(false);

  // Handle chart installation from marketplace
  const handleInstallChart = (chart: any) => {
    console.log('📊 Installing chart from marketplace:', chart);
    
    // Generate better sample data based on chart type
    const generateSampleData = (type: string, name: string) => {
      const commonLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
      
      switch (type) {
        case 'pie':
        case 'doughnut':
          return {
            labels: ['Sales', 'Marketing', 'Support', 'Development'],
            datasets: [{
              label: name,
              data: [30, 25, 20, 25],
              backgroundColor: colors.slice(0, 4),
              borderWidth: 1
            }]
          };
        case 'bar':
          return {
            labels: commonLabels,
            datasets: [{
              label: name,
              data: [12, 19, 15, 25, 22, 18],
              backgroundColor: colors[0],
              borderColor: colors[0],
              borderWidth: 1
            }]
          };
        case 'line':
          return {
            labels: commonLabels,
            datasets: [{
              label: name,
              data: [10, 20, 15, 25, 22, 30],
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderColor: colors[0],
              borderWidth: 2,
              fill: false,
              tension: 0.4
            }]
          };
        default:
          return {
            labels: commonLabels,
            datasets: [{
              label: name,
              data: [10, 20, 15, 25, 22, 18],
              backgroundColor: colors[0],
              borderColor: colors[0]
            }]
          };
      }
    };

    const newChart: CustomChart = {
      id: `chart_${Date.now()}`,
      name: chart.name,
      type: chart.type,
      config: {
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: chart.name
            }
          },
          ...(chart.config?.options || {})
        }
      },
      data: chart.sampleData || chart.data || generateSampleData(chart.type, chart.name),
      position: { x: 0, y: charts.length, width: 1, height: 1 },
      created: new Date().toISOString(),
      source: chart.source || 'marketplace',
      category: chart.category || 'General'
    };
    
    console.log('📊 Generated chart object:', newChart);
    
    const updatedCharts = [...charts, newChart];
    onChartsChange(updatedCharts);
    showToast(`"${chart.name}" installed successfully!`, 'success');
    setShowMarketplace(false); // Close the marketplace modal
  };

  // Remove chart
  const handleRemoveChart = (chartId: string) => {
    const updatedCharts = charts.filter(chart => chart.id !== chartId);
    onChartsChange(updatedCharts);
    showToast('Chart removed from dashboard', 'info');
  };

  // Move chart (drag and drop)
  const handleMoveChart = useCallback((dragIndex: number, hoverIndex: number) => {
    const draggedChart = charts[dragIndex];
    const updatedCharts = [...charts];
    
    updatedCharts.splice(dragIndex, 1);
    updatedCharts.splice(hoverIndex, 0, draggedChart);
    
    const reorderedCharts = updatedCharts.map((chart, index) => ({
      ...chart,
      position: {
        ...chart.position,
        y: index
      }
    }));
    
    onChartsChange(reorderedCharts);
  }, [charts, onChartsChange]);

  // Render specific chart type
  const renderChart = (chart: CustomChart) => {
    // Validate chart data structure
    if (!chart.data || !chart.data.labels || !chart.data.datasets) {
      return (
        <div className="text-center text-red-500 p-4">
          <div className="text-sm">Invalid Chart Data</div>
          <div className="text-xs">Chart data is missing required labels or datasets</div>
        </div>
      );
    }

    const commonProps = {
      data: chart.data,
      options: chart.config?.options || {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          }
        }
      },
      key: chart.id
    };

    try {
      switch (chart.type) {
        case 'bar':
          return <Bar {...commonProps} />;
        case 'line':
          return <Line {...commonProps} />;
        case 'area':
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
          return (
            <div className="text-center text-yellow-500 p-4">
              <div className="text-sm">Unsupported Chart Type</div>
              <div className="text-xs">Chart type "{chart.type}" is not supported</div>
            </div>
          );
      }
    } catch (error) {
      console.error('Chart rendering error:', error, 'Chart data:', chart);
      return (
        <div className="text-center text-red-500 p-4">
          <div className="text-sm">Chart Render Error</div>
          <div className="text-xs">{error instanceof Error ? error.message : 'Unknown error occurred'}</div>
          <div className="text-xs mt-1">Check browser console for details</div>
        </div>
      );
    }
  };

  // Export chart configuration
  const handleExportChart = (chart: CustomChart) => {
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

  // Save entire chart layout
  const handleSaveLayout = () => {
    const layoutData = {
      version: '1.0',
      savedAt: new Date().toISOString(),
      totalCharts: charts.length,
      charts: charts.map(chart => ({
        id: chart.id,
        name: chart.name,
        type: chart.type,
        config: chart.config,
        data: chart.data,
        position: chart.position,
        created: chart.created,
        source: chart.source,
        category: chart.category
      }))
    };

    const blob = new Blob([JSON.stringify(layoutData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_chart_layout_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Chart layout saved! (${charts.length} charts)`, 'success');
  };

  // Load chart layout from file
  const handleLoadLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const layoutData = JSON.parse(result);
        
        if (layoutData.charts && Array.isArray(layoutData.charts)) {
          onChartsChange(layoutData.charts);
          showToast(`Layout loaded! (${layoutData.charts.length} charts)`, 'success');
        } else {
          showToast('Invalid layout file format', 'error');
        }
      } catch (error) {
        showToast('Failed to load layout file', 'error');
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Chart Management Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900">
            Custom Charts {charts.length > 0 && <span className="text-sm text-gray-500">({charts.length})</span>}
          </h3>
          {charts.length > 0 && (
            <div className="text-xs text-gray-500">
              Drag charts to reorder • Click to customize
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Load Layout Button */}
          {charts.length > 0 && (
            <>
              <label className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors cursor-pointer inline-flex items-center gap-2 text-sm">
                📂 Load Layout
                <input
                  type="file"
                  accept=".json"
                  onChange={handleLoadLayout}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={handleSaveLayout}
                className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors inline-flex items-center gap-2 text-sm"
                title="Save current chart layout"
              >
                💾 Save Layout
              </button>
            </>
          )}
          
          {/* Add Chart Button */}
          <button
            onClick={() => setShowMarketplace(true)}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors inline-flex items-center gap-2 text-sm"
          >
            ➕ Add Chart
          </button>
        </div>
      </div>    

      {/* Charts Display */}
      {charts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-3">📊</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No custom charts yet</h4>
            <p className="text-sm text-gray-600 mb-6">
              Get started by browsing our marketplace or using AI to generate charts
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowMarketplace(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
              >
                🏪 Open Chart Marketplace
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {charts.map((chart, index) => (
            <DraggableChart
              key={chart.id}
              chart={chart}
              index={index}
              onMove={handleMoveChart}
              onExport={handleExportChart}
              onRemove={handleRemoveChart}
              renderChart={renderChart}
            />
          ))}
        </div>
      )}

      {/* Chart Marketplace Modal */}
      <ChartMarketplaceModal 
        open={showMarketplace}
        onClose={() => setShowMarketplace(false)}
        onInstall={handleInstallChart}
      />
    </div>
  );
}
