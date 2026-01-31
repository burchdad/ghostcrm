/**
 * PRICING PLANS CONFIGURATION
 * Defines pricing tiers, included features, and available add-ons
 */

import { FeatureId, FeatureDefinition, FEATURE_DEFINITIONS } from './definitions';

export type PlanId = 'starter' | 'professional' | 'business' | 'enterprise';

export interface PricingPlan {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number; // with discount
  yearlyDiscount: number; // percentage
  maxUsers: number;
  maxContacts: number;
  maxDeals: number;
  storageGB: number;
  includedFeatures: FeatureId[];
  availableAddOns: FeatureId[];
  popular?: boolean;
  enterprise?: boolean;
  customPricing?: boolean;
  features: {
    storage: number; // GB
    users: number;
    contacts: number;
    deals: number;
    apiCalls: number; // per month
    emailCampaigns: number; // per month
    workflowRuns: number; // per month
    support: 'email' | 'priority' | 'dedicated';
  };
  limits: {
    customFields: number;
    workflows: number;
    integrations: number;
    reports: number;
  };
}

export const PRICING_PLANS: Record<PlanId, PricingPlan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small dealerships getting started',
    monthlyPrice: 299,
    yearlyPrice: 3588, // 299 * 12 * 0.9 = 10% discount
    yearlyDiscount: 10,
    maxUsers: 5,
    maxContacts: 5000,
    maxDeals: 1000,
    storageGB: 25,
    includedFeatures: [
      'contacts_management',
      'basic_leads',
      'basic_deals',
      'task_management',
      'basic_reporting',
      'file_storage',
      'email_notifications',
      'email_integration',
      'mobile_app'
    ],
    availableAddOns: [
      'api_access',
      'custom_branding'
    ],
    features: {
      storage: 25,
      users: 5,
      contacts: 5000,
      deals: 1000,
      apiCalls: 10000,
      emailCampaigns: 5000,
      workflowRuns: 2500,
      support: 'email',
    },
    limits: {
      customFields: 25,
      workflows: 10,
      integrations: 5,
      reports: 10,
    },
  },

  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Enhanced tools for growing dealerships',
    monthlyPrice: 599,
    yearlyPrice: 7188, // 599 * 12 * 0.9 = 10% discount  
    yearlyDiscount: 10,
    maxUsers: 25,
    maxContacts: 25000,
    maxDeals: 5000,
    storageGB: 100,
    popular: true,
    includedFeatures: [
      'contacts_management',
      'basic_leads',
      'basic_deals',
      'task_management',
      'basic_reporting',
      'file_storage',
      'email_notifications',
      'email_integration',
      'calendar_sync',
      'advanced_pipeline',
      'sales_forecasting',
      'quote_generation',
      'advanced_deals',
      'email_campaigns',
      'lead_scoring',
      'workflow_automation',
      'advanced_reporting',
      'data_export',
      'team_collaboration',
      'mobile_app'
    ],
    availableAddOns: [
      'contract_management',
      'territory_management',
      'commission_tracking',
      'marketing_automation',
      'api_access',
      'custom_branding'
    ],
    features: {
      storage: 100,
      users: 25,
      contacts: 25000,
      deals: 5000,
      apiCalls: 50000,
      emailCampaigns: 25000,
      workflowRuns: 12500,
      support: 'priority'
    },
    limits: {
      customFields: 100,
      workflows: 50,
      integrations: 25,
      reports: 50,
    }
  },

  business: {
    id: 'business',
    name: 'Business',
    description: 'Complete solution for established businesses',
    monthlyPrice: 999,
    yearlyPrice: 11988, // 999 * 12 * 0.9 = 10% discount
    yearlyDiscount: 10,
    maxUsers: 100,
    maxContacts: 100000,
    maxDeals: 25000,
    storageGB: 500,
    enterprise: true,
    includedFeatures: [
      'contacts_management',
      'basic_leads',
      'basic_deals',
      'task_management',
      'basic_reporting',
      'file_storage',
      'email_notifications',
      'email_integration',
      'calendar_sync',
      'advanced_pipeline',
      'sales_forecasting',
      'quote_generation',
      'advanced_deals',
      'email_campaigns',
      'lead_scoring',
      'workflow_automation',
      'advanced_reporting',
      'data_export',
      'team_collaboration',
      'mobile_app',
      'contract_management',
      'territory_management',
      'commission_tracking',
      'marketing_automation',
      'api_access',
      'custom_branding'
    ],
    availableAddOns: [],
    features: {
      storage: 500,
      users: 100,
      contacts: 100000,
      deals: 25000,
      apiCalls: 250000,
      emailCampaigns: 100000,
      workflowRuns: 50000,
      support: 'dedicated'
    },
    limits: {
      customFields: 500,
      workflows: 250,
      integrations: 100,
      reports: 250,
    }
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Complete solution for large dealership groups',
    monthlyPrice: 999,
    yearlyPrice: 11988, // 999 * 12 * 0.9 = 10% discount
    yearlyDiscount: 10,
    maxUsers: -1, // unlimited
    maxContacts: -1, // unlimited
    maxDeals: -1, // unlimited
    storageGB: -1, // unlimited
    enterprise: true,
    customPricing: false,
    includedFeatures: [
      'contacts_management',
      'basic_leads',
      'basic_deals',
      'task_management',
      'basic_reporting',
      'file_storage',
      'email_notifications',
      'email_integration',
      'calendar_sync',
      'advanced_pipeline',
      'sales_forecasting',
      'quote_generation',
      'advanced_deals',
      'email_campaigns',
      'lead_scoring',
      'workflow_automation',
      'advanced_reporting',
      'data_export',
      'team_collaboration',
      'mobile_app',
      'contract_management',
      'territory_management',
      'commission_tracking',
      'marketing_automation',
      'api_access',
      'custom_branding'
    ],
    availableAddOns: [],
    features: {
      storage: -1, // unlimited
      users: -1, // unlimited
      contacts: -1, // unlimited
      deals: -1, // unlimited
      apiCalls: -1, // unlimited
      emailCampaigns: -1, // unlimited
      workflowRuns: -1, // unlimited
      support: 'dedicated'
    },
    limits: {
      customFields: -1, // unlimited
      workflows: -1, // unlimited
      integrations: -1, // unlimited
      reports: -1, // unlimited
    }
  }
};

/**
 * Add-on packages that can be purchased separately
 */
export interface AddOnPackage {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  features: FeatureId[];
  availableForPlans: PlanId[];
}

export const ADD_ON_PACKAGES: Record<string, AddOnPackage> = {
  sales_powerpack: {
    id: 'sales_powerpack',
    name: 'Sales PowerPack',
    description: 'Advanced sales tools and automation',
    monthlyPrice: 49,
    features: [
      'advanced_pipeline',
      'sales_forecasting',
      'quote_generation',
      'contract_management',
      'territory_management',
      'commission_tracking'
    ],
    availableForPlans: ['starter', 'professional']
  },

  marketing_suite: {
    id: 'marketing_suite',
    name: 'Marketing Suite',
    description: 'Complete marketing automation platform',
    monthlyPrice: 79,
    features: [
      'email_campaigns',
      'marketing_automation',
      'landing_pages',
      'sms_marketing',
      'drip_campaigns',
      'lead_scoring'
    ],
    availableForPlans: ['starter', 'professional', 'business']
  },

  automation_plus: {
    id: 'automation_plus',
    name: 'Automation Plus',
    description: 'Advanced workflow automation and triggers',
    monthlyPrice: 39,
    features: [
      'workflow_automation',
      'custom_triggers',
      'api_webhooks',
      'scheduled_actions',
      'conditional_logic',
      'bulk_operations'
    ],
    availableForPlans: ['starter', 'professional']
  },

  analytics_pro: {
    id: 'analytics_pro',
    name: 'Analytics Pro',
    description: 'Advanced reporting and business intelligence',
    monthlyPrice: 59,
    features: [
      'advanced_reporting',
      'custom_dashboards',
      'performance_metrics',
      'conversion_tracking',
      'roi_analysis',
      'predictive_analytics'
    ],
    availableForPlans: ['starter', 'professional', 'business']
  },

  integration_hub: {
    id: 'integration_hub',
    name: 'Integration Hub',
    description: 'Connect with all your favorite tools',
    monthlyPrice: 29,
    features: [
      'social_platforms',
      'accounting_software',
      'marketing_tools',
      'zapier_integration',
      'api_access'
    ],
    availableForPlans: ['starter', 'professional']
  },

  ai_assistant: {
    id: 'ai_assistant',
    name: 'AI Assistant',
    description: 'AI-powered insights and automation',
    monthlyPrice: 99,
    features: [
      'ai_insights',
      'predictive_scoring',
      'sentiment_analysis',
      'intelligent_routing'
    ],
    availableForPlans: ['professional', 'business', 'enterprise']
  }
};

/**
 * Helper functions for pricing plans
 */
export function getPlan(planId: PlanId): PricingPlan {
  return PRICING_PLANS[planId];
}

export function getAllPlans(): PricingPlan[] {
  return Object.values(PRICING_PLANS);
}

export function getAddOnPackage(packageId: string): AddOnPackage | undefined {
  return ADD_ON_PACKAGES[packageId];
}

export function getAvailableAddOns(planId: PlanId): AddOnPackage[] {
  return Object.values(ADD_ON_PACKAGES).filter(pkg => 
    pkg.availableForPlans.includes(planId)
  );
}

export function calculatePlanCost(
  planId: PlanId, 
  billing: 'monthly' | 'yearly',
  addOns: string[] = []
): { planCost: number; addOnCost: number; total: number; discount?: number } {
  const plan = getPlan(planId);
  const planCost = billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  
  const addOnCost = addOns.reduce((total, addOnId) => {
    const addOn = getAddOnPackage(addOnId);
    if (addOn) {
      const cost = billing === 'yearly' ? addOn.monthlyPrice * 12 : addOn.monthlyPrice;
      return total + cost;
    }
    return total;
  }, 0);

  const total = planCost + addOnCost;
  const discount = billing === 'yearly' ? plan.yearlyDiscount : undefined;

  return { planCost, addOnCost, total, discount };
}

export function isPlanFeatureIncluded(planId: PlanId, featureId: FeatureId): boolean {
  const plan = getPlan(planId);
  return plan.includedFeatures.includes(featureId);
}

export function isPlanFeatureAvailableAsAddOn(planId: PlanId, featureId: FeatureId): boolean {
  const plan = getPlan(planId);
  return plan.availableAddOns.includes(featureId);
}

export function getFeatureRequirement(featureId: FeatureId): {
  minimumPlan?: PlanId;
  availableAsAddOn: PlanId[];
  enterpriseOnly: boolean;
} {
  const plans = getAllPlans();
  const feature = FEATURE_DEFINITIONS[featureId];
  
  let minimumPlan: PlanId | undefined;
  const availableAsAddOn: PlanId[] = [];

  for (const plan of plans) {
    if (plan.includedFeatures.includes(featureId)) {
      if (!minimumPlan) {
        minimumPlan = plan.id;
      }
    }
    if (plan.availableAddOns.includes(featureId)) {
      availableAsAddOn.push(plan.id);
    }
  }

  return {
    minimumPlan,
    availableAsAddOn,
    enterpriseOnly: feature?.enterpriseOnly || false
  };
}

export function validatePlanLimits(planId: PlanId, usage: {
  users?: number;
  contacts?: number;
  deals?: number;
  storage?: number;
}): { valid: boolean; violations: string[] } {
  const plan = getPlan(planId);
  const violations: string[] = [];

  if (usage.users && plan.maxUsers !== -1 && usage.users > plan.maxUsers) {
    violations.push(`Users limit exceeded: ${usage.users}/${plan.maxUsers}`);
  }
  
  if (usage.contacts && plan.maxContacts !== -1 && usage.contacts > plan.maxContacts) {
    violations.push(`Contacts limit exceeded: ${usage.contacts}/${plan.maxContacts}`);
  }
  
  if (usage.deals && plan.maxDeals !== -1 && usage.deals > plan.maxDeals) {
    violations.push(`Deals limit exceeded: ${usage.deals}/${plan.maxDeals}`);
  }
  
  if (usage.storage && plan.storageGB !== -1 && usage.storage > plan.storageGB) {
    violations.push(`Storage limit exceeded: ${usage.storage}GB/${plan.storageGB}GB`);
  }

  return { valid: violations.length === 0, violations };
}