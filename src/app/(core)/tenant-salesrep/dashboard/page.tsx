"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Car,
  Clock,
  Target,
  Award,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  ArrowUpRight
} from "lucide-react";
import { useI18n } from "@/components/utils/I18nProvider";

interface DashboardMetrics {
  personalMetrics: {
    monthlyGoal: number;
    achieved: number;
    percentage: number;
    dealsThisMonth: number;
    averageDealValue: number;
    conversionRate: number;
    rank: number;
    totalTeamMembers: number;
  };
  activities: {
    scheduledToday: number;
    callsToday: number;
    emailsSent: number;
    leadsAssigned: number;
    followUpsDue: number;
  };
  recentDeals: Array<{
    id: string;
    customerName: string;
    vehicle: string;
    value: number;
    status: string;
    stage: string;
    lastActivity: string;
  }>;
  upcomingActivities: Array<{
    id: string;
    type: 'call' | 'meeting' | 'demo' | 'follow-up';
    title: string;
    time: string;
    customer: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export default function TenantSalesRepDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useI18n();

  // Role-based access control
  useEffect(() => {
    if (user && !['sales-rep', 'admin', 'manager'].includes(user.role)) {
      console.log("🚨 [TENANT_SALES_REP_DASHBOARD] Access denied - redirecting");
      router.push('/');
    }
  }, [user, router]);

  useRibbonPage({
    context: "dashboard",
    enable: ["quickActions", "export", "profile", "notifications"],
    disable: ["saveLayout", "aiTools", "developer", "billing"]
  });

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user has proper access
  if (user && !['sales-rep', 'admin', 'manager'].includes(user.role)) {
    return null;
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock individual sales rep metrics
      const mockMetrics: DashboardMetrics = {
        personalMetrics: {
          monthlyGoal: 15,
          achieved: 12,
          percentage: 80,
          dealsThisMonth: 12,
          averageDealValue: 28500,
          conversionRate: 24,
          rank: 2,
          totalTeamMembers: 5
        },
        activities: {
          scheduledToday: 6,
          callsToday: 8,
          emailsSent: 12,
          leadsAssigned: 23,
          followUpsDue: 5
        },
        recentDeals: [
          {
            id: '1',
            customerName: 'Jennifer Martinez',
            vehicle: '2024 Honda Accord EX',
            value: 32500,
            status: 'closed-won',
            stage: 'Delivery Scheduled',
            lastActivity: '2 hours ago'
          },
          {
            id: '2',
            customerName: 'Robert Chen',
            vehicle: '2024 Toyota Camry LE',
            value: 29800,
            status: 'negotiation',
            stage: 'Price Negotiation',
            lastActivity: '4 hours ago'
          },
          {
            id: '3',
            customerName: 'Sarah Williams',
            vehicle: '2024 Nissan Altima SR',
            value: 27200,
            status: 'proposal',
            stage: 'Proposal Sent',
            lastActivity: '1 day ago'
          }
        ],
        upcomingActivities: [
          {
            id: '1',
            type: 'call',
            title: 'Follow-up call with Robert Chen',
            time: '2:00 PM',
            customer: 'Robert Chen',
            priority: 'high'
          },
          {
            id: '2',
            type: 'demo',
            title: 'Vehicle demonstration',
            time: '3:30 PM',
            customer: 'Lisa Thompson',
            priority: 'medium'
          },
          {
            id: '3',
            type: 'meeting',
            title: 'Financing discussion',
            time: '4:45 PM',
            customer: 'Mike Johnson',
            priority: 'high'
          }
        ]
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'closed-won': 'text-green-600 bg-green-100',
      'negotiation': 'text-yellow-600 bg-yellow-100',
      'proposal': 'text-blue-600 bg-blue-100',
      'follow-up': 'text-purple-600 bg-purple-100',
      'lost': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'high': 'border-red-500 bg-red-50',
      'medium': 'border-yellow-500 bg-yellow-50',
      'low': 'border-green-500 bg-green-50'
    };
    return colors[priority] || 'border-gray-500 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your performance and manage your sales activities</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.push('/tenant-salesrep/deals')}>
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </Button>
          <Button variant="outline" onClick={() => router.push('/tenant-salesrep/calendar')}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Monthly Goal Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Goal</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.personalMetrics.achieved}/{metrics.personalMetrics.monthlyGoal}
                </p>
                <p className="ml-2 text-sm text-green-600">
                  {metrics.personalMetrics.percentage}%
                </p>
              </div>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${metrics.personalMetrics.percentage}%` }}
            ></div>
          </div>
        </Card>

        {/* Average Deal Value */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Deal Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${metrics.personalMetrics.averageDealValue.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% vs last month
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        {/* Conversion Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.personalMetrics.conversionRate}%
              </p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5% vs last month
              </p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        {/* Team Ranking */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Rank</p>
              <p className="text-2xl font-bold text-gray-900">
                #{metrics.personalMetrics.rank} of {metrics.personalMetrics.totalTeamMembers}
              </p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                Improved from #3
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Activities Overview */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Activities</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{metrics.activities.scheduledToday}</p>
            <p className="text-sm text-gray-600">Scheduled</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Phone className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{metrics.activities.callsToday}</p>
            <p className="text-sm text-gray-600">Calls Made</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Mail className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{metrics.activities.emailsSent}</p>
            <p className="text-sm text-gray-600">Emails Sent</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <Users className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{metrics.activities.leadsAssigned}</p>
            <p className="text-sm text-gray-600">Active Leads</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <Clock className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{metrics.activities.followUpsDue}</p>
            <p className="text-sm text-gray-600">Follow-ups Due</p>
          </div>
        </div>
      </Card>

      {/* Recent Deals and Upcoming Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deals */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Deals</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/tenant-salesrep/deals')}
            >
              View All <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-4">
            {metrics.recentDeals.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{deal.customerName}</h3>
                  <p className="text-sm text-gray-600">{deal.vehicle}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                      {deal.stage}
                    </span>
                    <span className="text-xs text-gray-500">{deal.lastActivity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${deal.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Activities */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Activities</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/tenant-salesrep/calendar')}
            >
              View Calendar <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-4">
            {metrics.upcomingActivities.map((activity) => (
              <div key={activity.id} className={`p-3 rounded-lg border-l-4 ${getPriorityColor(activity.priority)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{activity.title}</h3>
                    <p className="text-sm text-gray-600">{activity.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{activity.time}</p>
                    <p className="text-xs text-gray-500 capitalize">{activity.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex-col"
            onClick={() => router.push('/tenant-salesrep/deals/new')}
          >
            <Plus className="w-6 h-6 mb-2" />
            Add Deal
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col"
            onClick={() => router.push('/tenant-salesrep/calendar')}
          >
            <Calendar className="w-6 h-6 mb-2" />
            Schedule Meeting
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col"
            onClick={() => router.push('/tenant-salesrep/inventory')}
          >
            <Car className="w-6 h-6 mb-2" />
            Browse Inventory
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col"
            onClick={() => window.location.href = 'tel:'}
          >
            <Phone className="w-6 h-6 mb-2" />
            Make Call
          </Button>
        </div>
      </Card>
    </div>
  );
}