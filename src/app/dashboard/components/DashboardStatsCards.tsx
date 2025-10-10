import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faBell, faTrophy, faArrowUp, faArrowDown, faDownload, faCog } from "@fortawesome/free-solid-svg-icons";

interface DashboardStatsCardsProps {
  analytics: {
    messageCount: number;
    alertCount: number;
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
    icon: faEnvelope,
    label: "Messages",
    valueKey: "messageCount",
    tooltip: "Total messages received",
    trend: "+12%",
    trendDirection: "up",
  },
  {
    icon: faBell,
    label: "AI Alerts",
    valueKey: "alertCount",
    tooltip: "AI-generated alerts",
    trend: "+8%",
    trendDirection: "up",
  },
  {
    icon: faTrophy,
    label: "Org Score",
    valueKey: "orgScore",
    tooltip: "Organization performance score",
    trend: "+5%",
    trendDirection: "up",
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
      <div className="stats-grid">
        {cardMeta.map((meta, idx) => (
          <div
            key={meta.label}
            className="stat-card"
            tabIndex={0}
            aria-label={String(t(meta.label))}
          >
            <div className="stat-card-content">
              <div className="stat-card-icon">
                <FontAwesomeIcon icon={meta.icon} />
              </div>
              <div className="stat-card-info">
                <div className="stat-card-label">{String(t(meta.label))}</div>
                <div className="stat-card-value">{analytics[meta.valueKey]}</div>
                <div className={`stat-card-change ${meta.trendDirection === 'up' ? 'positive' : 'negative'}`}>
                  <FontAwesomeIcon icon={meta.trendDirection === 'up' ? faArrowUp : faArrowDown} />
                  {meta.trend} from last week
                </div>
              </div>
            </div>
            {bulkMode && (
              <input
                type="checkbox"
                checked={selectedIdxs.includes(idx)}
                onChange={e => {
                  setSelectedIdxs(e.target.checked ? [...selectedIdxs, idx] : selectedIdxs.filter(i => i !== idx));
                }}
                aria-label={`Select ${meta.label}`}
                style={{ position: 'absolute', top: '1rem', right: '1rem' }}
              />
            )}
            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn-icon" title={String(t("Export"))} onClick={() => handleExport(idx)}>
                <FontAwesomeIcon icon={faDownload} />
              </button>
              <button className="btn-icon" title={String(t("Settings"))} onClick={() => setShowSettings(idx)}>
                <FontAwesomeIcon icon={faCog} />
              </button>
            </div>
            {showSettings === idx && (
              <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999 }}>
                <div className="dashboard-card" style={{ minWidth: '320px', padding: '2rem' }}>
                  <h2 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>{t(meta.label + " Settings")}</h2>
                  <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>{t("Advanced settings coming soon...")}</div>
                  <button className="btn-primary" onClick={() => setShowSettings(null)}>{t("Close")}</button>
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
