"use client";
import { useState } from "react";
import ChartPlaceholder from "@/components/charts/ChartPlaceholder";
import BulkOperations from "@/components/charts/BulkOperations";

export default function Deals() {
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
  // Real-time analytics (scaffolded)
  const analytics = {
    totalValue: Math.floor(Math.random() * 100000),
    winRate: Math.floor(Math.random() * 100),
    avgDealSize: Math.floor(Math.random() * 10000),
    pipelineStage: Math.floor(Math.random() * 10),
  };
  // Security/compliance/impersonate logic removed for now
  // Bulk operations (scaffolded)
  function handleBulkExport() {
    alert("Exported selected deals");
    setBulkMode(false);
    setSelectedIdxs([]);
  }
  function handleBulkUpdate() {
    alert("Bulk updated selected deals");
    setBulkMode(false);
    setSelectedIdxs([]);
  }
  function handleBulkDelete() {
    alert("Deleted selected deals");
    setBulkMode(false);
    setSelectedIdxs([]);
  }
  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center mb-2">
        <button className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs" onClick={() => setBulkMode(!bulkMode)}>{bulkMode ? "Cancel Bulk" : "Bulk Ops"}</button>
      </div>
      {/* Bulk Operations UI */}
      {bulkMode && (
        <BulkOperations
          actions={[
            { label: "Export Selected", onClick: handleBulkExport, color: "bg-blue-500" },
            { label: "Bulk Update", onClick: handleBulkUpdate, color: "bg-yellow-500" },
            { label: "Delete Selected", onClick: handleBulkDelete, color: "bg-red-500" },
          ]}
          onCancel={() => setBulkMode(false)}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-100 rounded p-4">
          <div className="font-bold text-green-800">Total Deal Value</div>
          <div className="text-2xl">${analytics.totalValue.toLocaleString()}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(0)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 0] : selectedIdxs.filter(i => i !== 0));
            }} />
          )}
        </div>
        <div className="bg-blue-100 rounded p-4">
          <div className="font-bold text-blue-800">Win Rate</div>
          <div className="text-2xl">{analytics.winRate}%</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(1)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 1] : selectedIdxs.filter(i => i !== 1));
            }} />
          )}
        </div>
        <div className="bg-yellow-100 rounded p-4">
          <div className="font-bold text-yellow-800">Avg Deal Size</div>
          <div className="text-2xl">${analytics.avgDealSize.toLocaleString()}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(2)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 2] : selectedIdxs.filter(i => i !== 2));
            }} />
          )}
        </div>
        <div className="bg-purple-100 rounded p-4">
          <div className="font-bold text-purple-800">Pipeline Stage</div>
          <div className="text-2xl">{analytics.pipelineStage}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(3)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 3] : selectedIdxs.filter(i => i !== 3));
            }} />
          )}
        </div>
      </div>
      <ChartPlaceholder title="Deal Value Over Time" />
      <ChartPlaceholder title="Win Rate Trends" />
      <ChartPlaceholder title="Pipeline Stage Distribution" />
      <ChartPlaceholder title="Org Comparison" />
      {/* Audit/versioning history */}
      <div className="mt-4">
        <div className="font-bold mb-1">Audit History</div>
        <ul className="text-xs text-gray-600">
          {/* Audit history removed */}
        </ul>
      </div>
      
    </div>
  );
}
