"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Award,
  Activity,
  Phone,
  Mail,
  MessageSquare,
  Plus
} from "lucide-react";

interface SalesMetrics {
  monthlyTarget: number;
  currentSales: number;
  targetProgress: number;
  leadsCount: number;
  activeDeals: number;
  closedDeals: number;
  conversionRate: number;
  ranking: number;
  totalReps: number;
  upcomingTasks: Array<{
    id: string;
    type: 'call' | 'email' | 'meeting' | 'follow_up';
    title: string;
    client: string;
    time: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    client: string;
    timestamp: string;
    value?: number;
  }>;
}

function SalesDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<SalesMetrics>({
    monthlyTarget: 50000,
    currentSales: 32500,
    targetProgress: 65,
    leadsCount: 23,
    activeDeals: 8,
    closedDeals: 12,
    conversionRate: 34.5,
    ranking: 3,
    totalReps: 12,
    upcomingTasks: [
      {
        id: '1',
        type: 'call',
        title: 'Follow-up call',
        client: 'ABC Motors',
        time: '10:30 AM',
        priority: 'high'
      },
      {
        id: '2',
        type: 'meeting',
        title: 'Product demo',
        client: 'City Auto',
        time: '2:00 PM',
        priority: 'medium'
      },
      {
        id: '3',
        type: 'email',
        title: 'Send proposal',
        client: 'Quick Sales',
        time: '4:30 PM',
        priority: 'high'
      }
    ],
    recentActivity: [
      {
        id: '1',
        action: 'Deal closed',
        client: 'Metro Auto',
        timestamp: '2 hours ago',
        value: 8500
      },
      {
        id: '2',
        action: 'Lead contacted',
        client: 'Fast Cars Inc',
        timestamp: '4 hours ago'
      },
      {
        id: '3',
        action: 'Meeting scheduled',
        client: 'Premium Motors',
        timestamp: '6 hours ago'
      }
    ]
  });
  const [loading, setLoading] = useState(true);

  useRibbonPage({
    context: "sales",
    enable: [
      "quickActions",
      "bulkOps",
      "share",
      "export",
      "profile",
      "notifications",
      "theme",
      "language",
      "automation"
    ],
    disable: []
  });

  // Redirect non-sales reps
  useEffect(() => {
    if (!loading && user && user.role !== 'sales_rep') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Fetch sales metrics
  useEffect(() => {
    async function fetchSalesMetrics() {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/sales/metrics');
        // const data = await response.json();
        // setMetrics(data);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error fetching sales metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === 'sales_rep') {
      fetchSalesMetrics();
    }
  }, [user]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
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
              <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your performance and manage your pipeline</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                My Reports
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Lead
              </button>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Target</p>
                  <p className="text-2xl font-bold text-gray-900">${metrics.currentSales.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">of ${metrics.monthlyTarget.toLocaleString()}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${metrics.targetProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-blue-600 mt-1">{metrics.targetProgress}% complete</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.leadsCount}</p>
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +5 this week
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Deals</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.activeDeals}</p>
                  <p className="text-sm text-gray-500 mt-1">{metrics.closedDeals} closed this month</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.conversionRate}%</p>
                  <p className="text-sm text-gray-500 mt-1">Team average: 28%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Performance Ranking */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-600">
                  You're ranked #{metrics.ranking} of {metrics.totalReps} reps
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-blue-600">#{metrics.ranking}</p>
                <p className="text-sm text-gray-600">Your Ranking</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-green-600">{metrics.conversionRate}%</p>
                <p className="text-sm text-gray-600">Conversion Rate</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-purple-600">${metrics.currentSales.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Month to Date</p>
              </div>
            </div>
          </div>

          {/* Today's Tasks and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Tasks */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Today's Tasks</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {metrics.upcomingTasks.map((task) => (
                  <div key={task.id} className={`flex items-center gap-3 p-3 border rounded-lg ${getPriorityColor(task.priority)}`}>
                    <div className="flex-shrink-0">
                      {getTaskIcon(task.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.client}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{task.time}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {metrics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-blue-50 rounded-full">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.client}</p>
                    </div>
                    <div className="text-right">
                      {activity.value && (
                        <p className="font-medium text-green-600">${activity.value.toLocaleString()}</p>
                      )}
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Note */}
        <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-200 rounded-lg p-4 max-w-sm">
          <p className="text-sm text-blue-800 font-medium">Sales Dashboard</p>
          <p className="text-xs text-blue-600 mt-1">Advanced sales analytics coming Q1 2025</p>
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}

export default function SalesDashboard() {
  return <SalesDashboardPage />;
}