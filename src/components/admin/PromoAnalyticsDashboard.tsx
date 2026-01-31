'use client';

/**
 * Promo Code Analytics Dashboard
 * Comprehensive analytics interface for promo code performance tracking
 * Only accessible to software owners
 */

import { useState, useEffect } from 'react';
import { Loader2, RefreshCw, TrendingUp, TrendingDown, DollarSign, Users, 
         Target, Percent, Calendar, BarChart3, PieChart, Award } from 'lucide-react';

interface AnalyticsSummary {
  totalCodes: number;
  activeCodes: number;
  totalUsage: number;
  totalRevenue: number;
  totalDiscountGiven: number;
  avgRoiPercentage: number;
  topPerformingCode: string | null;
  conversionRate: number;
}

interface UsageTrend {
  date: string;
  usageCount: number;
  revenue: number;
  discount: number;
  uniqueCodesUsed: number;
}

interface TopCode {
  code: string;
  description: string;
  usageCount: number;
  totalRevenue: number;
  totalDiscount: number;
  roiPercentage: number;
  usageRatePercentage: number;
}

interface RevenueAnalysis {
  byPlan: Record<string, {
    revenue: number;
    discount: number;
    count: number;
    avgRevenue: number;
    avgDiscount: number;
  }>;
  totalPlans: number;
  analysisPeriodDays: number;
}

export default function PromoAnalyticsDashboard() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState(30);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trends, setTrends] = useState<UsageTrend[]>([]);
  const [topCodes, setTopCodes] = useState<TopCode[]>([]);
  const [revenueAnalysis, setRevenueAnalysis] = useState<RevenueAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  const fetchAnalytics = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);

    try {
      // Fetch all analytics data in parallel
      const [summaryRes, trendsRes, topCodesRes, revenueRes] = await Promise.all([
        fetch(`/api/owner/promo-analytics?type=summary&days=${timeRange}`),
        fetch(`/api/owner/promo-analytics?type=trends&days=${timeRange}`),
        fetch(`/api/owner/promo-analytics?type=top-codes&limit=5&orderBy=roi_percentage`),
        fetch(`/api/owner/promo-analytics?type=revenue-analysis&days=${timeRange}`)
      ]);

      const [summaryData, trendsData, topCodesData, revenueData] = await Promise.all([
        summaryRes.json(),
        trendsRes.json(),
        topCodesRes.json(),
        revenueRes.json()
      ]);

      if (summaryData.success) setSummary(summaryData.summary);
      if (trendsData.success) setTrends(trendsData.trends || []);
      if (topCodesData.success) setTopCodes(topCodesData.topCodes || []);
      if (revenueData.success) setRevenueAnalysis(revenueData.revenueAnalysis);

      if (!summaryData.success || !trendsData.success || !topCodesData.success || !revenueData.success) {
        setError('Some analytics data failed to load');
      }

    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh analytics (triggers materialized view refresh)
  const refreshAnalytics = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/owner/promo-analytics', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchAnalytics(false);
      } else {
        setError('Failed to refresh analytics');
      }
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Failed to refresh analytics');
    } finally {
      setRefreshing(false);
    }
  };

  // Load data on mount and time range change
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format percentage
  const formatPercent = (percent: number, decimals = 1) => {
    return `${percent.toFixed(decimals)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => fetchAnalytics()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promo Code Analytics</h1>
          <p className="text-gray-600">Performance insights and ROI tracking</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={refreshAnalytics}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Codes</p>
                <p className="text-2xl font-bold text-gray-900">{summary.activeCodes}</p>
                <p className="text-xs text-gray-500">of {summary.totalCodes} total</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalRevenue)}</p>
                <p className="text-xs text-gray-500">{summary.totalUsage} uses</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Percent className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average ROI</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercent(summary.avgRoiPercentage)}</p>
                <p className="text-xs text-gray-500">across all codes</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Code</p>
                <p className="text-lg font-bold text-gray-900">{summary.topPerformingCode || 'None'}</p>
                <p className="text-xs text-gray-500">{formatPercent(summary.conversionRate)} conversion</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Usage Trends Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Usage Trends</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          {trends.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {trends.slice(-10).map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{new Date(trend.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{trend.uniqueCodesUsed} unique codes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{trend.usageCount} uses</p>
                    <p className="text-sm text-green-600">{formatCurrency(trend.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No usage data available</p>
          )}
        </div>

        {/* Revenue Analysis */}
        {revenueAnalysis && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue by Plan</h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(revenueAnalysis.byPlan).map(([plan, stats]) => (
                <div key={plan} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{plan}</p>
                    <p className="text-sm text-gray-600">{stats.count} subscriptions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(stats.revenue)}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(stats.avgRevenue)} avg</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Performing Codes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Codes</h3>
        </div>
        
        <div className="p-6">
          {topCodes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topCodes.map((code, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{code.code}</p>
                          <p className="text-sm text-gray-500">{code.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {code.usageCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {formatCurrency(code.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {formatCurrency(code.totalDiscount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {code.roiPercentage >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <span className={`text-sm font-medium ${code.roiPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercent(code.roiPercentage)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(code.usageRatePercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{formatPercent(code.usageRatePercentage)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No promo code performance data available</p>
          )}
        </div>
      </div>
    </div>
  );
}