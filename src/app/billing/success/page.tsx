'use client'

import { Suspense, useEffect, useState } from 'react'
import { CheckCircle, ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import './page.css'

interface SuccessData {
  sessionId?: string
  promoCode?: string
  isSoftwareOwner: boolean
  shouldStartOnboarding: boolean
}

function SuccessContent() {
  const router = useRouter()
  const [successData, setSuccessData] = useState<SuccessData>({
    isSoftwareOwner: false,
    shouldStartOnboarding: true
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUserStatus() {
      try {
        // Get URL params
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session_id')
        
        // Check if user is software owner by checking their session/role
        const response = await fetch('/api/auth/check-owner-status')
        const { isSoftwareOwner, userRole } = await response.json()
        
        // Check if they used the SOFTWAREOWNER promo code
        const promoCode = sessionId ? await checkPromoCodeUsed(sessionId) : null
        
        const usedSoftwareOwnerPromo = promoCode === 'SOFTWAREOWNER'
        const shouldStartOnboarding = !isSoftwareOwner && !usedSoftwareOwnerPromo
        
        setSuccessData({
          sessionId: sessionId || undefined,
          promoCode: promoCode || undefined,
          isSoftwareOwner: isSoftwareOwner || usedSoftwareOwnerPromo,
          shouldStartOnboarding
        })
        
        // Auto-redirect after 3 seconds based on user type
        setTimeout(async () => {
          if (isSoftwareOwner || usedSoftwareOwnerPromo) {
            router.push('/owner/dashboard')
          } else {
            // Tenant owner - redirect to dashboard (auth middleware will handle routing)
            router.push('/dashboard')
          }
        }, 3000)
        
      } catch (error) {
        console.error('Error checking user status:', error)
        // Default to regular client flow
        setSuccessData({
          isSoftwareOwner: false,
          shouldStartOnboarding: true
        })
      } finally {
        setLoading(false)
      }
    }
    
    checkUserStatus()
  }, [router])

  async function checkPromoCodeUsed(sessionId: string): Promise<string | null> {
    try {
      const response = await fetch(`/api/stripe/check-session-promo?session_id=${sessionId}`)
      const data = await response.json()
      return data.promoCode || null
    } catch (error) {
      console.error('Error checking promo code:', error)
      return null
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <h2 className="loading-title">Processing...</h2>
          <p className="loading-text">Setting up your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-header">
          <div className="success-icon">
            <CheckCircle className="check-icon" />
          </div>
          <h2 className="success-title">
            {successData.isSoftwareOwner ? 'Welcome Back!' : 'Payment Successful!'}
          </h2>
          <p className="success-subtitle">
            {successData.isSoftwareOwner 
              ? 'Software Owner access confirmed. Redirecting to your dashboard...'
              : 'Thank you for your subscription. You will now be redirected to login to your tenant portal!'
            }
          </p>
        </div>

        <div className="status-card">
          <div className="status-header">
            <CheckCircle className="status-icon" />
            <h3 className="status-title">
              {successData.isSoftwareOwner ? 'Software Owner Access' : 'Subscription Activated'}
            </h3>
          </div>
          <p className="status-description">
            {successData.isSoftwareOwner 
              ? 'Full system access granted. You can manage all tenants and system settings.'
              : 'Your GhostCRM subscription is now active and your custom subdomain portal is ready to use.'
            }
          </p>
          {successData.promoCode && (
            <div className="promo-code">
              Promo code used: {successData.promoCode}
            </div>
          )}
        </div>

        <div className="redirect-card">
          <p className="redirect-text">
            Redirecting you to{' '}
            <span className="redirect-destination">
              {successData.isSoftwareOwner ? 'Software Owner Dashboard' : 'Tenant Owner Login'}
            </span>
            {' '}in 3 seconds...
          </p>
        </div>

        <div className="button-group">
          <Link href="/billing" className="secondary-button">
            Manage Subscription
          </Link>
        </div>

        <div className="support-text">
          <p>
            Questions? Contact us at{' '}
            <a href="mailto:support@ghostcrm.com" className="support-link">
              support@ghostcrm.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="fallback-container">
        <div className="fallback-spinner"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}