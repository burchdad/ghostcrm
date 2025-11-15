'use client'

import { Suspense, useEffect, useState } from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
        setTimeout(() => {
          if (isSoftwareOwner || usedSoftwareOwnerPromo) {
            router.push('/owner/dashboard')
          } else {
            // Start onboarding for regular clients
            router.push('/onboarding')
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
      <>
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow: hidden;
          }
          
          .loading-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse-overlay 3s ease-in-out infinite;
          }
          
          .loading-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 3rem 2rem;
            box-shadow: 
              0 20px 40px rgba(0, 0, 0, 0.1),
              0 0 0 1px rgba(255, 255, 255, 0.2);
            text-align: center;
            max-width: 400px;
            width: 90%;
            position: relative;
            z-index: 2;
          }
          
          .loading-spinner {
            width: 64px;
            height: 64px;
            border: 4px solid rgba(102, 126, 234, 0.2);
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1.5rem;
          }
          
          .loading-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .loading-text {
            color: #4a5568;
            font-size: 0.875rem;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse-overlay {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
        `}</style>
        <div className="loading-container">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <h2 className="loading-title">Processing...</h2>
            <p className="loading-text">Setting up your account...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style jsx>{`
        .success-container {
          min-height: 80vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem 1.5rem;
          position: relative;
          overflow: hidden;
        }
        
        .success-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
          animation: float-background 6s ease-in-out infinite;
        }
        
        .success-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 3rem 2rem;
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          max-width: 480px;
          width: 100%;
          position: relative;
          z-index: 2;
          animation: slide-up 0.6s ease-out;
        }
        
        .success-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .success-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 10px 25px rgba(16, 185, 129, 0.3),
            0 0 0 8px rgba(16, 185, 129, 0.1);
          animation: success-pulse 2s ease-in-out infinite;
        }
        
        .success-icon svg {
          width: 40px;
          height: 40px;
          color: white;
        }
        
        .success-title {
          font-size: 1.875rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          background: linear-gradient(135deg, #1a202c, #2d3748);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .success-subtitle {
          color: #4a5568;
          font-size: 1rem;
          line-height: 1.5;
        }
        
        .status-card {
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          color: white;
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.25);
        }
        
        .status-header {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .status-header svg {
          width: 20px;
          height: 20px;
          margin-right: 0.75rem;
          opacity: 0.9;
        }
        
        .status-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }
        
        .status-description {
          font-size: 0.875rem;
          line-height: 1.5;
          opacity: 0.95;
          margin: 0.5rem 0 0 0;
        }
        
        .promo-code {
          font-weight: 700;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          display: inline-block;
          margin-top: 0.5rem;
        }
        
        .redirect-card {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          margin-bottom: 1.5rem;
          color: white;
          text-align: center;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        
        .redirect-text {
          font-size: 0.875rem;
          margin: 0;
        }
        
        .redirect-destination {
          font-weight: 600;
        }
        
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        
        .primary-button {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        
        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
          text-decoration: none;
          color: white;
        }
        
        .secondary-button {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.8);
          color: #374151;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .secondary-button:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          text-decoration: none;
          color: #374151;
        }
        
        .support-text {
          text-align: center;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .support-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }
        
        .support-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
        
        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes success-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3), 0 0 0 8px rgba(16, 185, 129, 0.1);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 15px 35px rgba(16, 185, 129, 0.4), 0 0 0 12px rgba(16, 185, 129, 0.15);
          }
        }
        
        @keyframes float-background {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        
        @media (max-width: 640px) {
          .success-card {
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }
          
          .success-title {
            font-size: 1.5rem;
          }
          
          .success-icon {
            width: 64px;
            height: 64px;
          }
          
          .success-icon svg {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
      
      <div className="success-container">
        <div className="success-card">
          <div className="success-header">
            <div className="success-icon">
              <CheckCircleIcon />
            </div>
            <h2 className="success-title">
              {successData.isSoftwareOwner ? 'Welcome Back!' : 'Payment Successful!'}
            </h2>
            <p className="success-subtitle">
              {successData.isSoftwareOwner 
                ? 'Software Owner access confirmed. Redirecting to your dashboard...'
                : 'Thank you for your subscription. Your account has been activated.'
              }
            </p>
          </div>

          <div className="status-card">
            <div className="status-header">
              <CheckCircleIcon />
              <h3 className="status-title">
                {successData.isSoftwareOwner ? 'Software Owner Access' : 'Subscription Activated'}
              </h3>
            </div>
            <p className="status-description">
              {successData.isSoftwareOwner 
                ? 'Full system access granted. You can manage all tenants and system settings.'
                : 'Your GhostCRM subscription is now active and all features are available.'
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
                {successData.isSoftwareOwner ? 'Software Owner Dashboard' : 'Onboarding Setup'}
              </span>
              {' '}in 3 seconds...
            </p>
          </div>

          <div className="button-group">
            <Link
              href="/billing"
              className="secondary-button"
            >
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
    </>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <>
        <style jsx>{`
          .fallback-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .fallback-spinner {
            width: 64px;
            height: 64px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div className="fallback-container">
          <div className="fallback-spinner"></div>
        </div>
      </>
    }>
      <SuccessContent />
    </Suspense>
  )
}