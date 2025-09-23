"use client";
import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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
import RealtimeOutreachFeed from "./components/RealtimeOutreachFeed";
import CampaignAnalytics from "./components/CampaignAnalytics";

export default function DashboardPage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <DashboardPageContent />
    </DndProvider>
  );
}

function DashboardPageContent() {
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
  // Example: Add more logic based on org settings, audit results, or backend API
  const compliance = selectedOrg === "org1" ? "GDPR" : selectedOrg === "org2" ? "CCPA" : "";
  const security = selectedOrg === "org2" ? "SOC2" : "";
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
          {/* Compliance & Security Badges */}
          {(compliance || security) && (
            <div className="flex gap-2 mb-2">
              {compliance && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">{t(compliance)} 4C8</span>}
              {security && <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">{t(security)} 512</span>}
            </div>
          )}
          <CampaignAnalytics orgId={selectedOrg || "1"} />
          {loading && <Skeleton className="h-10 w-full mb-4" />}
          <DashboardAdminToolbar
            t={t}
            toast={toast}
            onResetDashboard={async () => {
              // ...existing code...
            }}
            onExportAudit={async () => {
              // ...existing code...
            }}
            onImpersonateUser={async (userId) => {
              // ...existing code...
            }}
          />
          <DashboardCustomization
            widgets={[]}
            layoutTemplate={"grid"}
            handleAddWidget={async (type) => {
              // ...existing code...
            }}
            handleRemoveWidget={async (id) => {
              // ...existing code...
            }}
            handleEditWidget={async (id, updates) => {
              // ...existing code...
            }}
            handleSaveTemplate={async () => {
              // ...existing code...
            }}
            handleLoadTemplate={async (name) => {
              // ...existing code...
            }}
            handleShareDashboard={async () => {
              // ...existing code...
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
          <RealtimeOutreachFeed />
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



