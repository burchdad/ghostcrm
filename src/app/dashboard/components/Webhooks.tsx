
import React from "react";

interface Webhook {
  url: string;
  type: string;
  headers?: Record<string, string>;
  payloadTemplate?: string;
  tags?: string[];
  version?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: "active" | "paused" | "error";
  lastDelivery?: string;
  lastResponse?: string;
  errorCount?: number;
  retryCount?: number;
  auditHistory?: Array<{ action: string; timestamp: string; user: string }>;
// End Webhook interface
}

interface WebhooksProps {
  webhooks: Webhook[];
  setWebhooks: (webhooks: Webhook[]) => void;
  showWebhookModal: boolean;
  setShowWebhookModal: (show: boolean) => void;
  newWebhookUrl: string;
  setNewWebhookUrl: (url: string) => void;
  newWebhookType: string;
  setNewWebhookType: (type: string) => void;
  newWebhookHeaders?: Record<string, string>;
  setNewWebhookHeaders?: (headers: Record<string, string>) => void;
  newWebhookPayload?: string;
  setNewWebhookPayload?: (payload: string) => void;
  newWebhookTags?: string[];
  setNewWebhookTags?: (tags: string[]) => void;
  addWebhook: () => void;
  removeWebhook: (idx: number) => void;
  userRole?: string;
// End WebhooksProps interface
}

const WEBHOOK_TYPES = [
  { value: "lead", label: "Lead" },
  { value: "deal", label: "Deal" },
  { value: "custom", label: "Custom" },
  { value: "audit", label: "Audit" },
  { value: "analytics", label: "Analytics" },
  { value: "notification", label: "Notification" },
  { value: "ai", label: "AI" }
];

const Webhooks: React.FC<WebhooksProps> = ({
  webhooks,
  setWebhooks,
  showWebhookModal,
  setShowWebhookModal,
  newWebhookUrl,
  setNewWebhookUrl,
  newWebhookType,
  setNewWebhookType,
  newWebhookHeaders = {},
  setNewWebhookHeaders = () => {},
  newWebhookPayload = "",
  setNewWebhookPayload = () => {},
  newWebhookTags = [],
  setNewWebhookTags = () => {},
  addWebhook,
  removeWebhook,
  userRole
}) => {
  const [search, setSearch] = React.useState("");
  const [testResult, setTestResult] = React.useState<string>("");
  const [importExportVisible, setImportExportVisible] = React.useState(false);
  const isAdmin = userRole === "admin" || userRole === "superadmin";

  // Test webhook stub
  const testWebhook = (webhook: Webhook) => {
    setTestResult("Testing...");
    setTimeout(() => {
      setTestResult(`Test for '${webhook.url}' (${webhook.type}): Success`);
    }, 1000);
  };

  // Export webhooks
  const exportWebhooks = () => {
    const data = JSON.stringify(webhooks, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "webhooks.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import webhooks
  const importWebhooks = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        setWebhooks(data);
      } catch {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  // Filtered webhooks
  const filteredWebhooks = webhooks.filter(w =>
    w.url.toLowerCase().includes(search.toLowerCase()) ||
    w.type.toLowerCase().includes(search.toLowerCase()) ||
    (w.tags && w.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
  );

  if (!showWebhookModal) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-xl">Manage Webhooks</h3>
          <div className="flex gap-2">
            <button className="px-2 py-1 bg-gray-100 rounded text-xs" onClick={exportWebhooks}>Export</button>
            <label className="px-2 py-1 bg-gray-100 rounded text-xs cursor-pointer">
              Import
              <input type="file" accept="application/json" className="hidden" onChange={importWebhooks} />
            </label>
          </div>
        </div>
        <div className="mb-2 text-sm text-gray-600">Configure webhooks for all events, with advanced settings, analytics, and monitoring.</div>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search webhooks..." className="border rounded px-2 py-1 mb-2 w-full" />
        <ul className="text-sm mb-2 max-h-48 overflow-auto">
          {filteredWebhooks.map((webhook, idx) => (
            <li key={idx} className="mb-2 flex flex-col md:flex-row md:items-center justify-between border-b pb-2">
              <div>
                <span className="font-semibold">{webhook.url}</span>
                <span className="text-xs text-gray-500 ml-2">({webhook.type})</span>
                {webhook.tags && webhook.tags.length > 0 && <span className="text-xs text-blue-700 ml-2">Tags: {webhook.tags.join(", ")}</span>}
                {webhook.version && <span className="text-xs text-purple-700 ml-2">v{webhook.version}</span>}
                {webhook.status && <span className="text-xs ml-2">[{webhook.status}]</span>}
                {webhook.lastDelivery && <span className="text-xs text-green-700 ml-2">Last Delivery: {webhook.lastDelivery}</span>}
                {webhook.lastResponse && <span className="text-xs text-gray-700 ml-2">Response: {webhook.lastResponse}</span>}
                {webhook.errorCount !== undefined && <span className="text-xs text-red-700 ml-2">Errors: {webhook.errorCount}</span>}
                {webhook.retryCount !== undefined && <span className="text-xs text-yellow-700 ml-2">Retries: {webhook.retryCount}</span>}
                {webhook.auditHistory && webhook.auditHistory.length > 0 && <span className="text-xs text-gray-400 ml-2">Audit: {webhook.auditHistory.map(a => `${a.action} by ${a.user} at ${a.timestamp}`).join(" | ")}</span>}
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs" onClick={() => testWebhook(webhook)}>Test</button>
                {isAdmin && <button className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removeWebhook(idx)}>Delete</button>}
              </div>
              {webhook.payloadTemplate && <div className="text-xs text-gray-700 mt-1">Payload: {webhook.payloadTemplate}</div>}
              {webhook.headers && Object.keys(webhook.headers).length > 0 && <div className="text-xs text-gray-700 mt-1">Headers: {Object.entries(webhook.headers).map(([k, v]) => `${k}: ${v}`).join(", ")}</div>}
            </li>
          ))}
        </ul>
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <input
            type="text"
            value={newWebhookUrl}
            onChange={e => setNewWebhookUrl(e.target.value)}
            placeholder="Webhook URL"
            className="border rounded px-2 py-1"
          />
          <select value={newWebhookType} onChange={e => setNewWebhookType(e.target.value)} className="border rounded px-2 py-1">
            {WEBHOOK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input
            type="text"
            value={newWebhookPayload}
            onChange={e => setNewWebhookPayload(e.target.value)}
            placeholder="Payload Template (optional)"
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            value={Object.entries(newWebhookHeaders).map(([k, v]) => `${k}:${v}`).join(",")}
            onChange={e => {
              const headers = Object.fromEntries(e.target.value.split(",").map(h => h.split(":").map(s => s.trim())).filter(arr => arr.length === 2));
              setNewWebhookHeaders(headers);
            }}
            placeholder="Headers (key:value,comma separated)"
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            value={newWebhookTags.join(",")}
            onChange={e => setNewWebhookTags(e.target.value.split(",").map(t => t.trim()))}
            placeholder="Tags (comma separated)"
            className="border rounded px-2 py-1"
          />
          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={addWebhook}>Add Webhook</button>
        </div>
        {testResult && <div className={`mb-2 text-xs ${testResult.includes("Success") ? "text-green-700" : "text-red-700"}`}>Test Result: {testResult}</div>}
        <div className="mb-4 text-xs text-gray-700">API Docs: <a href="https://webhooks.io/documentation/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Webhooks Docs</a></div>
        <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowWebhookModal(false)}>Close</button>
        {!isAdmin && <div className="mt-4 text-xs text-red-700">Only admins can delete webhooks or view advanced settings.</div>}
      </div>
    </div>
  );
};

export default Webhooks;
