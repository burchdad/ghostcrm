import React from "react";
import DashboardChartCard from "./DashboardChartCard";

interface DashboardChartGridProps {
  chartSettings: any;
  chartData: any;
  chartTypes: string[];
  chartRefs: any;
  setSettingsModal: (modal: { chart: string | null }) => void;
  handleExportChart: (chartKey: string) => void;
  exportChartAsImage: (chartKey: string, type: "png" | "pdf") => void;
  handleAiChartGenerate: () => void;
  handleAiAutoLabel: (chartKey: string) => void;
  handleAiErrorFix: (chartKey: string) => void;
  handleAddComment: (chartKey: string, comment: string) => void;
  handleSchedule: (chartKey: string, email: string, freq: string) => void;
  handleAccessibility: (chartKey: string, type: "contrast" | "screenReader") => void;
  handleAiInsights: (chartKey: string) => void;
  rollbackVersion: (chartKey: string, idx: number) => void;
  t: (key: string) => React.ReactNode;
  aiLoading: boolean;
  chartComponents: any;
  canEditChart: (chartKey: string) => boolean;
  handleDrillDown: (chartKey: string, dataPoint: any) => void;
  connectDataSource: (chartKey: string, source: string) => void;
  savePreset: (chartKey: string) => void;
  loadPreset: (chartKey: string) => void;
  handlePredictiveAnalytics: (chartKey: string) => void;
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
  handlePredictiveAnalytics
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-6" role="list" aria-label="Dashboard Charts">
      {Object.keys(chartSettings).map((chartKey) => (
        <div key={chartKey} ref={chartRefs[chartKey]} tabIndex={0} aria-label={`Chart card for ${chartKey}`}>
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
      ))}
    </div>
  );
};

export default DashboardChartGrid;
