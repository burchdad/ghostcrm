import React, { useState, useEffect } from "react";
// AI/ML and multi-source imports
// Example: import { fetchExternalData } from '../../utils/dataSources';
// AI config with fallback logic
// Simulate user role (replace with real auth logic)
const userRole = typeof window !== 'undefined' ? (window.localStorage.getItem('userRole') || 'rep') : 'rep';
// Predictive analytics using backend API
async function getAIPrediction(query: string, cardId?: string): Promise<string> {
  try {
    const res = await fetch("/api/dashboard/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: `Analyze this CRM data query and predict future trends: ${query}`, cardId })
    });
    const result = await res.json();
    return result?.result || "AI prediction unavailable.";
  } catch (err) {
    return "AI prediction unavailable: Error occurred.";
  }
}
import { Chart, registerables } from 'chart.js';
import { Chart as ChartJS } from 'react-chartjs-2';
import { ChartEvent } from 'chart.js';
Chart.register(...registerables);

type AnalyticsView = {
  name: string;
  chartType: string;
  groupBy: string;
  metric: string;
  reps: any[];
  status: any[];
  query: string;
  filters?: Record<string, any>;
  shared?: boolean;
  exportable?: boolean;
  color?: string;
  description?: string;
  sources?: string[];
  aiEnabled?: boolean;
};

interface AnalyticsProps {
  customAnalyticsViews: AnalyticsView[];
  setCustomAnalyticsViews: (views: AnalyticsView[]) => void;
  showAnalyticsBuilder: boolean;
  setShowAnalyticsBuilder: (show: boolean) => void;
  newCardTitle: string;
  setNewCardTitle: (title: string) => void;
  newCardType: string;
  setNewCardType: (type: string) => void;
  newCardData: string;
  setNewCardData: (data: string) => void;
}

const Analytics: React.FC<AnalyticsProps> = ({
  customAnalyticsViews,
  setCustomAnalyticsViews,
  showAnalyticsBuilder,
  setShowAnalyticsBuilder,
  newCardTitle,
  setNewCardTitle,
  newCardType,
  setNewCardType,
  newCardData,
  setNewCardData
}) => {
  // Advanced: local state for filter, export, share
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [cardHistory, setCardHistory] = useState<any[]>([]);
  const [filterInput, setFilterInput] = useState<string>("");
  const [exporting, setExporting] = useState(false);
  const [drilldownData, setDrilldownData] = useState<any | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState<number | null>(null);
  const [scheduleEmail, setScheduleEmail] = useState<string>("");
  const [scheduleFreq, setScheduleFreq] = useState<string>("daily");

  // Real-time data streaming (WebSocket demo)
  const [liveData, setLiveData] = useState<any>(null);
  useEffect(() => {
    // Replace with your WebSocket endpoint
    const ws = new WebSocket('wss://demo-ghostcrm-live-data');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLiveData(data);
      } catch {}
    };
    ws.onerror = () => {};
    ws.onclose = () => {};
    return () => ws.close();
  }, []);

  // Simulate multi-source data query (replace with real API/SQL/ETL)
  const runQuery = (query: string, sources: string[] = ["crm", "external"]) => {
    if (liveData) return liveData;
    return {
      labels: ["A", "B", "C", "D"],
      datasets: [{
        label: "Demo",
        data: [Math.random()*100, Math.random()*100, Math.random()*100, Math.random()*100],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e42", "#ef4444"]
      }]
    };
  };

  // Compliance logging
  const logAction = async (action: string, details: any) => {
    await fetch("/api/auditlog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, details, timestamp: new Date().toISOString() })
    });
  };

  // Export chart as image
  const handleExport = async (idx: number) => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1000);
    // In real app, use chart ref to export as PNG
    await logAction("export_analytics", { card: customAnalyticsViews[idx], org: selectedOrg });
    alert(`Exported chart for card ${customAnalyticsViews[idx].name}`);
  };

  // Share card (demo)
  const handleShare = async (idx: number) => {
    await logAction("share_analytics", { card: customAnalyticsViews[idx], org: selectedOrg });
    alert(`Shared analytics card: ${customAnalyticsViews[idx].name}`);
  };

  return (
    <div>
      {/* Organization/Tenant Selector */}
      <div className="mb-4 flex gap-2 items-center">
        <label className="text-sm text-blue-800">Organization</label>
        <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} className="border rounded px-2 py-1">
          <option value="">All</option>
          <option value="org1">Org 1</option>
          <option value="org2">Org 2</option>
        </select>
        <button className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs" onClick={() => setBulkMode(!bulkMode)}>{bulkMode ? "Cancel Bulk" : "Bulk Ops"}</button>
      </div>
      {/* Data Source Management UI */}
      <div className="mb-4 flex gap-2 items-center flex-wrap">
        <span className="font-bold">Data Sources:</span>
        <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => alert('Connect Google Sheets')}>Google Sheets</button>
        <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={() => alert('Connect Salesforce')}>Salesforce</button>
        <button className="px-2 py-1 bg-gray-500 text-white rounded" onClick={() => alert('Connect CSV')}>CSV</button>
        <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => alert('Disconnect All')}>Disconnect All</button>
      </div>
      <div className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Ask a question (e.g. 'Show me sales by rep last month')"
          className="border rounded px-2 py-1 w-full"
          id="nlq-input"
        />
        <button
          className="px-2 py-1 bg-purple-500 text-white rounded"
          onClick={async () => {
            const input = (document.getElementById('nlq-input') as HTMLInputElement).value;
            if (!input) return;
            // Call backend AI service for NLQ parsing
            try {
              const res = await fetch("/api/ai/nlq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: input })
              });
              if (!res.ok) throw new Error("AI NLQ failed");
              const data = await res.json();
              const aiCard = {
                name: data.title || input,
                chartType: data.chartType || "bar",
                groupBy: data.groupBy || "",
                metric: data.metric || "",
                reps: data.reps || [],
                status: data.status || [],
                query: input,
                filters: data.filters || {},
                aiEnabled: true,
                color: data.color || "#a855f7",
                description: data.description || "Generated from natural language query"
              };
              setCustomAnalyticsViews([...customAnalyticsViews, aiCard]);
              await logAction("nlq_analytics_created", { query: input, card: aiCard, org: selectedOrg });
            } catch (err) {
              await logAction("nlq_analytics_error", { query: input, error: err?.message, org: selectedOrg });
              alert("AI parsing failed. Please try again.");
            }
            (document.getElementById('nlq-input') as HTMLInputElement).value = "";
          }}
        >Ask AI</button>
      </div>
      {/* Modal for Analytics Builder */}
      {showAnalyticsBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h3 className="font-bold mb-2">Create Custom Analytics Card</h3>
            <div className="mb-2 flex gap-2 flex-wrap">
              <input type="text" placeholder="Card Title" value={newCardTitle} onChange={e => setNewCardTitle(e.target.value)} className="border rounded px-2 py-1" />
              <select value={newCardType} onChange={e => setNewCardType(e.target.value)} className="border rounded px-2 py-1">
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="doughnut">Doughnut</option>
                <option value="pie">Pie</option>
                <option value="scatter">Scatter</option>
                <option value="radar">Radar</option>
              </select>
              <textarea placeholder="Data Query (JS/SQL/ETL)" value={newCardData} onChange={e => setNewCardData(e.target.value)} className="border rounded px-2 py-1 w-full" />
              <input type="text" placeholder="Description" className="border rounded px-2 py-1 w-full" />
              <input type="color" className="border rounded px-2 py-1" />
              <input type="text" placeholder="Sources (comma separated)" className="border rounded px-2 py-1 w-full" />
              <label className="flex items-center gap-2"><input type="checkbox" /> Enable AI Insights</label>
              {/* Custom Formula Builder */}
              <textarea placeholder="Custom Formula (e.g. SUM(sales) / COUNT(reps))" className="border rounded px-2 py-1 w-full" />
              <div className="text-xs text-gray-500">Define a custom formula for this card. Use supported fields and functions.</div>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => {
                const newCard = {
                  name: newCardTitle,
                  chartType: newCardType,
                  groupBy: "",
                  metric: "",
                  reps: [],
                  status: [],
                  query: newCardData,
                  filters: {},
                  aiEnabled: true
                };
                setCustomAnalyticsViews([...customAnalyticsViews, newCard]);
                setCardHistory([...cardHistory, { action: 'created', card: newCard, timestamp: new Date().toISOString() }]);
                setShowAnalyticsBuilder(false);
                setNewCardTitle("");
                setNewCardType("bar");
                setNewCardData("");
              }}>Save</button>
              <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowAnalyticsBuilder(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Render custom analytics views */}
      {/* Audit Trail & Versioning */}
      <div className="mb-4">
        <h4 className="font-bold text-xs mb-2">Audit Trail</h4>
        <button className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs mb-2" aria-label="Export Audit Trail" onClick={() => {
          const csv = cardHistory.map(h => `${h.action},${h.card.name},${h.timestamp}`).join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `analytics-audit-trail.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }}>Export Audit Trail</button>
        <ul className="text-xs bg-gray-50 rounded p-2">
          {cardHistory.map((h, i) => (
            <li key={i} className="mb-1">
              <span className="font-bold">{h.action}</span> card <span className="text-blue-600">{h.card.name}</span> at {new Date(h.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
      {/* Bulk Operations UI */}
      {bulkMode && (
        <div className="mb-2 flex gap-2">
          <button className="px-2 py-1 bg-red-500 text-white rounded text-xs" aria-label="Bulk Delete Analytics" onClick={async () => {
            setCustomAnalyticsViews(customAnalyticsViews.filter((_, i) => selectedCards.includes(i) ? false : true));
            await logAction("bulk_delete_analytics", { cardIndexes: selectedCards, org: selectedOrg });
            setSelectedCards([]);
            setBulkMode(false);
          }}>Delete Selected</button>
          <button className="px-2 py-1 bg-yellow-500 text-white rounded text-xs" aria-label="Bulk Export Analytics" onClick={async () => {
            for (const idx of selectedCards) {
              await handleExport(idx);
            }
            await logAction("bulk_export_analytics", { cardIndexes: selectedCards, org: selectedOrg });
            setBulkMode(false);
          }}>Export Selected</button>
          <button className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs" aria-label="Cancel Bulk Analytics" onClick={() => setBulkMode(false)}>Cancel</button>
        </div>
      )}
      <ul className="text-sm mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customAnalyticsViews
          .filter(view => {
            // Only admins/managers see cards with 'adminOnly' flag
            if ((view as any).adminOnly && userRole !== 'admin' && userRole !== 'manager') return false;
            // Filter by organization (scaffolded)
            if (selectedOrg && (view as any).org && (view as any).org !== selectedOrg) return false;
            return true;
          })
          .map((view, idx) => (
            <li key={idx} className="mb-4 border rounded p-4 bg-white shadow flex flex-col min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {bulkMode && (
                  <input type="checkbox" checked={selectedCards.includes(idx)} onChange={e => {
                    setSelectedCards(e.target.checked ? [...selectedCards, idx] : selectedCards.filter(i => i !== idx));
                  }} />
                )}
                <span className="font-bold mr-2 text-lg" style={{ color: view.color }}>{view.name}</span>
                <span className="text-xs text-gray-500">{view.chartType}</span>
                <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setActiveCard(activeCard === idx ? null : idx)}>{activeCard === idx ? "Hide" : "Show"} Details</button>
                {view.exportable && <button className="px-2 py-1 bg-yellow-500 text-white rounded" onClick={() => handleExport(idx)}>Export</button>}
                <button className="px-2 py-1 bg-indigo-500 text-white rounded" onClick={() => handleShare(idx)}>Share</button>
                <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={() => setShowScheduleModal(idx)}>Schedule Report</button>
              </div>
              {/* Scheduled Report Modal */}
              {showScheduleModal === idx && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                    <h3 className="font-bold mb-2">Schedule Analytics Report</h3>
                    <input type="email" placeholder="Recipient Email" value={scheduleEmail} onChange={e => setScheduleEmail(e.target.value)} className="border rounded px-2 py-1 w-full mb-2" />
                    <select value={scheduleFreq} onChange={e => setScheduleFreq(e.target.value)} className="border rounded px-2 py-1 w-full mb-2">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <div className="flex gap-2 mt-2">
                      <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => {
                        // Simulate scheduling logic
                        alert(`Scheduled ${view.name} report to ${scheduleEmail} (${scheduleFreq})`);
                        setShowScheduleModal(null);
                        setScheduleEmail("");
                        setScheduleFreq("daily");
                      }}>Save</button>
                      <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowScheduleModal(null)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
              {view.description && <div className="mb-2 text-xs text-gray-600">{view.description}</div>}
              {activeCard === idx && (
                <div className="mb-2">
                  <div className="mb-2">Query: <span className="text-xs text-gray-500">{view.query}</span></div>
                  {/* Chart rendering, drilldown, AI, etc. */}
                  <div className="bg-gray-50 p-2 rounded">
                    <ChartJS type={view.chartType as any} data={runQuery(view.query, view.sources || ["crm"])} />
                  </div>
                  {/* AI Insights */}
                  {view.aiEnabled && (
                    <div className="mt-2 p-2 bg-purple-50 rounded text-purple-700 text-xs">
                      <strong>AI Insights:</strong>
                      <AIPrediction query={view.query} />
                    </div>
                  )}
                  {/* Anomaly Detection (AI) with scheduling */}
                  <div className="mt-2 p-2 bg-red-50 rounded text-red-700 text-xs">
                    <strong>Anomaly Detection:</strong>
                    <AIPrediction query={`Detect anomalies in: ${view.query} for ${scheduleFreq} insights. Suggest adjustments or fixes for any detected issues.`} />
                    <div className="mt-1">
                      <span className="font-bold">Schedule:</span> {scheduleFreq.charAt(0).toUpperCase() + scheduleFreq.slice(1)}
                      <span className="ml-2 text-gray-500">(Automatically runs and updates insights)</span>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
      </ul>
    {exporting && <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded shadow">Exporting chart...</div>}
  </div>
);

// AI Prediction component
function AIPrediction({ query }: { query: string }) {
  const [prediction, setPrediction] = useState<string>("Loading AI insights...");
  React.useEffect(() => {
    getAIPrediction(query).then(setPrediction);
  }, [query]);
  return <div>{prediction}</div>;
}

}

export default Analytics;
