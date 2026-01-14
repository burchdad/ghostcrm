"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import PageAIAssistant from "@/components/ai/PageAIAssistant";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ToastProvider } from "@/components/utils/ToastProvider";
import { I18nProvider, useI18n } from "@/components/utils/I18nProvider";
import "./page.css";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Target,
  Plus,
  Store,
  Grid3X3
} from "lucide-react";
import ChartMarketplaceModal from "@/app/(core)/dashboard/components/marketplace/Modal/ChartMarketplaceModal";
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Enhanced analytics for tenant owners
interface TenantOwnerAnalytics {
  totalRevenue: number;
  monthlyGrowth: number;
  teamPerformance: number;
  customerSatisfaction: number;
  totalCustomers: number;
  activeDeals: number;
  pendingTasks: number;
  systemHealth: number;
}

// Chart template interface for marketplace integration
interface ChartTemplate {
  name: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'scatter';
  category: string;
  preview?: string;
  sampleData?: any;
  config?: any;
  source?: 'marketplace' | 'ai' | 'custom';
}

// Installed chart interface
interface InstalledChart {
  id: string;
  name: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'scatter';
  data: any;
  options: any;
  position: number;
}

function TenantOwnerDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // Tenant dashboard component rendered - silent mode
  
  // Force deployment refresh - Dashboard page updated Dec 8, 2025
  const [analytics, setAnalytics] = useState<TenantOwnerAnalytics>({
    totalRevenue: 0,
    monthlyGrowth: 0,
    teamPerformance: 0,
    customerSatisfaction: 0,
    totalCustomers: 0,
    activeDeals: 0,
    pendingTasks: 0,
    systemHealth: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [tasksAndAlerts, setTasksAndAlerts] = useState({ tasks: [], alerts: [] });
  const [organizationName, setOrganizationName] = useState('Your Organization');
  const [loading, setLoading] = useState(true);
  const [onboardingLoading, setOnboardingLoading] = useState(true);
  
  // Chart marketplace state
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [installedCharts, setInstalledCharts] = useState<InstalledChart[]>([]);
  const [chartSettings, setChartSettings] = useState<Record<string, any>>({});
  const [activeChartsView, setActiveChartsView] = useState<'grid' | 'marketplace'>('grid');

  useRibbonPage({
    context: "dashboard",
    enable: [
      "quickActions",
      "bulkOps", 
      "saveLayout",
      "share",
      "export",
      "profile",
      "notifications",
      "theme",
      "language",
      "billing"
    ],
    disable: []
  });

  // Onboarding guard for tenant owners
  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!user) {
        setOnboardingLoading(false);
        return;
      }

      // Only owners should be on this dashboard
      if (user.role !== 'owner') {
        router.push('/dashboard');
        return;
      }

      // Allow access to dashboard
      setOnboardingLoading(false);
    }

    checkOnboardingStatus();
  }, [user, router]);

  // Redirect non-owners to regular dashboard
  useEffect(() => {
    // Redirect check effect - silent mode
    
    // Only redirect if auth is ready and we have a user who is not an owner
    if (!loading && !isLoading && user && user.role !== 'owner') {
      console.log('🔄 [TENANT-DASHBOARD] Redirecting non-owner to dashboard');
      router.push('/dashboard');
    }
  }, [user, loading, router, isLoading]);

  // Navigation handlers for metric cards
  const handleRevenueClick = () => {
    router.push('/tenant-owner/finance');
  };

  const handleTeamClick = () => {
    router.push('/tenant-owner/team');
  };

  const handleDealsClick = () => {
    router.push('/tenant-owner/deals');
  };

  const handleSatisfactionClick = () => {
    router.push('/tenant-owner/analytics');
  };

  // Helper function to format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else {
      return 'Just now';
    }
  };

  // Handle activity item clicks
  const handleActivityClick = (activity: any) => {
    if (activity.drilldown?.url) {
      router.push(activity.drilldown.url);
    }
  };

  // Handle task/alert clicks
  const handleTaskClick = (item: any) => {
    if (item.drilldown?.url) {
      router.push(item.drilldown.url);
    }
  };

  // Fetch owner-specific analytics
  useEffect(() => {
    // Don't fetch analytics if user is not loaded or not an owner
    if (!user || user.role !== 'owner') {
      return;
    }

    console.log('🔍 [TENANT-DASHBOARD] Starting analytics fetch, user loaded:', !!user);
    
    async function fetchOwnerAnalytics() {
      try {
        // Starting analytics fetch - silent mode
        setLoading(true);
        
        // Check for success message from chart generation
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('chart_generated') === 'true') {
            // Show success message and clean up URL
            console.log('✅ Chart generated successfully!');
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
        
        // Fetch enhanced owner metrics
        const [dashboardRes, analyticsRes, teamRes, activityRes, tasksRes, organizationRes] = await Promise.all([
          fetch("/api/dashboard/live"),
          fetch("/api/owner/analytics").catch(() => null),
          fetch("/api/team/performance").catch(() => null),
          fetch("/api/dashboard/activity").catch(() => null),
          fetch("/api/dashboard/tasks").catch(() => null),
          fetch("/api/organization").catch(() => null)
        ]);

        const dashboardData = dashboardRes.ok ? await dashboardRes.json() : {};
        const analyticsData = analyticsRes && analyticsRes.ok ? await analyticsRes.json() : {};
        const teamData = teamRes && teamRes.ok ? await teamRes.json() : {};
        const activityData = activityRes && activityRes.ok ? await activityRes.json() : { activities: [] };
        const tasksData = tasksRes && tasksRes.ok ? await tasksRes.json() : { tasks: [], alerts: [] };
        const organizationData = organizationRes && organizationRes.ok ? await organizationRes.json() : null;

        setAnalytics({
          totalRevenue: analyticsData?.revenue?.total || 0,
          monthlyGrowth: analyticsData?.revenue?.growth || 0,
          teamPerformance: teamData?.overview?.avgPerformance || 0,
          customerSatisfaction: analyticsData?.customers?.satisfaction ? (analyticsData.customers.satisfaction * 20) : 0,
          totalCustomers: analyticsData?.customers?.total || 0,
          activeDeals: dashboardData?.todayDeals || analyticsData?.performance?.leadsGenerated || 0,
          pendingTasks: tasksData?.summary?.totalTasks || 0,
          systemHealth: dashboardData?.metrics?.customerSatisfaction || 0
        });
        
        setRecentActivities(activityData.activities || []);
        setTasksAndAlerts({
          tasks: tasksData.tasks || [],
          alerts: tasksData.alerts || []
        });
        
        // Set organization name from API or fallback to tenant id
        if (organizationData?.organization?.name) {
          setOrganizationName(organizationData.organization.name);
        } else if (user?.tenantId && !user.tenantId.includes('-')) {
          // Only use tenant name if it's not a UUID-like string
          setOrganizationName(user.tenantId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()));
        } else {
          setOrganizationName('Your Organization');
        }
        setTasksAndAlerts({
          tasks: tasksData.tasks || [],
          alerts: tasksData.alerts || []
        });

        // Charts will be empty until user installs from marketplace
      } catch (error) {
        console.error('Error fetching owner analytics:', error);
      } finally {
        console.log('✅ [TENANT-DASHBOARD] Analytics fetch complete, setting loading to false');
        setLoading(false);
      }
    }

    fetchOwnerAnalytics();
  }, [user?.id]); // Only depend on user ID to avoid unnecessary refetches

  // Chart marketplace functions
  const handleInstallChart = (template: ChartTemplate) => {
    // Generate realistic sample data based on chart type and category
    const generateSampleData = (type: string, category: string) => {
      const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const colors = {
        sales: { bg: 'rgba(34, 197, 94, 0.5)', border: 'rgb(34, 197, 94)' },
        marketing: { bg: 'rgba(249, 115, 22, 0.5)', border: 'rgb(249, 115, 22)' },
        finance: { bg: 'rgba(147, 51, 234, 0.5)', border: 'rgb(147, 51, 234)' },
        analytics: { bg: 'rgba(59, 130, 246, 0.5)', border: 'rgb(59, 130, 246)' },
        operations: { bg: 'rgba(239, 68, 68, 0.5)', border: 'rgb(239, 68, 68)' },
        default: { bg: 'rgba(107, 114, 128, 0.5)', border: 'rgb(107, 114, 128)' }
      };
      
      const colorSet = colors[category.toLowerCase() as keyof typeof colors] || colors.default;
      
      if (type === 'pie' || type === 'doughnut') {
        return {
          labels: ['Sales Team', 'Marketing', 'Support', 'Operations'],
          datasets: [{
            data: [35, 25, 20, 20],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(249, 115, 22, 0.8)',
              'rgba(147, 51, 234, 0.8)'
            ],
            borderColor: [
              'rgb(34, 197, 94)',
              'rgb(59, 130, 246)',
              'rgb(249, 115, 22)',
              'rgb(147, 51, 234)'
            ],
            borderWidth: 2
          }]
        };
      }
      
      return {
        labels,
        datasets: [{
          label: template.name,
          data: [
            Math.floor(Math.random() * 100) + 20,
            Math.floor(Math.random() * 100) + 20,
            Math.floor(Math.random() * 100) + 20,
            Math.floor(Math.random() * 100) + 20,
            Math.floor(Math.random() * 100) + 20,
            Math.floor(Math.random() * 100) + 20
          ],
          backgroundColor: colorSet.bg,
          borderColor: colorSet.border,
          borderWidth: 2,
          tension: type === 'line' ? 0.4 : undefined
        }]
      };
    };

    const newChart: InstalledChart = {
      id: `chart_${Date.now()}`,
      name: template.name,
      type: template.type,
      data: template.sampleData || generateSampleData(template.type, template.category),
      options: template.config?.options || {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: template.name,
            font: { size: 16, weight: 'bold' },
            padding: { bottom: 20 }
          },
          legend: {
            position: 'bottom' as const,
            labels: { padding: 20, usePointStyle: true }
          }
        },
        scales: (template.type !== 'pie' && template.type !== 'doughnut') ? {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
          },
          x: {
            grid: { display: false }
          }
        } : {}
      },
      position: installedCharts.length
    };

    setInstalledCharts(prev => [...prev, newChart]);
    setChartSettings(prev => ({
      ...prev,
      [newChart.id]: {
        title: template.name,
        type: template.type,
        visible: true
      }
    }));
    setShowMarketplace(false);
  };

  const removeChart = (chartId: string) => {
    setInstalledCharts(prev => prev.filter(chart => chart.id !== chartId));
    setChartSettings(prev => {
      const newSettings = { ...prev };
      delete newSettings[chartId];
      return newSettings;
    });
  };

  const moveChart = (fromIdx: number, toIdx: number) => {
    setInstalledCharts(prev => {
      const newCharts = [...prev];
      const [movedChart] = newCharts.splice(fromIdx, 1);
      newCharts.splice(toIdx, 0, movedChart);
      return newCharts.map((chart, index) => ({ ...chart, position: index }));
    });
  };

  console.log('🔍 [TENANT-DASHBOARD] Loading states:', { loading, onboardingLoading, hasUser: !!user });

  if (loading || onboardingLoading) {
    // Showing loading state - silent mode
    return (
      <div className="tenant-dashboard-loading">
        <div className="tenant-dashboard-loading-spinner">
          <div className="tenant-dashboard-loading-ring"></div>
          <div className="tenant-dashboard-loading-ring"></div>
        </div>
        <div className="tenant-dashboard-loading-text">
          <h3 className="tenant-dashboard-loading-title">Loading Owner Dashboard...</h3>
          <p className="tenant-dashboard-loading-subtitle">Preparing your business insights</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated or not an owner
  if (!user || user.role !== 'owner') {
    return null;
  }

  // Main dashboard render
  return (
    <div className="tenant-dashboard-container">
      <div className="tenant-dashboard-content">
        {/* Analytics Cards Grid with AI Assistant */}
        <div className="tenant-dashboard-header-section">
          <div className="tenant-dashboard-top-section">
            {/* Metrics in 2x2 Grid */}
            <div className="tenant-dashboard-metrics-container">
              <div className="tenant-dashboard-metrics-grid">
                {/* Total Revenue Card */}
                <div
                  className="tenant-dashboard-metric-card revenue clickable"
                  onClick={handleRevenueClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleRevenueClick()}
                >
                  <div className="tenant-dashboard-metric-header">
                    <div>
                      <div className="tenant-dashboard-metric-label revenue">
                        Total Revenue
                      </div>
                      <div className="tenant-dashboard-metric-value">
                        ${analytics.totalRevenue.toLocaleString()}
                      </div>
                    </div>
                    <div className="tenant-dashboard-metric-icon revenue">
                      <DollarSign />
                    </div>
                  </div>
                  <div className="tenant-dashboard-metric-trend positive">
                    <TrendingUp />
                    +{analytics.monthlyGrowth}% this month
                  </div>
                </div>

                {/* Team Performance Card */}
                <div
                  className="tenant-dashboard-metric-card performance clickable"
                  onClick={handleTeamClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleTeamClick()}
                >
                  <div className="tenant-dashboard-metric-header">
                    <div>
                      <div className="tenant-dashboard-metric-label performance">
                        Team Performance
                      </div>
                      <div className="tenant-dashboard-metric-value">
                        {analytics.teamPerformance}%
                      </div>
                    </div>
                    <div className="tenant-dashboard-metric-icon performance">
                      <Users />
                    </div>
                  </div>
                  <div className="tenant-dashboard-progress-bar">
                    <div
                      className="tenant-dashboard-progress-fill"
                      style={{ width: `${analytics.teamPerformance}%` }}
                    />
                  </div>
                </div>

                {/* Active Deals Card */}
                <div
                  className="tenant-dashboard-metric-card deals clickable"
                  onClick={handleDealsClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleDealsClick()}
                >
                  <div className="tenant-dashboard-metric-header">
                    <div>
                      <div className="tenant-dashboard-metric-label deals">
                        Active Deals
                      </div>
                      <div className="tenant-dashboard-metric-value">
                        {analytics.activeDeals}
                      </div>
                    </div>
                    <div className="tenant-dashboard-metric-icon deals">
                      <Target />
                    </div>
                  </div>
                  <div className="tenant-dashboard-metric-trend positive">
                    {analytics.totalCustomers} total customers
                  </div>
                </div>

                {/* Customer Satisfaction Card */}
                <div
                  className="tenant-dashboard-metric-card satisfaction clickable"
                  onClick={handleSatisfactionClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSatisfactionClick()
                  }
                >
                  <div className="tenant-dashboard-metric-header">
                    <div>
                      <div className="tenant-dashboard-metric-label satisfaction">
                        Customer Satisfaction
                      </div>
                      <div className="tenant-dashboard-metric-value">
                        {analytics.customerSatisfaction}%
                      </div>
                    </div>
                    <div className="tenant-dashboard-metric-icon satisfaction">
                      <BarChart3 />
                    </div>
                  </div>
                  <div className="tenant-dashboard-metric-trend positive">
                    Excellent rating
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assistant aligned to the right */}
            <div className="tenant-dashboard-ai-container">
              <PageAIAssistant
                agentId="dashboard"
                pageTitle="Business Dashboard"
                className="tenant-dashboard-ai-assistant"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions for Owners */}
        <div className="tenant-dashboard-actions-grid">
          {/* Business Management Section */}
          <div className="tenant-dashboard-section">
            <h3 className="tenant-dashboard-section-title">
              <div className="tenant-dashboard-section-icon management">
                <Settings />
              </div>
              Business Management
            </h3>

            <div>
              <button
                onClick={() => router.push("/tenant-owner/team")}
                className="tenant-dashboard-action-button"
              >
                <div className="tenant-dashboard-action-content">
                  <div className="tenant-dashboard-action-text">
                    <h4>Team Management</h4>
                    <p>Manage staff, roles, and permissions</p>
                  </div>
                  <div className="tenant-dashboard-action-icon">
                    <Users />
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push("/tenant-owner/settings")}
                className="tenant-dashboard-action-button"
              >
                <div className="tenant-dashboard-action-content">
                  <div className="tenant-dashboard-action-text">
                    <h4>Business Settings</h4>
                    <p>Configure dealership preferences</p>
                  </div>
                  <div className="tenant-dashboard-action-icon">
                    <Settings />
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push("/tenant-owner/finance")}
                className="tenant-dashboard-action-button"
              >
                <div className="tenant-dashboard-action-content">
                  <div className="tenant-dashboard-action-text">
                    <h4>Financial Overview</h4>
                    <p>Revenue reports and analytics</p>
                  </div>
                  <div className="tenant-dashboard-action-icon">
                    <DollarSign />
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="tenant-dashboard-section">
            <h3 className="tenant-dashboard-section-title">Recent Activity</h3>

            <div>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity: any) => (
                  <div
                    key={activity.id}
                    className={`tenant-dashboard-activity-item ${activity.status} clickable`}
                    onClick={() => handleActivityClick(activity)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleActivityClick(activity)
                    }
                    title={activity.drilldown?.action || "Click for details"}
                  >
                    <div
                      className={`tenant-dashboard-activity-dot ${activity.status}`}
                    />
                    <div className="tenant-dashboard-activity-content">
                      <div className="tenant-dashboard-activity-title">
                        {activity.title}
                      </div>
                      <div
                        className={`tenant-dashboard-activity-description ${activity.status}`}
                      >
                        {activity.description}
                      </div>
                      <div className="tenant-dashboard-activity-time">
                        {formatRelativeTime(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="tenant-dashboard-activity-item info">
                  <div className="tenant-dashboard-activity-dot info" />
                  <div className="tenant-dashboard-activity-content">
                    <div className="tenant-dashboard-activity-title">
                      No recent activity
                    </div>
                    <div className="tenant-dashboard-activity-description info">
                      Activities will appear here as they occur
                    </div>
                    <div className="tenant-dashboard-activity-time">-</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alerts & Tasks Section */}
          <div className="tenant-dashboard-section">
            <h3 className="tenant-dashboard-section-title">Alerts & Tasks</h3>

            <div>
              {tasksAndAlerts.tasks.map((task: any) => (
                <div
                  key={task.id}
                  className={`tenant-dashboard-alert ${
                    task.priority === "high" ? "warning" : "info"
                  } clickable`}
                  onClick={() => handleTaskClick(task)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleTaskClick(task)
                  }
                  title={task.drilldown?.action || "Click for details"}
                >
                  <div
                    className={`tenant-dashboard-alert-icon ${
                      task.priority === "high" ? "warning" : "info"
                    }`}
                  >
                    <AlertTriangle />
                  </div>
                  <div
                    className={`tenant-dashboard-alert-content ${
                      task.priority === "high" ? "warning" : "info"
                    }`}
                  >
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                  </div>
                </div>
              ))}

              {tasksAndAlerts.alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className={`tenant-dashboard-alert ${alert.status} clickable`}
                  onClick={() => handleTaskClick(alert)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleTaskClick(alert)
                  }
                  title={alert.drilldown?.action || "Click for details"}
                >
                  <div className={`tenant-dashboard-alert-icon ${alert.status}`}>
                    {alert.status === "success" && <CheckCircle />}
                    {alert.status === "info" && <Calendar />}
                    {alert.status === "warning" && <AlertTriangle />}
                  </div>
                  <div
                    className={`tenant-dashboard-alert-content ${alert.status}`}
                  >
                    <h4>{alert.title}</h4>
                    <p>{alert.description}</p>
                  </div>
                </div>
              ))}

              {tasksAndAlerts.tasks.length === 0 &&
                tasksAndAlerts.alerts.length === 0 && (
                  <div className="tenant-dashboard-alert success">
                    <div className="tenant-dashboard-alert-icon success">
                      <CheckCircle />
                    </div>
                    <div className="tenant-dashboard-alert-content success">
                      <h4>All caught up!</h4>
                      <p>No pending tasks or alerts</p>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="tenant-dashboard-section">
          <div className="flex items-center justify-between mb-6">
            <h3 className="tenant-dashboard-section-title">
              <div className="tenant-dashboard-section-icon charts">
                <BarChart3 />
              </div>
              Business Analytics & Charts
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  onClick={() => setActiveChartsView('grid')}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeChartsView === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  Charts
                </button>
                <button
                  onClick={() => setActiveChartsView('marketplace')}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeChartsView === 'marketplace'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Marketplace
                </button>
              </div>
              <button
                onClick={() => setShowMarketplace(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Chart
              </button>
            </div>
          </div>

          {activeChartsView === 'grid' ? (
            <div>
              {installedCharts.length > 0 ? (
                <div className="bg-white rounded-lg border p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {installedCharts.map((chart) => (
                      <div key={chart.id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">{chart.name}</h4>
                          <button
                            onClick={() => removeChart(chart.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove chart"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="h-64">
                          {chart.type === 'bar' && (
                            <Bar 
                              data={chart.data} 
                              options={{
                                ...chart.options,
                                responsive: true,
                                maintainAspectRatio: false
                              }} 
                            />
                          )}
                          {chart.type === 'line' && (
                            <Line 
                              data={chart.data} 
                              options={{
                                ...chart.options,
                                responsive: true,
                                maintainAspectRatio: false
                              }} 
                            />
                          )}
                          {chart.type === 'pie' && (
                            <Pie 
                              data={chart.data} 
                              options={{
                                ...chart.options,
                                responsive: true,
                                maintainAspectRatio: false
                              }} 
                            />
                          )}
                          {chart.type === 'doughnut' && (
                            <Doughnut 
                              data={chart.data} 
                              options={{
                                ...chart.options,
                                responsive: true,
                                maintainAspectRatio: false
                              }} 
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border p-8 text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Charts Installed</h4>
                  <p className="text-gray-600 mb-6">
                    Add charts from the marketplace to visualize your business data
                  </p>
                  <button
                    onClick={() => setShowMarketplace(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Store className="w-5 h-5" />
                    Browse Chart Marketplace
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border p-8 text-center">
              <div className="text-4xl mb-4">🏪</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Chart Marketplace</h4>
              <p className="text-gray-600 mb-6">
                Browse and install pre-built chart templates for your business needs
              </p>
              <button
                onClick={() => setShowMarketplace(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Store className="w-5 h-5" />
                Open Chart Marketplace
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart Marketplace Modal */}
      <ChartMarketplaceModal
        open={showMarketplace}
        onClose={() => setShowMarketplace(false)}
        onInstall={handleInstallChart}
      />
    </div>
  );
}

export default function TenantOwnerDashboardPage() {
  return (
    <I18nProvider>
      <ToastProvider>
        <DndProvider backend={HTML5Backend}>
          <TenantOwnerDashboard />
        </DndProvider>
      </ToastProvider>
    </I18nProvider>
  );
}