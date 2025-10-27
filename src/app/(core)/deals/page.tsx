"use client";
import { useState, useEffect } from "react";
import ChartPlaceholder from "@/components/charts/ChartPlaceholder";
import BulkOperations from "@/components/charts/BulkOperations";
import EmptyStateComponent from "@/components/feedback/EmptyStateComponent";

export default function Deals() {
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch deals data
  useEffect(() => {
    async function fetchDeals() {
      try {
        const response = await fetch('/api/deals');
        const data = await response.json();
        setDeals(data.records || []);
      } catch (error) {
        console.error('Failed to fetch deals:', error);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDeals();
  }, []);

  // Real-time analytics (calculated from actual data)
  const analytics = {
    totalValue: deals.reduce((sum, deal) => sum + (deal.amount || 0), 0),
    winRate: deals.length > 0 ? (deals.filter(d => d.stage === 'closed_won').length / deals.length) * 100 : 0,
    avgDealSize: deals.length > 0 ? deals.reduce((sum, deal) => sum + (deal.amount || 0), 0) / deals.length : 0,
    pipelineStage: deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length,
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show empty state if no deals
  if (deals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <EmptyStateComponent 
            type="deals"
            className="bg-white rounded-lg shadow-sm"
          />
        </div>
      </div>
    );
  }
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
        <button className="btn btn-sm bg-purple-100 text-purple-700" onClick={() => setBulkMode(!bulkMode)}>{bulkMode ? "Cancel Bulk" : "Bulk Ops"}</button>
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
      <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
        <div className="card bg-green-100">
          <div className="font-bold text-green-800">Total Deal Value</div>
          <div className="text-2xl">${analytics.totalValue.toLocaleString()}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(0)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 0] : selectedIdxs.filter(i => i !== 0));
            }} />
          )}
        </div>
        <div className="card bg-blue-100">
          <div className="font-bold text-blue-800">Win Rate</div>
          <div className="text-2xl">{analytics.winRate}%</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(1)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 1] : selectedIdxs.filter(i => i !== 1));
            }} />
          )}
        </div>
        <div className="card bg-yellow-100">
          <div className="font-bold text-yellow-800">Avg Deal Size</div>
          <div className="text-2xl">${analytics.avgDealSize.toLocaleString()}</div>
          {bulkMode && (
            <input type="checkbox" checked={selectedIdxs.includes(2)} onChange={e => {
              setSelectedIdxs(e.target.checked ? [...selectedIdxs, 2] : selectedIdxs.filter(i => i !== 2));
            }} />
          )}
        </div>
        <div className="card bg-purple-100">
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
