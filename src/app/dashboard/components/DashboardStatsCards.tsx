import React, { useState } from "react";
import { FiMessageSquare, FiBell, FiClipboard, FiAward, FiDownload, FiSettings } from "react-icons/fi";

interface DashboardStatsCardsProps {
  analytics: {
    messageCount: number;
    alertCount: number;
    auditCount: number;
    orgScore: number;
  };
  bulkMode: boolean;
  selectedIdxs: number[];
  setSelectedIdxs: (idxs: number[]) => void;
  t: (key: string) => React.ReactNode;
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<null | Error>(null);
  if (error) return <div className="text-red-500">Card Error: {error.message}</div>;
  return children;
}

const cardMeta = [
  {
    icon: <FiMessageSquare className="text-3xl text-green-600" />,
    label: "Messages",
    color: "green-100",
    valueKey: "messageCount",
    tooltip: "Total messages received",
  },
  {
    icon: <FiBell className="text-3xl text-blue-600" />,
    label: "AI Alerts",
    color: "blue-100",
    valueKey: "alertCount",
    tooltip: "AI-generated alerts",
  },
  {
    icon: <FiClipboard className="text-3xl text-yellow-600" />,
    label: "Audit Log",
    color: "yellow-100",
    valueKey: "auditCount",
    tooltip: "Audit log events",
  },
  {
    icon: <FiAward className="text-3xl text-purple-600" />,
    label: "Org Score",
    color: "purple-100",
    valueKey: "orgScore",
    tooltip: "Organization performance score",
  },
];

const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({
  analytics,
  bulkMode,
  selectedIdxs,
  setSelectedIdxs,
  t,
}) => {
  const [showSettings, setShowSettings] = useState<number | null>(null);

  function handleExport(idx: number) {
    // Export logic (CSV)
    const key = cardMeta[idx].valueKey;
    const csv = `${cardMeta[idx].label},${analytics[key]}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${key}_stat.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ErrorBoundary>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardMeta.map((meta, idx) => (
          <div
            key={meta.label}
            className={`rounded-xl p-6 shadow-lg bg-gradient-to-br from-${meta.color} to-${meta.color.replace("100", "200")} hover:scale-105 transition-transform cursor-pointer flex flex-col items-start gap-2 relative`}
            tabIndex={0}
            aria-label={String(t(meta.label))}
          >
            <span title={String(t(meta.tooltip))}>{meta.icon}</span>
            <div className={`font-bold text-${meta.color.replace("100", "800")} text-lg`}>{t(meta.label)}</div>
            <div className={`text-4xl font-extrabold text-${meta.color.replace("100", "900")}`}>{analytics[meta.valueKey]}</div>
            {bulkMode && (
              <input
                type="checkbox"
                checked={selectedIdxs.includes(idx)}
                onChange={e => {
                  setSelectedIdxs(e.target.checked ? [...selectedIdxs, idx] : selectedIdxs.filter(i => i !== idx));
                }}
                aria-label={`Select ${meta.label}`}
              />
            )}
            <div className="absolute top-2 right-2 flex gap-2">
              <button className="text-blue-500 hover:text-blue-700" title={String(t("Export"))} onClick={() => handleExport(idx)}><FiDownload /></button>
              <button className="text-gray-500 hover:text-gray-700" title={String(t("Settings"))} onClick={() => setShowSettings(idx)}><FiSettings /></button>
            </div>
            {showSettings === idx && (
              <div className="absolute left-1/2 top-1/2 z-50" style={{ transform: 'translate(-50%, -50%)' }}>
                <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] border border-gray-200">
                  <h2 className="font-bold text-lg mb-4">{t(meta.label + " Settings")}</h2>
                  <div className="mb-2 text-sm">{t("Advanced settings coming soon...")}</div>
                  <button className="px-3 py-1 bg-gray-700 text-white rounded" onClick={() => setShowSettings(null)}>{t("Close")}</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </ErrorBoundary>
  );
};

export default DashboardStatsCards;
