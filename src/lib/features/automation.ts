import { FeatureCategory } from './types';

export const automationFeatures: FeatureCategory = {
  id: 'automation-ai',
  title: 'Automation & AI',
  description: 'Streamline operations with intelligent automation, AI-powered insights, and workflow optimization.',
  icon: 'Zap',
  color: 'green',
  features: [
    {
      id: 'workflow-automation',
      title: 'Workflow Automation',
      shortDescription: 'Eliminate repetitive tasks with smart automation',
      description: 'Create sophisticated multi-step automation workflows with 67+ pre-built nodes, conditional logic, and custom triggers to eliminate repetitive tasks.',
      icon: 'Workflow',
      benefits: [
        {
          title: 'Pre-built Templates',
          description: '67+ automation nodes ready to use out of the box'
        },
        {
          title: 'Conditional Logic',
          description: 'Create complex if-then scenarios and branching workflows'
        },
        {
          title: 'Custom Triggers',
          description: 'Start automations based on any system event or user action'
        }
      ],
      keyFeatures: [
        'Drag-and-drop workflow builder',
        '67+ automation nodes',
        'Conditional logic',
        'Custom triggers',
        'Multi-step sequences',
        'Performance analytics'
      ],
      useCases: [
        'Lead qualification processes',
        'Follow-up sequences',
        'Data entry automation',
        'Notification workflows'
      ],
      pricing: {
        starter: false,
        professional: true,
        enterprise: true
      }
    },
    {
      id: 'ai-assistant',
      title: 'AI Sales Assistant',
      shortDescription: 'Get intelligent insights and recommendations',
      description: 'Powered by OpenAI, get instant insights, conversation summaries, and personalized recommendations to optimize your sales performance.',
      icon: 'Brain',
      benefits: [
        {
          title: 'Instant Insights',
          description: 'Real-time analysis of customer interactions and opportunities'
        },
        {
          title: 'Smart Recommendations',
          description: 'AI-powered suggestions for next best actions'
        },
        {
          title: 'Conversation Analysis',
          description: 'Automatic summaries and sentiment analysis of calls and emails'
        }
      ],
      keyFeatures: [
        'OpenAI integration',
        'Conversation summaries',
        'Sentiment analysis',
        'Smart recommendations',
        'Predictive insights',
        'Natural language queries'
      ],
      useCases: [
        'Call and email analysis',
        'Next best action suggestions',
        'Customer sentiment tracking',
        'Sales coaching insights'
      ],
      pricing: {
        starter: false,
        professional: false,
        enterprise: true
      }
    },
    {
      id: 'smart-notifications',
      title: 'Smart Notifications',
      shortDescription: 'Intelligent alerts and reminders',
      description: 'Receive priority-based notifications for follow-ups, tasks, and opportunities across multiple channels with smart scheduling.',
      icon: 'Clock',
      benefits: [
        {
          title: 'Priority-Based Alerts',
          description: 'Focus on what matters most with intelligent prioritization'
        },
        {
          title: 'Multi-Channel Delivery',
          description: 'Get notifications via email, SMS, push, or in-app'
        },
        {
          title: 'Smart Scheduling',
          description: 'Respect time zones and preferences for optimal timing'
        }
      ],
      keyFeatures: [
        'Priority-based alerts',
        'Custom notification rules',
        'Multi-channel delivery',
        'Smart scheduling',
        'Snooze and reschedule',
        'Team coordination'
      ],
      useCases: [
        'Follow-up reminders',
        'Task notifications',
        'Opportunity alerts',
        'Team coordination'
      ],
      pricing: {
        starter: true,
        professional: true,
        enterprise: true
      }
    }
  ]
};