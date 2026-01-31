"use client";

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus'
import { Skeleton } from '@/components/feedback/Skeleton'
import styles from '../../app/(specialized)/onboarding/onboarding.module.css'

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
      <div className={styles['loading-overlay']}>
        <div className={styles['loading-content']}>
          <div className={styles['loading-icon']}>
            <span className={`${styles['text-white']} ${styles['font-bold']} ${styles['text-xl']}`}>G</span>
          </div>
          <div>
            <div className={styles['loading-spinner']}></div>
            <div className={`${styles['loading-text']} ${styles['mt-4']}`}>Checking onboarding status...</div>
          </div>
        </div>
      </div>
    )
  }

  // Simply render children - redirects are handled by useEffect
  return children
}