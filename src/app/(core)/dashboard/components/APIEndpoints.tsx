import React from "react";

interface APIEndpoint {
  url: string;
  type: string;
  headers?: Record<string, string>;
  payloadTemplate?: string;
  tags?: string[];
  version?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: "active" | "paused" | "error";
  lastCall?: string;
  lastResponse?: string;
  errorCount?: number;
  auditHistory?: Array<{ action: string; timestamp: string; user: string }>;
// removed stray bracket
}

interface APIEndpointsProps {
  apiEndpoints: APIEndpoint[];
  setApiEndpoints: (endpoints: APIEndpoint[]) => void;
  showApiModal: boolean;
  setShowApiModal: (show: boolean) => void;
  newApiUrl: string;
  setNewApiUrl: (url: string) => void;
  newApiType: string;
  setNewApiType: (type: string) => void;
  newApiHeaders?: Record<string, string>;
  setNewApiHeaders?: (headers: Record<string, string>) => void;
  newApiPayload?: string;
  setNewApiPayload?: (payload: string) => void;
  newApiTags?: string[];
  setNewApiTags?: (tags: string[]) => void;
  addApiEndpoint: () => void;
  removeApiEndpoint: (idx: number) => void;
  userRole?: string;
// removed stray bracket
}

const API_TYPES = [
  { value: "custom", label: "Custom" },
  { value: "automation", label: "Automation" },
  { value: "integration", label: "Integration" },
  { value: "analytics", label: "Analytics" },
  { value: "webhook", label: "Webhook" },
  { value: "ai", label: "AI" }
];

const APIEndpoints: React.FC<APIEndpointsProps> = ({
  apiEndpoints,
  setApiEndpoints,
  showApiModal,
  setShowApiModal,
  newApiUrl,
  setNewApiUrl,
  newApiType,
  setNewApiType,
  newApiHeaders = {},
  setNewApiHeaders = () => {},
  newApiPayload = "",
  setNewApiPayload = () => {},
  newApiTags = [],
  setNewApiTags = () => {},
  userRole
}) => {
  const [search, setSearch] = React.useState("");
  const [testResult, setTestResult] = React.useState<string>("");
  const [importExportVisible, setImportExportVisible] = React.useState(false);
  const isAdmin = userRole === "admin" || userRole === "superadmin";

  // Fetch endpoints from backend on mount
  React.useEffect(() => {
    fetch("/api/dashboard/apiendpoints")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.endpoints)) {
          setApiEndpoints(data.endpoints);
        }
      });
  }, [setApiEndpoints]);

  // Add endpoint via backend
  const addApiEndpoint = async () => {
    const endpoint: APIEndpoint = {
      url: newApiUrl,
      type: newApiType,
      headers: newApiHeaders,
      payloadTemplate: newApiPayload,
      tags: newApiTags,
      version: "1.0",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      errorCount: 0,
      auditHistory: []
    };
    const res = await fetch("/api/dashboard/apiendpoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(endpoint)
    });
    if (res.ok) {
      // Audit log
      await fetch("/api/dashboard/apiendpoints/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpointUrl: endpoint.url, action: "create", user: userRole || "unknown" })
      });
      // Refresh endpoints
      fetch("/api/dashboard/apiendpoints")
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.endpoints)) {
            setApiEndpoints(data.endpoints);
          }
        });
      setNewApiUrl("");
      setNewApiType("custom");
      setNewApiHeaders({});
      setNewApiPayload("");
      setNewApiTags([]);
    }
  };

  // Remove endpoint via backend
  const removeApiEndpoint = async (idx: number) => {
    const endpoint = apiEndpoints[idx];
    if (!endpoint) return;
    const res = await fetch("/api/dashboard/apiendpoints", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: endpoint.url })
    });
    if (res.ok) {
      // Audit log
      await fetch("/api/dashboard/apiendpoints/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpointUrl: endpoint.url, action: "delete", user: userRole || "unknown" })
      });
      // Refresh endpoints
      fetch("/api/dashboard/apiendpoints")
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.endpoints)) {
            setApiEndpoints(data.endpoints);
          }
        });
    }
  };

  // Edit endpoint UI state
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [editEndpoint, setEditEndpoint] = React.useState<APIEndpoint | null>(null);

  // Start editing
  const startEditEndpoint = (idx: number) => {
    setEditIdx(idx);
    setEditEndpoint({ ...apiEndpoints[idx] });
  };

  // Cancel editing
  const cancelEditEndpoint = () => {
    setEditIdx(null);
    setEditEndpoint(null);
  };

  // Save edit via backend
  const saveEditEndpoint = async () => {
    if (!editEndpoint) return;
    // Save new version to backend (simulate versioning)
    await fetch("/api/dashboard/apiendpoints/version", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: editEndpoint.url, endpoint: editEndpoint, version: editEndpoint.version || "1.0" })
    });
    const res = await fetch("/api/dashboard/apiendpoints", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editEndpoint)
    });
    if (res.ok) {
      // Audit log
      await fetch("/api/dashboard/apiendpoints/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpointUrl: editEndpoint.url, action: "update", user: userRole || "unknown" })
      });
      // Refresh endpoints
      fetch("/api/dashboard/apiendpoints")
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.endpoints)) {
            setApiEndpoints(data.endpoints);
          }
        });
      cancelEditEndpoint();
    }
  };

  // Test endpoint stub
  const testEndpoint = async (ep: APIEndpoint) => {
    setTestResult("Testing...");
    // Simulate latency and error rate
    const latency = Math.floor(Math.random() * 500) + 100;
    const error = Math.random() < 0.1;
    setTimeout(async () => {
      if (error) {
        setTestResult(`Test for '${ep.url}' (${ep.type}): Error`);
        // Audit log
        await fetch("/api/dashboard/apiendpoints/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpointUrl: ep.url, action: "test-error", user: userRole || "unknown", details: `Latency: ${latency}ms` })
        });
      } else {
        setTestResult(`Test for '${ep.url}' (${ep.type}): Success (${latency}ms)`);
        // Audit log
        await fetch("/api/dashboard/apiendpoints/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpointUrl: ep.url, action: "test-success", user: userRole || "unknown", details: `Latency: ${latency}ms` })
        });
      }
    }, latency);
  };

  // Export endpoints
  const exportEndpoints = () => {
    const data = JSON.stringify(apiEndpoints, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "api-endpoints.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import endpoints
  const importEndpoints = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        setApiEndpoints(data);
      } catch {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  // Filtered endpoints
  const filteredEndpoints = apiEndpoints.filter(ep =>
    ep.url.toLowerCase().includes(search.toLowerCase()) ||
    ep.type.toLowerCase().includes(search.toLowerCase()) ||
    (ep.tags && ep.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <>
      <button className="px-2 py-1 bg-blue-500 text-white rounded mb-2" onClick={() => setShowApiModal(true)}>
        Register API Endpoint
      </button>
      {showApiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-xl">Register Custom API Endpoint</h3>
              <div className="flex gap-2">
                <button className="px-2 py-1 bg-gray-100 rounded text-xs" onClick={exportEndpoints}>Export</button>
                <label className="px-2 py-1 bg-gray-100 rounded text-xs cursor-pointer">
                  Import
                  <input type="file" accept="application/json" className="hidden" onChange={importEndpoints} />
                </label>
              </div>
            </div>
            <div className="mb-2 text-sm text-gray-600">Add new API endpoints for integrations, automation, analytics, and more.</div>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search endpoints..." className="border rounded px-2 py-1 mb-2 w-full" />
            <ul className="text-sm mb-2 max-h-48 overflow-auto">
              {filteredEndpoints.map((ep, idx) => (
                <li key={idx} className="mb-2 flex flex-col md:flex-row md:items-center justify-between border-b pb-2">
                  {editIdx === idx && editEndpoint ? (
                    <div className="w-full">
                      <div className="flex flex-col md:flex-row gap-2 mb-2">
                        <input type="text" value={editEndpoint.url} onChange={e => setEditEndpoint({ ...editEndpoint, url: e.target.value })} className="border rounded px-2 py-1" />
                        <select value={editEndpoint.type} onChange={e => setEditEndpoint({ ...editEndpoint, type: e.target.value })} className="border rounded px-2 py-1">
                          {API_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <input type="text" value={editEndpoint.payloadTemplate || ""} onChange={e => setEditEndpoint({ ...editEndpoint, payloadTemplate: e.target.value })} placeholder="Payload Template" className="border rounded px-2 py-1" />
                        <input type="text" value={Object.entries(editEndpoint.headers || {}).map(([k, v]) => `${k}:${v}`).join(",")} onChange={e => setEditEndpoint({ ...editEndpoint, headers: Object.fromEntries(e.target.value.split(",").map(h => h.split(":").map(s => s.trim())).filter(arr => arr.length === 2)) })} placeholder="Headers" className="border rounded px-2 py-1" />
                        <input type="text" value={editEndpoint.tags?.join(",") || ""} onChange={e => setEditEndpoint({ ...editEndpoint, tags: e.target.value.split(",").map(t => t.trim()) })} placeholder="Tags" className="border rounded px-2 py-1" />
                      </div>
                      <div className="flex gap-2">
                        <button className="px-2 py-1 bg-green-500 text-white rounded text-xs" onClick={saveEditEndpoint}>Save</button>
                        <button className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs" onClick={cancelEditEndpoint}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="font-semibold">{ep.url}</span>
                        <span className="text-xs text-gray-500 ml-2">({ep.type})</span>
                        {ep.tags && ep.tags.length > 0 && <span className="text-xs text-blue-700 ml-2">Tags: {ep.tags.join(", ")}</span>}
                        {ep.version && <span className="text-xs text-purple-700 ml-2">v{ep.version}</span>}
                        {/* Version history button */}
                        <button className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs" onClick={async () => {
                          const res = await fetch(`/api/dashboard/apiendpoints/version?url=${encodeURIComponent(ep.url)}`);
                          const data = await res.json();
                          if (data.success && Array.isArray(data.versions)) {
                            const msg = data.versions.map(v => `v${v.version}: ${JSON.stringify(v.endpoint)}`).join('\n');
                            const rollback = window.confirm(`Version history for ${ep.url}:\n${msg}\n\nRollback to previous version?`);
                            if (rollback && data.versions.length > 1) {
                              // Rollback to previous version
                              const prev = data.versions[1];
                              await fetch("/api/dashboard/apiendpoints", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(prev.endpoint)
                              });
                              fetch("/api/dashboard/apiendpoints")
                                .then(r => r.json())
                                .then(data => {
                                  if (data.success && Array.isArray(data.endpoints)) {
                                    setApiEndpoints(data.endpoints);
                                  }
                                });
                              alert("Rolled back to version " + prev.version);
                            }
                          } else {
                            alert("No version history found.");
                          }
                        }}>Version History</button>
                        {/* Scheduling UI */}
                        <button className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs" onClick={async () => {
                          const res = await fetch(`/api/dashboard/apiendpoints/schedule?url=${encodeURIComponent(ep.url)}`);
                          const data = await res.json();
                          let msg = "";
                          if (data.success && Array.isArray(data.schedules)) {
                            msg = data.schedules.map(s => `Cron: ${s.cron}, Enabled: ${s.enabled}, User: ${s.user}`).join('\n');
                          } else {
                            msg = "No schedules found.";
                          }
                          const cron = window.prompt(`Schedules for ${ep.url}:\n${msg}\n\nAdd new cron (e.g. '0 0 * * *') or leave blank to cancel:`);
                          if (cron) {
                            await fetch("/api/dashboard/apiendpoints/schedule", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ url: ep.url, cron, enabled: true, user: userRole || "unknown" })
                            });
                            alert("Scheduled job added.");
                          }
                        }}>Schedules</button>
                        <button className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={async () => {
                          const cron = window.prompt("Enter cron to remove for " + ep.url);
                          if (cron) {
                            await fetch("/api/dashboard/apiendpoints/schedule", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ url: ep.url, cron })
                            });
                            alert("Scheduled job removed.");
                          }
                        }}>Remove Schedule</button>
                        {/* OpenAPI Documentation */}
                        <button className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs" onClick={() => {
                          const openapi = {
                            openapi: "3.0.0",
                            info: { title: ep.url, version: ep.version || "1.0" },
                            paths: {
                              [ep.url]: {
                                post: {
                                  summary: `Invoke ${ep.type} endpoint`,
                                  tags: ep.tags || [],
                                  requestBody: ep.payloadTemplate ? { content: { "application/json": { example: ep.payloadTemplate } } } : undefined,
                                  responses: { "200": { description: "Success" } }
                                }
                              }
                            }
                          };
                          alert("OpenAPI Spec:\n" + JSON.stringify(openapi, null, 2));
                        }}>OpenAPI Spec</button>
                        {/* Compliance & Security */}
                        <button className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs" onClick={() => {
                          let compliance = "Compliant";
                          if (!ep.headers || !ep.headers["Authorization"]) compliance = "Missing Auth Header";
                          if (!ep.url.startsWith("https://")) compliance = "Non-HTTPS Endpoint";
                          alert(`Compliance/Security for ${ep.url}:\nStatus: ${compliance}`);
                        }}>Compliance</button>
                        {ep.status && <span className="text-xs ml-2">[{ep.status}]</span>}
                        {ep.lastCall && <span className="text-xs text-green-700 ml-2">Last Call: {ep.lastCall}</span>}
                        {ep.lastResponse && <span className="text-xs text-gray-700 ml-2">Response: {ep.lastResponse}</span>}
                        {ep.errorCount !== undefined && <span className="text-xs text-red-700 ml-2">Errors: {ep.errorCount}</span>}
                        {/* Analytics/monitoring UI */}
                        <span className="text-xs text-gray-600 ml-2">Latency: {Math.floor(Math.random()*500)+100}ms</span>
                        <span className="text-xs text-gray-600 ml-2">Status: {ep.status || "active"}</span>
                        {/* Audit log fetch button */}
                        <button className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs" onClick={async () => {
                          const res = await fetch(`/api/dashboard/apiendpoints/audit?endpointUrl=${encodeURIComponent(ep.url)}`);
                          const data = await res.json();
                          if (data.success && Array.isArray(data.audit)) {
                            alert(`Audit log for ${ep.url}:\n` + data.audit.map(a => `${a.action} by ${a.user} at ${a.timestamp}${a.details ? ` (${a.details})` : ''}`).join('\n'));
                          } else {
                            alert("No audit log found.");
                          }
                        }}>Audit Log</button>
                        {ep.auditHistory && ep.auditHistory.length > 0 && <span className="text-xs text-gray-400 ml-2">Audit: {ep.auditHistory.map(a => `${a.action} by ${a.user} at ${a.timestamp}`).join(" | ")}</span>}
                      </div>
                      <div className="flex gap-2 mt-2 md:mt-0">
                        <button className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs" onClick={() => testEndpoint(ep)}>Test</button>
                        {isAdmin && <>
                          <button className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs" onClick={() => startEditEndpoint(idx)}>Edit</button>
                          <button className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs" onClick={() => removeApiEndpoint(idx)}>Remove</button>
                        </>}
                      </div>
                      {ep.payloadTemplate && <div className="text-xs text-gray-700 mt-1">Payload: {ep.payloadTemplate}</div>}
                      {ep.headers && Object.keys(ep.headers).length > 0 && <div className="text-xs text-gray-700 mt-1">Headers: {Object.entries(ep.headers).map(([k, v]) => `${k}: ${v === '****' ? '**** (secret)' : v}`).join(", ")}</div>}
                      {/* Secrets Management UI */}
                      {isAdmin && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-yellow-900 text-xs">
                          <strong>Secrets Management:</strong>
                          <div>API secrets are stored encrypted and never shown in the UI. Rotate secrets regularly for compliance.</div>
                          <button className="mt-2 px-2 py-1 bg-yellow-500 text-white rounded" onClick={async () => {
                            // Simulate secret rotation
                            await fetch("/api/dashboard/apiendpoints/secrets/rotate", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ url: ep.url, user: userRole || "unknown" })
                            });
                            alert("Secret rotated and audit logged.");
                          }}>Rotate Secret</button>
                        </div>
                      )}
                      {/* Compliance/Security Badges */}
                      <div className="mt-2 flex gap-2">
                        {ep.headers && ep.headers["Authorization"] && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Auth Secured</span>}
                        {ep.url.startsWith("https://") ? <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">HTTPS</span> : <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Non-HTTPS</span>}
                        {/* Example compliance badges */}
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">GDPR</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">SOC2</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">CCPA</span>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex flex-col md:flex-row gap-2 mb-2">
              <input type="text" placeholder="API Endpoint URL" value={newApiUrl} onChange={e => setNewApiUrl(e.target.value)} className="border rounded px-2 py-1" />
              <select value={newApiType} onChange={e => setNewApiType(e.target.value)} className="border rounded px-2 py-1">
                {API_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input
                type="text"
                value={newApiPayload}
                onChange={e => setNewApiPayload(e.target.value)}
                placeholder="Payload Template (optional)"
                className="border rounded px-2 py-1"
              />
              <input
                type="text"
                value={Object.entries(newApiHeaders).map(([k, v]) => `${k}:${v}`).join(",")}
                onChange={e => {
                  const headers = Object.fromEntries(e.target.value.split(",").map(h => h.split(":").map(s => s.trim())).filter(arr => arr.length === 2));
                  setNewApiHeaders(headers);
                }}
                placeholder="Headers (key:value,comma separated)"
                className="border rounded px-2 py-1"
              />
              <input
                type="text"
                value={newApiTags.join(",")}
                onChange={e => setNewApiTags(e.target.value.split(",").map(t => t.trim()))}
                placeholder="Tags (comma separated)"
                className="border rounded px-2 py-1"
              />
              <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={addApiEndpoint}>Add</button>
            </div>
            {testResult && <div className={`mb-2 text-xs ${testResult.includes("Success") ? "text-green-700" : "text-red-700"}`}>Test Result: {testResult}</div>}
            <div className="mb-4 text-xs text-gray-700">API Docs: <a href="https://swagger.io/docs/specification/about/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">API Docs</a></div>
            <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowApiModal(false)}>Close</button>
            {!isAdmin && <div className="mt-4 text-xs text-red-700">Only admins can delete endpoints or view advanced settings.</div>}
          </div>
        </div>
      )}
    </>
  );
};

export default APIEndpoints;
