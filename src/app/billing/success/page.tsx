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
  processed?: boolean
  gatewayError?: boolean
  subdomainStatus?: 'checking' | 'pending_payment' | 'active' | 'error'
  isSubdomainActivated?: boolean
}

function SuccessContent() {
  const router = useRouter()
  const [successData, setSuccessData] = useState<SuccessData>({
    isSoftwareOwner: false,
    shouldStartOnboarding: true,
    userSubdomain: undefined,
    subdomainStatus: 'checking',
    isSubdomainActivated: false
  })
  const [loading, setLoading] = useState(true)
  const [manualActivating, setManualActivating] = useState(false)

  useEffect(() => {
    async function checkUserStatus() {
      try {
        // Get URL params
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session_id')
        const processed = urlParams.get('processed') === 'true'
        const gatewayError = urlParams.get('gateway_error') === 'true'
        
        // Show messaging based on payment gateway processing
        if (processed) {
          console.log('✅ [BILLING-SUCCESS] Payment processed through gateway successfully')
        } else if (gatewayError) {
          console.warn('⚠️ [BILLING-SUCCESS] Gateway processing error - payment may need manual verification')
        }
        
        // Check if user is software owner by checking their session/role
        const response = await fetch('/api/auth/check-owner-status')
        const { isSoftwareOwner, userRole } = await response.json()
        
        // Get user's organization/subdomain info for proper redirect
        let userSubdomain = null
        let userEmail = null
        if (!isSoftwareOwner) {
          try {
            const orgResponse = await fetch('/api/auth/me')
            const userData = await orgResponse.json()
            userEmail = userData.user?.email // Store email for activation check
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
        
        // For non-software owners, check real subdomain activation status
        let subdomainStatus: 'checking' | 'pending_payment' | 'active' | 'error' = 'checking'
        let isSubdomainActivated = false
        
        if (!isSoftwareOwner && !usedSoftwareOwnerPromo && userEmail) {
          try {
            console.log('🔍 [BILLING-SUCCESS] Checking real subdomain status...')
            const statusResponse = await fetch('/api/subdomains/status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userEmail })
            })
            const statusResult = await statusResponse.json()
            
            if (statusResult.success && statusResult.subdomain) {
              subdomainStatus = statusResult.subdomain.status || 'error'
              isSubdomainActivated = statusResult.subdomain.status === 'active'
              console.log(`✅ [BILLING-SUCCESS] Subdomain status confirmed: ${subdomainStatus}`)
            } else {
              subdomainStatus = 'error'
              console.warn('⚠️ [BILLING-SUCCESS] Could not verify subdomain status:', statusResult.error)
            }
          } catch (statusError) {
            subdomainStatus = 'error'
            console.warn('⚠️ [BILLING-SUCCESS] Error checking subdomain status:', statusError)
          }
        } else {
          // Software owners don't need subdomain activation
          subdomainStatus = 'active'
          isSubdomainActivated = true
        }

        setSuccessData({
          sessionId: sessionId || undefined,
          promoCode: promoCode || undefined,
          isSoftwareOwner: isSoftwareOwner || usedSoftwareOwnerPromo,
          shouldStartOnboarding,
          userSubdomain: userSubdomain || undefined,
          processed,
          gatewayError,
          subdomainStatus,
          isSubdomainActivated
        })
        
        // Note: Subdomain activation now happens in payment gateway before success page
        // Status checking here provides real-time confirmation for UI updates
        
        // Only auto-redirect software owners
        if (isSoftwareOwner || usedSoftwareOwnerPromo) {
          setTimeout(() => {
            router.push('/owner/dashboard')
          }, 3000)
        }
      } catch (error) {
        console.error('Error checking user status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUserStatus()
  }, [])

  // Manual activation function
  const handleManualActivation = async () => {
    setManualActivating(true)
    
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const sessionId = urlParams.get('session_id')
      
      // Get user email from current session
      const authResponse = await fetch('/api/auth/me')
      const authData = await authResponse.json()
      const userEmail = authData.user?.email
      
      if (!userEmail) {
        alert('Could not find user email. Please try logging in again.')
        return
      }
      
      // Call manual activation API
      const response = await fetch('/api/subdomains/manual-activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Refresh the subdomain status
        const statusResponse = await fetch('/api/subdomains/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail })
        })
        const statusResult = await statusResponse.json()
        
        if (statusResult.success && statusResult.subdomain) {
          setSuccessData(prev => ({
            ...prev,
            subdomainStatus: statusResult.subdomain.status,
            isSubdomainActivated: statusResult.subdomain.status === 'active'
          }))
        }
        
        alert('Subdomain activated successfully!')
      } else {
        alert(`Activation failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Manual activation error:', error)
      alert('Activation failed. Please try again.')
    } finally {
      setManualActivating(false)
    }
  }

  const handleGoToSubdomain = () => {
    if (!successData.isSubdomainActivated) {
      alert('Please wait for subdomain activation to complete before accessing your portal.')
      return
    }
    
    if (successData.userSubdomain) {
      // Clear session and redirect to subdomain
      fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
        window.location.href = `https://${successData.userSubdomain}.ghostcrm.ai/login-owner`
      })
    } else {
      // Fallback to main login
      fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
        router.push('/login-owner')
      })
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
      
      // Redirect to subdomain login page (now that subdomain is activated)
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
          
          {/* Payment Gateway Status Indicator */}
          {!successData.isSoftwareOwner && (
            <div className={`gateway-status ${getGatewayStatusClass(successData)}`}>
              {getGatewayStatusMessage(successData)}
            </div>
          )}
        </div>

        <div className={`status-card ${!successData.isSoftwareOwner ? (successData.isSubdomainActivated ? 'activated' : 'pending') : ''}`}>
          <div className="status-header">
            <CheckCircle className={`status-icon ${!successData.isSoftwareOwner && !successData.isSubdomainActivated ? 'pending' : ''}`} />
            <h3 className="status-title">
              {successData.isSoftwareOwner ? 'Software Owner Access' : getSubdomainStatusTitle(successData)}
            </h3>
          </div>
          <p className="status-description">
            {successData.isSoftwareOwner 
              ? 'Full system access granted. You can manage all tenants and system settings.'
              : getSubdomainStatusDescription(successData)
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
              {/* Manual Activation Button */}
              {!successData.isSubdomainActivated && (
                <button 
                  onClick={handleManualActivation}
                  className="manual-activate-button"
                  disabled={manualActivating}
                >
                  {manualActivating ? (
                    <span>⏳ Activating...</span>
                  ) : (
                    <span>🔄 Activate Subdomain Manually</span>
                  )}
                </button>
              )}
              
              <button 
                onClick={handleGoToSubdomain}
                className={`primary-button ${!successData.isSubdomainActivated ? 'disabled' : ''}`}
                disabled={!successData.userSubdomain || !successData.isSubdomainActivated}
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

// Helper function to determine gateway status CSS class
function getGatewayStatusClass(successData: SuccessData): string {
  if (successData.isSubdomainActivated) {
    return 'processed';
  } else if (successData.gatewayError || successData.subdomainStatus === 'error') {
    return 'error';
  } else if (successData.subdomainStatus === 'pending_payment') {
    return 'pending';
  } else {
    return 'standard';
  }
}

// Helper function to get gateway status message
function getGatewayStatusMessage(successData: SuccessData): JSX.Element {
  if (successData.isSubdomainActivated) {
    return <span className="gateway-processed">✅ Account activated instantly through secure payment gateway</span>;
  } else if (successData.gatewayError) {
    return <span className="gateway-error">⚠️ Payment successful - Account activation processing</span>;
  } else if (successData.subdomainStatus === 'error') {
    return <span className="gateway-error">⚠️ Activation verification in progress</span>;
  } else if (successData.subdomainStatus === 'pending_payment') {
    return <span className="gateway-pending">🔄 Payment confirmed - Finalizing subdomain activation</span>;
  } else if (successData.subdomainStatus === 'checking') {
    return <span className="gateway-standard">🔍 Payment confirmed - Verifying account activation</span>;
  } else {
    return <span className="gateway-standard">💳 Payment confirmed - Activating your account</span>;
  }
}

// Helper function to get subdomain status title
function getSubdomainStatusTitle(successData: SuccessData): string {
  if (successData.isSubdomainActivated) {
    return 'Subscription Activated';
  } else if (successData.subdomainStatus === 'pending_payment') {
    return 'Activation In Progress';
  } else if (successData.subdomainStatus === 'error') {
    return 'Activation Pending';
  } else {
    return 'Processing Activation';
  }
}

// Helper function to get subdomain status description
function getSubdomainStatusDescription(successData: SuccessData): string {
  if (successData.isSubdomainActivated) {
    return 'Your GhostCRM subscription is now active and your custom subdomain portal is ready to use.';
  } else if (successData.subdomainStatus === 'pending_payment') {
    return 'Your payment has been confirmed. We are finalizing your subdomain activation and it will be ready shortly.';
  } else if (successData.subdomainStatus === 'error') {
    return 'Your payment was successful. We are working on activating your subdomain portal.';
  } else {
    return 'Your payment has been confirmed and we are processing your account activation.';
  }
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