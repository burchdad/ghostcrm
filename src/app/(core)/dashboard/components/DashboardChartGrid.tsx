import React from "react";
import { DndProvider } from 'react-dnd';
import { useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { 
  Chart,
  ChartData, 
  ChartOptions,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import DashboardChartCard from "./DashboardChartCard";
import '@/styles/dashboard-charts.css';

// Register Chart.js components including Filler for fill option
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Simple chart data interface for basic usage
export interface SimpleChartData {
  sales: ChartData<'bar'>;
  leads: ChartData<'pie'>;
  activity: ChartData<'line'>;
  orgComparison: ChartData<'pie'>;
}

// Props for simple chart grid (like the inline function)
export interface SimpleChartGridProps {
  chartData: SimpleChartData;
  columns?: number;
}

// Props for complex chart grid (original functionality)
export interface ComplexChartGridProps {
  chartSettings: any;
  chartData: any;
  chartTypes: string[];
  chartRefs: any;
  setSettingsModal: any;
  handleExportChart: any;
  exportChartAsImage: any;
  handleAiChartGenerate: any;
  handleAiAutoLabel: any;
  handleAiErrorFix: any;
  handleAddComment: any;
  handleSchedule: any;
  handleAccessibility: any;
  handleAiInsights: any;
  rollbackVersion: any;
  t: any;
  aiLoading: boolean;
  chartComponents: any;
  canEditChart: any;
  handleDrillDown: any;
  connectDataSource: any;
  savePreset: any;
  loadPreset: any;
  handlePredictiveAnalytics: any;
  chartKeys: string[];
  moveChart: (fromIdx: number, toIdx: number) => void;
  chartConnectionStatus?: {[key: string]: 'online' | 'offline' | 'syncing'};
  chartLastRefresh?: {[key: string]: Date};
  columns?: number;
}

// Union type for all possible props
export type DashboardChartGridProps = SimpleChartGridProps | ComplexChartGridProps;

// Chart options (moved from DashboardCharts.tsx)
const barChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
      },
    },
    tooltip: {
      intersect: false,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#6b7280' },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: { color: '#6b7280' },
      border: { display: false },
    },
  },
}

const lineChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
      },
    },
    tooltip: {
      intersect: false,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#6b7280' },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: { color: '#6b7280' },
      border: { display: false },
    },
  },
}

const pieChartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
      },
    },
    tooltip: {
      intersect: false,
    },
  },
}

// Type guard to check if props are for simple chart grid
function isSimpleChartGrid(props: DashboardChartGridProps): props is SimpleChartGridProps {
  return 'chartData' in props && 
         typeof props.chartData === 'object' && 
         'sales' in props.chartData && 
         'leads' in props.chartData && 
         'activity' in props.chartData && 
         'orgComparison' in props.chartData;
}

const DashboardChartGrid: React.FC<DashboardChartGridProps> = (props) => {
  // Handle simple chart grid case (like the inline function)
  if (isSimpleChartGrid(props)) {
    const { chartData, columns = 4 } = props as SimpleChartGridProps & { columns?: number };

    return (
      <div
        className="dashboard-grid"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        role="list"
        aria-label="Dashboard Charts"
        tabIndex={0}
      >
        {/* Revenue */}
        <div className="chart-card chart-card--blue" role="listitem">
          <div className="chart-card__header">
            <h4 className="chart-card__title">Revenue</h4>
            <ArrowsPointingOutIcon className="chart-card__icon" />
          </div>
          <div className="chart-card__body">
            <Bar data={chartData.sales} options={barChartOptions} />
          </div>
        </div>

        {/* Leads */}
        <div className="chart-card chart-card--green" role="listitem">
          <div className="chart-card__header">
            <h4 className="chart-card__title">Leads</h4>
            <ArrowsPointingOutIcon className="chart-card__icon" />
          </div>
          <div className="chart-card__body">
            <Pie data={chartData.leads} options={pieChartOptions} />
          </div>
        </div>

        {/* Activity */}
        <div className="chart-card chart-card--amber" role="listitem">
          <div className="chart-card__header">
            <h4 className="chart-card__title">Activity</h4>
            <ArrowsPointingOutIcon className="chart-card__icon" />
          </div>
          <div className="chart-card__body">
            <Line data={chartData.activity} options={lineChartOptions} />
          </div>
        </div>

        {/* Org Score */}
        <div className="chart-card chart-card--violet" role="listitem">
          <div className="chart-card__header">
            <h4 className="chart-card__title">Org Score</h4>
            <ArrowsPointingOutIcon className="chart-card__icon" />
          </div>
          <div className="chart-card__body">
            <Pie data={chartData.orgComparison} options={pieChartOptions} />
          </div>
        </div>
      </div>
    );
  }

  // Handle complex chart grid case (original functionality)
  const complexProps = props as ComplexChartGridProps;
  const {
    chartSettings,
    chartData,
    chartTypes,
    chartRefs,
    setSettingsModal,
    handleExportChart,
    exportChartAsImage,
    handleAiChartGenerate,
    handleAiAutoLabel,
    handleAiErrorFix,
    handleAddComment,
    handleSchedule,
    handleAccessibility,
    handleAiInsights,
    rollbackVersion,
    t,
    aiLoading,
    chartComponents,
    canEditChart,
    handleDrillDown,
    connectDataSource,
    savePreset,
    loadPreset,
    handlePredictiveAnalytics,
    chartKeys,
    moveChart,
    chartConnectionStatus,
    chartLastRefresh,
    columns = 4
  } = complexProps;

  // Accept chartKeys prop for filtered charts
  const keysToRender = chartKeys !== undefined ? chartKeys : Object.keys(chartSettings);

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="dashboard-grid dashboard-grid--complex"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        role="list"
        aria-label="Dashboard Charts"
        tabIndex={0}
      >
        {keysToRender.map((chartKey, idx) => {
          const [{ isDragging }, drag] = useDrag(() => ({
            type: 'CHART_CARD',
            item: { idx },
            collect: (monitor) => ({ isDragging: monitor.isDragging() }),
          }), [idx]);

          const [, drop] = useDrop(() => ({
            accept: 'CHART_CARD',
            hover: (item: any) => {
              if (item.idx !== idx) {
                moveChart(item.idx, idx);
                item.idx = idx;
              }
            },
          }), [idx]);

          const contrast = chartSettings[chartKey]?.accessibility?.contrast;

          return (
            <div
              key={chartKey}
              ref={(node) => {
                if (!node) return;
                drag(drop(node));
                if (chartRefs[chartKey]) chartRefs[chartKey].current = node;
              }}
              className={`chart-card${contrast ? ' chart-card--contrast' : ''}`}
              role="listitem"
              tabIndex={0}
              aria-label={`Chart card for ${chartKey}`}
              style={{ opacity: isDragging ? 0.5 : 1 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSettingsModal({ chart: chartKey });
              }}
            >
              <DashboardChartCard
                chartKey={chartKey}
                chartSettings={chartSettings}
                chartData={chartData[chartKey]}
                chartTypes={chartTypes}
                onOpenSettings={(key) => setSettingsModal({ chart: key })}
                onExportChart={handleExportChart}
                onExportImage={(type) => exportChartAsImage(chartKey, type)}
                onAiChartGenerate={handleAiChartGenerate}
                onAiAutoLabel={handleAiAutoLabel}
                onAiErrorFix={handleAiErrorFix}
                onAddComment={handleAddComment}
                onSchedule={handleSchedule}
                onAccessibility={handleAccessibility}
                onAiInsights={handleAiInsights}
                rollbackVersion={rollbackVersion}
                t={t}
                aiLoading={aiLoading}
                ChartComponent={chartComponents[chartSettings[chartKey].type]}
                canEdit={canEditChart(chartKey)}
                onDrillDown={handleDrillDown}
                onConnectDataSource={connectDataSource}
                onSavePreset={savePreset}
                onLoadPreset={loadPreset}
                connectionStatus={chartConnectionStatus?.[chartKey] || 'online'}
                lastRefresh={chartLastRefresh?.[chartKey] || new Date()}
              />
            </div>
          );
        })}
      </div>
    </DndProvider>
  );
};

export default DashboardChartGrid;
