"use client";

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus'
import { Skeleton } from '@/components/feedback/Skeleton'
import OnboardingModal from '@/components/modals/OnboardingModal'
import ClientOnboardingPage from '@/app/(specialized)/onboarding/client-onboarding'

interface OnboardingGuardProps {
  children: React.ReactNode
  requireCompleted?: boolean
  redirectTo?: string
  mode?: 'redirect' | 'modal'
}

export default function OnboardingGuard({ 
  children, 
  requireCompleted = false,
  redirectTo,
  mode = 'redirect'
}: OnboardingGuardProps) {
  const router = useRouter()
  const { isCompleted, isLoading } = useOnboardingStatus()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    console.log('🔍 [ONBOARDING_GUARD] Status check:', {
      isLoading,
      isCompleted,
      requireCompleted,
      mode,
      redirectTo,
      shouldShowModal: requireCompleted && !isCompleted && mode === 'modal'
    });

    if (!isLoading) {
      if (requireCompleted && !isCompleted) {
        if (mode === 'modal') {
          // Show onboarding modal overlay
          console.log('🎭 [ONBOARDING_GUARD] Setting modal to show');
          setShowModal(true)
        } else {
          // Redirect to onboarding page
          console.log('🔄 [ONBOARDING_GUARD] Redirecting incomplete user to onboarding');
          router.push('/onboarding')
        }
      } else if (!requireCompleted && isCompleted && redirectTo) {
        // User has completed onboarding, redirect away from onboarding pages
        console.log('🔄 [ONBOARDING_GUARD] Redirecting completed user to:', redirectTo);
        router.push(redirectTo)
      } else {
        console.log('✅ [ONBOARDING_GUARD] No action needed - user can proceed');
      }
    }
  }, [isLoading, isCompleted, requireCompleted, redirectTo, router, mode])

  // Handle modal completion
  const handleOnboardingComplete = () => {
    setShowModal(false)
    // Optionally refresh the page or trigger a status check
    window.location.reload()
  }

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

  // Show children with optional modal overlay
  return (
    <>
      {children}
      
      {/* Onboarding Modal Overlay */}
      {mode === 'modal' && (
        <OnboardingModal 
          isOpen={showModal} 
          allowClose={false}
          className="max-w-5xl"
        >
          <ClientOnboardingPage onComplete={handleOnboardingComplete} />
        </OnboardingModal>
      )}
    </>
  )
}