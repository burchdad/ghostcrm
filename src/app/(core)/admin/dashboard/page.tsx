"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/SupabaseAuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import { 
  Shield, 
  Users, 
  BarChart3, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  UserCheck,
  FileText,
  Bell
} from "lucide-react";

interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  systemHealth: number;
  storageUsed: number;
  totalInventory: number;
  recentActivities: Array<{
    id: string;
    type: 'user_action' | 'system_event' | 'approval';
    message: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  permissions: {
    canManageUsers: boolean;
    canViewReports: boolean;
    canManageInventory: boolean;
    canManageSettings: boolean;
  };
}

function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalUsers: 12,
    activeUsers: 8,
    pendingApprovals: 3,
    systemHealth: 98,
    storageUsed: 65,
    totalInventory: 145,
    recentActivities: [
      {
        id: '1',
        type: 'user_action',
        message: 'New lead created by John Smith',
        timestamp: '2025-11-05T10:30:00Z',
        severity: 'low'
      },
      {
        id: '2',
        type: 'approval',
        message: 'User access request pending approval',
        timestamp: '2025-11-05T09:15:00Z',
        severity: 'medium'
      },
      {
        id: '3',
        type: 'system_event',
        message: 'Backup completed successfully',
        timestamp: '2025-11-05T08:00:00Z',
        severity: 'low'
      }
    ],
    permissions: {
      canManageUsers: true,
      canViewReports: true,
      canManageInventory: true,
      canManageSettings: false
    }
  });
  const [loading, setLoading] = useState(true);

  useRibbonPage({
    context: "admin",
    enable: [
      "quickActions",
      "bulkOps",
      "export",
      "profile",
      "notifications",
      "theme",
      "language",
      "automation"
    ],
    disable: []
  });

  // Redirect non-admins
  useEffect(() => {
    if (!loading && user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Fetch admin metrics
  useEffect(() => {
    async function fetchAdminMetrics() {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/admin/metrics');
        // const data = await response.json();
        // setMetrics(data);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error fetching admin metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === 'admin') {
      fetchAdminMetrics();
    }
  }, [user]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <I18nProvider>
        <ToastProvider>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </ToastProvider>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <ToastProvider>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor and manage system operations</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Settings className="h-4 w-4" />
                System Settings
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Reports
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +2 this week
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</p>
                  <p className="text-sm text-gray-500 mt-1">{Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}% active</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.pendingApprovals}</p>
                  <p className="text-sm text-yellow-600 mt-1">Requires attention</p>
                </div>
                <Bell className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.systemHealth}%</p>
                  <p className="text-sm text-green-600 mt-1">All systems operational</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Storage Usage */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Database</span>
                    <span className="text-sm text-gray-500">{metrics.storageUsed}% used</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${metrics.storageUsed > 80 ? 'bg-red-500' : metrics.storageUsed > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${metrics.storageUsed}%` }}
                    ></div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    {metrics.totalInventory} inventory items managed
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {metrics.permissions.canManageUsers && (
                  <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Users className="h-5 w-5 text-blue-600 mb-2" />
                    <p className="font-medium text-gray-900">Manage Users</p>
                    <p className="text-xs text-gray-500">Add, edit, or remove users</p>
                  </button>
                )}
                
                {metrics.permissions.canManageInventory && (
                  <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <BarChart3 className="h-5 w-5 text-green-600 mb-2" />
                    <p className="font-medium text-gray-900">Inventory</p>
                    <p className="text-xs text-gray-500">Manage inventory items</p>
                  </button>
                )}
                
                {metrics.permissions.canViewReports && (
                  <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <FileText className="h-5 w-5 text-purple-600 mb-2" />
                    <p className="font-medium text-gray-900">Reports</p>
                    <p className="text-xs text-gray-500">View system reports</p>
                  </button>
                )}
                
                {metrics.permissions.canManageSettings && (
                  <button className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Settings className="h-5 w-5 text-gray-600 mb-2" />
                    <p className="font-medium text-gray-900">Settings</p>
                    <p className="text-xs text-gray-500">System configuration</p>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All Activities
              </button>
            </div>
            <div className="space-y-3">
              {metrics.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`p-2 rounded-full ${getSeverityColor(activity.severity)}`}>
                    {getSeverityIcon(activity.severity)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(activity.severity)}`}>
                    {activity.type.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coming Soon Note */}
        <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-200 rounded-lg p-4 max-w-sm">
          <p className="text-sm text-blue-800 font-medium">Admin Dashboard</p>
          <p className="text-xs text-blue-600 mt-1">Advanced admin features coming Q1 2025</p>
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}

export default function AdminDashboard() {
  return <AdminDashboardPage />;
}