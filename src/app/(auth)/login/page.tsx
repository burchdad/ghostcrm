"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/auth-context';
import BrandPanel from "@/components/auth/BrandPanel";
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Redirect if already authenticated based on role and context
  useEffect(() => {
    if (user && !isLoading) {
      console.log('🔄 [LoginPage] Redirecting authenticated user:', user.email, 'Role:', user.role);
      
      // Simple role-based redirect - eliminate complex detection logic
      let redirectPath = "/dashboard"; // default
      
      switch (user.role) {
        case 'owner':
          // Check if we're on a tenant subdomain
          const hostname = window.location.hostname;
          const isSubdomain = hostname !== 'localhost' && 
                              hostname !== '127.0.0.1' && 
                              (hostname.includes('.localhost') || hostname.includes('.ghostcrm.ai'));
          
          if (isSubdomain) {
            redirectPath = "/tenant-owner/dashboard";
          } else {
            redirectPath = "/owner/dashboard"; // Software owner
          }
          break;
        case 'admin':
          redirectPath = "/dashboard";
          break;
        case 'manager':
          redirectPath = "/tenant-salesmanager/leads";
          break;
        case 'sales_rep':
          redirectPath = "/tenant-salesrep/leads";
          break;
        default:
          redirectPath = "/dashboard";
      }
      
      console.log('➡️ [LoginPage] Redirecting to:', redirectPath);
      // Immediate redirect without delay
      router.push(redirectPath);
    }
  }, [user, isLoading, router]);

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

  // Show loading spinner while auth is initializing
  if (isLoading) {
    console.log('⏳ [LoginPage] Showing loading state');
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 35%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{
          textAlign: 'center',
          fontSize: '18px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.1)',
            borderTop: '4px solid #8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }}></div>
          Loading...
          <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
            If this takes too long, please refresh the page
          </div>
        </div>
      </div>
    );
  }

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
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  );
}
