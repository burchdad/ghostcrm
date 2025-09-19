"use client";
import React, { useState } from "react";
import { ToastProvider, useToast } from "@/components/ToastProvider";
import { Skeleton } from "@/components/Skeleton";
import { I18nProvider, useI18n } from "@/components/I18nProvider";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import { useDashboardData } from "./hooks/useDashboardData";
import IndustryAIRecommendDashboard from "./industry-ai-recommend";
import DashboardTopbar from "./components/DashboardTopbar";
import DashboardBulkOps from "./components/DashboardBulkOps";
import DashboardStatsCards from "./components/DashboardStatsCards";
import DashboardCharts from "./components/DashboardCharts";
import DashboardRoleControls from "./components/DashboardRoleControls";
import DashboardImportedList from "./components/DashboardImportedList";
import DashboardCustomization from "./components/DashboardCustomization";
import DashboardAdminToolbar from "./components/DashboardAdminToolbar";

import Sidebar from "./components/Sidebar";

export default function DashboardPage() {
  const { messages, auditLog, aiAlerts } = useDashboardData();
  const [selectedOrg, setSelectedOrg] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
  const [userRole] = useState("admin");
  const [importedDashboards, setImportedDashboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { lang, setLang, t } = useI18n();
  // Real-time analytics
  const [analytics, setAnalytics] = useState({
    messageCount: messages.length,
    alertCount: aiAlerts.length,
    auditCount: auditLog.length,
    orgScore: 0,
  });
  React.useEffect(() => {
    setAnalytics({
      messageCount: messages.length,
      alertCount: aiAlerts.length,
      auditCount: auditLog.length,
      orgScore: Math.floor(Math.random() * 100),
    });
  }, [messages.length, aiAlerts.length, auditLog.length]);
  // Audit/versioning
  const auditHistory = [
    { action: "view", user: "alice", timestamp: "2025-09-14" },
    { action: "bulk export", user: "bob", timestamp: "2025-09-13" },
  ];
  // Compliance/security badges
  const compliance = selectedOrg === "org1" ? "GDPR" : "";
  const security = selectedOrg === "org2" ? "Secure" : "";
  const handleImportDashboards = (dashboards: any[]) => {
    setImportedDashboards(prev => [...prev, ...dashboards]);
  };

  // Bulk operation handlers
  const toast = useToast();
  const handleBulkExport = () => {
    toast.show(t("Exported selected dashboard items"), "success");
    setBulkMode(false);
  };
  const handleBulkClear = () => {
    toast.show(t("Cleared selected dashboard items"), "info");
    setBulkMode(false);
  };
  const handleBulkSchedule = () => {
    toast.show(t("Scheduled report for selected dashboard items"), "success");
    setBulkMode(false);
  };
  return (
    <I18nProvider>
      <ToastProvider>
        {/* Main dashboard content only, sidebar/topbar handled by global layout */}
        <main className="space-y-6 p-4 md:p-8">
          {loading && <Skeleton className="h-10 w-full mb-4" />}
          <DashboardAdminToolbar
            t={t}
            toast={toast}
            onResetDashboard={async () => {
              // Example: call backend API to reset dashboard data
              try {
                await fetch("/api/dashboard/reset", { method: "POST" });
                toast.show(t("Dashboard data reset!"), "success");
              } catch (err) {
                toast.show(t("Failed to reset dashboard data"), "error");
              }
            }}
            onExportAudit={async () => {
              // Example: call backend API to export audit log
              try {
                const res = await fetch("/api/auditlog/export");
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "audit_log.csv";
                a.click();
                URL.revokeObjectURL(url);
                toast.show(t("Audit log exported!"), "success");
              } catch (err) {
                toast.show(t("Failed to export audit log"), "error");
              }
            }}
            onImpersonateUser={async (userId) => {
              // Example: call backend API to impersonate user
              try {
                await fetch(`/api/users/impersonate?userId=${encodeURIComponent(userId)}`, { method: "POST" });
                toast.show(t(`Impersonating user ${userId}`), "success");
              } catch (err) {
                toast.show(t("Failed to impersonate user"), "error");
              }
            }}
          />
          <DashboardCustomization
            widgets={[]}
            layoutTemplate={"grid"}
            handleAddWidget={async (type) => {
              // Example: call backend API to add widget
              await fetch(`/api/widgets/add?type=${type}`, { method: "POST" });
              toast.show(t(`Added ${type} widget`), "success");
            }}
            handleRemoveWidget={async (id) => {
              await fetch(`/api/widgets/remove?id=${id}`, { method: "POST" });
              toast.show(t("Widget removed"), "success");
            }}
            handleEditWidget={async (id, updates) => {
              await fetch(`/api/widgets/edit?id=${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates)
              });
              toast.show(t("Widget updated"), "success");
            }}
            handleSaveTemplate={async () => {
              await fetch(`/api/templates/save`, { method: "POST" });
              toast.show(t("Layout saved as template"), "success");
            }}
            handleLoadTemplate={async (name) => {
              await fetch(`/api/templates/load?name=${encodeURIComponent(name)}`);
              toast.show(t(`Loaded template: ${name}`), "success");
            }}
            handleShareDashboard={async () => {
              await fetch(`/api/dashboard/share`, { method: "POST" });
              toast.show(t("Dashboard shared"), "success");
            }}
            showTemplateModal={false}
            setShowTemplateModal={() => {}}
            showWidgetSettings={null}
            setShowWidgetSettings={() => {}}
            savedTemplates={[]}
            showShareModal={false}
            setShowShareModal={() => {}}
            shareLink={""}
            exampleTemplates={[]}
            t={t}
          />
          <DashboardBulkOps
            bulkMode={bulkMode}
            setBulkMode={setBulkMode}
            handleBulkExport={handleBulkExport}
            handleBulkSchedule={handleBulkSchedule}
            handleBulkClear={handleBulkClear}
            t={t}
          />
          <DashboardStatsCards
            analytics={analytics}
            bulkMode={bulkMode}
            selectedIdxs={selectedIdxs}
            setSelectedIdxs={setSelectedIdxs}
            t={t}
          />
          <DashboardCharts analytics={analytics} t={t} />
          <DashboardRoleControls userRole={userRole} t={t} toast={useToast()} />
          <DashboardImportedList importedDashboards={importedDashboards} t={t} />
        </main>
      </ToastProvider>
    </I18nProvider>
  );
}



