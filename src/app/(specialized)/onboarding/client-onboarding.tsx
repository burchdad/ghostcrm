'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  BuildingOfficeIcon,
  UsersIcon,
  CreditCardIcon,
  CogIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { IntegrationOnboarding } from '@/components/onboarding/IntegrationOnboarding'
import { IntegrationPreferences } from '@/lib/integrations'
import { markOnboardingComplete } from '@/hooks/useOnboardingStatus'
import Modal from '@/components/ui/Modal'
import styles from './onboarding.module.css'

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  industry?: string;
  team_size?: string;
}

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

// Step Icon Component with inline styles
const StepIcon: React.FC<{ type: 'organization' | 'team' | 'billing' | 'integrations' }> = ({ type }) => {
  const baseStyles: React.CSSProperties = {
    width: '4rem',
    height: '4rem',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const getIconStyles = (): React.CSSProperties => {
    switch (type) {
      case 'organization':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
        }
      case 'team':
        return {
          ...baseStyles,
          width: '5rem',
          height: '5rem',
          background: 'linear-gradient(135deg, #10b981, #047857)',
          boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
        }
      case 'billing':
        return {
          ...baseStyles,
          width: '5rem',
          height: '5rem',
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)',
        }
      case 'integrations':
        return {
          ...baseStyles,
          width: '5rem',
          height: '5rem',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
        }
    }
  }

  const iconStyles: React.CSSProperties = {
    width: type === 'organization' ? '2rem' : '2.5rem',
    height: type === 'organization' ? '2rem' : '2.5rem',
    color: 'white',
  }

  const getIcon = () => {
    switch (type) {
      case 'organization':
        return <BuildingOfficeIcon style={iconStyles} />
      case 'team':
        return <UsersIcon style={iconStyles} />
      case 'billing':
        return <CreditCardIcon style={iconStyles} />
      case 'integrations':
        return <CogIcon style={iconStyles} />
    }
  }

  return (
    <div style={getIconStyles()}>
      {getIcon()}
    </div>
  )
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  component: React.ComponentType<any>
}

export default function ClientOnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
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
    billing: {} as any,
    integrations: {} as IntegrationPreferences
  })

  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [createdOrganization, setCreatedOrganization] = useState<Organization | null>(null)
  const [existingOrganization, setExistingOrganization] = useState<Organization | null>(null)
  const [isUpdateMode, setIsUpdateMode] = useState(false)

  // For now, modal is always light theme
  const isLightTheme = true

  // Load existing organization data on mount
  useEffect(() => {
    async function loadExistingOrganization() {
      try {
        console.log('🔍 Checking for existing organization...')
        setApiError('')

        const orgResponse = await fetch('/api/organization')

        if (orgResponse.status === 404) {
          console.log('📝 No existing organization found, staying in create mode')
          return
        }

        if (orgResponse.ok) {
          const orgData = await orgResponse.json()
          console.log('🏢 Organization data received:', orgData)

          if (orgData.success && orgData.organization) {
            const org = orgData.organization as Organization
            console.log('🔄 Setting update mode with organization:', org)

            setExistingOrganization(org)
            setIsUpdateMode(true)
            setApiError('')

            setOnboardingData(prev => ({
              ...prev,
              organization: {
                name: org.name || '',
                subdomain: org.subdomain || '',
                industry: org.industry || '',
                teamSize: org.team_size || ''
              }
            }))

            console.log('✅ Form pre-populated with existing data')
          }
        }
      } catch (error) {
        console.error('Error loading existing organization:', error)
        setApiError('')
      }
    }

    loadExistingOrganization()
  }, [])

  // Stable onChange handler for company name
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
        name,
        subdomain
      }
    }))

    if (apiError) {
      setApiError('')
    }
  }, [apiError])

  const handleInputFocus = useCallback(() => {
    if (apiError) {
      setApiError('')
    }
  }, [apiError])

  /* =========================
     STEP 1: ORGANIZATION SETUP
     ========================= */

  const OrganizationSetup: React.FC = () => (
    <div className={styles['space-y-8']}>
      <div className={styles['text-center']}>
        <div className={`${styles['flex']} ${styles['justify-center']} ${styles['mb-6']}`}>
          <StepIcon type="organization" />
        </div>
        <h2 className={`${styles['step-title']} ${isLightTheme ? styles['step-title--light'] : styles['step-title--dark']}`}>
          {isUpdateMode ? 'Complete Your Organization Setup' : 'Set Up Your Organization'}
        </h2>
        <p className={`${styles['step-subtitle']} ${isLightTheme ? styles['step-subtitle--light'] : styles['step-subtitle--dark']}`}>
          {isUpdateMode
            ? 'Add the missing details to complete your organization setup'
            : 'Tell us about your company to personalize your CRM experience'}
        </p>
      </div>

      <div className={styles['form-container']}>
        {/* Company name */}
        <div className={styles['form-group']}>
          <label className={`${styles['form-label']} ${isLightTheme ? styles['form-label--light'] : styles['form-label--dark']}`}>
            Company Name * {isUpdateMode && <span className={styles['label-note']}>(already set)</span>}
          </label>
          <input
            type="text"
            required
            value={onboardingData.organization.name}
            readOnly={isUpdateMode}
            className={`${styles['form-input']} ${
              isLightTheme ? styles['form-input--light'] : styles['form-input--dark']
            } ${
              isUpdateMode
                ? isLightTheme
                  ? styles['form-input--readonly-light']
                  : styles['form-input--readonly-dark']
                : ''
            } ${isUpdateMode ? styles['form-input--readonly'] : ''}`}
            placeholder="Enter your company name"
            onChange={isUpdateMode ? undefined : handleCompanyNameChange}
            onFocus={isUpdateMode ? undefined : handleInputFocus}
            autoComplete="organization"
          />
        </div>

        {/* Subdomain */}
        <div className={styles['form-group']}>
          <label className={`${styles['form-label']} ${isLightTheme ? styles['form-label--light'] : styles['form-label--dark']}`}>
            Subdomain * {isUpdateMode && <span className={styles['label-note']}>(already set)</span>}
          </label>
          <div className={styles['input-group']}>
            <input
              type="text"
              required
              value={onboardingData.organization.subdomain}
              readOnly={isUpdateMode}
              className={`${styles['form-input']} ${
                isLightTheme ? styles['form-input--light'] : styles['form-input--dark']
              } ${
                isUpdateMode
                  ? isLightTheme
                    ? styles['form-input--readonly-light']
                    : styles['form-input--readonly-dark']
                  : ''
              } ${isUpdateMode ? styles['form-input--readonly'] : ''} ${styles['border-radius-left']}`}
              placeholder="your-company"
              onChange={(e) => {
                if (isUpdateMode) return

                const subdomain = e.target.value.toLowerCase()
                  .replace(/[^a-z0-9-]/g, '')
                  .replace(/-+/g, '-')
                  .replace(/^-|-$/g, '')

                setOnboardingData(prev => ({
                  ...prev,
                  organization: { ...prev.organization, subdomain }
                }))
              }}
            />
            <span className={`${styles['input-suffix']} ${isLightTheme ? styles['input-suffix--light'] : styles['input-suffix--dark']}`}>
              .ghostcrm.ai
            </span>
          </div>
          {onboardingData.organization.subdomain && (
            <p className={`${styles['subdomain-info']} ${isLightTheme ? styles['subdomain-info--light'] : styles['subdomain-info--dark']}`}>
              Your CRM will be available at:{' '}
              <span className={styles['subdomain-info--highlight']}>
                {onboardingData.organization.subdomain}.ghostcrm.ai
              </span>
            </p>
          )}
        </div>

        {/* Industry / size */}
        <div className={styles['grid-cols-2']}>
          <div className={styles['form-group']}>
            <label className={`${styles['form-label']} ${isLightTheme ? styles['form-label--light'] : styles['form-label--dark']}`}>
              Industry
            </label>
            <select
              className={`${styles['form-input']} ${isLightTheme ? styles['form-input--light'] : styles['form-input--dark']}`}
              value={onboardingData.organization.industry}
              onChange={(e) =>
                setOnboardingData(prev => ({
                  ...prev,
                  organization: { ...prev.organization, industry: e.target.value }
                }))
              }
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
            <label className={`${styles['form-label']} ${isLightTheme ? styles['form-label--light'] : styles['form-label--dark']}`}>
              Company Size
            </label>
            <select
              className={`${styles['form-input']} ${isLightTheme ? styles['form-input--light'] : styles['form-input--dark']}`}
              value={onboardingData.organization.teamSize}
              onChange={(e) =>
                setOnboardingData(prev => ({
                  ...prev,
                  organization: { ...prev.organization, teamSize: e.target.value }
                }))
              }
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
          <div className={`${styles['error-container']} ${isLightTheme ? styles['error-container--light'] : styles['error-container--dark']}`}>
            <div className={styles['error-content']}>
              <div className={styles['error-icon']}>
                <span className={styles['error-icon-text']}>!</span>
              </div>
              <p className={`${styles['error-text']} ${isLightTheme ? styles['error-text--light'] : styles['error-text--dark']}`}>
                {apiError}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  /* =====================
     STEP 2: TEAM SETUP
     ===================== */

  const TeamSetup: React.FC = () => (
    <div className={styles['space-y-8']}>
      <div className={styles['text-center']}>
        <div className={`${styles['flex']} ${styles['justify-center']} ${styles['mb-6']}`}>
          <StepIcon type="team" />
        </div>
        <h2 className={`${styles['step-title']} ${isLightTheme ? styles['step-title--light'] : styles['step-title--dark']}`}>
          Invite Your Team
        </h2>
        <p className={`${styles['step-subtitle']} ${isLightTheme ? styles['step-subtitle--light'] : styles['step-subtitle--dark']}`}>
          Get your team started with Ghost Auto CRM
        </p>
      </div>

      <div className={`${styles['max-w-md']} ${styles['m-auto']}`}>
        <div className={`${styles['team-pro-tip']} ${isLightTheme ? styles['team-pro-tip--light'] : styles['team-pro-tip--dark']}`}>
          <div className={`${styles['team-pro-tip-text']} ${isLightTheme ? styles['team-pro-tip-text--light'] : styles['team-pro-tip-text--dark']}`}>
            <strong>Pro Tip:</strong> You can invite team members now or skip and do it later from your dashboard.
          </div>
        </div>

        <div className={styles['space-y-6']}>
          {[1, 2, 3].map((index) => (
            <div key={index} className={styles['team-member-item']}>
              <div className={`${styles['team-member-indicator']} ${isLightTheme ? styles['team-member-indicator--light'] : styles['team-member-indicator--dark']}`}>
                <span className={`${styles['team-member-indicator-number']} ${isLightTheme ? styles['team-member-indicator-number--light'] : styles['team-member-indicator-number--dark']}`}>
                  {index}
                </span>
              </div>

              <input
                type="email"
                className={`${styles['form-input']} ${isLightTheme ? styles['form-input--light'] : styles['form-input--dark']} ${styles['team-invite-input']}`}
                placeholder="teammate@company.com"
              />
              <select
                className={`${styles['form-input']} ${isLightTheme ? styles['form-input--light'] : styles['form-input--dark']} ${styles['team-invite-select']}`}
              >
                <option value="sales_rep" className={styles['select-option-light']}>Sales Rep</option>
                <option value="sales_manager" className={styles['select-option-light']}>Sales Manager</option>
                <option value="admin" className={styles['select-option-light']}>Admin</option>
              </select>
            </div>
          ))}
        </div>

        <button className={`${styles['team-add-button']} ${
          isLightTheme ? styles['team-add-button--light'] : styles['team-add-button--dark']
        }`}>
          + Add more team members
        </button>
      </div>
    </div>
  )

  /* =====================
     STEP 3: BILLING SETUP
     ===================== */

  const BillingSetup: React.FC = () => (
    <div className={styles['space-y-6']}>
      <div className={styles['text-center']}>
        <div className={`${styles['flex']} ${styles['justify-center']} ${styles['mb-4']}`}>
          <StepIcon type="billing" />
        </div>
        <h2 className={`${styles['text-2xl']} ${styles['font-bold']} ${styles['mb-2']} ${styles['text-gray-900']}`}>
          Choose Your Role & Pricing
        </h2>
        <p className={`${styles['text-sm']} ${styles['mb-1']} ${styles['text-gray-600']}`}>
          Simple per-user pricing based on your role and responsibilities. Add team members later at the same rates.
        </p>
        <p className={`${styles['text-xs']} ${styles['mb-6']} ${styles['text-gray-500']}`}>
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
            className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 relative hover-transform ${
              plan.popular ? 'ring-4' : ''
            }`}
            style={{
              background: 'white',
              backdropFilter: 'none',
              border: plan.popular ? `2px solid ${plan.color}` : '2px solid #e5e7eb',
              boxShadow: plan.popular
                ? `0 20px 40px ${plan.color}40`
                : '0 8px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            {plan.popular && (
              <div className={`${styles['absolute']} ${styles['top-minus-3']} ${styles['left-half']} ${styles['transform']}`}>
                <div
                  className={`${styles['px-4']} ${styles['py-1']} ${styles['rounded-full']} ${styles['text-xs']} ${styles['font-bold']} ${styles['text-white']} ${styles['shadow-lg']}`}
                  style={{
                    background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`
                  }}
                >
                  Most Popular
                </div>
              </div>
            )}

            <div className={styles['text-center']}>
              <div
                className={`${styles['w-12']} ${styles['h-12']} ${styles['mx-auto']} ${styles['mb-3']} ${styles['rounded-xl']} ${styles['flex']} ${styles['items-center']} ${styles['justify-center']}`}
                style={{
                  background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                  boxShadow: `0 6px 20px ${plan.color}40`
                }}
              >
                <span className={`${styles['text-lg']} ${styles['font-bold']} ${styles['text-white']}`}>
                  {plan.tier[0]}
                </span>
              </div>

              <h3 className={`${styles['pricing-plan-name']} ${styles['text-gray-900']}`}>
                {plan.tier}
              </h3>
              <p className={`${styles['pricing-plan-description']} ${styles['text-gray-600']}`}>
                {plan.description}
              </p>
              <div className={`${styles['pricing-plan-price']} ${styles['text-gray-900']}`}>
                ${plan.price}
                <span className={`${styles['text-sm']} ${styles['font-normal']} ${styles['opacity-70']}`}>
                  /month per user
                </span>
              </div>
              <div className={`${styles['pricing-plan-setup-fee']} ${styles['text-gray-600']}`}>
                + ${plan.setupFee} setup fee per user
              </div>
            </div>

            <div className={styles['space-y-3']}>
              <ul className={styles['space-y-2']}>
                {plan.features.map((feature, index) => (
                  <li key={index} className={`${styles['flex']} ${styles['items-center']} ${styles['gap-2']}`}>
                    <div
                      className={`${styles['w-4']} ${styles['h-4']} ${styles['rounded-full']} ${styles['flex']} ${styles['items-center']} ${styles['justify-center']}`}
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)'
                      }}
                    >
                      <CheckCircleIcon className={`${styles['w-2-5']} ${styles['h-2-5']} ${styles['text-white']}`} />
                    </div>
                    <span className={`${styles['pricing-feature-text']} ${styles['text-gray-700']}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`${styles['w-full']} ${styles['py-2']} ${styles['px-4']} ${styles['rounded-xl']} ${styles['font-semibold']} ${styles['text-white']} ${styles['transition-all']} ${styles['duration-300']} ${styles['hover-scale-105']} ${styles['shadow-lg']} ${styles['text-sm']}`}
                style={{
                  background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                  boxShadow: `0 6px 20px ${plan.color}40`
                }}
              >
                Select {plan.tier}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Skip Option */}
      <div className={styles['pricing-skip-text']}>
        <button
          onClick={() => {
            setOnboardingData(prev => ({ ...prev, billing: { skipped: true } }))
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
          }}
          className={`${styles['px-4']} ${styles['py-2']} ${styles['text-sm']} ${styles['font-medium']} ${styles['rounded-xl']} ${styles['transition-all']} ${styles['hover-scale-105']} ${styles['cursor-pointer']}`}
          style={{
            backdropFilter: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderColor: '#d1d5db',
            color: '#4b5563',
            backgroundColor: '#ffffff',
            borderStyle: 'solid',
            borderWidth: 1
          }}
        >
          Skip role selection - Choose later
        </button>
        <p className={`${styles['text-xs']} ${styles['mt-2']} ${styles['text-gray-500']}`}>
          You can select your role and start your billing later from your account settings
        </p>
      </div>
    </div>
  )

  /* ==========================
     STEP 4: INTEGRATION SETUP
     ========================== */

  const handleComplete = () => {
    markOnboardingComplete(createdOrganization?.id)
    setIsCompleted(true)
    onComplete?.()
  }

  const IntegrationSetupWrapper: React.FC = () => (
    <IntegrationOnboarding
      onComplete={(preferences) => {
        setOnboardingData(prev => ({ ...prev, integrations: preferences }))
        handleComplete()
      }}
      onSkip={() => handleComplete()}
      orgTier="pro"
      userTier="admin_pro"
    />
  )

  /* ==========================
     COMPLETION STEP
     ========================== */

  const CompletionStep: React.FC = () => (
    <div className={`${styles['text-center']} ${styles['space-y-8']} ${styles['py-12']}`}>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, duration: 0.8 }}
      >
        <div
          className={`${styles['w-24']} ${styles['h-24']} ${styles['mx-auto']} ${styles['mb-6']} ${styles['rounded-full']} ${styles['flex']} ${styles['items-center']} ${styles['justify-center']}`}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)',
            animation: 'pulse-glow 2s ease-in-out infinite'
          }}
        >
          <CheckCircleIcon className={`${styles['w-12']} ${styles['h-12']} ${styles['text-white']}`} />
        </div>
      </motion.div>

      <div>
        <h2
          className={`${styles['text-4xl']} ${styles['font-bold']} ${styles['mb-4']}`}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}
        >
          Welcome to Ghost Auto CRM!
        </h2>
        {createdOrganization ? (
          <div className={styles['space-y-6']}>
            <p className={`${styles['text-xl']} ${styles['text-gray-600']} ${styles['mb-6']} ${styles['max-w-2xl']} ${styles['mx-auto']}`}>
              Your organization <strong className={styles['text-gray-900']}>{createdOrganization.name}</strong> has been successfully created!
            </p>
            <div
              className={`${styles['rounded-2xl']} ${styles['px-4']} ${styles['py-6']} ${styles['max-w-md']} ${styles['mx-auto']}`}
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <p className={`${styles['text-sm']} ${styles['text-blue-800']} ${styles['mb-2']} ${styles['font-semibold']}`}>Your CRM is ready at:</p>
              <p className={`font-mono ${styles['text-blue-900']} ${styles['font-bold']} ${styles['text-lg']}`}>
                {createdOrganization.subdomain}.ghostcrm.ai
              </p>
            </div>
          </div>
        ) : (
          <p className={`${styles['text-xl']} ${styles['text-gray-600']} ${styles['mb-8']} ${styles['max-w-2xl']} ${styles['mx-auto']}`}>
            Your account has been successfully created and configured. You can now start managing your leads,
            deals, and customer relationships with our powerful CRM platform.
          </p>
        )}
      </div>

      {/* 3 completion cards */}
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
          <div
            className={`${styles['w-16']} ${styles['h-16']} ${styles['mx-auto']} ${styles['mb-4']} ${styles['rounded-xl']} ${styles['flex']} ${styles['items-center']} ${styles['justify-center']}`}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
            }}
          >
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
          <div
            className={`${styles['w-16']} ${styles['h-16']} ${styles['mx-auto']} ${styles['mb-4']} ${styles['rounded-xl']} ${styles['flex']} ${styles['items-center']} ${styles['justify-center']}`}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
            }}
          >
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
          <div
            className={`${styles['w-16']} ${styles['h-16']} ${styles['mx-auto']} ${styles['mb-4']} ${styles['rounded-xl']} ${styles['flex']} ${styles['items-center']} ${styles['justify-center']}`}
            style={{
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              boxShadow: '0 8px 25px rgba(168, 85, 247, 0.3)'
            }}
          >
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
              const baseUrl =
                process.env.NODE_ENV === 'development'
                  ? `http://${createdOrganization.subdomain}.localhost:3000`
                  : `https://${createdOrganization.subdomain}.ghostcrm.ai`
              window.location.href = `${baseUrl}/login-owner`
            } else {
              router.push('/dashboard')
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
          Need help getting started? Check out our{' '}
          <a href="/docs" className={`${styles['text-blue-600']} hover:underline ${styles['font-semibold']}`}>
            documentation
          </a>{' '}
          or{' '}
          <a href="/support" className={`${styles['text-blue-600']} hover:underline ${styles['font-semibold']}`}>
            contact support
          </a>.
        </div>
      </motion.div>
    </div>
  )

  /* ==========================
     STEP CONFIG
     ========================== */

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

  /* ==========================
     API HELPERS
     ========================== */

  const createOrganization = async () => {
    const { organization } = onboardingData

    if (!organization.name || !organization.subdomain) {
      setApiError('Company name and subdomain are required')
      return false
    }

    if (organization.subdomain.length < 3) {
      setApiError('Subdomain must be at least 3 characters long')
      return false
    }

    setIsLoading(true)
    setApiError('')

    try {
      let adminEmail = 'demo_admin@example.com'

      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          adminEmail = userData.email || 'demo_admin@example.com'
        }
      } catch {
        console.log('Could not get user email, using demo email')
      }

      const requestBody = {
        companyName: organization.name,
        subdomain: organization.subdomain,
        industry: organization.industry || 'automotive',
        teamSize: organization.teamSize || 'small',
        adminEmail
      }

      const response = await fetch('/api/tenant/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create organization')
      }

      setCreatedOrganization(result.organization)
      return true
    } catch (error: any) {
      console.error('❌ Organization creation error:', error)
      setApiError(error.message || 'Failed to create organization. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrganization = async () => {
    const { organization } = onboardingData

    if (!organization.industry || !organization.teamSize) {
      setApiError('Industry and team size are required')
      return false
    }

    setIsLoading(true)
    setApiError('')

    try {
      const requestBody = {
        industry: organization.industry,
        team_size: organization.teamSize
      }

      const response = await fetch('/api/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update organization')
      }

      setCreatedOrganization(result.organization)
      return true
    } catch (error: any) {
      console.error('❌ Organization update error:', error)
      setApiError(error.message || 'Failed to update organization. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /* ==========================
     NAVIGATION
     ========================== */

  const nextStep = async () => {
    if (currentStep === 0) {
      const orgData = onboardingData.organization

      if (isUpdateMode) {
        if (!orgData.industry || !orgData.teamSize) {
          setApiError('Please select industry and team size')
          return
        }

        const success = await updateOrganization()
        if (!success) return
      } else {
        if (!orgData.name || !orgData.subdomain) {
          setApiError('Please fill in the company name and subdomain')
          return
        }

        const success = await createOrganization()
        if (!success) return
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  /* ==========================
     RENDER
     ========================== */

  if (isCompleted) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        width="900px"
        maxHeight="90vh"
        ariaLabel="Onboarding Complete"
      >
        <CompletionStep />
      </Modal>
    )
  }

  if (currentStep === 3) {
    // Integrations step takes over full modal content
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        width="900px"
        maxHeight="90vh"
        ariaLabel="Onboarding Integrations"
      >
        <IntegrationSetupWrapper />
      </Modal>
    )
  }

  const CurrentStepComponent = steps[currentStep]?.component

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="900px"
      maxHeight="90vh"
      ariaLabel="Onboarding Setup"
    >
      <div style={{ position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1.5rem 0' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
              Welcome to Ghost CRM
            </h1>
            <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '0.25rem'
            }}
          >
            <XMarkIcon style={{ width: '1.5rem', height: '1.5rem', color: '#6b7280' }} />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ padding: '0 1.5rem', marginTop: '1rem' }}>
          <div style={{ background: '#f3f4f6', borderRadius: '0.25rem', height: '0.5rem' }}>
            <div
              style={{
                background: '#3b82f6',
                borderRadius: '0.25rem',
                height: '100%',
                width: `${((currentStep + 1) / steps.length) * 100}%`,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div style={{ padding: '1rem 1.5rem 0.5rem' }}>
          {CurrentStepComponent && <CurrentStepComponent />}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            style={{
              padding: '0.75rem 1.5rem',
              background: currentStep === 0 ? '#f3f4f6' : '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              color: currentStep === 0 ? '#9ca3af' : '#374151',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>

          <button
            onClick={nextStep}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isLoading
              ? 'Loading...'
              : currentStep === steps.length - 1
              ? 'Complete Setup'
              : 'Continue'}
            {!isLoading &&
              (currentStep === steps.length - 1 ? (
                <CheckCircleIcon style={{ width: '1rem', height: '1rem' }} />
              ) : (
                <ArrowRightIcon style={{ width: '1rem', height: '1rem' }} />
              ))}
          </button>
        </div>

        {/* Error Display */}
        {apiError && (
          <div style={{ padding: '0 1.5rem 1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 500 }}>{apiError}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
