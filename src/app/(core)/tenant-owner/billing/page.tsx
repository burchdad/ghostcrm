"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRibbonPage } from "@/components/ribbon";
import { I18nProvider } from "@/components/utils/I18nProvider";
import { ToastProvider } from "@/components/utils/ToastProvider";
import './page.css';
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

  const getUsageColor = (percentage: number) => {
    if (percentage < 70) return 'usage-good';
    if (percentage < 90) return 'usage-warning';
    return 'usage-danger';
  };

  if (loading) {
    return (
      <I18nProvider>
        <ToastProvider>
          <div className="tenant-billing-page">
            <div className="loading-container">
              <div className="loading-skeleton">
                <div className="skeleton-header"></div>
                <div className="skeleton-cards">
                  <div className="skeleton-card"></div>
                  <div className="skeleton-card"></div>
                  <div className="skeleton-card"></div>
                </div>
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
        <div className="tenant-billing-page">
          {/* Header */}
          <div className="billing-header-section">
            <div className="header-content">
              <h1 className="page-title">Billing & Subscriptions</h1>
              <p className="page-subtitle">Manage your subscription, billing, and usage</p>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="upgrade-button"
            >
              <Plus className="button-icon" />
              Upgrade Plan
            </button>
          </div>

          {/* Current Plan Card */}
          <div className="current-plan-card">
            <div className="plan-details">
              <div className="plan-info">
                <h2 className="plan-name">{billingInfo.currentPlan} Plan</h2>
                <p className="plan-price">
                  ${billingInfo.planPrice}
                  <span className="price-period">/{billingInfo.billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </p>
              </div>
              <div className="billing-info">
                <p className="next-billing-label">Next billing date</p>
                <p className="next-billing-date">{new Date(billingInfo.nextBillingDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="plan-actions">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="primary-button"
              >
                Change Plan
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="secondary-button"
              >
                Update Payment
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="payment-method-card">
            <h3 className="section-title">Payment Method</h3>
            <div className="payment-method-content">
              <div className="payment-info">
                <CreditCard className="payment-icon" />
                <div className="payment-details">
                  <p className="card-number">
                    **** **** **** {billingInfo.paymentMethod.last4}
                  </p>
                  {billingInfo.paymentMethod.expiryDate && (
                    <p className="card-expiry">Expires {billingInfo.paymentMethod.expiryDate}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="edit-button"
              >
                <Edit className="edit-icon" />
              </button>
            </div>
          </div>

          {/* Usage Metrics */}
          <div className="usage-metrics-card">
            <h3 className="section-title">Usage This Month</h3>
            <div className="metrics-list">
              {/* Users */}
              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-label">Team Members</span>
                  <span className="metric-value">
                    {billingInfo.usageMetrics.usersUsed} / {billingInfo.usageMetrics.usersLimit}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${getUsageColor(getUsagePercentage(billingInfo.usageMetrics.usersUsed, billingInfo.usageMetrics.usersLimit))}`}
                    style={{ width: `${getUsagePercentage(billingInfo.usageMetrics.usersUsed, billingInfo.usageMetrics.usersLimit)}%` }}
                  ></div>
                </div>
              </div>

              {/* Storage */}
              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-label">Storage</span>
                  <span className="metric-value">
                    {billingInfo.usageMetrics.storageUsed} GB / {billingInfo.usageMetrics.storageLimit} GB
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${getUsageColor(getUsagePercentage(billingInfo.usageMetrics.storageUsed, billingInfo.usageMetrics.storageLimit))}`}
                    style={{ width: `${getUsagePercentage(billingInfo.usageMetrics.storageUsed, billingInfo.usageMetrics.storageLimit)}%` }}
                  ></div>
                </div>
              </div>

              {/* API Calls */}
              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-label">API Calls</span>
                  <span className="metric-value">
                    {billingInfo.usageMetrics.apiCalls.toLocaleString()} / {billingInfo.usageMetrics.apiLimit.toLocaleString()}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${getUsageColor(getUsagePercentage(billingInfo.usageMetrics.apiCalls, billingInfo.usageMetrics.apiLimit))}`}
                    style={{ width: `${getUsagePercentage(billingInfo.usageMetrics.apiCalls, billingInfo.usageMetrics.apiLimit)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="invoices-card">
            <div className="invoices-header">
              <h3 className="section-title">Recent Invoices</h3>
              <button className="view-all-button">
                View All
              </button>
            </div>
            <div className="invoices-list">
              {billingInfo.invoices.map((invoice) => (
                <div key={invoice.id} className="invoice-item">
                  <div className="invoice-info">
                    <div className={`invoice-status-icon status-${invoice.status}`}>
                      {invoice.status === 'paid' ? 
                        <CheckCircle className="status-icon" /> :
                        invoice.status === 'pending' ?
                        <Clock className="status-icon" /> :
                        <AlertTriangle className="status-icon" />
                      }
                    </div>
                    <div className="invoice-details">
                      <p className="invoice-id">Invoice #{invoice.id}</p>
                      <p className="invoice-date">{new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="invoice-actions">
                    <span className="invoice-amount">${invoice.amount}</span>
                    {invoice.downloadUrl && (
                      <button className="download-button">
                        <Download className="download-icon" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coming Soon Note */}
        <div className="coming-soon-notice">
          <p className="notice-title">Billing & Subscriptions</p>
          <p className="notice-subtitle">Full billing integration coming Q1 2025</p>
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}

export default function BillingPage() {
  return <BillingSubscriptionPage />;
}