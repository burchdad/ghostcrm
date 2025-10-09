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
import DashboardCharts from "./components/DashboardCharts";
import DashboardRoleControls from "./components/DashboardRoleControls";
import DashboardImportedList from "./components/DashboardImportedList";
import DashboardCustomization from "./components/DashboardCustomization";
import DashboardAdminToolbar from "./components/DashboardAdminToolbar";

// import Sidebar from "./components/Sidebar";
import RealtimeOutreachFeed from "./components/RealtimeOutreachFeed";
import CampaignAnalytics from "./components/CampaignAnalytics";
import CombinedMetricsCard from "./components/CombinedMetricsCard";
import InventoryOverview from "./components/InventoryOverview";

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
    totalLeads: 247, // Add sample total leads count
    revenue: 152000, // Sample revenue data
    activeDeals: 34, // Sample active deals
    conversionRate: 23.5, // Sample conversion rate
    teamMembers: 12, // Sample team size
  });
  
  
  return (
    <I18nProvider>
      <ToastProvider>
        <main className="space-y-6 p-4 md:p-10">
          {loading && <Skeleton className="h-10 w-full mb-4" />}
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
          
          {/* 2x2 Grid Layout: Four equal cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
            <CampaignAnalytics />
            <RealtimeOutreachFeed />
            <CombinedMetricsCard analytics={analytics} />
            <InventoryOverview />
          </div>
          
          {/* Separator between main cards and detailed charts */}
          <div className="relative py-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500 font-medium">Detailed Analytics</span>
            </div>
          </div>
          
          <DashboardBulkOps
            bulkMode={bulkMode}
            setBulkMode={setBulkMode}
            t={t}
          />
          <DashboardCharts analytics={analytics} t={t} />
          <DashboardImportedList importedDashboards={importedDashboards} t={t} />
        </main>
      </ToastProvider>
    </I18nProvider>
  );
}
 // ...existing code...