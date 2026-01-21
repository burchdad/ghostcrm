'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { createBrowserClient } from '@supabase/ssr';
import { CheckCircle, AlertCircle, Mail, CreditCard } from 'lucide-react';

export default function ActivatePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [subdomain, setSubdomain] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [organizationStatus, setOrganizationStatus] = useState<'pending' | 'active' | null>(null);

  useEffect(() => {
    // Extract subdomain from current URL
    const hostname = window.location.hostname;
    if (hostname.includes('.ghostcrm.ai')) {
      const parts = hostname.split('.');
      if (parts.length >= 3 && parts[0] !== 'www') {
        setSubdomain(parts[0]);
      }
    }
  }, []);

  useEffect(() => {
    if (user && !isLoading) {
      // Check email verification status using Supabase auth
      const checkEmailVerification = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setEmailVerified(!!authUser?.email_confirmed_at);
      };
      checkEmailVerification();
      
      // Check organization/subdomain status
      // This would typically be an API call to check current status
      checkOrganizationStatus();
    }
  }, [user, isLoading]);

  const checkOrganizationStatus = async () => {
    // Placeholder for checking org status
    // In real implementation, you'd call an API to check current status
    setOrganizationStatus('pending');
  };

  const resendVerificationEmail = async () => {
    try {
      // Implement resend verification email logic
      alert('Verification email sent! Please check your inbox.');
    } catch (error) {
      alert('Failed to resend verification email. Please try again.');
    }
  };

  const proceedToBilling = () => {
    router.push('/billing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Activate Your Account
          </h1>
          <p className="text-gray-600">
            {subdomain && (
              <>Complete setup for <span className="font-semibold">{subdomain}.ghostcrm.ai</span></>
            )}
          </p>
        </div>

        <div className="space-y-6">
          {/* Email Verification Step */}
          <div className="flex items-start space-x-4 p-4 border rounded-lg">
            <div className="flex-shrink-0">
              {emailVerified ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <Mail className="h-6 w-6 text-blue-500" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {emailVerified ? 'Email Verified' : 'Verify Your Email'}
              </h3>
              {emailVerified ? (
                <p className="text-sm text-gray-600">Your email has been verified successfully.</p>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Please check your email and click the verification link.
                  </p>
                  <button
                    onClick={resendVerificationEmail}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Resend verification email
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Payment/Billing Step */}
          <div className="flex items-start space-x-4 p-4 border rounded-lg">
            <div className="flex-shrink-0">
              {paymentComplete ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <CreditCard className="h-6 w-6 text-orange-500" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {paymentComplete ? 'Payment Complete' : 'Complete Payment'}
              </h3>
              {paymentComplete ? (
                <p className="text-sm text-gray-600">Your subscription is active.</p>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Choose your plan and complete payment to activate your subdomain.
                  </p>
                  <button
                    onClick={proceedToBilling}
                    disabled={!emailVerified}
                    className={`px-4 py-2 rounded text-sm font-medium ${
                      emailVerified
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continue to Payment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-900">Current Status:</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Your subdomain is currently <span className="font-semibold text-orange-600">pending activation</span>.
              Complete the steps above to access your full dashboard.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Need help?{' '}
            <a href="mailto:support@ghostcrm.ai" className="text-blue-600 hover:text-blue-800">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}