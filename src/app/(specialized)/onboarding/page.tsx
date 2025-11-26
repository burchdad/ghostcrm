'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ClientOnboardingPage from "./client-onboarding";
import OnboardingGuard from "@/components/onboarding/OnboardingGuard";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Add debugging to see what's happening
    console.log('🔍 [ONBOARDING PAGE] User context:', {
      user: user ? {
        role: user.role,
        dealership: user.dealership,
        email: user.email
      } : null,
      hasUser: !!user
    });

    // Wait for user to be loaded
    if (!user) {
      console.log('⏳ [ONBOARDING] User not loaded yet, waiting...');
      return;
    }

    // Check if user is tenant owner - if so, redirect to dashboard where onboarding modal will show
    const hasDealershipContext = user?.dealership && user.dealership.trim() !== '';
    const isTenantOwner = user?.role === 'owner' && hasDealershipContext;
    
    console.log('🔍 [ONBOARDING] Role check:', {
      role: user.role,
      dealership: user.dealership,
      hasDealershipContext,
      isTenantOwner
    });
    
    if (isTenantOwner) {
      console.log('🔄 [ONBOARDING] Redirecting tenant owner to dashboard for modal onboarding');
      router.replace('/dashboard');
      return;
    }

    console.log('📋 [ONBOARDING] User is not tenant owner, showing standalone onboarding page');
  }, [user, router]);

  return (
    <OnboardingGuard requireCompleted={false}>
      <ClientOnboardingPage />
    </OnboardingGuard>
  );
}
