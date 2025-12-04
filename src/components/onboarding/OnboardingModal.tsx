'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { XMarkIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import Modal from '@/components/ui/Modal'
import StepIcon from './StepIcon'
import { IntegrationOnboarding } from './IntegrationOnboarding'
import { IntegrationPreferences } from '@/lib/integrations'
import { markOnboardingComplete } from '@/hooks/useOnboardingStatus'

interface Organization {
  id: string
  name: string
  subdomain: string
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: 'organization' | 'team' | 'billing' | 'integrations'
  completed: boolean
}

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const router = useRouter()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [teamMembers, setTeamMembers] = useState<string[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [integrationPreferences, setIntegrationPreferences] = useState<IntegrationPreferences>({})

  const steps: OnboardingStep[] = [
    {
      id: 'organization',
      title: 'Set Up Your Organization',
      description: 'Tell us about your business',
      icon: 'organization',
      completed: false
    },
    {
      id: 'team',
      title: 'Invite Your Team',
      description: 'Add team members to collaborate',
      icon: 'team',
      completed: false
    },
    {
      id: 'billing',
      title: 'Choose Your Plan',
      description: 'Select the plan that fits your needs',
      icon: 'billing',
      completed: false
    },
    {
      id: 'integrations',
      title: 'Set Up Integrations',
      description: 'Connect your favorite tools',
      icon: 'integrations',
      completed: false
    }
  ]

  const currentStep = steps[currentStepIndex]

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      handleComplete()
    }
  }, [currentStepIndex, steps.length])

  const handleComplete = useCallback(async () => {
    setIsLoading(true)
    try {
      await markOnboardingComplete()
      onComplete()
      onClose()
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onComplete, onClose, router])

  const OrganizationSetup = () => (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <StepIcon type="organization" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
          Set Up Your Organization
        </h2>
        <p style={{ color: '#6b7280' }}>
          Let's start by setting up your business information
        </p>
      </div>

      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
            Organization Name
          </label>
          <input
            type="text"
            placeholder="Your Company Name"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
            Subdomain
          </label>
          <input
            type="text"
            placeholder="your-company"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            your-company.ghostcrm.com
          </p>
        </div>
      </div>
    </div>
  )

  const TeamSetup = () => (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <StepIcon type="team" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
          Invite Your Team
        </h2>
        <p style={{ color: '#6b7280' }}>
          Add team members to start collaborating
        </p>
      </div>

      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>
            Team Member Email
          </label>
          <input
            type="email"
            placeholder="colleague@company.com"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
        </div>

        <button
          style={{
            padding: '0.5rem 1rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          Add Member
        </button>
      </div>
    </div>
  )

  const BillingSetup = () => (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <StepIcon type="billing" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
          Choose Your Plan
        </h2>
        <p style={{ color: '#6b7280' }}>
          Select the plan that fits your business needs
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Starter</h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Perfect for small teams</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>$29/month</p>
        </div>

        <div style={{ border: '2px solid #3b82f6', borderRadius: '0.5rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Professional</h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Most popular choice</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>$79/month</p>
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Enterprise</h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>For large organizations</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>$199/month</p>
        </div>
      </div>
    </div>
  )

  const IntegrationsSetup = () => (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <StepIcon type="integrations" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
          Set Up Integrations
        </h2>
        <p style={{ color: '#6b7280' }}>
          Connect your favorite tools and services
        </p>
      </div>

      <IntegrationOnboarding
        onComplete={(prefs) => {
          setIntegrationPreferences(prefs)
          handleComplete()
        }}
      />
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep.id) {
      case 'organization':
        return <OrganizationSetup />
      case 'team':
        return <TeamSetup />
      case 'billing':
        return <BillingSetup />
      case 'integrations':
        return <IntegrationsSetup />
      default:
        return <OrganizationSetup />
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="800px"
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
              Step {currentStepIndex + 1} of {steps.length}
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
                width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '0 1.5rem' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
          <button
            onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
            style={{
              padding: '0.75rem 1.5rem',
              background: currentStepIndex === 0 ? '#f3f4f6' : '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              color: currentStepIndex === 0 ? '#9ca3af' : '#374151',
              cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
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
            {currentStepIndex === steps.length - 1 ? 'Complete Setup' : 'Next'}
            {currentStepIndex === steps.length - 1 ? 
              <CheckCircleIcon style={{ width: '1rem', height: '1rem' }} /> :
              <ArrowRightIcon style={{ width: '1rem', height: '1rem' }} />
            }
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default OnboardingModal