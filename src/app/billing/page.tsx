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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative pt-20 pb-16 text-center">
          <div className="max-w-6xl mx-auto px-4">
            {/* Trust indicators */}
            <div className="flex justify-center items-center gap-8 mb-8 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Secure & Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                <span>Industry Leader</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>10,000+ Dealerships</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Choose Your 
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent block">
                Success Plan
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              Join thousands of dealerships increasing sales by <span className="text-green-400 font-semibold">40%+</span> with our AI-powered CRM. 
              <br />All plans include white-glove setup and dedicated support.
            </p>

            {/* Annual/Monthly Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-lg ${!isAnnual ? 'text-white font-semibold' : 'text-gray-400'}`}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  isAnnual ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-lg ${isAnnual ? 'text-white font-semibold' : 'text-gray-400'}`}>
                Annual
                <span className="text-green-400 text-sm ml-2">(Save 20%)</span>
              </span>
            </div>

            {/* Promo Code Section */}
            <div className="mb-12">
              <button
                onClick={() => setShowPromoSection(!showPromoSection)}
                className="group flex items-center gap-2 mx-auto px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-purple-300 hover:text-white hover:bg-white/20 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5" />
                {showPromoSection ? 'Hide promo code' : 'Have a promo code?'}
                {showPromoSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showPromoSection && (
                <div className="mt-6 max-w-md mx-auto transform transition-all duration-300 ease-out">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter promo code"
                      className="flex-1 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all"
                      onKeyPress={(e) => e.key === 'Enter' && validatePromoCode()}
                    />
                    <button
                      onClick={validatePromoCode}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      Apply
                    </button>
                  </div>
                  
                  {promoError && (
                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                      <p className="text-red-400 text-sm">{promoError}</p>
                    </div>
                  )}
                  
                  {promoDiscount && (
                    <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl backdrop-blur-md">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">Promo code applied!</span>
                      </div>
                      <p className="text-green-300 text-sm mt-1">{promoDiscount.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Plan Summary */}
            {selectedPlanData && (
              <div className="inline-flex items-center gap-8 px-10 py-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {pricing.setup !== pricing.originalSetup ? (
                      <div>
                        <span className="line-through text-gray-400 text-xl">${pricing.originalSetup}</span>
                        <span className="ml-3">${pricing.setup}</span>
                      </div>
                    ) : (
                      `$${pricing.setup}`
                    )}
                  </div>
                  <div className="text-sm text-gray-300">Setup Fee</div>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {pricing.monthly !== pricing.originalMonthly ? (
                      <div>
                        <span className="line-through text-gray-400 text-xl">${pricing.originalMonthly}</span>
                        <span className="ml-3">${pricing.monthly}</span>
                      </div>
                    ) : (
                      `$${pricing.monthly}`
                    )}
                    <span className="text-gray-400">/mo</span>
                  </div>
                  <div className="text-sm text-gray-300">Monthly Total</div>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ${pricing.total}
                  </div>
                  <div className="text-sm text-gray-300">First Month</div>
                  {promoDiscount && (
                    <div className="text-xs text-green-400 mt-1 font-medium">Promo applied!</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {COMPANY_PLANS.map((plan, index) => {
            const isSelected = selectedPlan === plan.id
            const Icon = plan.icon
            const annualPrice = Math.round(plan.price * 0.8) // 20% discount for annual
            const displayPrice = isAnnual ? annualPrice : plan.price

            return (
              <div
                key={plan.id}
                className={`relative group cursor-pointer transition-all duration-500 ${
                  index === 1 ? 'lg:scale-110 lg:-mt-8' : ''
                } ${isSelected ? 'transform scale-105' : 'hover:scale-105'}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                    <div className={`bg-gradient-to-r ${plan.color} text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg`}>
                      <Star className="w-4 h-4 fill-current" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className={`relative h-full p-8 rounded-3xl border-2 transition-all duration-500 ${
                  isSelected
                    ? `border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-2xl shadow-purple-500/25`
                    : plan.popular
                    ? 'border-purple-400/50 bg-white/5 hover:border-purple-400 hover:shadow-xl'
                    : 'border-gray-600 bg-white/5 hover:border-gray-500 hover:shadow-xl'
                } backdrop-blur-xl`}>
                  
                  {/* Plan header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${plan.color} mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-300 text-lg">{plan.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-5xl font-bold text-white">${displayPrice}</span>
                      <span className="text-xl text-gray-300 font-medium">/month</span>
                    </div>
                    {isAnnual && (
                      <div className="text-green-400 text-sm font-medium mb-2">
                        Save ${(plan.price - annualPrice) * 12}/year
                      </div>
                    )}
                    <div className="text-gray-400 text-sm">
                      + ${plan.setupFee} one-time setup
                    </div>
                    
                    {/* Value props */}
                    <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-1 text-purple-300">
                        <TrendingUp className="w-4 h-4" />
                        <span>{plan.roi}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-300">
                        <Clock className="w-4 h-4" />
                        <span>{plan.setupTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Team/Vehicle limits */}
                  <div className="flex items-center justify-center gap-6 mb-6 p-4 bg-white/5 rounded-xl">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{plan.maxUsers}</div>
                      <div className="text-xs text-gray-400">Team Members</div>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{plan.maxVehicles}</div>
                      <div className="text-xs text-gray-400">Vehicles</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.slice(0, 6).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.features.length > 6 && (
                      <div className="text-center">
                        <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                          + {plan.features.length - 6} more features
                        </button>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                      isSelected
                        ? `bg-gradient-to-r ${plan.color} text-white shadow-lg hover:shadow-xl hover:scale-105`
                        : 'border-2 border-gray-600 text-gray-300 hover:border-purple-500 hover:text-white hover:bg-purple-500/20'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPlan(plan.id)
                    }}
                  >
                    {isSelected ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
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

        {/* Social Proof - Testimonials */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-4">Trusted by Industry Leaders</h2>
          <p className="text-xl text-gray-300 mb-12">See what dealerships are saying about GhostCRM</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div className="text-left">
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                    <div className="text-sm text-purple-400">{testimonial.company}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Checkout Section */}
        <div className="text-center mb-20">
          <div className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/20 rounded-3xl">
            <h3 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Dealership?</h3>
            
            {/* Benefits summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">40%+</div>
                <div className="text-sm text-gray-300">Sales Increase</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">3-5</div>
                <div className="text-sm text-gray-300">Days Setup</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">24/7</div>
                <div className="text-sm text-gray-300">Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">30</div>
                <div className="text-sm text-gray-300">Day Guarantee</div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || !selectedPlan}
              className="inline-flex items-center gap-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-5 px-10 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-2xl"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Setting up your dealership...
                </>
              ) : (
                <>
                  <Rocket className="w-6 h-6" />
                  Start {selectedPlanData?.name} Plan Now
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
            
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>Stripe Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span>30-Day Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300">Get answers to common questions about our plans</p>
          </div>
          
          <div className="space-y-4">
            {FAQ_DATA.map((faq, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFAQIndex(openFAQIndex === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/10 transition-all duration-300"
                >
                  <span className="text-lg font-semibold text-white pr-4">{faq.question}</span>
                  {openFAQIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  )}
                </button>
                {openFAQIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center mt-20 p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl">
          <h3 className="text-2xl font-bold text-white mb-4">Need Help Choosing?</h3>
          <p className="text-gray-300 mb-6">Our team is here to help you find the perfect plan for your dealership</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:+1-555-GHOST-1" className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors">
              <Phone className="w-5 h-5" />
              Call Us: (555) GHOST-1
            </a>
            <a href="mailto:sales@ghostcrm.ai" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
              <Mail className="w-5 h-5" />
              Email Sales Team
            </a>
            <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors">
              <MessageCircle className="w-5 h-5" />
              Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}