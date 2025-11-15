'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckIcon,
  CogIcon,
  CircleStackIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import {
  IntegrationPreferences,
  INTEGRATION_PROVIDERS,
  calculateIntegrationCosts,
  getIncludedFeatures,
  INCLUDED_INTEGRATIONS,
  USER_TIER_TO_INTEGRATION_TIER,
} from '@/lib/integrations'

interface IntegrationOnboardingProps {
  onComplete: (preferences: IntegrationPreferences) => void
  onSkip: () => void
  orgTier: 'basic' | 'pro' | 'elite'
  userTier?: string // e.g. 'sales_rep_pro', 'admin_elite'
}

export function IntegrationOnboarding({
  onComplete,
  onSkip,
  orgTier,
  userTier,
}: IntegrationOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState<Partial<IntegrationPreferences>>({
    implementationSupport: 'self_service',
  })
  const [estimatedCost, setEstimatedCost] = useState(0)

  // Safer mapping from userTier -> integration tier (fall back to orgTier)
  const actualIntegrationTier: 'basic' | 'pro' | 'elite' =
    (userTier &&
      (USER_TIER_TO_INTEGRATION_TIER as Record<string, 'basic' | 'pro' | 'elite'>)[userTier]) ||
    orgTier

  const steps = [
    { id: 'database', title: 'Database Integration', icon: CircleStackIcon },
    { id: 'telephony', title: 'Phone System', icon: PhoneIcon },
    { id: 'messaging', title: 'SMS & Messaging', icon: GlobeAltIcon },
    { id: 'email', title: 'Email Configuration', icon: EnvelopeIcon },
    { id: 'crm_migration', title: 'CRM Migration', icon: ArrowPathIcon },
    { id: 'api_integrations', title: 'API & Integrations', icon: CogIcon },
    { id: 'compliance', title: 'Compliance & Security', icon: ShieldCheckIcon },
    { id: 'summary', title: 'Review & Complete', icon: CheckIcon },
  ] as const

  useEffect(() => {
    setEstimatedCost(calculateIntegrationCosts(preferences, actualIntegrationTier))
  }, [preferences, actualIntegrationTier])

  const updatePreference = <T extends keyof IntegrationPreferences>(
    key: T,
    value: IntegrationPreferences[T]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1)
  }
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  const handleComplete = () => {
    // Fill in defaults for any unset sections
    const completePreferences: IntegrationPreferences = {
      database:
        preferences.database ?? { type: 'supabase', migrationRequired: false, existingRecords: 0 },
      telephony:
        preferences.telephony ?? {
          provider: 'none',
          features: {
            inboundCalls: false,
            outboundCalls: false,
            callRecording: false,
            voicemail: false,
            callRouting: false,
            analytics: false,
          },
          integrationLevel: 'basic',
        },
      messaging:
        preferences.messaging ?? {
          smsProvider: 'none',
          whatsappBusiness: false,
          mmsSupport: false,
          internationalSms: false,
          bulkMessaging: false,
          autoResponders: false,
        },
      email:
        preferences.email ?? {
          provider: 'smtp',
          features: {
            emailTemplates: true,
            emailTracking: true,
            emailSequences: true,
            bulkEmail: false,
            emailAnalytics: true,
          },
        },
      crmMigration:
        preferences.crmMigration ?? {
          migrationMethod: 'none',
          dataToMigrate: {
            contacts: false,
            deals: false,
            activities: false,
            notes: false,
            documents: false,
            customFields: false,
          },
          estimatedRecords: 0,
          migrationTimeline: 'later',
        },
      apiIntegrations:
        preferences.apiIntegrations ?? {
          zapierEnabled: false,
          webhooksEnabled: false,
          customApiAccess: false,
          integrationsNeeded: {
            googleWorkspace: false,
            microsoftOffice: false,
            slack: false,
            docusign: false,
            accounting: 'none',
            marketing: 'none',
            calendar: 'none',
          },
        },
      compliance:
        preferences.compliance ?? {
          gdprCompliance: false,
          hipaaCompliance: false,
          soxCompliance: false,
          dataRetentionPeriod: 84,
          dataEncryption: 'standard',
          auditLogging: 'basic',
          backupFrequency: 'daily',
        },
      implementationSupport: preferences.implementationSupport ?? 'self_service',
    }

    onComplete(completePreferences)
  }

  // ---------- Steps renderers ----------
  const renderDatabaseStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-2">Database Integration</h3>
        <p className="text-sm text-white/80 mb-6">
          Choose how you want to store and manage your CRM data. All database options are included in your plan.
        </p>
      </div>

      <div className="space-y-4">
        {INTEGRATION_PROVIDERS.databases.map((provider) => {
          const isRecommended = provider.value === 'supabase'
          const selected = preferences.database?.type === provider.value
          return (
            <div
              key={provider.value}
              className={`rounded-xl p-6 cursor-pointer transition-all duration-300 hover:transform hover:scale-105 ${
                selected ? 'ring-2 ring-white/40' : ''
              }`}
              style={{
                background: selected 
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.2))'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                backdropFilter: 'blur(20px)',
                border: selected 
                  ? '2px solid rgba(139, 92, 246, 0.5)' 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: selected 
                  ? '0 8px 25px rgba(139, 92, 246, 0.3)' 
                  : '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
              onClick={() =>
                updatePreference('database', {
                  type: provider.value as any,
                  migrationRequired: provider.value !== 'supabase',
                  existingRecords: 0,
                })
              }
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                      background: isRecommended 
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                    }}>
                      <CircleStackIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{provider.label}</h4>
                      {isRecommended && (
                        <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full border border-green-500/30">
                          ⭐ Recommended
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-white/70 ml-13">{provider.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">Setup: {provider.setup}</div>
                  <div className="text-sm text-green-300 font-medium">
                    ✓ Included
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {preferences.database?.type && preferences.database.type !== 'supabase' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.2)'
          }}
        >
          <h4 className="font-medium text-amber-200 mb-2">Additional Configuration Required</h4>
          <p className="text-sm text-amber-100 mb-3">
            Custom database integration requires additional setup time and may involve data migration.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-amber-200 mb-1">
                Estimated Existing Records
              </label>
              <input
                type="number"
                className="w-full border border-amber-300/30 rounded-xl px-3 py-2 text-sm bg-white/10 text-white placeholder-white/50"
                placeholder="0"
                onChange={(e) =>
                  updatePreference('database', {
                    ...(preferences.database ?? { type: 'supabase', migrationRequired: false, existingRecords: 0 }),
                    existingRecords: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="migration-required"
                checked={preferences.database?.migrationRequired || false}
                onChange={(e) =>
                  updatePreference('database', {
                    ...(preferences.database ?? { type: 'supabase', migrationRequired: false, existingRecords: 0 }),
                    migrationRequired: e.target.checked,
                  })
                }
                className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
              />
              <label htmlFor="migration-required" className="text-sm text-amber-100">
                Data migration from existing system required
              </label>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )

  const renderTelephonyStep = () => {
    const includedLevel = INCLUDED_INTEGRATIONS[actualIntegrationTier].telephony

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Phone System Integration</h3>
          <p className="text-sm text-gray-600 mb-6">
            Connect your preferred phone system for calls, recording, and analytics.
            {includedLevel !== 'none' && ` Basic phone integration is included in your ${actualIntegrationTier} plan.`}
          </p>
        </div>

        <div className="space-y-3">
          {INTEGRATION_PROVIDERS.telephony.map((provider) => {
            const isIncluded =
              (provider.value === 'none' && includedLevel === 'none') ||
              (provider.value !== 'none' && includedLevel !== 'none')
            const selected = preferences.telephony?.provider === provider.value

            return (
              <div
                key={provider.value}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() =>
                  updatePreference('telephony', {
                    provider: provider.value as any,
                    features: {
                      inboundCalls: provider.value !== 'none',
                      outboundCalls: provider.value !== 'none',
                      callRecording: provider.value !== 'none',
                      voicemail: provider.value !== 'none',
                      callRouting: provider.value !== 'none',
                      analytics: provider.value !== 'none',
                    },
                    integrationLevel: provider.value === 'none' ? 'basic' : 'advanced',
                  })
                }
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{provider.label}</h4>
                      {isIncluded && provider.value !== 'none' && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Included
                        </span>
                      )}
                    </div>
                    {provider.description && (
                      <p className="text-sm text-gray-600">{provider.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {provider.value === 'none'
                        ? 'Skip'
                        : isIncluded
                        ? 'Included'
                        : `+$${provider.price}/mo connector`}
                    </div>
                    {provider.value !== 'none' && (
                      <div className="text-xs text-gray-500">+ your {provider.label} bill</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {preferences.telephony?.provider && preferences.telephony.provider !== 'none' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <h4 className="font-medium text-blue-800 mb-3">Phone Features</h4>
            <div className="space-y-2">
              {Object.entries(preferences.telephony.features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center gap-2 capitalize">
                  <input
                    type="checkbox"
                    id={`phone-${feature}`}
                    checked={enabled}
                    onChange={(e) =>
                      updatePreference('telephony', {
                        ...(preferences.telephony ?? {
                          provider: 'none',
                          features: {
                            inboundCalls: false,
                            outboundCalls: false,
                            callRecording: false,
                            voicemail: false,
                            callRouting: false,
                            analytics: false,
                          },
                          integrationLevel: 'basic',
                        }),
                        features: {
                          ...preferences.telephony!.features,
                          [feature]: e.target.checked,
                        } as typeof preferences.telephony.features,
                      })
                    }
                  />
                  <label htmlFor={`phone-${feature}`} className="text-sm text-blue-800">
                    {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </label>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  // Strongly-typed toggle keys to avoid typeof value expressions in types
  const messagingToggles = [
    { key: 'whatsappBusiness', label: 'WhatsApp Business Integration' },
    { key: 'mmsSupport', label: 'MMS (Picture Messages) Support' },
    { key: 'internationalSms', label: 'International SMS' },
    { key: 'bulkMessaging', label: 'Bulk Messaging Campaigns' },
    { key: 'autoResponders', label: 'Automated Response System' },
  ] as const
  type MessagingToggleKey = typeof messagingToggles[number]['key']

  const renderMessagingStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">SMS & Messaging Configuration</h3>
        <p className="text-sm text-gray-600 mb-6">
          Set up SMS, WhatsApp Business, and messaging capabilities for customer communication.
        </p>
      </div>

      <div className="space-y-3">
        {INTEGRATION_PROVIDERS.messaging.map((provider) => (
          <div
            key={provider.value}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              preferences.messaging?.smsProvider === provider.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() =>
              updatePreference('messaging', {
                smsProvider: provider.value as any,
                whatsappBusiness: provider.value !== 'none',
                mmsSupport: provider.value !== 'none',
                internationalSms: provider.value !== 'none',
                bulkMessaging: provider.value !== 'none',
                autoResponders: provider.value !== 'none',
              })
            }
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">{provider.label}</h4>
                {provider.description && <p className="text-sm text-gray-600">{provider.description}</p>}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {provider.price === 0 ? 'Free' : `+$${provider.price}/mo`}
              </div>
            </div>
          </div>
        ))}
      </div>

      {preferences.messaging?.smsProvider && preferences.messaging.smsProvider !== 'none' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <h4 className="font-medium text-green-800 mb-3">Messaging Features</h4>
          <div className="space-y-2">
            {messagingToggles.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`messaging-${key}`}
                  checked={Boolean((preferences.messaging as any)?.[key]) || false}
                  onChange={(e) =>
                    updatePreference('messaging', {
                      ...(preferences.messaging ?? {
                        smsProvider: 'none',
                        whatsappBusiness: false,
                        mmsSupport: false,
                        internationalSms: false,
                        bulkMessaging: false,
                        autoResponders: false,
                      }),
                      [key]: e.target.checked,
                    } as any)
                  }
                />
                <label htmlFor={`messaging-${key}`} className="text-sm text-green-800">
                  {label}
                </label>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Email System Configuration</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure your email system for transactional emails, campaigns, and customer communication.
        </p>
      </div>

      <div className="space-y-3">
        {INTEGRATION_PROVIDERS.email.map((provider) => (
          <div
            key={provider.value}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              preferences.email?.provider === provider.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() =>
              updatePreference('email', {
                provider: provider.value as any,
                features: {
                  emailTemplates: true,
                  emailTracking: true,
                  emailSequences: provider.value !== 'smtp',
                  bulkEmail: provider.value !== 'smtp',
                  emailAnalytics: provider.value !== 'smtp',
                },
              })
            }
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">{provider.label}</h4>
                {provider.description && <p className="text-sm text-gray-600">{provider.description}</p>}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {provider.price === 0 ? 'Free' : `+$${provider.price}/mo`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const migrateKeys = ['contacts', 'deals', 'activities', 'notes', 'documents', 'customFields'] as const
  type MigrateKey = typeof migrateKeys[number]

  const renderCRMMigrationStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">CRM Migration & Data Import</h3>
        <p className="text-sm text-gray-600 mb-6">
          Import your existing customer data from other CRM systems or spreadsheets.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current CRM System (if any)</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            value={preferences.crmMigration?.currentCRM || ''}
            onChange={(e) =>
              updatePreference('crmMigration', {
                ...(preferences.crmMigration ?? {
                  migrationMethod: 'none',
                  dataToMigrate: {
                    contacts: false,
                    deals: false,
                    activities: false,
                    notes: false,
                    documents: false,
                    customFields: false,
                  },
                  estimatedRecords: 0,
                  migrationTimeline: 'later',
                }),
                currentCRM: e.target.value as any,
              })
            }
          >
            <option value="">No existing CRM / Starting fresh</option>
            <option value="salesforce">Salesforce</option>
            <option value="hubspot">HubSpot</option>
            <option value="pipedrive">Pipedrive</option>
            <option value="zoho">Zoho CRM</option>
            <option value="monday">Monday.com</option>
            <option value="airtable">Airtable</option>
            <option value="excel">Excel/Google Sheets</option>
            <option value="other">Other CRM System</option>
          </select>
        </div>

        {preferences.crmMigration?.currentCRM && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Number of Records</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="0"
                value={preferences.crmMigration?.estimatedRecords ?? ''}
                onChange={(e) =>
                  updatePreference('crmMigration', {
                    ...(preferences.crmMigration ?? {
                      migrationMethod: 'none',
                      dataToMigrate: {
                        contacts: false,
                        deals: false,
                        activities: false,
                        notes: false,
                        documents: false,
                        customFields: false,
                      },
                      estimatedRecords: 0,
                      migrationTimeline: 'later',
                    }),
                    estimatedRecords: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Migration Timeline</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={preferences.crmMigration?.migrationTimeline || 'later'}
                onChange={(e) =>
                  updatePreference('crmMigration', {
                    ...(preferences.crmMigration ?? {
                      migrationMethod: 'none',
                      dataToMigrate: {
                        contacts: false,
                        deals: false,
                        activities: false,
                        notes: false,
                        documents: false,
                        customFields: false,
                      },
                      estimatedRecords: 0,
                      migrationTimeline: 'later',
                    }),
                    migrationTimeline: e.target.value as any,
                  })
                }
              >
                <option value="immediate">Immediate (within 24 hours)</option>
                <option value="within_week">Within one week</option>
                <option value="within_month">Within one month</option>
                <option value="later">Later / Not sure</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data to Migrate</label>
              <div className="space-y-2">
                {migrateKeys.map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`migration-${key}`}
                      checked={Boolean(preferences.crmMigration?.dataToMigrate?.[key]) || false}
                      onChange={(e) =>
                        updatePreference('crmMigration', {
                          ...(preferences.crmMigration ?? {
                            migrationMethod: 'none',
                            dataToMigrate: {
                              contacts: false,
                              deals: false,
                              activities: false,
                              notes: false,
                              documents: false,
                              customFields: false,
                            },
                            estimatedRecords: 0,
                            migrationTimeline: 'later',
                          }),
                          dataToMigrate: {
                            ...(preferences.crmMigration?.dataToMigrate ?? {
                              contacts: false,
                              deals: false,
                              activities: false,
                              notes: false,
                              documents: false,
                              customFields: false,
                            }),
                            [key]: e.target.checked,
                          },
                        })
                      }
                    />
                    <label htmlFor={`migration-${key}`} className="text-sm text-gray-700">
                      {key === 'customFields'
                        ? 'Custom Fields & Properties'
                        : key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )

  const renderAPIIntegrationsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">API & Third-Party Integrations</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Automation & Workflows */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Automation & Workflows</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="zapier"
                checked={preferences.apiIntegrations?.zapierEnabled || false}
                onChange={(e) =>
                  updatePreference('apiIntegrations', {
                    ...(preferences.apiIntegrations ?? {
                      zapierEnabled: false,
                      webhooksEnabled: false,
                      customApiAccess: false,
                      integrationsNeeded: {
                        googleWorkspace: false,
                        microsoftOffice: false,
                        slack: false,
                        docusign: false,
                        accounting: 'none',
                        marketing: 'none',
                        calendar: 'none',
                      },
                    }),
                    zapierEnabled: e.target.checked,
                  })
                }
              />
              <label htmlFor="zapier" className="text-sm text-gray-700">
                Zapier Integration (5000+ app connections)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="webhooks"
                checked={preferences.apiIntegrations?.webhooksEnabled || false}
                onChange={(e) =>
                  updatePreference('apiIntegrations', {
                    ...(preferences.apiIntegrations ?? {
                      zapierEnabled: false,
                      webhooksEnabled: false,
                      customApiAccess: false,
                      integrationsNeeded: {
                        googleWorkspace: false,
                        microsoftOffice: false,
                        slack: false,
                        docusign: false,
                        accounting: 'none',
                        marketing: 'none',
                        calendar: 'none',
                      },
                    }),
                    webhooksEnabled: e.target.checked,
                  })
                }
              />
              <label htmlFor="webhooks" className="text-sm text-gray-700">
                Custom Webhooks & API Access
              </label>
            </div>
          </div>
        </div>

        {/* Business Tools */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Business Tools</h4>
          <div className="space-y-2">
            {[
              { key: 'googleWorkspace', label: 'Google Workspace' },
              { key: 'microsoftOffice', label: 'Microsoft Office 365' },
              { key: 'slack', label: 'Slack Communication' },
              { key: 'docusign', label: 'DocuSign E-Signatures' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={key}
                  checked={Boolean(preferences.apiIntegrations?.integrationsNeeded?.[key as 'googleWorkspace' | 'microsoftOffice' | 'slack' | 'docusign']) || false}
                  onChange={(e) =>
                    updatePreference('apiIntegrations', {
                      ...(preferences.apiIntegrations ?? {
                        zapierEnabled: false,
                        webhooksEnabled: false,
                        customApiAccess: false,
                        integrationsNeeded: {
                          googleWorkspace: false,
                          microsoftOffice: false,
                          slack: false,
                          docusign: false,
                          accounting: 'none',
                          marketing: 'none',
                          calendar: 'none',
                        },
                      }),
                      integrationsNeeded: {
                        ...(preferences.apiIntegrations?.integrationsNeeded ?? {
                          googleWorkspace: false,
                          microsoftOffice: false,
                          slack: false,
                          docusign: false,
                          accounting: 'none',
                          marketing: 'none',
                          calendar: 'none',
                        }),
                        [key]: e.target.checked,
                      },
                    })
                  }
                />
                <label htmlFor={key} className="text-sm text-gray-700">
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Accounting */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Accounting Integration</h4>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={preferences.apiIntegrations?.integrationsNeeded?.accounting || 'none'}
            onChange={(e) =>
              updatePreference('apiIntegrations', {
                ...(preferences.apiIntegrations ?? {
                  zapierEnabled: false,
                  webhooksEnabled: false,
                  customApiAccess: false,
                  integrationsNeeded: {
                    googleWorkspace: false,
                    microsoftOffice: false,
                    slack: false,
                    docusign: false,
                    accounting: 'none',
                    marketing: 'none',
                    calendar: 'none',
                  },
                }),
                integrationsNeeded: {
                  ...(preferences.apiIntegrations?.integrationsNeeded ?? {
                    googleWorkspace: false,
                    microsoftOffice: false,
                    slack: false,
                    docusign: false,
                    accounting: 'none',
                    marketing: 'none',
                    calendar: 'none',
                  }),
                  accounting: e.target.value as any,
                },
              })
            }
          >
            <option value="none">No Accounting Integration</option>
            <option value="quickbooks">QuickBooks</option>
            <option value="xero">Xero</option>
            <option value="sage">Sage Accounting</option>
          </select>
        </div>

        {/* Calendar */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Calendar Integration</h4>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={preferences.apiIntegrations?.integrationsNeeded?.calendar || 'none'}
            onChange={(e) =>
              updatePreference('apiIntegrations', {
                ...(preferences.apiIntegrations ?? {
                  zapierEnabled: false,
                  webhooksEnabled: false,
                  customApiAccess: false,
                  integrationsNeeded: {
                    googleWorkspace: false,
                    microsoftOffice: false,
                    slack: false,
                    docusign: false,
                    accounting: 'none',
                    marketing: 'none',
                    calendar: 'none',
                  },
                }),
                integrationsNeeded: {
                  ...(preferences.apiIntegrations?.integrationsNeeded ?? {
                    googleWorkspace: false,
                    microsoftOffice: false,
                    slack: false,
                    docusign: false,
                    accounting: 'none',
                    marketing: 'none',
                    calendar: 'none',
                  }),
                  calendar: e.target.value as any,
                },
              })
            }
          >
            <option value="none">No Calendar Integration</option>
            <option value="google">Google Calendar</option>
            <option value="outlook">Microsoft Outlook</option>
            <option value="calendly">Calendly</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderComplianceStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance & Security</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure security settings and compliance requirements for your organization.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Compliance Requirements */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Compliance Requirements</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="gdpr"
                checked={preferences.compliance?.gdprCompliance || false}
                onChange={(e) =>
                  updatePreference('compliance', {
                    ...(preferences.compliance ?? {
                      gdprCompliance: false,
                      hipaaCompliance: false,
                      soxCompliance: false,
                      dataRetentionPeriod: 84,
                      dataEncryption: 'standard',
                      auditLogging: 'basic',
                      backupFrequency: 'daily',
                    }),
                    gdprCompliance: e.target.checked,
                  })
                }
              />
              <label htmlFor="gdpr" className="text-sm text-gray-700">
                GDPR Compliance (EU Data Protection)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hipaa"
                checked={preferences.compliance?.hipaaCompliance || false}
                onChange={(e) =>
                  updatePreference('compliance', {
                    ...(preferences.compliance ?? {
                      gdprCompliance: false,
                      hipaaCompliance: false,
                      soxCompliance: false,
                      dataRetentionPeriod: 84,
                      dataEncryption: 'standard',
                      auditLogging: 'basic',
                      backupFrequency: 'daily',
                    }),
                    hipaaCompliance: e.target.checked,
                  })
                }
              />
              <label htmlFor="hipaa" className="text-sm text-gray-700">
                HIPAA Compliance (Healthcare Data)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sox"
                checked={preferences.compliance?.soxCompliance || false}
                onChange={(e) =>
                  updatePreference('compliance', {
                    ...(preferences.compliance ?? {
                      gdprCompliance: false,
                      hipaaCompliance: false,
                      soxCompliance: false,
                      dataRetentionPeriod: 84,
                      dataEncryption: 'standard',
                      auditLogging: 'basic',
                      backupFrequency: 'daily',
                    }),
                    soxCompliance: e.target.checked,
                  })
                }
              />
              <label htmlFor="sox" className="text-sm text-gray-700">
                SOX Compliance (Financial Data)
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Security Settings</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Encryption Level</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={preferences.compliance?.dataEncryption || 'standard'}
              onChange={(e) =>
                updatePreference('compliance', {
                  ...(preferences.compliance ?? {
                    gdprCompliance: false,
                    hipaaCompliance: false,
                    soxCompliance: false,
                    dataRetentionPeriod: 84,
                    dataEncryption: 'standard',
                    auditLogging: 'basic',
                    backupFrequency: 'daily',
                  }),
                  dataEncryption: e.target.value as any,
                })
              }
            >
              <option value="standard">Standard Encryption</option>
              <option value="enhanced">Enhanced Encryption (+$100/mo)</option>
              <option value="enterprise">Enterprise Encryption (+$300/mo)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={preferences.compliance?.backupFrequency || 'daily'}
              onChange={(e) =>
                updatePreference('compliance', {
                  ...(preferences.compliance ?? {
                    gdprCompliance: false,
                    hipaaCompliance: false,
                    soxCompliance: false,
                    dataRetentionPeriod: 84,
                    dataEncryption: 'standard',
                    auditLogging: 'basic',
                    backupFrequency: 'daily',
                  }),
                  backupFrequency: e.target.value as any,
                })
              }
            >
              <option value="daily">Daily Backups</option>
              <option value="hourly">Hourly Backups</option>
              <option value="real_time">Real-time Backups</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSummaryStep = () => {
    const includedFeatures = getIncludedFeatures(actualIntegrationTier)

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Integration Summary</h3>
          <p className="text-sm text-gray-600 mb-6">
            Review your integration preferences and estimated additional connector fees.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-4">
            {/* Database */}
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900">Database</div>
                <div className="text-sm text-gray-600">
                  {INTEGRATION_PROVIDERS.databases.find((p) => p.value === preferences.database?.type)?.label ||
                    'Supabase (Default)'}
                </div>
              </div>
              <div className="text-sm font-medium">
                {preferences.database?.type === INCLUDED_INTEGRATIONS[actualIntegrationTier].database
                  ? 'Included'
                  : `+$${
                      INTEGRATION_PROVIDERS.databases.find((p) => p.value === preferences.database?.type)?.price || 0
                    }/mo`}
              </div>
            </div>

            {/* Telephony */}
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900">Phone System</div>
                <div className="text-sm text-gray-600">
                  {INTEGRATION_PROVIDERS.telephony.find((p) => p.value === preferences.telephony?.provider)?.label ||
                    'No Phone Integration'}
                </div>
              </div>
              <div className="text-sm font-medium">
                {(preferences.telephony?.provider === 'none' &&
                  INCLUDED_INTEGRATIONS[actualIntegrationTier].telephony === 'none') ||
                (preferences.telephony?.provider !== 'none' &&
                  INCLUDED_INTEGRATIONS[actualIntegrationTier].telephony !== 'none')
                  ? 'Included'
                  : `+$${INTEGRATION_PROVIDERS.telephony.find((p) => p.value === preferences.telephony?.provider)
                      ?.price || 0}/mo`}
              </div>
            </div>

            {/* Messaging */}
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900">SMS & Messaging</div>
                <div className="text-sm text-gray-600">
                  {INTEGRATION_PROVIDERS.messaging.find((p) => p.value === preferences.messaging?.smsProvider)?.label ||
                    'No SMS Integration'}
                </div>
              </div>
              <div className="text-sm font-medium">
                {(preferences.messaging?.smsProvider === 'none' &&
                  INCLUDED_INTEGRATIONS[actualIntegrationTier].messaging === 'none') ||
                (preferences.messaging?.smsProvider !== 'none' &&
                  INCLUDED_INTEGRATIONS[actualIntegrationTier].messaging !== 'none')
                  ? 'Included'
                  : `+$${
                      INTEGRATION_PROVIDERS.messaging.find((p) => p.value === preferences.messaging?.smsProvider)
                        ?.price || 0
                    }/mo`}
              </div>
            </div>

            {/* Email */}
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900">Email System</div>
                <div className="text-sm text-gray-600">
                  {INTEGRATION_PROVIDERS.email.find((p) => p.value === preferences.email?.provider)?.label ||
                    'Custom SMTP'}
                </div>
              </div>
              <div className="text-sm font-medium">
                {preferences.email?.provider === 'smtp' ||
                (preferences.email?.provider &&
                  ['office365', 'gmail'].includes(preferences.email.provider) &&
                  INCLUDED_INTEGRATIONS[actualIntegrationTier].email === 'hosted')
                  ? 'Included'
                  : `+$${INTEGRATION_PROVIDERS.email.find((p) => p.value === preferences.email?.provider)?.price || 0
                    }/mo`}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4 flex justify-between items-center">
              <div className="font-semibold text-gray-900">Additional Connector Fees</div>
              <div className="font-semibold text-lg text-blue-600">
                {estimatedCost === 0 ? 'No additional fees' : `+$${estimatedCost}/mo`}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Clarification */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-800 mb-2">💡 Connector Fee vs Service Cost</h4>
          <p className="text-sm text-amber-700">
            These are <strong>connector fees only</strong> for integrating your existing services. You still pay your
            providers directly (e.g., your Twilio bill for phone usage, Office 365 for email, etc.). Ghost CRM just
            charges a small fee to connect and sync these services.
          </p>
        </div>
      </div>
    )
  }

  const renderCurrentStep = () => {
    switch (steps[currentStep].id) {
      case 'database':
        return renderDatabaseStep()
      case 'telephony':
        return renderTelephonyStep()
      case 'messaging':
        return renderMessagingStep()
      case 'email':
        return renderEmailStep()
      case 'crm_migration':
        return renderCRMMigrationStep()
      case 'api_integrations':
        return renderAPIIntegrationsStep()
      case 'compliance':
        return renderComplianceStep()
      case 'summary':
        return renderSummaryStep()
      default:
        return <div>Unknown step</div>
    }
  }

  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      overflow: 'hidden'
    }}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 left-1/2 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 20px rgba(168, 85, 247, 0.3)'
          }}>
            <CogIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Integration Setup</h1>
          <p className="text-white/80">Configure your preferred systems and integrations for Ghost Auto CRM</p>
        </div>

        {/* Included Features */}
        <div className="mb-8 rounded-3xl p-6" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 className="text-lg font-medium text-white mb-4">
            ✨ Included in Your {actualIntegrationTier.charAt(0).toUpperCase() + actualIntegrationTier.slice(1)} Plan
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(getIncludedFeatures(actualIntegrationTier)).map(([category, feature]) => (
              <div key={category} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)'
                }}>
                  <CheckIcon className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-white/90">
                  <span className="font-medium capitalize">{category}:</span> {feature}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl" style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <p className="text-sm text-white/90">
              💡 <strong>Everything's Included:</strong> No additional fees for standard integrations. Your existing provider bills stay the same (e.g., Twilio, Office 365).
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                      isActive || isCompleted ? 'transform scale-110' : ''
                    }`}
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                        : isCompleted
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      border: `2px solid ${isActive || isCompleted ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
                      boxShadow: isActive 
                        ? '0 8px 25px rgba(139, 92, 246, 0.4)' 
                        : isCompleted 
                        ? '0 8px 25px rgba(16, 185, 129, 0.4)'
                        : '0 4px 15px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {index < steps.length - 1 && (
                    <div 
                      className="w-16 h-1 ml-4 rounded-full transition-all duration-500"
                      style={{
                        background: isCompleted 
                          ? 'linear-gradient(90deg, #10b981, #059669)' 
                          : 'rgba(255, 255, 255, 0.2)'
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-6 text-center">
            <div className="text-sm text-white/70 mb-1">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="text-lg font-semibold text-white">
              {steps[currentStep].title}
            </div>
          </div>
        </div>

        {/* Step */}
        <div className="rounded-3xl p-8 mb-8" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:transform hover:scale-105"
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
              }}
            >
              Skip Integration Setup
            </button>
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:transform hover:scale-105"
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                }}
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Previous
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-xl transition-all duration-300 hover:transform hover:scale-105"
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
                Next
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-xl transition-all duration-300 hover:transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)'
                }}
              >
                <CheckIcon className="w-4 h-4" />
                Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
