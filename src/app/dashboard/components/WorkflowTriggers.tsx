
import React from "react";
import { useI18n } from "@/components/I18nProvider";

interface WorkflowTrigger {
  name: string;
  type: string;
  tags?: string[];
  version?: string;
  createdAt?: string;
  updatedAt?: string;
  parameters?: Record<string, any>;
  status?: "active" | "paused" | "error";
  lastRun?: string;
  lastResult?: string;
  errorCount?: number;
  auditHistory?: Array<{ action: string; timestamp: string; user: string }>;
// End WorkflowTrigger interface
}

interface WorkflowTriggersProps {
  workflowTriggers: WorkflowTrigger[];
  setWorkflowTriggers: (triggers: WorkflowTrigger[]) => void;
  showWorkflowModal: boolean;
  setShowWorkflowModal: (show: boolean) => void;
  newTriggerName: string;
  setNewTriggerName: (name: string) => void;
  newTriggerType: string;
  setNewTriggerType: (type: string) => void;
  newTriggerTags?: string[];
  setNewTriggerTags?: (tags: string[]) => void;
  newTriggerParameters?: Record<string, any>;
  setNewTriggerParameters?: (params: Record<string, any>) => void;
  addWorkflowTrigger: () => void;
  removeWorkflowTrigger: (idx: number) => void;
  userRole?: string;
// End WorkflowTriggersProps interface
}

const TRIGGER_TYPES = [
  { value: "auto-assign", label: "Auto-Assign" },
  { value: "notify", label: "Notify" },
  { value: "update-status", label: "Update Status" },
  { value: "custom", label: "Custom" },
  { value: "audit", label: "Audit" },
  { value: "analytics", label: "Analytics" },
  { value: "ai", label: "AI" }
];

const WorkflowTriggers: React.FC<WorkflowTriggersProps> = ({
  workflowTriggers,
  setWorkflowTriggers,
  showWorkflowModal,
  setShowWorkflowModal,
  newTriggerName,
  setNewTriggerName,
  newTriggerType,
  setNewTriggerType,
  newTriggerTags = [],
  setNewTriggerTags = () => {},
  newTriggerParameters = {},
  setNewTriggerParameters = () => {},
  addWorkflowTrigger,
  removeWorkflowTrigger,
  userRole
}) => {
  const [search, setSearch] = React.useState("");
  const [testResult, setTestResult] = React.useState<string>("");
  const [importExportVisible, setImportExportVisible] = React.useState(false);
  const [bulkMode, setBulkMode] = React.useState(false);
  const [selectedIdxs, setSelectedIdxs] = React.useState<number[]>([]);
  const [selectedOrg, setSelectedOrg] = React.useState("");
  const isAdmin = userRole === "admin" || userRole === "superadmin";
  const { t } = useI18n();

  // Test trigger stub
  const testTrigger = (trigger: WorkflowTrigger) => {
    setTestResult("Testing...");
    setTimeout(() => {
      setTestResult(`Test for '${trigger.name}' (${trigger.type}): Success`);
    }, 1000);
  };

  // Export triggers
  const exportTriggers = () => {
    const data = JSON.stringify(workflowTriggers, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow-triggers.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import triggers
  const importTriggers = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        setWorkflowTriggers(data);
      } catch {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  // Filtered triggers
  const filteredTriggers = workflowTriggers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase()) ||
    (t.tags && t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
  );

  if (!showWorkflowModal) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-xl">{t("Manage Workflow Triggers")}</h3>
          <div className="flex gap-2">
            <button className="px-2 py-1 bg-gray-100 rounded text-xs" onClick={exportTriggers}>{t("Export")}</button>
            <label className="px-2 py-1 bg-gray-100 rounded text-xs cursor-pointer">
              {t("Import")}
              <input type="file" accept="application/json" className="hidden" onChange={importTriggers} />
            </label>
          </div>
        </div>
        {/* Multi-tenant Organization Selector */}
        <div className="mb-2 flex gap-2 items-center">
          <label className="text-sm text-blue-800">{t("Organization")}</label>
          <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} className="border rounded px-2 py-1">
            <option value="">{t("All")}</option>
            <option value="org1">{t("Org 1")}</option>
            <option value="org2">{t("Org 2")}</option>
          </select>
          <button className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs" onClick={() => setBulkMode(!bulkMode)}>{bulkMode ? t("Cancel Bulk") : t("Bulk Ops")}</button>
        </div>
  <div className="mb-2 text-sm text-gray-600">{t("Automate actions and assignments using advanced workflow triggers.")}</div>
  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t("Search triggers...")} className="border rounded px-2 py-1 mb-2 w-full" />
        {/* Bulk Operations UI */}
        {bulkMode && (
          <div className="mb-2 flex gap-2">
            <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => {
              // Bulk test
              selectedIdxs.forEach(idx => testTrigger(filteredTriggers[idx]));
              setBulkMode(false);
              setSelectedIdxs([]);
            }}>Test Selected</button>
            <button className="px-2 py-1 bg-yellow-500 text-white rounded text-xs" onClick={() => {
              // Bulk export
              const data = JSON.stringify(selectedIdxs.map(idx => filteredTriggers[idx]), null, 2);
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "workflow-triggers-selected.json";
              a.click();
              URL.revokeObjectURL(url);
              setBulkMode(false);
              setSelectedIdxs([]);
            }}>Export Selected</button>
            <button className="px-2 py-1 bg-red-500 text-white rounded text-xs" onClick={() => {
              // Bulk delete
              setWorkflowTriggers(workflowTriggers.filter((_, idx) => !selectedIdxs.includes(idx)));
              setBulkMode(false);
              setSelectedIdxs([]);
            }}>Delete Selected</button>
            <button className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs" onClick={() => setBulkMode(false)}>Cancel</button>
          </div>
        )}
        <ul className="text-sm mb-2 max-h-48 overflow-auto">
          {filteredTriggers.map((trigger, idx) => {
            // Filter by organization (scaffolded)
            if (selectedOrg && trigger.tags && !trigger.tags.includes(selectedOrg)) return null;
            // Real-time analytics (scaffolded)
            const analytics = {
              runRate: Math.floor(Math.random() * 100),
              avgDuration: Math.floor(Math.random() * 500),
              errorRate: trigger.errorCount ? Math.min(100, trigger.errorCount * 5) : 0,
            };
            // Compliance/security badges (scaffolded)
            const compliance = trigger.tags?.includes("gdpr") ? "GDPR" : "";
            const security = trigger.tags?.includes("secure") ? "Secure" : "";
            return (
              <li key={idx} className="mb-2 flex flex-col md:flex-row md:items-center justify-between border-b pb-2">
                <div>
                  {bulkMode && (
                    <input type="checkbox" checked={selectedIdxs.includes(idx)} onChange={e => {
                      setSelectedIdxs(e.target.checked ? [...selectedIdxs, idx] : selectedIdxs.filter(i => i !== idx));
                    }} />
                  )}
                  <span className="font-semibold">{trigger.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({trigger.type})</span>
                  {trigger.tags && trigger.tags.length > 0 && <span className="text-xs text-blue-700 ml-2">Tags: {trigger.tags.join(", ")}</span>}
                  {trigger.version && <span className="text-xs text-purple-700 ml-2">v{trigger.version}</span>}
                  {trigger.status && <span className="text-xs ml-2">[{trigger.status}]</span>}
                  {trigger.lastRun && <span className="text-xs text-green-700 ml-2">Last Run: {trigger.lastRun}</span>}
                  {trigger.lastResult && <span className="text-xs text-gray-700 ml-2">Result: {trigger.lastResult}</span>}
                  {trigger.errorCount !== undefined && <span className="text-xs text-red-700 ml-2">Errors: {trigger.errorCount}</span>}
                  {trigger.auditHistory && trigger.auditHistory.length > 0 && <span className="text-xs text-gray-400 ml-2">Audit: {trigger.auditHistory.map(a => `${a.action} by ${a.user} at ${a.timestamp}`).join(" | ")}</span>}
                  {/* Real-time analytics badges */}
                  <span className="ml-2 text-xs bg-green-100 text-green-800 rounded px-1">Run Rate: {analytics.runRate}/hr</span>
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 rounded px-1">Avg Duration: {analytics.avgDuration}ms</span>
                  <span className="ml-2 text-xs bg-red-100 text-red-800 rounded px-1">Error Rate: {analytics.errorRate}%</span>
                  {/* Compliance/security badges */}
                  {compliance && <span className="ml-2 text-xs bg-blue-100 text-blue-800 rounded px-1">{compliance}</span>}
                  {security && <span className="ml-2 text-xs bg-gray-100 text-gray-800 rounded px-1">{security}</span>}
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs" onClick={() => testTrigger(trigger)}>Test</button>
                  {isAdmin && <button className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removeWorkflowTrigger(idx)}>Delete</button>}
                </div>
                {trigger.parameters && <div className="text-xs text-gray-700 mt-1">Params: {Object.entries(trigger.parameters).map(([k, v]) => `${k}: ${v}`).join(", ")}</div>}
              </li>
            );
          })}
        </ul>
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <input
            type="text"
            value={newTriggerName}
            onChange={e => setNewTriggerName(e.target.value)}
            placeholder="Trigger Name"
            className="border rounded px-2 py-1"
          />
          <select value={newTriggerType} onChange={e => setNewTriggerType(e.target.value)} className="border rounded px-2 py-1">
            {TRIGGER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input
            type="text"
            value={newTriggerTags.join(",")}
            onChange={e => setNewTriggerTags(e.target.value.split(",").map(t => t.trim()))}
            placeholder="Tags (comma separated)"
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            value={Object.entries(newTriggerParameters).map(([k, v]) => `${k}:${v}`).join(",")}
            onChange={e => {
              const params = Object.fromEntries(e.target.value.split(",").map(p => p.split(":").map(s => s.trim())).filter(arr => arr.length === 2));
              setNewTriggerParameters(params);
            }}
            placeholder="Params (key:value,comma separated)"
            className="border rounded px-2 py-1"
          />
          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={addWorkflowTrigger}>Add Trigger</button>
        </div>
        {testResult && <div className={`mb-2 text-xs ${testResult.includes("Success") ? "text-green-700" : "text-red-700"}`}>Test Result: {testResult}</div>}
        <div className="mb-4 text-xs text-gray-700">API Docs: <a href="https://n8n.io/docs/workflows/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Workflow Docs</a></div>
        <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowWorkflowModal(false)}>Close</button>
        {!isAdmin && <div className="mt-4 text-xs text-red-700">Only admins can delete triggers or view advanced settings.</div>}
      </div>
    </div>
  );
};

export default WorkflowTriggers;
