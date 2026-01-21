'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Loader2, CreditCard, CheckCircle } from 'lucide-react'

type SupabaseUser = {
  id: string
  email?: string
  email_confirmed_at?: string
  user_metadata?: {
    full_name?: string
    first_name?: string
    last_name?: string
  }
}

export default function BillingPage() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [tenantStatus, setTenantStatus] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkUserStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkUserStatus = async () => {
    try {
      // Get user session
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Check if email is verified
      if (!user.email_confirmed_at) {
        router.push('/verify-email')
        return
      }

      // Check if user already has a tenant
      const { data: userData } = await supabase
        .from('users')
        .select('tenant_id, organization_id')
        .eq('id', user.id)
        .maybeSingle()

      if (userData?.tenant_id) {
        // User already has a tenant - get subdomain and redirect
        const { data: orgData } = await supabase
          .from('organizations')
          .select('subdomain')
          .eq('id', userData.tenant_id)
          .eq('status', 'active')
          .maybeSingle()

        if (orgData?.subdomain) {
          window.location.href = `https://${orgData.subdomain}.ghostcrm.ai`
          return
        }
      }

      setTenantStatus('no-tenant')
    } catch (error) {
      console.error('Error checking user status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartPayment = async () => {
    if (!user || checkoutLoading) return

    setCheckoutLoading(true)
    
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: user.user_metadata?.full_name
            ? `${user.user_metadata.full_name}'s Organization`
            : 'My Organization',
          subdomain: '', // Let system generate
          // priceId: undefined // optional, backend will use default if not provided
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { checkout_url } = await response.json()
      
      if (checkout_url) {
        window.location.href = checkout_url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start payment process. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to GhostCRM
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Hi {user?.email}! Your email is verified. 
          </p>
          <p className="text-lg text-gray-500">
            Complete your setup by activating your subdomain.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
              <CreditCard className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Activate Your Subdomain
            </h2>
            <p className="text-gray-600">
              Get your own subdomain like <code className="bg-gray-100 px-2 py-1 rounded text-sm">yourcompany.ghostcrm.ai</code>
            </p>
          </div>

          <div className="border border-indigo-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Plan</h3>
                <p className="text-gray-600 mb-4">
                  Perfect for dealerships looking to grow with advanced CRM features, automation, and analytics.
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>• Up to 25 team members</li>
                  <li>• Up to 2,000 vehicles in inventory</li>
                  <li>• AI-powered insights & automation</li>
                  <li>• Advanced reporting & dashboards</li>
                  <li>• Priority support</li>
                </ul>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">$599</span>
                  <span className="text-lg text-gray-500 ml-1">/month</span>
                  <span className="text-sm text-gray-500 ml-2">+ $799 setup fee</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartPayment}
            disabled={checkoutLoading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {checkoutLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <CreditCard className="h-5 w-5 mr-2" />
            )}
            {checkoutLoading ? 'Creating checkout...' : 'Activate Your Subdomain'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}