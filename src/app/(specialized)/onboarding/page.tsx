'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ClientOnboardingPage from "./client-onboarding";
import OnboardingGuard from "@/components/onboarding/OnboardingGuard";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading, authReady } = useAuth();

  useEffect(() => {
    // Add debugging to see what's happening
    console.log('🔍 [ONBOARDING PAGE] User context:', {
      user: user ? {
        role: user.role,
        tenantId: user.tenantId,
        email: user.email
      } : null,
      hasUser: !!user,
      isLoading,
      authReady
    });

    // Wait for auth to be ready before making any decisions
    if (!authReady) {
      console.log('⏳ [ONBOARDING] Auth not ready yet, waiting...');
      return;
    }

    // If auth is ready but no user, they need to login
    if (!user) {
      console.log('🔄 [ONBOARDING] No user found, redirecting to login');
      router.replace('/login');
      return;
    }

    // Check if user is tenant owner - if so, redirect to dashboard where onboarding modal will show
    const hasOrganizationContext = user?.tenantId && user.tenantId.trim() !== '';
    const isTenantOwner = user?.role === 'owner' && hasOrganizationContext;
    
    console.log('🔍 [ONBOARDING] Role check:', {
      role: user.role,
      tenantId: user.tenantId,
      hasOrganizationContext,
      isTenantOwner
    });
    
    if (isTenantOwner) {
      console.log('🔄 [ONBOARDING] Redirecting tenant owner to dashboard for modal onboarding');
      router.replace('/dashboard');
      return;
    }

    console.log('📋 [ONBOARDING] User is not tenant owner, showing standalone onboarding page');
  }, [user, router, isLoading, authReady]);

  // Show loading spinner while auth is initializing
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <OnboardingGuard requireCompleted={false}>
      <ClientOnboardingPage />
    </OnboardingGuard>
  );
}
