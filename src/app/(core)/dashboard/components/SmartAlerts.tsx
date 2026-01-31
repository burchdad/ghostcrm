
import React from "react";
import { Zap } from "lucide-react";

interface SmartAlert {
  id?: string;
  type: string;
  message: string;
  created_at: string;
  source?: string;
  tags?: string[];
  status?: "active" | "resolved" | "snoozed" | "dismissed";
  assignedTo?: string;
  comments?: Array<{ user: string; comment: string; timestamp: string }>;
  auditHistory?: Array<{ action: string; timestamp: string; user: string }>;
  recommendedAction?: string;
  preview?: string;
// End SmartAlert interface
}

interface SmartAlertsProps {
  smartAlertsEnabled: boolean;
  setSmartAlertsEnabled: (enabled: boolean) => void;
  smartAlerts: SmartAlert[];
  setSmartAlerts: (alerts: SmartAlert[]) => void;
  smartAlertType: string;
  setSmartAlertType: (type: string) => void;
  smartAlertSensitivity: string;
  setSmartAlertSensitivity: (sensitivity: string) => void;
  userRole?: string;
// End SmartAlertsProps interface
}

const ALERT_TYPES = [
  { value: "all", label: "All" },
  { value: "risk", label: "Risk" },
  { value: "opportunity", label: "Opportunity" },
  { value: "followup", label: "Follow-Up" },
  { value: "custom", label: "Custom" }
];

const SmartAlerts: React.FC<SmartAlertsProps> = ({
  smartAlertsEnabled,
  setSmartAlertsEnabled,
  smartAlerts,
  setSmartAlerts,
  smartAlertType,
  setSmartAlertType,
  smartAlertSensitivity,
  setSmartAlertSensitivity,
  userRole
}) => {
  const [search, setSearch] = React.useState("");
  const [selectedAlert, setSelectedAlert] = React.useState<SmartAlert | null>(null);
  const [bulkAction, setBulkAction] = React.useState<string>("");
  const [bulkMode, setBulkMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [selectedOrg, setSelectedOrg] = React.useState("");
  const isAdmin = userRole === "admin" || userRole === "superadmin";

  // Bulk actions
  const handleBulkAction = () => {
    if (bulkAction === "dismiss") {
      setSmartAlerts(smartAlerts.map(a => ({ ...a, status: "dismissed" })));
    } else if (bulkAction === "resolve") {
      setSmartAlerts(smartAlerts.map(a => ({ ...a, status: "resolved" })));
    }
    setBulkAction("");
  };

  // Filtered alerts
  const filteredAlerts = smartAlerts.filter(a =>
    (smartAlertType === "all" || a.type === smartAlertType) &&
    (search === "" || a.message.toLowerCase().includes(search.toLowerCase()) || (a.tags && a.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))))
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 mb-2 bg-white rounded shadow col-span-2">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-500" /> AI Smart Alerts
        </h2>
        {/* Multi-tenant Organization Selector */}
        <div className="mb-2 flex gap-2 items-center">
          <label className="text-sm text-cyan-800">Organization</label>
          <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} className="border rounded px-2 py-1">
            <option value="">All</option>
            <option value="org1">Org 1</option>
            <option value="org2">Org 2</option>
          </select>
          <button className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs" onClick={() => setBulkMode(!bulkMode)}>{bulkMode ? "Cancel Bulk" : "Bulk Ops"}</button>
        </div>
        <div className="mb-2 flex flex-wrap gap-2 items-center">
          <label className="text-sm text-cyan-800">Enable Smart Alerts</label>
          <input type="checkbox" checked={smartAlertsEnabled} onChange={e => setSmartAlertsEnabled(e.target.checked)} />
          <select value={smartAlertType} onChange={e => setSmartAlertType(e.target.value)} className="border rounded px-2 py-1">
            {ALERT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={smartAlertSensitivity} onChange={e => setSmartAlertSensitivity(e.target.value)} className="border rounded px-2 py-1">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts..." className="border rounded px-2 py-1" />
          <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="border rounded px-2 py-1">
            <option value="">Bulk Action</option>
            <option value="dismiss">Dismiss All</option>
            <option value="resolve">Resolve All</option>
          </select>
          <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={handleBulkAction}>Apply</button>
        </div>
        <div className="mb-2 text-xs text-gray-500">AI analyzes leads, deals, and activity to generate smart alerts for risks, opportunities, and follow-ups. Advanced actions, analytics, audit, and integration supported.</div>
        {/* Bulk Operations UI */}
        {bulkMode && (
          <div className="mb-2 flex gap-2">
            <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => {
              // Bulk resolve
              setSmartAlerts(smartAlerts.map(a => selectedIds.includes(a.id || "") ? { ...a, status: "resolved" } : a));
              setSelectedIds([]);
              setBulkMode(false);
            }}>Resolve Selected</button>
            <button className="px-2 py-1 bg-yellow-500 text-white rounded text-xs" onClick={() => {
              // Bulk snooze
              setSmartAlerts(smartAlerts.map(a => selectedIds.includes(a.id || "") ? { ...a, status: "snoozed" } : a));
              setSelectedIds([]);
              setBulkMode(false);
            }}>Snooze Selected</button>
            <button className="px-2 py-1 bg-red-500 text-white rounded text-xs" onClick={() => {
              // Bulk dismiss
              setSmartAlerts(smartAlerts.map(a => selectedIds.includes(a.id || "") ? { ...a, status: "dismissed" } : a));
              setSelectedIds([]);
              setBulkMode(false);
            }}>Dismiss Selected</button>
            <button className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs" onClick={() => setBulkMode(false)}>Cancel</button>
          </div>
        )}
        <ul className="text-sm mb-2 max-h-64 overflow-auto">
          {smartAlertsEnabled && filteredAlerts.length === 0 && <li className="text-gray-400">No smart alerts.</li>}
          {smartAlertsEnabled && filteredAlerts.map((alert, idx) => {
            // Filter by organization (scaffolded)
            if (selectedOrg && alert.source && alert.source !== selectedOrg) return null;
            return (
              <li key={alert.id || idx} className={`mb-2 p-2 rounded shadow-sm flex flex-col md:flex-row md:items-center justify-between ${alert.type === "risk" ? "bg-red-50" : alert.type === "opportunity" ? "bg-green-50" : "bg-blue-50"}`} tabIndex={0} aria-label={alert.message} onClick={() => setSelectedAlert(alert)}>
                <div>
                  <span className="font-bold">{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}:</span> {alert.message}
                  <span className="text-xs text-gray-400 ml-2">@ {alert.created_at}</span>
                  {alert.tags && alert.tags.length > 0 && <span className="text-xs text-blue-700 ml-2">Tags: {alert.tags.join(", ")}</span>}
                  {alert.status && <span className="text-xs ml-2">[{alert.status}]</span>}
                  {alert.source && <span className="text-xs text-purple-700 ml-2">Source: {alert.source}</span>}
                  {alert.recommendedAction && <span className="text-xs text-green-700 ml-2">Action: {alert.recommendedAction}</span>}
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  {bulkMode && (
                    <input type="checkbox" checked={selectedIds.includes(alert.id || "")} onChange={e => {
                      setSelectedIds(e.target.checked ? [...selectedIds, alert.id || ""] : selectedIds.filter(id => id !== (alert.id || "")));
                    }} />
                  )}
                  <button className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs" onClick={e => { e.stopPropagation(); setSmartAlerts(smartAlerts.map((a, i) => i === idx ? { ...a, status: "resolved" } : a)); }}>Resolve</button>
                  <button className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs" onClick={e => { e.stopPropagation(); setSmartAlerts(smartAlerts.map((a, i) => i === idx ? { ...a, status: "snoozed" } : a)); }}>Snooze</button>
                  <button className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={e => { e.stopPropagation(); setSmartAlerts(smartAlerts.map((a, i) => i === idx ? { ...a, status: "dismissed" } : a)); }}>Dismiss</button>
                  {isAdmin && <button className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs" onClick={e => { e.stopPropagation(); setSelectedAlert(alert); }}>Assign</button>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60" role="dialog" aria-modal="true">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2 px-2 py-1 bg-gray-200 rounded" onClick={() => setSelectedAlert(null)} aria-label="Close Details">Close</button>
            <h4 className="font-bold text-lg mb-2">Alert Details</h4>
            <div className="mb-2 text-xs text-gray-500">{selectedAlert.message}</div>
            <div className="mb-2 text-xs text-gray-400">Type: {selectedAlert.type}</div>
            <div className="mb-2 text-xs">Created: {selectedAlert.created_at}</div>
            {selectedAlert.tags && <div className="mb-2 text-xs text-blue-700">Tags: {selectedAlert.tags.join(", ")}</div>}
            {selectedAlert.status && <div className="mb-2 text-xs">Status: {selectedAlert.status}</div>}
            {selectedAlert.source && <div className="mb-2 text-xs text-purple-700">Source: {selectedAlert.source}</div>}
            {selectedAlert.recommendedAction && <div className="mb-2 text-xs text-green-700">Recommended Action: {selectedAlert.recommendedAction}</div>}
            {selectedAlert.preview && <div className="mb-2 text-xs text-gray-700">AI Reasoning: {selectedAlert.preview}</div>}
            {selectedAlert.comments && selectedAlert.comments.length > 0 && (
              <div className="mb-2 text-xs">
                <div className="font-bold">Comments:</div>
                <ul>
                  {selectedAlert.comments.map((c, idx) => (
                    <li key={idx}>{c.comment} by {c.user} at {c.timestamp}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedAlert.auditHistory && selectedAlert.auditHistory.length > 0 && (
              <div className="mb-2 text-xs">
                <div className="font-bold">Audit History:</div>
                <ul>
                  {selectedAlert.auditHistory.map((audit, idx) => (
                    <li key={idx}>{audit.action} by {audit.user} at {audit.timestamp}</li>
                  ))}
                </ul>
              </div>
            )}
            {isAdmin && (
              <div className="flex gap-2 mt-2">
                <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => setSelectedAlert(null)}>Assign</button>
                <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs" onClick={() => setSelectedAlert(null)}>Resolve</button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Analytics, Integration, Compliance, Real-time, Performance - Scaffolded for future extension */}
      <div className="col-span-1 p-4 bg-gray-50 rounded shadow">
        <div className="font-semibold mb-2">Alert Analytics</div>
        <div className="text-xs">Total Alerts: {smartAlerts.length}</div>
        <div className="text-xs">Active: {smartAlerts.filter(a => a.status === "active").length}</div>
        <div className="text-xs">Resolved: {smartAlerts.filter(a => a.status === "resolved").length}</div>
        <div className="text-xs">Dismissed: {smartAlerts.filter(a => a.status === "dismissed").length}</div>
        <div className="text-xs">Snoozed: {smartAlerts.filter(a => a.status === "snoozed").length}</div>
        <div className="text-xs">Integration, compliance, real-time, and performance features scaffolded for future extension.</div>
      </div>
    </div>
  );
};

export default SmartAlerts;
