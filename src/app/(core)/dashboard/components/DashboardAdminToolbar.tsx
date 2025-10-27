import React, { useState } from "react";

interface DashboardAdminToolbarProps {
  t: (key: string) => React.ReactNode;
  toast: any;
  onResetDashboard?: () => void;
  onExportAudit?: () => void;
  onImpersonateUser?: (userId: string) => void;
}

const DashboardAdminToolbar: React.FC<DashboardAdminToolbarProps> = ({ t, toast, onResetDashboard, onExportAudit, onImpersonateUser }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [impersonateId, setImpersonateId] = useState("");

  function handleReset() {
    setShowConfirm(false);
    if (onResetDashboard) onResetDashboard();
    toast.show(t("Dashboard data reset!"), "info");
  }
  function handleExportAudit() {
    if (onExportAudit) onExportAudit();
    toast.show(t("Audit log exported!"), "success");
  }
  function handleImpersonate() {
    if (impersonateId && onImpersonateUser) {
      onImpersonateUser(impersonateId);
      toast.show(t(`Impersonating user ${impersonateId}`), "info");
      setImpersonateId("");
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center mb-4">
      <button
        className="px-2 py-1 bg-red-500 text-white rounded text-xs"
        onClick={() => setShowConfirm(true)}
        aria-label="Reset Dashboard Data"
      >
        {t("Admin: Reset Dashboard Data")}
      </button>
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
            <h2 className="font-bold text-lg mb-4">{t("Confirm Reset")}</h2>
            <p className="mb-4 text-sm">{t("Are you sure you want to reset all dashboard data? This action cannot be undone.")}</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={handleReset}>{t("Confirm")}</button>
              <button className="px-3 py-1 bg-gray-300 text-gray-700 rounded" onClick={() => setShowConfirm(false)}>{t("Cancel")}</button>
            </div>
          </div>
        </div>
      )}
      <button
        className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
        onClick={handleExportAudit}
        aria-label="Export Audit Log"
      >
        {t("Export Audit Log")}
      </button>
      <input
        type="text"
        className="border rounded px-2 py-1 text-xs"
        placeholder={String(t("Impersonate user ID..."))}
        value={impersonateId}
        onChange={e => setImpersonateId(e.target.value)}
        aria-label="Impersonate User ID"
      />
      <button
        className="px-2 py-1 bg-gray-700 text-white rounded text-xs"
        onClick={handleImpersonate}
        disabled={!impersonateId}
        aria-label="Impersonate User"
      >
        {t("Impersonate")}
      </button>
    </div>
  );
};

export default DashboardAdminToolbar;
