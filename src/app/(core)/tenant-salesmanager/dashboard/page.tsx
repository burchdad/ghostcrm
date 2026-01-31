'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { TrendingUp, Users, Target, Calendar, AlertCircle, DollarSign, Phone, MessageSquare } from 'lucide-react';
import { useRibbonPage } from '@/components/ribbon';

interface TeamMetrics {
  totalLeads: number;
  activeDeals: number;
  teamRevenue: number;
  conversionRate: number;
  teamMembers: number;
  avgResponseTime: string;
  monthlyGrowth: number;
  dealsThisMonth: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  leads: number;
  deals: number;
  revenue: number;
  performance: number;
}

export default function SalesManagerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<TeamMetrics | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useRibbonPage({
    context: "dashboard",
    enable: [
      "quickActions",
      "export",
      "profile",
      "notifications"
    ]
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulated team metrics for sales manager
      const mockMetrics: TeamMetrics = {
        totalLeads: 156,
        activeDeals: 24,
        teamRevenue: 485000,
        conversionRate: 32.5,
        teamMembers: 8,
        avgResponseTime: '2.3 hours',
        monthlyGrowth: 18.5,
        dealsThisMonth: 12
      };

      const mockTeam: TeamMember[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          role: 'Senior Sales Rep',
          leads: 23,
          deals: 5,
          revenue: 125000,
          performance: 94
        },
        {
          id: '2',
          name: 'Mike Rodriguez',
          role: 'Sales Rep',
          leads: 18,
          deals: 3,
          revenue: 87000,
          performance: 87
        },
        {
          id: '3',
          name: 'Emily Chen',
          role: 'Sales Rep',
          leads: 21,
          deals: 4,
          revenue: 102000,
          performance: 91
        },
        {
          id: '4',
          name: 'David Thompson',
          role: 'Junior Sales Rep',
          leads: 15,
          deals: 2,
          revenue: 56000,
          performance: 78
        }
      ];

      setMetrics(mockMetrics);
      setTeamMembers(mockTeam);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sales Manager Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.email} • {user?.tenantId?.replace('-', ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Your Organization'}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Leads</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.totalLeads}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-600 text-sm font-medium">+{metrics?.monthlyGrowth}% this month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.activeDeals}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-600 text-sm font-medium">{metrics?.dealsThisMonth} closed this month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${metrics?.teamRevenue?.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-600 text-sm font-medium">+{metrics?.monthlyGrowth}% growth</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics?.conversionRate}%</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-gray-600 text-sm font-medium">Avg Response: {metrics?.avgResponseTime}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Performance */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Team Performance</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{member.leads}</p>
                        <p className="text-gray-600">Leads</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">{member.deals}</p>
                        <p className="text-gray-600">Deals</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">${member.revenue.toLocaleString()}</p>
                        <p className="text-gray-600">Revenue</p>
                      </div>
                      <div className="text-center">
                        <p className={`font-medium ${member.performance >= 90 ? 'text-green-600' : member.performance >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {member.performance}%
                        </p>
                        <p className="text-gray-600">Score</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/tenant-salesmanager/leads')}
                  className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="text-center">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-900">Manage Leads</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/tenant-salesmanager/deals')}
                  className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <div className="text-center">
                    <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-900">View Deals</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/tenant-salesmanager/calendar')}
                  className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <div className="text-center">
                    <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-purple-900">Calendar</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/tenant-salesmanager/inventory')}
                  className="flex items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                >
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-yellow-900">Inventory</p>
                  </div>
                </button>
              </div>

              {/* Communication Tools */}
              <div className="mt-6 space-y-3">
                <button className="w-full flex items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <MessageSquare className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="text-gray-700 font-medium">Team Chat</span>
                </button>
                <button className="w-full flex items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Phone className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="text-gray-700 font-medium">Start Team Call</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}