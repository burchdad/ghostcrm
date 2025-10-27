import React, { useState } from "react";

interface DashboardRoleControlsProps {
  userRole: string;
  toast: any;
  t: (key: string) => React.ReactNode;
  onResetDashboard?: () => void;
  onExportAudit?: () => void;
  onImpersonateUser?: (userId: string) => void;
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<null | Error>(null);
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  return children;
}

const roles = ["admin", "manager", "auditor", "user"];

const DashboardRoleControls: React.FC<DashboardRoleControlsProps> = ({
  userRole,
  toast,
  t,
  onResetDashboard,
  onExportAudit,
  onImpersonateUser,
}) => {
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

  if (!roles.includes(userRole)) return null;

  return (
    <div className="mt-6 space-y-4">
      {/* Admin controls moved to DashboardAdminToolbar for topbar placement */}
      {userRole === "manager" && (
        <button className="px-2 py-1 bg-green-500 text-white rounded text-xs" aria-label="Manager Action">{t("Manager: Review Team Performance")}</button>
      )}
      {userRole === "auditor" && (
        <button className="px-2 py-1 bg-yellow-500 text-black rounded text-xs" aria-label="Auditor Action">{t("Auditor: Download Compliance Report")}</button>
      )}
      {userRole === "user" && (
        <span className="text-xs text-gray-500">{t("User: No special controls")}</span>
      )}
    </div>
  );
};

export default DashboardRoleControls;
