"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/SupabaseAuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users,
  Building,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Eye,
  Plus,
  RefreshCw,
  Download,
  Filter,
  Search
} from "lucide-react";

interface StripeMetrics {
  totalRevenue: number;
  monthlyRecurring: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  processingFees: number;
  pendingPayouts: number;
  failedPayments: number;
  recentTransactions: Array<{
    id: string;
    tenant: string;
    amount: number;
    status: 'succeeded' | 'pending' | 'failed';
    type: 'subscription' | 'one-time' | 'refund';
    timestamp: string;
    customer: string;
  }>;
  subscriptionPlans: Array<{
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
    subscribers: number;
    revenue: number;
    active: boolean;
  }>;
  payoutSchedule: {
    nextPayout: string;
    amount: number;
    frequency: string;
  };
}

function StripeManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<StripeMetrics>({
    totalRevenue: 125420,
    monthlyRecurring: 89750,
    activeSubscriptions: 42,
    churnRate: 3.2,
    averageRevenuePerUser: 2136,
    processingFees: 3890,
    pendingPayouts: 28560,
    failedPayments: 3,
    recentTransactions: [
      {
        id: 'txn_1234567890',
        tenant: 'Metro Auto Group',
        amount: 2499,
        status: 'succeeded',
        type: 'subscription',
        timestamp: '2025-11-05T10:30:00Z',
        customer: 'cus_MetroAuto123'
      },
      {
        id: 'txn_0987654321',
        tenant: 'City Motors',
        amount: 999,
        status: 'pending',
        type: 'subscription',
        timestamp: '2025-11-05T09:15:00Z',
        customer: 'cus_CityMotors456'
      },
      {
        id: 'txn_5555666677',
        tenant: 'Quick Sales',
        amount: 499,
        status: 'failed',
        type: 'subscription',
        timestamp: '2025-11-05T08:45:00Z',
        customer: 'cus_QuickSales789'
      }
    ],
    subscriptionPlans: [
      {
        id: 'plan_professional',
        name: 'Professional',
        price: 99,
        interval: 'month',
        subscribers: 25,
        revenue: 2475,
        active: true
      },
      {
        id: 'plan_enterprise',
        name: 'Enterprise',
        price: 249,
        interval: 'month',
        subscribers: 12,
        revenue: 2988,
        active: true
      },
      {
        id: 'plan_starter',
        name: 'Starter',
        price: 49,
        interval: 'month',
        subscribers: 5,
        revenue: 245,
        active: true
      }
    ],
    payoutSchedule: {
      nextPayout: '2025-11-07',
      amount: 28560,
      frequency: 'weekly'
    }
  });
  const [loading, setLoading] = useState(true);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useRibbonPage({
    context: "stripe",
    enable: [
      "quickActions",
      "export",
      "profile",
      "notifications",
      "theme",
      "language",
      "automation"
    ],
    disable: []
  });

  // Redirect non-software owners
  useEffect(() => {
    if (!loading && user) {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isSubdomain = hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname.includes('.localhost');
      const isSoftwareOwner = user.role === 'owner' && !isSubdomain;
      
      if (!isSoftwareOwner) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  // Fetch Stripe metrics
  useEffect(() => {
    async function fetchStripeMetrics() {
      try {
        setLoading(true);
        // TODO: Replace with actual Stripe API calls
        // const response = await fetch('/api/owner/stripe-metrics');
        // const data = await response.json();
        // setMetrics(data);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error fetching Stripe metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStripeMetrics();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription': return <RefreshCw className="h-4 w-4" />;
      case 'one-time': return <DollarSign className="h-4 w-4" />;
      case 'refund': return <TrendingDown className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
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
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Stripe Management</h1>
                  <p className="text-gray-600 mt-1">Payment processing and subscription management</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </button>
              <button
                onClick={() => setShowCreatePlan(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Plan
              </button>
            </div>
          </div>

          {/* Revenue Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${metrics.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12% this month
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Recurring</p>
                  <p className="text-2xl font-bold text-gray-900">${metrics.monthlyRecurring.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">{metrics.activeSubscriptions} active subscriptions</p>
                </div>
                <RefreshCw className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Revenue Per User</p>
                  <p className="text-2xl font-bold text-gray-900">${metrics.averageRevenuePerUser.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">Churn rate: {metrics.churnRate}%</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Payout</p>
                  <p className="text-2xl font-bold text-gray-900">${metrics.payoutSchedule.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">{new Date(metrics.payoutSchedule.nextPayout).toLocaleDateString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Subscription Plans */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Subscription Plans</h3>
              <button 
                onClick={() => setShowCreatePlan(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Plan
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metrics.subscriptionPlans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{plan.name}</h4>
                      <p className="text-2xl font-bold text-blue-600">${plan.price}</p>
                      <p className="text-sm text-gray-500">per {plan.interval}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${plan.active ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}`}>
                      {plan.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subscribers</span>
                      <span className="font-medium">{plan.subscribers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Revenue</span>
                      <span className="font-medium">${plan.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      Edit
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="all">All Status</option>
                    <option value="succeeded">Succeeded</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {metrics.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getStatusColor(transaction.status)}`}>
                      {getTypeIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.tenant}</p>
                      <p className="text-sm text-gray-500">{transaction.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${transaction.amount.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Issues Alert */}
          {metrics.failedPayments > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Payment Issues Detected</p>
                  <p className="text-sm text-red-600">
                    {metrics.failedPayments} failed payments require attention. 
                    <button className="ml-1 underline hover:no-underline">
                      Review now
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}

export default function StripeManagement() {
  return <StripeManagementPage />;
}