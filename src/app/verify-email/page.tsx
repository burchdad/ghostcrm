'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }, [])

  useEffect(() => {
    const qpEmail = (searchParams.get('email') || '').trim().toLowerCase()
    if (qpEmail) {
      setEmail(qpEmail)
      try { sessionStorage.setItem('pending_verify_email', qpEmail) } catch {}
    } else {
      // fallback if user refreshed
      try {
        const stored = (sessionStorage.getItem('pending_verify_email') || '').trim().toLowerCase()
        if (stored) setEmail(stored)
      } catch {}
    }

    // Optional: if they *are* logged in, auto-forward once confirmed
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email_confirmed_at) {
          // Check if we're on a subdomain and redirect appropriately
          const hostname = window.location.hostname
          const isSubdomain = hostname !== 'localhost' && 
                              hostname !== '127.0.0.1' && 
                              hostname !== 'ghostcrm.ai' &&
                              hostname !== 'www.ghostcrm.ai' &&
                              (hostname.includes('.localhost') || 
                               hostname.includes('.ghostcrm.ai') ||
                               hostname.includes('.vercel.app'))
          
          // Get redirect parameter from URL if available
          const redirectPath = searchParams.get('redirect')
          
          if (isSubdomain && redirectPath) {
            // Redirect to the intended path on the subdomain
            router.push(redirectPath)
          } else if (isSubdomain) {
            // Default subdomain dashboard
            router.push('/dashboard')
          } else {
            // Main domain - go to billing
            router.push('/billing')
          }
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [router, searchParams, supabase])

  const handleResendEmail = async () => {
    if (!email || resending) return
    setResending(true)

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Failed to resend verification email')

      setResent(true)
      setTimeout(() => setResent(false), 5000)
    } catch (e) {
      console.error(e)
      alert('Failed to resend verification email. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const handleBackToSignIn = () => router.push('/login')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>

          <p className="text-gray-600 mb-6">We sent a verification link to:</p>

          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="font-medium text-gray-900">
              {email || 'your email address'}
            </p>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Click the link in the email to verify your account and continue setting up your GhostCRM subdomain.
          </p>

          {resent && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-green-600">Verification email sent!</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={resending || !email}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {resending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>

            <button
              onClick={handleBackToSignIn}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign in
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Didn&apos;t receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}