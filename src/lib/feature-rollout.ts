// Feature Rollout Strategy - Progressive Enhancement
interface FeatureRollout {
  phase: number;
  features: string[];
  pricing: string;
  marketingMessage: string;
}

const rolloutPlan: FeatureRollout[] = [
  {
    phase: 1,
    features: [
      'Dashboard & Analytics',
      'Chart Marketplace (Unique!)',
      'Lead Management', 
      'Basic Contact Management',
      'AI Assistant (Basic)',
      'Mobile Responsive Design'
    ],
    pricing: '$97/month - Launch Special',
    marketingMessage: 'AI-Powered CRM with Revolutionary Chart Marketplace'
  },
  {
    phase: 2, 
    features: [
      'Advanced AI Lead Scoring',
      'Deal Pipeline Management',
      'Email Integration',
      'Basic Reporting'
    ],
    pricing: '$97/month (Feature Update)',
    marketingMessage: 'Now with Intelligent Lead Scoring!'
  },
  {
    phase: 3,
    features: [
      'Calendar & Appointments',
      'Task Management',
      'Team Collaboration',
      'Advanced Analytics'
    ],
    pricing: '$127/month (Pro Features Added)', 
    marketingMessage: 'Complete Business Management Suite'
  },
  {
    phase: 4,
    features: [
      'Inventory Management',
      'Financial Reporting', 
      'Marketing Automation',
      'Custom Workflows'
    ],
    pricing: '$197/month (Business Suite)',
    marketingMessage: 'Full Enterprise CRM Solution'
  }
];

// Implementation Strategy
class FeatureGating {
  // Hide advanced features behind "Coming Soon" banners
  static comingSoonFeatures = [
    'inventory',
    'finance',
    'calendar', 
    'appointments',
    'marketing',
    'compliance',
    'contracts',
    'gamification',
    'performance',
    'bi',
    'workflow',
    'sla',
    'client-portal',
    'collaboration'
  ];

  static isFeatureEnabled(featureName: string): boolean {
    // Phase 1: Only core features enabled
    const enabledFeatures = [
      'dashboard',
      'leads', 
      'deals',
      'ai',
      'chart-marketplace'
    ];
    
    return enabledFeatures.includes(featureName);
  }

  static getComingSoonMessage(feature: string): string {
    const messages = {
      'inventory': '🔄 Advanced Inventory Management - Coming December 2025',
      'finance': '💰 Financial Reporting Suite - Coming November 2025', 
      'calendar': '📅 Smart Calendar Integration - Coming Next Week!',
      'marketing': '📈 Marketing Automation - Coming December 2025'
    };
    
    return messages[feature] || '🚀 This feature is coming soon!';
  }
}