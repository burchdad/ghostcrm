import { FeatureCategory } from './types';

export const leadManagementFeatures: FeatureCategory = {
  id: 'lead-management',
  title: 'Lead Management',
  description: 'Capture, qualify, and convert leads with intelligent automation and personalized follow-ups.',
  icon: 'Target',
  color: 'blue',
  features: [
    {
      id: 'smart-lead-capture',
      title: 'Smart Lead Capture',
      shortDescription: 'Automatically capture leads from multiple sources',
      description: 'Automatically capture leads from your website, social media, and third-party platforms with real-time integration and intelligent form processing.',
      icon: 'Users',
      benefits: [
        {
          title: 'Multi-Channel Integration',
          description: 'Connect website forms, social media, and third-party lead sources'
        },
        {
          title: 'Real-Time Sync',
          description: 'Instant lead capture and notification to your sales team'
        },
        {
          title: 'Smart Form Builder',
          description: 'Create optimized lead capture forms with conditional logic'
        }
      ],
      keyFeatures: [
        'Website form integration',
        'Social media lead sync',
        'Third-party API connections',
        'Real-time notifications',
        'Duplicate detection',
        'Lead source tracking'
      ],
      useCases: [
        'Website visitors requesting information',
        'Social media engagement leads',
        'Trade show lead imports',
        'Referral partner integrations'
      ],
      pricing: {
        starter: true,
        professional: true,
        enterprise: true
      }
    },
    {
      id: 'ai-lead-scoring',
      title: 'AI-Powered Lead Scoring',
      shortDescription: 'Prioritize prospects with machine learning',
      description: 'Advanced machine learning algorithms analyze lead behavior, demographics, and engagement patterns to automatically score and prioritize your hottest prospects.',
      icon: 'Brain',
      benefits: [
        {
          title: 'Behavioral Analysis',
          description: 'Track website visits, email engagement, and interaction patterns'
        },
        {
          title: 'Predictive Scoring',
          description: 'Machine learning predicts conversion probability'
        },
        {
          title: 'Custom Criteria',
          description: 'Set your own scoring rules and weightings'
        }
      ],
      keyFeatures: [
        'Machine learning algorithms',
        'Behavioral tracking',
        'Custom scoring rules',
        'Automatic prioritization',
        'Score history tracking',
        'Team notifications'
      ],
      useCases: [
        'Prioritizing sales outreach',
        'Qualifying marketing leads',
        'Resource allocation',
        'Performance optimization'
      ],
      pricing: {
        starter: false,
        professional: true,
        enterprise: true
      }
    },
    {
      id: 'follow-up-automation',
      title: 'Smart Follow-up Sequences',
      shortDescription: 'Automated personalized follow-up campaigns',
      description: 'Create intelligent email and SMS campaigns that adapt to each lead\'s behavior, engagement level, and stage in the buying journey.',
      icon: 'MessageCircle',
      benefits: [
        {
          title: 'Personalized Messaging',
          description: 'Dynamic content based on lead behavior and preferences'
        },
        {
          title: 'Multi-Channel Campaigns',
          description: 'Coordinate email, SMS, and phone follow-ups'
        },
        {
          title: 'Performance Tracking',
          description: 'Detailed analytics on campaign effectiveness'
        }
      ],
      keyFeatures: [
        'Email automation',
        'SMS campaigns',
        'Trigger-based sequences',
        'A/B testing',
        'Performance analytics',
        'Dynamic content'
      ],
      useCases: [
        'New lead nurturing',
        'Re-engaging cold leads',
        'Post-purchase follow-up',
        'Event-triggered communications'
      ],
      pricing: {
        starter: true,
        professional: true,
        enterprise: true
      }
    }
  ]
};