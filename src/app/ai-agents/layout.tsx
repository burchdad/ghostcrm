"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Shield, Lock } from 'lucide-react';

interface AuthVerificationProps {
  children: React.ReactNode;
}

export default function AIAgentsLayout({ children }: AuthVerificationProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function verifyAccess() {
      try {
        // Check if user has admin/owner access
        const response = await fetch('/api/admin/auth/verify', {
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          setUserInfo(userData);
          setIsAuthorized(true);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Access denied');
          setIsAuthorized(false);
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        setError('Authentication check failed');
        setIsAuthorized(false);
      }
    }

    verifyAccess();
  }, []);

  // Show loading state
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Access</h2>
          <p className="text-gray-600">Checking administrator permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">
            This AI Agent Dashboard is restricted to system administrators and owners only. 
            Regular users cannot access the infrastructure management interface.
          </p>
          
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Login as Administrator
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Security Notice:</strong> All access attempts to this interface are logged and monitored.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show authorized content with security banner
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Security Warning Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-600" />
            <p className="text-sm font-medium text-yellow-800">
              <span className="font-semibold">Administrator Mode:</span> You are accessing system-level AI agent controls. 
              Changes here affect the entire platform infrastructure.
            </p>
          </div>
          {userInfo && (
            <div className="text-sm text-yellow-700">
              Logged in as: <span className="font-medium">{userInfo.email}</span>
              {userInfo.isOwner && <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">OWNER</span>}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {children}
    </div>
  );
}