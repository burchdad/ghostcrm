"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from '@/contexts/auth-context';
import BrandPanel from "@/components/auth/BrandPanel";
import AuthForm from "@/components/auth/AuthForm";
import PostLoginVerificationModal from "@/components/auth/PostLoginVerificationModal";
import { getBaseDomain } from '@/lib/utils/environment';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, supabaseUser, isLoading } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    email?: string;
    firstName?: string;
  }>({});

  // Check for registration success
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('🎉 Account created successfully! Please log in to continue.');
    }
  }, [searchParams]);

  // Helper function to handle redirect after verification is complete
  const handlePostVerificationRedirect = () => {
    if (!user) return;

    console.log('🎯 [LoginPage] handlePostVerificationRedirect called for user:', user.email);
    
    const currentHost = window.location.hostname;
    const baseDomain = getBaseDomain();
    
    console.log('🌐 [LoginPage] Current host:', currentHost, 'Base domain:', baseDomain);

    // Check if we're on a subdomain
    if (currentHost !== baseDomain && currentHost.endsWith(`.${baseDomain}`)) {
      // We're on a subdomain - redirect to tenant dashboard
      const redirectPath = "/tenant-owner/dashboard";
      console.log('🏢 [LoginPage] On subdomain - redirecting to tenant dashboard:', redirectPath);
      router.push(redirectPath);
      return;
    }

    // We're on main domain - redirect based on role
    console.log('🏠 [LoginPage] On main domain - checking role...');
    let redirectPath = "/tenant-owner/dashboard"; // Default to tenant dashboard for all users

    if (user) {
      // Enhanced role-based routing with more specific paths
      const userRole = user.role || 'user';
      console.log('👤 [LoginPage] User role:', userRole);
      
      switch (userRole) {
        case 'software_owner':
          // Check if user has an active subdomain (from user profile)
          if (user.tenantId && user.tenantId !== 'default-org') {
            redirectPath = `https://${user.tenantId}.${baseDomain}/tenant-owner/dashboard`;
          } else {
            redirectPath = "/dashboard"; // Only software owners go to main dashboard
          }
          break;
        case 'owner':
          // For tenant owners, redirect directly to tenant dashboard
          redirectPath = "/tenant-owner/dashboard";
          break;
        case 'admin':
          redirectPath = "/tenant-owner/dashboard";
          break;
        case 'manager':
          redirectPath = "/tenant-salesmanager/leads";
          break;
        case 'sales_rep':
          redirectPath = "/tenant-salesrep/leads";
          break;
        case 'user':
          // Regular user role - redirect to tenant dashboard if on subdomain
          redirectPath = "/tenant-owner/dashboard";
          break;
        default:
          console.warn('🚨 [LoginPage] Unknown role:', user.role, '- defaulting to tenant dashboard');
          redirectPath = "/tenant-owner/dashboard";
      }
      
      console.log('➡️ [LoginPage] Redirecting to:', redirectPath);
      // Immediate redirect without delay
      router.push(redirectPath);
    }
  };

  // Check if user needs post-login verification
  useEffect(() => {
    if (user && !isLoading) {
      console.log('🔄 [LoginPage] Checking verification status for user:', user.email);
      
      // Check if user needs post-login verification
      const needsVerification = supabaseUser?.user_metadata?.email_verification_pending === true;
      
      if (needsVerification) {
        console.log('📧 [LoginPage] User needs post-login verification');
        setVerificationData({
          email: user.email || '',
          firstName: supabaseUser?.user_metadata?.first_name || 'User'
        });
        setShowVerificationModal(true);
        return; // Don't redirect until verification is complete
      }
      
      // Proceed with normal redirect logic if verification not needed
      handlePostVerificationRedirect();
    }
  }, [user, supabaseUser, isLoading, router]);

  // Emergency timeout to prevent infinite loading
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      console.warn('⚠️ [LoginPage] Emergency timeout reached - forcing loading to false');
      // If still loading after 5 seconds, something is wrong - show the login form anyway
      if (isLoading) {
        // Force a page reload as last resort
        window.location.reload();
      }
    }, 5000);

    return () => clearTimeout(emergencyTimeout);
  }, [isLoading]);

  // Helper function to handle redirect after verification is complete
  const handleVerificationComplete = () => {
    setShowVerificationModal(false);
    handlePostVerificationRedirect();
  };

  console.log('🎯 [LoginPage] Rendering login form');
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
            <AuthForm successMessage={successMessage} />
          </div>
        </div>
      </div>

      {/* Post-Login Verification Modal */}
      <PostLoginVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerified={handleVerificationComplete}
        userEmail={verificationData.email}
        firstName={verificationData.firstName}
      />
    </div>
  );
}
