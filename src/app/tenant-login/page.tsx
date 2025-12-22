'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';

interface SubdomainInfo {
  subdomain: string;
  status: string;
  organization_name?: string;
}

export default function TenantLogin() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [subdomainInfo, setSubdomainInfo] = useState<SubdomainInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const subdomainParam = searchParams.get('subdomain');
    const inviteParam = searchParams.get('invite');
    
    if (!subdomainParam) {
      setError('No subdomain specified');
      setLoading(false);
      return;
    }

    setSubdomain(subdomainParam);
    
    // If this is an invite flow, handle it specially
    if (inviteParam) {
      handleInviteFlow(subdomainParam, inviteParam);
    } else {
      verifySubdomain(subdomainParam);
    }
  }, [searchParams]);

  const verifySubdomain = async (subdomainName: string) => {
    try {
      console.log('🔍 [TENANT-LOGIN] Verifying subdomain:', subdomainName);
      
      const response = await fetch(`/api/subdomains/status?email=*&subdomain=${subdomainName}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSubdomainInfo({
          subdomain: subdomainName,
          status: data.subdomain.status,
          organization_name: data.subdomain.organization_name
        });
        
        // If subdomain is active, redirect to login
        if (data.subdomain.status === 'active') {
          console.log('✅ [TENANT-LOGIN] Subdomain is active, redirecting to login');
          redirectToLogin(subdomainName);
        } else {
          setError(`Subdomain "${subdomainName}" is not active (status: ${data.subdomain.status})`);
        }
      } else {
        setError(data.message || 'Subdomain not found or inactive');
      }
    } catch (error) {
      console.error('❌ [TENANT-LOGIN] Error verifying subdomain:', error);
      setError('Failed to verify subdomain');
    }
    
    setLoading(false);
  };

  const handleInviteFlow = async (subdomainName: string, inviteToken: string) => {
    try {
      console.log('🎫 [TENANT-LOGIN] Processing invite token:', inviteToken);
      
      // First verify the invite token and get user role
      const inviteResponse = await fetch(`/api/team/invite/verify?token=${inviteToken}`);
      const inviteData = await inviteResponse.json();
      
      if (inviteResponse.ok && inviteData.success && inviteData.invite) {
        const userRole = inviteData.invite.role;
        console.log('✅ [TENANT-LOGIN] Valid invite for role:', userRole);
        
        // Redirect to appropriate role-based login page with invite context
        let loginUrl;
        switch (userRole) {
          case 'owner':
            loginUrl = `/login-owner?tenant=${subdomainName}&invite=${inviteToken}`;
            break;
          case 'sales_manager':
          case 'manager':
            loginUrl = `/login-salesmanager?tenant=${subdomainName}&invite=${inviteToken}`;
            break;
          case 'sales_representative':
          case 'sales_rep':
            loginUrl = `/login-salesrep?tenant=${subdomainName}&invite=${inviteToken}`;
            break;
          default:
            // Default to sales rep for unrecognized roles
            loginUrl = `/login-salesrep?tenant=${subdomainName}&invite=${inviteToken}`;
        }
        
        console.log('🔄 [TENANT-LOGIN] Redirecting to role-based login:', loginUrl);
        router.push(loginUrl);
      } else {
        setError('Invalid or expired invitation token');
      }
    } catch (error) {
      console.error('❌ [TENANT-LOGIN] Error processing invite:', error);
      setError('Failed to process invitation');
    }
    
    setLoading(false);
  };

  const redirectToLogin = (subdomainName: string) => {
    // Store subdomain context for login
    const loginUrl = new URL('/login-owner', window.location.origin);
    loginUrl.searchParams.set('tenant', subdomainName);
    loginUrl.searchParams.set('return_to', `tenant-owner/dashboard`);
    
    console.log('🔄 [TENANT-LOGIN] Redirecting to:', loginUrl.toString());
    window.location.href = loginUrl.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verifying Tenant Access
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your subdomain...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Access Error
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return to Main Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Tenant Verified
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Subdomain "{subdomain}" is active. Redirecting to login...
          </p>
          {subdomainInfo?.organization_name && (
            <p className="mt-1 text-sm text-gray-500">
              Organization: {subdomainInfo.organization_name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}