import React from "react";
import { FaCog } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";

interface DashboardChartCardProps {
  chartKey: string;
  chartSettings: any;
  chartData: any;
  chartTypes: string[];
  onOpenSettings: (chartKey: string) => void;
  onExportChart: (chartKey: string) => void;
  onExportImage: (type: "png" | "pdf") => void;
  onAiChartGenerate: () => void;
  onAiAutoLabel: (chartKey: string) => void;
  onAiErrorFix: (chartKey: string) => void;
  onAddComment: (chartKey: string, comment: string) => void;
  onSchedule: (chartKey: string, email: string, freq: string) => void;
  onAccessibility: (chartKey: string, type: "contrast" | "screenReader") => void;
  onAiInsights: (chartKey: string) => void;
  rollbackVersion: (chartKey: string, idx: number) => void;
  t: (key: string) => React.ReactNode;
  aiLoading: boolean;
  ChartComponent: React.ComponentType<any>;
  canEdit: boolean;
  onDrillDown: (chartKey: string, dataPoint: any) => void;
  onConnectDataSource: (chartKey: string, source: string) => void;
  onSavePreset: (chartKey: string) => void;
  onLoadPreset: (chartKey: string) => void;
}

const DashboardChartCard: React.FC<DashboardChartCardProps> = ({
  chartKey,
  chartSettings,
  chartData,
  chartTypes,
  onOpenSettings,
  onExportChart,
  onExportImage,
  onAiChartGenerate,
  onAiAutoLabel,
  onAiErrorFix,
  onAddComment,
  onSchedule,
  onAccessibility,
  onAiInsights,
  rollbackVersion,
  t,
  aiLoading,
  ChartComponent,
  canEdit,
  onDrillDown,
  onConnectDataSource,
  onSavePreset,
  onLoadPreset
}) => {
  const [showActions, setShowActions] = React.useState(false);
  // Hide dropdown before export
  const handleExportImage = (type: "png" | "pdf") => {
    setShowActions(false);
    // Wait for dropdown to close before exporting
    setTimeout(() => onExportImage(type), 100);
  };
  const s = chartSettings[chartKey];
  if (!s) return null;
  // Example data sources
  const dataSources = ["Default", "Google Sheets", "SQL Database"];
  // Drill-down handler for chart click
  function handleChartClick(event: any) {
    // Example: get data point from event
    const dataPoint = { x: "Mon", y: 2 };
    onDrillDown(chartKey, dataPoint);
  }
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6" tabIndex={0} aria-label={`Chart card for ${s.title || chartKey}`}> 
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-md">{s.title || t(chartKey)}</h3>
        {canEdit && (
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button className="px-2 py-1 bg-gray-200 rounded text-xs flex items-center" aria-label="Settings" onClick={() => onOpenSettings(chartKey)}>
                <FaCog className="w-4 h-4" />
              </button>
              <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                Settings
              </span>
            </div>
            <div className="relative">
              <button className="px-2 py-1 bg-gray-200 rounded text-xs flex items-center" aria-label="Chart Actions" onClick={() => setShowActions(a => !a)}>
                <FiMoreVertical className="w-4 h-4" />
              </button>
              {showActions && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded shadow-lg z-20 border">
                  <ul className="flex flex-col gap-1 p-2">
                    <li><button className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100" onClick={() => onExportChart(chartKey)} disabled={!canEdit}>Export CSV</button></li>
                    <li><button className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100" onClick={() => handleExportImage("png")} disabled={!canEdit}>Export PNG</button></li>
                    <li><button className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100" onClick={() => handleExportImage("pdf")} disabled={!canEdit}>Export PDF</button></li>
                    <li><button className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100" onClick={() => onAiChartGenerate()} disabled={aiLoading || !canEdit}>AI Generate</button></li>
                    <li><button className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100" onClick={() => onAiAutoLabel(chartKey)} disabled={aiLoading || !canEdit}>AI Auto-Label</button></li>
                    <li><button className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100" onClick={() => onAiErrorFix(chartKey)} disabled={aiLoading || !canEdit}>AI Error Fix</button></li>
                    <li><button className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100" onClick={() => onAiInsights(chartKey)} disabled={aiLoading || !canEdit}>AI Insights</button></li>
                    <li><button className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100" onClick={() => onDrillDown(chartKey, { point: "example" })} disabled={!canEdit}>Drill Down</button></li>
                    <li><button className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100" onClick={() => onSavePreset(chartKey)} disabled={!canEdit}>Save Preset</button></li>
                    <li><button className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100" onClick={() => onLoadPreset(chartKey)} disabled={!canEdit}>Load Preset</button></li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="mb-2" onClick={handleChartClick} role="button" tabIndex={0} aria-label={`Drill down into ${s.title || chartKey}`}> 
        <ChartComponent data={chartData} options={s.options} />
      </div>
  {/* Comments, Audit, Version History, Accessibility, Schedule, etc. can be added here as needed */}
      {/* Comments, Audit, Version History, Accessibility, Schedule, etc. can be added here as needed */}
    </div>
  );
};

export default DashboardChartCard;
