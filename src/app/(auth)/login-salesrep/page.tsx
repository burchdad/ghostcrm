'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BrandPanel from '@/components/auth/BrandPanel';
import AuthForm from '@/components/auth/AuthForm';
import { User } from 'lucide-react';

export default function SalesRepLoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [organizationInfo, setOrganizationInfo] = useState<any>(null);
  
  // Get invite parameter from URL
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const inviteToken = searchParams.get('invite');

  // 🔐 Redirect if already authenticated (unless it's an invite flow)
  useEffect(() => {
    if (user && !isLoading) {
      if (inviteToken) {
        // This is an invite flow - check if user needs profile setup
        const checkInviteStatus = async () => {
          try {
            const response = await fetch(`/api/team/invite/verify?token=${inviteToken}`);
            const data = await response.json();
            
            if (data.success && data.invite && user.email === data.invite.email) {
              // Check if user requires password reset (still has temp password)
              if (user.requires_password_reset) {
                console.log('👥 [INVITE] User needs profile setup, redirecting...');
                router.push(`/profile-setup?token=${inviteToken}&userId=${user.id}`);
                return;
              }
            }
          } catch (error) {
            console.error('Failed to verify invite status:', error);
          }
          
          // Default redirect for authenticated users
          router.push("/tenant-salesrep/leads");
        };
        
        checkInviteStatus();
      } else {
        // Normal redirect for authenticated users without invite
        router.push("/tenant-salesrep/leads");
      }
    }
  }, [user, isLoading, router, inviteToken]);

  // 🌐 Fetch organization info from subdomain
  useEffect(() => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];

    if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
      fetch(`/api/organization/by-subdomain?subdomain=${subdomain}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setOrganizationInfo(data.organization);
        })
        .catch(console.error);
    }
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 35%, #16213e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '200px',
          height: '200px',
          background:
            'radial-gradient(circle, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.1))',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite',
        }}
      ></div>

      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '150px',
          height: '150px',
          background:
            'radial-gradient(circle, rgba(236, 72, 153, 0.4), rgba(236, 72, 153, 0.1))',
          borderRadius: '50%',
          filter: 'blur(35px)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      ></div>

      <div
        style={{
          position: 'absolute',
          top: '60%',
          right: '5%',
          width: '120px',
          height: '120px',
          background:
            'radial-gradient(circle, rgba(59, 130, 246, 0.4), rgba(59, 130, 246, 0.1))',
          borderRadius: '50%',
          filter: 'blur(30px)',
          animation: 'float 7s ease-in-out infinite',
        }}
      ></div>

      {/* Particle Grid Background */}
      <div
        style={{
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
          opacity: 0.6,
        }}
      ></div>

      {/* Main Layout */}
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 10,
          flexDirection: 'row',
        }}
        className="login-page-mobile"
      >
        {/* Left: Brand Panel */}
        <BrandPanel
          organizationInfo={organizationInfo}
          roleIcon={<User className="h-16 w-16" />}
          roleColor="from-blue-500 to-cyan-600"
          roleName="Sales Representative"
          roleDescription="Access your client data and manage your sales pipeline efficiently."
        />

        {/* Right: Auth Form */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative',
          }}
          className="login-form-mobile"
        >
          {/* Glassmorphism backdrop */}
          <div
            style={{
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
              zIndex: 1,
            }}
          ></div>

          <div
            style={{ position: 'relative', zIndex: 2 }}
            className="auth-form-container-mobile"
          >
            <AuthForm showOwnerAccess={false} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(3deg);
          }
        }
      `}</style>
    </div>
  );
}
