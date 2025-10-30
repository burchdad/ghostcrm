// lib/pricing.org.ts - Company-level organization plans

export interface OrgPlan {
  id: 'starter' | 'growth' | 'scale';
  name: string;
  description: string;
  priceMonthly: number;        // company-wide base subscription
  setupFee: number;            // one-time
  features: string[];
  popular?: boolean;
  stripePriceId?: string;      // Stripe price ID for the base plan
}

export const ORG_SETUP_FEE = 499; // One-time setup (bumped up for feature-packed platform)

export const ORG_PLANS: OrgPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Core CRM to get your dealership productive fast.',
    priceMonthly: 149,
    setupFee: ORG_SETUP_FEE,
    stripePriceId: 'price_org_starter_monthly', // TODO: replace with live Stripe ID
    features: [
      'Up to 3 seats included',
      'Leads, Contacts, Deals pipelines',
      'Basic automations (templates)',
      'Team calendar + basic scheduling',
      'Email templates + send (SMTP included)',
      'Mobile app access',
      'Standard dashboards',
      'Role-based access control',
      'Supabase DB + backups (included)',
      'Email + in-app support'
    ]
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Automation + analytics to scale a growing team.',
    priceMonthly: 299,
    setupFee: ORG_SETUP_FEE,
    popular: true,
    stripePriceId: 'price_org_growth_monthly',
    features: [
      'Everything in Starter',
      'Up to 10 seats included',
      'Advanced automations & sequences',
      'Sales dialer + basic SMS (A2P-ready)',
      'Document management + e-sign',
      'Team performance & pipeline analytics',
      'Custom fields & objects',
      'Webhook + API access',
      'SLA & audit log',
      'Priority support'
    ]
  },
  {
    id: 'scale',
    name: 'Scale',
    description: 'Full platform with AI + enterprise controls.',
    priceMonthly: 599,
    setupFee: ORG_SETUP_FEE,
    stripePriceId: 'price_org_scale_monthly',
    features: [
      'Everything in Growth',
      'Unlimited seats included',
      'AI insights + automated follow-ups',
      'Predictive analytics & forecasting',
      'Advanced security & compliance',
      'White-label & SSO/SAML',
      'Custom integrations',
      'Dedicated success manager'
    ]
  }
];

// Helpers for org-level billing
export const getOrgPlan = (id: OrgPlan['id']) => ORG_PLANS.find(p => p.id === id);

export const calculateOrgTotals = (planId: OrgPlan['id']) => {
  const plan = getOrgPlan(planId);
  if (!plan) return { monthly: 0, setup: 0, firstMonth: 0 };
  const monthly = plan.priceMonthly;
  const setup = plan.setupFee;
  return { monthly, setup, firstMonth: monthly + setup };
};