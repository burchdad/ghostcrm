'use client';

import { useState, useEffect } from 'react';
import { Check, AlertTriangle, CreditCard, Clock, X, Loader2 } from 'lucide-react';

interface BillingStatusProps {
  userId: string;
  className?: string;
  showDetails?: boolean;
}

interface BillingStatus {
  billing_status: string;
  trial: {
    active: boolean;
    expired: boolean;
    days_remaining: number;
    end_date: string;
  } | null;
  subscription: {
    id: string;
    status: string;
    current_period_end: string;
  } | null;
  customer: {
    id: string;
    has_payment_method: boolean;
  } | null;
}

export default function BillingStatusIndicator({ 
  userId, 
  className = "",
  showDetails = false 
}: BillingStatusProps) {
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingStatus();
  }, [userId]);

  const fetchBillingStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/billing/status?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch billing status');
      }

      const data = await response.json();
      setBillingStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (!billingStatus) return null;

    const { billing_status, trial, customer } = billingStatus;

    switch (billing_status) {
      case 'no_trial':
        return {
          icon: <Clock className="h-4 w-4" />,
          text: 'No Trial',
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          description: 'Trial has not been started'
        };

      case 'trial':
        return {
          icon: <Clock className="h-4 w-4" />,
          text: 'Trial Setup',
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          description: 'Trial being set up'
        };

      case 'trial_active':
        return {
          icon: <Clock className="h-4 w-4" />,
          text: `Trial Active (${trial?.days_remaining || 0} days left)`,
          color: trial && trial.days_remaining <= 3 
            ? 'text-amber-600 bg-amber-50 border-amber-200'
            : 'text-blue-600 bg-blue-50 border-blue-200',
          description: customer?.has_payment_method 
            ? 'Will auto-renew with saved payment method'
            : 'Add payment method before trial ends'
        };

      case 'trial_ending':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          text: 'Trial Ending Soon',
          color: 'text-amber-600 bg-amber-50 border-amber-200',
          description: customer?.has_payment_method 
            ? 'Will auto-renew soon'
            : 'Add payment method to continue'
        };

      case 'active':
        return {
          icon: <Check className="h-4 w-4" />,
          text: 'Active Subscription',
          color: 'text-green-600 bg-green-50 border-green-200',
          description: 'Subscription is active and current'
        };

      case 'past_due':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          text: 'Payment Past Due',
          color: 'text-red-600 bg-red-50 border-red-200',
          description: 'Payment failed, please update payment method'
        };

      case 'payment_failed':
        return {
          icon: <X className="h-4 w-4" />,
          text: 'Payment Failed',
          color: 'text-red-600 bg-red-50 border-red-200',
          description: 'Update payment method to continue service'
        };

      case 'canceled':
        return {
          icon: <X className="h-4 w-4" />,
          text: 'Subscription Canceled',
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          description: 'Subscription has been canceled'
        };

      case 'unpaid':
        return {
          icon: <CreditCard className="h-4 w-4" />,
          text: 'Payment Required',
          color: 'text-red-600 bg-red-50 border-red-200',
          description: 'Add payment method to continue using the service'
        };

      default:
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          text: 'Unknown Status',
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          description: `Status: ${billing_status}`
        };
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading billing status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 text-red-500 ${className}`}>
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">Error loading billing status</span>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  return (
    <div className={`${className}`}>
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-md border text-sm ${statusInfo.color}`}>
        {statusInfo.icon}
        <span className="font-medium">{statusInfo.text}</span>
      </div>
      
      {showDetails && (
        <div className="mt-2">
          <p className="text-xs text-gray-600">{statusInfo.description}</p>
          
          {billingStatus?.trial && (
            <div className="mt-1 text-xs text-gray-500">
              Trial ends: {new Date(billingStatus.trial.end_date).toLocaleDateString()}
            </div>
          )}
          
          {billingStatus?.subscription && (
            <div className="mt-1 text-xs text-gray-500">
              Next billing: {new Date(billingStatus.subscription.current_period_end).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}