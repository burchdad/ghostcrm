'use client'

import { useState, useEffect } from 'react'

export interface OnboardingStatus {
  isCompleted: boolean
  completedAt: string | null
  organizationId: string | null
  isLoading: boolean
}

export function useOnboardingStatus(): OnboardingStatus {
  const [status, setStatus] = useState<OnboardingStatus>({
    isCompleted: false,
    completedAt: null,
    organizationId: null,
    isLoading: true
  })

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Check if user is in demo mode - demo users should be considered as having completed onboarding
        const isDemoMode = localStorage.getItem('ghostcrm_demo_mode') === 'true'
        if (isDemoMode) {
          setStatus({
            isCompleted: true,
            completedAt: new Date().toISOString(),
            organizationId: 'demo-org-id',
            isLoading: false
          })
          // Mark demo onboarding as completed in localStorage
          localStorage.setItem('onboarding-completed', 'true')
          localStorage.setItem('onboarding-completed-at', new Date().toISOString())
          return
        }

        // Check localStorage first for quick response
        const localCompleted = localStorage.getItem('onboarding-completed') === 'true'
        const localCompletedAt = localStorage.getItem('onboarding-completed-at')
        
        if (localCompleted) {
          setStatus({
            isCompleted: true,
            completedAt: localCompletedAt,
            organizationId: null, // We'll get this from API if needed
            isLoading: false
          })
          return
        }

        // Check with API for server-side verification
        try {
          const response = await fetch('/api/onboarding/status')
          if (response.ok) {
            const data = await response.json()
            setStatus({
              isCompleted: data.isCompleted || false,
              completedAt: data.completedAt || null,
              organizationId: data.organizationId || null,
              isLoading: false
            })

            // Sync with localStorage
            if (data.isCompleted) {
              localStorage.setItem('onboarding-completed', 'true')
              if (data.completedAt) {
                localStorage.setItem('onboarding-completed-at', data.completedAt)
              }
            }
          } else {
            // API failed, fall back to localStorage or default
            setStatus({
              isCompleted: localCompleted,
              completedAt: localCompletedAt,
              organizationId: null,
              isLoading: false
            })
          }
        } catch (apiError) {
          console.warn('Failed to check onboarding status from API:', apiError)
          setStatus({
            isCompleted: localCompleted,
            completedAt: localCompletedAt,
            organizationId: null,
            isLoading: false
          })
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        setStatus({
          isCompleted: false,
          completedAt: null,
          organizationId: null,
          isLoading: false
        })
      }
    }

    checkOnboardingStatus()
  }, [])

  return status
}

export function markOnboardingComplete(organizationId?: string) {
  localStorage.setItem('onboarding-completed', 'true')
  localStorage.setItem('onboarding-completed-at', new Date().toISOString())
  if (organizationId) {
    localStorage.setItem('onboarding-organization-id', organizationId)
  }
}

export function resetOnboardingStatus() {
  localStorage.removeItem('onboarding-completed')
  localStorage.removeItem('onboarding-completed-at')
  localStorage.removeItem('onboarding-organization-id')
}