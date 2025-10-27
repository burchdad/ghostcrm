'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  BuildingOfficeIcon, 
  UsersIcon, 
  CreditCardIcon, 
  CogIcon,
  CheckCircleIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'
import { IntegrationOnboarding } from '@/components/onboarding/IntegrationOnboarding'
import { IntegrationPreferences } from '@/lib/integrations'
import OnboardingGuard from '@/components/onboarding/OnboardingGuard'
import { markOnboardingComplete } from '@/hooks/useOnboardingStatus'

// Add floating animation styles
const floatingStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(1deg); }
    66% { transform: translateY(5px) rotate(-1deg); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
    50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
  }
  
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = floatingStyles;
  document.head.appendChild(styleSheet);
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  component: React.ComponentType<any>
}

interface ClientOnboardingPageProps {
  onComplete?: () => void
}

export default function ClientOnboardingPage({ onComplete }: ClientOnboardingPageProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState({
    organization: {
      name: '',
      subdomain: '',
      industry: '',
      teamSize: ''
    },
    team: {},
    billing: {},
    integrations: {} as IntegrationPreferences
  })

  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Make sure this starts as false
  const [apiError, setApiError] = useState('')
  const [createdOrganization, setCreatedOrganization] = useState(null)

  // Organization Setup Component
  const OrganizationSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
          }}>
            <BuildingOfficeIcon className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${onComplete ? 'text-gray-900' : 'text-white'}`}>
          Set Up Your Organization
        </h2>
        <p className={`text-sm ${onComplete ? 'text-gray-600' : 'text-white font-medium'}`}>
          Tell us about your company to personalize your CRM experience
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <label className={`block text-sm font-bold mb-1 ${onComplete ? 'text-gray-700' : 'text-white'}`}>
            Company Name *
          </label>
          <input
            type="text"
            required
            value={onboardingData.organization.name}
            className="w-full px-3 py-2 text-base rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4"
            style={{
              background: onComplete ? 'white' : 'rgba(255, 255, 255, 0.2)',
              backdropFilter: onComplete ? 'none' : 'blur(15px)',
              border: onComplete ? '2px solid #e5e7eb' : '2px solid rgba(255, 255, 255, 0.4)',
              color: onComplete ? '#111827' : 'white'
            }}
            placeholder="Enter your company name"
            onChange={(e) => {
              const name = e.target.value;
              const subdomain = name.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
              
              setOnboardingData(prev => ({
                ...prev,
                organization: { 
                  ...prev.organization, 
                  name: name,
                  subdomain: subdomain
                }
              }));
            }}
          />
        </div>

        <div>
          <label className={`block text-sm font-bold mb-1 ${onComplete ? 'text-gray-700' : 'text-white'}`}>
            Subdomain *
          </label>
          <div className="flex">
            <input
              type="text"
              required
              value={onboardingData.organization.subdomain}
              className="flex-1 px-3 py-2 text-base rounded-l-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4"
              style={{
                background: onComplete ? 'white' : 'rgba(255, 255, 255, 0.2)',
                backdropFilter: onComplete ? 'none' : 'blur(15px)',
                border: onComplete ? '2px solid #e5e7eb' : '2px solid rgba(255, 255, 255, 0.4)',
                borderRight: 'none',
                color: onComplete ? '#111827' : 'white'
              }}
              placeholder="your-company"
              onChange={(e) => {
                const subdomain = e.target.value.toLowerCase()
                  .replace(/[^a-z0-9-]/g, '')
                  .replace(/-+/g, '-')
                  .replace(/^-|-$/g, '');
                
                setOnboardingData(prev => ({
                  ...prev,
                  organization: { ...prev.organization, subdomain }
                }));
              }}
            />
            <span className="inline-flex items-center px-3 rounded-r-xl border-2 border-l-0 text-base font-medium" style={{
              background: onComplete ? '#f9fafb' : 'rgba(255, 255, 255, 0.15)',
              border: onComplete ? '2px solid #e5e7eb' : '2px solid rgba(255, 255, 255, 0.4)',
              color: onComplete ? '#6b7280' : 'rgba(255, 255, 255, 0.95)'
            }}>
              .ghostcrm.com
            </span>
          </div>
          {onboardingData.organization.subdomain && (
            <p className={`mt-1 text-xs ${onComplete ? 'text-gray-500' : 'text-white font-medium'}`}>
              Your CRM will be available at: <span className="font-bold">{onboardingData.organization.subdomain}.ghostcrm.com</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-bold mb-1 ${onComplete ? 'text-gray-700' : 'text-white'}`}>
              Industry
            </label>
            <select 
              className="w-full px-3 py-2 text-base rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4"
              style={{
                background: onComplete ? 'white' : 'rgba(255, 255, 255, 0.2)',
                backdropFilter: onComplete ? 'none' : 'blur(15px)',
                border: onComplete ? '2px solid #e5e7eb' : '2px solid rgba(255, 255, 255, 0.4)',
                color: onComplete ? '#111827' : 'white'
              }}
              value={onboardingData.organization.industry}
              onChange={(e) => setOnboardingData(prev => ({
                ...prev,
                organization: { ...prev.organization, industry: e.target.value }
              }))}
            >
              <option value="" style={{ background: '#1f2937', color: 'white' }}>Select industry</option>
              <option value="automotive" style={{ background: '#1f2937', color: 'white' }}>Automotive</option>
              <option value="real-estate" style={{ background: '#1f2937', color: 'white' }}>Real Estate</option>
              <option value="insurance" style={{ background: '#1f2937', color: 'white' }}>Insurance</option>
              <option value="finance" style={{ background: '#1f2937', color: 'white' }}>Finance</option>
              <option value="healthcare" style={{ background: '#1f2937', color: 'white' }}>Healthcare</option>
              <option value="technology" style={{ background: '#1f2937', color: 'white' }}>Technology</option>
              <option value="manufacturing" style={{ background: '#1f2937', color: 'white' }}>Manufacturing</option>
              <option value="other" style={{ background: '#1f2937', color: 'white' }}>Other</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-bold mb-1 ${onComplete ? 'text-gray-700' : 'text-white'}`}>
              Company Size
            </label>
            <select 
              className="w-full px-3 py-2 text-base rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4"
              style={{
                background: onComplete ? 'white' : 'rgba(255, 255, 255, 0.2)',
                backdropFilter: onComplete ? 'none' : 'blur(15px)',
                border: onComplete ? '2px solid #e5e7eb' : '2px solid rgba(255, 255, 255, 0.4)',
                color: onComplete ? '#111827' : 'white'
              }}
              value={onboardingData.organization.teamSize}
              onChange={(e) => setOnboardingData(prev => ({
                ...prev,
                organization: { ...prev.organization, teamSize: e.target.value }
              }))}
            >
              <option value="" style={{ background: '#1f2937', color: 'white' }}>Select size</option>
              <option value="1-10" style={{ background: '#1f2937', color: 'white' }}>1-10 employees</option>
              <option value="11-50" style={{ background: '#1f2937', color: 'white' }}>11-50 employees</option>
              <option value="51-200" style={{ background: '#1f2937', color: 'white' }}>51-200 employees</option>
              <option value="201-1000" style={{ background: '#1f2937', color: 'white' }}>201-1,000 employees</option>
              <option value="1000+" style={{ background: '#1f2937', color: 'white' }}>1,000+ employees</option>
            </select>
          </div>
        </div>

        {apiError && (
          <div className="p-3 rounded-xl" style={{
            background: onComplete 
              ? 'rgba(254, 242, 242, 1)' 
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            backdropFilter: onComplete ? 'none' : 'blur(10px)'
          }}>
            <p className={`text-sm font-medium ${onComplete ? 'text-red-600' : 'text-red-300'}`}>
              {apiError}
            </p>
          </div>
        )}
      </div>
    </div>
  )

  // Team Setup Component
  const TeamSetup = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg" style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
          }}>
            <UsersIcon className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className={`text-3xl font-bold mb-3 ${onComplete ? 'text-gray-900' : 'text-white'}`}>
          Invite Your Team
        </h2>
        <p className={`text-lg ${onComplete ? 'text-gray-600' : 'text-white font-medium'}`}>
          Get your team started with Ghost Auto CRM
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="p-6 rounded-xl mb-6" style={{
          background: onComplete 
            ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))' 
            : 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))',
          border: onComplete ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(251, 191, 36, 0.2)',
          backdropFilter: onComplete ? 'none' : 'blur(10px)'
        }}>
          <div className="flex gap-2">
            <div className={`text-sm ${onComplete ? 'text-amber-800' : 'text-amber-200'}`}>
              <strong>Pro Tip:</strong> You can invite team members now or skip and do it later from your dashboard.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex gap-4">
              <input
                type="email"
                className="flex-1 px-4 py-3 text-lg rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4"
                style={{
                  background: onComplete ? 'white' : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: onComplete ? 'none' : 'blur(10px)',
                  border: onComplete ? '2px solid #e5e7eb' : '2px solid rgba(255, 255, 255, 0.2)',
                  color: onComplete ? '#111827' : 'white'
                }}
                placeholder="teammate@company.com"
              />
              <select className="px-4 py-3 text-lg rounded-xl border-2 transition-all duration-300 focus:outline-none" style={{
                background: onComplete ? 'white' : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: onComplete ? 'none' : 'blur(10px)',
                border: onComplete ? '2px solid #e5e7eb' : '2px solid rgba(255, 255, 255, 0.2)',
                color: onComplete ? '#111827' : 'white'
              }}>
                <option value="sales_rep">Sales Rep</option>
                <option value="sales_manager">Sales Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>

        <button className={`mt-6 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:transform hover:scale-105 ${
          onComplete ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50' : 'text-blue-300 hover:text-blue-200'
        }`} style={!onComplete ? {
          background: 'rgba(59, 130, 246, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        } : {}}>
          + Add more team members
        </button>
      </div>
    </div>
  )

  // Billing Setup Component
  const BillingSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{
            background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
            boxShadow: '0 8px 20px rgba(168, 85, 247, 0.3)'
          }}>
            <CreditCardIcon className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${onComplete ? 'text-gray-900' : 'text-white'}`}>
          Choose Your Plan
        </h2>
        <p className={`text-sm ${onComplete ? 'text-gray-600' : 'text-white font-medium'}`}>
          Select the plan that best fits your team's needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {[
          {
            tier: 'Basic',
            price: 29,
            features: ['Up to 5 users', 'Basic CRM features', 'Email support', '5GB storage'],
            popular: false,
            color: '#3b82f6'
          },
          {
            tier: 'Pro',
            price: 79,
            features: ['Up to 25 users', 'Advanced automation', 'Phone support', '50GB storage', 'API access'],
            popular: true,
            color: '#8b5cf6'
          },
          {
            tier: 'Elite',
            price: 199,
            features: ['Unlimited users', 'Custom integrations', 'Priority support', 'Unlimited storage', 'White-label options'],
            popular: false,
            color: '#ec4899'
          }
        ].map((plan) => (
          <div
            key={plan.tier}
            className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 relative hover:transform hover:scale-105 ${
              plan.popular ? 'ring-4' : ''
            }`}
            style={{
              background: onComplete 
                ? 'white' 
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
              backdropFilter: onComplete ? 'none' : 'blur(20px)',
              border: onComplete 
                ? plan.popular ? `2px solid ${plan.color}` : '2px solid #e5e7eb'
                : plan.popular ? `2px solid ${plan.color}` : '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: plan.popular 
                ? `0 20px 40px ${plan.color}40` 
                : onComplete ? '0 8px 20px rgba(0, 0, 0, 0.1)' : '0 8px 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg" style={{
                  background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`
                }}>
                  Most Popular
                </div>
              </div>
            )}
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{
                background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                boxShadow: `0 6px 20px ${plan.color}40`
              }}>
                <span className="text-lg font-bold text-white">{plan.tier[0]}</span>
              </div>
              
              <h3 className={`text-lg font-bold mb-1 ${onComplete ? 'text-gray-900' : 'text-white'}`}>
                {plan.tier}
              </h3>
              <div className={`text-2xl font-bold mb-4 ${onComplete ? 'text-gray-900' : 'text-white'}`}>
                ${plan.price}<span className="text-sm font-normal opacity-70">/month</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{
                      background: `linear-gradient(135deg, #10b981, #059669)`
                    }}>
                      <CheckCircleIcon className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className={`text-xs ${onComplete ? 'text-gray-700' : 'text-white font-medium'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full py-2 px-4 rounded-xl font-semibold text-white transition-all duration-300 hover:transform hover:scale-105 shadow-lg text-sm" style={{
                background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                boxShadow: `0 6px 20px ${plan.color}40`
              }}>
                Select {plan.tier}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Integration Setup (using our new component)
  const IntegrationSetupWrapper = () => (
    <IntegrationOnboarding
      onComplete={(preferences) => {
        setOnboardingData(prev => ({ ...prev, integrations: preferences }))
        handleComplete()
      }}
      onSkip={() => handleComplete()}
      orgTier="pro" // This would come from the selected billing plan
      userTier="admin_pro" // This would come from the user's actual tier
    />
  )

  // Completion Component
  const CompletionStep = () => (
    <div className="text-center space-y-8 py-12">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, duration: 0.8 }}
      >
        <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)',
          animation: 'pulse-glow 2s ease-in-out infinite'
        }}>
          <CheckCircleIcon className="w-12 h-12 text-white" />
        </div>
      </motion.div>
      
      <div>
        <h2 className="text-4xl font-bold mb-4" style={{
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}>
          Welcome to Ghost Auto CRM!
        </h2>
        {createdOrganization ? (
          <div className="space-y-6">
            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              Your organization <strong className="text-gray-900">{createdOrganization.name}</strong> has been successfully created!
            </p>
            <div className="rounded-2xl p-6 max-w-md mx-auto" style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <p className="text-sm text-blue-800 mb-2 font-semibold">Your CRM is ready at:</p>
              <p className="font-mono text-blue-900 font-bold text-lg">
                {createdOrganization.subdomain}.ghostcrm.com
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your account has been successfully created and configured. You can now start managing your leads, 
            deals, and customer relationships with our powerful CRM platform.
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl p-8" 
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
          }}>
            <BuildingOfficeIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2 text-lg">Organization Set Up</h3>
          <p className="text-gray-600">Your company profile and settings are configured</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-2xl p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
          }}>
            <UsersIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2 text-lg">Team Ready</h3>
          <p className="text-gray-600">Team invitations have been sent</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="rounded-2xl p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(124, 58, 237, 0.05))',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
            boxShadow: '0 8px 25px rgba(168, 85, 247, 0.3)'
          }}>
            <CogIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2 text-lg">Integrations Ready</h3>
          <p className="text-gray-600">Your preferred systems are being configured</p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="space-y-6"
      >
        <button
          onClick={() => {
            if (createdOrganization) {
              // Redirect to the new subdomain
              window.location.href = `http://${createdOrganization.subdomain}.localhost:3000/dashboard`;
            } else {
              router.push('/dashboard');
            }
          }}
          className="inline-flex items-center gap-3 px-10 py-4 text-xl font-bold text-white rounded-2xl transition-all duration-300 hover:transform hover:scale-105 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 25px 50px rgba(139, 92, 246, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.4)'
          }}
        >
          Go to Dashboard
          <ArrowRightIcon className="w-6 h-6" />
        </button>
        
        <div className="text-sm text-gray-500">
          Need help getting started? Check out our <a href="/docs" className="text-blue-600 hover:underline font-semibold">documentation</a> or <a href="/support" className="text-blue-600 hover:underline font-semibold">contact support</a>.
        </div>
      </motion.div>
    </div>
  )

  const steps: OnboardingStep[] = [
    {
      id: 'organization',
      title: 'Organization',
      description: 'Set up your company profile',
      icon: BuildingOfficeIcon,
      component: OrganizationSetup
    },
    {
      id: 'team',
      title: 'Team',
      description: 'Invite your team members',
      icon: UsersIcon,
      component: TeamSetup
    },
    {
      id: 'billing',
      title: 'Billing',
      description: 'Choose your subscription plan',
      icon: CreditCardIcon,
      component: BillingSetup
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Configure your preferred systems',
      icon: CogIcon,
      component: IntegrationSetupWrapper
    }
  ]

  const createOrganization = async () => {
    const { organization } = onboardingData;
    
    console.log('🔍 Creating organization with data:', organization);
    
    // Validation
    if (!organization.name || !organization.subdomain) {
      setApiError('Company name and subdomain are required');
      return false;
    }

    if (organization.subdomain.length < 3) {
      setApiError('Subdomain must be at least 3 characters long');
      return false;
    }

    setIsLoading(true);
    setApiError('');

    try {
      console.log('📤 Making API call to /api/tenant/initialize');
      
      // Get current user info from cookies or use demo email
      let adminEmail = 'demo_admin@example.com';
      
      // Try to get the user email from the auth cookie or local storage
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          adminEmail = userData.email || 'demo_admin@example.com';
        }
      } catch (e) {
        console.log('Could not get user email, using demo email');
      }

      const requestBody = {
        companyName: organization.name,
        subdomain: organization.subdomain,
        industry: organization.industry || 'automotive',
        teamSize: organization.teamSize || 'small',
        adminEmail: adminEmail
      };
      
      console.log('📤 Request body:', requestBody);

      const response = await fetch('/api/tenant/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      const result = await response.json();
      console.log('📥 Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create organization');
      }

      setCreatedOrganization(result.organization);
      console.log('✅ Organization created successfully:', result.organization);
      return true;
    } catch (error) {
      console.error('❌ Organization creation error:', error);
      setApiError(error.message || 'Failed to create organization. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    console.log('🔄 Next step clicked, current step:', currentStep);
    console.log('📋 Current organization data:', onboardingData.organization);
    
    // Add basic validation check
    if (currentStep === 0) {
      const orgData = onboardingData.organization;
      console.log('🔍 Checking organization data:', orgData);
      
      if (!orgData.name || !orgData.subdomain) {
        console.log('❌ Missing required fields:', { name: orgData.name, subdomain: orgData.subdomain });
        setApiError('Please fill in the company name and subdomain');
        return;
      }
      
      console.log('🏢 Creating organization on step 0');
      const success = await createOrganization();
      if (!success) {
        console.log('❌ Organization creation failed, staying on current step');
        return; // Stay on current step if organization creation failed
      }
      console.log('✅ Organization creation succeeded, moving to next step');
    }

    if (currentStep < steps.length - 1) {
      console.log('➡️ Moving to next step:', currentStep + 1);
      setCurrentStep(currentStep + 1);
    } else {
      console.log('🏁 Already at last step');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Mark onboarding as completed
    markOnboardingComplete(createdOrganization?.id);
    setIsCompleted(true);
    
    // Call the completion callback if provided (for modal mode)
    if (onComplete) {
      onComplete();
    }
  };

  // Skip to integrations for demo
  const skipToIntegrations = () => {
    setCurrentStep(3) // Integration step
  }

  if (isCompleted) {
    return <CompletionStep />
  }

  // If we're on the integration step, render the full integration component
  if (currentStep === 3) {
    return <IntegrationSetupWrapper />
  }

  const CurrentStepComponent = steps[currentStep]?.component

  return (
    <div className={`${onComplete ? 'bg-white' : 'min-h-screen'}`} style={{
      background: onComplete ? 'white' : 'linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 35%, #16213e 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Background Elements */}
      {!onComplete && (
        <>
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'float 20s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            right: '10%',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(167, 139, 250, 0.1))',
            borderRadius: '50%',
            filter: 'blur(50px)',
            animation: 'float 25s ease-in-out infinite reverse'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '20%',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.1), rgba(139, 92, 246, 0.1))',
            borderRadius: '50%',
            filter: 'blur(40px)',
            animation: 'float 15s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute',
            top: '30%',
            right: '30%',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.08))',
            borderRadius: '50%',
            filter: 'blur(30px)',
            animation: 'float 18s ease-in-out infinite'
          }} />
        </>
      )}

      {/* Header */}
      <div className={onComplete ? "bg-white shadow-sm" : ""} style={{
        background: onComplete ? 'white' : 'rgba(255, 255, 255, 0.05)',
        backdropFilter: onComplete ? 'none' : 'blur(10px)',
        borderBottom: onComplete ? '' : '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
              }}>
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className={`text-xl font-bold ${onComplete ? 'text-gray-900' : 'text-white'}`}>
                Ghost Auto CRM
              </span>
            </div>
            <button
              onClick={skipToIntegrations}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
                onComplete 
                  ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50' 
                  : 'text-white hover:text-white'
              }`}
              style={!onComplete ? {
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              } : {}}
              onMouseEnter={(e) => {
                if (!onComplete) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!onComplete) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              Skip to Integrations →
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={onComplete ? "bg-white border-b" : ""} style={{
        background: onComplete ? 'white' : 'rgba(255, 255, 255, 0.02)',
        borderBottom: onComplete ? '' : '1px solid rgba(255, 255, 255, 0.05)',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center space-x-8 mb-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all duration-300 shadow-lg
                    ${isActive ? 'text-white transform scale-110' : 
                      isCompleted ? 'text-white' :
                      onComplete ? 'border-gray-300 bg-white text-gray-400' : 'text-white/40'}
                  `} style={
                    isActive 
                      ? { 
                          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                          border: 'none',
                          boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)'
                        }
                      : isCompleted 
                        ? { 
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            boxShadow: '0 3px 12px rgba(16, 185, 129, 0.3)'
                          }
                        : { 
                            background: onComplete ? '#f9fafb' : 'rgba(255, 255, 255, 0.05)',
                            border: onComplete ? '2px solid #e5e7eb' : '2px solid rgba(255, 255, 255, 0.1)',
                            backdropFilter: onComplete ? 'none' : 'blur(10px)'
                          }
                  }>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ml-2 min-w-0">
                    <p className={`text-xs font-semibold ${
                      isActive ? onComplete ? 'text-blue-600' : 'text-white' : 
                      isCompleted ? onComplete ? 'text-green-600' : 'text-green-300' : 
                      onComplete ? 'text-gray-500' : 'text-white/60'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-8 h-1 ml-4 transition-all duration-300 hidden sm:block rounded-full
                      ${isCompleted ? onComplete ? 'bg-green-200' : 'bg-green-400/40' : onComplete ? 'bg-gray-200' : 'bg-white/20'}
                    `} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="text-center">
            <p className={`text-xs font-medium ${onComplete ? 'text-gray-500' : 'text-white/70'}`}>
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl shadow-2xl p-6"
            style={{
              background: onComplete 
                ? 'white' 
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
              backdropFilter: onComplete ? 'none' : 'blur(20px)',
              border: onComplete ? '1px solid #e5e7eb' : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: onComplete 
                ? '0 20px 40px rgba(0, 0, 0, 0.1)' 
                : '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}
          >
            {CurrentStepComponent && <CurrentStepComponent />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
              currentStep === 0 
                ? (onComplete ? 'bg-gray-100 text-gray-400' : 'bg-white/5 text-white/40') + ' cursor-not-allowed'
                : (onComplete ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'text-white hover:bg-white/20') + ' hover:transform hover:scale-105'
            }`}
            style={currentStep === 0 ? {} : {
              background: onComplete ? 'white' : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: onComplete ? 'none' : 'blur(10px)',
              border: onComplete ? '1px solid #d1d5db' : '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            Previous
          </button>

          <div className={`text-sm font-medium ${onComplete ? 'text-gray-500' : 'text-white/70'}`}>
            {currentStep + 1} / {steps.length}
          </div>

          <button
            onClick={() => {
              console.log('🖱️ BUTTON CLICKED - TEST!');
              console.log('🔍 isLoading state:', isLoading);
              nextStep();
            }}
            className="px-6 py-2 text-sm font-medium text-white rounded-xl transition-all duration-300 hover:transform hover:scale-105 cursor-pointer shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)'
            }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              </div>
            ) : (
              currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'
            )}
          </button>
        </div>

        {apiError && (
          <div className="mt-4 p-3 rounded-xl" style={{
            background: onComplete 
              ? 'rgba(254, 242, 242, 1)' 
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
            border: onComplete ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            backdropFilter: onComplete ? 'none' : 'blur(10px)'
          }}>
            <p className={`text-sm font-medium ${onComplete ? 'text-red-600' : 'text-red-300'}`}>
              {apiError}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
