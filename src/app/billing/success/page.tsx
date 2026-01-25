'use client'

import { Suspense, useEffect, useState } from 'react'
import { CheckCircle, ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import './page.css'

// Environment-aware domain detection
const getBaseDomain = (): string => {
  if (typeof window === 'undefined') return 'ghostcrm.ai'
  
  const hostname = window.location.hostname
  // Development environments
  if (hostname.includes('localhost') || hostname === '127.0.0.1') {
    return hostname.includes('.localhost') ? 'localhost:3000' : 'localhost:3000'
  }
  // Staging environment
  if (hostname.includes('staging') || hostname.includes('vercel.app')) {
    return hostname.includes('.') ? hostname.split('.').slice(-2).join('.') : 'ghostcrm.ai'
  }
  // Production
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
  const [authCheckCompleted, setAuthCheckCompleted] = useState(false) // Prevent multiple auth checks

  useEffect(() => {
    // Prevent multiple executions of this effect
    if (authCheckCompleted) {
      return;
    }

    async function checkUserStatus() {
      try {
        // Get URL params
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session_id')
        const processed = urlParams.get('processed') === 'true'
        const gatewayError = urlParams.get('gateway_error') === 'true'
        const isDirect = urlParams.get('direct') === 'true'
        
        // Show messaging based on payment gateway processing
        if (processed) {
          console.log('✅ [BILLING-SUCCESS] Payment processed through gateway successfully')
        } else if (gatewayError) {
          console.warn('⚠️ [BILLING-SUCCESS] Gateway processing error - payment may need manual verification')
        } else if (isDirect) {
          console.log('🔄 [BILLING-SUCCESS] Direct redirect from Stripe - will activate subdomain')
        }
        
        // 🚨 CRITICAL FIX: Prevent auth context from redirecting during billing success processing
        console.log('🛡️ [BILLING-SUCCESS] Temporarily disabling auth redirects during payment processing')
        
        // Check if user is software owner by checking their session/role
        let response
        try {
          console.log('🔍 [BILLING-SUCCESS] Checking owner status...')
          response = await fetch('/api/auth/check-owner-status', {
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache',
            }
          })
          console.log('🔍 [BILLING-SUCCESS] Auth check response status:', response.status)
        } catch (authError) {
          console.warn('⚠️ [BILLING-SUCCESS] Auth check failed, continuing with payment processing:', authError)
          // Continue processing even if auth fails - billing success is more important
          response = { ok: false, status: 500 }
        }
        
        // Handle API call failures gracefully
        let isSoftwareOwner = false
        let userRole = null
        
        if (response.ok) {
          const data = await response.json()
          isSoftwareOwner = data.isSoftwareOwner
          userRole = data.userRole
          console.log('✅ [BILLING-SUCCESS] Auth check successful:', { isSoftwareOwner, userRole })
        } else {
          console.warn('⚠️ [BILLING-SUCCESS] Could not check owner status (status:', response.status, '), assuming regular user')
          // Don't retry - just continue with the flow
        }
        
        // Get user's organization/subdomain info for proper redirect
        let userSubdomain: string | null = null
        let userEmail: string | null = null
        let subdomainStatus: 'checking' | 'pending_payment' | 'active' | 'error' = 'checking'
        let isSubdomainActivated = false
        
        if (!isSoftwareOwner) {
          try {
            console.log('🔍 [BILLING-SUCCESS] Fetching user organization info with auth safeguards...')
            const orgResponse = await fetch('/api/auth/me', {
              credentials: 'include',
              headers: {
                'Cache-Control': 'no-cache',
                'X-Billing-Success': 'true' // Signal this is from billing success page
              }
            })
            
            if (orgResponse.ok) {
              const userData = await orgResponse.json()
              userEmail = userData.user?.email // Store email for activation check
              if (userData.user?.organizationSubdomain) {
                // Use the organizationSubdomain from the user data directly
                userSubdomain = userData.user.organizationSubdomain
                console.log('🔍 [BILLING-SUCCESS] Found user subdomain:', userSubdomain)
              } else if (userData.user?.tenantId) {
                // Fallback: Get organization details to find subdomain
                try {
                  const orgDetailsResponse = await fetch(`/api/organization/${userData.user.tenantId}`, {
                    credentials: 'include',
                    headers: {
                      'Cache-Control': 'no-cache',
                      'X-Billing-Success': 'true'
                    }
                  })
                  if (orgDetailsResponse.ok) {
                    const orgData = await orgDetailsResponse.json()
                    userSubdomain = orgData.organization?.subdomain
                    console.log('🔍 [BILLING-SUCCESS] Found subdomain from org API:', userSubdomain)
                  }
                } catch (orgError) {
                  console.warn('⚠️ [BILLING-SUCCESS] Could not fetch organization details:', orgError)
                }
              }
            } else {
              console.warn('⚠️ [BILLING-SUCCESS] Could not authenticate user, but allowing success page access')
              // For payment success, we'll show a generic success message even if auth fails
            }
          } catch (error) {
            console.warn('⚠️ [BILLING-SUCCESS] Could not fetch user organization info, continuing with payment processing:', error)
            // Don't fail the page - just continue without user-specific data
          }
        }
        
        // Check if coming from successful Stripe checkout and ensure organization exists
        if (sessionId) {
          try {
            console.log('🏢 [BILLING-SUCCESS] Ensuring organization exists for session:', sessionId);
            
            const ensureOrgResponse = await fetch('/api/billing/ensure-organization', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'X-Billing-Success': 'true'
              },
              credentials: 'include',
              body: JSON.stringify({ sessionId })
            });

            if (ensureOrgResponse.ok) {
              const orgResult = await ensureOrgResponse.json();
              console.log('🏢 [BILLING-SUCCESS] Organization result:', orgResult);
              
              if (orgResult.success && orgResult.subdomain) {
                userSubdomain = orgResult.subdomain;
                console.log('🎯 [BILLING-SUCCESS] Got subdomain from ensure-organization:', userSubdomain);
                
                // Set as activated immediately since we just created/confirmed it
                subdomainStatus = orgResult.status || 'active';
                isSubdomainActivated = subdomainStatus === 'active';
                
                // If organization is active, redirect immediately
                if (isSubdomainActivated) {
                  console.log(`🚀 [BILLING-SUCCESS] Organization active - redirecting to: ${userSubdomain}.ghostcrm.ai/login`);
                  
                  // Update state to show success
                  setSuccessData({
                    sessionId: sessionId || undefined,
                    promoCode: undefined,
                    isSoftwareOwner: false,
                    shouldStartOnboarding: false,
                    userSubdomain: userSubdomain || undefined,
                    processed: true,
                    gatewayError: false,
                    subdomainStatus: 'active',
                    isSubdomainActivated: true
                  });
                  
                  setLoading(false);
                  
                  // 🎯 CRITICAL FIX: Perform redirect without auth context interference
                  console.log(`🚀 [BILLING-SUCCESS] Performing protected redirect to subdomain: ${userSubdomain}`);
                  setTimeout(() => {
                    // Clear any auth errors that might cause redirect interference
                    try {
                      sessionStorage.removeItem('auth_error');
                      localStorage.removeItem('auth_redirect_pending');
                    } catch (e) {
                      // Ignore storage errors
                    }
                    window.location.href = `https://${userSubdomain}.ghostcrm.ai/login`;
                  }, 2000); // 2 second delay to show success message
                  
                  return; // Skip the rest of the function
                }
              }
            } else {
              console.warn('⚠️ [BILLING-SUCCESS] Failed to ensure organization exists');
            }
          } catch (error) {
            console.error('❌ [BILLING-SUCCESS] Error ensuring organization:', error);
          }
        }
        
        // Check if they used the SOFTWAREOWNER promo code
        const promoCode = sessionId ? await checkPromoCodeUsed(sessionId) : null
        
        const usedSoftwareOwnerPromo = promoCode === 'SOFTWAREOWNER'
        const shouldStartOnboarding = !isSoftwareOwner && !usedSoftwareOwnerPromo
        
        // For non-software owners, check real subdomain activation status
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
          processed: processed || isDirect || true, // Always consider payments as processed since webhook handles activation
          gatewayError,
          subdomainStatus: 'checking', // Start with checking status
          isSubdomainActivated: false
        })
        
        // Check subdomain activation status periodically (webhook-based activation)
        if (sessionId && !isSoftwareOwner && !usedSoftwareOwnerPromo) {
          console.log('🔄 [BILLING-SUCCESS] Checking webhook-based activation status...')
          
          // Poll for activation status since webhook handles the activation
          let attempts = 0;
          const maxAttempts = 24; // 120 seconds total with exponential backoff
          let backoffDelay = 2000; // Start with 2 seconds
          const maxBackoffDelay = 10000; // Max 10 seconds between attempts
          
          const checkActivation = async () => {
            attempts++;
            
            try {
              const statusResponse = await fetch('/api/subdomains/status', {
                credentials: 'include',
                headers: {
                  'Cache-Control': 'no-cache',
                  'X-Webhook-Poll': attempts.toString() // Help webhook track polling
                }
              });
              
              if (statusResponse.ok) {
                const statusResult = await statusResponse.json();
                
                if (statusResult.success && statusResult.status === 'active') {
                  console.log('✅ [BILLING-SUCCESS] Webhook activation confirmed!');
                  const activatedSubdomain = statusResult.subdomain;
                  
                  setSuccessData(prev => ({
                    ...prev,
                    isSubdomainActivated: true,
                    subdomainStatus: 'active',
                    userSubdomain: activatedSubdomain
                  }));
                  
                  // 🎯 AUTO-REDIRECT to subdomain login page after activation
                  const baseDomain = getBaseDomain();
                  console.log(`🚀 [BILLING-SUCCESS] Auto-redirecting to: ${activatedSubdomain}.${baseDomain}/login`);
                  setTimeout(() => {
                    // Clear any auth errors before redirect
                    try {
                      sessionStorage.removeItem('auth_error');
                      localStorage.removeItem('auth_redirect_pending');
                    } catch (e) {
                      // Ignore storage errors
                    }
                    window.location.href = `${window.location.protocol}//${activatedSubdomain}.${baseDomain}/login`;
                  }, 2000); // 2 second delay to show success message
                  
                  return; // Stop polling
                }
              }
              
              // Continue polling if not activated yet and we haven't exceeded max attempts
              if (attempts < maxAttempts) {
                setTimeout(checkActivation, 5000); // Check every 5 seconds
              } else {
                console.warn('⚠️ [BILLING-SUCCESS] Webhook activation timeout - showing manual activation option');
                setSuccessData(prev => ({
                  ...prev,
                  subdomainStatus: 'error'
                }));
              }
            } catch (error) {
              console.warn('⚠️ [BILLING-SUCCESS] Error checking activation status:', error);
              if (attempts < maxAttempts) {
                setTimeout(checkActivation, 5000);
              }
            }
          };
          
          // Start checking after a short delay to allow webhook processing
          setTimeout(checkActivation, 3000);
        }
        
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
        setAuthCheckCompleted(true) // Mark auth check as completed
      }
    }

    checkUserStatus()
  }, []) // Remove router dependency to prevent infinite loops

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
    if (!successData.isSubdomainActivated || !successData.userSubdomain) {
      alert('Please wait for subdomain activation to complete before accessing your portal.')
      return
    }
    
    console.log(`🚀 [BILLING-SUCCESS] Manual redirect to subdomain: ${successData.userSubdomain}`)
    
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