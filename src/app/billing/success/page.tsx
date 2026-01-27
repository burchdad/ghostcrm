'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
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

function SuccessContent() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [userSubdomain, setUserSubdomain] = useState<string | null>(null)
  const [isSoftwareOwner, setIsSoftwareOwner] = useState(false)

  useEffect(() => {
    async function initializeSuccess() {
      try {
        // Get auth info to check user type
        const authResponse = await fetch('/api/auth/me')
        const authData = await authResponse.json()
        const isOwner = authData.user?.email === 'andrei@budisteanu.net'
        const userEmail = authData.user?.email
        
        setIsSoftwareOwner(isOwner)
        
        if (isOwner) {
          // Software owner redirect
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer)
                router.push('/owner/dashboard')
                return 0
              }
              return prev - 1
            })
          }, 1000)
          return
        }
        
        // Regular user - get their subdomain
        if (userEmail) {
          try {
            const subdomainResponse = await fetch('/api/subdomains/status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userEmail }),
              credentials: 'include'
            })
            
            if (subdomainResponse.ok) {
              const subdomainData = await subdomainResponse.json()
              if (subdomainData.success && subdomainData.subdomain) {
                setUserSubdomain(subdomainData.subdomain.subdomain)
              }
            }
          } catch (error) {
            console.warn('Could not fetch subdomain:', error)
          }
        }
        
        // Start countdown for redirect
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              if (userSubdomain) {
                window.location.href = `https://${userSubdomain}.${getBaseDomain()}/login`
              } else {
                router.push('/login')
              }
              return 0
            }
            return prev - 1
          })
        }, 1000)
        
      } catch (error) {
        console.error('Success page initialization error:', error)
      }
    }

    initializeSuccess()
  }, [router, userSubdomain])

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-header">
          <div className="success-icon">
            <CheckCircle className="check-icon" />
          </div>
          <h2 className="success-title">🎉 Payment Successful!</h2>
          <p className="success-subtitle">
            {isSoftwareOwner ? (
              'Welcome back! Redirecting to your owner dashboard...'
            ) : (
              <>
                Thank you for subscribing to GhostCRM!
                <br />
                <strong>📧 Check your email</strong> for your welcome guide with login instructions and next steps.
              </>
            )}
          </p>
        </div>

        <div className="redirect-card">
          <div className="redirect-info">
            <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>
              {isSoftwareOwner ? '🚀 Redirecting to Dashboard' : '🔑 Redirecting to Login'}
            </h3>
            <p style={{ margin: '0 0 15px 0', color: '#6b7280' }}>
              {isSoftwareOwner ? (
                'Taking you to your owner dashboard...'
              ) : userSubdomain ? (
                <>Taking you to <strong>{userSubdomain}.ghostcrm.ai</strong></>
              ) : (
                'Taking you to your login page...'
              )}
            </p>
            <div className="countdown">
              <span className="countdown-number">{countdown}</span>
              <span className="countdown-text">seconds</span>
            </div>
          </div>
          
          {!isSoftwareOwner && (
            <div style={{ 
              background: '#f0f9ff', 
              border: '1px solid #0ea5e9', 
              borderRadius: '8px', 
              padding: '15px', 
              marginTop: '20px',
              fontSize: '14px',
              color: '#0c4a6e'
            }}>
              <strong>💌 Don't miss your welcome email!</strong>
              <br />
              It contains your complete getting started guide, pro tips, and support information.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}