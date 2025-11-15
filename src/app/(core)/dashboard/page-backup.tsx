"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRibbonPage } from "@/components/ribbon";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ToastProvider } from "@/components/utils/ToastProvider";
import { Skeleton } from "@/components/feedback/Skeleton";
import { I18nProvider, useI18n } from "@/components/utils/I18nProvider";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import { useDashboardData } from "./hooks/useDashboardData";
// import DashboardBulkOps from "./components/DashboardBulkOps"; // unused
// import DashboardImportedList from "./components/DashboardImportedList"; // unused
import DashboardCharts from "./components/DashboardCharts";
import DashboardCustomization from "./components/DashboardCustomization";
import OnboardingGuard from "@/components/onboarding/OnboardingGuard";
import RealtimeOutreachFeed from "./components/RealtimeOutreachFeed";
import CampaignAnalytics from "./components/CampaignAnalytics";
import CombinedMetricsCard from "./components/CombinedMetricsCard";
import InventoryOverview from "./components/InventoryOverview";

function DashboardContent() {
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
    <I18nProvider>
      <ToastProvider>
        <DndProvider backend={HTML5Backend}>
          <DashboardPageContent />
        </DndProvider>
      </ToastProvider>
    </I18nProvider>
  );
}

function DashboardPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { messages, aiAlerts } = useDashboardData();
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  // Redirect tenant owners to their enhanced dashboard
  useEffect(() => {
    if (user && user.role === 'owner') {
      // Check if we're on a tenant subdomain (for tenant owners vs software owners)
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isSubdomain = hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname.includes('.localhost');
      
      console.log('🔄 [DASHBOARD REDIRECT] Owner detected:', {
        email: user.email,
        role: user.role,
        hostname,
        isSubdomain,
        redirecting: isSubdomain ? '/tenant-owner/dashboard' : '/owner/dashboard'
      });
      
      if (isSubdomain) {
        // Tenant owner on subdomain → tenant dashboard
        router.replace('/tenant-owner/dashboard');
      } else {
        // Software owner on main domain → software owner dashboard
        router.replace('/owner/dashboard');
      }
      return;
    }
  }, [user, router]);

  // Real-time analytics with empty state detection
  const [analytics, setAnalytics] = useState({
    messageCount: 0,
    alertCount: 0,
    orgScore: 0,
    totalLeads: 0,
    revenue: 0,
    activeDeals: 0,
    conversionRate: 0,
    teamMembers: 0
  });

  // Fetch dashboard data and detect empty state
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        const [dashboardRes, leadsRes, dealsRes] = await Promise.all([
          fetch("/api/dashboard/live"),
          fetch("/api/leads"),
          fetch("/api/deals")
        ]);

        const dashboardData = dashboardRes.ok ? await dashboardRes.json() : {};
        const leadsData = leadsRes.ok ? await leadsRes.json() : {};
        const dealsData = dealsRes.ok ? await dealsRes.json() : {};

        const metrics = dashboardData?.metrics ?? {};
        const leads = Array.isArray(leadsData?.records) ? leadsData.records : [];
        const deals = Array.isArray(dealsData?.records) ? dealsData.records : [];

        const newAnalytics = {
          messageCount: metrics.messagesToday || 0,
          alertCount: aiAlerts.length,
          orgScore: 0, // TODO: compute from activity
          totalLeads: leads.length,
          revenue: deals.reduce(
            (sum: number, deal: any) => sum + (Number(deal?.amount) || 0),
            0
          ),
          activeDeals: deals.filter(
            (deal: any) =>
              !["closed_won", "closed_lost"].includes(String(deal?.stage || "").toLowerCase())
          ).length,
          conversionRate: leads.length > 0 ? (deals.length / leads.length) * 100 : 0,
          teamMembers: 1 // TODO: Fetch from teams API
        };

        setAnalytics(newAnalytics);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [aiAlerts.length]);

  if (loading) {
    return (
      <main className="space-y-6 p-4 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  return (
    <main className="p-4 md:p-8 pt-16">
      {/* 2x2 Grid Layout: Four equal cards */}
      <div className="w-full mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Top Left: Campaign Analytics */}
          <div className="bg-white rounded-lg shadow-sm border p-3 h-[280px] flex flex-col">
            <h3 className="text-base font-bold mb-3 text-blue-600">
              {t("campaign_analytics", "dashboard")}
            </h3>
            <div className="flex-1 overflow-hidden">
              <CampaignAnalytics />
            </div>
          </div>

          {/* Top Right: Realtime Outreach Events */}
          <div className="bg-white rounded-lg shadow-sm border p-3 h-[280px] flex flex-col">
            <h3 className="text-base font-bold mb-3 text-green-600">
              {t("realtime_outreach_events", "dashboard")}
            </h3>
            <div className="flex-1 overflow-hidden">
              <RealtimeOutreachFeed />
            </div>
          </div>

          {/* Bottom Left: Dashboard Metrics */}
          <div className="bg-white rounded-lg shadow-sm border p-3 h-[280px] flex flex-col">
            <h3 className="text-base font-bold mb-3 text-purple-600">
              {t("dashboard_metrics", "dashboard")}
            </h3>
            <div className="flex-1 overflow-hidden">
              <CombinedMetricsCard analytics={analytics} />
            </div>
          </div>

          {/* Bottom Right: Inventory Overview */}
          <div className="bg-white rounded-lg shadow-sm border p-3 h-[280px] flex flex-col">
            <h3 className="text-base font-bold mb-3 text-orange-600">
              {t("inventory_overview", "dashboard")}
            </h3>
            <div className="flex-1 overflow-hidden">
              <InventoryOverview />
            </div>
          </div>
        </div>
      </div>

      <DashboardCustomization
        widgets={[]}
        layoutTemplate="grid"
        handleAddWidget={async () => {}}
        handleRemoveWidget={async () => {}}
        handleEditWidget={async () => {}}
        handleSaveTemplate={async () => {}}
        handleLoadTemplate={async () => {}}
        handleShareDashboard={async () => {}}
        showTemplateModal={false}
        setShowTemplateModal={() => {}}
        showWidgetSettings={null}
        setShowWidgetSettings={() => {}}
        savedTemplates={[]}
        showShareModal={false}
        setShowShareModal={() => {}}
        shareLink=""
        exampleTemplates={[]}
        t={t}
      />

      {/* Charts Section */}
      <div className="relative py-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gray-50 text-gray-500 font-medium">
            Charts &amp; Analytics
          </span>
        </div>
      </div>

      <DashboardCharts
        analytics={analytics}
        t={(s: string, count?: number) => t(s, "dashboard", count)}
        onBuildChart={(suggestion) => {
          console.log("Chart suggestion received:", suggestion);
        }}
      />
    </main>
  );
}

export default function DashboardPage() {
  return (
    <OnboardingGuard requireCompleted={true} mode="modal">
      <DashboardContent />
    </OnboardingGuard>
  );
}
