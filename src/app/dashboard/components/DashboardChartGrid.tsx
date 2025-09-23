import React from "react";
import { DndProvider } from 'react-dnd';
import { useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DashboardChartCard from "./DashboardChartCard";

export interface DashboardChartGridProps {
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
}

const DashboardChartGrid: React.FC<DashboardChartGridProps> = ({
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
  moveChart
}) => {
  // Accept chartKeys prop for filtered charts
  const keysToRender = chartKeys !== undefined ? chartKeys : Object.keys(chartSettings);

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6"
        role="list"
        aria-label="Dashboard Charts"
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        {keysToRender.map((chartKey, idx) => {
          const [{ isDragging }, drag] = useDrag(() => ({
            type: 'CHART_CARD',
            item: { idx },
            collect: (monitor) => ({ isDragging: monitor.isDragging() })
          }), [idx]);
          const [, drop] = useDrop(() => ({
            accept: 'CHART_CARD',
            hover: (item: any) => {
              if (item.idx !== idx) {
                moveChart(item.idx, idx);
                item.idx = idx;
              }
            }
          }), [idx]);
          return (
            <div
              key={chartKey}
              ref={node => {
                drag(drop(node));
                if (chartRefs[chartKey]) chartRefs[chartKey].current = node;
              }}
              tabIndex={0}
              aria-label={`Chart card for ${chartKey}`}
              style={{
                opacity: isDragging ? 0.5 : 1,
                outline: 'none',
                background: chartSettings[chartKey]?.accessibility?.contrast ? '#000' : undefined,
                color: chartSettings[chartKey]?.accessibility?.contrast ? '#fff' : undefined,
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSettingsModal({ chart: chartKey });
                }
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
              />
            </div>
          );
        })}
      </div>
    </DndProvider>
  );
};

export default DashboardChartGrid;
