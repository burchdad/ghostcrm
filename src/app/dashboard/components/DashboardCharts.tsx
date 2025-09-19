import React, { useState, useEffect, useRef } from "react";
import { Chart, ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import DashboardChartCard from "./DashboardChartCard";
// import { Responsive, WidthProvider } from "react-grid-layout";
// const ResponsiveGridLayout = WidthProvider(Responsive);
import DashboardChartGrid from "./DashboardChartGrid";
// For PDF/PNG export
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
import ChartSettingsModal from "./ChartSettingsModal";
import AIChartGenerator from "./AIChartGenerator";
import DashboardNotification from "./DashboardNotification";
import AuditHistoryBar from "./AuditHistoryBar";
import DashboardToolbar from "./DashboardToolbar";

// Register required Chart.js elements/controllers
Chart.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);
import { Bar, Line, Pie } from "react-chartjs-2";

interface DashboardChartsProps {
  analytics: {
    orgScore: number;
  };
  t: (key: string) => React.ReactNode;
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<null | Error>(null);
  if (error) return <div className="text-red-500">Chart Error: {error.message}</div>;
  return children;
}

const chartTypes = ["Bar", "Line", "Pie"];

const DashboardCharts: React.FC<DashboardChartsProps> = ({ analytics, t }) => {
  // Chart data (now inside component, uses analytics)
  const chartData = {
    messages: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      datasets: [{ label: "Messages", data: [2, 4, 3, 5, 6], backgroundColor: "#22c55e" }],
    },
    aiAlerts: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      datasets: [{ label: "AI Alerts", data: [1, 2, 1, 3, 2], backgroundColor: "#3b82f6" }],
    },
    auditLog: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      datasets: [{ label: "Audit Log", data: [0, 1, 2, 1, 2], backgroundColor: "#facc15" }],
    },
    orgComparison: {
      labels: ["Org 1", "Org 2"],
      datasets: [{ label: "Score", data: [analytics.orgScore, 100 - analytics.orgScore], backgroundColor: ["#a78bfa", "#f472b6"] }],
    },
  };

  // --- Real-time Data Updates ---
  const [liveData, setLiveData] = useState(chartData);
  useEffect(() => {
    // Example: Polling every 10s (replace with WebSocket for production)
    const interval = setInterval(() => {
      fetch("/api/dashboard/live")
        .then(res => res.json())
        .then(data => setLiveData(data))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- Chart Presets & Templates ---
  function savePreset(chartKey: string) {
  localStorage.setItem(`chartPreset_${chartKey}`, JSON.stringify(chartSettings[chartKey]));
  notifyUser(`Preset saved for ${chartKey}`);
  }
  function loadPreset(chartKey: string) {
    const preset = localStorage.getItem(`chartPreset_${chartKey}`);
    if (preset) {
      setChartSettings(s => ({ ...s, [chartKey]: JSON.parse(preset) }));
      notifyUser(`Preset loaded for ${chartKey}`);
    } else {
      notifyUser(`No preset found for ${chartKey}`);
    }
  }

  // --- User Permissions (scaffold) ---
  const userRole = "admin"; // Replace with real auth context
  function canEditChart(chartKey: string) {
    // Example: Only admin can edit orgComparison
    return userRole === "admin" || chartKey !== "orgComparison";
  }

  // --- Customizable Dashboard Layout (scaffold) ---
  const [layout, setLayout] = useState([
    { i: "messages", x: 0, y: 0, w: 1, h: 1 },
    { i: "aiAlerts", x: 1, y: 0, w: 1, h: 1 },
    { i: "auditLog", x: 0, y: 1, w: 1, h: 1 },
    { i: "orgComparison", x: 1, y: 1, w: 1, h: 1 },
  ]);
  // To implement: Use ResponsiveGridLayout for drag-and-drop

  // --- Export to PDF/PNG (scaffold) ---
  const chartRefs = {
    messages: useRef(null),
    aiAlerts: useRef(null),
    auditLog: useRef(null),
    orgComparison: useRef(null),
  };
  function exportChartAsImage(chartKey: string, type: "png" | "pdf") {
    // Use html2canvas for PNG, jsPDF for PDF
    import('html2canvas').then(html2canvas => {
      const chartElem = chartRefs[chartKey]?.current;
      if (!chartElem) {
        notifyUser('Chart element not found.');
        return;
      }
      html2canvas.default(chartElem).then(canvas => {
        if (type === 'png') {
          const link = document.createElement('a');
          link.download = `${chartKey}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          notifyUser('Chart exported as PNG.');
        } else if (type === 'pdf') {
          import('jspdf').then(jsPDF => {
            const pdf = new jsPDF.jsPDF({ orientation: 'landscape' });
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 10, 10, 280, 150);
            pdf.save(`${chartKey}.pdf`);
            notifyUser('Chart exported as PDF.');
          });
        }
      });
    });
  }
  // --- Drill-Down & Filtering (scaffold) ---
  function handleDrillDown(chartKey: string, dataPoint: any) {
    // Show modal or filter other charts based on dataPoint
    notifyUser(`Drill-down: ${chartKey} - ${JSON.stringify(dataPoint)}`);
  }

  // --- Notifications & Alerts (scaffold) ---
  function notifyUser(message: string) {
    // Integrate with notification system
    alert(message);
  }
  // Notification effect moved to modular component if needed

  // --- External Data Sources (scaffold) ---
  function connectDataSource(chartKey: string, source: string) {
    // UI for selecting source, backend connector
    alert(`Connect ${chartKey} to ${source}`);
  }

  // --- Advanced AI Features (scaffold) ---
  function handlePredictiveAnalytics(chartKey: string) {
    // Call backend for prediction
    alert(`Predictive analytics for ${chartKey}`);
  }

  // --- Accessibility Improvements (scaffold) ---
  // Add aria-labels, keyboard navigation, high-contrast toggle, etc. in all components
  // Per-chart state
  const [chartSettings, setChartSettings] = useState({
    messages: {
      type: "Bar",
      colors: ["#22c55e"],
      title: "Messages Over Time",
      xLabel: "Day",
      yLabel: "Messages",
      legend: false,
      grid: true,
      query: "SELECT * FROM messages",
      formula: "",
      comments: [],
      schedule: { email: "", freq: "daily" },
      accessibility: { contrast: false, screenReader: false },
      aiInsights: "",
      audit: [],
      versions: [],
    },
    aiAlerts: {
      type: "Bar",
      colors: ["#3b82f6"],
      title: "AI Alert Trends",
      xLabel: "Day",
      yLabel: "Alerts",
      legend: false,
      grid: true,
      query: "SELECT * FROM ai_alerts",
      formula: "",
      comments: [],
      schedule: { email: "", freq: "daily" },
      accessibility: { contrast: false, screenReader: false },
      aiInsights: "",
      audit: [],
      versions: [],
    },
    auditLog: {
      type: "Bar",
      colors: ["#facc15"],
      title: "Audit Log Events",
      xLabel: "Day",
      yLabel: "Events",
      legend: false,
      grid: true,
      query: "SELECT * FROM audit_log",
      formula: "",
      comments: [],
      schedule: { email: "", freq: "daily" },
      accessibility: { contrast: false, screenReader: false },
      aiInsights: "",
      audit: [],
      versions: [],
    },
    orgComparison: {
      type: "Pie",
      colors: ["#a78bfa", "#f472b6"],
      title: "Org Comparison",
      xLabel: "Org",
      yLabel: "Score",
      legend: true,
      grid: false,
      query: "SELECT * FROM org_comparison",
      formula: "",
      comments: [],
      schedule: { email: "", freq: "daily" },
      accessibility: { contrast: false, screenReader: false },
      aiInsights: "",
      audit: [],
      versions: [],
    }
  });
  const [settingsModal, setSettingsModal] = useState<{ chart: string | null }>({ chart: null });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiInput, setAiInput] = useState("");
  const [notification, setNotification] = useState<{ type: "info" | "warning" | "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    Object.keys(chartSettings).forEach(key => {
      if (chartSettings[key].aiInsights?.includes("anomaly")) {
        setNotification({ type: "error", message: `Anomaly detected in ${key}` });
      }
    });
  }, [chartSettings]);

  // Notification triggers for other actions
  function handleConnectDataSource(chartKey: string, source: string) {
    connectDataSource(chartKey, source);
    setNotification({ type: "success", message: `Connected ${chartKey} to ${source}` });
  }
  function handleDrillDownNotification(chartKey: string, dataPoint: any) {
    handleDrillDown(chartKey, dataPoint);
    setNotification({ type: "info", message: `Drill-down on ${chartKey}: ${JSON.stringify(dataPoint)}` });
  }
  // Notification triggers for other actions
  function handleSavePresetNotification(chartKey: string) {
    savePreset(chartKey);
  }
  function handleLoadPresetNotification(chartKey: string) {
    loadPreset(chartKey);
  }

  // For version rollback
  function saveVersion(chartKey: string) {
    setChartSettings(s => {
      const versions = [...s[chartKey].versions, { ...s[chartKey] }];
      return { ...s, [chartKey]: { ...s[chartKey], versions } };
    });
  }
  function rollbackVersion(chartKey: string, idx: number) {
    setChartSettings(s => {
      const version = s[chartKey].versions[idx];
      if (!version) return s;
      return { ...s, [chartKey]: { ...version, versions: s[chartKey].versions } };
    });
  }
  // Audit log (activity feed)
  async function logAudit(chartKey: string, action: string, details?: any) {
    const entry = { action, details, timestamp: new Date().toISOString() };
    setChartSettings(s => {
      const audit = [...s[chartKey].audit, entry];
      return { ...s, [chartKey]: { ...s[chartKey], audit } };
    });
    await fetch("/api/auditlog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, details, chart: chartKey, timestamp: entry.timestamp })
    });
  }
  // AI-powered chart generator
  async function handleAiChartGenerate() {
    if (!aiInput) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/nlq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiInput })
      });
      if (!res.ok) throw new Error("AI NLQ failed");
      const data = await res.json();
      // Use AI response to create a new chart (messages chart for demo)
      setChartSettings(s => ({
        ...s,
        messages: {
          ...s.messages,
          title: data.title || aiInput,
          type: data.chartType || "Bar",
          xLabel: data.groupBy || s.messages.xLabel,
          yLabel: data.metric || s.messages.yLabel,
          colors: [data.color || "#22c55e"],
          query: aiInput,
          aiInsights: data.description || "Generated by AI",
        }
      }));
      await logAudit("messages", "ai_chart_generate", { input: aiInput, ai: data });
      saveVersion("messages");
    } catch (err: any) {
      setAiError(err?.message || "Unknown error");
    }
    setAiLoading(false);
    setAiInput("");
  }
  // AI auto-labeling
  async function handleAiAutoLabel(chartKey: string) {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/dashboard/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Suggest axis labels for this chart: ${chartSettings[chartKey].query}` })
      });
      const data = await res.json();
      setChartSettings(s => ({
        ...s,
        [chartKey]: {
          ...s[chartKey],
          xLabel: data.xLabel || s[chartKey].xLabel,
          yLabel: data.yLabel || s[chartKey].yLabel,
        }
      }));
      await logAudit(chartKey, "ai_auto_label", { ai: data });
      saveVersion(chartKey);
    } catch (err: any) {
      setAiError(err?.message || "Unknown error");
    }
    setAiLoading(false);
  }
  // AI error fixing
  async function handleAiErrorFix(chartKey: string) {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/dashboard/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Fix errors in this formula/query: ${chartSettings[chartKey].formula || chartSettings[chartKey].query}` })
      });
      const data = await res.json();
      setChartSettings(s => ({
        ...s,
        [chartKey]: {
          ...s[chartKey],
          formula: data.formula || s[chartKey].formula,
          query: data.query || s[chartKey].query,
        }
      }));
      await logAudit(chartKey, "ai_error_fix", { ai: data });
      saveVersion(chartKey);
    } catch (err: any) {
      setAiError(err?.message || "Unknown error");
    }
    setAiLoading(false);
  }
  // Comments
  function handleAddComment(chartKey: string, comment: string) {
    setChartSettings(s => {
      const comments = [...s[chartKey].comments, { text: comment, ts: new Date().toISOString() }];
      return { ...s, [chartKey]: { ...s[chartKey], comments } };
    });
    logAudit(chartKey, "add_comment", { comment });
    saveVersion(chartKey);
  }
  // Schedule
  function handleSchedule(chartKey: string, email: string, freq: string) {
    setChartSettings(s => ({
      ...s,
      [chartKey]: { ...s[chartKey], schedule: { email, freq } }
    }));
    logAudit(chartKey, "schedule_report", { email, freq });
    saveVersion(chartKey);
  }
  // Accessibility
  function handleAccessibility(chartKey: string, type: "contrast" | "screenReader") {
    setChartSettings(s => ({
      ...s,
      [chartKey]: { ...s[chartKey], accessibility: { ...s[chartKey].accessibility, [type]: !s[chartKey].accessibility[type] } }
    }));
    logAudit(chartKey, "accessibility_toggle", { type });
    saveVersion(chartKey);
  }
  // AI Insights & Anomaly Detection
  async function handleAiInsights(chartKey: string) {
    setAiLoading(true);
    setAiError(null);
    try {
      const token = localStorage.getItem("jwt_token");
      const res = await fetch("/api/dashboard/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ prompt: `Analyze this chart for anomalies and insights: ${chartSettings[chartKey].query}` })
      });
      const data = await res.json();
      setChartSettings(s => ({
        ...s,
        [chartKey]: { ...s[chartKey], aiInsights: data.result || "No insights found." }
      }));
      await logAudit(chartKey, "ai_insights", { ai: data });
      saveVersion(chartKey);
    } catch (err: any) {
      setAiError(err?.message || "Unknown error");
    }
    setAiLoading(false);
  }

  // Chart export
  function handleExportChart(chartKey: string) {
    // Export chart data as CSV
    const data = chartData[chartKey];
    const csv = [data.labels.join(","), ...data.datasets.map(ds => ds.data.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chartKey}_chart.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Chart renderer
  const chartComponents = {
    Bar,
    Line,
    Pie,
  };

  // Example handlers for toolbar and audit bar
  function handleExportCSV() { /* ... */ }
  function handleExportLog() { /* ... */ }
  function handleResetDashboard() { /* ... */ }
  function handleAddChart() { /* ... */ }
  function handleAddTable() { /* ... */ }
  function handleShowTemplates() { /* ... */ }
  function handleSaveLayout() { /* ... */ }
  function handleShare() { /* ... */ }
  function handleUndo() { /* ... */ }
  function handleRedo() { /* ... */ }
  const online = true;
  const isAdmin = userRole === "admin";

  // Customizable layout: use DashboardChartGrid for chart cards
  return (
    <ErrorBoundary>
      {/* Top modular components only! */}
  {/* Top modular components only! */}
      <AIChartGenerator
        aiInput={aiInput}
        setAiInput={setAiInput}
        aiLoading={aiLoading}
        aiError={aiError}
        onGenerate={handleAiChartGenerate}
        onPredictiveAnalytics={handlePredictiveAnalytics}
      />
      <div className="mb-2 flex gap-2 items-center">
        <label htmlFor="high-contrast-toggle" className="text-xs">High Contrast Mode</label>
        <input id="high-contrast-toggle" type="checkbox" onChange={e => document.body.classList.toggle('high-contrast', e.target.checked)} aria-label="Toggle high contrast mode" />
      </div>
      <DashboardChartGrid
        chartSettings={chartSettings}
        chartData={liveData}
        chartTypes={chartTypes}
        chartRefs={chartRefs}
        setSettingsModal={setSettingsModal}
        handleExportChart={handleExportChart}
        exportChartAsImage={exportChartAsImage}
        handleAiChartGenerate={handleAiChartGenerate}
        handleAiAutoLabel={handleAiAutoLabel}
        handleAiErrorFix={handleAiErrorFix}
        handleAddComment={handleAddComment}
        handleSchedule={handleSchedule}
        handleAccessibility={handleAccessibility}
        handleAiInsights={handleAiInsights}
        rollbackVersion={rollbackVersion}
        t={t}
        aiLoading={aiLoading}
        chartComponents={chartComponents}
        canEditChart={canEditChart}
        handleDrillDown={handleDrillDownNotification}
        connectDataSource={handleConnectDataSource}
        savePreset={handleSavePresetNotification}
        loadPreset={handleLoadPresetNotification}
        handlePredictiveAnalytics={handlePredictiveAnalytics}
      />
      {settingsModal.chart && (
        <ChartSettingsModal
          chartKey={settingsModal.chart}
          chartSettings={chartSettings}
          chartTypes={chartTypes}
          setChartSettings={setChartSettings}
          handleExportChart={handleExportChart}
          handleExportImage={(type) => exportChartAsImage(settingsModal.chart, type)}
          handleAiChartGenerate={handleAiChartGenerate}
          handleAiAutoLabel={handleAiAutoLabel}
          handleAiErrorFix={handleAiErrorFix}
          handleAddComment={handleAddComment}
          handleSchedule={handleSchedule}
          handleAccessibility={handleAccessibility}
          handleAiInsights={handleAiInsights}
          rollbackVersion={rollbackVersion}
          t={t}
          onClose={() => setSettingsModal({ chart: null })}
          aiLoading={aiLoading}
          canEdit={canEditChart(settingsModal.chart)}
          onConnectDataSource={connectDataSource}
          onSavePreset={savePreset}
          onLoadPreset={loadPreset}
          onPredictiveAnalytics={handlePredictiveAnalytics}
        />
      )}
    </ErrorBoundary>
  );
}

export default DashboardCharts;
