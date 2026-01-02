'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/SupabaseAuthContext';
import { useRouter } from 'next/navigation';

interface DealershipStats {
  totalLeads: number;
  todayAppointments: number;
  thisWeekSales: number;
  inventoryCount: number;
  pendingTasks: number;
}

interface RecentActivity {
  id: string;
  type: 'lead' | 'sale' | 'appointment' | 'task';
  title: string;
  time: string;
  priority?: 'high' | 'medium' | 'low';
}

export default function MobileDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DealershipStats>({
    totalLeads: 0,
    todayAppointments: 0,
    thisWeekSales: 0,
    inventoryCount: 0,
    pendingTasks: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !tenant) {
      router.push('/login?redirect=/mobile');
      return;
    }

    // Load dealership stats
    loadDashboardData();
  }, [user, tenant, router]);

  const loadDashboardData = async () => {
    try {
      // Clean production state - no mock data
      setStats({
        totalLeads: 0,
        todayAppointments: 0,
        thisWeekSales: 0,
        inventoryCount: 0,
        pendingTasks: 0
      });

      setRecentActivity([
        // No mock activity - clean state
        // Real activity will be loaded from API when implemented
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead':
        return '👤';
      case 'sale':
        return '💰';
      case 'appointment':
        return '📅';
      case 'task':
        return '✅';
      default:
        return '📋';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold text-gray-900">
          Welcome back, {user?.firstName || 'Sales Rep'}!
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          {tenant?.name || 'Your Dealership'} • {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-500 text-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Leads</p>
              <p className="text-2xl font-bold">{stats.totalLeads}</p>
            </div>
            <div className="text-3xl opacity-80">👥</div>
          </div>
        </div>

        <div className="bg-green-500 text-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Today's Appts</p>
              <p className="text-2xl font-bold">{stats.todayAppointments}</p>
            </div>
            <div className="text-3xl opacity-80">📅</div>
          </div>
        </div>

        <div className="bg-purple-500 text-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Week Sales</p>
              <p className="text-2xl font-bold">{stats.thisWeekSales}</p>
            </div>
            <div className="text-3xl opacity-80">💰</div>
          </div>
        </div>

        <div className="bg-orange-500 text-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Inventory</p>
              <p className="text-2xl font-bold">{stats.inventoryCount}</p>
            </div>
            <div className="text-3xl opacity-80">🚗</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          <button className="flex flex-col items-center p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100">
            <span className="text-2xl mb-1">📱</span>
            <span className="text-xs text-blue-700 font-medium">New Lead</span>
          </button>
          <button className="flex flex-col items-center p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100">
            <span className="text-2xl mb-1">📞</span>
            <span className="text-xs text-green-700 font-medium">Quick Call</span>
          </button>
          <button className="flex flex-col items-center p-3 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100">
            <span className="text-2xl mb-1">📊</span>
            <span className="text-xs text-purple-700 font-medium">Reports</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          <button className="text-blue-600 text-sm font-medium">View All</button>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-xl">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className={`text-xs ${getPriorityColor(activity.priority)}`}>
                  {activity.time}
                  {activity.priority && (
                    <span className="ml-2 capitalize">• {activity.priority} priority</span>
                  )}
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Tasks */}
      {stats.pendingTasks > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-yellow-800">Pending Tasks</h3>
              <p className="text-yellow-700 text-sm">
                You have {stats.pendingTasks} tasks that need attention
              </p>
            </div>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600">
              View Tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}