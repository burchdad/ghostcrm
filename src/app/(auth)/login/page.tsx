"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BrandPanel from "@/components/auth/BrandPanel";
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Redirect if already authenticated based on role
  useEffect(() => {
    if (user && !isLoading) {
      // Redirect based on user role
      switch (user.role) {
        case 'owner':
          router.push("/owner/dashboard");
          break;
        case 'admin':
          router.push("/admin/dashboard");
          break;
        case 'manager':
        case 'sales_rep':
          router.push("/dashboard");
          break;
        default:
          router.push("/dashboard");
      }
    }
  }, [user, isLoading, router]);

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
