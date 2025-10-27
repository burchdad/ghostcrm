'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Check, 
  Plus, 
  Minus, 
  CreditCard, 
  Shield, 
  Users, 
  Star,
  ArrowRight,
  Calculator,
  Sparkles,
  Lock
} from 'lucide-react'
import { PRICING_CONFIG, calculateGrandTotal, SETUP_FEE } from '@/lib/pricing'

interface SelectedUser {
  role: string
  tier: string
  count: number
}

export default function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([])
  const [step, setStep] = useState(1) // 1: Select Plans, 2: Review & Pay
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false)

  // Initialize with basic admin user
  useEffect(() => {
    setSelectedUsers([
      { role: 'admin', tier: 'admin_pro', count: 1 }
    ])
  }, [])

  const totals = calculateGrandTotal(selectedUsers, true)

  const addUser = (role: string, tier: string) => {
    setSelectedUsers(prev => {
      const existing = prev.find(u => u.role === role && u.tier === tier)
      if (existing) {
        return prev.map(u => 
          u.role === role && u.tier === tier 
            ? { ...u, count: u.count + 1 }
            : u
        )
      } else {
        return [...prev, { role, tier, count: 1 }]
      }
    })
  }

  const removeUser = (role: string, tier: string) => {
    setSelectedUsers(prev => 
      prev.map(u => 
        u.role === role && u.tier === tier 
          ? { ...u, count: Math.max(0, u.count - 1) }
          : u
      ).filter(u => u.count > 0)
    )
  }

  const getUserCount = (role: string, tier: string): number => {
    const user = selectedUsers.find(u => u.role === role && u.tier === tier)
    return user?.count || 0
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      // Get user email from localStorage or search params for mock billing
      let userEmail = localStorage.getItem('userEmail') || searchParams.get('email')
      
      if (isDevelopmentMode) {
        console.log('🧪 Using mock billing for development...')
        
        // Use mock billing endpoint
        const response = await fetch('/api/billing/mock-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedUsers,
            setupFee: SETUP_FEE,
            returnUrl: `${window.location.origin}/onboarding`,
            cancelUrl: window.location.href,
            userEmail: userEmail
          })
        })

        const result = await response.json()
        
        if (result.error) {
          throw new Error(result.error)
        }

        console.log('🎉 Mock billing completed:', result)
        alert(`Mock billing completed! Organization "${result.organization.name}" created successfully.`)
        
        // Redirect to onboarding
        router.push(result.url)
        
      } else {
        // Create Stripe checkout session
        const response = await fetch('/api/billing/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedUsers,
            setupFee: SETUP_FEE,
            returnUrl: `${window.location.origin}/onboarding`,
            cancelUrl: window.location.href
          })
        })

        const { url, error } = await response.json()
        
        if (error) {
          throw new Error(error)
        }

        // Redirect to Stripe Checkout
        window.location.href = url
      }
      
    } catch (error) {
      console.error('Checkout error:', error)
      alert(`Failed to process checkout: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-full text-purple-200 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Professional CRM Setup
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Choose Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Team Plan</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Build your perfect CRM team with role-based pricing. Start with our one-time setup fee, 
              then pay monthly per user based on their access level.
            </p>

            {/* Pricing Summary */}
            <div className="inline-flex items-center gap-6 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${totals.setup}</div>
                <div className="text-sm text-gray-300">Setup Fee</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${totals.monthly}/mo</div>
                <div className="text-sm text-gray-300">Monthly Total</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ${totals.firstMonth}
                </div>
                <div className="text-sm text-gray-300">First Month</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {PRICING_CONFIG.map((roleConfig) => (
          <div key={roleConfig.role} className="mb-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="text-3xl">{roleConfig.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">{roleConfig.displayName}</h2>
                  <p className="text-gray-300">{roleConfig.description}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {roleConfig.tiers.map((tier) => {
                const userCount = getUserCount(roleConfig.role, tier.id)
                const isPopular = tier.popular

                return (
                  <div
                    key={tier.id}
                    className={`relative bg-white/5 backdrop-blur-md border rounded-2xl p-6 ${
                      isPopular 
                        ? 'border-purple-500/50 ring-2 ring-purple-500/20' 
                        : 'border-white/10'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">
                          <Star className="w-3 h-3" />
                          Most Popular
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                      <p className="text-gray-300 text-sm mb-4">{tier.description}</p>
                      <div className="text-3xl font-bold text-white">
                        ${tier.price}
                        <span className="text-base font-normal text-gray-300">/user/mo</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {tier.limitations && (
                      <div className="space-y-2 mb-6 pt-4 border-t border-white/10">
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Limitations</div>
                        {tier.limitations.map((limitation, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-4 h-4 rounded-full border border-gray-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-400 text-xs">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeUser(roleConfig.role, tier.id)}
                          disabled={userCount === 0}
                          className="w-8 h-8 rounded-full border border-white/20 bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <div className="w-12 text-center">
                          <span className="text-white font-semibold">{userCount}</span>
                        </div>
                        
                        <button
                          onClick={() => addUser(roleConfig.role, tier.id)}
                          className="w-8 h-8 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {userCount > 0 && (
                        <div className="text-right">
                          <div className="text-white font-semibold">
                            ${tier.price * userCount}/mo
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Checkout Section */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Get Started?</h3>
              <p className="text-gray-300">
                Your team configuration is ready. Complete your purchase to begin the onboarding process.
              </p>
            </div>

            {/* Order Summary */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-gray-300">One-time Setup Fee</span>
                <span className="text-white font-semibold">${totals.setup}</span>
              </div>
              
              {selectedUsers.map((user, index) => {
                const roleConfig = PRICING_CONFIG.find(r => r.role === user.role)
                const tier = roleConfig?.tiers.find(t => t.id === user.tier)
                
                return (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span className="text-gray-300">
                      {user.count}x {roleConfig?.displayName} ({tier?.name})
                    </span>
                    <span className="text-white font-semibold">
                      ${(tier?.price || 0) * user.count}/mo
                    </span>
                  </div>
                )
              })}
              
              <div className="flex justify-between items-center py-3 border-t border-white/10">
                <span className="text-white font-semibold">Monthly Subtotal</span>
                <span className="text-white font-semibold">${totals.monthly}/mo</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-t border-white/10">
                <span className="text-xl font-bold text-white">First Month Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ${totals.firstMonth}
                </span>
              </div>
            </div>

            {/* Development Mode Toggle */}
            <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="devMode"
                  checked={isDevelopmentMode}
                  onChange={(e) => setIsDevelopmentMode(e.target.checked)}
                  className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
                />
                <label htmlFor="devMode" className="text-yellow-200 font-medium">
                  🧪 Development Mode (Skip Stripe & Create Test Organization)
                </label>
              </div>
              {isDevelopmentMode && (
                <p className="text-yellow-300 text-sm mt-2">
                  This will bypass Stripe payment and create a test organization directly for development purposes.
                </p>
              )}
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || selectedUsers.length === 0}
              className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              <CreditCard className="w-5 h-5" />
              {loading 
                ? 'Processing...' 
                : isDevelopmentMode 
                  ? 'Create Test Organization' 
                  : 'Complete Purchase & Setup'
              }
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-400">
              <Lock className="w-4 h-4" />
              Secured by Stripe • 30-day money-back guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
