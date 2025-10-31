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
      // Get the correct Stripe price ID from our product mapping system
      const localProductId = isAnnual 
        ? `plan_${selectedPlan}_yearly` 
        : `plan_${selectedPlan}_monthly`

      console.log(`🔄 [CHECKOUT] Looking up price ID for: ${localProductId}`)

      // First, try to get the Stripe price ID from our product mapping
      const mappingResponse = await fetch(`/api/stripe/product-mapping?localId=${localProductId}`)
      let priceId = null

      if (mappingResponse.ok) {
        const mappingData = await mappingResponse.json()
        priceId = mappingData.stripePriceId
        console.log(`✅ [CHECKOUT] Found mapped price ID: ${priceId}`)
      } else {
        console.warn(`⚠️ [CHECKOUT] No price mapping found for ${localProductId}, using fallback`)
        
        // Fallback to hardcoded price IDs (for development/testing)
        const fallbackPriceIds = {
          starter: isAnnual ? 'price_starter_yearly' : 'price_starter_monthly',
          professional: isAnnual ? 'price_professional_yearly' : 'price_professional_monthly', 
          enterprise: isAnnual ? 'price_enterprise_yearly' : 'price_enterprise_monthly'
        }
        priceId = fallbackPriceIds[selectedPlan as keyof typeof fallbackPriceIds]
        console.log(`🔄 [CHECKOUT] Using fallback price ID: ${priceId}`)
      }

      if (!priceId) {
        throw new Error('No price ID found for selected plan')
      }

      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          planId: selectedPlan,
          successUrl: `${window.location.origin}/billing/success`,
          cancelUrl: `${window.location.origin}/billing/cancel`,
          tenantId: 'current-tenant-id', // Get from auth context
          trialDays: 14,
          billing: isAnnual ? 'yearly' : 'monthly',
          // Include promo code if applied
          ...(promoDiscount && { promoCode: promoCode.toUpperCase() })
        })
      })

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (result.url) {
        console.log(`🚀 [CHECKOUT] Redirecting to Stripe: ${result.url}`)
        window.location.href = result.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="billing-page">
      {/* Hero background with same gradient as homepage */}
      <div className="billing-hero-background">
        {/* Enhanced animated background with glassmorphism */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
          <div className="absolute -top-1/2 -right-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/2 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-2000" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-amber-500/15 rounded-full blur-3xl animate-pulse delay-3000" />
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="billing-container">
        <div className="billing-header">
          {/* Enhanced trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mb-8 md:mb-12 text-xs md:text-sm">
            <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
              <span className="font-medium hidden sm:inline">Secure & Compliant</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <Award className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              <span className="font-medium hidden sm:inline">Industry Leader</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              <span className="font-medium hidden sm:inline">10,000+ Dealerships</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-4 md:mb-6 text-white leading-tight">
            Choose Your 
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent block mt-1 md:mt-2">
              Success Plan
            </span>
          </h1>
          
          <p className="text-sm md:text-lg lg:text-xl text-white/90 max-w-4xl mx-auto mb-8 md:mb-12 leading-relaxed px-4 md:px-0">
            Join thousands of dealerships increasing sales by{' '}
            <span className="text-green-400 font-bold text-lg md:text-2xl lg:text-3xl">40%+</span>{' '}
            with our AI-powered CRM. 
            <br className="hidden md:block" />
            All plans include{' '}
            <span className="text-blue-400 font-semibold">white-glove setup</span>{' '}
            and{' '}
            <span className="text-purple-400 font-semibold">dedicated support</span>.
          </p>

          {/* Enhanced Annual/Monthly Toggle */}
          <div className="billing-toggle-container">
            <div className="billing-toggle">
              <button
                onClick={() => setIsAnnual(false)}
                className={!isAnnual ? 'active' : ''}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={isAnnual ? 'active' : ''}
              >
                Annual
              </button>
              {isAnnual && (
                <span className="billing-savings-badge">
                  Save 20%
                </span>
              )}
            </div>
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
              <div className="billing-promo-section">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="billing-promo-input"
                    onKeyPress={(e) => e.key === 'Enter' && validatePromoCode()}
                  />
                  <button
                    onClick={validatePromoCode}
                    className="billing-promo-button"
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

        {/* Enhanced Pricing Plans */}
        <div className="billing-plans-grid">
          {COMPANY_PLANS.map((plan, index) => {
            const isSelected = selectedPlan === plan.id
            const Icon = plan.icon
            const annualPrice = Math.round(plan.price * 0.8) // 20% discount for annual
            const displayPrice = isAnnual ? annualPrice : plan.price

            return (
              <div
                key={plan.id}
                className={`billing-plan-card ${plan.popular ? 'popular' : ''} ${isSelected ? 'ring-2 ring-white/40' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <div className="billing-plan-header">
                  <div className="billing-plan-name">{plan.name}</div>
                  <div className="billing-plan-description">{plan.description}</div>
                  
                  <div className="billing-plan-price">
                    <span className="billing-plan-price-amount">${displayPrice}</span>
                    <span className="billing-plan-price-period">/month</span>
                  </div>
                  
                  <div className="billing-plan-setup">+ ${plan.setupFee} one-time setup</div>
                </div>

                <ul className="billing-plan-features">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="billing-plan-feature">
                      <Check className="w-5 h-5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPlan(plan.id)
                    handleCheckout()
                  }}
                  disabled={loading}
                  className={`billing-plan-cta ${isSelected ? 'primary' : 'secondary'}`}
                >
                  {loading && selectedPlan === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    `Select ${plan.name} Plan`
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Enhanced Social Proof - Testimonials */}
        <div className="billing-testimonials">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-white mb-6">Trusted by Industry Leaders</h2>
            <p className="text-2xl text-gray-300 mb-16 font-medium">See what dealerships are saying about GhostCRM</p>
          </div>
          
          <div className="billing-testimonials-grid">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="billing-testimonial-card">
                <div className="billing-testimonial-quote">
                  "{testimonial.quote}"
                </div>
                <div className="billing-testimonial-author">
                  <div className="billing-testimonial-avatar">
                    {testimonial.image}
                  </div>
                  <div className="billing-testimonial-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced FAQ Section */}
        <div className="billing-faq-section">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300 font-medium">Get answers to common questions about our plans</p>
          </div>
          
          <div className="space-y-6">
            {FAQ_DATA.map((faq, index) => (
              <div key={index} className="billing-faq-item">
                <button
                  onClick={() => setOpenFAQIndex(openFAQIndex === index ? null : index)}
                  className="billing-faq-question"
                >
                  <span>{faq.question}</span>
                  {openFAQIndex === index ? (
                    <ChevronUp className="w-6 h-6" />
                  ) : (
                    <ChevronDown className="w-6 h-6" />
                  )}
                </button>
                {openFAQIndex === index && (
                  <div className="billing-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Contact Section */}
        <div className="billing-contact-section">
          <h3 className="text-3xl font-black text-white mb-6">Need Help Choosing?</h3>
          <p className="text-gray-300 mb-10 text-lg font-medium">Our team is here to help you find the perfect plan for your dealership</p>
          
          <div className="billing-contact-buttons">
            <a href="tel:+1-555-GHOST-1" className="billing-contact-button primary">
              <Phone className="w-6 h-6" />
              Call Us: (555) GHOST-1
            </a>
            <a href="mailto:sales@ghostcrm.ai" className="billing-contact-button secondary">
              <Mail className="w-6 h-6" />
              Email Sales Team
            </a>
            <button className="billing-contact-button tertiary">
              <MessageCircle className="w-6 h-6" />
              Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}