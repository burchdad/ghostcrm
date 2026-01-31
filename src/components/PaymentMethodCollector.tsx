'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Loader2, Check, AlertTriangle } from 'lucide-react';

interface PaymentMethodCollectorProps {
  userId: string;
  organizationId?: string;
  email: string;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface SetupIntentResponse {
  setupIntent: {
    id: string;
    client_secret: string;
  };
  customer: {
    id: string;
    email: string;
  };
  trial: {
    trial_period_days: number;
    trial_end_date: string;
    billing_status: string;
  };
}

export default function PaymentMethodCollector({
  userId,
  organizationId,
  email,
  onSuccess,
  onError,
  className = ""
}: PaymentMethodCollectorProps) {
  const [loading, setLoading] = useState(false);
  const [setupIntent, setSetupIntent] = useState<SetupIntentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'init' | 'setup' | 'collecting' | 'success'>('init');

  // Initialize trial setup
  const initializeTrialSetup = async () => {
    try {
      setLoading(true);
      setError(null);
      setStep('setup');

      const response = await fetch('/api/billing/trial/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userId,
          organizationId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize trial setup');
      }

      const data = await response.json();
      setSetupIntent(data);
      setStep('collecting');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create subscription after payment method is collected
  const createSubscription = async (paymentMethodId: string) => {
    try {
      if (!setupIntent) throw new Error('No setup intent available');

      const response = await fetch('/api/billing/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: setupIntent.customer.id,
          paymentMethodId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const data = await response.json();
      setStep('success');
      onSuccess?.(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subscription';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  // Mock payment method collection (in real implementation, use Stripe Elements)
  const mockPaymentMethodCollection = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment method collection
      const mockPaymentMethodId = 'pm_mock_' + Math.random().toString(36).substr(2, 9);
      
      await createSubscription(mockPaymentMethodId);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to collect payment method';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className={`border border-green-200 bg-green-50 rounded-lg p-6 text-center ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-green-100 rounded-full p-3">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">Trial Started Successfully!</h3>
            <p className="text-green-700 mt-1">
              Your 14-day free trial is now active. You'll be automatically billed when your trial ends.
            </p>
          </div>
          {setupIntent && (
            <div className="text-sm text-green-600 bg-green-100 rounded-md p-3 w-full">
              <p><strong>Trial Period:</strong> {setupIntent.trial.trial_period_days} days</p>
              <p><strong>Trial Ends:</strong> {new Date(setupIntent.trial.trial_end_date).toLocaleDateString()}</p>
              <p><strong>Email:</strong> {setupIntent.customer.email}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`border border-red-200 bg-red-50 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-medium">Error Setting Up Trial</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setError(null);
            setStep('init');
          }}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 bg-white rounded-lg p-6 ${className}`}>
      <div className="text-center">
        <div className="bg-blue-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
          <CreditCard className="h-8 w-8 text-blue-600" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Start Your 14-Day Free Trial
        </h3>
        
        <p className="text-gray-600 mb-6">
          Add a payment method to begin your free trial. You won't be charged until your trial ends.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-medium text-gray-900 mb-2">What happens next:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Your 14-day free trial starts immediately</li>
            <li>• No charges during the trial period</li>
            <li>• Automatic billing begins after trial expires</li>
            <li>• Cancel anytime during the trial</li>
          </ul>
        </div>

        {step === 'init' && (
          <button
            onClick={initializeTrialSetup}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Setting up trial...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Add Payment Method & Start Trial</span>
              </>
            )}
          </button>
        )}

        {step === 'collecting' && (
          <div className="space-y-4">
            <div className="border border-gray-300 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-3">
                In a real implementation, Stripe Elements would be rendered here for secure payment method collection.
              </p>
              <div className="bg-gray-100 rounded border-2 border-dashed border-gray-300 h-32 flex items-center justify-center">
                <span className="text-gray-500">Stripe Elements Placeholder</span>
              </div>
            </div>
            
            <button
              onClick={mockPaymentMethodCollection}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Save Payment Method & Start Trial</span>
                </>
              )}
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy.
          You can cancel your trial at any time.
        </p>
      </div>
    </div>
  );
}