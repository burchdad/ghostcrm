// Integration configuration types for enterprise onboarding
export interface DatabaseConfig {
  type: 'supabase' | 'mysql' | 'postgresql' | 'mongodb' | 'salesforce' | 'hubspot' | 'existing_crm'
  connectionString?: string
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  ssl?: boolean
  migrationRequired?: boolean
  existingRecords?: number
}

export interface TelephonyConfig {
  provider: 'twilio' | 'ringcentral' | 'vonage' | 'dialpad' | 'aircall' | 'none'
  accountSid?: string
  authToken?: string
  phoneNumbers?: string[]
  features: {
    inboundCalls: boolean
    outboundCalls: boolean
    callRecording: boolean
    voicemail: boolean
    callRouting: boolean
    analytics: boolean
  }
  integrationLevel: 'basic' | 'advanced' | 'white_label'
}

export interface MessagingConfig {
  smsProvider: 'twilio' | 'messagebird' | 'plivo' | 'bandwidth' | 'none'
  whatsappBusiness?: boolean
  mmsSupport?: boolean
  internationalSms?: boolean
  bulkMessaging?: boolean
  autoResponders?: boolean
  messagingNumbers?: string[]
}

export interface EmailConfig {
  provider: 'smtp' | 'office365' | 'gmail' | 'outlook' | 'sendgrid' | 'mailgun' | 'ses'
  smtpHost?: string
  smtpPort?: number
  username?: string
  password?: string
  encryption?: 'tls' | 'ssl' | 'none'
  fromEmail?: string
  fromName?: string
  features: {
    emailTemplates: boolean
    emailTracking: boolean
    emailSequences: boolean
    bulkEmail: boolean
    emailAnalytics: boolean
  }
}

export interface CRMMigrationConfig {
  currentCRM?: 'salesforce' | 'hubspot' | 'pipedrive' | 'zoho' | 'monday' | 'airtable' | 'excel' | 'other'
  migrationMethod: 'api' | 'csv_import' | 'manual' | 'none'
  dataToMigrate: {
    contacts: boolean
    deals: boolean
    activities: boolean
    notes: boolean
    documents: boolean
    customFields: boolean
  }
  estimatedRecords: number
  migrationTimeline: 'immediate' | 'within_week' | 'within_month' | 'later'
}

export interface APIIntegrationsConfig {
  zapierEnabled: boolean
  webhooksEnabled: boolean
  customApiAccess: boolean
  integrationsNeeded: {
    googleWorkspace: boolean
    microsoftOffice: boolean
    slack: boolean
    docusign: boolean
    accounting: string // 'quickbooks' | 'xero' | 'sage' | 'none'
    marketing: string // 'mailchimp' | 'hubspot' | 'marketo' | 'none'
    calendar: string // 'google' | 'outlook' | 'calendly' | 'none'
  }
}

export interface ComplianceConfig {
  gdprCompliance: boolean
  hipaaCompliance: boolean
  soxCompliance: boolean
  dataRetentionPeriod: number // in months
  dataEncryption: 'standard' | 'enhanced' | 'enterprise'
  auditLogging: 'basic' | 'detailed' | 'forensic'
  backupFrequency: 'daily' | 'hourly' | 'real_time'
  geoRestrictions?: string[] // country codes
}

export interface IntegrationPreferences {
  database: DatabaseConfig
  telephony: TelephonyConfig
  messaging: MessagingConfig
  email: EmailConfig
  crmMigration: CRMMigrationConfig
  apiIntegrations: APIIntegrationsConfig
  compliance: ComplianceConfig
  customRequirements?: string
  implementationSupport: 'self_service' | 'guided' | 'white_glove'
}

// Integration connector fees (not full service costs - clients already pay for their services)
export const INTEGRATION_PRICING = {
  database: {
    supabase: 0, // Default included
    mysql: 15, // Just the connector/sync fee
    postgresql: 15, // Just the connector/sync fee
    mongodb: 25, // Slightly more complex connector
    salesforce: 35, // API integration fee
    hubspot: 30, // API integration fee
    existing_crm: 50 // Custom connector development
  },
  telephony: {
    none: 0,
    basic: 10, // Basic API integration
    advanced: 25, // Advanced features + webhook setup
    white_label: 50 // Custom white-label integration
  },
  messaging: {
    none: 0,
    basic: 8, // SMS connector fee
    advanced: 15 // SMS + WhatsApp + MMS connector
  },
  email: {
    smtp: 0, // Default included
    hosted: 5, // Hosted email service connector (Office365, Gmail)
    transactional: 10 // Transactional email service connector (SendGrid, Mailgun)
  },
  compliance: {
    standard: 0, // Default included
    enhanced: 25, // Enhanced security features
    enterprise: 75 // Enterprise-grade compliance tools
  },
  implementation: {
    self_service: 0,
    guided: 200, // Reduced from $500
    white_glove: 750 // Reduced from $2000
  }
}

// Default integrations included in each pricing tier
export const INCLUDED_INTEGRATIONS = {
  basic: {
    database: 'supabase',
    telephony: 'none',
    messaging: 'none', 
    email: 'smtp',
    compliance: 'standard'
  },
  pro: {
    database: 'supabase',
    telephony: 'basic', // One phone provider included
    messaging: 'basic', // Basic SMS included
    email: 'hosted', // One hosted email provider included
    compliance: 'standard'
  },
  elite: {
    database: 'supabase', // Can upgrade to external DB with connector fee
    telephony: 'advanced', // Advanced phone features included
    messaging: 'advanced', // SMS + WhatsApp included
    email: 'transactional', // Advanced email features included
    compliance: 'enhanced' // Enhanced compliance included
  }
}

// Map user tiers to integration tiers for proper inclusion calculation
export const USER_TIER_TO_INTEGRATION_TIER = {
  // Sales Rep tiers
  'sales_rep_basic': 'basic',
  'sales_rep_pro': 'pro', 
  'sales_rep_elite': 'elite',
  
  // Sales Manager tiers (same as Sales Rep Pro for integrations)
  'sales_manager_basic': 'pro',
  'sales_manager_pro': 'pro',
  'sales_manager_elite': 'elite',
  
  // Admin tiers (same as Sales Rep Pro for integrations)
  'admin_basic': 'pro',
  'admin_pro': 'pro',
  'admin_elite': 'elite'
} as const

export const INTEGRATION_PROVIDERS = {
  databases: [
    { value: 'supabase', label: 'Supabase (Included)', description: 'Fully managed, fastest setup', setup: 'immediate', price: 0 },
    { value: 'mysql', label: 'MySQL Database', description: 'Connect your existing MySQL', setup: '1-2 days', price: 15 },
    { value: 'postgresql', label: 'PostgreSQL', description: 'Connect your PostgreSQL instance', setup: '1-2 days', price: 15 },
    { value: 'mongodb', label: 'MongoDB', description: 'NoSQL document database', setup: '2-3 days', price: 25 },
    { value: 'salesforce', label: 'Salesforce Integration', description: 'Sync with existing Salesforce', setup: '1-2 weeks', price: 35 },
    { value: 'hubspot', label: 'HubSpot Integration', description: 'Integrate with HubSpot CRM', setup: '3-5 days', price: 30 },
    { value: 'existing_crm', label: 'Other CRM System', description: 'Custom integration required', setup: '2-4 weeks', price: 50 }
  ],
  telephony: [
    { value: 'none', label: 'No Phone Integration', description: 'Skip phone system setup', price: 0 },
    { value: 'twilio', label: 'Twilio', description: 'Most popular, reliable (you pay Twilio directly)', price: 10 },
    { value: 'ringcentral', label: 'RingCentral', description: 'Enterprise-grade (you pay RingCentral directly)', price: 10 },
    { value: 'vonage', label: 'Vonage Business', description: 'Global coverage (you pay Vonage directly)', price: 10 },
    { value: 'dialpad', label: 'Dialpad', description: 'AI-powered calls (you pay Dialpad directly)', price: 10 },
    { value: 'aircall', label: 'Aircall', description: 'CRM-native solution (you pay Aircall directly)', price: 10 }
  ],
  messaging: [
    { value: 'none', label: 'No SMS Integration', description: 'Skip SMS setup', price: 0 },
    { value: 'twilio', label: 'Twilio SMS', description: 'Connect your Twilio SMS (you pay Twilio rates)', price: 8 },
    { value: 'messagebird', label: 'MessageBird', description: 'Connect your MessageBird (you pay MessageBird rates)', price: 8 },
    { value: 'plivo', label: 'Plivo', description: 'Connect your Plivo account (you pay Plivo rates)', price: 8 },
    { value: 'bandwidth', label: 'Bandwidth', description: 'Connect your Bandwidth account (you pay Bandwidth rates)', price: 8 }
  ],
  email: [
    { value: 'smtp', label: 'Custom SMTP (Included)', description: 'Use your email server', price: 0 },
    { value: 'office365', label: 'Office 365', description: 'Connect your O365 (you pay Microsoft)', price: 5 },
    { value: 'gmail', label: 'Gmail Workspace', description: 'Connect your Gmail (you pay Google)', price: 5 },
    { value: 'sendgrid', label: 'SendGrid', description: 'Connect your SendGrid (you pay SendGrid rates)', price: 10 },
    { value: 'mailgun', label: 'Mailgun', description: 'Connect your Mailgun (you pay Mailgun rates)', price: 10 },
    { value: 'ses', label: 'Amazon SES', description: 'Connect your AWS SES (you pay AWS rates)', price: 8 }
  ]
}

export const calculateIntegrationCosts = (
  preferences: Partial<IntegrationPreferences>,
  orgTier: 'basic' | 'pro' | 'elite' = 'basic'
): number => {
  let totalCost = 0
  const includedIntegrations = INCLUDED_INTEGRATIONS[orgTier]

  // Database integration cost (only if different from included)
  if (preferences.database?.type && preferences.database.type !== includedIntegrations.database) {
    totalCost += INTEGRATION_PRICING.database[preferences.database.type] || 0
  }

  // Telephony cost (only if upgrading from included level)
  if (preferences.telephony?.integrationLevel) {
    const includedLevel = includedIntegrations.telephony === 'none' ? 'none' : 'basic'
    if (preferences.telephony.integrationLevel !== 'basic' && includedLevel === 'none') {
      // Going from no phone to any phone integration
      totalCost += INTEGRATION_PRICING.telephony[preferences.telephony.integrationLevel] || 0
    } else if (preferences.telephony.integrationLevel === 'advanced' && includedLevel === 'basic') {
      // Upgrading from basic to advanced
      totalCost += INTEGRATION_PRICING.telephony.advanced - INTEGRATION_PRICING.telephony.basic
    } else if (preferences.telephony.integrationLevel === 'white_label') {
      // White label is always an upgrade
      const baseCost = includedLevel === 'none' ? 0 : INTEGRATION_PRICING.telephony.basic
      totalCost += INTEGRATION_PRICING.telephony.white_label - baseCost
    }
  }

  // Messaging cost (only if upgrading from included)
  if (preferences.messaging?.smsProvider && preferences.messaging.smsProvider !== 'none') {
    const hasIncludedMessaging = includedIntegrations.messaging !== 'none'
    if (!hasIncludedMessaging) {
      totalCost += INTEGRATION_PRICING.messaging.basic
    } else if (preferences.messaging.whatsappBusiness || preferences.messaging.mmsSupport) {
      // Upgrade to advanced messaging features
      totalCost += INTEGRATION_PRICING.messaging.advanced - INTEGRATION_PRICING.messaging.basic
    }
  }

  // Email cost (only if upgrading from included)
  if (preferences.email?.provider) {
    const emailType = preferences.email.provider === 'smtp' ? 'smtp' : 
                     ['office365', 'gmail'].includes(preferences.email.provider) ? 'hosted' : 'transactional'
    
    const includedEmailType = includedIntegrations.email === 'smtp' ? 'smtp' :
                             includedIntegrations.email === 'hosted' ? 'hosted' : 'transactional'
    
    if (emailType !== includedEmailType) {
      const selectedCost = INTEGRATION_PRICING.email[emailType as keyof typeof INTEGRATION_PRICING.email] || 0
      const includedCost = INTEGRATION_PRICING.email[includedEmailType as keyof typeof INTEGRATION_PRICING.email] || 0
      totalCost += Math.max(0, selectedCost - includedCost)
    }
  }

  // Compliance cost (only if upgrading from included level)
  if (preferences.compliance?.dataEncryption) {
    const includedCompliance = includedIntegrations.compliance
    if (preferences.compliance.dataEncryption !== includedCompliance) {
      const selectedCost = INTEGRATION_PRICING.compliance[preferences.compliance.dataEncryption] || 0
      const includedCost = INTEGRATION_PRICING.compliance[includedCompliance as keyof typeof INTEGRATION_PRICING.compliance] || 0
      totalCost += Math.max(0, selectedCost - includedCost)
    }
  }

  // Implementation support cost (one-time, convert to monthly equivalent for 12 months)
  if (preferences.implementationSupport && preferences.implementationSupport !== 'self_service') {
    const oneTimeCost = INTEGRATION_PRICING.implementation[preferences.implementationSupport] || 0
    totalCost += Math.round(oneTimeCost / 12 * 100) / 100 // Monthly equivalent for 12 months
  }

  return totalCost
}

// Helper function to get what's included in each tier
export const getIncludedFeatures = (tier: 'basic' | 'pro' | 'elite') => {
  const included = INCLUDED_INTEGRATIONS[tier]
  return {
    database: 'Supabase Database',
    telephony: included.telephony === 'none' ? 'No phone integration' : 
               included.telephony === 'basic' ? 'Basic phone integration' : 'Advanced phone features',
    messaging: included.messaging === 'none' ? 'No SMS integration' : 
               included.messaging === 'basic' ? 'Basic SMS' : 'SMS + WhatsApp + MMS',
    email: included.email === 'smtp' ? 'SMTP email' : 
           included.email === 'hosted' ? 'Hosted email (Office365/Gmail)' : 'Advanced email features',
    compliance: included.compliance === 'standard' ? 'Standard security' : 
                included.compliance === 'enhanced' ? 'Enhanced security' : 'Enterprise security'
  }
}