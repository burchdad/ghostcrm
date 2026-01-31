// Pricing configuration for Ghost Auto CRM
export interface PricingTier {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  limitations?: string[]
  popular?: boolean
  stripePriceId?: string
}

export interface RolePricing {
  role: string
  displayName: string
  description: string
  icon: string
  tiers: PricingTier[]
}

export const SETUP_FEE = 199 // One-time setup fee

export const PRICING_CONFIG: RolePricing[] = [
  {
    role: 'sales_rep',
    displayName: 'Sales Representative',
    description: 'Perfect for front-line sales team members',
    icon: '👤',
    tiers: [
      {
        id: 'sales_rep_basic',
        name: 'Basic',
        description: 'Essential CRM features for individual contributors',
        price: 25,
        stripePriceId: 'price_sales_rep_basic_monthly', // Replace with actual Stripe price ID
        features: [
          'Lead management',
          'Contact database access',
          'Basic activity tracking',
          'Email templates',
          'Mobile app access',
          'Basic reporting (own leads only)',
          '• Supabase database (included)',
          '• SMTP email (included)',
          '• Standard security (included)'
        ],
        limitations: [
          'Cannot view other reps\' leads',
          'No analytics dashboard',
          'No automation tools'
        ]
      },
      {
        id: 'sales_rep_pro',
        name: 'Professional',
        description: 'Enhanced tools for experienced sales professionals',
        price: 45,
        popular: true,
        stripePriceId: 'price_sales_rep_pro_monthly',
        features: [
          'Everything in Basic',
          'Advanced lead scoring',
          'Email & SMS messaging',
          'Calendar integration',
          'Document management',
          'Team performance insights',
          'Pipeline reporting',
          'Customer portal access',
          '• Basic phone integration (included)',
          '• Basic SMS integration (included)',
          '• Hosted email provider (included)',
          '• External database connectors available'
        ]
      },
      {
        id: 'sales_rep_elite',
        name: 'Elite',
        description: 'Complete solution with AI and automation',
        price: 65,
        stripePriceId: 'price_sales_rep_elite_monthly',
        features: [
          'Everything in Professional',
          'AI-powered insights',
          'Automated follow-ups',
          'Advanced analytics',
          'API access',
          'Custom integrations',
          'Priority support',
          'Advanced automation workflows',
          '• Advanced phone features (included)',
          '• SMS + WhatsApp + MMS (included)',
          '• Advanced email features (included)',
          '• Enhanced security & compliance (included)',
          '• All integration connectors available'
        ]
      }
    ]
  },
  {
    role: 'sales_manager',
    displayName: 'Sales Manager',
    description: 'Team oversight and performance management',
    icon: '👥',
    tiers: [
      {
        id: 'sales_manager_basic',
        name: 'Basic',
        description: 'Essential management tools for small teams',
        price: 40,
        stripePriceId: 'price_sales_manager_basic_monthly',
        features: [
          'Everything Sales Rep Pro includes',
          'Team lead assignment',
          'Basic team reporting',
          'Lead distribution',
          'Performance dashboards',
          'Goal tracking',
          'Team activity monitoring',
          '• Same integrations as Sales Rep Pro tier'
        ]
      },
      {
        id: 'sales_manager_pro',
        name: 'Professional',
        description: 'Advanced management and coaching tools',
        price: 60,
        popular: true,
        stripePriceId: 'price_sales_manager_pro_monthly',
        features: [
          'Everything in Basic',
          'Advanced team analytics',
          'Coaching tools',
          'Commission tracking',
          'Territory management',
          'Forecasting tools',
          'Custom reports',
          'Team workflow automation',
          '• Same integrations as Sales Rep Pro tier'
        ]
      },
      {
        id: 'sales_manager_elite',
        name: 'Elite',
        description: 'Complete management suite with AI insights',
        price: 80,
        stripePriceId: 'price_sales_manager_elite_monthly',
        features: [
          'Everything in Professional',
          'AI-powered team insights',
          'Predictive analytics',
          'Advanced forecasting',
          'Custom KPI dashboards',
          'A/B testing tools',
          'Advanced integrations',
          'Dedicated account manager'
        ]
      }
    ]
  },
  {
    role: 'admin',
    displayName: 'Administrator',
    description: 'Full system access and organizational control',
    icon: '⚡',
    tiers: [
      {
        id: 'admin_basic',
        name: 'Basic',
        description: 'Core administrative capabilities',
        price: 50,
        stripePriceId: 'price_admin_basic_monthly',
        features: [
          'Everything Sales Manager Pro includes',
          'User management',
          'Role & permissions control',
          'Organization settings',
          'Basic billing management',
          'System configuration',
          'Data export tools',
          'Security settings',
          '• Same integrations as Sales Rep Pro tier'
        ]
      },
      {
        id: 'admin_pro',
        name: 'Professional',
        description: 'Advanced automation and system tools',
        price: 75,
        popular: true,
        stripePriceId: 'price_admin_pro_monthly',
        features: [
          'Everything in Basic',
          'Workflow automation',
          'Custom fields & objects',
          'Advanced integrations',
          'Audit logs',
          'Backup & restore',
          'Advanced security controls',
          'Custom branding',
          'API management',
          '• Same integrations as Sales Rep Pro tier'
        ]
      },
      {
        id: 'admin_elite',
        name: 'Elite',
        description: 'Complete platform control with enterprise features',
        price: 100,
        stripePriceId: 'price_admin_elite_monthly',
        features: [
          'Everything in Professional',
          'AI system management',
          'Enterprise integrations',
          'Advanced analytics platform',
          'White-label options',
          'Custom development support',
          'Priority technical support',
          'Dedicated success manager',
          'Advanced compliance tools',
          '• Same integrations as Sales Rep Elite tier',
          '• Custom integration development included',
          '• White-glove implementation support'
        ]
      }
    ]
  }
]

// Helper functions
export const getRolePricing = (role: string): RolePricing | undefined => {
  return PRICING_CONFIG.find(config => config.role === role)
}

export const getTierPricing = (role: string, tierId: string): PricingTier | undefined => {
  const roleConfig = getRolePricing(role)
  return roleConfig?.tiers.find(tier => tier.id === tierId)
}

export const calculateMonthlyTotal = (selectedUsers: { role: string; tier: string; count: number }[]): number => {
  return selectedUsers.reduce((total, user) => {
    const tierPricing = getTierPricing(user.role, user.tier)
    return total + (tierPricing?.price || 0) * user.count
  }, 0)
}

export const calculateSetupTotal = (hasSetupFee: boolean = true): number => {
  return hasSetupFee ? SETUP_FEE : 0
}

export const calculateGrandTotal = (
  selectedUsers: { role: string; tier: string; count: number }[], 
  hasSetupFee: boolean = true
): { monthly: number; setup: number; firstMonth: number } => {
  const monthly = calculateMonthlyTotal(selectedUsers)
  const setup = calculateSetupTotal(hasSetupFee)
  
  return {
    monthly,
    setup,
    firstMonth: monthly + setup
  }
}