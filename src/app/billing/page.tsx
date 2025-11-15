// Force rebuild - updated with auto-sync functionality
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
  const [showFAQ, setShowFAQ] = useState(false)
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null)
  const [isAnnual, setIsAnnual] = useState(false) // Toggle for annual/monthly pricing
  
  const selectedPlanData = COMPANY_PLANS.find(plan => plan.id === selectedPlan)

  // Calculate pricing (simplified - no promo codes on billing page)
  const calculatePricing = () => {
    if (!selectedPlanData) return { monthly: 0, setup: 799, total: 799, originalMonthly: 0, originalSetup: 799 }
    
    const monthly = selectedPlanData.price || 0
    const setup = selectedPlanData.setupFee || 0
    
    return {
      monthly: Math.round(monthly) || 0,
      setup: Math.round(setup) || 0,
      total: Math.round((monthly + setup)) || 0,
      originalMonthly: selectedPlanData.price || 0,
      originalSetup: selectedPlanData.setupFee || 0
    }
  }

  const pricing = calculatePricing()

  const handleCheckout = async () => {
    console.log('🔥 [DEBUG] Checkout button clicked!')
    console.log('🔥 [DEBUG] selectedPlan:', selectedPlan)
    console.log('🔥 [DEBUG] selectedPlanData:', selectedPlanData)
    console.log('🔥 [DEBUG] isAnnual:', isAnnual)
    
    if (!selectedPlanData) {
      console.error('❌ [DEBUG] No selectedPlanData found! Cannot proceed with checkout.')
      alert('Please select a plan first.')
      return
    }
    
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
        // No mapping found - try to auto-sync products
        console.warn(`⚠️ [CHECKOUT] No price mapping found for ${localProductId}, attempting auto-sync`)
        
        try {
          console.log(`🔄 [AUTO-SYNC] Triggering Stripe product sync...`)
          const syncResponse = await fetch('/api/stripe/sync-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
          
          if (syncResponse.ok) {
            const syncResult = await syncResponse.json()
            console.log(`✅ [AUTO-SYNC] Sync completed:`, syncResult)
            
            // Retry getting the mapping after sync
            const retryMappingResponse = await fetch(`/api/stripe/product-mapping?localId=${localProductId}`)
            if (retryMappingResponse.ok) {
              const retryMappingData = await retryMappingResponse.json()
              priceId = retryMappingData.stripePriceId
              console.log(`✅ [CHECKOUT] Found price ID after sync: ${priceId}`)
            }
          } else {
            console.error(`❌ [AUTO-SYNC] Sync failed:`, await syncResponse.text())
          }
        } catch (syncError) {
          console.error(`❌ [AUTO-SYNC] Sync error:`, syncError)
        }
        
        // If auto-sync didn't work, fallback to hardcoded price IDs
        if (!priceId) {
          console.warn(`⚠️ [CHECKOUT] Auto-sync failed, using fallback price IDs`)
          console.warn(`⚠️ [CHECKOUT] You need to update these price IDs to match your Stripe dashboard`)
          
          const fallbackPriceIds = {
            // TODO: Replace these with actual price IDs from your Stripe dashboard
            starter: isAnnual ? 'price_starter_yearly_REPLACE_ME' : 'price_starter_monthly_REPLACE_ME',
            professional: isAnnual ? 'price_professional_yearly_REPLACE_ME' : 'price_professional_monthly_REPLACE_ME', 
            enterprise: isAnnual ? 'price_enterprise_yearly_REPLACE_ME' : 'price_enterprise_monthly_REPLACE_ME'
          }
          priceId = fallbackPriceIds[selectedPlan as keyof typeof fallbackPriceIds]
          console.log(`🔄 [CHECKOUT] Using fallback price ID: ${priceId}`)
        }
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
          setupFee: selectedPlanData.setupFee,
          monthlyPrice: selectedPlanData.price,
          successUrl: `${window.location.origin}/billing/success`,
          cancelUrl: `${window.location.origin}/billing/cancel`,
          tenantId: 'current-tenant-id', // Get from auth context
          trialDays: 14,
          billing: isAnnual ? 'yearly' : 'monthly'
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
      console.error('❌ [CHECKOUT] Detailed error:', error)
      
      let errorMessage = 'Failed to start checkout. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('No such price')) {
          errorMessage = 'Stripe configuration error: The selected plan is not properly configured. Please contact support.'
          console.error('❌ [STRIPE] Price ID not found in Stripe. Check your Stripe dashboard and update the price IDs in the code.')
        } else if (error.message.includes('No price ID found')) {
          errorMessage = 'Plan configuration error: Unable to find pricing for the selected plan.'
        }
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(2deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float.delay-1000 {
          animation-delay: 1s;
        }
        
        .animate-float.delay-2000 {
          animation-delay: 2s;
        }

        .billing-header {
          text-align: center;
          margin-bottom: 4rem;
          position: relative;
          z-index: 2;
        }
        
        .header-animation-container {
          position: relative;
          display: inline-block;
          margin-bottom: 2rem;
        }
        
        .floating-icons {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .floating-icon {
          position: absolute;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          animation: float-around 8s ease-in-out infinite;
        }
        
        .floating-icon:nth-child(1) {
          top: -20px;
          left: -80px;
          animation-delay: 0s;
        }
        
        .floating-icon:nth-child(2) {
          top: -40px;
          right: -60px;
          animation-delay: 2s;
        }
        
        .floating-icon:nth-child(3) {
          bottom: -20px;
          left: -60px;
          animation-delay: 4s;
        }
        
        .floating-icon:nth-child(4) {
          bottom: -40px;
          right: -80px;
          animation-delay: 6s;
        }
        
        .main-title {
          font-size: clamp(2.5rem, 8vw, 5rem);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #ddd6fe 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
        }
        
        .title-highlight {
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: block;
          margin-top: 0.5rem;
          position: relative;
          animation: glow-pulse 3s ease-in-out infinite;
        }
        
        .subtitle {
          font-size: clamp(1rem, 3vw, 1.25rem);
          color: rgba(255, 255, 255, 0.9);
          max-width: 800px;
          margin: 0 auto 3rem;
          line-height: 1.6;
          font-weight: 500;
        }
        
        .highlight-number {
          color: #10b981;
          font-weight: 800;
          font-size: 1.5em;
          text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
          animation: number-glow 2s ease-in-out infinite alternate;
        }
        
        .highlight-feature {
          color: #3b82f6;
          font-weight: 600;
          text-decoration: underline;
          text-decoration-color: rgba(59, 130, 246, 0.5);
          text-underline-offset: 4px;
        }
        
        .stats-container {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin: 3rem 0;
          flex-wrap: wrap;
        }
        
        .stat-item {
          text-align: center;
          position: relative;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .stat-item:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
          border-color: rgba(139, 92, 246, 0.5);
        }
        
        .stat-number {
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #10b981, #059669);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: block;
          margin-bottom: 0.5rem;
          animation: count-up 2s ease-out;
        }
        
        .stat-label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .cta-text {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.95);
          font-weight: 600;
          margin: 2rem 0;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2));
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 15px;
          backdrop-filter: blur(10px);
        }
        
        @keyframes float-around {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1);
            opacity: 0.7;
          }
          25% { 
            transform: translateY(-15px) rotate(90deg) scale(1.1);
            opacity: 1;
          }
          50% { 
            transform: translateY(-10px) rotate(180deg) scale(0.9);
            opacity: 0.8;
          }
          75% { 
            transform: translateY(-20px) rotate(270deg) scale(1.05);
            opacity: 0.9;
          }
        }
        
        @keyframes glow-pulse {
          0%, 100% { 
            text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
          }
          50% { 
            text-shadow: 0 0 40px rgba(139, 92, 246, 0.8), 0 0 60px rgba(236, 72, 153, 0.4);
          }
        }
        
        @keyframes number-glow {
          0% { 
            text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
            transform: scale(1);
          }
          100% { 
            text-shadow: 0 0 30px rgba(16, 185, 129, 0.8), 0 0 40px rgba(16, 185, 129, 0.3);
            transform: scale(1.02);
          }
        }
        
        @keyframes count-up {
          from { 
            transform: scale(0.5);
            opacity: 0;
          }
          to { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .stats-container {
            gap: 1.5rem;
          }
          
          .stat-number {
            font-size: 2rem;
          }
          
          .floating-icon {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }
          
          .stat-item {
            padding: 1rem;
          }
        }
      `}</style>
      
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
          <div className="header-animation-container">
            <div className="floating-icons">
              <div className="floating-icon">🚗</div>
              <div className="floating-icon">💼</div>
              <div className="floating-icon">📈</div>
              <div className="floating-icon">⭐</div>
            </div>
            
            <h1 className="main-title">
              Choose Your
              <span className="title-highlight">Success Plan</span>
            </h1>
          </div>
          
          <p className="subtitle">
            Join thousands of dealerships increasing sales by{' '}
            <span className="highlight-number">40%+</span>{' '}
            with our AI-powered CRM.
            <br />
            All plans include{' '}
            <span className="highlight-feature">white-glove setup</span>{' '}
            and{' '}
            <span className="highlight-feature">dedicated support</span>.
          </p>

          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Dealerships</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Satisfaction</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
          </div>

          <div className="cta-text">
            🎯 Ready to transform your dealership? Choose your plan below and get started in minutes!
          </div>
        </div>

        {/* Enhanced Annual/Monthly Toggle with better styling */}
          <div className="billing-toggle-container">
            <div className="text-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Choose Your Billing Frequency</h3>
              <p className="text-white/70">Save money with annual billing</p>
            </div>
            <div className="billing-toggle relative">
              <button
                onClick={() => setIsAnnual(false)}
                className={`${!isAnnual ? 'active bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-white/70 hover:text-white'} px-8 py-3 rounded-xl font-semibold transition-all duration-300`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`${isAnnual ? 'active bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-white/70 hover:text-white'} px-8 py-3 rounded-xl font-semibold transition-all duration-300`}
              >
                Annual Billing
              </button>
              {isAnnual && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-lg">
                  Save 20%! 🎉
                </div>
              )}
            </div>
          </div>
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
                  }}
                  className={`billing-plan-cta ${isSelected ? 'primary' : 'secondary'}`}
                >
                  {isSelected ? 'Selected Plan' : `Select ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>

        {/* Enhanced Selected Plan Summary - Now shown AFTER plan selection */}
        {selectedPlanData && (
          <div className="mt-16 mb-12">
            <div className="text-center mb-10">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Your Selected Plan
              </h3>
              <p className="text-white/90 text-xl font-medium">
                {selectedPlanData.name} Plan - {isAnnual ? 'Annual' : 'Monthly'} Billing
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto">
              {/* Enhanced pricing breakdown with better readability */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-300">
                  <div className="text-4xl md:text-5xl font-black text-white mb-3">
                    ${pricing.setup}
                  </div>
                  <div className="text-white font-semibold text-lg mb-2">One-time Setup</div>
                  <div className="text-white/80 text-base">Professional installation & training</div>
                </div>
                
                <div className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-300">
                  <div className="text-4xl md:text-5xl font-black text-white mb-3">
                    ${pricing.monthly}
                    <span className="text-xl text-white/70 font-medium">/month</span>
                  </div>
                  <div className="text-white font-semibold text-lg mb-2">{isAnnual ? 'Monthly (Billed Annually)' : 'Monthly Subscription'}</div>
                  {isAnnual && (
                    <div className="text-green-400 text-base font-semibold">20% Annual Savings!</div>
                  )}
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-xl border border-purple-300/40 rounded-3xl p-8 text-center hover:from-purple-500/40 hover:to-pink-500/40 transition-all duration-300 ring-2 ring-purple-400/20">
                  <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-3">
                    ${pricing.total}
                  </div>
                  <div className="text-white font-semibold text-lg mb-2">Total First Month</div>
                  <div className="text-white/80 text-base">Setup + First month</div>
                </div>
              </div>

              {/* Enhanced plan benefits with better spacing and contrast */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/25 rounded-3xl p-8 mb-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-white font-bold text-xl mb-5 border-b border-white/20 pb-3">What's Included:</h4>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3 text-white/90 text-lg">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>Up to {selectedPlanData.maxUsers} team members</span>
                      </li>
                      <li className="flex items-center gap-3 text-white/90 text-lg">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>{selectedPlanData.maxVehicles} vehicles in inventory</span>
                      </li>
                      <li className="flex items-center gap-3 text-white/90 text-lg">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>White-glove setup & training</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xl mb-5 border-b border-white/20 pb-3">Guaranteed Results:</h4>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3 text-white/90 text-lg">
                        <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>{selectedPlanData.roi} typically</span>
                      </li>
                      <li className="flex items-center gap-3 text-white/90 text-lg">
                        <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        <span>Ready in {selectedPlanData.setupTime}</span>
                      </li>
                      <li className="flex items-center gap-3 text-white/90 text-lg">
                        <Shield className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        <span>30-day money-back guarantee</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Enhanced checkout button with better prominence */}
              <div className="text-center">
                <button
                  onClick={handleCheckout}
                  disabled={loading || !selectedPlanData}
                  className="inline-flex items-center gap-4 px-16 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-2xl rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ring-4 ring-purple-500/20 hover:ring-purple-500/40 relative z-10"
                >
                  {loading ? (
                    <>
                      <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-7 h-7" />
                      Start Your {selectedPlanData?.name || 'Selected'} Plan
                      <ArrowRight className="w-7 h-7" />
                    </>
                  )}
                </button>
                
                <p className="text-white/70 text-base mt-6 font-medium">
                  Secure checkout powered by Stripe • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        )}

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
    </>
  )
}