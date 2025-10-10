"use client";
import { useRibbon } from "@/components/ribbon/RibbonProvider";
import Ribbon from "@/components/ribbon/Ribbon";
import React, { useState, useEffect } from "react";
import useRibbonPage from "@/components/ribbon/useRibbonPage";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ToastProvider, useToast } from "@/components/ToastProvider";
import { Skeleton } from "@/components/Skeleton";
import { I18nProvider, useI18n } from "@/components/I18nProvider";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import { useDashboardData } from "./hooks/useDashboardData";
import IndustryAIRecommendDashboard from "./industry-ai-recommend";
import DashboardBulkOps from "./components/DashboardBulkOps";
import DashboardStatsCards from "./components/DashboardStatsCards";
import DashboardCharts from "./components/DashboardCharts";
import DashboardRoleControls from "./components/DashboardRoleControls";
import DashboardImportedList from "./components/DashboardImportedList";
import DashboardCustomization from "./components/DashboardCustomization";
import DashboardAdminToolbar from "./components/DashboardAdminToolbar";

// import Sidebar from "./components/Sidebar";
import RealtimeOutreachFeed from "./components/RealtimeOutreachFeed";
import CampaignAnalytics from "./components/CampaignAnalytics";

export default function DashboardPage() {
  useRibbonPage({
    context: "dashboard",
    enable: [
      "quickActions",
      "bulkOps",
      "saveLayout",
      "share",
      "export",
      "aiTools",
      "profile",
      "notifications",
      "theme",
      "language",     
      "automation",
      "data",
      "billing",
      "developer"
    ],
    disable: []
  });
  return (
    <DndProvider backend={HTML5Backend}>
      <DashboardPageContent />
    </DndProvider>
  );
}


function DashboardPageContent() {
  const { messages, aiAlerts } = useDashboardData();
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
  // userRole removed
  const [importedDashboards, setImportedDashboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { lang, setLang, t } = useI18n();
  // Real-time analytics
  const [analytics, setAnalytics] = useState({
    messageCount: messages.length,
    alertCount: aiAlerts.length,
    orgScore: 75, // Fixed value to avoid hydration mismatch
  });
  
  
  return (
    <I18nProvider>
      <ToastProvider>
        <main className="dashboard-main">
          <div className="dashboard-section">
            <h2 className="dashboard-section-title">Key Metrics</h2>
            <DashboardStatsCards
              analytics={analytics}
              bulkMode={bulkMode}
              selectedIdxs={selectedIdxs}
              setSelectedIdxs={setSelectedIdxs}
              t={t}
            />
          </div>
          
          <div className="dashboard-section">
            <CampaignAnalytics />
          </div>
          
          {loading && <Skeleton className="h-10 w-full mb-4" />}
          
          <div className="dashboard-section">
            <h2 className="dashboard-section-title">Analytics & Charts</h2>
            <DashboardCharts analytics={analytics} t={t} />
          </div>
          
          <DashboardBulkOps
            bulkMode={bulkMode}
            setBulkMode={setBulkMode}
            t={t}
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
          <DashboardImportedList importedDashboards={importedDashboards} t={t} />
        </main>
      </ToastProvider>
    </I18nProvider>
  );
}
 // ...existing code...