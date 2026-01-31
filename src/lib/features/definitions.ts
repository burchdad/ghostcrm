/**
 * FEATURE DEFINITIONS SYSTEM
 * Central configuration for all application features, pricing plans, and add-ons
 */

export type FeatureCategory = 
  | 'core' 
  | 'sales' 
  | 'marketing' 
  | 'automation' 
  | 'analytics' 
  | 'integrations' 
  | 'collaboration' 
  | 'advanced' 
  | 'enterprise';

export type FeatureId = 
  // Core Features
  | 'contacts_management'
  | 'basic_leads'
  | 'basic_deals'
  | 'task_management'
  | 'basic_reporting'
  | 'file_storage'
  | 'email_notifications'
  
  // Sales Features
  | 'advanced_pipeline'
  | 'sales_forecasting'
  | 'quote_generation'
  | 'contract_management'
  | 'territory_management'
  | 'commission_tracking'
  | 'advanced_deals'
  
  // Marketing Features
  | 'email_campaigns'
  | 'lead_scoring'
  | 'marketing_automation'
  | 'landing_pages'
  | 'social_media_integration'
  | 'sms_marketing'
  | 'drip_campaigns'
  
  // Automation Features
  | 'workflow_automation'
  | 'custom_triggers'
  | 'api_webhooks'
  | 'scheduled_actions'
  | 'conditional_logic'
  | 'bulk_operations'
  
  // Analytics Features
  | 'advanced_reporting'
  | 'custom_dashboards'
  | 'data_export'
  | 'performance_metrics'
  | 'conversion_tracking'
  | 'roi_analysis'
  | 'predictive_analytics'
  
  // Integrations Features
  | 'email_integration'
  | 'calendar_sync'
  | 'social_platforms'
  | 'accounting_software'
  | 'marketing_tools'
  | 'custom_integrations'
  | 'zapier_integration'
  | 'api_access'
  
  // Collaboration Features
  | 'team_collaboration'
  | 'shared_workspaces'
  | 'comment_system'
  | 'document_sharing'
  | 'activity_feeds'
  | 'mention_notifications'
  | 'real_time_updates'
  
  // Advanced Features
  | 'ai_insights'
  | 'predictive_scoring'
  | 'sentiment_analysis'
  | 'intelligent_routing'
  | 'voice_integration'
  | 'mobile_app'
  | 'offline_sync'
  
  // Enterprise Features
  | 'sso_authentication'
  | 'advanced_security'
  | 'audit_logging'
  | 'custom_branding'
  | 'dedicated_support'
  | 'priority_processing'
  | 'custom_development'
  | 'data_residency'
  | 'compliance_tools';

export interface FeatureDefinition {
  id: FeatureId;
  name: string;
  description: string;
  category: FeatureCategory;
  isCore: boolean;
  dependencies?: FeatureId[];
  limits?: {
    users?: number;
    storage?: number; // in GB
    records?: number;
    apiCalls?: number; // per month
    customFields?: number;
    workflows?: number;
    integrations?: number;
  };
  addOnPrice?: number; // monthly price if sold as add-on
  enterpriseOnly?: boolean;
}

export const FEATURE_DEFINITIONS: Record<FeatureId, FeatureDefinition> = {
  // Core Features (included in all plans)
  contacts_management: {
    id: 'contacts_management',
    name: 'Contact Management',
    description: 'Store and organize customer contact information',
    category: 'core',
    isCore: true,
    limits: { records: 1000 }
  },
  basic_leads: {
    id: 'basic_leads',
    name: 'Lead Management',
    description: 'Track and manage sales leads',
    category: 'core',
    isCore: true,
    limits: { records: 500 }
  },
  basic_deals: {
    id: 'basic_deals',
    name: 'Deal Tracking',
    description: 'Basic deal and opportunity management',
    category: 'core',
    isCore: true,
    limits: { records: 200 }
  },
  task_management: {
    id: 'task_management',
    name: 'Task Management',
    description: 'Create and track tasks and activities',
    category: 'core',
    isCore: true
  },
  basic_reporting: {
    id: 'basic_reporting',
    name: 'Basic Reports',
    description: 'Standard reports and analytics',
    category: 'core',
    isCore: true
  },
  file_storage: {
    id: 'file_storage',
    name: 'File Storage',
    description: 'Upload and store files',
    category: 'core',
    isCore: true,
    limits: { storage: 5 }
  },
  email_notifications: {
    id: 'email_notifications',
    name: 'Email Notifications',
    description: 'Basic email notifications',
    category: 'core',
    isCore: true
  },

  // Sales Features
  advanced_pipeline: {
    id: 'advanced_pipeline',
    name: 'Advanced Sales Pipeline',
    description: 'Customizable sales pipeline with stages',
    category: 'sales',
    isCore: false,
    dependencies: ['basic_deals'],
    addOnPrice: 15
  },
  sales_forecasting: {
    id: 'sales_forecasting',
    name: 'Sales Forecasting',
    description: 'Predict future sales performance',
    category: 'sales',
    isCore: false,
    dependencies: ['advanced_pipeline'],
    addOnPrice: 25
  },
  quote_generation: {
    id: 'quote_generation',
    name: 'Quote Generation',
    description: 'Create and send professional quotes',
    category: 'sales',
    isCore: false,
    addOnPrice: 20
  },
  contract_management: {
    id: 'contract_management',
    name: 'Contract Management',
    description: 'Manage contracts and agreements',
    category: 'sales',
    isCore: false,
    dependencies: ['quote_generation'],
    addOnPrice: 30
  },
  territory_management: {
    id: 'territory_management',
    name: 'Territory Management',
    description: 'Manage sales territories and assignments',
    category: 'sales',
    isCore: false,
    addOnPrice: 20
  },
  commission_tracking: {
    id: 'commission_tracking',
    name: 'Commission Tracking',
    description: 'Track sales commissions and payouts',
    category: 'sales',
    isCore: false,
    addOnPrice: 25
  },
  advanced_deals: {
    id: 'advanced_deals',
    name: 'Advanced Deal Management',
    description: 'Enhanced deal tracking with custom fields',
    category: 'sales',
    isCore: false,
    dependencies: ['basic_deals'],
    addOnPrice: 15
  },

  // Marketing Features
  email_campaigns: {
    id: 'email_campaigns',
    name: 'Email Campaigns',
    description: 'Create and send email marketing campaigns',
    category: 'marketing',
    isCore: false,
    addOnPrice: 30,
    limits: { apiCalls: 10000 }
  },
  lead_scoring: {
    id: 'lead_scoring',
    name: 'Lead Scoring',
    description: 'Automatically score leads based on behavior',
    category: 'marketing',
    isCore: false,
    dependencies: ['basic_leads'],
    addOnPrice: 25
  },
  marketing_automation: {
    id: 'marketing_automation',
    name: 'Marketing Automation',
    description: 'Automated marketing workflows',
    category: 'marketing',
    isCore: false,
    dependencies: ['email_campaigns'],
    addOnPrice: 40
  },
  landing_pages: {
    id: 'landing_pages',
    name: 'Landing Pages',
    description: 'Create custom landing pages',
    category: 'marketing',
    isCore: false,
    addOnPrice: 20
  },
  social_media_integration: {
    id: 'social_media_integration',
    name: 'Social Media Integration',
    description: 'Connect and manage social media accounts',
    category: 'marketing',
    isCore: false,
    addOnPrice: 15
  },
  sms_marketing: {
    id: 'sms_marketing',
    name: 'SMS Marketing',
    description: 'Send SMS campaigns to contacts',
    category: 'marketing',
    isCore: false,
    addOnPrice: 35,
    limits: { apiCalls: 5000 }
  },
  drip_campaigns: {
    id: 'drip_campaigns',
    name: 'Drip Campaigns',
    description: 'Automated email drip sequences',
    category: 'marketing',
    isCore: false,
    dependencies: ['email_campaigns'],
    addOnPrice: 25
  },

  // Automation Features
  workflow_automation: {
    id: 'workflow_automation',
    name: 'Workflow Automation',
    description: 'Automate business processes',
    category: 'automation',
    isCore: false,
    addOnPrice: 30,
    limits: { workflows: 5 }
  },
  custom_triggers: {
    id: 'custom_triggers',
    name: 'Custom Triggers',
    description: 'Create custom automation triggers',
    category: 'automation',
    isCore: false,
    dependencies: ['workflow_automation'],
    addOnPrice: 20
  },
  api_webhooks: {
    id: 'api_webhooks',
    name: 'API Webhooks',
    description: 'Real-time data synchronization via webhooks',
    category: 'automation',
    isCore: false,
    addOnPrice: 25,
    limits: { apiCalls: 50000 }
  },
  scheduled_actions: {
    id: 'scheduled_actions',
    name: 'Scheduled Actions',
    description: 'Schedule automated actions',
    category: 'automation',
    isCore: false,
    dependencies: ['workflow_automation'],
    addOnPrice: 15
  },
  conditional_logic: {
    id: 'conditional_logic',
    name: 'Conditional Logic',
    description: 'Advanced conditional workflows',
    category: 'automation',
    isCore: false,
    dependencies: ['workflow_automation'],
    addOnPrice: 25
  },
  bulk_operations: {
    id: 'bulk_operations',
    name: 'Bulk Operations',
    description: 'Perform bulk data operations',
    category: 'automation',
    isCore: false,
    addOnPrice: 20
  },

  // Analytics Features
  advanced_reporting: {
    id: 'advanced_reporting',
    name: 'Advanced Reporting',
    description: 'Custom reports with advanced analytics',
    category: 'analytics',
    isCore: false,
    dependencies: ['basic_reporting'],
    addOnPrice: 30
  },
  custom_dashboards: {
    id: 'custom_dashboards',
    name: 'Custom Dashboards',
    description: 'Create personalized dashboards',
    category: 'analytics',
    isCore: false,
    dependencies: ['advanced_reporting'],
    addOnPrice: 25
  },
  data_export: {
    id: 'data_export',
    name: 'Data Export',
    description: 'Export data in various formats',
    category: 'analytics',
    isCore: false,
    addOnPrice: 15
  },
  performance_metrics: {
    id: 'performance_metrics',
    name: 'Performance Metrics',
    description: 'Track team and individual performance',
    category: 'analytics',
    isCore: false,
    addOnPrice: 20
  },
  conversion_tracking: {
    id: 'conversion_tracking',
    name: 'Conversion Tracking',
    description: 'Track conversion rates and funnel performance',
    category: 'analytics',
    isCore: false,
    dependencies: ['advanced_reporting'],
    addOnPrice: 25
  },
  roi_analysis: {
    id: 'roi_analysis',
    name: 'ROI Analysis',
    description: 'Return on investment analysis tools',
    category: 'analytics',
    isCore: false,
    addOnPrice: 30
  },
  predictive_analytics: {
    id: 'predictive_analytics',
    name: 'Predictive Analytics',
    description: 'AI-powered predictive insights',
    category: 'analytics',
    isCore: false,
    dependencies: ['advanced_reporting'],
    addOnPrice: 50,
    enterpriseOnly: true
  },

  // Integration Features
  email_integration: {
    id: 'email_integration',
    name: 'Email Integration',
    description: 'Connect with email providers',
    category: 'integrations',
    isCore: false,
    addOnPrice: 15,
    limits: { integrations: 3 }
  },
  calendar_sync: {
    id: 'calendar_sync',
    name: 'Calendar Sync',
    description: 'Synchronize with calendar applications',
    category: 'integrations',
    isCore: false,
    addOnPrice: 10
  },
  social_platforms: {
    id: 'social_platforms',
    name: 'Social Platform Integration',
    description: 'Connect with social media platforms',
    category: 'integrations',
    isCore: false,
    addOnPrice: 20,
    limits: { integrations: 5 }
  },
  accounting_software: {
    id: 'accounting_software',
    name: 'Accounting Software Integration',
    description: 'Connect with accounting platforms',
    category: 'integrations',
    isCore: false,
    addOnPrice: 30
  },
  marketing_tools: {
    id: 'marketing_tools',
    name: 'Marketing Tools Integration',
    description: 'Connect with marketing platforms',
    category: 'integrations',
    isCore: false,
    addOnPrice: 25,
    limits: { integrations: 10 }
  },
  custom_integrations: {
    id: 'custom_integrations',
    name: 'Custom Integrations',
    description: 'Build custom API integrations',
    category: 'integrations',
    isCore: false,
    addOnPrice: 50,
    enterpriseOnly: true
  },
  zapier_integration: {
    id: 'zapier_integration',
    name: 'Zapier Integration',
    description: 'Connect via Zapier platform',
    category: 'integrations',
    isCore: false,
    addOnPrice: 20
  },
  api_access: {
    id: 'api_access',
    name: 'API Access',
    description: 'Full REST API access',
    category: 'integrations',
    isCore: false,
    addOnPrice: 40,
    limits: { apiCalls: 100000 }
  },

  // Collaboration Features
  team_collaboration: {
    id: 'team_collaboration',
    name: 'Team Collaboration',
    description: 'Team workspace and collaboration tools',
    category: 'collaboration',
    isCore: false,
    addOnPrice: 20
  },
  shared_workspaces: {
    id: 'shared_workspaces',
    name: 'Shared Workspaces',
    description: 'Create shared team workspaces',
    category: 'collaboration',
    isCore: false,
    dependencies: ['team_collaboration'],
    addOnPrice: 15
  },
  comment_system: {
    id: 'comment_system',
    name: 'Comment System',
    description: 'Add comments to records and activities',
    category: 'collaboration',
    isCore: false,
    addOnPrice: 10
  },
  document_sharing: {
    id: 'document_sharing',
    name: 'Document Sharing',
    description: 'Share documents with team members',
    category: 'collaboration',
    isCore: false,
    dependencies: ['file_storage'],
    addOnPrice: 15
  },
  activity_feeds: {
    id: 'activity_feeds',
    name: 'Activity Feeds',
    description: 'Real-time activity updates',
    category: 'collaboration',
    isCore: false,
    addOnPrice: 15
  },
  mention_notifications: {
    id: 'mention_notifications',
    name: 'Mention Notifications',
    description: 'Get notified when mentioned',
    category: 'collaboration',
    isCore: false,
    dependencies: ['comment_system'],
    addOnPrice: 5
  },
  real_time_updates: {
    id: 'real_time_updates',
    name: 'Real-time Updates',
    description: 'Live data synchronization',
    category: 'collaboration',
    isCore: false,
    addOnPrice: 25
  },

  // Advanced Features
  ai_insights: {
    id: 'ai_insights',
    name: 'AI Insights',
    description: 'AI-powered business insights',
    category: 'advanced',
    isCore: false,
    addOnPrice: 60,
    enterpriseOnly: true
  },
  predictive_scoring: {
    id: 'predictive_scoring',
    name: 'Predictive Scoring',
    description: 'AI-powered lead and deal scoring',
    category: 'advanced',
    isCore: false,
    dependencies: ['lead_scoring'],
    addOnPrice: 45
  },
  sentiment_analysis: {
    id: 'sentiment_analysis',
    name: 'Sentiment Analysis',
    description: 'Analyze customer sentiment',
    category: 'advanced',
    isCore: false,
    addOnPrice: 35
  },
  intelligent_routing: {
    id: 'intelligent_routing',
    name: 'Intelligent Routing',
    description: 'AI-powered lead routing',
    category: 'advanced',
    isCore: false,
    addOnPrice: 40
  },
  voice_integration: {
    id: 'voice_integration',
    name: 'Voice Integration',
    description: 'Voice recording and analysis',
    category: 'advanced',
    isCore: false,
    addOnPrice: 35
  },
  mobile_app: {
    id: 'mobile_app',
    name: 'Mobile App Access',
    description: 'Native mobile application',
    category: 'advanced',
    isCore: false,
    addOnPrice: 25
  },
  offline_sync: {
    id: 'offline_sync',
    name: 'Offline Sync',
    description: 'Work offline with data synchronization',
    category: 'advanced',
    isCore: false,
    dependencies: ['mobile_app'],
    addOnPrice: 20
  },

  // Enterprise Features
  sso_authentication: {
    id: 'sso_authentication',
    name: 'SSO Authentication',
    description: 'Single sign-on integration',
    category: 'enterprise',
    isCore: false,
    addOnPrice: 75,
    enterpriseOnly: true
  },
  advanced_security: {
    id: 'advanced_security',
    name: 'Advanced Security',
    description: 'Enhanced security features',
    category: 'enterprise',
    isCore: false,
    addOnPrice: 50,
    enterpriseOnly: true
  },
  audit_logging: {
    id: 'audit_logging',
    name: 'Audit Logging',
    description: 'Comprehensive audit trails',
    category: 'enterprise',
    isCore: false,
    addOnPrice: 40,
    enterpriseOnly: true
  },
  custom_branding: {
    id: 'custom_branding',
    name: 'Custom Branding',
    description: 'White-label and custom branding',
    category: 'enterprise',
    isCore: false,
    addOnPrice: 60,
    enterpriseOnly: true
  },
  dedicated_support: {
    id: 'dedicated_support',
    name: 'Dedicated Support',
    description: '24/7 dedicated customer support',
    category: 'enterprise',
    isCore: false,
    addOnPrice: 100,
    enterpriseOnly: true
  },
  priority_processing: {
    id: 'priority_processing',
    name: 'Priority Processing',
    description: 'Priority queue for all operations',
    category: 'enterprise',
    isCore: false,
    addOnPrice: 75,
    enterpriseOnly: true
  },
  custom_development: {
    id: 'custom_development',
    name: 'Custom Development',
    description: 'Custom feature development',
    category: 'enterprise',
    isCore: false,
    addOnPrice: 200,
    enterpriseOnly: true
  },
  data_residency: {
    id: 'data_residency',
    name: 'Data Residency',
    description: 'Control where data is stored',
    category: 'enterprise',
    isCore: false,
    addOnPrice: 150,
    enterpriseOnly: true
  },
  compliance_tools: {
    id: 'compliance_tools',
    name: 'Compliance Tools',
    description: 'GDPR, HIPAA, SOX compliance tools',
    category: 'enterprise',
    isCore: false,
    addOnPrice: 125,
    enterpriseOnly: true
  }
};

/**
 * Helper functions for working with features
 */
export function getFeature(id: FeatureId): FeatureDefinition {
  return FEATURE_DEFINITIONS[id];
}

export function getFeaturesByCategory(category: FeatureCategory): FeatureDefinition[] {
  return Object.values(FEATURE_DEFINITIONS).filter(f => f.category === category);
}

export function getCoreFeatures(): FeatureDefinition[] {
  return Object.values(FEATURE_DEFINITIONS).filter(f => f.isCore);
}

export function getAddOnFeatures(): FeatureDefinition[] {
  return Object.values(FEATURE_DEFINITIONS).filter(f => !f.isCore && f.addOnPrice);
}

export function getEnterpriseFeatures(): FeatureDefinition[] {
  return Object.values(FEATURE_DEFINITIONS).filter(f => f.enterpriseOnly);
}

export function validateFeatureDependencies(features: FeatureId[]): { valid: boolean; missing: FeatureId[] } {
  const missing: FeatureId[] = [];
  
  for (const featureId of features) {
    const feature = getFeature(featureId);
    if (feature.dependencies) {
      for (const dep of feature.dependencies) {
        if (!features.includes(dep)) {
          missing.push(dep);
        }
      }
    }
  }
  
  return { valid: missing.length === 0, missing };
}

export function calculateFeatureCost(features: FeatureId[]): number {
  return features.reduce((total, featureId) => {
    const feature = getFeature(featureId);
    return total + (feature.addOnPrice || 0);
  }, 0);
}