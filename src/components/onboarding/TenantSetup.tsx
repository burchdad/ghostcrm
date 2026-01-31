'use client'

import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Users, 
  MapPin, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles
} from 'lucide-react'

interface TenantSetupProps {
  onComplete?: (organizationData: any) => void
  onSkip?: () => void
  className?: string
}

export default function TenantSetup({ 
  onComplete, 
  onSkip, 
  className = "" 
}: TenantSetupProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    companyName: '',
    adminEmail: '',
    subdomain: '',
    industry: 'automotive',
    teamSize: 'small',
    phone: '',
    address: '',
    website: ''
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

  const teamSizes = [
    { value: 'solo', label: 'Just me (1 person)' },
    { value: 'small', label: 'Small team (2-10 people)' },
    { value: 'medium', label: 'Medium team (11-50 people)' },
    { value: 'large', label: 'Large team (50+ people)' }
  ]

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
        return !!(formData.companyName && formData.adminEmail && formData.subdomain && subdomainAvailable)
      case 2:
        return !!(formData.industry && formData.teamSize)
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/tenant/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize organization')
      }

      setSuccess(true)
      
      // Save to localStorage for onboarding tracking
      localStorage.setItem('organization-setup-complete', 'true')
      localStorage.setItem('organization-data', JSON.stringify(data.organization))

      if (onComplete) {
        onComplete(data.organization)
      }

    } catch (error: any) {
      console.error('Organization setup failed:', error)
      setError(error.message || 'Failed to set up organization')
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
            Your organization has been set up successfully with a clean, empty state.
            You're ready to start building your customer database!
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Add your first leads</li>
            <li>• Create sales opportunities</li>
            <li>• Schedule appointments</li>
            <li>• Customize your dashboard</li>
          </ul>
        </div>

        <button
          onClick={() => window.location.href = '/dashboard'}
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
            <h2 className="text-xl font-bold text-gray-900">Set Up Your Organization</h2>
            <p className="text-sm text-gray-600">Create a clean workspace for your team</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {stepNum}
              </div>
              {stepNum < 3 && (
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

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
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
                Admin Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="admin@yourdealership.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subdomain * <span className="text-xs text-gray-500">(This will be your unique URL)</span>
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
                  .ghostcrm.ai
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

        {/* Step 2: Organization Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h3>
            
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
                Team Size *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {teamSizes.map((size) => (
                  <label key={size.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="teamSize"
                      value={size.value}
                      checked={formData.teamSize === size.value}
                      onChange={(e) => handleInputChange('teamSize', e.target.value)}
                      className="mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{size.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Confirm</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Company:</span>
                <span className="font-medium">{formData.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{formData.adminEmail}</span>
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
                <span className="text-gray-600">Team Size:</span>
                <span className="font-medium">
                  {teamSizes.find(s => s.value === formData.teamSize)?.label}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your organization will be created with a completely clean state</li>
                <li>• No demo or sample data will be added</li>
                <li>• You'll be set as the organization owner</li>
                <li>• Basic settings and pipelines will be configured</li>
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
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip for now
            </button>
          )}
          
          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={!validateStep(step)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
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
                  Create Organization
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