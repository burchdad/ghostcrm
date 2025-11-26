"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRibbonPage } from "@/components/ribbon";
import { Crown } from "lucide-react";
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
      "appIntegrations"
    ]
  });

  const router = useRouter();
  const { user, tenant } = useAuth();
  const { messages, aiAlerts } = useDashboardData();
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

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

  // Detect tenant context using dealership field instead of subdomain
  const [isTenantOwner, setIsTenantOwner] = useState(false);
  const [tenantSubdomain, setTenantSubdomain] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use dealership context for proper tenant owner detection
      const hasDealershipContext = user?.dealership && user.dealership.trim() !== '';
      const isOwner = user?.role === 'owner';
      
      setIsTenantOwner(isOwner && hasDealershipContext);
      setTenantSubdomain(user?.dealership || '');
      
      console.log('🏢 [DASHBOARD CONTEXT]', {
        userRole: user?.role,
        dealership: user?.dealership,
        hasDealershipContext,
        isTenantOwner: isOwner && hasDealershipContext
      });
    }
  }, [user]);

  // Enhanced redirect logic for owners - handle subdomain context properly
  useEffect(() => {
    // This fallback logic should rarely be needed now since PermissionMiddleware handles redirects
    // Only log if we somehow end up here incorrectly
    if (user && user.role === 'owner') {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isSubdomain = hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname.includes('.localhost');
      
      console.log('⚠️ [DASHBOARD FALLBACK] Owner detected on dashboard - PermissionMiddleware should have handled this:', {
        email: user.email,
        role: user.role,
        hostname,
        isSubdomain,
        note: 'This indicates PermissionMiddleware may need debugging'
      });
      
      // Remove the automatic redirects - let PermissionMiddleware handle them
      // This prevents double redirects and race conditions
    }
  }, [user]);

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

    if (user && user.role !== 'owner') {
      fetchDashboardData();
    }
  }, [aiAlerts.length, user]);

  if (loading && user?.role !== 'owner') {
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
      {/* Show tenant owner header if applicable */}
      {isTenantOwner && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-blue-900">
                {t("tenant_owner_dashboard", "Tenant Owner Dashboard")}
              </h2>
              <p className="text-sm text-blue-700">
                Managing: <span className="font-medium">{tenantSubdomain}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2x2 Grid Layout: Four equal cards */}
      <div className="w-full mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Top Left: Campaign Analytics */}
          <div className="bg-white rounded-lg shadow-sm border p-3 h-[280px] flex flex-col">
            <h3 className="text-base font-bold mb-3 text-blue-600">
              {isTenantOwner 
                ? t("tenant_campaign_analytics", "Tenant Campaign Analytics")
                : t("campaign_analytics", "Campaign Analytics")
              }
            </h3>
            <div className="flex-1 overflow-hidden">
              <CampaignAnalytics />
            </div>
          </div>

          {/* Top Right: Realtime Outreach Events */}
          <div className="bg-white rounded-lg shadow-sm border p-3 h-[280px] flex flex-col">
            <h3 className="text-base font-bold mb-3 text-green-600">
              {isTenantOwner 
                ? t("tenant_outreach_events", "Tenant Outreach Events")
                : t("realtime_outreach_events", "Realtime Outreach Events")
              }
            </h3>
            <div className="flex-1 overflow-hidden">
              <RealtimeOutreachFeed />
            </div>
          </div>

          {/* Bottom Left: Dashboard Metrics */}
          <div className="bg-white rounded-lg shadow-sm border p-3 h-[280px] flex flex-col">
            <h3 className="text-base font-bold mb-3 text-purple-600">
              {isTenantOwner 
                ? t("tenant_business_metrics", "Business Metrics")
                : t("dashboard_metrics", "Dashboard Metrics")
              }
            </h3>
            <div className="flex-1 overflow-hidden">
              <CombinedMetricsCard analytics={analytics} />
            </div>
          </div>

          {/* Bottom Right: Inventory Overview */}
          <div className="bg-white rounded-lg shadow-sm border p-3 h-[280px] flex flex-col">
            <h3 className="text-base font-bold mb-3 text-orange-600">
              {isTenantOwner 
                ? t("business_inventory", "Business Inventory")
                : t("inventory_overview", "Inventory Overview")
              }
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

export default function Dashboard() {
  // Check if user is a tenant owner to skip onboarding
  const [isTenantOwner, setIsTenantOwner] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isSubdomain = hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname.includes('.localhost');
      setIsTenantOwner(isSubdomain);
    }
  }, []);

  // For tenant owners, skip onboarding entirely since they've already set up their organization
  if (isTenantOwner) {
    return (
      <ToastProvider>
        <I18nProvider>
          <DashboardContent />
        </I18nProvider>
      </ToastProvider>
    );
  }

  // For main domain users, use onboarding guard
  return (
    <OnboardingGuard requireCompleted={true} mode="modal">
      <ToastProvider>
        <I18nProvider>
          <DashboardContent />
        </I18nProvider>
      </ToastProvider>
    </OnboardingGuard>
  );
}