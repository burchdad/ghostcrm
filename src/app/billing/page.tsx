'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import './billing.css'
import AIChatAssistant from './ai-chat'
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
  const [showAIChat, setShowAIChat] = useState(false) // AI Chat Assistant state
  
  // Ensure proper CSS control for billing page
  useEffect(() => {
    // Add billing-specific classes to ensure CSS specificity
    document.documentElement.classList.add('billing-active')
    document.body.classList.add('billing-active')
    
    // Cleanup on unmount
    return () => {
      document.documentElement.classList.remove('billing-active')
      document.body.classList.remove('billing-active')
    }
  }, [])
  
  const selectedPlanData = COMPANY_PLANS.find(plan => plan.id === selectedPlan)
  console.log('🔍 [BILLING] selectedPlanData:', selectedPlanData)

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
      let priceId: string | null = null

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
          successUrl: `https://ghostcrm.ai/billing/success`,
          cancelUrl: `https://ghostcrm.ai/billing/cancel`,
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
    <div className="billing-page" style={{ position: 'relative', minHeight: '100vh', zIndex: 1 }}>
      <div className="billing-hero-background">
        <div className="billing-bg-gradient"></div>
        <div className="billing-bg-blur-1"></div>
        <div className="billing-bg-blur-2"></div>
        <div className="billing-bg-blur-3"></div>
        <div className="billing-bg-blur-4"></div>
        
        {/* Floating particles - simplified */}
        <div className="floating-particles-container">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="floating-particle"
                style={{
                  left: `${20 + (i * 15)}%`,
                  top: `${20 + (i * 10)}%`,
                  animation: `float 3s ease-in-out infinite ${i * 0.5}s`,
                }}
              />
            ))}
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
            <div className="billing-toggle-header">
              <h3 className="billing-toggle-title">Choose Your Payment Schedule</h3>
              <p className="billing-toggle-subtitle">Save up to 20% with annual billing - pay less, get more!</p>
            </div>
            <div className="billing-toggle relative">
              <button
                onClick={() => {
                  console.log('🔄 Monthly billing clicked')
                  setIsAnnual(false)
                }}
                className={`billing-toggle-button ${!isAnnual ? 'active' : ''}`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => {
                  console.log('🔄 Annual billing clicked')
                  setIsAnnual(true)
                }}
                className={`billing-toggle-button ${isAnnual ? 'active' : ''}`}
              >
                Annual Billing
              </button>
              {isAnnual && (
                <div className="billing-save-badge">
                  Save 20%! 🎉
                </div>
              )}
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
                className={`billing-plan-card ${plan.popular ? 'popular' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  console.log(`🔄 Plan card clicked: ${plan.id}`)
                  setSelectedPlan(plan.id)
                }}
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
                      <Check className="check-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log(`🔄 Select button clicked: ${plan.id}`)
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
          <div className="selected-plan-section">
            <div className="text-center mb-10">
              <h3 className="selected-plan-title">
                Your Selected Plan
              </h3>
              <p className="selected-plan-subtitle">
                {selectedPlanData.name} Plan - {isAnnual ? 'Annual' : 'Monthly'} Billing
              </p>
            </div>
            
            <div className="max-w-6xl mx-auto">
              {/* Enhanced pricing breakdown with better readability */}
              <div className="pricing-breakdown">
                <div className="pricing-card">
                  <div className="pricing-amount">
                    ${pricing.setup}
                  </div>
                  <div className="pricing-label">One-time Setup</div>
                  <div className="pricing-description">Professional installation & training</div>
                </div>
                
                <div className="pricing-card">
                  <div className="pricing-amount">
                    ${pricing.monthly}
                    <span className="pricing-period">/month</span>
                  </div>
                  <div className="pricing-label">{isAnnual ? 'Monthly (Billed Annually)' : 'Monthly Subscription'}</div>
                  {isAnnual && (
                    <div className="annual-savings">20% Annual Savings!</div>
                  )}
                </div>
                
                <div className="pricing-card featured">
                  <div className="pricing-amount">
                    ${pricing.total}
                  </div>
                  <div className="pricing-label">Total First Month</div>
                  <div className="pricing-description">Setup + First month</div>
                </div>
              </div>

              {/* Enhanced plan benefits with better spacing and contrast */}
              <div className="plan-benefits">
                <div className="benefits-grid">
                  <div>
                    <h4>What's Included:</h4>
                    <div className="space-y-4">
                      <div className="benefit-item">
                        <Check className="benefit-icon" />
                        <span>Up to {selectedPlanData.maxUsers} team members</span>
                      </div>
                      <div className="benefit-item">
                        <Check className="benefit-icon" />
                        <span>{selectedPlanData.maxVehicles} vehicles in inventory</span>
                      </div>
                      <div className="benefit-item">
                        <Check className="benefit-icon" />
                        <span>White-glove setup & training</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4>Guaranteed Results:</h4>
                    <div className="space-y-4">
                      <div className="benefit-item">
                        <TrendingUp className="benefit-icon" />
                        <span>{selectedPlanData.roi} typically</span>
                      </div>
                      <div className="benefit-item">
                        <Clock className="benefit-icon" />
                        <span>Ready in {selectedPlanData.setupTime}</span>
                      </div>
                      <div className="benefit-item">
                        <Shield className="benefit-icon" />
                        <span>30-day money-back guarantee</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced checkout button with better prominence */}
              <div className="checkout-button-container">
                {/* Security Notice */}
                <div className="security-notice">
                  <div className="security-badges">
                    <div className="security-badge-item">
                      <Shield className="w-5 h-5" />
                      <span>256-bit SSL</span>
                    </div>
                    <div className="security-badge-item">
                      <Award className="w-5 h-5" />
                      <span>SOC 2 Certified</span>
                    </div>
                    <div className="security-badge-item">
                      <Clock className="w-5 h-5" />
                      <span>30-day guarantee</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={loading || !selectedPlanData}
                  className="enhanced-checkout-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="checkout-spinner" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="checkout-icon" />
                      Start Your {selectedPlanData?.name || 'Selected'} Plan
                      <ArrowRight className="checkout-icon" />
                    </>
                  )}
                </button>
                
                <p className="checkout-security-text">
                  <Shield className="disclaimer-icon" />
                  Secure checkout powered by Stripe • Cancel anytime • 30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Social Proof - Testimonials */}
        <div className="billing-testimonials">
          <div className="text-center mb-16">
            <h2 className="testimonials-title">Trusted by Industry Leaders</h2>
            <p className="testimonials-subtitle">
              See what dealerships are saying about GhostCRM
            </p>
          </div>
          
          <div className="testimonials-grid">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-quote">
                  "{testimonial.quote}"
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.image}
                  </div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced FAQ Section */}
        <div className="faq-section">
          <div className="text-center mb-16">
            <h2 className="faq-title">Frequently Asked Questions</h2>
            <p className="faq-subtitle">
              Get answers to common questions about our plans
            </p>
          </div>
          
          <div className="faq-list">
            {FAQ_DATA.map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  onClick={() => {
                    console.log(`🔄 FAQ clicked: ${index}`)
                    setOpenFAQIndex(openFAQIndex === index ? null : index)
                  }}
                  className="faq-question"
                >
                  <span>{faq.question}</span>
                  {openFAQIndex === index ? (
                    <ChevronUp className="w-6 h-6 text-white/70" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-white/70" />
                  )}
                </button>
                {openFAQIndex === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Contact Section */}
        <div className="contact-section">
          <div className="contact-content">
            <div className="contact-header">
              <div className="contact-icon">
                <HelpCircle className="w-12 h-12" />
              </div>
              <h3 className="contact-title">Need Help Choosing?</h3>
              <p className="contact-subtitle">
                Our team is here to help you find the perfect plan for your dealership.
                <br />
                <strong>Response time: Under 5 minutes</strong>
              </p>
            </div>
            
            <div className="contact-buttons">
              <a href="tel:+1-555-GHOST-1" className="contact-button primary">
                <div className="contact-button-icon">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="contact-button-text">
                  <span className="contact-button-label">Call Us Now</span>
                  <span className="contact-button-value">(555) GHOST-1</span>
                </div>
              </a>
              <a href="mailto:sales@ghostcrm.ai" className="contact-button secondary">
                <div className="contact-button-icon">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="contact-button-text">
                  <span className="contact-button-label">Email Sales</span>
                  <span className="contact-button-value">sales@ghostcrm.ai</span>
                </div>
              </a>
              <button 
                onClick={() => {
                  console.log('🔄 Live chat clicked - Opening AI Assistant')
                  setShowAIChat(true)
                }}
                className="contact-button tertiary"
              >
                <div className="contact-button-icon">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="contact-button-text">
                  <span className="contact-button-label">Live Chat</span>
                  <span className="contact-button-value">Available 24/7</span>
                </div>
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="trust-indicators">
              <div className="trust-item">
                <Shield className="w-8 h-8" />
                <span>SOC 2 Certified</span>
              </div>
              <div className="trust-item">
                <Award className="w-8 h-8" />
                <span>Industry Leader</span>
              </div>
              <div className="trust-item">
                <Clock className="w-8 h-8" />
                <span>5-Min Setup</span>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <footer className="billing-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/careers">Careers</Link></li>
                <li><Link href="/press">Press</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/integrations">Integrations</Link></li>
                <li><Link href="/api-docs">API Docs</Link></li>
                <li><Link href="/roadmap">Roadmap</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/documentation">Documentation</Link></li>
                <li><Link href="/training">Training</Link></li>
                <li><Link href="/status">Status</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/security">Security</Link></li>
                <li><Link href="/compliance">Compliance</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-brand">
              <Rocket className="w-8 h-8" />
              <span>GhostCRM</span>
            </div>
            <div className="footer-tagline">
              <p>&copy; 2025 GhostCRM. All rights reserved.</p>
              <p>Empowering dealerships with AI-powered success.</p>
            </div>
            <div className="footer-security">
              <div className="security-badge">
                <Shield className="w-6 h-6" />
                <span>Enterprise Security</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
      
      {/* AI Chat Assistant */}
      <AIChatAssistant 
        isOpen={showAIChat} 
        onClose={() => setShowAIChat(false)} 
      />
    </div>
  )
}