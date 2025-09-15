import { useState } from "react";
// Placeholder chart component
function ChartPlaceholder({ title }: { title: string }) {
  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <div className="font-bold mb-2">{title}</div>
      <div className="h-32 flex items-center justify-center text-gray-400">[Chart]</div>
    </div>
  );
}

export default function Performance() {
  const [selectedOrg, setSelectedOrg] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
  const [userRole] = useState("admin"); // scaffolded role
  // Real-time analytics (scaffolded)
  const analytics = {
    teamScore: Math.floor(Math.random() * 100),
    repScore: Math.floor(Math.random() * 100),
    pipelineScore: Math.floor(Math.random() * 100),
    conversionRate: Math.floor(Math.random() * 100),
  };
  // Audit/versioning (scaffolded)
  const auditHistory = [
    { action: "view", user: "alice", timestamp: "2025-09-14" },
    { action: "export", user: "bob", timestamp: "2025-09-13" },
  ];
  // Compliance/security badges (scaffolded)
  const compliance = selectedOrg === "org1" ? "GDPR" : "";
  const security = selectedOrg === "org2" ? "Secure" : "";
  // Bulk operations (scaffolded)
  function handleBulkExport() {
    // Simulate export
    alert("Exported selected performance data");
    setBulkMode(false);
    setSelectedIdxs([]);
  }
  function handleBulkSchedule() {
    // Simulate schedule
    alert("Scheduled report for selected performance data");
    setBulkMode(false);
    setSelectedIdxs([]);
  }
  function handleBulkCompare() {
    // Simulate compare
    alert("Compared selected performance data");
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
          <button className="px-2 py-1 bg-yellow-500 text-white rounded text-xs" onClick={handleBulkSchedule}>Schedule Report</button>
          <button className="px-2 py-1 bg-green-500 text-white rounded text-xs" onClick={handleBulkCompare}>Compare Selected</button>
          <button className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs" onClick={() => setBulkMode(false)}>Cancel</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-100 rounded p-4">
          <div className="font-bold text-green-800">Team Score</div>
          <div className="text-2xl">{analytics.teamScore}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(0)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 0] : selectedIdxs.filter(i => i !== 0));
            }} />
          )}
        </div>
        <div className="bg-blue-100 rounded p-4">
          <div className="font-bold text-blue-800">Rep Score</div>
          <div className="text-2xl">{analytics.repScore}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(1)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 1] : selectedIdxs.filter(i => i !== 1));
            }} />
          )}
        </div>
        <div className="bg-yellow-100 rounded p-4">
          <div className="font-bold text-yellow-800">Pipeline Score</div>
          <div className="text-2xl">{analytics.pipelineScore}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(2)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 2] : selectedIdxs.filter(i => i !== 2));
            }} />
          )}
        </div>
        <div className="bg-purple-100 rounded p-4">
          <div className="font-bold text-purple-800">Conversion Rate</div>
          <div className="text-2xl">{analytics.conversionRate}%</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(3)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 3] : selectedIdxs.filter(i => i !== 3));
            }} />
          )}
        </div>
      </div>
      <ChartPlaceholder title="Team Performance Over Time" />
      <ChartPlaceholder title="Rep Leaderboard" />
      <ChartPlaceholder title="Pipeline Conversion Trends" />
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
      {userRole === "admin" && (
        <div className="mt-2">
          <button className="px-2 py-1 bg-red-500 text-white rounded text-xs">Admin: Reset Performance Data</button>
        </div>
      )}
    </div>
  );
}
