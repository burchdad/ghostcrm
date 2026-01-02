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
  Calendar, 
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
  Plus,
  Trash2,
  Edit,
  RefreshCw
} from "lucide-react";

interface BillingInfo {
  currentPlan: string;
  planPrice: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  paymentMethod: {
    type: 'card' | 'bank';
    last4: string;
    expiryDate?: string;
  };
  usageMetrics: {
    usersUsed: number;
    usersLimit: number;
    storageUsed: number; // GB
    storageLimit: number; // GB
    apiCalls: number;
    apiLimit: number;
  };
  invoices: Array<{
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    downloadUrl?: string;
  }>;
}

function BillingSubscriptionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    currentPlan: 'Professional',
    planPrice: 99,
    billingCycle: 'monthly',
    nextBillingDate: '2025-12-05',
    paymentMethod: {
      type: 'card',
      last4: '4242',
      expiryDate: '12/26'
    },
    usageMetrics: {
      usersUsed: 8,
      usersLimit: 25,
      storageUsed: 12.5,
      storageLimit: 100,
      apiCalls: 8950,
      apiLimit: 10000
    },
    invoices: [
      {
        id: 'inv_001',
        date: '2025-11-05',
        amount: 99,
        status: 'paid',
        downloadUrl: '#'
      },
      {
        id: 'inv_002',
        date: '2025-10-05',
        amount: 99,
        status: 'paid',
        downloadUrl: '#'
      }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useRibbonPage({
    context: "billing",
    enable: [
      "quickActions",
      "save",
      "export",
      "profile",
      "notifications",
      "theme",
      "language"
    ],
    disable: []
  });

  // Redirect non-owners to regular dashboard
  useEffect(() => {
    if (!loading && user && user.role !== 'owner') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Fetch billing data
  useEffect(() => {
    async function fetchBillingData() {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/tenant-owner/billing');
        // const data = await response.json();
        // setBillingInfo(data);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === 'owner') {
      fetchBillingData();
    }
  }, [user]);

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <I18nProvider>
        <ToastProvider>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
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
              <h1 className="text-3xl font-bold text-gray-900">Billing & Subscriptions</h1>
              <p className="text-gray-600 mt-1">Manage your subscription, billing, and usage</p>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Upgrade Plan
            </button>
          </div>

          {/* Current Plan Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{billingInfo.currentPlan} Plan</h2>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  ${billingInfo.planPrice}
                  <span className="text-lg text-gray-500">/{billingInfo.billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Next billing date</p>
                <p className="font-medium text-gray-900">{new Date(billingInfo.nextBillingDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Plan
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Update Payment
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    **** **** **** {billingInfo.paymentMethod.last4}
                  </p>
                  {billingInfo.paymentMethod.expiryDate && (
                    <p className="text-sm text-gray-500">Expires {billingInfo.paymentMethod.expiryDate}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Usage Metrics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage This Month</h3>
            <div className="space-y-6">
              {/* Users */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Team Members</span>
                  <span className="text-sm text-gray-500">
                    {billingInfo.usageMetrics.usersUsed} / {billingInfo.usageMetrics.usersLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(billingInfo.usageMetrics.usersUsed, billingInfo.usageMetrics.usersLimit))}`}
                    style={{ width: `${getUsagePercentage(billingInfo.usageMetrics.usersUsed, billingInfo.usageMetrics.usersLimit)}%` }}
                  ></div>
                </div>
              </div>

              {/* Storage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Storage</span>
                  <span className="text-sm text-gray-500">
                    {billingInfo.usageMetrics.storageUsed} GB / {billingInfo.usageMetrics.storageLimit} GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(billingInfo.usageMetrics.storageUsed, billingInfo.usageMetrics.storageLimit))}`}
                    style={{ width: `${getUsagePercentage(billingInfo.usageMetrics.storageUsed, billingInfo.usageMetrics.storageLimit)}%` }}
                  ></div>
                </div>
              </div>

              {/* API Calls */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">API Calls</span>
                  <span className="text-sm text-gray-500">
                    {billingInfo.usageMetrics.apiCalls.toLocaleString()} / {billingInfo.usageMetrics.apiLimit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(billingInfo.usageMetrics.apiCalls, billingInfo.usageMetrics.apiLimit))}`}
                    style={{ width: `${getUsagePercentage(billingInfo.usageMetrics.apiCalls, billingInfo.usageMetrics.apiLimit)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {billingInfo.invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100' :
                      invoice.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {invoice.status === 'paid' ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        invoice.status === 'pending' ?
                        <Clock className="h-4 w-4 text-yellow-600" /> :
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Invoice #{invoice.id}</p>
                      <p className="text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">${invoice.amount}</span>
                    {invoice.downloadUrl && (
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coming Soon Note */}
        <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-200 rounded-lg p-4 max-w-sm">
          <p className="text-sm text-blue-800 font-medium">Billing & Subscriptions</p>
          <p className="text-xs text-blue-600 mt-1">Full billing integration coming Q1 2025</p>
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}

export default function BillingPage() {
  return <BillingSubscriptionPage />;
}