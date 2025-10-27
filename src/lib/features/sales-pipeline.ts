import { FeatureCategory } from './types';

export const salesPipelineFeatures: FeatureCategory = {
  id: 'sales-pipeline',
  title: 'Sales Pipeline',
  description: 'Visualize and manage your entire sales process with drag-and-drop pipeline management and advanced forecasting.',
  icon: 'TrendingUp',
  color: 'purple',
  features: [
    {
      id: 'visual-pipeline',
      title: 'Visual Pipeline Builder',
      shortDescription: 'Drag-and-drop pipeline management',
      description: 'Create and customize your sales pipeline with intuitive drag-and-drop interface, custom stages, and automated deal progression rules.',
      icon: 'Monitor',
      benefits: [
        {
          title: 'Custom Stages',
          description: 'Define sales stages that match your unique process'
        },
        {
          title: 'Drag-and-Drop',
          description: 'Easily move deals between stages with visual interface'
        },
        {
          title: 'Stage Automation',
          description: 'Automatically trigger actions when deals progress'
        }
      ],
      keyFeatures: [
        'Visual pipeline interface',
        'Custom stage configuration',
        'Deal progression tracking',
        'Automated stage transitions',
        'Pipeline analytics',
        'Team collaboration'
      ],
      useCases: [
        'Managing complex sales processes',
        'Tracking deal progression',
        'Team collaboration',
        'Pipeline optimization'
      ],
      pricing: {
        starter: true,
        professional: true,
        enterprise: true
      }
    },
    {
      id: 'sales-forecasting',
      title: 'AI Sales Forecasting',
      shortDescription: 'Predict revenue with machine learning',
      description: 'Advanced AI algorithms analyze historical data, deal patterns, and market trends to provide accurate revenue forecasting and pipeline insights.',
      icon: 'BarChart3',
      benefits: [
        {
          title: 'Revenue Prediction',
          description: 'Accurate forecasting based on historical patterns'
        },
        {
          title: 'Probability Scoring',
          description: 'AI-calculated win probability for each deal'
        },
        {
          title: 'Trend Analysis',
          description: 'Identify patterns and optimize performance'
        }
      ],
      keyFeatures: [
        'AI-powered forecasting',
        'Revenue predictions',
        'Win probability scoring',
        'Historical trend analysis',
        'Performance benchmarking',
        'Forecast accuracy tracking'
      ],
      useCases: [
        'Quarterly revenue planning',
        'Resource allocation',
        'Performance optimization',
        'Investor reporting'
      ],
      pricing: {
        starter: false,
        professional: true,
        enterprise: true
      }
    },
    {
      id: 'deal-tracking',
      title: 'Comprehensive Deal Tracking',
      shortDescription: 'Complete deal lifecycle management',
      description: 'Track every aspect of your deals from initial contact to close, with detailed activity logging, document management, and outcome analysis.',
      icon: 'FileText',
      benefits: [
        {
          title: 'Complete History',
          description: 'Full timeline of all deal activities and interactions'
        },
        {
          title: 'Document Management',
          description: 'Centralized storage for contracts and proposals'
        },
        {
          title: 'Outcome Analysis',
          description: 'Analyze wins and losses to improve performance'
        }
      ],
      keyFeatures: [
        'Deal activity timeline',
        'Document storage',
        'Task management',
        'Collaboration tools',
        'Win/loss analysis',
        'Revenue tracking'
      ],
      useCases: [
        'Complex deal management',
        'Team collaboration',
        'Contract management',
        'Performance analysis'
      ],
      pricing: {
        starter: true,
        professional: true,
        enterprise: true
      }
    }
  ]
};