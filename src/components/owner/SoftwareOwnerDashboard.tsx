"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRibbonPage } from "@/components/ribbon";

import {
  Crown,
  RefreshCw,
  LogOut,
  Activity,
  Users,
  CreditCard,
  Ticket,
  Shield,
  Settings,
  Database,
  Server,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import {
  SystemMetrics,
  TenantData,
  SecurityAlert,
  PromoCode,
  NewPromoCode,
} from "@/types/owner";

import OverviewTab from "./tabs/OverviewTab";
import TenantsTab from "./tabs/TenantsTab";
import StripeTab from "./tabs/StripeTab";
import PromoCodesTab from "./tabs/PromoCodesTab";
import SecurityTab from "./tabs/SecurityTab";
import SettingsTab from "./tabs/SettingsTab";

type OwnerTabId =
  | "overview"
  | "tenants"
  | "stripe"
  | "promo-codes"
  | "security"
  | "settings";

const TABS: {
  id: OwnerTabId;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}[] = [
  { id: "overview", label: "System Overview", icon: Activity },
  { id: "tenants", label: "Tenant Management", icon: Users },
  { id: "stripe", label: "Stripe Management", icon: CreditCard },
  { id: "promo-codes", label: "Promo Codes", icon: Ticket },
  { id: "security", label: "Security Center", icon: Shield },
  { id: "settings", label: "System Settings", icon: Settings },
];

export default function SoftwareOwnerDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OwnerTabId>("overview");

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(
    null
  );
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Stripe state (for overview quick actions)
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeSyncResult, setStripeSyncResult] = useState<any>(null);
  const [stripeError, setStripeError] = useState("");
  const [lastStripeAction, setLastStripeAction] = useState<string>("");

  useRibbonPage({
    context: "dashboard",
    enable: ["quickActions", "export", "profile", "notifications"],
    disable: ["saveLayout", "aiTools", "developer", "billing"]
  });

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "owner" && user.email !== "software.owner@ghostcrm.com") {
      router.push("/");
      return;
    }

    loadDashboardData();
  }, [user, isLoading, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Simulated delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock system metrics
      setSystemMetrics({
        totalUsers: 1247,
        activeTenants: 34,
        totalRevenue: 89650,
        systemUptime: 99.97,
        apiCalls24h: 156789,
        errorRate: 0.03,
      });

      // Mock tenants
      setTenants([
        {
          id: "tenant-1",
          name: "Acme Corporation",
          userCount: 156,
          status: "active",
          lastActivity: new Date().toISOString(),
          revenue: 5940,
          plan: "Enterprise",
        },
        {
          id: "tenant-2",
          name: "Tech Innovations LLC",
          userCount: 89,
          status: "active",
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          revenue: 2970,
          plan: "Professional",
        },
        {
          id: "tenant-3",
          name: "Startup Ventures",
          userCount: 23,
          status: "trial",
          lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          revenue: 0,
          plan: "Trial",
        },
      ]);

      // Mock security alerts
      setSecurityAlerts([
        {
          id: "alert-1",
          type: "security",
          severity: "medium",
          message: "Unusual login pattern detected from IP 192.168.1.100",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          resolved: false,
        },
        {
          id: "alert-2",
          type: "compliance",
          severity: "low",
          message: "GDPR compliance check completed successfully",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: true,
        },
      ]);

      await loadPromoCodes();
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPromoCodes = async () => {
    try {
      const response = await fetch("/api/owner/promo-codes", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPromoCodes(data.promoCodes);
          return;
        }
      }

      // Fallback mock data
      setPromoCodes([
        {
          id: "promo-1",
          code: "TESTCLIENT70",
          description: "Special discount for first test client - $70/month",
          discountType: "fixed",
          discountValue: 70,
          monthlyPrice: 70,
          yearlyPrice: 840,
          maxUses: 1,
          usedCount: 0,
          expiresAt: new Date(
            Date.now() + 90 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "Software Owner",
        },
        {
          id: "promo-2",
          code: "SOFTWAREOWNER",
          description: "Free access for software owner testing",
          discountType: "percentage",
          discountValue: 100,
          monthlyPrice: 0,
          yearlyPrice: 0,
          maxUses: 1,
          usedCount: 0,
          expiresAt: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: "Software Owner",
        },
      ]);
    } catch (err) {
      console.error("Failed to load promo codes:", err);
    }
  };

  const createPromoCode = async (newPromo: NewPromoCode) => {
    try {
      const response = await fetch("/api/owner/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newPromo),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await loadPromoCodes();
        return true;
      }

      console.error("Failed to create promo code:", data.error);
      return false;
    } catch (err) {
      console.error("Error creating promo code:", err);
      return false;
    }
  };

  const updatePromoCode = async (updatedPromo: PromoCode) => {
    try {
      const response = await fetch("/api/owner/promo-codes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedPromo),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await loadPromoCodes();
        return true;
      }

      console.error("Failed to update promo code:", data.error);
      return false;
    } catch (err) {
      console.error("Error updating promo code:", err);
      return false;
    }
  };

  const deletePromoCode = async (promoId: string) => {
    try {
      const response = await fetch(`/api/owner/promo-codes?id=${promoId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await loadPromoCodes();
        return true;
      }

      console.error("Failed to delete promo code:", data.error);
      return false;
    } catch (err) {
      console.error("Error deleting promo code:", err);
      return false;
    }
  };

  // Stripe quick tests (overview block)
  const testProductSync = async () => {
    setStripeLoading(true);
    setStripeError("");
    setStripeSyncResult(null);
    setLastStripeAction("Product Sync");

    try {
      const res = await fetch("/api/stripe/sync-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.success) setStripeSyncResult(data);
      else setStripeError(data.error || "Failed to sync products");
    } catch (err) {
      setStripeError(
        err instanceof Error ? err.message : "Unknown error occurred"
      );
    } finally {
      setStripeLoading(false);
    }
  };

  const testProductMapping = async () => {
    setStripeLoading(true);
    setStripeError("");
    setStripeSyncResult(null);
    setLastStripeAction("Product Mapping");

    try {
      const res = await fetch("/api/stripe/product-mappings");
      const data = await res.json();

      if (data.success) setStripeSyncResult(data);
      else setStripeError(data.error || "Failed to fetch product mappings");
    } catch (err) {
      setStripeError(
        err instanceof Error ? err.message : "Unknown error occurred"
      );
    } finally {
      setStripeLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ownerSession");
    }
    router.push("/login");
  };

  if (loading || !systemMetrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-12 h-12 text-yellow-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading Owner Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 to-violet-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              <div>
                <h1 className="text-xl font-bold">Owner Control Center</h1>
                <p className="text-purple-200 text-sm">
                  Maximum Privilege Access
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={loadDashboardData}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <OverviewTab
            systemMetrics={systemMetrics}
            securityAlerts={securityAlerts}
            stripeLoading={stripeLoading}
            lastStripeAction={lastStripeAction}
            stripeSyncResult={stripeSyncResult}
            stripeError={stripeError}
            testProductSync={testProductSync}
            testProductMapping={testProductMapping}
            icons={{ Database, Activity, Server, AlertTriangle, CheckCircle }}
          />
        )}

        {activeTab === "tenants" && (
          <TenantsTab
            tenants={tenants}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}

        {activeTab === "stripe" && <StripeTab />}

        {activeTab === "promo-codes" && (
          <PromoCodesTab
            promoCodes={promoCodes}
            createPromoCode={createPromoCode}
            updatePromoCode={updatePromoCode}
            deletePromoCode={deletePromoCode}
          />
        )}

        {activeTab === "security" && <SecurityTab />}

        {activeTab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}