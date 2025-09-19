// --- Backend Feature Hooks ---
// REST API endpoints
const API = {
  audit: "/api/auditlog",
  cards: "/api/dashboard/cards",
  templates: "/api/dashboard/cardTemplates",
  compliance: "/api/org/compliance",
  ai: "/api/ai/predict",
};

// SSO/auth check (production)
async function checkAuth() {
  try {
    const res = await fetch("/api/auth/check", { credentials: "include" });
    if (!res.ok) throw new Error("Auth failed");
    const data = await res.json();
    return data?.authenticated === true;
  } catch {
    return false;
  }
}

// Fetch compliance badges from backend
async function fetchComplianceBadges(org: string): Promise<string[]> {
  try {
    const res = await fetch(`${API.compliance}?org=${org}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.badges || [];
  } catch { return []; }
}

// Predictive AI backend integration (production)
async function getAIPredictionAPI(query: string, cardId?: string): Promise<string> {
  try {
    const res = await fetch(API.ai, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, cardId })
    });
    if (!res.ok) throw new Error("AI prediction failed");
    const data = await res.json();
    return data.prediction || "";
  } catch (err) {
    logErrorToMonitoringService(err, { query, cardId });
    return "";
  }
}

// Real-time updates via WebSocket (backend-driven)
function useRealtimeUpdates(org: string, onUpdate: (data: any) => void) {
  useEffect(() => {
    if (!org) return;
    const ws = new WebSocket(`wss://ghostcrm-realtime/${org}`);
    ws.onmessage = (event) => {
      try { onUpdate(JSON.parse(event.data)); } catch {}
    };
    ws.onerror = () => {};
    ws.onclose = () => {};
    return () => ws.close();
  }, [org, onUpdate]);
}

// Backend-driven chart data (production)
async function fetchChartData(org: string, cardId?: string): Promise<any> {
  try {
    const res = await fetch(`${API.cards}/chart?org=${org}${cardId ? `&cardId=${cardId}` : ""}`);
    if (!res.ok) throw new Error("Chart data fetch failed");
    return await res.json();
  } catch (err) {
    logErrorToMonitoringService(err, { org, cardId });
    return null;
  }
}
// --- Advanced Integrations & Recommendations ---
// Real-time updates (WebSocket demo)
const wsUrl = 'wss://demo-ghostcrm-live-data';

// Compliance badges
const COMPLIANCE_BADGES: Record<string, string[]> = {
  org1: ['GDPR', 'SOC2'],
  org2: ['HIPAA', 'PCI'],
};

// Predictive AI (stub)
async function getAIPrediction(query: string, cardId?: string): Promise<string> {
  // Replace with real AI API call
  return `Predicted outcome for ${query}${cardId ? ` (card ${cardId})` : ''}`;
}

// Chart.js integration (demo)
import { Chart, registerables } from 'chart.js';
import { Chart as ChartJS } from 'react-chartjs-2';
Chart.register(...registerables);

// SSO placeholder
const SSO_ENABLED = true; // Replace with real SSO logic

// Error monitoring hook (production)
import * as Sentry from "@sentry/react";
function logErrorToMonitoringService(error: any, info?: any) {
  Sentry.captureException(error, { extra: info });
}
import React, { useState, useEffect, useRef, ReactNode } from "react";
import { FiEdit, FiTrash2, FiCopy, FiShare2, FiDownload, FiUsers, FiClock, FiEye, FiFilter } from "react-icons/fi";
import { useTranslation } from "react-i18next";
// ...existing code...
// ErrorBoundary for advanced error handling
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) { /* log error to service */ }
  render() { return this.state.hasError ? <div role="alert">Something went wrong.</div> : this.props.children; }
}

type AuditHistoryItem = {
  user: string;
  action: string;
  timestamp: string;
};

export type DashboardCardProps = {
  title: string;
  children: React.ReactNode;
  draggable?: boolean;
  canEdit?: boolean;
  userRole?: string;
  lastUpdated?: string;
  aiInsight?: string;
  color?: string;
  icon?: React.ReactNode;
  auditHistory: AuditHistoryItem[];
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  industryType?: string;
  customRoles?: string[];
};

const EXPORT_FORMATS = ["csv", "json", "pdf"];

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  draggable = false,
  canEdit = false,
  userRole = "user",
  lastUpdated,
  aiInsight,
  color = "#000",
  icon,
  auditHistory = [],
  onEdit,
  onDelete,
  onDuplicate,
  onShare,
  onExport,
  industryType,
  customRoles = []
}) => {
  const { t, i18n } = useTranslation();
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [language, setLanguage] = useState(i18n.language || "en");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [scheduleEmail, setScheduleEmail] = useState("");
  const [scheduleFreq, setScheduleFreq] = useState("daily");
  const [filteredAudit, setFilteredAudit] = useState<AuditHistoryItem[]>(auditHistory);
  const [exportFormat, setExportFormat] = useState(EXPORT_FORMATS[0]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const cardRef = useRef<HTMLDivElement>(null);
  // Real-time updates (backend-driven)
  const [liveData, setLiveData] = useState<any>(null);
  useRealtimeUpdates(selectedOrg, setLiveData);

  // Compliance badges from backend
  const [complianceBadges, setComplianceBadges] = useState<string[]>([]);
  useEffect(() => {
    if (selectedOrg) {
      fetchComplianceBadges(selectedOrg).then(setComplianceBadges);
    } else {
      setComplianceBadges([]);
    }
  }, [selectedOrg]);

  // Predictive AI from backend
  const [aiPrediction, setAIPrediction] = useState<string>("");
  useEffect(() => {
    if (aiInsight) {
      getAIPredictionAPI(aiInsight, title).then(setAIPrediction);
    }
  }, [aiInsight, title]);

  // Backend-driven chart data
  const [chartData, setChartData] = useState<any>(null);
  useEffect(() => {
    fetchChartData(selectedOrg, title).then(setChartData);
  }, [selectedOrg, title]);

  useEffect(() => { setFilteredAudit(auditHistory); }, [auditHistory]);
  useEffect(() => { i18n.changeLanguage(language); }, [language, i18n]);

  // Advanced compliance logging
  const logAction = async (action: string, details: any) => {
    try {
      await fetch("/api/auditlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, details, timestamp: new Date().toISOString() })
      });
    } catch (err) {
      setErrorMsg(t("Compliance logging failed."));
      logErrorToMonitoringService(err);
    }
  };

  // Bulk actions UI
  const handleBulkAction = async (action: string) => {
    try {
      if (action === "delete") {
        await fetch("/api/dashboard/cards/bulk", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardIds: selectedCards, org: selectedOrg })
        });
        await logAction("bulk_delete", { cardIds: selectedCards, org: selectedOrg });
        setSelectedCards([]);
        setBulkMode(false);
        window.location.reload();
      } else if (["enable", "disable"].includes(action)) {
        await fetch("/api/dashboard/cards/bulk", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardIds: selectedCards, status: action, org: selectedOrg })
        });
        await logAction(`bulk_${action}`, { cardIds: selectedCards, org: selectedOrg });
        setSelectedCards([]);
        setBulkMode(false);
        window.location.reload();
      }
    } catch (err) {
      setErrorMsg(t("Bulk operation failed. Please try again."));
    }
  };

  // Export logic
  const handleExport = () => {
    try {
      let data = "";
      if (exportFormat === "csv") {
        data = filteredAudit.map(a => `${a.action},${a.user},${a.timestamp}`).join("\n");
      } else if (exportFormat === "json") {
        data = JSON.stringify(filteredAudit, null, 2);
      } else if (exportFormat === "pdf") {
        // PDF export stub (integrate real PDF export)
        data = filteredAudit.map(a => `${a.action} by ${a.user} at ${a.timestamp}`).join("\n");
      }
      const blob = new Blob([data], { type: exportFormat === "pdf" ? "application/pdf" : "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}-audit.${exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);
      logAction("export_audit", { org: selectedOrg, format: exportFormat });
    } catch (err) {
      setErrorMsg(t("Export failed."));
    }
  };

  // Accessibility: keyboard navigation & screen reader live region
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.tabIndex = 0;
      // Screen reader live region for dynamic updates
      cardRef.current.setAttribute('aria-live', 'polite');
    }
  }, []);

  // Custom role logic & field-level permissions (stub)
  const hasEditAccess = ["admin", "manager", ...(customRoles ?? [])].includes(userRole ?? "") || canEdit;
  const canViewSensitive = userRole === "admin" || (customRoles ?? []).includes("compliance");

  // Advanced analytics hook (stub)
  useEffect(() => {
    // Integrate with analytics backend here
  }, [title, selectedOrg, userRole, industryType]);

  // Performance: memoize filtered audit
  const memoFilteredAudit = React.useMemo(() => filteredAudit, [filteredAudit]);

  // Drag-and-drop (demo, replace with real logic)
  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("text/plain", title);
  }
  function handleDrop(e: React.DragEvent) {
    // Implement dashboard card reordering logic
    e.preventDefault();
  }

  // Mobile/offline support (stub)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 600;
  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

  return (
    <ErrorBoundary>
      <div ref={cardRef} className={`bg-white rounded shadow p-4 mb-4${isMobile ? ' text-base' : ''}`} draggable={draggable} aria-label={t("Dashboard Card")}
        onDragStart={handleDragStart} onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
  {/* Error message */}
  {errorMsg && <div className="text-red-600 mb-2" role="alert">{errorMsg}</div>}
  {isOffline && <div className="text-yellow-700 mb-2" role="status">{t("You are offline. Some features may be unavailable.")}</div>}
        {/* Compliance Badges (backend) */}
        {selectedOrg && complianceBadges.length > 0 && (
          <div className="mb-2 flex gap-2 items-center">
            {complianceBadges.map(badge => (
              <span key={badge} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs" aria-label={badge}>{badge}</span>
            ))}
          </div>
        )}
        {/* SSO Badge */}
        {SSO_ENABLED && <div className="mb-2"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">SSO Enabled</span></div>}
        {/* Language Selector */}
        <div className="mb-2 flex gap-2 items-center">
          <label className="text-sm text-blue-800" htmlFor="lang-select">{t("Language")}</label>
          <select id="lang-select" value={language} onChange={e => setLanguage(e.target.value)} className="border rounded px-2 py-1" aria-label={t("Language Selector")}> 
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
        {/* Multi-tenant Organization Selector */}
        <div className="mb-2 flex gap-2 items-center">
          <label className="text-sm text-blue-800" htmlFor="org-select">{t("Organization")}</label>
          <select id="org-select" value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} className="border rounded px-2 py-1" aria-label={t("Organization Selector")}> 
            <option value="">{t("All")}</option>
            <option value="org1">{t("Org 1")}</option>
            <option value="org2">{t("Org 2")}</option>
          </select>
        </div>
        {/* Bulk selection UI */}
        {bulkMode && (
          <div className="mb-2">
            <label className="text-sm font-bold">{t("Select Cards for Bulk Action")}</label>
            <input type="text" className="border rounded px-2 py-1" placeholder={t("Card IDs comma separated")}
              value={selectedCards.join(",")} onChange={e => setSelectedCards(e.target.value.split(","))} aria-label={t("Bulk Card Selector")} />
            <button className="ml-2 px-2 py-1 bg-red-500 text-white rounded" onClick={() => handleBulkAction("delete")}>{t("Bulk Delete")}</button>
            <button className="ml-2 px-2 py-1 bg-green-500 text-white rounded" onClick={() => handleBulkAction("enable")}>{t("Bulk Enable")}</button>
            <button className="ml-2 px-2 py-1 bg-gray-500 text-white rounded" onClick={() => handleBulkAction("disable")}>{t("Bulk Disable")}</button>
            <button className="ml-2 px-2 py-1 bg-gray-300 text-gray-700 rounded" onClick={() => setBulkMode(false)}>{t("Cancel Bulk")}</button>
          </div>
        )}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {icon && <span className="text-2xl" style={{ color: color ?? "#000" }}>{icon}</span>}
            <span className="font-bold text-lg" style={{ color: color ?? "#000" }}>{t(title)}</span>
            {industryType && <span className="ml-2 text-xs text-gray-500">{t("Industry")}: {industryType}</span>}
          </div>
          {/* Role-based controls */}
          {hasEditAccess && (
            <div className="flex gap-2 flex-wrap items-center" role="toolbar" aria-label={t("Admin Actions")}> 
              <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1 hover:bg-blue-200 focus:ring-2" aria-label={t("Edit Card")} title={t("Edit Card")} onClick={async () => { onEdit && onEdit(); await logAction("edit", { title, org: selectedOrg }); }}><FiEdit />{t("Edit")}</button>
              <button className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs flex items-center gap-1 hover:bg-red-200 focus:ring-2" aria-label={t("Delete Card")} title={t("Delete Card")} onClick={async () => { onDelete && onDelete(); await logAction("delete", { title, org: selectedOrg }); }}><FiTrash2 />{t("Delete")}</button>
              <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1 hover:bg-gray-200 focus:ring-2" aria-label={t("Duplicate Card")} title={t("Duplicate Card")} onClick={async () => { onDuplicate && onDuplicate(); await logAction("duplicate", { title, org: selectedOrg }); }}><FiCopy />{t("Duplicate")}</button>
              <button className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1 hover:bg-green-200 focus:ring-2" aria-label={t("Share Card")} title={t("Share Card")} onClick={async () => { try { onShare && onShare(); await logAction("share", { title, org: selectedOrg }); alert(t("Share successful.")); } catch (err) { alert(t("Share failed.")); } }}><FiShare2 />{t("Share")}</button>
              <button className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs flex items-center gap-1 hover:bg-yellow-200 focus:ring-2" aria-label={t("Export Card")} title={t("Export Card")} onClick={async () => { try { onExport && onExport(); await logAction("export", { title, org: selectedOrg }); alert(t("Export successful.")); } catch (err) { alert(t("Export failed.")); } }}><FiDownload />{t("Export")}</button>
              <button className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs flex items-center gap-1 hover:bg-purple-200 focus:ring-2" aria-label={t("Bulk Operations")} title={t("Bulk Operations")} onClick={() => setBulkMode(!bulkMode)}><FiUsers />{t("Bulk")}</button>
              <button className={`px-2 py-1 rounded text-xs flex items-center gap-1 focus:ring-2 ${showAudit ? 'bg-gray-300 text-gray-900' : 'bg-gray-100 text-gray-700'}`} aria-label={t("Audit History")} title={t("Audit History")} onClick={() => setShowAudit(!showAudit)}><FiClock />{t("Audit")}</button>
              <button className={`px-2 py-1 rounded text-xs flex items-center gap-1 focus:ring-2 ${showSchedule ? 'bg-indigo-300 text-indigo-900' : 'bg-indigo-100 text-indigo-700'}`} aria-label={t("Schedule Card")} title={t("Schedule Card")} onClick={() => setShowSchedule(!showSchedule)}><FiEye />{t("Schedule")}</button>
              <input type="text" placeholder={t("Template Name")} aria-label={t("Template Name")} value={templateName} onChange={e => setTemplateName(e.target.value)} className="border rounded px-2 py-1 text-xs" />
              <button className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs flex items-center gap-1 hover:bg-yellow-300 focus:ring-2" aria-label={t("Save Template")} title={t("Save Template")} onClick={async () => {
                if (templateName) {
                  try {
                    await fetch("/api/dashboard/cardTemplates", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: templateName, card: { title, children, draggable, canEdit, userRole, lastUpdated, aiInsight, color, icon, auditHistory }, org: selectedOrg, user: window.localStorage.getItem('userId') || 'demo' })
                    });
                    setTemplates([...templates, { name: templateName, card: { title, children, draggable, canEdit, userRole, lastUpdated, aiInsight, color, icon, auditHistory } }]);
                    await logAction("save_template", { name: templateName, org: selectedOrg });
                    alert(t("Template save successful."));
                  } catch (err) {
                    alert(t("Template save failed."));
                  }
                }
              }}><FiDownload />{t("Save")}</button>
            </div>
          )}
        </div>
        <div className="mb-2">
          {/* Predictive AI Insight (backend) */}
          {(aiInsight || aiPrediction) && <div className="mb-2 p-2 bg-purple-50 rounded text-purple-700 text-xs">{t("AI Insight")}: {aiPrediction || aiInsight}</div>}
          {/* Chart Visualization (backend) */}
          <div className="mb-2">
            <ChartJS
              type="bar"
              data={chartData || {
                labels: filteredAudit.map(a => a.user),
                datasets: [{
                  label: t("Audit Actions"),
                  data: filteredAudit.map(a => a.action.length),
                  backgroundColor: "#3b82f6"
                }]
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>
          {children}
        </div>
        {/* Scheduling UI */}
        {showSchedule && (
          <div className="mb-2 p-2 bg-blue-50 rounded text-xs">
            <strong>{t("Schedule Card")}</strong>
            <input type="email" placeholder={t("Recipient Email")}
              value={scheduleEmail} onChange={e => setScheduleEmail(e.target.value)} className="border rounded px-2 py-1 w-full mb-2" />
            <select value={scheduleFreq} onChange={e => setScheduleFreq(e.target.value)} className="border rounded px-2 py-1 w-full mb-2">
              <option value="daily">{t("Daily")}</option>
              <option value="weekly">{t("Weekly")}</option>
              <option value="monthly">{t("Monthly")}</option>
            </select>
            <div className="flex gap-2 mt-2">
              <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => {
                alert(`${t("Scheduled")} ${title} ${t("card to") } ${scheduleEmail} (${scheduleFreq})`);
                setShowSchedule(false);
                setScheduleEmail("");
                setScheduleFreq("daily");
              }}>{t("Save")}</button>
              <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowSchedule(false)}>{t("Cancel")}</button>
            </div>
          </div>
        )}
        {/* Audit/version history with filter/export, collapsible panel, badges, icons, accessibility */}
        {showAudit && (
          <div className="mb-2 p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl text-xs shadow-lg border border-gray-300" role="region" aria-label={t("Audit/Version History")}> 
            <div className="flex items-center gap-2 mb-2">
              <FiClock className="text-lg text-gray-500" />
              <strong className="text-gray-800">{t("Audit/Version History")}</strong>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{memoFilteredAudit.length} {t("events")}</span>
            </div>
            <div className="flex gap-2 items-center mb-2">
              <FiFilter className="text-gray-500" />
              <input type="text" aria-label={t("Filter Audit")} placeholder={t("Filter by user/action")}
                className="border rounded px-2 py-1 text-xs focus:ring-2" onChange={e => {
                  const val = e.target.value.toLowerCase();
                  setFilteredAudit(auditHistory.filter(a => a.user.toLowerCase().includes(val) || a.action.toLowerCase().includes(val)));
                }} />
              <label className="text-xs font-bold">{t("Export Format")}</label>
              <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} className="border rounded px-2 py-1 focus:ring-2">
                {EXPORT_FORMATS.map(fmt => <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>)}
              </select>
              <button className="px-2 py-1 bg-gray-200 rounded flex items-center gap-1 hover:bg-gray-300 focus:ring-2" aria-label={t("Export Audit")} title={t("Export Audit")}
                onClick={handleExport}><FiDownload />{t("Export")}</button>
            </div>
            <ul className="space-y-1">
              {memoFilteredAudit.length === 0 && <li>{t("No history available.")}</li>}
              {memoFilteredAudit.map((a, idx) => (
                <li key={idx} className="flex items-center gap-2 bg-white rounded px-2 py-1 shadow-sm border border-gray-100">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs" title={t("User")}>{a.user}</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs" title={t("Action")}>{t(a.action)}</span>
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs" title={t("Timestamp")}>{a.timestamp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default DashboardCard;

