"use client";
import React from "react";
import { Chart as ChartJS } from "react-chartjs-2";
import AIPrediction from "./AIPrediction";

export default function AnalyticsCard({
  view,
  scheduleFreq,
  showInsights = true
}: {
  view: any;
  scheduleFreq: string;
  showInsights?: boolean;
}) {
  const runQuery = (query: string, sources: string[] = ["crm"]) => ({
    labels: ["A", "B", "C", "D"],
    datasets: [{
      label: "Demo",
      data: [Math.random()*100, Math.random()*100, Math.random()*100, Math.random()*100],
      backgroundColor: ["#3b82f6", "#10b981", "#f59e42", "#ef4444"]
    }]
  });

  return (
    <div>
      {view.description && <div className="mb-2 text-xs text-gray-600">{view.description}</div>}
      <div className="bg-gray-50 p-2 rounded">
        <ChartJS type={view.chartType as any} data={runQuery(view.query, view.sources || ["crm"])} />
      </div>
      {showInsights && view.aiEnabled && (
        <div className="mt-2 p-2 bg-purple-50 rounded text-purple-700 text-xs">
          <strong>AI Insights:</strong>
          <AIPrediction query={view.query} />
        </div>
      )}
      {showInsights && (
        <div className="mt-2 p-2 bg-red-50 rounded text-red-700 text-xs">
          <strong>Anomaly Detection:</strong>
          <AIPrediction query={`Detect anomalies in: ${view.query} for ${scheduleFreq} insights.`} />
          <div className="mt-1">
            <span className="font-bold">Schedule:</span> {scheduleFreq.charAt(0).toUpperCase() + scheduleFreq.slice(1)}
            <span className="ml-2 text-gray-500">(Automatically runs and updates insights)</span>
          </div>
        </div>
      )}
    </div>
  );
}
