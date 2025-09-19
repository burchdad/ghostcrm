import React, { useState } from "react";

interface DashboardBulkOpsProps {
  bulkMode: boolean;
  handleBulkExport: () => void;
  handleBulkSchedule: () => void;
  handleBulkClear: () => void;
  setBulkMode: (mode: boolean) => void;
  t: (key: string) => React.ReactNode;
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<null | Error>(null);
  if (error) return <div className="text-red-500">BulkOps Error: {error.message}</div>;
  return children;
}

const DashboardBulkOps: React.FC<DashboardBulkOpsProps> = ({
  bulkMode,
  handleBulkExport,
  handleBulkSchedule,
  handleBulkClear,
  setBulkMode,
  t,
}) => {
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  function confirmAction(action: string, handler: () => void) {
    setShowConfirm(action);
    return () => {
      handler();
      setStatus(t(`${action} completed`).toString());
      setShowConfirm(null);
    };
  }

  if (!bulkMode) return null;

  return (
    <ErrorBoundary>
      <div className="mb-2 flex gap-2 items-center">
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          title={String(t("Export selected items to CSV"))}
          aria-label={String(t("Export Selected"))}
          onClick={() => setShowConfirm("Export")}
        >
          {t("Export Selected")}
        </button>
        <button
          className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
          title={String(t("Schedule report for selected items"))}
          aria-label={String(t("Schedule Report"))}
          onClick={() => setShowConfirm("Schedule")}
        >
          {t("Schedule Report")}
        </button>
        <button
          className="px-2 py-1 bg-red-500 text-white rounded text-xs"
          title={String(t("Clear selected items"))}
          aria-label={String(t("Clear Selected"))}
          onClick={() => setShowConfirm("Clear")}
        >
          {t("Clear Selected")}
        </button>
        <button
          className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
          title={String(t("Cancel bulk operations"))}
          aria-label={String(t("Cancel"))}
          onClick={() => setBulkMode(false)}
        >
          {t("Cancel")}
        </button>
        {status && <span className="ml-2 text-xs text-green-700">{status}</span>}
      </div>
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
            <h2 className="font-bold text-lg mb-4">{t("Confirm Bulk Operation")}</h2>
            <p className="mb-4 text-sm">{t(`Are you sure you want to ${showConfirm.toLowerCase()} the selected items?`)}</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={confirmAction(showConfirm, showConfirm === "Export" ? handleBulkExport : showConfirm === "Schedule" ? handleBulkSchedule : handleBulkClear)}>{t("Confirm")}</button>
              <button className="px-3 py-1 bg-gray-300 text-gray-700 rounded" onClick={() => setShowConfirm(null)}>{t("Cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default DashboardBulkOps;
