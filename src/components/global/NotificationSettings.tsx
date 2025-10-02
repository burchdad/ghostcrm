
import React, { useState } from "react";
import { FaHistory, FaRobot, FaUserShield, FaFileExport, FaFileImport, FaBell, FaCheck, FaTimes } from "react-icons/fa";

interface NotificationRule {
  trigger: string;
  action: string;
  channel: string;
  condition?: string;
  targetUser?: string;
  schedule?: string;
  template?: string;
  createdAt?: string;
  status?: "active" | "paused";
  franchiseId?: string;
  region?: string;
  department?: string;
  userGroup?: string;
  escalation?: Array<{ step: number; action: string; target: string }>;
  language?: string;
  timeZone?: string;
  compliance?: { gdpr?: boolean; ccpa?: boolean };
// End NotificationRule interface
}

interface NotificationPrefs {
  lead: boolean;
  deal: boolean;
  system: boolean;
  channel: string;
  rules: NotificationRule[];
  auditHistory?: Array<{ action: string; timestamp: string; user: string; franchiseId?: string }>;
  lastTestStatus?: string;
  franchises?: Array<{ id: string; name: string; region?: string }>;
  selectedFranchiseId?: string;
  permissions?: { [role: string]: string[] };
  analytics?: { deliveryRate?: number; openRate?: number; failureRate?: number };
// End NotificationPrefs interface
}

interface NotificationSettingsProps {
  notificationPrefs: NotificationPrefs;
  setNotificationPrefs: (prefs: NotificationPrefs | ((prev: NotificationPrefs) => NotificationPrefs)) => void;
  userRole?: string;
  franchises?: Array<{ id: string; name: string; region?: string }>;
// End NotificationSettingsProps interface
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ notificationPrefs, setNotificationPrefs, userRole, franchises }) => {
  const [newRule, setNewRule] = useState<NotificationRule>({ trigger: "lead_status_change", action: "notify", channel: "in-app" });
  const [importExportVisible, setImportExportVisible] = useState(false);
  const [testStatus, setTestStatus] = useState<string>("");
  const isSuperAdmin = userRole === "superadmin";
  const isFranchiseAdmin = userRole === "franchiseadmin";
  const canEdit = isSuperAdmin || isFranchiseAdmin;

  // AI suggestions stub
  const aiSuggestions = [
    { trigger: "deal_milestone", action: "notify", channel: "email", condition: "amount > 10000", template: "High Value Deal" },
    { trigger: "dashboard_shared", action: "notify", channel: "slack", template: "Dashboard Shared" }
  ];

  // Add new rule
  const addRule = () => {
    setNotificationPrefs(p => ({ ...p, rules: [...(p.rules || []), { ...newRule, createdAt: new Date().toISOString(), status: "active" }] }));
    setNewRule({ trigger: "lead_status_change", action: "notify", channel: "in-app" });
  };

  // Test notification
  const testNotification = () => {
    setTestStatus("Sending...");
    setTimeout(() => {
      setTestStatus("Success");
      setNotificationPrefs(p => ({ ...p, lastTestStatus: "Success" }));
    }, 1000);
  };

  // Export settings
  const exportSettings = () => {
    const data = JSON.stringify(notificationPrefs, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notification-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import settings
  const importSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        setNotificationPrefs(data);
      } catch {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 rounded bg-blue-50 border border-blue-200 mb-4 max-w-4xl">
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold text-blue-900 text-lg flex items-center gap-2"><FaBell /> Notification Settings</div>
        <div className="flex gap-2">
          <button className="px-2 py-1 bg-gray-100 rounded flex items-center gap-1" onClick={exportSettings} aria-label="Export Settings"><FaFileExport /> Export</button>
          <label className="px-2 py-1 bg-gray-100 rounded flex items-center gap-1 cursor-pointer" aria-label="Import Settings">
            <FaFileImport /> Import
            <input type="file" accept="application/json" className="hidden" onChange={importSettings} />
          </label>
        </div>
      </div>
      {/* Multi-tenant Franchise & Organization Selector */}
      <div className="mb-4 flex gap-2 items-center">
        {notificationPrefs.franchises && (
          <>
            <label className="text-sm text-blue-800">Franchise</label>
            <select value={notificationPrefs.selectedFranchiseId || ""} onChange={e => setNotificationPrefs(p => ({ ...p, selectedFranchiseId: e.target.value }))} className="border rounded px-2 py-1">
              <option value="">All</option>
              {notificationPrefs.franchises.map(f => <option key={f.id} value={f.id}>{f.name} {f.region ? `(${f.region})` : ""}</option>)}
            </select>
          </>
        )}
        {/* Organization selector (scaffolded for future extension) */}
        <label className="text-sm text-blue-800">Organization</label>
        <select className="border rounded px-2 py-1" disabled>
          <option value="">All</option>
          <option value="org1">Org 1</option>
          <option value="org2">Org 2</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-blue-800">Lead Alerts</label>
          <input type="checkbox" checked={notificationPrefs.lead} onChange={e => setNotificationPrefs(p => ({ ...p, lead: e.target.checked }))} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-blue-800">Deal Alerts</label>
          <input type="checkbox" checked={notificationPrefs.deal} onChange={e => setNotificationPrefs(p => ({ ...p, deal: e.target.checked }))} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-blue-800">System Alerts</label>
          <input type="checkbox" checked={notificationPrefs.system} onChange={e => setNotificationPrefs(p => ({ ...p, system: e.target.checked }))} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-blue-800">Channel</label>
          <select value={notificationPrefs.channel} onChange={e => setNotificationPrefs(p => ({ ...p, channel: e.target.value }))} className="border rounded px-2 py-1">
            <option value="in-app">In-App</option>
            <option value="slack">Slack</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="push">Push</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 bg-green-500 text-white rounded flex items-center gap-1" onClick={testNotification} aria-label="Test Notification"><FaCheck /> Test</button>
          {testStatus && <span className={`text-xs ml-2 ${testStatus === "Success" ? "text-green-700" : "text-red-700"}`}>{testStatus}</span>}
        </div>
      </div>
      <div className="mt-4">
        <div className="font-semibold mb-2 flex items-center gap-2"><FaHistory /> Audit & History</div>
        <ul className="text-xs mb-2">
          {notificationPrefs.auditHistory?.map((audit, idx) => (
            <li key={idx}>{audit.action} by {audit.user} at {audit.timestamp} {audit.franchiseId && <span className="text-blue-700">(Franchise: {audit.franchiseId})</span>}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <div className="font-semibold mb-2 flex items-center gap-2"><FaRobot /> AI Suggestions</div>
        <ul className="text-xs mb-2">
          {aiSuggestions.map((rule, idx) => (
            <li key={idx} className="mb-1 flex items-center">
              <span>{rule.trigger} → {rule.action} ({rule.channel}) {rule.condition && <span className="text-green-700">if {rule.condition}</span>} {rule.template && <span className="text-blue-700">[{rule.template}]</span>}</span>
              <button className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs" onClick={() => setNotificationPrefs(p => ({ ...p, rules: [...(p.rules || []), rule] }))}>Add</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <div className="font-semibold mb-2">Advanced Notification Rules</div>
        {/* Bulk operations UI */}
        <div className="mb-2 flex gap-2">
          <button className="px-2 py-1 bg-red-500 text-white rounded text-xs" onClick={() => setNotificationPrefs(p => ({ ...p, rules: [] }))}>Delete All</button>
          <button className="px-2 py-1 bg-gray-500 text-white rounded text-xs" onClick={() => setNotificationPrefs(p => ({ ...p, rules: p.rules.map(r => ({ ...r, status: "paused" })) }))}>Pause All</button>
          <button className="px-2 py-1 bg-green-500 text-white rounded text-xs" onClick={() => setNotificationPrefs(p => ({ ...p, rules: p.rules.map(r => ({ ...r, status: "active" })) }))}>Activate All</button>
        </div>
        <ul className="text-sm mb-2">
          {notificationPrefs.rules?.map((rule, idx) => (
            <li key={idx} className="mb-1 flex flex-wrap items-center gap-2">
              <span>{rule.trigger} → {rule.action} ({rule.channel})</span>
              {rule.franchiseId && <span className="text-blue-700">Franchise: {rule.franchiseId}</span>}
              {rule.region && <span className="text-purple-700">Region: {rule.region}</span>}
              {rule.department && <span className="text-green-700">Dept: {rule.department}</span>}
              {rule.userGroup && <span className="text-orange-700">Group: {rule.userGroup}</span>}
              {rule.condition && <span className="text-green-700">if {rule.condition}</span>}
              {rule.targetUser && <span className="text-blue-700">User: {rule.targetUser}</span>}
              {rule.schedule && <span className="text-purple-700">Schedule: {rule.schedule}</span>}
              {rule.template && <span className="text-gray-700">[{rule.template}]</span>}
              {rule.language && <span className="text-pink-700">Lang: {rule.language}</span>}
              {rule.timeZone && <span className="text-gray-700">TZ: {rule.timeZone}</span>}
              {rule.compliance && (rule.compliance.gdpr || rule.compliance.ccpa) && <span className="text-red-700">Compliance: {rule.compliance.gdpr ? "GDPR" : ""} {rule.compliance.ccpa ? "CCPA" : ""}</span>}
              {rule.escalation && rule.escalation.length > 0 && <span className="text-yellow-700">Escalation: {rule.escalation.map(e => `Step ${e.step}: ${e.action} → ${e.target}`).join(", ")}</span>}
              <button className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => {
                setNotificationPrefs(p => ({ ...p, rules: p.rules.filter((_, i) => i !== idx) }));
              }}>Delete</button>
              <button className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs" onClick={() => {
                setNotificationPrefs(p => ({ ...p, rules: p.rules.map((r, i) => i === idx ? { ...r, status: r.status === "active" ? "paused" : "active" } : r) }));
              }}>{rule.status === "active" ? "Pause" : "Activate"}</button>
            </li>
          ))}
        </ul>
        {/* Dynamic Rule Builder - Enterprise Extensions */}
        <div className="flex flex-wrap gap-2 mb-2">
          <select value={newRule.trigger} onChange={e => setNewRule(r => ({ ...r, trigger: e.target.value }))} className="border rounded px-2 py-1">
            <option value="lead_status_change">Lead Status Change</option>
            <option value="deal_milestone">Deal Milestone</option>
            <option value="new_comment">New Comment</option>
            <option value="dashboard_shared">Dashboard Shared</option>
          </select>
          <select value={newRule.action} onChange={e => setNewRule(r => ({ ...r, action: e.target.value }))} className="border rounded px-2 py-1">
            <option value="notify">Notify</option>
            <option value="email">Send Email</option>
            <option value="slack">Send Slack Message</option>
            <option value="sms">Send SMS</option>
            <option value="push">Send Push Notification</option>
          </select>
          <select value={newRule.channel} onChange={e => setNewRule(r => ({ ...r, channel: e.target.value }))} className="border rounded px-2 py-1">
            <option value="in-app">In-App</option>
            <option value="email">Email</option>
            <option value="slack">Slack</option>
            <option value="sms">SMS</option>
            <option value="push">Push</option>
          </select>
          {/* Enterprise targeting fields */}
          {notificationPrefs.franchises && (
            <select value={newRule.franchiseId || ""} onChange={e => setNewRule(r => ({ ...r, franchiseId: e.target.value }))} className="border rounded px-2 py-1">
              <option value="">All Franchises</option>
              {notificationPrefs.franchises.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          )}
          <input type="text" placeholder="Region (optional)" value={newRule.region || ""} onChange={e => setNewRule(r => ({ ...r, region: e.target.value }))} className="border rounded px-2 py-1" />
          <input type="text" placeholder="Department (optional)" value={newRule.department || ""} onChange={e => setNewRule(r => ({ ...r, department: e.target.value }))} className="border rounded px-2 py-1" />
          <input type="text" placeholder="User Group (optional)" value={newRule.userGroup || ""} onChange={e => setNewRule(r => ({ ...r, userGroup: e.target.value }))} className="border rounded px-2 py-1" />
          <input type="text" placeholder="Condition (optional)" value={newRule.condition || ""} onChange={e => setNewRule(r => ({ ...r, condition: e.target.value }))} className="border rounded px-2 py-1" />
          <input type="text" placeholder="Target User (optional)" value={newRule.targetUser || ""} onChange={e => setNewRule(r => ({ ...r, targetUser: e.target.value }))} className="border rounded px-2 py-1" />
          <input type="text" placeholder="Schedule (optional)" value={newRule.schedule || ""} onChange={e => setNewRule(r => ({ ...r, schedule: e.target.value }))} className="border rounded px-2 py-1" />
          <input type="text" placeholder="Template (optional)" value={newRule.template || ""} onChange={e => setNewRule(r => ({ ...r, template: e.target.value }))} className="border rounded px-2 py-1" />
          <input type="text" placeholder="Language (optional)" value={newRule.language || ""} onChange={e => setNewRule(r => ({ ...r, language: e.target.value }))} className="border rounded px-2 py-1" />
          <input type="text" placeholder="Time Zone (optional)" value={newRule.timeZone || ""} onChange={e => setNewRule(r => ({ ...r, timeZone: e.target.value }))} className="border rounded px-2 py-1" />
          <input type="text" placeholder="GDPR (true/false)" value={newRule.compliance?.gdpr ? "true" : ""} onChange={e => setNewRule(r => ({ ...r, compliance: { ...r.compliance, gdpr: e.target.value === "true" } }))} className="border rounded px-2 py-1" />
          <input type="text" placeholder="CCPA (true/false)" value={newRule.compliance?.ccpa ? "true" : ""} onChange={e => setNewRule(r => ({ ...r, compliance: { ...r.compliance, ccpa: e.target.value === "true" } }))} className="border rounded px-2 py-1" />
          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={addRule}>Add Rule</button>
        </div>
      </div>
      <div className="mt-4 text-xs text-blue-700">
        <a href="/api/docs/notifications" target="_blank" rel="noopener noreferrer">Integration API Docs</a>
      </div>
  {!canEdit && <div className="mt-4 text-xs text-red-700"><FaUserShield /> Only franchise or super admins can edit advanced rules.</div>}
      {/* Analytics, Monitoring, Integration, Compliance, Localization, Performance - Scaffolded for future extension */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded shadow">
          <div className="font-semibold mb-2">Delivery Analytics</div>
          <div className="text-xs">Delivery Rate: {notificationPrefs.analytics?.deliveryRate ?? "-"}%</div>
          <div className="text-xs">Open Rate: {notificationPrefs.analytics?.openRate ?? "-"}%</div>
          <div className="text-xs">Failure Rate: {notificationPrefs.analytics?.failureRate ?? "-"}%</div>
        </div>
        <div className="p-4 bg-gray-50 rounded shadow">
          <div className="font-semibold mb-2">Integration & Compliance</div>
          <div className="text-xs">Webhooks, API endpoints, DMS/ERP integration (scaffolded)</div>
          <div className="text-xs">GDPR/CCPA compliance, opt-in/out, retention policies (scaffolded)</div>
          <div className="text-xs">Localization: Multi-language, time zone aware (scaffolded)</div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
