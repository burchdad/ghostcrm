"use client";
import React, { useMemo, useState } from "react";
import NLQInput from "@/components/analytics/NLQInput";
import DataSourcePanel from "@/components/analytics/DataSourcePanel";
import ScheduleModal from "@/components/analytics/ScheduleModal";
import AnalyticsCard from "@/components/analytics/AnalyticsCard";

/** Types shared across analytics components */
export type AnalyticsView = {
  name: string;
  chartType: "bar" | "line" | "doughnut" | "pie" | "scatter" | "radar";
  color?: string;
  query?: string;
  aiEnabled?: boolean;
  exportable?: boolean;
  // Org and role logic removed
};

type Props = {
  initialViews?: AnalyticsView[];
  userRole?: string;
};

export default function AnalyticsDashboard({
  initialViews = [],
  userRole = "admin",
}: Props) {
  // org / bulk / schedule state
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [bulkMode, setBulkMode] = useState(false);
  const [scheduleIdx, setScheduleIdx] = useState<number | null>(null);
  const [scheduleEmail, setScheduleEmail] = useState("");
  const [scheduleFreq, setScheduleFreq] = useState<"daily" | "weekly" | "monthly">("daily");

  // cards state
  const [customAnalyticsViews, setCustomAnalyticsViews] = useState<AnalyticsView[]>(
    initialViews.length
      ? initialViews
      : [
          {
            name: "Pipeline by Rep",
            chartType: "bar",
            query: "SELECT rep, SUM(amount) FROM deals GROUP BY rep",
            aiEnabled: true,
            color: "#3b82f6",
            exportable: true,
          },
        ]
  );
  const [selected, setSelected] = useState<number[]>([]);

  // create card from NLQ
  const handleCreateCardFromNLQ = (card: AnalyticsView) => {
    setCustomAnalyticsViews((prev) => [...prev, card]);
  };  

  // bulk actions
  const toggleSelect = (idx: number, checked: boolean) =>
    setSelected((prev) => (checked ? [...prev, idx] : prev.filter((i) => i !== idx)));

  const bulkDelete = () => {
    if (!selected.length) return;
    setCustomAnalyticsViews((prev) => prev.filter((_, i) => !selected.includes(i)));
    setSelected([]);
    setBulkMode(false);
  };

  const bulkExport = () => {
    if (!selected.length) return;
    // stub: tie into server export if needed
    alert(`Exporting ${selected.length} analytics cards…`);
    setSelected([]);
    setBulkMode(false);
  };

  // Views to display (could be filtered by org, etc.)
  const visibleViews = useMemo(() => customAnalyticsViews, [customAnalyticsViews]);

  // schedule modal handlers
  const openSchedule = (idx: number) => setScheduleIdx(idx);
  const closeSchedule = () => setScheduleIdx(null);
  const saveSchedule = () => {
    const v = scheduleIdx !== null ? visibleViews[scheduleIdx] : null;
    alert(`Scheduled "${v?.name ?? "report"}" to ${scheduleEmail} (${scheduleFreq})`);
    setScheduleEmail("");
    setScheduleFreq("daily");
    setScheduleIdx(null);
  };

  return (
    <div className="w-full">
      {/* Header controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="text-sm text-blue-800">Organization</label>
        <select
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="org1">Org 1</option>
          <option value="org2">Org 2</option>
        </select>

        <button
          className={`px-2 py-1 rounded text-xs ${
            bulkMode ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"
          }`}
          onClick={() => setBulkMode((s) => !s)}
        >
          {bulkMode ? "Cancel Bulk" : "Bulk Ops"}
        </button>
      </div>

      {/* Data source connectors */}
      <DataSourcePanel />

      {/* NLQ input */}
      <NLQInput onCreateCard={handleCreateCardFromNLQ} />

      {/* Bulk toolbar */}
      {bulkMode && (
        <div className="mb-2 flex gap-2">
          <button className="px-2 py-1 bg-red-500 text-white rounded text-xs" onClick={bulkDelete}>
            Delete Selected
          </button>
          <button className="px-2 py-1 bg-yellow-500 text-white rounded text-xs" onClick={bulkExport}>
            Export Selected
          </button>
          <button
            className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
            onClick={() => setBulkMode(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Cards grid */}
      <ul className="text-sm mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleViews.map((view, idx) => (
          <li key={`${view.name}-${idx}`} className="border rounded p-4 bg-white shadow flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {bulkMode && (
                <input
                  type="checkbox"
                  checked={selected.includes(idx)}
                  onChange={(e) => toggleSelect(idx, e.target.checked)}
                />
              )}
              <span className="font-bold mr-2 text-lg" style={{ color: view.color ?? "#111827" }}>
                {view.name}
              </span>
              <span className="text-xs text-gray-500">{view.chartType}</span>

              <div className="ml-auto flex gap-2">
                <button
                  className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                  onClick={() => openSchedule(idx)}
                >
                  Schedule
                </button>
              </div>
            </div>

            <AnalyticsCard view={view} scheduleFreq={scheduleFreq} />
          </li>
        ))}
      </ul>

      {/* Schedule Modal */}
      {scheduleIdx !== null && (
        <ScheduleModal
          reportName={visibleViews[scheduleIdx].name}
          email={scheduleEmail}
          frequency={scheduleFreq}
          onClose={closeSchedule}
          onSave={saveSchedule}
          onEmailChange={setScheduleEmail}
          onFreqChange={(f) => setScheduleFreq(f as typeof scheduleFreq)}
        />
      )}
    </div>
  );
}
