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

export const ORG_SETUP_FEE = 799; // One-time setup matching billing page

export const ORG_PLANS: OrgPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small dealerships getting started',
    priceMonthly: 299,
    setupFee: ORG_SETUP_FEE,
    stripePriceId: 'price_org_starter_monthly',
    features: [
      'Up to 5 team members',
      'Up to 500 vehicles in inventory',
      'Core CRM & lead management',
      'Basic reporting & analytics',
      'Email & SMS integration',
      'Mobile app access',
      'Customer portal',
      'Standard support',
      'Basic integrations (DMS, websites)',
      'Standard security & backups'
    ]
  },
  {
    id: 'growth',
    name: 'Professional',
    description: 'Enhanced tools for growing dealerships',
    priceMonthly: 599,
    setupFee: ORG_SETUP_FEE,
    popular: true,
    stripePriceId: 'price_org_professional_monthly',
    features: [
      'Up to 25 team members',
      'Up to 2,000 vehicles in inventory',
      'Everything in Starter, plus:',
      'Advanced AI-powered insights',
      'Advanced automation workflows',
      'Custom reporting & dashboards',
      'Advanced integrations (F&I, lenders)',
      'Team performance analytics',
      'Advanced customer segmentation',
      'Priority support',
      'API access for custom integrations',
      'Enhanced security & compliance'
    ]
  },
  {
    id: 'scale',
    name: 'Enterprise',
    description: 'Complete solution for large dealership groups',
    priceMonthly: 999,
    setupFee: ORG_SETUP_FEE,
    stripePriceId: 'price_org_enterprise_monthly',
    features: [
      'Unlimited team members',
      'Unlimited vehicle inventory',
      'Everything in Professional, plus:',
      'White-label & custom branding',
      'Advanced AI & machine learning',
      'Multi-location management',
      'Custom integrations & API access',
      'Dedicated account manager',
      'Custom training & onboarding',
      '24/7 premium support',
      'Enterprise security & compliance',
      'Advanced analytics & forecasting'
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