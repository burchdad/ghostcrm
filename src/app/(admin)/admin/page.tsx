"use client";
import React, { useState, useEffect } from "react";

// Placeholder chart component
function ChartPlaceholder({ title }: { title: string }) {
  return (
    <div className="card mb-4">
      <div className="font-bold mb-2">{title}</div>
      <div className="h-32 flex items-center justify-center text-gray-400">[Chart]</div>
    </div>
  );
}

function SecurityAIChatPanel() {
  const [messages, setMessages] = useState([
    { role: "system", content: "Welcome to the AI Security Assistant. Ask about audit logs, security risks, or best practices." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setMessages([...messages, { role: "user", content: input }]);
    // Call backend for AI response
    const res = await fetch("/api/security/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, { role: "user", content: input }] }),
    });
    const data = await res.json();
    setMessages([...messages, { role: "user", content: input }, { role: "assistant", content: data.reply }]);
    setInput("");
    setLoading(false);
  }

  return (
    <div className="card mb-4">
      <h2 className="font-bold text-lg mb-2">AI Security Assistant</h2>
      <div className="h-40 overflow-y-auto bg-gray-50 rounded p-2 mb-2 text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === "assistant" ? "text-blue-700" : m.role === "user" ? "text-gray-800" : "text-gray-500"}>
            <b>{m.role === "assistant" ? "AI" : m.role === "user" ? "You" : "System"}:</b> {m.content}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          className="input flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about audit logs, risks, etc."
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>Send</button>
      </form>
    </div>
  );
}

function SecuritySettingsPanel() {
  const [enable2FA, setEnable2FA] = useState(true);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const [forgotUserIdEmail, setForgotUserIdEmail] = useState("");
  const [forgotUserIdStatus, setForgotUserIdStatus] = useState("");
  const [aiSecurityAdvice, setAiSecurityAdvice] = useState("");

  async function handle2FAToggle() {
    setEnable2FA(!enable2FA);
    // Connect to backend
    await fetch("/api/security", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enable2FA, userId: "admin" }),
    });
  }
  async function handlePasswordReset() {
    const res = await fetch("/api/security", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail }),
    });
    const data = await res.json();
    setResetStatus("Password reset link sent to " + data.email);
  }
  async function handleForgotUserId() {
    const res = await fetch("/api/security", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotUserIdEmail }),
    });
    const data = await res.json();
    setForgotUserIdStatus("User ID sent to " + data.email);
  }
  async function fetchAiAdvice() {
    const res = await fetch("/api/security");
    const data = await res.json();
    setAiSecurityAdvice(data.advice);
  }
  // Fetch AI advice on mount
  React.useEffect(() => { fetchAiAdvice(); }, []);

  return (
    <div className="card mb-4">
      <h2 className="font-bold text-lg mb-2">Security Settings</h2>
      <div className="mb-2 flex items-center gap-2">
        <label className="font-bold">Enable 2FA</label>
        <input type="checkbox" checked={enable2FA} onChange={handle2FAToggle} />
        <span className="text-xs text-gray-500">(Recommended)</span>
      </div>
      <div className="mb-2">
        <label className="font-bold">Password Reset</label>
        <input type="email" className="input ml-2" placeholder="user email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
        <button className="btn btn-primary ml-2" onClick={handlePasswordReset}>Send Reset Link</button>
        {resetStatus && <div className="text-xs text-green-700 mt-1">{resetStatus}</div>}
      </div>
      <div className="mb-2">
        <label className="font-bold">Forgot User ID</label>
        <input type="email" className="input ml-2" placeholder="user email" value={forgotUserIdEmail} onChange={e => setForgotUserIdEmail(e.target.value)} />
        <button className="btn bg-yellow-600 text-white ml-2" onClick={handleForgotUserId}>Send User ID</button>
        {forgotUserIdStatus && <div className="text-xs text-green-700 mt-1">{forgotUserIdStatus}</div>}
      </div>
      <div className="mb-2">
        <label className="font-bold">Manage 2FA Methods</label>
        <button className="btn bg-purple-100 text-purple-700 ml-2">Update 2FA</button>
        <button className="btn btn-outline ml-2">Create New 2FA</button>
      </div>
      <div className="mb-2">
        <label className="font-bold">AI Security Advice</label>
        <div className="text-xs text-blue-700 mt-1">{aiSecurityAdvice}</div>
      </div>
    </div>
  );
}

function useAuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  useEffect(() => {
    fetch("/api/dashboard/audit")
      .then(res => res.json())
      .then(data => setAuditLogs(data.audit || []));
  }, []);
  return auditLogs;
}

function useSettings() {
  const [settings, setSettings] = useState({});
  useEffect(() => {
    fetch("/api/settings/client-settings")
      .then(res => res.json())
      .then(data => setSettings(data.settings || {}));
  }, []);
  return settings;
}

function useOrgData() {
  const [orgData, setOrgData] = useState({});
  useEffect(() => {
    fetch("/api/admin")
      .then(res => res.json())
      .then(data => setOrgData(data.records || {}));
  }, []);
  return orgData;
}

function SecurityAIInsightsPanel() {
  const auditLogs = useAuditLogs();
  const settings = useSettings();
  const orgData = useOrgData();
  const [analysis, setAnalysis] = useState("");
  const [compliance, setCompliance] = useState("");
  const [risk, setRisk] = useState("");
  const [loading, setLoading] = useState(false);

  async function runAIAnalysis() {
    setLoading(true);
    const res = await fetch("/api/security/ai-analyze-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auditLogs }),
    });
    const data = await res.json();
    setAnalysis(data.analysis);
    setLoading(false);
  }
  async function runAICompliance() {
    setLoading(true);
    const res = await fetch("/api/security/ai-compliance-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    const data = await res.json();
    setCompliance(data.compliance);
    setLoading(false);
  }
  async function runAIRiskScore() {
    setLoading(true);
    const res = await fetch("/api/security/ai-risk-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgData }),
    });
    const data = await res.json();
    setRisk(data.risk);
    setLoading(false);
  }

  return (
    <div className="card mb-4">
      <h2 className="font-bold text-lg mb-2">AI Security Insights</h2>
      <div className="flex gap-2 mb-2">
        <button className="btn btn-primary" onClick={runAIAnalysis} disabled={loading}>Analyze Audit Logs</button>
        <button className="btn bg-green-600 text-white" onClick={runAICompliance} disabled={loading}>Check Compliance</button>
        <button className="btn bg-yellow-600 text-white" onClick={runAIRiskScore} disabled={loading}>Score Risk</button>
      </div>
      {analysis && <div className="mb-2 text-xs text-blue-700"><b>Audit Analysis:</b> {analysis}</div>}
      {compliance && <div className="mb-2 text-xs text-green-700"><b>Compliance:</b> {compliance}</div>}
      {risk && <div className="mb-2 text-xs text-yellow-700"><b>Risk Score:</b> {risk}</div>}
    </div>
  );
}

function useLoginSecurityMonitor() {
  const [loginAttempts, setLoginAttempts] = useState([]);
  const [aiAlert, setAiAlert] = useState("");

  useEffect(() => {
    fetch("/api/security/login-attempts")
      .then(res => res.json())
      .then(data => setLoginAttempts(data.attempts || []));
  }, []);

  useEffect(() => {
    async function analyzeAttempts() {
      if (loginAttempts.length === 0) return;
      const res = await fetch("/api/security/ai-analyze-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attempts: loginAttempts }),
      });
      const data = await res.json();
      setAiAlert(data.alert);
    }
    analyzeAttempts();
  }, [loginAttempts]);

  return { loginAttempts, aiAlert };
}

function SecurityLoginMonitorPanel() {
  const { loginAttempts, aiAlert } = useLoginSecurityMonitor();
  return (
    <div className="card mb-4">
      <h2 className="font-bold text-lg mb-2">Login Security Monitor</h2>
      {aiAlert && <div className="mb-2 text-xs text-red-700"><b>AI Alert:</b> {aiAlert}</div>}
      <div className="h-24 overflow-y-auto bg-gray-50 rounded p-2 text-xs">
        {loginAttempts.map((a, idx) => (
          <div key={idx} className={a.suspicious ? "text-red-700" : "text-gray-800"}>
            {a.timestamp}: {a.email} from {a.ip} {a.suspicious ? "[Suspicious]" : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const [selectedOrg, setSelectedOrg] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
  const [userRole] = useState("superadmin"); // scaffolded role
  // Real-time analytics (scaffolded)
  const analytics = {
    userCount: Math.floor(Math.random() * 100),
    activeUsers: Math.floor(Math.random() * 80),
    roles: Math.floor(Math.random() * 10),
    auditEvents: Math.floor(Math.random() * 50),
  };
  // Audit/versioning (scaffolded)
  const auditHistory = [
    { action: "view", user: "alice", timestamp: "2025-09-14" },
    { action: "bulk role assign", user: "bob", timestamp: "2025-09-13" },
  ];
  // Compliance/security badges (scaffolded)
  const compliance = selectedOrg === "org1" ? "GDPR" : "";
  const security = selectedOrg === "org2" ? "Secure" : "";
  // Bulk operations (scaffolded)
  function handleBulkExport() {
    alert("Exported selected users");
    setBulkMode(false);
    setSelectedIdxs([]);
  }
  function handleBulkRoleAssign() {
    alert("Bulk assigned roles to selected users");
    setBulkMode(false);
    setSelectedIdxs([]);
  }
  function handleBulkDelete() {
    alert("Deleted selected users");
    setBulkMode(false);
    setSelectedIdxs([]);
  }
  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center mb-2">
        <label className="text-sm text-blue-800">Organization</label>
        <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} className="border rounded px-2 py-1">
          <option value="">All</option>
          <option value="org1">Org 1</option>
          <option value="org2">Org 2</option>
        </select>
        <button className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs" onClick={() => setBulkMode(!bulkMode)}>{bulkMode ? "Cancel Bulk" : "Bulk Ops"}</button>
        {compliance && <span className="ml-2 text-xs bg-blue-200 text-blue-900 rounded px-1">{compliance}</span>}
        {security && <span className="ml-2 text-xs bg-gray-200 text-gray-900 rounded px-1">{security}</span>}
      </div>
      {/* Bulk Operations UI */}
      {bulkMode && (
        <div className="mb-2 flex gap-2">
          <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={handleBulkExport}>Export Selected</button>
          <button className="px-2 py-1 bg-yellow-500 text-white rounded text-xs" onClick={handleBulkRoleAssign}>Bulk Role Assign</button>
          <button className="px-2 py-1 bg-red-500 text-white rounded text-xs" onClick={handleBulkDelete}>Delete Selected</button>
          <button className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs" onClick={() => setBulkMode(false)}>Cancel</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-100 rounded p-4">
          <div className="font-bold text-green-800">User Count</div>
          <div className="text-2xl">{analytics.userCount}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(0)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 0] : selectedIdxs.filter(i => i !== 0));
            }} />
          )}
        </div>
        <div className="bg-blue-100 rounded p-4">
          <div className="font-bold text-blue-800">Active Users</div>
          <div className="text-2xl">{analytics.activeUsers}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(1)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 1] : selectedIdxs.filter(i => i !== 1));
            }} />
          )}
        </div>
        <div className="bg-yellow-100 rounded p-4">
          <div className="font-bold text-yellow-800">Roles</div>
          <div className="text-2xl">{analytics.roles}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(2)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 2] : selectedIdxs.filter(i => i !== 2));
            }} />
          )}
        </div>
        <div className="bg-purple-100 rounded p-4">
          <div className="font-bold text-purple-800">Audit Events</div>
          <div className="text-2xl">{analytics.auditEvents}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(3)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 3] : selectedIdxs.filter(i => i !== 3));
            }} />
          )}
        </div>
      </div>
      <ChartPlaceholder title="User Activity Over Time" />
      <ChartPlaceholder title="Role Distribution" />
      <ChartPlaceholder title="Audit Event Trends" />
      <ChartPlaceholder title="Org Comparison" />
      {/* Audit/versioning history */}
      <div className="mt-4">
        <div className="font-bold mb-1">Audit History</div>
        <ul className="text-xs text-gray-600">
          {auditHistory.map((a, idx) => (
            <li key={idx}>{a.action} by {a.user} at {a.timestamp}</li>
          ))}
        </ul>
      </div>
      {/* Role-based controls */}
      {userRole === "superadmin" && (
        <div className="mt-2">
          <button className="px-2 py-1 bg-red-500 text-white rounded text-xs">Superadmin: Reset Admin Data</button>
        </div>
      )}
      <SecuritySettingsPanel />
      <SecurityAIChatPanel />
      <SecurityAIInsightsPanel />
      <SecurityLoginMonitorPanel />
    </div>
  );
}
