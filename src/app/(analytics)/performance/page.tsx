"use client";
import { useState } from "react";
import ComingSoonWrapper from '@/components/feedback/ComingSoonWrapper';

import ChartPlaceholder from "@/components/charts/ChartPlaceholder";
import BulkOperations from "@/components/charts/BulkOperations";

function PerformanceContent() {
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
  const analytics = {
    teamScore: Math.floor(Math.random() * 100),
    repScore: Math.floor(Math.random() * 100),
    pipelineScore: Math.floor(Math.random() * 100),
    conversionRate: Math.floor(Math.random() * 100),
  };

  function handleBulkExport() {
    alert("Exported selected performance data");
    setBulkMode(false);
    setSelectedIdxs([]);
  }
  function handleBulkSchedule() {
    alert("Scheduled report for selected performance data");
    setBulkMode(false);
    setSelectedIdxs([]);
  }
  function handleBulkCompare() {
    alert("Compared selected performance data");
    setBulkMode(false);
    setSelectedIdxs([]);
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Performance Dashboard</h1>
      {bulkMode && (
        <BulkOperations
          actions={[
            { label: "Export Selected", onClick: handleBulkExport, color: "bg-blue-500" },
            { label: "Schedule Report", onClick: handleBulkSchedule, color: "bg-yellow-500" },
            { label: "Compare Selected", onClick: handleBulkCompare, color: "bg-green-500" },
          ]}
          onCancel={() => setBulkMode(false)}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-green-100 rounded p-4">
          <div className="flex gap-2 items-center mb-2">
            <button
              className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
              onClick={() => setBulkMode(!bulkMode)}
            >
              {bulkMode ? "Cancel Bulk" : "Bulk Ops"}
            </button>
          </div>
          <div className="font-bold">Team Score</div>
          <div className="text-2xl">{analytics.teamScore}</div>
          {bulkMode && (
            <input
              type="checkbox"
              checked={selectedIdxs.includes(1)}
              onChange={e => {
                setSelectedIdxs(e.target.checked ? [...selectedIdxs, 1] : selectedIdxs.filter(i => i !== 1));
              }}
            />
          )}
        </div>
        <div className="bg-yellow-100 rounded p-4">
          <div className="font-bold">Pipeline Score</div>
          <div className="text-2xl">{analytics.pipelineScore}</div>
          {bulkMode && (
            <input
              type="checkbox"
              checked={selectedIdxs.includes(2)}
              onChange={e => {
                setSelectedIdxs(e.target.checked ? [...selectedIdxs, 2] : selectedIdxs.filter(i => i !== 2));
              }}
            />
          )}
        </div>
        <div className="bg-purple-100 rounded p-4">
          <div className="font-bold">Conversion Rate</div>
          <div className="text-2xl">{analytics.conversionRate}%</div>
          {bulkMode && (
            <input
              type="checkbox"
              checked={selectedIdxs.includes(3)}
              onChange={e => {
                setSelectedIdxs(e.target.checked ? [...selectedIdxs, 3] : selectedIdxs.filter(i => i !== 3));
              }}
            />
          )}
        </div>
      </div>
      <ChartPlaceholder title="Team Performance Over Time" />
      <ChartPlaceholder title="Rep Leaderboard" />
      <ChartPlaceholder title="Pipeline Conversion Trends" />
    </div>
  );
}

export default function PerformancePage() {
  return (
    <ComingSoonWrapper 
      feature="performance" 
      enabled={false}
      comingSoonDate="February 2026"
      description="Advanced performance analytics with team leaderboards, conversion tracking, and AI-powered insights"
    >
      <PerformanceContent />
    </ComingSoonWrapper>
  );
}
