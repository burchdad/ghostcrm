import React, { useState } from "react";

interface DashboardBulkOpsProps {
  bulkMode: boolean;
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
  setBulkMode,
  t,
}) => {
  if (!bulkMode) return null;
  return (
    <div className="mb-2 flex gap-2 items-center">
      <button
        className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
        title={String(t("Cancel bulk operations"))}
        aria-label={String(t("Cancel"))}
        onClick={() => setBulkMode(false)}
      >
        {t("Cancel")}
      </button>
    </div>
  );
}

export default DashboardBulkOps;
