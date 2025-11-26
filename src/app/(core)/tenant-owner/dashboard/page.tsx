"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ToastProvider } from "@/components/utils/ToastProvider";
import { I18nProvider, useI18n } from "@/components/utils/I18nProvider";
import "./page.css";
import { 
  Crown, 
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
  const { user, tenant } = useAuth();
  const router = useRouter();
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
  const [loading, setLoading] = useState(true);
  
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

  // Redirect non-owners to regular dashboard
  useEffect(() => {
    if (!loading && user && user.role !== 'owner') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Fetch owner-specific analytics
  useEffect(() => {
    async function fetchOwnerAnalytics() {
      try {
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
        const [dashboardRes, analyticsRes, teamRes] = await Promise.all([
          fetch("/api/dashboard/live"),
          fetch("/api/owner/analytics").catch(() => null),
          fetch("/api/team/performance").catch(() => null)
        ]);

        const dashboardData = dashboardRes.ok ? await dashboardRes.json() : {};
        const analyticsData = analyticsRes && analyticsRes.ok ? await analyticsRes.json() : {};
        const teamData = teamRes && teamRes.ok ? await teamRes.json() : {};

        setAnalytics({
          totalRevenue: analyticsData?.revenue || 125000,
          monthlyGrowth: analyticsData?.growth || 12.5,
          teamPerformance: teamData?.performance || 87,
          customerSatisfaction: analyticsData?.satisfaction || 92,
          totalCustomers: dashboardData?.metrics?.totalCustomers || 245,
          activeDeals: dashboardData?.metrics?.activeDeals || 18,
          pendingTasks: dashboardData?.metrics?.pendingTasks || 7,
          systemHealth: 98
        });

        // Install a default demo chart if none exist
        if (installedCharts.length === 0) {
          const demoChart: InstalledChart = {
            id: 'demo_revenue_chart',
            name: 'Monthly Revenue',
            type: 'bar',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                label: 'Revenue ($)',
                data: [15000, 22000, 18000, 26000, 23000, 29000],
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 2
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: 'Monthly Revenue Trends',
                  font: { size: 16, weight: 'bold' },
                  padding: { bottom: 20 }
                },
                legend: {
                  position: 'bottom' as const,
                  labels: { padding: 20, usePointStyle: true }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(0, 0, 0, 0.1)' }
                },
                x: {
                  grid: { display: false }
                }
              }
            },
            position: 0
          };

          setInstalledCharts([demoChart]);
          setChartSettings({
            [demoChart.id]: {
              title: demoChart.name,
              type: demoChart.type,
              visible: true
            }
          });
        }
      } catch (error) {
        console.error('Error fetching owner analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOwnerAnalytics();
  }, [installedCharts.length]);

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

  if (loading) {
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

  if (!user || user.role !== 'owner') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="tenant-dashboard-container">
      {/* Enhanced Header with Glass Effect */}
      <div className="tenant-dashboard-header">
        <div className="tenant-dashboard-header-content">
          <div className="tenant-dashboard-title-section">
            <div className="tenant-dashboard-crown">
              <Crown />
            </div>
            <div>
              <h1 className="tenant-dashboard-title">
                {tenant?.name || 'Default Organization'} - Owner Dashboard
              </h1>
              <p className="tenant-dashboard-subtitle">Comprehensive business overview and management</p>
            </div>
          </div>
          <div className="tenant-dashboard-status-badge">
            <CheckCircle className="tenant-dashboard-status-icon" />
            <span>System Healthy</span>
          </div>
        </div>
      </div>

      <div className="tenant-dashboard-content">
        {/* Enhanced Key Metrics Grid with Animations */}
        <div className="tenant-dashboard-metrics-grid">
          {/* Total Revenue Card */}
          <div className="tenant-dashboard-metric-card revenue">
            <div className="tenant-dashboard-metric-header">
              <div>
                <div className="tenant-dashboard-metric-label revenue">Total Revenue</div>
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
          <div className="tenant-dashboard-metric-card performance">
            <div className="tenant-dashboard-metric-header">
              <div>
                <div className="tenant-dashboard-metric-label performance">Team Performance</div>
                <div className="tenant-dashboard-metric-value">{analytics.teamPerformance}%</div>
              </div>
              <div className="tenant-dashboard-metric-icon performance">
                <Users />
              </div>
            </div>
            <div className="tenant-dashboard-progress-bar">
              <div 
                className="tenant-dashboard-progress-fill" 
                style={{ width: `${analytics.teamPerformance}%` }}
              ></div>
            </div>
          </div>

          {/* Active Deals Card */}
          <div className="tenant-dashboard-metric-card deals">
            <div className="tenant-dashboard-metric-header">
              <div>
                <div className="tenant-dashboard-metric-label deals">Active Deals</div>
                <div className="tenant-dashboard-metric-value">{analytics.activeDeals}</div>
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
          <div className="tenant-dashboard-metric-card satisfaction">
            <div className="tenant-dashboard-metric-header">
              <div>
                <div className="tenant-dashboard-metric-label satisfaction">Customer Satisfaction</div>
                <div className="tenant-dashboard-metric-value">{analytics.customerSatisfaction}%</div>
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
                onClick={() => router.push('/tenant-owner/team')}
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
                onClick={() => router.push('/tenant-owner/settings')}
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
                onClick={() => router.push('/tenant-owner/finance')}
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
              <div className="tenant-dashboard-activity-item success">
                <div className="tenant-dashboard-activity-dot success"></div>
                <div className="tenant-dashboard-activity-content">
                  <div className="tenant-dashboard-activity-title">New sale completed</div>
                  <div className="tenant-dashboard-activity-description success">2024 Honda Civic - $28,500</div>
                  <div className="tenant-dashboard-activity-time">2 hours ago</div>
                </div>
              </div>
              <div className="tenant-dashboard-activity-item info">
                <div className="tenant-dashboard-activity-dot info"></div>
                <div className="tenant-dashboard-activity-content">
                  <div className="tenant-dashboard-activity-title">Team member added</div>
                  <div className="tenant-dashboard-activity-description info">Sarah Johnson joined as Sales Rep</div>
                  <div className="tenant-dashboard-activity-time">5 hours ago</div>
                </div>
              </div>
              <div className="tenant-dashboard-activity-item warning">
                <div className="tenant-dashboard-activity-dot warning"></div>
                <div className="tenant-dashboard-activity-content">
                  <div className="tenant-dashboard-activity-title">Inventory update</div>
                  <div className="tenant-dashboard-activity-description warning">15 new vehicles added</div>
                  <div className="tenant-dashboard-activity-time">1 day ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts & Tasks Section */}
          <div className="tenant-dashboard-section">
            <h3 className="tenant-dashboard-section-title">Alerts & Tasks</h3>
            <div>
              {analytics.pendingTasks > 0 && (
                <div className="tenant-dashboard-alert warning">
                  <div className="tenant-dashboard-alert-icon warning">
                    <AlertTriangle />
                  </div>
                  <div className="tenant-dashboard-alert-content warning">
                    <h4>{analytics.pendingTasks} pending tasks</h4>
                    <p>Requires your attention</p>
                  </div>
                </div>
              )}
              
              <div className="tenant-dashboard-alert success">
                <div className="tenant-dashboard-alert-icon success">
                  <CheckCircle />
                </div>
                <div className="tenant-dashboard-alert-content success">
                  <h4>System healthy</h4>
                  <p>All systems operational</p>
                </div>
              </div>
              
              <div className="tenant-dashboard-alert info">
                <div className="tenant-dashboard-alert-icon info">
                  <Calendar />
                </div>
                <div className="tenant-dashboard-alert-content info">
                  <h4>Monthly review</h4>
                  <p>Scheduled for next week</p>
                </div>
              </div>
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