'use client'

import React, { useState, useCallback, useEffect } from 'react'
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
import styles from './onboarding.module.css'

interface Organization {
  id: string;
  name: string;
  subdomain: string;
}

// Styles are now handled by the CSS module

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
  const [createdOrganization, setCreatedOrganization] = useState<Organization | null>(null)
  const [existingOrganization, setExistingOrganization] = useState<Organization | null>(null)
  const [isUpdateMode, setIsUpdateMode] = useState(false)

  // Load existing organization data on component mount
  useEffect(() => {
    async function loadExistingOrganization() {
      try {
        console.log('🔍 Checking for existing organization...')
        
        // Clear any existing errors when component mounts
        setApiError('')
        
        const orgResponse = await fetch('/api/organization')
        
        if (orgResponse.status === 404) {
          // No organization found, stay in create mode
          console.log('📝 No existing organization found, staying in create mode')
          return
        }
        
        if (orgResponse.ok) {
          const orgData = await orgResponse.json()
          console.log('🏢 Organization data received:', orgData)
          
          if (orgData.success && orgData.organization) {
            const org = orgData.organization
            console.log('🔄 Setting update mode with organization:', org)
            
            setExistingOrganization(org)
            setIsUpdateMode(true)
            
            // Clear any existing error messages
            setApiError('')
            
                // Pre-populate the form with existing data
                setOnboardingData(prev => ({
                  ...prev,
                  organization: {
                    name: org.name || '',
                    subdomain: org.subdomain || '',
                    industry: org.industry || '', // May be undefined if column doesn't exist
                    teamSize: org.team_size || '' // May be undefined if column doesn't exist
                  }
                }))
                
                console.log('✅ Form pre-populated with existing data')
          }
        }
      } catch (error) {
        console.error('Error loading existing organization:', error)
        // Clear any error messages if loading fails
        setApiError('')
        // Continue with create mode if loading fails
      }
    }
    
    loadExistingOrganization()
  }, [])

  // Stable onChange handler for company name input
  const handleCompanyNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    // Clear any previous errors when user starts typing
    if (apiError) {
      setApiError('');
    }
  }, [apiError]);

  // Stable focus handler
  const handleInputFocus = useCallback(() => {
    if (apiError) {
      setApiError('');
    }
  }, [apiError]);

  // Organization Setup Component
  const OrganizationSetup = () => (
    <div className={styles['space-y-8']}>
      <div className={styles['text-center']}>
        <div className={`${styles['flex']} ${styles['justify-center']} ${styles['mb-6']}`}>
          <div className={styles['step-icon-container']}>
            <BuildingOfficeIcon className={`${styles['w-8']} ${styles['h-8']} ${styles['text-white']}`} />
          </div>
        </div>
        <h2 className={`${styles['step-title']} ${onComplete ? styles['step-title--light'] : styles['step-title--dark']}`}>
          {isUpdateMode ? 'Complete Your Organization Setup' : 'Set Up Your Organization'}
        </h2>
        <p className={`${styles['step-subtitle']} ${onComplete ? styles['step-subtitle--light'] : styles['step-subtitle--dark']}`}>
          {isUpdateMode 
            ? 'Add the missing details to complete your organization setup'
            : 'Tell us about your company to personalize your CRM experience'
          }
        </p>
      </div>

      <div className={styles['form-container']}>
        <div className={styles['form-group']}>
          <label className={`${styles['form-label']} ${onComplete ? styles['form-label--light'] : styles['form-label--dark']}`}>
            Company Name * {isUpdateMode && <span className={styles['label-note']}>(already set)</span>}
          </label>
          <input
            type="text"
            required
            value={onboardingData.organization.name}
            readOnly={isUpdateMode}
            className={`${styles['form-input']} ${
              onComplete ? styles['form-input--light'] : styles['form-input--dark']
            } ${
              isUpdateMode ? (onComplete ? styles['form-input--readonly-light'] : styles['form-input--readonly-dark']) : ''
            } ${
              isUpdateMode ? styles['form-input--readonly'] : ''
            }`}
            placeholder="Enter your company name"
            onChange={isUpdateMode ? undefined : handleCompanyNameChange}
            onFocus={isUpdateMode ? undefined : handleInputFocus}
            autoComplete="organization"
          />
        </div>

        <div className={styles['form-group']}>
          <label className={`${styles['form-label']} ${onComplete ? styles['form-label--light'] : styles['form-label--dark']}`}>
            Subdomain * {isUpdateMode && <span className={styles['label-note']}>(already set)</span>}
          </label>
          <div className={styles['input-group']}>
            <input
              type="text"
              required
              value={onboardingData.organization.subdomain}
              readOnly={isUpdateMode}
              className={`${styles['form-input']} ${
                onComplete ? styles['form-input--light'] : styles['form-input--dark']
              } ${
                isUpdateMode ? (onComplete ? styles['form-input--readonly-light'] : styles['form-input--readonly-dark']) : ''
              } ${
                isUpdateMode ? styles['form-input--readonly'] : ''
              } ${styles['border-radius-left']}`}
              placeholder="your-company"
              onChange={(e) => {
                if (isUpdateMode) return;
                
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
            <span className={`${styles['input-suffix']} ${onComplete ? styles['input-suffix--light'] : styles['input-suffix--dark']}`}>
              .ghostcrm.ai
            </span>
          </div>
          {onboardingData.organization.subdomain && (
            <p className={`${styles['subdomain-info']} ${onComplete ? styles['subdomain-info--light'] : styles['subdomain-info--dark']}`}>
              Your CRM will be available at: <span className={styles['subdomain-info--highlight']}>{onboardingData.organization.subdomain}.ghostcrm.com</span>
            </p>
          )}
        </div>

        <div className={styles['grid-cols-2']}>
          <div className={styles['form-group']}>
            <label className={`${styles['form-label']} ${onComplete ? styles['form-label--light'] : styles['form-label--dark']}`}>
              Industry
            </label>
            <select 
              className={`${styles['form-input']} ${onComplete ? styles['form-input--light'] : styles['form-input--dark']}`}
              value={onboardingData.organization.industry}
              onChange={(e) => setOnboardingData(prev => ({
                ...prev,
                organization: { ...prev.organization, industry: e.target.value }
              }))}
            >
              <option value="" className={styles['select-option']}>Select industry</option>
              <option value="automotive" className={styles['select-option']}>Automotive</option>
              <option value="real-estate" className={styles['select-option']}>Real Estate</option>
              <option value="insurance" className={styles['select-option']}>Insurance</option>
              <option value="finance" className={styles['select-option']}>Finance</option>
              <option value="healthcare" className={styles['select-option']}>Healthcare</option>
              <option value="technology" className={styles['select-option']}>Technology</option>
              <option value="manufacturing" className={styles['select-option']}>Manufacturing</option>
              <option value="other" className={styles['select-option']}>Other</option>
            </select>
          </div>

          <div className={styles['form-group']}>
            <label className={`${styles['form-label']} ${onComplete ? styles['form-label--light'] : styles['form-label--dark']}`}>
              Company Size
            </label>
            <select 
              className={`${styles['form-input']} ${onComplete ? styles['form-input--light'] : styles['form-input--dark']}`}
              value={onboardingData.organization.teamSize}
              onChange={(e) => setOnboardingData(prev => ({
                ...prev,
                organization: { ...prev.organization, teamSize: e.target.value }
              }))}
            >
              <option value="" className={styles['select-option']}>Select size</option>
              <option value="1-10" className={styles['select-option']}>1-10 employees</option>
              <option value="11-50" className={styles['select-option']}>11-50 employees</option>
              <option value="51-200" className={styles['select-option']}>51-200 employees</option>
              <option value="201-1000" className={styles['select-option']}>201-1,000 employees</option>
              <option value="1000+" className={styles['select-option']}>1,000+ employees</option>
            </select>
          </div>
        </div>

        {apiError && (
          <div className={`${styles['error-container']} ${onComplete ? styles['error-container--light'] : styles['error-container--dark']}`}>
            <div className={styles['error-content']}>
              <div className={styles['error-icon']}>
                <span className={styles['error-icon-text']}>!</span>
              </div>
              <p className={`${styles['error-text']} ${onComplete ? styles['error-text--light'] : styles['error-text--dark']}`}>
                {apiError}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Team Setup Component
  const TeamSetup = () => (
    <div className={styles['space-y-8']}>
      <div className={styles['text-center']}>
        <div className={`${styles['flex']} ${styles['justify-center']} ${styles['mb-6']}`}>
          <div className={styles['step-icon-container--team']}>
            <UsersIcon className={`${styles['w-10']} ${styles['h-10']} ${styles['text-white']}`} />
          </div>
        </div>
        <h2 className={`${styles['step-title']} ${onComplete ? styles['step-title--light'] : styles['step-title--dark']}`}>
          Invite Your Team
        </h2>
        <p className={`${styles['step-subtitle']} ${onComplete ? styles['step-subtitle--light'] : styles['step-subtitle--dark']}`}>
          Get your team started with Ghost Auto CRM
        </p>
      </div>

      <div className={`${styles['max-w-md']} ${styles['m-auto']}`}>
        <div className={`${styles['team-pro-tip']} ${onComplete ? styles['team-pro-tip--light'] : styles['team-pro-tip--dark']}`}>
          <div className={`${styles['team-pro-tip-text']} ${onComplete ? styles['team-pro-tip-text--light'] : styles['team-pro-tip-text--dark']}`}>
            <strong>Pro Tip:</strong> You can invite team members now or skip and do it later from your dashboard.
          </div>
        </div>

        <div className={styles['space-y-6']}>
          {[1, 2, 3].map((index) => (
            <div key={index} className={styles['team-member-item']}>
              {/* Visual indicator/checkbox area */}
              <div className={`${styles['team-member-indicator']} ${onComplete ? styles['team-member-indicator--light'] : styles['team-member-indicator--dark']}`}>
                <span className={`${styles['team-member-indicator-number']} ${onComplete ? styles['team-member-indicator-number--light'] : styles['team-member-indicator-number--dark']}`}>
                  {index}
                </span>
              </div>
              
              <input
                type="email"
                className={`${styles['form-input']} ${onComplete ? styles['form-input--light'] : styles['form-input--dark']} ${styles['team-invite-input']}`}
                placeholder="teammate@company.com"
              />
              <select 
                className={`${styles['form-input']} ${onComplete ? styles['form-input--light'] : styles['form-input--dark']} team-invite-select`}
              >
                <option value="sales_rep" className={styles['select-option-light']}>Sales Rep</option>
                <option value="sales_manager" className={styles['select-option-light']}>Sales Manager</option>
                <option value="admin" className={styles['select-option-light']}>Admin</option>
              </select>
            </div>
          ))}
        </div>

        <button className={`${styles['team-add-button']} ${
          onComplete ? styles['team-add-button--light'] : styles['team-add-button--dark']
        }`}>
          + Add more team members
        </button>
      </div>
    </div>
  )

  // Billing Setup Component
  const BillingSetup = () => (
    <div className={styles['space-y-6']}>
      <div className={styles['text-center']}>
        <div className={`${styles['flex']} ${styles['justify-center']} ${styles['mb-4']}`}>
          <div className={styles['step-icon-container--billing']}>
            <CreditCardIcon className={`${styles['w-8']} ${styles['h-8']} ${styles['text-white']}`} />
          </div>
        </div>
        <h2 className={`${styles['text-2xl']} ${styles['font-bold']} ${styles['mb-2']} ${onComplete ? styles['text-gray-900'] : styles['text-white']}`}>
          Choose Your Role & Pricing
        </h2>
        <p className={`${styles['text-sm']} ${styles['mb-1']} ${onComplete ? styles['text-gray-600'] : `${styles['text-white']} ${styles['font-medium']}`}`}>
          Simple per-user pricing based on your role and responsibilities. Add team members later at the same rates.
        </p>
        <p className={`${styles['text-xs']} ${styles['mb-6']} ${onComplete ? styles['text-gray-500'] : styles['text-white-70']}`}>
          All roles include full CRM features, mobile app access, and email integration - pricing reflects access level
        </p>
      </div>

      <div className={`${styles['grid-md-cols-3']} ${styles['max-w-5xl']} ${styles['mx-auto']}`}>
        {[
          {
            tier: 'Sales Rep',
            price: 5,
            setupFee: 50,
            features: [
              'Lead management & tracking',
              'Contact database access', 
              'Basic activity logging',
              'Email templates & sending',
              'Mobile app access',
              'Personal reporting',
              'View own leads & contacts',
              'Basic CRM functionality'
            ],
            popular: false,
            color: '#3b82f6',
            description: 'Perfect for front-line sales team members'
          },
          {
            tier: 'Sales Manager',
            price: 10,
            setupFee: 50,
            features: [
              'Everything Sales Rep includes',
              'Team lead assignment',
              'Team performance dashboards',
              'Lead distribution management',
              'Goal tracking & monitoring',
              'Team activity oversight',
              'Advanced reporting',
              'Pipeline management'
            ],
            popular: true,
            color: '#8b5cf6',
            description: 'Team oversight and performance management'
          },
          {
            tier: 'Admin',
            price: 15,
            setupFee: 50,
            features: [
              'Everything Sales Manager includes',
              'User management & permissions',
              'Organization settings',
              'Billing & subscription control',
              'System configuration',
              'Data export & backup',
              'Security settings',
              'Full system access'
            ],
            popular: false,
            color: '#ec4899',
            description: 'Full system access and organizational control'
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
              <div className={`${styles['absolute']} ${styles['top-minus-3']} ${styles['left-half']} ${styles['transform']}`}>
                <div className={`${styles['px-4']} ${styles['py-1']} ${styles['rounded-full']} ${styles['text-xs']} ${styles['font-bold']} ${styles['text-white']} ${styles['shadow-lg']}`} style={{
                  background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`
                }}>
                  Most Popular
                </div>
              </div>
            )}
            
            <div className={styles['text-center']}>
              <div className={`${styles['w-12']} ${styles['h-12']} ${styles['mx-auto']} ${styles['mb-3']} ${styles['rounded-xl']} ${styles['flex']} ${styles['items-center']} ${styles['justify-center']}`} style={{
                background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                boxShadow: `0 6px 20px ${plan.color}40`
              }}>
                <span className={`${styles['text-lg']} ${styles['font-bold']} ${styles['text-white']}`}>{plan.tier[0]}</span>
              </div>
              
              <h3 className={`${styles['pricing-plan-name']} ${onComplete ? styles['text-gray-900'] : styles['text-white']}`}>
                {plan.tier}
              </h3>
              <p className={`${styles['pricing-plan-description']} ${onComplete ? styles['text-gray-600'] : styles['text-white\/80']}`}>
                {plan.description}
              </p>
              <div className={`${styles['pricing-plan-price']} ${onComplete ? styles['text-gray-900'] : styles['text-white']}`}>
                ${plan.price}<span className={`${styles['text-sm']} ${styles['font-normal']} ${styles['opacity-70']}`}>/month per user</span>
              </div>
              <div className={`${styles['pricing-plan-setup-fee']} ${onComplete ? styles['text-gray-600'] : styles['text-white\/70']}`}>
                + $50 setup fee per user
              </div>
            </div>
            
            <div className={styles['space-y-3']}>
              <ul className={styles['space-y-2']}>
                {plan.features.map((feature, index) => (
                  <li key={index} className={`${styles['flex']} ${styles['items-center']} ${styles['gap-2']}`}>
                    <div className={`${styles['w-4']} ${styles['h-4']} ${styles['rounded-full']} ${styles['flex']} ${styles['items-center']} ${styles['justify-center']}`} style={{
                      background: `linear-gradient(135deg, #10b981, #059669)`
                    }}>
                      <CheckCircleIcon className={`${styles['w-2-5']} ${styles['h-2-5']} ${styles['text-white']}`} />
                    </div>
                    <span className={`${styles['pricing-feature-text']} ${onComplete ? styles['text-gray-700'] : styles['text-white font-medium']}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <button className={`${styles['w-full']} ${styles['py-2']} ${styles['px-4']} ${styles['rounded-xl']} ${styles['font-semibold']} ${styles['text-white']} ${styles['transition-all']} ${styles['duration-300']} ${styles['hover-scale-105']} ${styles['shadow-lg']} ${styles['text-sm']}`} style={{
                background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                boxShadow: `0 6px 20px ${plan.color}40`
              }}>
                Select {plan.tier}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Skip Option */}
      <div className={`${styles['pricing-skip-text']}`}>
        <button
          onClick={() => {
            // Skip billing selection and move to next step
            setOnboardingData(prev => ({ ...prev, billing: { skipped: true } }))
            // Use nextStep() to properly advance to the next step
            setCurrentStep(currentStep + 1)
          }}
          className={`${styles['px-4']} ${styles['py-2']} ${styles['text-sm']} ${styles['font-medium']} ${styles['rounded-xl']} ${styles['transition-all']} ${styles['hover-scale-105']} ${styles['cursor-pointer']} ${
            onComplete 
              ? `${styles['text-gray-600']} ${styles['border']} ${styles['border-gray-300']}`
              : `${styles['text-white-80']} ${styles['border']} ${styles['border-white-30']}`
          }`}
          style={{
            backdropFilter: onComplete ? 'none' : 'blur(10px)',
            boxShadow: onComplete ? '0 2px 8px rgba(0, 0, 0, 0.1)' : '0 4px 15px rgba(0, 0, 0, 0.2)',
            borderColor: onComplete ? '#d1d5db' : 'rgba(255, 255, 255, 0.3)',
            color: onComplete ? '#4b5563' : 'rgba(255, 255, 255, 0.8)',
            backgroundColor: onComplete ? '#ffffff' : 'transparent'
          }}
        >
          Skip role selection - Choose later
        </button>
        <p className={`${styles['text-xs']} ${styles['mt-2']} ${onComplete ? styles['text-gray-500'] : styles['text-white-70']}`}>
          You can select your role and start your billing later from your account settings
        </p>
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
    <div className={`${styles['text-center']} ${styles['space-y-8']} ${styles['py-12']}`}>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, duration: 0.8 }}
      >
        <div className={`${styles['w-24']} ${styles['h-24']} ${styles['mx-auto']} ${styles['mb-6']} ${styles['rounded-full']} ${styles['flex']} ${styles['items-center']} ${styles['justify-center']}`} style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)',
          animation: 'pulse-glow 2s ease-in-out infinite'
        }}>
          <CheckCircleIcon className={`${styles['w-12']} ${styles['h-12']} ${styles['text-white']}`} />
        </div>
      </motion.div>
      
      <div>
        <h2 className={`${styles['text-4xl']} ${styles['font-bold']} ${styles['mb-4']}`} style={{
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}>
          Welcome to Ghost Auto CRM!
        </h2>
        {createdOrganization ? (
          <div className={styles['space-y-6']}>
            <p className={`${styles['text-xl']} ${styles['text-gray-600']} ${styles['mb-6']} ${styles['max-w-2xl']} ${styles['mx-auto']}`}>
              Your organization <strong className={styles['text-gray-900']}>{createdOrganization.name}</strong> has been successfully created!
            </p>
            <div className={`${styles['rounded-2xl']} ${styles['px-4']} ${styles['py-6']} ${styles['max-w-md']} ${styles['mx-auto']}`} style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <p className={`${styles['text-sm']} ${styles['text-blue-800']} ${styles['mb-2']} ${styles['font-semibold']}`}>Your CRM is ready at:</p>
              <p className={`font-mono ${styles['text-blue-900']} ${styles['font-bold']} ${styles['text-lg']}`}>
                {createdOrganization.subdomain}.ghostcrm.com
              </p>
            </div>
          </div>
        ) : (
          <p className={`${styles['text-xl']} ${styles['text-gray-600']} mb-8 ${styles['max-w-2xl']} ${styles['mx-auto']}`}>
            Your account has been successfully created and configured. You can now start managing your leads, 
            deals, and customer relationships with our powerful CRM platform.
          </p>
        )}
      </div>

      <div className={`${styles['grid']} ${styles['md-grid-cols-3']} ${styles['gap-6']} ${styles['max-w-5xl']} ${styles['mx-auto']}`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`${styles['rounded-2xl']} ${styles['p-8']}`} 
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className={`${styles['w-16']} ${styles['h-16']} ${styles['mx-auto']} ${styles['mb-4']} ${styles['rounded-xl']} ${styles['flex']} ${styles['items-center']} ${styles['justify-center']}`} style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
          }}>
            <BuildingOfficeIcon className={`${styles['w-8']} ${styles['h-8']} ${styles['text-white']}`} />
          </div>
          <h3 className={`${styles['font-bold']} ${styles['text-gray-900']} ${styles['mb-2']} ${styles['text-lg']}`}>Organization Set Up</h3>
          <p className={styles['text-gray-600']}>Your company profile and settings are configured</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className={`${styles['rounded-2xl']} ${styles['p-8']}`}
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className={`${styles['w-16']} ${styles['h-16']} ${styles['mx-auto']} ${styles['mb-4']} ${styles['rounded-xl']} ${styles['flex']} ${styles['items-center']} ${styles['justify-center']}`} style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
          }}>
            <UsersIcon className={`${styles['w-8']} ${styles['h-8']} ${styles['text-white']}`} />
          </div>
          <h3 className={`${styles['font-bold']} ${styles['text-gray-900']} ${styles['mb-2']} ${styles['text-lg']}`}>Team Ready</h3>
          <p className={styles['text-gray-600']}>Team invitations have been sent</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className={`${styles['rounded-2xl']} ${styles['p-8']}`}
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(124, 58, 237, 0.05))',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className={`${styles['w-16']} ${styles['h-16']} ${styles['mx-auto']} ${styles['mb-4']} ${styles['rounded-xl']} ${styles['flex']} ${styles['items-center']} ${styles['justify-center']}`} style={{
            background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
            boxShadow: '0 8px 25px rgba(168, 85, 247, 0.3)'
          }}>
            <CogIcon className={`${styles['w-8']} ${styles['h-8']} ${styles['text-white']}`} />
          </div>
          <h3 className={`${styles['font-bold']} ${styles['text-gray-900']} ${styles['mb-2']} ${styles['text-lg']}`}>Integrations Ready</h3>
          <p className={styles['text-gray-600']}>Your preferred systems are being configured</p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className={styles['space-y-6']}
      >
        <button
          onClick={() => {
            if (createdOrganization) {
              // Redirect to the new subdomain tenant owner login since they're the organization owner
              const baseUrl = process.env.NODE_ENV === 'development' 
                ? `http://${createdOrganization.subdomain}.localhost:3000`
                : `https://${createdOrganization.subdomain}.ghostcrm.ai`;
              window.location.href = `${baseUrl}/login-owner`;
            } else {
              // Fallback to regular dashboard if no organization is created
              router.push('/dashboard');
            }
          }}
          className={`${styles['inline-flex']} ${styles['items-center']} ${styles['gap-3']} ${styles['px-10']} ${styles['py-4']} ${styles['text-xl']} ${styles['font-bold']} ${styles['text-white']} ${styles['rounded-2xl']} ${styles['transition-all']} ${styles['duration-300']} ${styles['hover-scale-105']} ${styles['shadow-lg']}`}
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
          <ArrowRightIcon className={`${styles['w-6']} ${styles['h-6']}`} />
        </button>
        
        <div className={`${styles['text-sm']} ${styles['text-gray-500']}`}>
          Need help getting started? Check out our <a href="/docs" className={`${styles['text-blue-600']} ${styles['hover-underline']} ${styles['font-semibold']}`}>documentation</a> or <a href="/support" className={`${styles['text-blue-600']} ${styles['hover-underline']} ${styles['font-semibold']}`}>contact support</a>.
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

  const updateOrganization = async () => {
    const { organization } = onboardingData;
    
    console.log('🔄 Updating organization with data:', organization);
    
    // Validation for update mode (only industry and team_size required)
    if (!organization.industry || !organization.teamSize) {
      setApiError('Industry and team size are required');
      return false;
    }

    setIsLoading(true);
    setApiError('');

    try {
      console.log('📤 Making API call to /api/organization (PUT)');
      
      const requestBody = {
        industry: organization.industry,
        team_size: organization.teamSize
      };
      
      console.log('📤 Request body:', requestBody);

      const response = await fetch('/api/organization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      const result = await response.json();
      console.log('📥 Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update organization');
      }

      setCreatedOrganization(result.organization);
      console.log('✅ Organization updated successfully:', result.organization);
      return true;
    } catch (error) {
      console.error('❌ Organization update error:', error);
      setApiError(error.message || 'Failed to update organization. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    console.log('🔄 Next step clicked, current step:', currentStep);
    console.log('📋 Current organization data:', onboardingData.organization);
    console.log('🔄 Update mode:', isUpdateMode);
    
    // Add basic validation check
    if (currentStep === 0) {
      const orgData = onboardingData.organization;
      console.log('🔍 Checking organization data:', orgData);
      
      if (isUpdateMode) {
        // In update mode, only validate industry and team size
        if (!orgData.industry || !orgData.teamSize) {
          console.log('❌ Missing required fields for update:', { industry: orgData.industry, teamSize: orgData.teamSize });
          setApiError('Please select industry and team size');
          return;
        }
        
        console.log('🔄 Updating organization on step 0');
        const success = await updateOrganization();
        if (!success) {
          console.log('❌ Organization update failed, staying on current step');
          return;
        }
        console.log('✅ Organization update succeeded, moving to next step');
      } else {
        // In create mode, validate name and subdomain
        if (!orgData.name || !orgData.subdomain) {
          console.log('❌ Missing required fields for create:', { name: orgData.name, subdomain: orgData.subdomain });
          setApiError('Please fill in the company name and subdomain');
          return;
        }
        
        console.log('🏢 Creating organization on step 0');
        const success = await createOrganization();
        if (!success) {
          console.log('❌ Organization creation failed, staying on current step');
          return;
        }
        console.log('✅ Organization creation succeeded, moving to next step');
      }
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
    setCurrentStep(3); // Integration step
  };

  if (isCompleted) {
    return <CompletionStep />;
  }

  // If we're on the integration step, render the full integration component
  if (currentStep === 3) {
    return <IntegrationSetupWrapper />;
  }

  const CurrentStepComponent = steps[currentStep]?.component;

  // Detect if we're in modal mode (when onComplete prop is provided)
  const isModalMode = typeof onComplete === 'function';

  return (
    <div className={styles['onboarding-container']}>
      <div className={styles['onboarding-wrapper']}>
        <div className={`${styles['content-card']} ${onComplete ? styles['content-card--light'] : styles['content-card--dark']}`}>
          {/* Progress Indicator */}
          <div className={styles['progress-container']}>
            {steps.map((step, index) => (
              <div key={step.id} className={`${styles['progress-step']} ${index <= currentStep ? styles['progress-step--active'] : ''}`}>
                <step.icon className={styles['progress-icon']} />
                <span>{step.title}</span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className={styles['step-content']}>
            {CurrentStepComponent && <CurrentStepComponent />}
          </div>

          {/* Navigation */}
          <div className={styles['navigation-container']}>
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`${styles['nav-button']} ${styles['nav-button--secondary']}`}
            >
              Previous
            </button>
            
            <button
              onClick={nextStep}
              className={`${styles['nav-button']} ${styles['nav-button--primary']}`}
            >
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
            </button>
          </div>

          {/* Error Display */}
          {apiError && (
            <div className={styles['error-container']}>
              <p className={styles['error-text']}>{apiError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
