import React, { useState } from "react";

interface ChartSettingsModalProps {
  chartKey: string;
  chartSettings: any;
  chartTypes: string[];
  setChartSettings: (fn: (s: any) => any) => void;
  handleExportChart: (chartKey: string) => void;
  handleExportImage: (type: "png" | "pdf") => void;
  handleAiChartGenerate: () => void;
  handleAiAutoLabel: (chartKey: string) => void;
  handleAiErrorFix: (chartKey: string) => void;
  handleAddComment: (chartKey: string, comment: string) => void;
  handleSchedule: (chartKey: string, email: string, freq: string) => void;
  handleAccessibility: (chartKey: string, type: "contrast" | "screenReader") => void;
  handleAiInsights: (chartKey: string) => void;
  rollbackVersion: (chartKey: string, idx: number) => void;
  t: (key: string) => React.ReactNode;
  onClose: () => void;
  aiLoading: boolean;
  onSavePreset: (chartKey: string) => void;
  onLoadPreset: (chartKey: string) => void;
  canEdit: boolean;
  onConnectDataSource: (chartKey: string, source: string) => void;
  onPredictiveAnalytics: (chartKey: string) => void;
}

const ChartSettingsModal: React.FC<ChartSettingsModalProps> = ({
  chartKey,
  chartSettings,
  chartTypes,
  setChartSettings,
  handleExportChart,
  handleExportImage,
  handleAiChartGenerate,
  handleAiAutoLabel,
  handleAiErrorFix,
  handleAddComment,
  handleSchedule,
  handleAccessibility,
  handleAiInsights,
  rollbackVersion,
  t,
  onClose,
  aiLoading,
  onSavePreset,
  onLoadPreset,
  canEdit,
  onConnectDataSource,
  onPredictiveAnalytics
}) => {
  const s = chartSettings[chartKey];
  if (!s) return null;
  const dataSources = ["Default", "Google Sheets", "SQL Database"];
  const tabs = [
    { key: "chart", label: "Chart" },
    { key: "data", label: "Data" },
    { key: "ai", label: "AI" },
    { key: "schedule", label: "Schedule" },
    { key: "access", label: "Accessibility" },
    { key: "history", label: "History" }
  ];
  const [activeTab, setActiveTab] = useState("chart");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg min-w-[320px] w-full max-w-[600px] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 pt-6 pb-2 border-b sticky top-0 bg-white z-10">
          <h2 className="font-bold text-lg">{t("Chart Settings")}: {t(chartKey)}</h2>
          <button className="px-3 py-1 bg-gray-700 text-white rounded" onClick={onClose}>Close</button>
        </div>
        <div className="flex gap-2 px-6 pt-2 pb-2 border-b bg-white sticky top-[56px] z-10">
          {tabs.map(tab => (
            <button key={tab.key} className={`px-3 py-1 rounded text-xs font-semibold ${activeTab === tab.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
          ))}
        </div>
        <div className="overflow-y-auto px-6 py-4 flex-1">
          {activeTab === "chart" && (
            <div className="grid grid-cols-2 gap-4">
              {/* Chart Type, Legend, Grid, Title, X/Y Axis, Colors */}
              <div>
                <label className="block text-xs mb-1">Chart Type</label>
                <select value={s.type} onChange={e => setChartSettings(cs => ({ ...cs, [chartKey]: { ...cs[chartKey], type: e.target.value } }))} className="border rounded px-2 py-1 text-xs w-full">
                  {chartTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Legend</label>
                <input type="checkbox" checked={s.legend} onChange={e => setChartSettings(cs => ({ ...cs, [chartKey]: { ...cs[chartKey], legend: e.target.checked } }))} />
              </div>
              <div>
                <label className="block text-xs mb-1">Grid Lines</label>
                <input type="checkbox" checked={s.grid} onChange={e => setChartSettings(cs => ({ ...cs, [chartKey]: { ...cs[chartKey], grid: e.target.checked } }))} />
              </div>
              <div>
                <label className="block text-xs mb-1">Title</label>
                <input type="text" value={s.title} onChange={e => setChartSettings(cs => ({ ...cs, [chartKey]: { ...cs[chartKey], title: e.target.value } }))} className="border rounded px-2 py-1 text-xs w-full" />
              </div>
              <div>
                <label className="block text-xs mb-1">X Axis Label</label>
                <input type="text" value={s.xLabel} onChange={e => setChartSettings(cs => ({ ...cs, [chartKey]: { ...cs[chartKey], xLabel: e.target.value } }))} className="border rounded px-2 py-1 text-xs w-full" />
              </div>
              <div>
                <label className="block text-xs mb-1">Y Axis Label</label>
                <input type="text" value={s.yLabel} onChange={e => setChartSettings(cs => ({ ...cs, [chartKey]: { ...cs[chartKey], yLabel: e.target.value } }))} className="border rounded px-2 py-1 text-xs w-full" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs mb-1">Colors (multiple for Pie/Bar/Line)</label>
                <div className="flex gap-2 flex-wrap">
                  {s.colors.map((c: string, i: number) => (
                    <input key={i} type="color" value={c} onChange={e => {
                      const newColors = [...s.colors];
                      newColors[i] = e.target.value;
                      setChartSettings(cs => ({ ...cs, [chartKey]: { ...cs[chartKey], colors: newColors } }));
                    }} className="w-8 h-8 border rounded" />
                  ))}
                  <button className="px-2 py-1 bg-gray-100 text-xs rounded" onClick={() => setChartSettings(cs => ({ ...cs, [chartKey]: { ...cs[chartKey], colors: [...cs[chartKey].colors, "#888888"] } }))}>+</button>
                  {s.colors.length > 1 && (
                    <button className="px-2 py-1 bg-gray-100 text-xs rounded" onClick={() => setChartSettings(cs => ({ ...cs, [chartKey]: { ...cs[chartKey], colors: cs[chartKey].colors.slice(0, -1) } }))}>-</button>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === "data" && (
            <div>
              <label className="block text-xs mb-1">Query (scaffolded, SQL-like)</label>
              <textarea value={s.query} onChange={e => setChartSettings(cs => ({ ...cs, [chartKey]: { ...cs[chartKey], query: e.target.value } }))} className="border rounded px-2 py-1 text-xs w-full h-16 font-mono" spellCheck={false} />
              <div className="flex gap-2 mt-2">
                <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs" onClick={() => handleExportChart(chartKey)} disabled={!canEdit}>Export CSV</button>
                <button className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs" onClick={() => handleExportImage("png")} disabled={!canEdit}>Export PNG</button>
                <button className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs" onClick={() => handleExportImage("pdf")} disabled={!canEdit}>Export PDF</button>
                <button className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs" onClick={() => onSavePreset(chartKey)} disabled={!canEdit}>Save Preset</button>
                <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs" onClick={() => onLoadPreset(chartKey)} disabled={!canEdit}>Load Preset</button>
                <button className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs" onClick={() => alert('Share preset coming soon!')} disabled={!canEdit}>Share Preset</button>
              </div>
              <div className="mt-2">
                <label className="block text-xs mb-1">Custom Formula (e.g. SUM(messages)/COUNT(days))</label>
                <textarea className="border rounded px-2 py-1 text-xs w-full h-10 font-mono" value={s.formula} onChange={e => setChartSettings(cs => ({ ...cs, [chartKey]: { ...cs[chartKey], formula: e.target.value } }))} placeholder="Enter custom formula..." spellCheck={false} />
                <button className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs mt-1" onClick={() => handleAiErrorFix(chartKey)} disabled={aiLoading}>Fix Formula with AI</button>
              </div>
              <div className="mt-2">
                <label className="block text-xs mb-1">Comments</label>
                <div className="mb-2">
                  {s.comments.map((c: any, i: number) => (
                    <div key={i} className="text-xs mb-1">{c.text} <span className="text-gray-400">({new Date(c.ts).toLocaleString()})</span></div>
                  ))}
                </div>
                <textarea className="border rounded px-2 py-1 text-xs w-full h-10" placeholder="Add a comment..." onBlur={e => { if (e.target.value) { handleAddComment(chartKey, e.target.value); e.target.value = ""; } }} />
              </div>
            </div>
          )}
          {activeTab === "schedule" && (
            <div>
              <label className="block text-xs mb-1">Schedule Report</label>
              <div className="flex gap-2">
                <input type="email" className="border rounded px-2 py-1 text-xs" placeholder="Email" value={s.schedule.email} onChange={e => setChartSettings(cs => ({ ...cs, [chartKey]: { ...cs[chartKey], schedule: { ...cs[chartKey].schedule, email: e.target.value } } }))} />
                <select className="border rounded px-2 py-1 text-xs" value={s.schedule.freq} onChange={e => setChartSettings(cs => ({ ...cs, [chartKey]: { ...cs[chartKey], schedule: { ...cs[chartKey].schedule, freq: e.target.value } } }))}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <button className="px-2 py-1 bg-green-500 text-white rounded text-xs" onClick={() => handleSchedule(chartKey, s.schedule.email, s.schedule.freq)}>Schedule</button>
              </div>
            </div>
          )}
          {activeTab === "access" && (
            <div>
              <label className="block text-xs mb-1">Accessibility</label>
              <div className="flex gap-2">
                <button className={`px-2 py-1 rounded text-xs ${s.accessibility.contrast ? "bg-black text-white" : "bg-gray-100 text-black"}`} onClick={() => handleAccessibility(chartKey, "contrast")}>High Contrast</button>
                <button className={`px-2 py-1 rounded text-xs ${s.accessibility.screenReader ? "bg-blue-900 text-white" : "bg-gray-100 text-black"}`} onClick={() => handleAccessibility(chartKey, "screenReader")}>Screen Reader</button>
              </div>
            </div>
          )}
          {activeTab === "ai" && (
            <div>
              <label className="block text-xs mb-1">AI Insights & Anomaly Detection</label>
              <div className="bg-purple-50 rounded p-2 text-purple-700 text-xs mb-2">{s.aiInsights || "No insights yet."}</div>
              <button className="px-2 py-1 bg-purple-500 text-white rounded text-xs" onClick={() => handleAiInsights(chartKey)} disabled={aiLoading}>Run AI Insights</button>
              <div className="mt-4">
                <label className="block text-xs mb-1">External Data Source</label>
                <select className="border rounded px-2 py-1 text-xs w-full" value={s.dataSource || dataSources[0]} onChange={e => setChartSettings(cs => ({ ...cs, [chartKey]: { ...cs[chartKey], dataSource: e.target.value } }))} disabled={!canEdit}>
                  {dataSources.map(src => <option key={src} value={src}>{src}</option>)}
                </select>
              </div>
              <div className="mt-4">
                <button className="px-2 py-1 bg-orange-600 text-white rounded text-xs" onClick={() => onPredictiveAnalytics(chartKey)}>
                  Run Predictive Analytics
                </button>
              </div>
            </div>
          )}
          {activeTab === "history" && (
            <div>
              <div className="mb-4">
                <div className="font-bold text-xs mb-2">Activity Feed</div>
                <div className="bg-gray-100 rounded p-2 text-xs max-h-24 overflow-y-auto">
                  {s.audit.length === 0 ? <div>No activity yet.</div> : s.audit.map((a: any, i: number) => (
                    <div key={i}>{a.action}: {a.details ? JSON.stringify(a.details) : ""} <span className="text-gray-400">({new Date(a.timestamp).toLocaleString()})</span></div>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <div className="font-bold text-xs mb-2">Version History</div>
                <div className="bg-gray-100 rounded p-2 text-xs max-h-24 overflow-y-auto">
                  {s.versions.length === 0 ? <div>No versions yet.</div> : s.versions.map((v: any, i: number) => (
                    <div key={i}>v{i + 1}: {v.title} <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs ml-2" onClick={() => rollbackVersion(chartKey, i)}>Rollback</button></div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <button className="px-3 py-1 bg-gray-700 text-white rounded mr-2 mt-4 self-end" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ChartSettingsModal;
