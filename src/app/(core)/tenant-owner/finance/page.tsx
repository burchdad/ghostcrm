"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/SupabaseAuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Target,
  Users,
  ShoppingCart,
  CreditCard
} from "lucide-react";

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  quarterlyRevenue: number;
  yearlyRevenue: number;
  revenueGrowth: number;
  averageDealValue: number;
  totalDeals: number;
  conversionRate: number;
  topSalesperson: string;
  monthlyExpenses: number;
  netProfit: number;
  profitMargin: number;
}

interface SalesData {
  month: string;
  revenue: number;
  deals: number;
  expenses: number;
  profit: number;
}

function FinancialOverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    quarterlyRevenue: 0,
    yearlyRevenue: 0,
    revenueGrowth: 0,
    averageDealValue: 0,
    totalDeals: 0,
    conversionRate: 0,
    topSalesperson: '',
    monthlyExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
  });
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [refreshing, setRefreshing] = useState(false);

  useRibbonPage({
    context: "analytics",
    enable: [
      "quickActions",
      "export",
      "profile",
      "notifications",
      "theme",
      "language"
    ],
    disable: []
  });

  // Redirect non-owners
  useEffect(() => {
    if (!loading && user && user.role !== 'owner') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Load financial data
  useEffect(() => {
    fetchFinancialData();
  }, [selectedPeriod]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      const [metricsRes, salesRes] = await Promise.all([
        fetch(`/api/owner/financial-metrics?period=${selectedPeriod}`).catch(() => null),
        fetch(`/api/owner/sales-data?period=${selectedPeriod}`).catch(() => null)
      ]);

      if (metricsRes && metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.metrics);
      } else {
        // Mock data for demo
        setMetrics({
          totalRevenue: 1250000,
          monthlyRevenue: 125000,
          quarterlyRevenue: 375000,
          yearlyRevenue: 1250000,
          revenueGrowth: 12.5,
          averageDealValue: 28500,
          totalDeals: 45,
          conversionRate: 68,
          topSalesperson: 'Sarah Johnson',
          monthlyExpenses: 85000,
          netProfit: 40000,
          profitMargin: 32,
        });
      }

      if (salesRes && salesRes.ok) {
        const data = await salesRes.json();
        setSalesData(data.salesData);
      } else {
        // Mock sales data
        setSalesData([
          { month: 'Jan', revenue: 98000, deals: 38, expenses: 78000, profit: 20000 },
          { month: 'Feb', revenue: 105000, deals: 42, expenses: 82000, profit: 23000 },
          { month: 'Mar', revenue: 112000, deals: 45, expenses: 85000, profit: 27000 },
          { month: 'Apr', revenue: 118000, deals: 48, expenses: 88000, profit: 30000 },
          { month: 'May', revenue: 125000, deals: 52, expenses: 90000, profit: 35000 },
          { month: 'Jun', revenue: 132000, deals: 55, expenses: 92000, profit: 40000 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFinancialData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Financial Overview...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'owner') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Financial Overview</h1>
                <p className="text-sm text-gray-500">Revenue analytics and financial insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.monthlyRevenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +{metrics.revenueGrowth}% from last month
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.netProfit)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-blue-600 font-medium">
                {metrics.profitMargin}% profit margin
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Deal Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.averageDealValue)}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-purple-600 font-medium">
                {metrics.totalDeals} deals this month
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.conversionRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-indigo-600 font-medium">
                Above industry average
              </span>
            </div>
          </div>
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Profit</span>
                </div>
              </div>
            </div>
            
            {/* Simple chart representation */}
            <div className="space-y-4">
              {salesData.map((data, index) => (
                <div key={data.month} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-600">{data.month}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div 
                      className="bg-blue-500 h-6 rounded-full" 
                      style={{ width: `${(data.revenue / 140000) * 100}%` }}
                    ></div>
                    <div 
                      className="absolute top-0 bg-green-500 h-6 rounded-full opacity-70" 
                      style={{ width: `${(data.profit / 140000) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-20 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(data.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="space-y-6">
            {/* Top Performer */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performer</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{metrics.topSalesperson}</p>
                  <p className="text-sm text-gray-500">Sales Manager</p>
                  <p className="text-sm font-medium text-green-600">
                    {formatCurrency(95000)} this month
                  </p>
                </div>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Expenses</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Salaries</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(45000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Inventory</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(25000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Marketing</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(8000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Operations</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(7000)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Total</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(metrics.monthlyExpenses)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <Download className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Download P&L Report</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-700">View Sales Analytics</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Schedule Review Meeting</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FinancialOverview() {
  return (
    <I18nProvider>
      <ToastProvider>
        <FinancialOverviewPage />
      </ToastProvider>
    </I18nProvider>
  );
}