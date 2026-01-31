'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function VerifyCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Create Supabase client
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Get the current URL with fragments
        const url = new URL(window.location.href)
        
        console.log('[VERIFY-CALLBACK] Processing auth callback:', {
          hash: window.location.hash,
          search: window.location.search,
          hasAccessToken: window.location.hash.includes('access_token'),
          hasError: url.searchParams.get('error')
        })

        // Check for error in query params first
        const error = url.searchParams.get('error')
        if (error && error !== 'invalid_verification') {
          console.error('[VERIFY-CALLBACK] Auth error:', error)
          setStatus('error')
          setMessage('Authentication failed. Please try again.')
          setTimeout(() => router.push('/login'), 2000)
          return
        }

        // Handle the auth callback (this processes URL fragments automatically)
        const { data, error: authError } = await supabase.auth.getSession()

        if (authError) {
          console.error('[VERIFY-CALLBACK] Session error:', authError)
          setStatus('error')
          setMessage('Failed to establish session. Please try signing in.')
          setTimeout(() => router.push('/login'), 2000)
          return
        }

        const user = data.session?.user
        if (!user) {
          console.error('[VERIFY-CALLBACK] No user session found')
          setStatus('error')
          setMessage('No valid session found. Please try signing in.')
          setTimeout(() => router.push('/login'), 2000)
          return
        }

        console.log('[VERIFY-CALLBACK] User authenticated successfully:', {
          userId: user.id,
          email: user.email,
          emailVerified: !!user.email_confirmed_at,
          metadata: user.user_metadata
        })

        setStatus('success')
        setMessage('Email verified successfully! Redirecting...')

        // Check user's organization status to determine redirect
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('tenant_id, organization_id')
          .eq('id', user.id)
          .maybeSingle()

        if (userError) {
          console.error('[VERIFY-CALLBACK] User lookup failed:', userError)
          // Continue with fallback redirect
        }

        // 🎯 NEW USERS (no organization) should go to billing to select plan
        if (!userData?.organization_id) {
          console.log('[VERIFY-CALLBACK] New user without organization, redirecting to billing')
          router.push('/billing?welcome=true')
          return
        }

        // 🎯 EXISTING USERS with organization - check for active subdomain
        if (userData?.organization_id) {
          const { data: subdomainData, error: subdomainError } = await supabase
            .from('subdomains')
            .select('subdomain, status')
            .eq('organization_id', userData.organization_id)
            .eq('status', 'active')
            .maybeSingle()

          if (subdomainError) {
            console.error('[VERIFY-CALLBACK] Subdomain lookup failed:', subdomainError)
          }

          // Redirect to subdomain if available
          if (subdomainData?.subdomain && window.location.hostname === 'ghostcrm.ai') {
            const subdomainUrl = `https://${subdomainData.subdomain}.ghostcrm.ai/dashboard?verified=true`
            window.location.href = subdomainUrl
            return
          }
        }

        // Fallback: redirect to dashboard/login with verified flag
        router.push('/login?verified=true')

      } catch (error) {
        console.error('[VERIFY-CALLBACK] Unexpected error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
        setTimeout(() => router.push('/login'), 2000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Verifying your email...</h1>
            <p className="text-gray-600">Please wait while we complete your email verification.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}