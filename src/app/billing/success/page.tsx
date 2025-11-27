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
  userSubdomain?: string
}

function SuccessContent() {
  const router = useRouter()
  const [successData, setSuccessData] = useState<SuccessData>({
    isSoftwareOwner: false,
    shouldStartOnboarding: true,
    userSubdomain: undefined
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
        
        // Get user's organization/subdomain info for proper redirect
        let userSubdomain = null
        if (!isSoftwareOwner) {
          try {
            const orgResponse = await fetch('/api/auth/me')
            const userData = await orgResponse.json()
            if (userData.user?.organizationSubdomain) {
              // Use the organizationSubdomain from the user data directly
              userSubdomain = userData.user.organizationSubdomain
              console.log('🔍 [BILLING-SUCCESS] Found user subdomain:', userSubdomain)
            } else if (userData.user?.tenantId) {
              // Fallback: Get organization details to find subdomain
              const orgDetailsResponse = await fetch(`/api/organization/${userData.user.tenantId}`)
              const orgData = await orgDetailsResponse.json()
              userSubdomain = orgData.organization?.subdomain
              console.log('🔍 [BILLING-SUCCESS] Found subdomain from org API:', userSubdomain)
            }
          } catch (error) {
            console.warn('Could not fetch user organization info:', error)
          }
        }
        
        // Check if they used the SOFTWAREOWNER promo code
        const promoCode = sessionId ? await checkPromoCodeUsed(sessionId) : null
        
        const usedSoftwareOwnerPromo = promoCode === 'SOFTWAREOWNER'
        const shouldStartOnboarding = !isSoftwareOwner && !usedSoftwareOwnerPromo
        
        setSuccessData({
          sessionId: sessionId || undefined,
          promoCode: promoCode || undefined,
          isSoftwareOwner: isSoftwareOwner || usedSoftwareOwnerPromo,
          shouldStartOnboarding,
          userSubdomain: userSubdomain || undefined
        })
        
        // Only auto-redirect software owners
        if (isSoftwareOwner || usedSoftwareOwnerPromo) {
          setTimeout(() => {
            router.push('/owner/dashboard')
          }, 3000)
        }
        // Tenant owners will use the manual button to clear session and redirect
        
      } catch (error) {
        console.error('Error checking user status:', error)
        // Default to regular client flow
        setSuccessData({
          isSoftwareOwner: false,
          shouldStartOnboarding: true,
          userSubdomain: undefined
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

  async function handleGoToSubdomain() {
    try {
      // Clear current session and JWT tokens
      console.log('🔄 Clearing session and redirecting to subdomain login...')
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Clear any local storage auth data
      localStorage.removeItem('ghost_session');
      localStorage.removeItem('auth_token');
      
      // Redirect to subdomain login page
      if (successData.userSubdomain) {
        const subdomainUrl = `https://${successData.userSubdomain}.ghostcrm.ai/login-owner`
        console.log('🌐 Redirecting to subdomain login:', subdomainUrl)
        window.location.href = subdomainUrl
      } else {
        // Fallback to main domain login
        console.log('⚠️ No subdomain found, redirecting to main domain login')
        router.push('/login-owner')
      }
    } catch (error) {
      console.error('Error during logout and redirect:', error)
      // Even if logout fails, try to redirect
      if (successData.userSubdomain) {
        window.location.href = `https://${successData.userSubdomain}.ghostcrm.ai/login-owner`
      } else {
        router.push('/login-owner')
      }
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
          {successData.isSoftwareOwner ? (
            <p className="redirect-text">
              Redirecting you to{' '}
              <span className="redirect-destination">Software Owner Dashboard</span>
              {' '}in 3 seconds...
            </p>
          ) : (
            <div className="tenant-redirect-info">
              <p className="redirect-text">
                Your custom subdomain portal is ready:{' '}
                {successData.userSubdomain && (
                  <span className="redirect-destination">
                    {successData.userSubdomain}.ghostcrm.ai
                  </span>
                )}
              </p>
              <p className="redirect-subtitle">
                Click below to clear your session and login to your tenant portal
              </p>
            </div>
          )}
        </div>

        <div className="button-group">
          {successData.isSoftwareOwner ? (
            <Link href="/billing" className="secondary-button">
              Manage Subscription
            </Link>
          ) : (
            <>
              <button 
                onClick={handleGoToSubdomain}
                className="primary-button"
                disabled={!successData.userSubdomain}
              >
                <ArrowRight className="button-icon" />
                Go to My Tenant Portal
              </button>
              <Link href="/billing" className="secondary-button">
                Manage Subscription
              </Link>
            </>
          )}
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