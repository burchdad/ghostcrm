"use client";

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus'
import { Skeleton } from '@/components/feedback/Skeleton'

interface OnboardingGuardProps {
  children: React.ReactNode
  requireCompleted?: boolean
  redirectTo?: string
}

export default function OnboardingGuard({ 
  children, 
  requireCompleted = false,
  redirectTo
}: OnboardingGuardProps) {
  const router = useRouter()
  const { isCompleted, isLoading } = useOnboardingStatus()

  useEffect(() => {
    console.log('🔍 [ONBOARDING_GUARD] Status check:', {
      isLoading,
      isCompleted,
      requireCompleted,
      redirectTo
    });

    if (!isLoading) {
      if (requireCompleted && !isCompleted) {
        // Redirect to onboarding page
        console.log('🔄 [ONBOARDING_GUARD] Redirecting incomplete user to onboarding');
        router.push('/onboarding')
      } else if (!requireCompleted && isCompleted && redirectTo) {
        // User has completed onboarding, redirect away from onboarding pages
        console.log('🔄 [ONBOARDING_GUARD] Redirecting completed user to:', redirectTo);
        router.push(redirectTo)
      } else {
        console.log('✅ [ONBOARDING_GUARD] No action needed - user can proceed');
      }
    }
  }, [isLoading, isCompleted, requireCompleted, redirectTo, router])

  // Show loading state while checking onboarding status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  // Simply render children - redirects are handled by useEffect
  return children
}