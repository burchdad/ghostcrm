'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  UserPlus,
  Settings,
  Zap
} from 'lucide-react'

interface PostBillingOnboardingProps {
  onComplete?: (organizationData: any) => void
  className?: string
}

export default function PostBillingOnboarding({ 
  onComplete, 
  className = "" 
}: PostBillingOnboardingProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [checkoutSession, setCheckoutSession] = useState<any>(null)

  const [formData, setFormData] = useState({
    companyName: '',
    subdomain: '',
    industry: 'automotive',
    phone: '',
    address: '',
    website: '',
    logoUrl: ''
  })

  const [teamConfig, setTeamConfig] = useState({
    initialTeamSize: 1,
    departments: ['Sales'],
    workflowPreferences: 'automated'
  })

  const [subdomainChecking, setSubdomainChecking] = useState(false)
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null)

  const industries = [
    { value: 'automotive', label: 'Automotive Dealership' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'retail', label: 'Retail' },
    { value: 'services', label: 'Professional Services' },
    { value: 'other', label: 'Other' }
  ]

  // Check if coming from successful Stripe checkout
  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      // Verify checkout session and get organization details
      fetch(`/api/billing/verify-session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCheckoutSession(data.session)
            // Pre-populate with any data from checkout
            if (data.organization) {
              setFormData(prev => ({
                ...prev,
                companyName: data.organization.name || '',
                // Any other pre-populated data
              }))
            }
          }
        })
        .catch(error => {
          console.error('Failed to verify checkout session:', error)
        })
    }
  }, [searchParams])

  // Auto-generate subdomain from company name
  useEffect(() => {
    if (formData.companyName && !formData.subdomain) {
      const generated = formData.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 30)
      
      setFormData(prev => ({ ...prev, subdomain: generated }))
    }
  }, [formData.companyName])

  // Check subdomain availability
  useEffect(() => {
    if (formData.subdomain && formData.subdomain.length >= 3) {
      const checkSubdomain = async () => {
        setSubdomainChecking(true)
        try {
          const response = await fetch('/api/tenant/check-subdomain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subdomain: formData.subdomain })
          })
          const data = await response.json()
          setSubdomainAvailable(data.available)
        } catch (error) {
          console.error('Subdomain check failed:', error)
          setSubdomainAvailable(null)
        } finally {
          setSubdomainChecking(false)
        }
      }
      
      const timeoutId = setTimeout(checkSubdomain, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [formData.subdomain])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(formData.companyName && formData.subdomain && subdomainAvailable)
      case 2:
        return !!(formData.industry)
      case 3:
        return true // Team config is optional
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleComplete = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      setError('Please complete all required fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/onboarding/complete-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationData: formData,
          teamConfig: teamConfig,
          checkoutSessionId: checkoutSession?.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete organization setup')
      }

      setSuccess(true)
      
      // Save completion state
      localStorage.setItem('onboarding-complete', 'true')
      localStorage.setItem('organization-data', JSON.stringify(data.organization))

      if (onComplete) {
        onComplete(data.organization)
      }

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error: any) {
      console.error('Setup completion failed:', error)
      setError(error.message || 'Failed to complete organization setup')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-lg p-8 text-center ${className}`}>
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to GhostCRM! 🎉</h2>
          <p className="text-gray-600">
            Your organization has been set up successfully. Your team is ready to start using GhostCRM!
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Explore your clean, empty CRM workspace</li>
            <li>• Add your first leads and customers</li>
            <li>• Invite team members to collaborate</li>
            <li>• Customize your sales pipeline</li>
          </ul>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Complete Your Organization Setup</h2>
            <p className="text-sm text-gray-600">Customize your GhostCRM workspace</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {stepNum}
              </div>
              {stepNum < 4 && (
                <div className={`w-8 h-1 mx-2 ${
                  step > stepNum ? 'bg-purple-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Step 1: Company Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Acme Auto Dealership"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subdomain * <span className="text-xs text-gray-500">(Your unique CRM URL)</span>
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={(e) => handleInputChange('subdomain', e.target.value.toLowerCase())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="acme-auto"
                  pattern="[a-z0-9-]+"
                />
                <div className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600">
                  .ghostcrm.com
                </div>
              </div>
              
              {formData.subdomain && (
                <div className="mt-1 flex items-center gap-2 text-xs">
                  {subdomainChecking ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-gray-500">Checking availability...</span>
                    </>
                  ) : subdomainAvailable === true ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">Available!</span>
                    </>
                  ) : subdomainAvailable === false ? (
                    <>
                      <AlertCircle className="w-3 h-3 text-red-600" />
                      <span className="text-red-600">Not available</span>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Industry & Preferences */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry & Preferences</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry *
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {industries.map((industry) => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website (Optional)
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://yourdealership.com"
              />
            </div>
          </div>
        )}

        {/* Step 3: Team Configuration */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Configuration</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Your Team Setup
              </h4>
              <p className="text-sm text-blue-800">
                Based on your billing plan, you can add team members with different roles and permissions. 
                You'll be able to invite additional users from your admin dashboard.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workflow Preference
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'manual', label: 'Manual Process', desc: 'Full control over each step' },
                  { value: 'automated', label: 'Automated Workflows', desc: 'Smart automation for efficiency' },
                  { value: 'hybrid', label: 'Hybrid Approach', desc: 'Balance of control and automation' }
                ].map((pref) => (
                  <label key={pref.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="workflowPreferences"
                      value={pref.value}
                      checked={teamConfig.workflowPreferences === pref.value}
                      onChange={(e) => setTeamConfig(prev => ({ ...prev, workflowPreferences: e.target.value }))}
                      className="mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{pref.label}</div>
                      <div className="text-sm text-gray-600">{pref.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Launch</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Company:</span>
                <span className="font-medium">{formData.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">URL:</span>
                <span className="font-medium">{formData.subdomain}.ghostcrm.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Industry:</span>
                <span className="font-medium">
                  {industries.find(i => i.value === formData.industry)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Workflow:</span>
                <span className="font-medium capitalize">{teamConfig.workflowPreferences}</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">
                <Zap className="w-4 h-4 inline mr-2" />
                Ready to Launch!
              </h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Your organization workspace will be created</li>
                <li>• Empty, clean database ready for your data</li>
                <li>• Billing is already configured and active</li>
                <li>• You can invite team members immediately</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-100 flex justify-between">
        <div>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
          )}
        </div>

        <div className="flex gap-3">
          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!validateStep(step)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading || !validateStep(1) || !validateStep(2)}
              className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Launch My CRM
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}