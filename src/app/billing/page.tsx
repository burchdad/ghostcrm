'use client'

import React, { useState, useEffect } from 'react'
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
  Building2,
  TrendingUp,
  Clock,
  Award,
  Rocket,
  Target,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react'

// Company-level pricing plans with enhanced features
const COMPANY_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small dealerships getting started',
    price: 299,
    setupFee: 799,
    popular: false,
    maxUsers: 5,
    maxVehicles: 500,
    icon: Building2,
    badge: 'Great for beginners',
    color: 'from-blue-500 to-cyan-500',
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
    ],
    roi: '3x ROI in first year',
    setupTime: '2-3 days'
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
    badge: 'Most Popular',
    color: 'from-purple-500 to-pink-500',
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
    ],
    roi: '5x ROI in first year',
    setupTime: '3-5 days'
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
    badge: 'Maximum Power',
    color: 'from-amber-500 to-orange-500',
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
    ],
    roi: '7x ROI in first year',
    setupTime: '5-7 days'
  }
]

// Testimonials for social proof
const TESTIMONIALS = [
  {
    name: 'Sarah Johnson',
    role: 'General Manager',
    company: 'Premier Auto Group',
    image: '👩‍💼',
    quote: 'GhostCRM increased our lead conversion by 45% in just 3 months. The ROI is incredible!',
    rating: 5
  },
  {
    name: 'Mike Rodriguez',
    role: 'Sales Director',
    company: 'Rodriguez Motors',
    image: '👨‍💼',
    quote: 'The automation features saved us 20 hours per week. Our team can focus on selling, not paperwork.',
    rating: 5
  },
  {
    name: 'Jennifer Chen',
    role: 'Owner',
    company: 'Elite Auto Sales',
    image: '👩‍💼',
    quote: 'Best investment we\'ve made. Customer satisfaction up 60%, and our team loves the mobile app.',
    rating: 5
  }
]

// FAQ data
const FAQ_DATA = [
  {
    question: 'How quickly can we get started?',
    answer: 'Most dealerships are fully operational within 3-5 business days. Our onboarding team handles the entire setup process.'
  },
  {
    question: 'Is there a long-term contract?',
    answer: 'No long-term contracts required. You can cancel anytime with 30 days notice. We offer a 30-day money-back guarantee.'
  },
  {
    question: 'What integrations do you support?',
    answer: 'We integrate with 200+ popular dealership tools including major DMS systems, F&I providers, and marketing platforms.'
  },
  {
    question: 'Do you provide training and support?',
    answer: 'Yes! Every plan includes comprehensive onboarding, training, and ongoing support. Enterprise plans get a dedicated account manager.'
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
  const [showFAQ, setShowFAQ] = useState(false)
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null)
  const [isAnnual, setIsAnnual] = useState(false) // Toggle for annual/monthly pricing
  
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
      // For now, we'll use placeholder price IDs. In production, these should be from your Stripe dashboard
      const priceIds = {
        starter: 'price_starter_monthly', // Replace with actual Stripe price ID
        professional: 'price_professional_monthly', // Replace with actual Stripe price ID
        enterprise: 'price_enterprise_monthly' // Replace with actual Stripe price ID
      }

      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceIds[selectedPlan as keyof typeof priceIds],
          planId: selectedPlan,
          successUrl: `${window.location.origin}/billing/success`,
          cancelUrl: `${window.location.origin}/billing/cancel`,
          tenantId: 'current-tenant-id', // Get from auth context
          trialDays: 14
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30" />
        <div className="absolute -top-1/2 -right-1/2 w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[600px] h-[600px] bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-amber-500/20 rounded-full blur-3xl animate-pulse delay-3000" />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header Section */}
      <div className="relative z-10">
        <div className="relative pt-24 pb-20 text-center">
          <div className="max-w-6xl mx-auto px-6">
            {/* Enhanced trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12 text-sm text-gray-300">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="font-medium">Secure & Compliant</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                <Award className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Industry Leader</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="font-medium">10,000+ Dealerships</span>
              </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-none tracking-tight">
              Choose Your 
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent block mt-2">
                Success Plan
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-16 leading-relaxed">
              Join thousands of dealerships increasing sales by{' '}
              <span className="text-green-400 font-bold text-3xl">40%+</span>{' '}
              with our AI-powered CRM. 
              <br className="hidden md:block" />
              All plans include{' '}
              <span className="text-blue-400 font-semibold">white-glove setup</span>{' '}
              and{' '}
              <span className="text-purple-400 font-semibold">dedicated support</span>.
            </p>

            {/* Enhanced Annual/Monthly Toggle */}
            <div className="flex items-center justify-center gap-6 mb-12 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <span className={`text-lg font-semibold transition-all duration-300 ${!isAnnual ? 'text-white scale-110' : 'text-gray-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 ${
                  isAnnual ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform duration-300 shadow-lg ${
                    isAnnual ? 'translate-x-11' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-lg font-semibold transition-all duration-300 ${isAnnual ? 'text-white scale-110' : 'text-gray-400'}`}>
                Annual
                <span className="text-green-400 text-sm ml-2 font-bold bg-green-400/20 px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </span>
            </div>

            {/* Enhanced Promo Code Section */}
            <div className="mb-16">
              <button
                onClick={() => setShowPromoSection(!showPromoSection)}
                className="group flex items-center gap-3 mx-auto px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-purple-300 hover:text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <Sparkles className="w-6 h-6" />
                <span className="font-medium">
                  {showPromoSection ? 'Hide promo code' : 'Have a promo code?'}
                </span>
                {showPromoSection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {showPromoSection && (
                <div className="mt-8 max-w-lg mx-auto transform transition-all duration-500 ease-out">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter promo code"
                      className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/30 transition-all text-lg font-medium"
                      onKeyPress={(e) => e.key === 'Enter' && validatePromoCode()}
                    />
                    <button
                      onClick={validatePromoCode}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Apply
                    </button>
                  </div>
                  
                  {promoError && (
                    <div className="mt-6 p-6 bg-red-500/20 border border-red-500/30 rounded-2xl backdrop-blur-md">
                      <div className="flex items-center gap-3">
                        <X className="w-5 h-5 text-red-400" />
                        <p className="text-red-400 font-medium">{promoError}</p>
                      </div>
                    </div>
                  )}
                  
                  {promoDiscount && (
                    <div className="mt-6 p-6 bg-green-500/20 border border-green-500/30 rounded-2xl backdrop-blur-md">
                      <div className="flex items-center gap-3 text-green-400 mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="font-bold text-lg">Promo code applied!</span>
                      </div>
                      <p className="text-green-300 font-medium">{promoDiscount.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Selected Plan Summary */}
            {selectedPlanData && (
              <div className="inline-flex items-center gap-10 px-12 py-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl">
                <div className="text-center">
                  <div className="text-4xl font-black text-white mb-1">
                    {pricing.setup !== pricing.originalSetup ? (
                      <div>
                        <span className="line-through text-gray-400 text-2xl">${pricing.originalSetup}</span>
                        <span className="ml-3">${pricing.setup}</span>
                      </div>
                    ) : (
                      `$${pricing.setup}`
                    )}
                  </div>
                  <div className="text-sm text-gray-300 font-medium">Setup Fee</div>
                </div>
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
                <div className="text-center">
                  <div className="text-4xl font-black text-white mb-1">
                    {pricing.monthly !== pricing.originalMonthly ? (
                      <div>
                        <span className="line-through text-gray-400 text-2xl">${pricing.originalMonthly}</span>
                        <span className="ml-3">${pricing.monthly}</span>
                      </div>
                    ) : (
                      `$${pricing.monthly}`
                    )}
                    <span className="text-gray-400 text-2xl">/mo</span>
                  </div>
                  <div className="text-sm text-gray-300 font-medium">Monthly Total</div>
                </div>
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
                <div className="text-center">
                  <div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                    ${pricing.total}
                  </div>
                  <div className="text-sm text-gray-300 font-medium">First Month</div>
                  {promoDiscount && (
                    <div className="text-xs text-green-400 mt-2 font-bold bg-green-400/20 px-3 py-1 rounded-full">
                      Promo applied!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Pricing Plans */}
      <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8 mb-24">
          {COMPANY_PLANS.map((plan, index) => {
            const isSelected = selectedPlan === plan.id
            const Icon = plan.icon
            const annualPrice = Math.round(plan.price * 0.8) // 20% discount for annual
            const displayPrice = isAnnual ? annualPrice : plan.price

            return (
              <div
                key={plan.id}
                className={`relative group cursor-pointer transition-all duration-700 ${
                  index === 1 ? 'lg:scale-110 lg:-mt-8' : ''
                } ${isSelected ? 'transform scale-105 z-20' : 'hover:scale-105'}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
                    <div className={`bg-gradient-to-r ${plan.color} text-white px-8 py-3 rounded-full text-sm font-black flex items-center gap-2 shadow-2xl animate-pulse`}>
                      <Star className="w-5 h-5 fill-current" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className={`relative h-full p-10 rounded-3xl border-2 transition-all duration-700 ${
                  isSelected
                    ? `border-purple-400 bg-gradient-to-br from-purple-500/30 to-pink-500/30 shadow-2xl shadow-purple-500/40 transform scale-105`
                    : plan.popular
                    ? 'border-purple-400/60 bg-white/10 hover:border-purple-400 hover:shadow-2xl hover:bg-white/15'
                    : 'border-gray-600/60 bg-white/5 hover:border-gray-500 hover:shadow-xl hover:bg-white/10'
                } backdrop-blur-xl overflow-hidden`}>
                  
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-gradient-to-br ${plan.color}`} />
                  
                  {/* Plan header */}
                  <div className="text-center mb-10 relative z-10">
                    <div className={`inline-flex p-6 rounded-3xl bg-gradient-to-r ${plan.color} mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-4xl font-black text-white mb-3">{plan.name}</h3>
                    <p className="text-gray-300 text-lg font-medium">{plan.description}</p>
                  </div>

                  {/* Enhanced Pricing */}
                  <div className="text-center mb-10 relative z-10">
                    <div className="flex items-baseline justify-center gap-3 mb-3">
                      <span className="text-6xl font-black text-white">${displayPrice}</span>
                      <span className="text-2xl text-gray-300 font-bold">/month</span>
                    </div>
                    {isAnnual && (
                      <div className="text-green-400 text-lg font-bold mb-3 bg-green-400/20 px-4 py-2 rounded-full inline-block">
                        Save ${(plan.price - annualPrice) * 12}/year
                      </div>
                    )}
                    <div className="text-gray-400 text-lg font-medium">
                      + ${plan.setupFee} one-time setup
                    </div>
                    
                    {/* Enhanced value props */}
                    <div className="flex items-center justify-center gap-6 mt-6 text-base">
                      <div className="flex items-center gap-2 text-purple-300 bg-purple-500/20 px-3 py-2 rounded-full">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-bold">{plan.roi}</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-300 bg-blue-500/20 px-3 py-2 rounded-full">
                        <Clock className="w-5 h-5" />
                        <span className="font-bold">{plan.setupTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Team/Vehicle limits */}
                  <div className="flex items-center justify-center gap-8 mb-8 p-6 bg-white/10 rounded-2xl relative z-10">
                    <div className="text-center">
                      <div className="text-3xl font-black text-white">{plan.maxUsers}</div>
                      <div className="text-sm text-gray-400 font-medium">Team Members</div>
                    </div>
                    <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
                    <div className="text-center">
                      <div className="text-3xl font-black text-white">{plan.maxVehicles}</div>
                      <div className="text-sm text-gray-400 font-medium">Vehicles</div>
                    </div>
                  </div>

                  {/* Enhanced Features */}
                  <div className="space-y-4 mb-10 relative z-10">
                    {plan.features.slice(0, 6).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-base leading-relaxed font-medium">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.features.length > 6 && (
                      <div className="text-center">
                        <button className="text-purple-400 hover:text-purple-300 text-base font-bold transition-colors">
                          + {plan.features.length - 6} more features
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Enhanced CTA Button */}
                  <button
                    className={`w-full py-5 px-8 rounded-2xl font-black text-xl transition-all duration-500 transform relative z-10 ${
                      isSelected
                        ? `bg-gradient-to-r ${plan.color} text-white shadow-2xl hover:shadow-3xl hover:scale-105`
                        : 'border-2 border-gray-600 text-gray-300 hover:border-purple-500 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:border-transparent'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPlan(plan.id)
                    }}
                  >
                    {isSelected ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle2 className="w-6 h-6" />
                        Selected Plan
                      </div>
                    ) : (
                      'Select This Plan'
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Enhanced Social Proof - Testimonials */}
        <div className="text-center mb-24">
          <h2 className="text-5xl font-black text-white mb-6">Trusted by Industry Leaders</h2>
          <p className="text-2xl text-gray-300 mb-16 font-medium">See what dealerships are saying about GhostCRM</p>
          
          <div className="grid md:grid-cols-3 gap-10">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl hover:bg-white/15 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl">{testimonial.image}</div>
                  <div className="text-left">
                    <div className="font-bold text-white text-xl">{testimonial.name}</div>
                    <div className="text-gray-400 font-medium">{testimonial.role}</div>
                    <div className="text-purple-400 font-bold">{testimonial.company}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-6 justify-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 italic text-lg leading-relaxed">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Super Enhanced Checkout Section */}
        <div className="text-center mb-24">
          <div className="max-w-3xl mx-auto p-12 bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-xl border border-white/30 rounded-3xl relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse" />
            
            <div className="relative z-10">
              <h3 className="text-4xl font-black text-white mb-8">Ready to Transform Your Dealership?</h3>
              
              {/* Enhanced Benefits summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                  <div className="text-3xl font-black text-green-400 mb-2">40%+</div>
                  <div className="text-gray-300 font-bold">Sales Increase</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                  <div className="text-3xl font-black text-blue-400 mb-2">3-5</div>
                  <div className="text-gray-300 font-bold">Days Setup</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                  <div className="text-3xl font-black text-purple-400 mb-2">24/7</div>
                  <div className="text-gray-300 font-bold">Support</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                  <div className="text-3xl font-black text-orange-400 mb-2">30</div>
                  <div className="text-gray-300 font-bold">Day Guarantee</div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || !selectedPlan}
                className="inline-flex items-center gap-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black py-6 px-12 rounded-2xl text-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-2xl"
              >
                {loading ? (
                  <>
                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Setting up your dealership...
                  </>
                ) : (
                  <>
                    <Rocket className="w-8 h-8" />
                    Start {selectedPlanData?.name} Plan Now
                    <ArrowRight className="w-8 h-8" />
                  </>
                )}
              </button>
              
              <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-base text-gray-400">
                <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="font-medium">SSL Secured</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <span className="font-medium">Stripe Protected</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span className="font-medium">30-Day Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced FAQ Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-6">Frequently Asked Questions</h2>
            <p className="text-2xl text-gray-300 font-medium">Get answers to common questions about our plans</p>
          </div>
          
          <div className="space-y-6">
            {FAQ_DATA.map((faq, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden">
                <button
                  onClick={() => setOpenFAQIndex(openFAQIndex === index ? null : index)}
                  className="w-full p-8 text-left flex items-center justify-between hover:bg-white/15 transition-all duration-300"
                >
                  <span className="text-xl font-bold text-white pr-6">{faq.question}</span>
                  {openFAQIndex === index ? (
                    <ChevronUp className="w-6 h-6 text-purple-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-purple-400 flex-shrink-0" />
                  )}
                </button>
                {openFAQIndex === index && (
                  <div className="px-8 pb-8">
                    <p className="text-gray-300 leading-relaxed text-lg">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Contact Section */}
        <div className="text-center p-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl">
          <h3 className="text-3xl font-black text-white mb-6">Need Help Choosing?</h3>
          <p className="text-gray-300 mb-10 text-lg font-medium">Our team is here to help you find the perfect plan for your dealership</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="tel:+1-555-GHOST-1" className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">
              <Phone className="w-6 h-6" />
              Call Us: (555) GHOST-1
            </a>
            <a href="mailto:sales@ghostcrm.ai" className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">
              <Mail className="w-6 h-6" />
              Email Sales Team
            </a>
            <button className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">
              <MessageCircle className="w-6 h-6" />
              Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}