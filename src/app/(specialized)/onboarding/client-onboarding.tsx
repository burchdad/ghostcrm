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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <StepIcon type="organization" />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: '0 0 1rem 0' }}>
          {isUpdateMode ? 'Complete Your Organization Setup' : 'Set Up Your Organization'}
        </h2>
        <p style={{ color: '#6b7280', fontSize: '1.125rem', margin: '0', lineHeight: '1.6' }}>
          {isUpdateMode
            ? 'Add the missing details to complete your organization setup'
            : 'Tell us about your company to personalize your CRM experience'}
        </p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Company name */}
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '0.5rem',
            textAlign: 'left'
          }}>
            Company Name * {isUpdateMode && <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '400' }}>(already set)</span>}
          </label>
          <input
            type="text"
            required
            value={onboardingData.organization.name}
            readOnly={isUpdateMode}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              border: '2px solid #d1d5db',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              backgroundColor: isUpdateMode ? '#f9fafb' : '#ffffff',
              color: isUpdateMode ? '#6b7280' : '#111827',
              cursor: isUpdateMode ? 'not-allowed' : 'text',
              transition: 'border-color 0.2s ease',
              outline: 'none'
            }}
            placeholder="Enter your company name"
            onChange={isUpdateMode ? undefined : handleCompanyNameChange}
            autoComplete="organization"
            onFocus={(e) => {
              if (!isUpdateMode) {
                e.target.style.borderColor = '#3b82f6'
                handleInputFocus?.()
              }
            }}
            onBlur={(e) => {
              if (!isUpdateMode) {
                e.target.style.borderColor = '#d1d5db'
              }
            }}
          />
        </div>

        {/* Subdomain */}
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '0.5rem',
            textAlign: 'left'
          }}>
            Subdomain * {isUpdateMode && <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '400' }}>(already set)</span>}
          </label>
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <input
              type="text"
              required
              value={onboardingData.organization.subdomain}
              readOnly={isUpdateMode}
              style={{
                flex: 1,
                padding: '0.875rem 1rem',
                border: '2px solid #d1d5db',
                borderRight: 'none',
                borderTopLeftRadius: '0.75rem',
                borderBottomLeftRadius: '0.75rem',
                fontSize: '1rem',
                backgroundColor: isUpdateMode ? '#f9fafb' : '#ffffff',
                color: isUpdateMode ? '#6b7280' : '#111827',
                cursor: isUpdateMode ? 'not-allowed' : 'text',
                transition: 'border-color 0.2s ease',
                outline: 'none'
              }}
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
              onFocus={(e) => {
                if (!isUpdateMode) {
                  e.target.style.borderColor = '#3b82f6'
                  const nextElement = e.target.nextElementSibling as HTMLElement
                  if (nextElement) nextElement.style.borderColor = '#3b82f6'
                }
              }}
              onBlur={(e) => {
                if (!isUpdateMode) {
                  e.target.style.borderColor = '#d1d5db'
                  const nextElement = e.target.nextElementSibling as HTMLElement
                  if (nextElement) nextElement.style.borderColor = '#d1d5db'
                }
              }}
            />
            <span style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.875rem 1rem',
              backgroundColor: '#f9fafb',
              border: '2px solid #d1d5db',
              borderLeft: 'none',
              borderTopRightRadius: '0.75rem',
              borderBottomRightRadius: '0.75rem',
              color: '#6b7280',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              .ghostcrm.ai
            </span>
          </div>
          {onboardingData.organization.subdomain && (
            <p style={{ 
              marginTop: '0.75rem', 
              fontSize: '0.875rem', 
              color: '#6b7280', 
              textAlign: 'left',
              margin: '0.75rem 0 0 0'
            }}>
              Your CRM will be available at:{' '}
              <span style={{ color: '#3b82f6', fontWeight: '600' }}>
                {onboardingData.organization.subdomain}.ghostcrm.ai
              </span>
            </p>
          )}
        </div>

        {/* Industry / size */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '0.5rem',
              textAlign: 'left'
            }}>
              Industry
            </label>
            <select
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                backgroundColor: '#ffffff',
                color: '#111827',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease',
                outline: 'none'
              }}
              value={onboardingData.organization.industry}
              onChange={(e) =>
                setOnboardingData(prev => ({
                  ...prev,
                  organization: { ...prev.organization, industry: e.target.value }
                }))
              }
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">Select industry</option>
              <option value="automotive">Automotive</option>
              <option value="real-estate">Real Estate</option>
              <option value="insurance">Insurance</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="technology">Technology</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '0.5rem',
              textAlign: 'left'
            }}>
              Company Size
            </label>
            <select
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #d1d5db',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                backgroundColor: '#ffffff',
                color: '#111827',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease',
                outline: 'none'
              }}
              value={onboardingData.organization.teamSize}
              onChange={(e) =>
                setOnboardingData(prev => ({
                  ...prev,
                  organization: { ...prev.organization, teamSize: e.target.value }
                }))
              }
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-1000">201-1,000 employees</option>
              <option value="1000+">1,000+ employees</option>
            </select>
          </div>
        </div>

        {apiError && (
          <div style={{ 
            padding: '1rem',
            backgroundColor: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '0.75rem',
            textAlign: 'center'
          }}>
            <p style={{ 
              color: '#dc2626', 
              fontSize: '0.875rem', 
              fontWeight: '500',
              margin: '0'
            }}>
              {apiError}
            </p>
          </div>
        )}
      </div>
    </div>
  )

  /* =====================
     STEP 2: TEAM SETUP
     ===================== */

  const TeamSetup: React.FC = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <StepIcon type="team" />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: '0 0 1rem 0' }}>
          Invite Your Team
        </h2>
        <p style={{ color: '#6b7280', fontSize: '1.125rem', margin: '0', lineHeight: '1.6' }}>
          Get your team started with Ghost Auto CRM
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#f0f9ff',
          border: '2px solid #0ea5e9',
          borderRadius: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💡</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0c4a6e', margin: '0 0 0.75rem 0' }}>
            Pro Tip
          </h3>
          <p style={{ color: '#075985', fontSize: '0.9rem', margin: '0', lineHeight: '1.5' }}>
            You can invite team members later from your dashboard. Skip this step for now and get started!
          </p>
        </div>
      </div>
    </div>
  )

  /* =====================
     STEP 3: BILLING SETUP
     ===================== */

  const BillingSetup: React.FC = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <StepIcon type="billing" />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: '0 0 1rem 0' }}>
          Subscription & Billing
        </h2>
        <p style={{ color: '#6b7280', fontSize: '1.125rem', margin: '0', lineHeight: '1.6' }}>
          Your subscription will activate once your trial period ends
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#fef7ff',
          border: '2px solid #a855f7',
          borderRadius: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#7c2d12', margin: '0 0 0.75rem 0' }}>
            Trial Active
          </h3>
          <p style={{ color: '#a16207', fontSize: '0.9rem', margin: '0', lineHeight: '1.5' }}>
            Enjoy full access to all features during your trial. We'll handle billing setup automatically when you're ready.
          </p>
        </div>
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
      onSkip={() => {
        // Skip integrations - mark complete and go directly to tenant dashboard
        markOnboardingComplete(createdOrganization?.id)
        if (createdOrganization) {
          const baseUrl =
            process.env.NODE_ENV === 'development'
              ? `http://${createdOrganization.subdomain}.localhost:3000`
              : `https://${createdOrganization.subdomain}.ghostcrm.ai`
          
          // Go directly to dashboard since user is already authenticated
          window.location.href = `${baseUrl}/tenant-owner/dashboard`
        } else {
          router.push('/dashboard')
        }
      }}
              window.location.href = `${baseUrl}/login-owner`
            })
=======
          
          // Go directly to dashboard since user is already authenticated
          window.location.href = `${baseUrl}/tenant-owner/dashboard`
>>>>>>> 14622a94 (Fix: Resolve onboarding to dashboard routing authentication conflict)
        } else {
          router.push('/dashboard')
        }
      }}}
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
              
              // Go directly to dashboard since user is already authenticated
              window.location.href = `${baseUrl}/tenant-owner/dashboard`
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
        width="1000px"
        maxHeight="95vh"
        ariaLabel="Onboarding Complete"
      >
        <div style={{ padding: '2rem' }}>
          <CompletionStep />
        </div>
      </Modal>
    )
  }

  if (currentStep === 3) {
    // Integrations step takes over full modal content
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        width="1000px"
        maxHeight="95vh"
        ariaLabel="Onboarding Integrations"
      >
        <div style={{ padding: '2rem' }}>
          <IntegrationSetupWrapper />
        </div>
      </Modal>
    )
  }

  const CurrentStepComponent = steps[currentStep]?.component

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="1000px"
      maxHeight="95vh"
      ariaLabel="Onboarding Setup"
    >
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 2rem 1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', margin: '0' }}>
              Welcome to Ghost CRM
            </h1>
            <p style={{ color: '#6b7280', marginTop: '0.5rem', margin: '0.5rem 0 0 0', fontSize: '1rem' }}>
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '0.5rem',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <XMarkIcon style={{ width: '1.5rem', height: '1.5rem', color: '#6b7280' }} />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
          <div style={{ background: '#f3f4f6', borderRadius: '0.375rem', height: '0.5rem' }}>
            <div
              style={{
                background: '#3b82f6',
                borderRadius: '0.375rem',
                height: '100%',
                width: `${((currentStep + 1) / steps.length) * 100}%`,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div style={{ 
          flex: 1, 
          padding: '0 2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          minHeight: '400px'
        }}>
          {CurrentStepComponent && <CurrentStepComponent />}
        </div>

        {/* Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '1.5rem 2rem 2rem',
          borderTop: '1px solid #f3f4f6',
          marginTop: '1rem'
        }}>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            style={{
              padding: '0.875rem 2rem',
              background: currentStep === 0 ? '#f3f4f6' : '#ffffff',
              border: '2px solid #d1d5db',
              borderRadius: '0.75rem',
              color: currentStep === 0 ? '#9ca3af' : '#374151',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            Previous
          </button>

          <button
            onClick={nextStep}
            disabled={isLoading}
            style={{
              padding: '0.875rem 2rem',
              background: isLoading ? '#93c5fd' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading
              ? 'Loading...'
              : currentStep === steps.length - 1
              ? 'Complete Setup'
              : 'Continue'}
            {!isLoading &&
              (currentStep === steps.length - 1 ? (
                <CheckCircleIcon style={{ width: '1.25rem', height: '1.25rem' }} />
              ) : (
                <ArrowRightIcon style={{ width: '1.25rem', height: '1.25rem' }} />
              ))}
          </button>
        </div>

        {/* Error Display */}
        {apiError && (
          <div style={{ padding: '0 2rem 1rem', textAlign: 'center' }}>
            <p style={{ 
              color: '#ef4444', 
              fontSize: '0.875rem', 
              fontWeight: '500',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              margin: '0'
            }}>
              {apiError}
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
