import React, { useState } from "react";

interface DashboardAuditHistoryProps {
  auditHistory: Array<{ action: string; user: string; timestamp: string; details?: string }>;
  t: (key: string) => React.ReactNode;
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<null | Error>(null);
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  return children;
}

const DashboardAuditHistory: React.FC<DashboardAuditHistoryProps> = ({ auditHistory, t }) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("timestamp");
  const [sortAsc, setSortAsc] = useState(false);
  const [showDetails, setShowDetails] = useState<number | null>(null);

  // Filter and sort logic
  const filtered = auditHistory
    .filter(a => a.action.toLowerCase().includes(search.toLowerCase()) || a.user.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
      return 0;
    });

  // Export logic
  function handleExport() {
    const csv = filtered.map(a => `${a.action},${a.user},${a.timestamp}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit_history.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ErrorBoundary>
      <div className="mt-8">
        <div className="font-bold mb-1">{t("Audit History")}</div>
        <div className="flex flex-wrap gap-2 mb-2 items-center">
          <input
            type="text"
            className="border rounded px-2 py-1"
            placeholder={String(t("Search audit..."))}
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search audit history"
          />
          <label className="ml-2 text-xs">Sort by:</label>
          <select value={sortKey} onChange={e => setSortKey(e.target.value)} className="border rounded px-2 py-1 text-xs">
            <option value="timestamp">Timestamp</option>
            <option value="action">Action</option>
            <option value="user">User</option>
          </select>
          <button className="px-2 py-1 bg-gray-200 rounded text-xs" onClick={() => setSortAsc(a => !a)}>{sortAsc ? t("Asc") : t("Desc")}</button>
          <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={handleExport}>{t("Export CSV")}</button>
        </div>
        <ul className="text-xs text-gray-600 divide-y divide-gray-100">
          {filtered.map((a, idx) => (
            <li key={idx} className="py-2 flex items-center gap-2 hover:bg-gray-50 transition">
              <span className="font-semibold">{t(a.action)}</span>
              <span>{t("by")}</span>
              <span className="text-blue-700 font-bold">{a.user}</span>
              <span>{t("at")}</span>
              <span className="text-gray-500">{a.timestamp}</span>
              {a.details && (
                <button className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs" onClick={() => setShowDetails(idx)}>{t("Details")}</button>
              )}
              {showDetails === idx && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
                    <h2 className="font-bold text-lg mb-4">{t("Audit Details")}</h2>
                    <div className="mb-2 text-sm">{a.details}</div>
                    <button className="px-3 py-1 bg-gray-700 text-white rounded" onClick={() => setShowDetails(null)}>{t("Close")}</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </ErrorBoundary>
  );
};

export default DashboardAuditHistory;
