"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BrandPanel from "@/components/auth/BrandPanel";
import AuthForm from "@/components/auth/AuthForm";

export default function TenantOwnerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const [tenantContext, setTenantContext] = useState<string | null>(null);

  useEffect(() => {
    // Get tenant context from URL parameters
    const tenant = searchParams.get('tenant');
    if (tenant) {
      setTenantContext(tenant);
      console.log('🏢 [LOGIN-OWNER] Tenant context:', tenant);
    }
  }, [searchParams]);

  // Redirect if already authenticated based on role
  useEffect(() => {
    if (user && !isLoading) {
      // Check if tenant owner needs onboarding first
      checkOnboardingStatus();
    }
  }, [user, isLoading, router]);

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/onboarding/status');
      const { isCompleted } = await response.json();
      
      if (!isCompleted) {
        // Redirect to onboarding flow first
        console.log('🔄 [LOGIN-OWNER] Redirecting to onboarding - not completed');
        router.push('/onboarding');
      } else {
        // Already completed onboarding, go to dashboard
        console.log('✅ [LOGIN-OWNER] Onboarding completed, redirecting to dashboard');
        
        // Force navigation to tenant-owner dashboard
        const dashboardUrl = '/tenant-owner/dashboard';
        console.log('🔄 [LOGIN-OWNER] Redirecting to:', dashboardUrl);
        
        // Use replace to prevent back button issues
        router.replace(dashboardUrl);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to dashboard if check fails
      console.log('⚠️ [LOGIN-OWNER] Error checking status, defaulting to dashboard');
      router.replace('/tenant-owner/dashboard');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 35%, #16213e 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Orbs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '15%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.1))',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4), rgba(236, 72, 153, 0.1))',
        borderRadius: '50%',
        filter: 'blur(35px)',
        animation: 'float 8s ease-in-out infinite reverse'
      }}></div>

      <div style={{
        position: 'absolute',
        top: '60%',
        right: '5%',
        width: '120px',
        height: '120px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4), rgba(59, 130, 246, 0.1))',
        borderRadius: '50%',
        filter: 'blur(30px)',
        animation: 'float 7s ease-in-out infinite'
      }}></div>

      {/* Particle Grid Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 25% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
        `,
        opacity: 0.6
      }}></div>

      <div style={{
        display: 'flex',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 10,
        flexDirection: 'row'
      }} className="login-page-mobile">
        {/* Left: Brand Panel */}
        <BrandPanel />

        {/* Right: Authentication */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          position: 'relative'
        }} className="login-form-mobile">
          {/* Glassmorphism backdrop */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(500px, 90vw)',
            height: 'min(600px, 90vh)',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 1
          }}></div>

          {/* Auth Form */}
          <div style={{ position: 'relative', zIndex: 2 }} className="auth-form-container-mobile">
            {tenantContext && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '0.75rem',
                textAlign: 'center'
              }}>
                <p style={{ color: '#8b5cf6', fontWeight: '600', margin: 0 }}>
                  Tenant Login: {tenantContext}
                </p>
                <p style={{ color: '#a78bfa', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                  You're logging into the {tenantContext} organization
                </p>
              </div>
            )}
            <AuthForm 
              showOwnerAccess={false} 
              tenantContext={tenantContext} 
            />
            
            {/* Debug Section - Only show if user is authenticated but stuck on login page */}
            {user && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '0.75rem',
                textAlign: 'center'
              }}>
                <p style={{ color: '#22c55e', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                  Already logged in as {user.email}
                </p>
                <button
                  onClick={() => router.replace('/tenant-owner/dashboard')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}