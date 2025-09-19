 "use client";
import { useState, useEffect } from "react";
// Placeholder chart component
function ChartPlaceholder({ title }: { title: string }) {
  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <div className="font-bold mb-2">{title}</div>
      <div className="h-32 flex items-center justify-center text-gray-400">[Chart]</div>
    </div>
  );
}

export default function Inventory() {
  const [selectedOrg, setSelectedOrg] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
  const [userRole] = useState("admin"); // scaffolded role
  // Real-time analytics (scaffolded) - generate only on client
  const [analytics, setAnalytics] = useState<null | {
    stockLevel: number;
    turnover: number;
    lowStock: number;
    outOfStock: number;
  }>(null);
  // Generate analytics only on client to avoid hydration mismatch
  useEffect(() => {
    setAnalytics({
      stockLevel: Math.floor(Math.random() * 1000),
      turnover: Math.floor(Math.random() * 10000),
      lowStock: Math.floor(Math.random() * 50),
      outOfStock: Math.floor(Math.random() * 10),
    });
  }, []);
  // Audit/versioning (scaffolded)
  const auditHistory = [
    { action: "view", user: "alice", timestamp: "2025-09-14" },
    { action: "bulk update", user: "bob", timestamp: "2025-09-13" },
  ];
  // Compliance/security badges (scaffolded)
  const compliance = selectedOrg === "org1" ? "GDPR" : "";
  const security = selectedOrg === "org2" ? "Secure" : "";
  // Bulk operations (scaffolded)
  function handleBulkExport() {
    alert("Exported selected inventory items");
    setBulkMode(false);
    setSelectedIdxs([]);
  }
  function handleBulkUpdate() {
    alert("Bulk updated selected inventory items");
    setBulkMode(false);
    setSelectedIdxs([]);
  }
  function handleBulkDelete() {
    alert("Deleted selected inventory items");
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
          <button className="px-2 py-1 bg-yellow-500 text-white rounded text-xs" onClick={handleBulkUpdate}>Bulk Update</button>
          <button className="px-2 py-1 bg-red-500 text-white rounded text-xs" onClick={handleBulkDelete}>Delete Selected</button>
          <button className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs" onClick={() => setBulkMode(false)}>Cancel</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-100 rounded p-4">
          <div className="font-bold text-green-800">Stock Level</div>
          <div className="text-2xl">{analytics ? analytics.stockLevel : <span className="text-gray-400">...</span>}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(0)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 0] : selectedIdxs.filter(i => i !== 0));
            }} />
          )}
        </div>
        <div className="bg-blue-100 rounded p-4">
          <div className="font-bold text-blue-800">Turnover</div>
          <div className="text-2xl">{analytics ? `$${analytics.turnover.toLocaleString()}` : <span className="text-gray-400">...</span>}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(1)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 1] : selectedIdxs.filter(i => i !== 1));
            }} />
          )}
        </div>
        <div className="bg-yellow-100 rounded p-4">
          <div className="font-bold text-yellow-800">Low Stock</div>
          <div className="text-2xl">{analytics ? analytics.lowStock : <span className="text-gray-400">...</span>}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(2)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 2] : selectedIdxs.filter(i => i !== 2));
            }} />
          )}
        </div>
        <div className="bg-red-100 rounded p-4">
          <div className="font-bold text-red-800">Out of Stock</div>
          <div className="text-2xl">{analytics ? analytics.outOfStock : <span className="text-gray-400">...</span>}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(3)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 3] : selectedIdxs.filter(i => i !== 3));
            }} />
          )}
        </div>
      </div>
      <ChartPlaceholder title="Stock Levels Over Time" />
      <ChartPlaceholder title="Turnover Trends" />
      <ChartPlaceholder title="Low Stock Items" />
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
          <button className="px-2 py-1 bg-red-500 text-white rounded text-xs">Admin: Reset Inventory Data</button>
        </div>
      )}
    </div>
  );
}
