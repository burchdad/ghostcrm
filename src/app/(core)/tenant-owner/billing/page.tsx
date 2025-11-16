"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import '@/styles/components/tenant-billing.css';
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
  RefreshCw,
  TrendingUp
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
  const { user, tenant } = useAuth();
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

  if (loading) {
    return (
      <I18nProvider>
        <ToastProvider>
          <div className="tenant-billing-container">
            <div className="tenant-billing-loading">
              <div className="tenant-billing-loading-title"></div>
              <div className="tenant-billing-loading-grid">
                <div className="tenant-billing-loading-card"></div>
                <div className="tenant-billing-loading-card"></div>
                <div className="tenant-billing-loading-card"></div>
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
        <div className="tenant-billing-container">
          {/* Header */}
          <div className="tenant-billing-header">
            <div>
              <h1 className="tenant-billing-title">Subscription Management</h1>
              <p className="tenant-billing-subtitle">Monitor usage, manage payments, and control your GhostCRM subscription</p>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="tenant-billing-upgrade-btn"
            >
              <TrendingUp className="h-5 w-5" />
              Upgrade Plan
            </button>
          </div>

          {/* Current Plan Card */}
          <div className="tenant-billing-card">
            <div className="tenant-billing-plan-header">
              <div>
                <h2 className="tenant-billing-plan-name">{billingInfo.currentPlan} Plan</h2>
                <p className="tenant-billing-plan-price">
                  ${billingInfo.planPrice}
                  <span className="tenant-billing-plan-cycle">/{billingInfo.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </p>
              </div>
              <div className="tenant-billing-next-billing">
                <p className="tenant-billing-next-label">Next billing date</p>
                <p className="tenant-billing-next-date">{new Date(billingInfo.nextBillingDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</p>
              </div>
            </div>
            
            <div className="tenant-billing-actions">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="tenant-billing-btn-primary"
              >
                Change Plan
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="tenant-billing-btn-secondary"
              >
                Update Payment
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="tenant-billing-card">
            <h3 className="tenant-billing-section-title">Payment Method</h3>
            <div className="tenant-billing-payment-method">
              <div className="tenant-billing-payment-info">
                <CreditCard className="tenant-billing-payment-icon" />
                <div>
                  <p className="tenant-billing-card-number">
                    •••• •••• •••• {billingInfo.paymentMethod.last4}
                  </p>
                  {billingInfo.paymentMethod.expiryDate && (
                    <p className="tenant-billing-card-expiry">Expires {billingInfo.paymentMethod.expiryDate}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="tenant-billing-edit-btn"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Usage Metrics */}
          <div className="tenant-billing-card">
            <h3 className="tenant-billing-section-title">Current Usage</h3>
            <div className="tenant-billing-usage-section">
              {/* Users */}
              <div className="tenant-billing-usage-item">
                <div className="tenant-billing-usage-header">
                  <span className="tenant-billing-usage-label">Team Members</span>
                  <span className="tenant-billing-usage-numbers">
                    {billingInfo.usageMetrics.usersUsed} of {billingInfo.usageMetrics.usersLimit} used
                  </span>
                </div>
                <div className="tenant-billing-usage-bar">
                  <div
                    className={`tenant-billing-usage-fill ${
                      getUsagePercentage(billingInfo.usageMetrics.usersUsed, billingInfo.usageMetrics.usersLimit) < 70 ? 'green' :
                      getUsagePercentage(billingInfo.usageMetrics.usersUsed, billingInfo.usageMetrics.usersLimit) < 90 ? 'yellow' : 'red'
                    }`}
                    style={{ width: `${getUsagePercentage(billingInfo.usageMetrics.usersUsed, billingInfo.usageMetrics.usersLimit)}%` }}
                  ></div>
                </div>
              </div>

              {/* Storage */}
              <div className="tenant-billing-usage-item">
                <div className="tenant-billing-usage-header">
                  <span className="tenant-billing-usage-label">Storage</span>
                  <span className="tenant-billing-usage-numbers">
                    {billingInfo.usageMetrics.storageUsed} GB of {billingInfo.usageMetrics.storageLimit} GB used
                  </span>
                </div>
                <div className="tenant-billing-usage-bar">
                  <div
                    className={`tenant-billing-usage-fill ${
                      getUsagePercentage(billingInfo.usageMetrics.storageUsed, billingInfo.usageMetrics.storageLimit) < 70 ? 'green' :
                      getUsagePercentage(billingInfo.usageMetrics.storageUsed, billingInfo.usageMetrics.storageLimit) < 90 ? 'yellow' : 'red'
                    }`}
                    style={{ width: `${getUsagePercentage(billingInfo.usageMetrics.storageUsed, billingInfo.usageMetrics.storageLimit)}%` }}
                  ></div>
                </div>
              </div>

              {/* API Calls */}
              <div className="tenant-billing-usage-item">
                <div className="tenant-billing-usage-header">
                  <span className="tenant-billing-usage-label">API Calls This Month</span>
                  <span className="tenant-billing-usage-numbers">
                    {billingInfo.usageMetrics.apiCalls.toLocaleString()} of {billingInfo.usageMetrics.apiLimit.toLocaleString()} used
                  </span>
                </div>
                <div className="tenant-billing-usage-bar">
                  <div
                    className={`tenant-billing-usage-fill ${
                      getUsagePercentage(billingInfo.usageMetrics.apiCalls, billingInfo.usageMetrics.apiLimit) < 70 ? 'green' :
                      getUsagePercentage(billingInfo.usageMetrics.apiCalls, billingInfo.usageMetrics.apiLimit) < 90 ? 'yellow' : 'red'
                    }`}
                    style={{ width: `${getUsagePercentage(billingInfo.usageMetrics.apiCalls, billingInfo.usageMetrics.apiLimit)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="tenant-billing-card">
            <div className="tenant-billing-invoices-header">
              <h3 className="tenant-billing-section-title">Recent Invoices</h3>
              <a href="#" className="tenant-billing-view-all-btn">
                View All Invoices
              </a>
            </div>
            <div className="tenant-billing-invoice-list">
              {billingInfo.invoices.map((invoice) => (
                <div key={invoice.id} className="tenant-billing-invoice-item">
                  <div className="tenant-billing-invoice-left">
                    <div className={`tenant-billing-invoice-status ${invoice.status}`}>
                      {invoice.status === 'paid' ? 
                        <CheckCircle /> :
                        invoice.status === 'pending' ?
                        <Clock /> :
                        <AlertTriangle />
                      }
                    </div>
                    <div className="tenant-billing-invoice-details">
                      <h4>Invoice #{invoice.id}</h4>
                      <p>{new Date(invoice.date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</p>
                    </div>
                  </div>
                  <div className="tenant-billing-invoice-right">
                    <span className="tenant-billing-invoice-amount">${invoice.amount}</span>
                    {invoice.downloadUrl && (
                      <button className="tenant-billing-download-btn">
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
        <div className="tenant-billing-coming-soon">
          <h4>Enhanced Billing Features</h4>
          <p>Advanced billing analytics and team management features launching Q1 2025</p>
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}

export default function BillingPage() {
  return <BillingSubscriptionPage />;
}