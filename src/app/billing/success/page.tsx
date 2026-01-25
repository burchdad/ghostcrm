'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import './page.css'

// Get base domain based on environment
const getBaseDomain = (): string => {
  if (typeof window === 'undefined') return 'ghostcrm.ai'
  
  const hostname = window.location.hostname
  
  if (hostname === 'localhost') {
    return 'localhost:3000'
  }
  
  if (hostname.includes('vercel.app')) {
    return hostname.includes('.') ? hostname.split('.').slice(-2).join('.') : 'ghostcrm.ai'
  }
  
  return 'ghostcrm.ai'
}

interface SuccessData {
  sessionId?: string
  promoCode?: string
  isSoftwareOwner: boolean
  shouldStartOnboarding: boolean
  userSubdomain?: string
  processed?: boolean
  gatewayError?: boolean
  subdomainStatus?: 'checking' | 'pending' | 'active' | 'error'
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
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session_id')
        const isDirect = urlParams.get('direct') === 'true'
        
        // Get auth info first to check user type
        const authResponse = await fetch('/api/auth/me')
        const authData = await authResponse.json()
        const isSoftwareOwner = authData.user?.email === 'andrei@budisteanu.net'
        const userEmail = authData.user?.email
        
        // For software owners, skip subdomain logic
        if (isSoftwareOwner) {
          setSuccessData({
            sessionId: sessionId || undefined,
            isSoftwareOwner: true,
            shouldStartOnboarding: false,
            processed: true,
            gatewayError: false,
            subdomainStatus: 'active',
            isSubdomainActivated: true
          })
          
          setTimeout(() => {
            router.push('/owner/dashboard')
          }, 3000)
          return
        }
        
        // Get user's subdomain from database
        let userSubdomain: string | null = null
        let subdomainStatus: string = 'pending'
        let isSubdomainActivated = false
        
        if (userEmail) {
          try {
            const subdomainResponse = await fetch('/api/subdomains/status', {
              credentials: 'include'
            })
            
            if (subdomainResponse.ok) {
              const subdomainData = await subdomainResponse.json()
              if (subdomainData.success) {
                userSubdomain = subdomainData.subdomain
                subdomainStatus = subdomainData.status || 'pending'
                isSubdomainActivated = subdomainStatus === 'active'
              }
            }
          } catch (error) {
            console.error('Error fetching subdomain status:', error)
            subdomainStatus = 'error'
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
          userSubdomain: userSubdomain || undefined,
          processed: true,
          gatewayError: false,
          subdomainStatus: subdomainStatus as any,
          isSubdomainActivated: isSubdomainActivated
        })
        
        // Check subdomain activation status periodically (webhook-based activation)
        if (sessionId && !isSoftwareOwner && !usedSoftwareOwnerPromo) {
          console.log('🔄 Checking webhook-based activation status...')
          
          // Poll for activation status since webhook handles the activation
          let attempts = 0;
          const maxAttempts = 24;
          
          const checkActivation = async () => {
            attempts++;
            
            try {
              const statusResponse = await fetch('/api/subdomains/status', {
                credentials: 'include',
                headers: {
                  'Cache-Control': 'no-cache',
                  'X-Webhook-Poll': attempts.toString()
                }
              });
              
              if (statusResponse.ok) {
                const statusResult = await statusResponse.json();
                
                if (statusResult.success && statusResult.status === 'active') {
                  console.log('✅ Webhook activation confirmed!');
                  const activatedSubdomain = statusResult.subdomain;
                  
                  setSuccessData(prev => ({
                    ...prev,
                    isSubdomainActivated: true,
                    subdomainStatus: 'active',
                    userSubdomain: activatedSubdomain
                  }));
                  
                  // Auto-redirect to subdomain login page after activation
                  const baseDomain = getBaseDomain();
                  console.log(`🚀 Auto-redirecting to: ${activatedSubdomain}.${baseDomain}/login`);
                  setTimeout(() => {
                    try {
                      sessionStorage.removeItem('auth_error');
                      localStorage.removeItem('auth_redirect_pending');
                    } catch (e) {
                      // Ignore storage errors
                    }
                    window.location.href = `${window.location.protocol}//${activatedSubdomain}.${baseDomain}/login`;
                  }, 2000);
                  
                  return;
                }
              }
              
              // Continue polling if not activated yet and we haven't exceeded max attempts
              if (attempts < maxAttempts) {
                setTimeout(checkActivation, 5000);
              } else {
                console.warn('⚠️ Webhook activation timeout - showing manual activation option');
                setSuccessData(prev => ({
                  ...prev,
                  subdomainStatus: 'error'
                }));
              }
            } catch (error) {
              console.warn('⚠️ Error checking activation status:', error);
              if (attempts < maxAttempts) {
                setTimeout(checkActivation, 5000);
              }
            }
          };
          
          // Start checking after a short delay to allow webhook processing
          setTimeout(checkActivation, 3000);
        }
        
      } catch (error) {
        console.error('Error checking user status:', error)
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
          credentials: 'include'
        })
        const statusResult = await statusResponse.json()
        
        if (statusResult.success && statusResult.subdomain) {
          setSuccessData(prev => ({
            ...prev,
            subdomainStatus: statusResult.status,
            isSubdomainActivated: statusResult.status === 'active',
            userSubdomain: statusResult.subdomain
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
    if (!successData.isSubdomainActivated || !successData.userSubdomain) {
      alert('Please wait for subdomain activation to complete before accessing your portal.')
      return
    }
    
    console.log(`🚀 Manual redirect to subdomain: ${successData.userSubdomain}`)
    
    // Clear any auth errors before redirect
    try {
      sessionStorage.removeItem('auth_error');
      localStorage.removeItem('auth_redirect_pending');
    } catch (e) {
      // Ignore storage errors
    }
    
    // Redirect to the actual subdomain login page
    const subdomainUrl = `https://${successData.userSubdomain}.ghostcrm.ai/login`
    window.location.href = subdomainUrl
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
  } else if (successData.subdomainStatus === 'pending') {
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
  } else if (successData.subdomainStatus === 'pending') {
    return <span className="gateway-pending">⏳ Payment successful - Subdomain activation pending</span>;
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
  } else if (successData.subdomainStatus === 'pending') {
    return 'Activation Pending - Manual Options Available';
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
  } else if (successData.subdomainStatus === 'pending') {
    return 'Your payment was successful, but subdomain activation is taking longer than expected. You can use the manual activation button below or wait a few more minutes for automatic activation.';
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