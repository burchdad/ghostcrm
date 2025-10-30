'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Check, 
  CreditCard, 
  Shield, 
  Users, 
  Star,
  ArrowRight,
  Sparkles,
  Zap,
  Building2
} from 'lucide-react'

// Company-level pricing plans
const COMPANY_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small dealerships getting started',
    price: 299,
    setupFee: 799, // Increased setup fee to reflect value
    popular: false,
    maxUsers: 5,
    maxVehicles: 500,
    icon: Building2,
    features: [
      'Up to 5 team members',
      'Up to 500 vehicles in inventory',
      'Core CRM & lead management',
      'Basic reporting & analytics',
      'Email & SMS integration',
      'Mobile app access',
      'Customer portal',
      'Standard support',
      'Basic integrations (DMS, websites)',
      'Standard security & backups'
    ],
    limitations: [
      'Limited advanced AI features',
      'Basic automation workflows',
      'Standard reporting only'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Enhanced tools for growing dealerships',
    price: 599,
    setupFee: 799,
    popular: true,
    maxUsers: 25,
    maxVehicles: 2000,
    icon: Users,
    features: [
      'Up to 25 team members',
      'Up to 2,000 vehicles in inventory',
      'Everything in Starter, plus:',
      'Advanced AI-powered insights',
      'Advanced automation workflows',
      'Custom reporting & dashboards',
      'Advanced integrations (F&I, lenders)',
      'Team performance analytics',
      'Advanced customer segmentation',
      'Priority support',
      'API access for custom integrations',
      'Enhanced security & compliance'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Complete solution for large dealership groups',
    price: 999,
    setupFee: 799,
    popular: false,
    maxUsers: 'Unlimited',
    maxVehicles: 'Unlimited',
    icon: Sparkles,
    features: [
      'Unlimited team members',
      'Unlimited vehicles in inventory',
      'Everything in Professional, plus:',
      'Advanced AI & machine learning',
      'Custom workflow automation',
      'White-label customer portal',
      'Multi-location management',
      'Advanced API & webhook access',
      'Custom integrations & development',
      'Dedicated account manager',
      'Premium support (phone, chat, email)',
      'Enterprise security & compliance',
      'Custom training & onboarding'
    ]
  }
]

export default function BillingPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string>('professional') // Default to popular plan
  const [loading, setLoading] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState<{ type: 'percentage' | 'fixed', value: number, description: string } | null>(null)
  const [promoError, setPromoError] = useState('')
  const [showPromoSection, setShowPromoSection] = useState(false)
  
  const selectedPlanData = COMPANY_PLANS.find(plan => plan.id === selectedPlan)

  // Promo code validation
  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code')
      return
    }

    setPromoError('')
    try {
      // You can replace this with your actual promo code validation API
      const response = await fetch('/api/billing/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.toUpperCase() })
      })

      if (response.ok) {
        const discount = await response.json()
        setPromoDiscount(discount)
        setPromoError('')
      } else {
        setPromoError('Invalid promo code')
        setPromoDiscount(null)
      }
    } catch (error) {
      // For demo purposes, let's add some hardcoded promo codes
      const validPromoCodes: Record<string, { type: 'percentage' | 'fixed', value: number, description: string }> = {
        'SAVE20': { type: 'percentage', value: 20, description: '20% off first month' },
        'NEWCLIENT': { type: 'fixed', value: 100, description: '$100 off setup fee' },
        'LAUNCH50': { type: 'percentage', value: 50, description: '50% off first month' }
      }

      const upperCode = promoCode.toUpperCase()
      if (validPromoCodes[upperCode]) {
        setPromoDiscount(validPromoCodes[upperCode])
        setPromoError('')
      } else {
        setPromoError('Invalid promo code')
        setPromoDiscount(null)
      }
    }
  }

  // Calculate pricing with promo discount
  const calculatePricing = () => {
    if (!selectedPlanData) return { monthly: 0, setup: 799, total: 799 }
    
    let monthly = selectedPlanData.price
    let setup = selectedPlanData.setupFee
    
    if (promoDiscount) {
      if (promoDiscount.type === 'percentage') {
        monthly = monthly * (1 - promoDiscount.value / 100)
      } else {
        setup = Math.max(0, setup - promoDiscount.value)
      }
    }
    
    return {
      monthly: Math.round(monthly),
      setup: Math.round(setup),
      total: Math.round(monthly + setup),
      originalMonthly: selectedPlanData.price,
      originalSetup: selectedPlanData.setupFee
    }
  }

  const pricing = calculatePricing()

  const handleCheckout = async () => {
    if (!selectedPlanData) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          planName: selectedPlanData.name,
          monthlyPrice: pricing.monthly,
          setupFee: pricing.setup,
          promoCode: promoCode || null,
          promoDiscount: promoDiscount,
          returnUrl: `${window.location.origin}/onboarding`,
          cancelUrl: window.location.href
        })
      })

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (result.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
        <div className="relative pt-16 pb-12 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Choose Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Company Plan</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Select the perfect plan for your dealership. All plans include our comprehensive setup and onboarding process.
            </p>

            {/* Promo Code Section */}
            <div className="mb-8">
              <button
                onClick={() => setShowPromoSection(!showPromoSection)}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-2 mx-auto"
              >
                {showPromoSection ? '− Hide promo code' : '+ Have a promo code?'}
              </button>
              
              {showPromoSection && (
                <div className="mt-4 max-w-md mx-auto">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter promo code"
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                      onKeyPress={(e) => e.key === 'Enter' && validatePromoCode()}
                    />
                    <button
                      onClick={validatePromoCode}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  
                  {promoError && (
                    <p className="text-red-400 text-sm mt-2">{promoError}</p>
                  )}
                  
                  {promoDiscount && (
                    <div className="mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-green-400">
                        <Check className="w-4 h-4" />
                        <span className="font-medium">Promo code applied!</span>
                      </div>
                      <p className="text-green-300 text-sm mt-1">{promoDiscount.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Plan Summary */}
            {selectedPlanData && (
              <div className="inline-flex items-center gap-6 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {pricing.setup !== pricing.originalSetup ? (
                      <div>
                        <span className="line-through text-gray-400 text-lg">${pricing.originalSetup}</span>
                        <span className="ml-2">${pricing.setup}</span>
                      </div>
                    ) : (
                      `$${pricing.setup}`
                    )}
                  </div>
                  <div className="text-sm text-gray-300">Setup Fee</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {pricing.monthly !== pricing.originalMonthly ? (
                      <div>
                        <span className="line-through text-gray-400 text-lg">${pricing.originalMonthly}</span>
                        <span className="ml-2">${pricing.monthly}</span>
                      </div>
                    ) : (
                      `$${pricing.monthly}`
                    )}
                    <span className="text-gray-400">/mo</span>
                  </div>
                  <div className="text-sm text-gray-300">Monthly Total</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ${pricing.total}
                  </div>
                  <div className="text-sm text-gray-300">First Month</div>
                  {promoDiscount && (
                    <div className="text-xs text-green-400 mt-1">Promo applied!</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          {COMPANY_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id
            const Icon = plan.icon

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10 transform scale-105'
                    : plan.popular
                    ? 'border-purple-400/50 bg-white/5 hover:border-purple-400'
                    : 'border-gray-600 bg-white/5 hover:border-gray-500'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center mb-6">
                    <Icon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-300 text-sm">{plan.description}</p>
                  </div>

                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-white mb-1">
                      ${plan.price}
                      <span className="text-lg text-gray-300 font-normal">/month</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      + ${plan.setupFee} one-time setup
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="text-sm font-medium text-purple-300 mb-2">
                      Team Size: {plan.maxUsers} • Vehicles: {plan.maxVehicles}
                    </div>
                    
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}

                    {plan.limitations && plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start gap-3 opacity-60">
                        <div className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-500">×</div>
                        <span className="text-gray-400 text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'border border-gray-600 text-gray-300 hover:border-purple-500 hover:text-white'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPlan(plan.id)
                    }}
                  >
                    {isSelected ? '✓ Selected' : 'Select Plan'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Checkout Button */}
        <div className="text-center mt-12">
          <button
            onClick={handleCheckout}
            disabled={loading || !selectedPlan}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Start {selectedPlanData?.name} Plan
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          
          <p className="text-gray-400 text-sm mt-4">
            Secure checkout powered by Stripe • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  )
}