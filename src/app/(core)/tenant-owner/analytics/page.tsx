"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/SupabaseAuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  PieChart,
  DollarSign,
  Users,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Award,
  Activity,
  Zap
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    revenueGrowth: number;
    totalDeals: number;
    dealsGrowth: number;
    conversionRate: number;
    conversionGrowth: number;
    averageDealValue: number;
    dealValueGrowth: number;
  };
  salesPerformance: {
    monthlyRevenue: Array<{
      month: string;
      revenue: number;
      deals: number;
      target: number;
    }>;
    topPerformers: Array<{
      id: string;
      name: string;
      revenue: number;
      deals: number;
      conversionRate: number;
    }>;
    salesFunnel: Array<{
      stage: string;
      count: number;
      value: number;
      conversionRate: number;
    }>;
  };
  customerAnalytics: {
    acquisitionSources: Array<{
      source: string;
      customers: number;
      percentage: number;
      revenue: number;
    }>;
    customerLifetime: {
      averageValue: number;
      averageLifespan: number;
      retentionRate: number;
    };
    segmentation: Array<{
      segment: string;
      customers: number;
      revenue: number;
      avgValue: number;
    }>;
  };
  operationalMetrics: {
    responseTime: {
      average: number;
      target: number;
      trend: number;
    };
    teamProductivity: {
      callsPerDay: number;
      meetingsScheduled: number;
      followUpRate: number;
    };
    inventoryTurnover: {
      rate: number;
      daysToSell: number;
      topItems: Array<{
        item: string;
        sales: number;
        revenue: number;
      }>;
    };
  };
}

function BusinessAnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    overview: {
      totalRevenue: 2847500,
      revenueGrowth: 18.5,
      totalDeals: 347,
      dealsGrowth: 12.3,
      conversionRate: 23.8,
      conversionGrowth: -2.1,
      averageDealValue: 8210,
      dealValueGrowth: 5.7
    },
    salesPerformance: {
      monthlyRevenue: [
        { month: 'Jan', revenue: 245000, deals: 32, target: 250000 },
        { month: 'Feb', revenue: 267000, deals: 35, target: 260000 },
        { month: 'Mar', revenue: 298000, deals: 41, target: 280000 },
        { month: 'Apr', revenue: 312000, deals: 38, target: 300000 },
        { month: 'May', revenue: 289000, deals: 36, target: 310000 },
        { month: 'Jun', revenue: 356000, deals: 43, target: 320000 }
      ],
      topPerformers: [
        { id: '1', name: 'Sarah Johnson', revenue: 125000, deals: 18, conversionRate: 32.5 },
        { id: '2', name: 'Mike Chen', revenue: 98000, deals: 15, conversionRate: 28.7 },
        { id: '3', name: 'Emily Rodriguez', revenue: 87000, deals: 13, conversionRate: 31.2 }
      ],
      salesFunnel: [
        { stage: 'Leads', count: 1450, value: 11920000, conversionRate: 100 },
        { stage: 'Qualified', count: 725, value: 5960000, conversionRate: 50 },
        { stage: 'Proposal', count: 290, value: 2384000, conversionRate: 40 },
        { stage: 'Negotiation', count: 145, value: 1192000, conversionRate: 50 },
        { stage: 'Closed Won', count: 87, value: 714400, conversionRate: 60 }
      ]
    },
    customerAnalytics: {
      acquisitionSources: [
        { source: 'Website', customers: 245, percentage: 42, revenue: 1250000 },
        { source: 'Referrals', customers: 156, percentage: 27, revenue: 890000 },
        { source: 'Social Media', customers: 98, percentage: 17, revenue: 456000 },
        { source: 'Cold Outreach', customers: 67, percentage: 11, revenue: 234000 },
        { source: 'Events', customers: 18, percentage: 3, revenue: 98000 }
      ],
      customerLifetime: {
        averageValue: 12500,
        averageLifespan: 24,
        retentionRate: 85.2
      },
      segmentation: [
        { segment: 'High Value', customers: 45, revenue: 1250000, avgValue: 27777 },
        { segment: 'Medium Value', customers: 234, revenue: 1678000, avgValue: 7170 },
        { segment: 'Low Value', customers: 312, revenue: 468000, avgValue: 1500 }
      ]
    },
    operationalMetrics: {
      responseTime: {
        average: 2.3,
        target: 2.0,
        trend: -0.5
      },
      teamProductivity: {
        callsPerDay: 47,
        meetingsScheduled: 23,
        followUpRate: 78.5
      },
      inventoryTurnover: {
        rate: 4.2,
        daysToSell: 87,
        topItems: [
          { item: '2024 Honda Civic', sales: 23, revenue: 598000 },
          { item: '2023 Toyota Camry', sales: 19, revenue: 532000 },
          { item: '2024 Ford F-150', sales: 16, revenue: 720000 }
        ]
      }
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('6m');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useRibbonPage({
    context: "analytics",
    enable: [
      "export",
      "profile",
      "notifications",
      "theme",
      "language",
      "automation"
    ],
    disable: []
  });

  // Redirect non-tenant owners
  useEffect(() => {
    if (!loading && user) {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isSubdomain = hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname.includes('.localhost');
      const isTenantOwner = user.role === 'owner' && isSubdomain;
      
      if (!isTenantOwner) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  // Fetch analytics data
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/tenant-owner/analytics?range=${dateRange}`);
        // const data = await response.json();
        // setAnalytics(data);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />;
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
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
                  <p className="text-gray-600 mt-1">Comprehensive insights into your business performance</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1m">Last Month</option>
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </button>
            </div>
          </div>

          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.overview.totalRevenue)}</p>
                  <p className={`text-sm mt-1 flex items-center gap-1 ${getGrowthColor(analytics.overview.revenueGrowth)}`}>
                    {getGrowthIcon(analytics.overview.revenueGrowth)}
                    {formatPercentage(analytics.overview.revenueGrowth)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Deals</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalDeals.toLocaleString()}</p>
                  <p className={`text-sm mt-1 flex items-center gap-1 ${getGrowthColor(analytics.overview.dealsGrowth)}`}>
                    {getGrowthIcon(analytics.overview.dealsGrowth)}
                    {formatPercentage(analytics.overview.dealsGrowth)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.conversionRate}%</p>
                  <p className={`text-sm mt-1 flex items-center gap-1 ${getGrowthColor(analytics.overview.conversionGrowth)}`}>
                    {getGrowthIcon(analytics.overview.conversionGrowth)}
                    {formatPercentage(analytics.overview.conversionGrowth)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Deal Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.overview.averageDealValue)}</p>
                  <p className={`text-sm mt-1 flex items-center gap-1 ${getGrowthColor(analytics.overview.dealValueGrowth)}`}>
                    {getGrowthIcon(analytics.overview.dealValueGrowth)}
                    {formatPercentage(analytics.overview.dealValueGrowth)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Sales Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Chart */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue vs Target</h3>
              <div className="space-y-4">
                {analytics.salesPerformance.monthlyRevenue.map((month) => (
                  <div key={month.month} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium text-gray-600">{month.month}</div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{formatCurrency(month.revenue)}</span>
                        <span className="text-gray-500">Target: {formatCurrency(month.target)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${month.revenue >= month.target ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min((month.revenue / month.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{month.deals}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
              <div className="space-y-3">
                {analytics.salesPerformance.topPerformers.map((performer, index) => (
                  <div key={performer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{performer.name}</p>
                        <p className="text-sm text-gray-500">{performer.deals} deals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(performer.revenue)}</p>
                      <p className="text-sm text-green-600">{performer.conversionRate}% conversion</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sales Funnel */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Funnel Analysis</h3>
            <div className="grid grid-cols-5 gap-4">
              {analytics.salesPerformance.salesFunnel.map((stage, index) => (
                <div key={stage.stage} className="text-center">
                  <div className={`relative h-24 mx-auto mb-3 ${
                    index === 0 ? 'w-full' :
                    index === 1 ? 'w-4/5' :
                    index === 2 ? 'w-3/5' :
                    index === 3 ? 'w-2/5' : 'w-1/5'
                  } bg-blue-500 flex items-center justify-center text-white font-bold rounded`}>
                    {stage.count}
                  </div>
                  <h4 className="font-medium text-gray-900">{stage.stage}</h4>
                  <p className="text-sm text-gray-500">{formatCurrency(stage.value)}</p>
                  <p className="text-xs text-green-600">{stage.conversionRate}% conversion</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Acquisition Sources */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Acquisition Sources</h3>
              <div className="space-y-3">
                {analytics.customerAnalytics.acquisitionSources.map((source) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full bg-blue-500"
                        style={{ backgroundColor: `hsl(${source.percentage * 3.6}, 70%, 50%)` }}
                      ></div>
                      <span className="font-medium text-gray-900">{source.source}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{source.customers} customers ({source.percentage}%)</p>
                      <p className="text-sm text-gray-500">{formatCurrency(source.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Lifetime Value */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Lifetime Metrics</h3>
              <div className="space-y-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.customerAnalytics.customerLifetime.averageValue)}</p>
                  <p className="text-sm text-gray-600">Average Lifetime Value</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-xl font-bold text-gray-900">{analytics.customerAnalytics.customerLifetime.averageLifespan}</p>
                    <p className="text-xs text-gray-600">Months Avg Lifespan</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-xl font-bold text-green-600">{analytics.customerAnalytics.customerLifetime.retentionRate}%</p>
                    <p className="text-xs text-gray-600">Retention Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operational Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{analytics.operationalMetrics.responseTime.average}h</p>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className={`text-xs mt-1 ${analytics.operationalMetrics.responseTime.trend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.operationalMetrics.responseTime.trend < 0 ? '↓' : '↑'} {Math.abs(analytics.operationalMetrics.responseTime.trend)}h vs target
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{analytics.operationalMetrics.teamProductivity.callsPerDay}</p>
                <p className="text-sm text-gray-600">Calls Per Day</p>
                <p className="text-xs text-gray-500 mt-1">{analytics.operationalMetrics.teamProductivity.meetingsScheduled} meetings scheduled</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{analytics.operationalMetrics.inventoryTurnover.rate}x</p>
                <p className="text-sm text-gray-600">Inventory Turnover</p>
                <p className="text-xs text-gray-500 mt-1">{analytics.operationalMetrics.inventoryTurnover.daysToSell} avg days to sell</p>
              </div>
            </div>
          </div>
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}

export default function BusinessAnalytics() {
  return <BusinessAnalyticsPage />;
}