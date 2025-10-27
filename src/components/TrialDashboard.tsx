'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import TrialCountdown from './TrialCountdown';
import BillingStatusIndicator from './BillingStatusIndicator';
import PaymentMethodCollector from './PaymentMethodCollector';
import { Calendar, CreditCard, Settings, Users } from 'lucide-react';

interface TrialDashboardProps {
  className?: string;
}

interface BillingData {
  billing_status: string;
  trial: {
    active: boolean;
    expired: boolean;
    days_remaining: number;
    end_date: string;
  } | null;
  subscription: any;
  customer: {
    id: string;
    has_payment_method: boolean;
  } | null;
}

export default function TrialDashboard({ className = "" }: TrialDashboardProps) {
  const { user } = useAuth();
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentCollector, setShowPaymentCollector] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchBillingData();
    }
  }, [user?.id]);

  const fetchBillingData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/billing/status?userId=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setBillingData(data);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentCollector(false);
    fetchBillingData(); // Refresh billing data
  };

  const handleAddPaymentMethod = () => {
    setShowPaymentCollector(true);
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg h-32 mb-4"></div>
        <div className="bg-gray-200 rounded-lg h-16"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">Please log in to view your trial status.</p>
      </div>
    );
  }

  // Show payment collector if user hasn't started trial or needs payment method
  if (!billingData || billingData.billing_status === 'no_trial' || showPaymentCollector) {
    return (
      <div className={className}>
        <PaymentMethodCollector
          userId={user.id}
          email={user.email || ''}
          onSuccess={handlePaymentSuccess}
          onError={(error) => {
            console.error('Payment error:', error);
            setShowPaymentCollector(false);
          }}
        />
      </div>
    );
  }

  const { billing_status, trial, customer } = billingData;
  const hasActiveTrial = trial && (trial.active || billing_status === 'trial_active');
  const needsPaymentMethod = !customer?.has_payment_method && hasActiveTrial;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Trial Status Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Trial Status</h2>
          <BillingStatusIndicator userId={user.id} />
        </div>

        {/* Trial Countdown */}
        {hasActiveTrial && trial && (
          <TrialCountdown
            trialEndDate={trial.end_date}
            hasPaymentMethod={customer?.has_payment_method || false}
            onAddPaymentMethod={handleAddPaymentMethod}
            className="mb-4"
          />
        )}

        {/* Payment Method Warning */}
        {needsPaymentMethod && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">Payment Method Required</p>
                <p className="text-sm text-amber-700">
                  Add a payment method to ensure uninterrupted service when your trial ends.
                </p>
              </div>
              <button
                onClick={handleAddPaymentMethod}
                className="bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Add Payment Method
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trial Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Full Access</p>
              <p className="text-sm text-gray-600">All CRM features included</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 rounded-lg p-2">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">14 Days Free</p>
              <p className="text-sm text-gray-600">No charges during trial</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 rounded-lg p-2">
              <Settings className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Cancel Anytime</p>
              <p className="text-sm text-gray-600">No long-term commitment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trial Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trial Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trial && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-700">Trial Period</p>
                <p className="text-gray-900">14 days</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Trial End Date</p>
                <p className="text-gray-900">
                  {new Date(trial.end_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Days Remaining</p>
                <p className="text-gray-900">{trial.days_remaining} days</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Payment Method</p>
                <p className="text-gray-900">
                  {customer?.has_payment_method ? (
                    <span className="text-green-600">✓ Added</span>
                  ) : (
                    <span className="text-amber-600">⚠ Required</span>
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {needsPaymentMethod && (
            <button
              onClick={handleAddPaymentMethod}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Add Payment Method
            </button>
          )}
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            View Billing History
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}