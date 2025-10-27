"use client";

import Link from 'next/link';
import { Check, Crown, Rocket, Star, Zap, Shield, Users, TrendingUp } from 'lucide-react';
import MarketingHeader from '@/components/marketing/MarketingHeader';

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "49",
      period: "month",
      description: "Perfect for small dealerships getting started",
      features: [
        "Up to 100 leads per month",
        "Basic CRM functionality",
        "Email automation",
        "Mobile app access",
        "Basic reporting",
        "Email support"
      ],
      icon: Zap,
      color: "#3b82f6",
      popular: false
    },
    {
      name: "Professional",
      price: "149",
      period: "month",
      description: "Ideal for growing dealerships",
      features: [
        "Up to 1,000 leads per month",
        "Advanced CRM features",
        "Multi-channel automation",
        "Advanced analytics",
        "Custom integrations",
        "Priority support",
        "Team collaboration tools",
        "Custom branding"
      ],
      icon: Crown,
      color: "#8b5cf6",
      popular: true
    },
    {
      name: "Enterprise",
      price: "399",
      period: "month",
      description: "For large dealerships and dealer groups",
      features: [
        "Unlimited leads",
        "Full CRM suite",
        "AI-powered insights",
        "White-label solution",
        "API access",
        "Dedicated account manager",
        "Custom training",
        "24/7 phone support",
        "Advanced security",
        "Multi-location support"
      ],
      icon: Rocket,
      color: "#ec4899",
      popular: false
    }
  ];

  return (
    <>
      <MarketingHeader />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 35%, #16213e 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Floating Background Elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.1))',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite'
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3), rgba(236, 72, 153, 0.1))',
          borderRadius: '50%',
          filter: 'blur(50px)',
          animation: 'float 10s ease-in-out infinite reverse'
        }}></div>

        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '8rem 1rem 4rem 1rem'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '4rem'
          }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '1.5rem',
              textShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              lineHeight: '1.1'
            }}>
              Choose Your
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #fb7185 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} className="animate-gradient-x">
                Success Plan
              </span>
            </h1>
            
            <p style={{
              fontSize: '1.25rem',
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '48rem',
              margin: '0 auto 2rem auto',
              lineHeight: '1.6'
            }}>
              Transform your dealership with Ghost Auto CRM. Choose the plan that fits your business size and watch your sales soar.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '1rem',
              color: '#22c55e',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              <Star style={{ width: '1rem', height: '1rem' }} />
              30-day money-back guarantee
            </div>
          </div>

          {/* Pricing Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            maxWidth: '75rem',
            margin: '0 auto'
          }}>
            {plans.map((plan, index) => (
              <div key={plan.name} style={{
                position: 'relative',
                background: plan.popular 
                  ? 'rgba(139, 92, 246, 0.1)' 
                  : 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                borderRadius: '2rem',
                padding: '2.5rem',
                border: plan.popular 
                  ? '2px solid rgba(139, 92, 246, 0.5)' 
                  : '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                animation: `slideInUp 0.8s ease-out ${index * 0.2}s both`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = `0 25px 50px rgba(139, 92, 246, 0.3)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}>
                
                {/* Popular Badge */}
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    color: '#ffffff',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)'
                  }}>
                    Most Popular
                  </div>
                )}

                {/* Plan Icon */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '4rem',
                  height: '4rem',
                  background: `linear-gradient(135deg, ${plan.color}, ${plan.color}95)`,
                  borderRadius: '1.5rem',
                  marginBottom: '1.5rem',
                  boxShadow: `0 8px 25px ${plan.color}40`
                }}>
                  <plan.icon style={{ width: '2rem', height: '2rem', color: '#ffffff' }} />
                </div>

                {/* Plan Name */}
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  color: '#ffffff',
                  marginBottom: '0.5rem'
                }}>
                  {plan.name}
                </h3>

                {/* Plan Description */}
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '2rem',
                  lineHeight: '1.5'
                }}>
                  {plan.description}
                </p>

                {/* Price */}
                <div style={{
                  marginBottom: '2rem'
                }}>
                  <span style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    color: '#ffffff'
                  }}>
                    ${plan.price}
                  </span>
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '1rem',
                    marginLeft: '0.5rem'
                  }}>
                    /{plan.period}
                  </span>
                </div>

                {/* Features */}
                <div style={{
                  marginBottom: '2rem'
                }}>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <Check style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        color: '#22c55e',
                        flexShrink: 0
                      }} />
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.925rem'
                      }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link href="/register" style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '1rem 2rem',
                  background: plan.popular 
                    ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  borderRadius: '1rem',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '1rem',
                  border: plan.popular 
                    ? 'none' 
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = plan.popular 
                    ? '0 12px 35px rgba(139, 92, 246, 0.5)'
                    : '0 8px 25px rgba(255, 255, 255, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ or Additional Info */}
          <div style={{
            textAlign: 'center',
            marginTop: '4rem',
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '2rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '1rem'
            }}>
              Need something custom?
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '1.5rem',
              fontSize: '1.125rem'
            }}>
              Large dealer groups and enterprises can get custom pricing and features.
            </p>
            <Link href="/contact" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '1rem',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
              e.currentTarget.style.transform = 'translateY(0)'
            }}>
              <Users style={{ width: '1rem', height: '1rem' }} />
              Contact Enterprise Sales
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
