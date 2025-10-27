"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Shield, Eye, EyeOff, AlertTriangle, Lock } from 'lucide-react';
import Link from 'next/link';

export default function OwnerLogin() {
  const [credentials, setCredentials] = useState({
    masterKey: '',
    accessCode: '',
    verificationPin: ''
  });
  const [showMasterKey, setShowMasterKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // Multi-step authentication
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/owner/auth/verify-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterKey: credentials.masterKey })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStep(2);
      } else {
        setError(result.error || 'Invalid master key');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/owner/auth/verify-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          masterKey: credentials.masterKey,
          accessCode: credentials.accessCode 
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStep(3);
      } else {
        setError(result.error || 'Invalid access code');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/owner/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store owner session
        localStorage.setItem('ownerSession', JSON.stringify({
          token: result.token,
          expires: result.expires,
          level: 'OWNER',
          timestamp: new Date().toISOString()
        }));

        // Redirect to owner dashboard
        router.push('/owner/dashboard');
      } else {
        setError(result.error || 'Authentication failed');
        setStep(1); // Reset to beginning on final failure
        setCredentials({ masterKey: '', accessCode: '', verificationPin: '' });
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6 shadow-2xl">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Owner Access Portal</h1>
          <p className="text-gray-300">
            Restricted access for software owner only
          </p>
        </div>

        {/* Security Warning */}
        <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold">Maximum Security Required</span>
          </div>
          <p className="text-red-200 text-sm">
            This portal grants complete system access. All login attempts are monitored and logged.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 p-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-6">
            {[1, 2, 3].map((num) => (
              <React.Fragment key={num}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= num 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {num}
                </div>
                {num < 3 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step > num ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-600'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Master Key */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Master Key
                </label>
                <div className="relative">
                  <input
                    type={showMasterKey ? 'text' : 'password'}
                    value={credentials.masterKey}
                    onChange={(e) => handleInputChange('masterKey', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
                    placeholder="Enter master authentication key"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowMasterKey(!showMasterKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showMasterKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !credentials.masterKey}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {loading ? 'Verifying...' : 'Verify Master Key'}
              </button>
            </form>
          )}

          {/* Step 2: Access Code */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Access Code
                </label>
                <input
                  type="password"
                  value={credentials.accessCode}
                  onChange={(e) => handleInputChange('accessCode', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
                  placeholder="Enter secondary access code"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !credentials.accessCode}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {loading ? 'Verifying...' : 'Verify Access Code'}
              </button>
            </form>
          )}

          {/* Step 3: Verification PIN */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Verification PIN
                </label>
                <input
                  type="password"
                  value={credentials.verificationPin}
                  onChange={(e) => handleInputChange('verificationPin', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
                  placeholder="Enter final verification PIN"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !credentials.verificationPin}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {loading ? 'Authenticating...' : 'Complete Owner Login'}
              </button>
            </form>
          )}

          {/* Back to Regular Login */}
          <div className="mt-6 text-center">
            <Link 
              href="/login"
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              ← Back to Regular Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-xs">
            Owner access portal • All sessions logged and monitored
          </p>
        </div>
      </div>
    </div>
  );
}