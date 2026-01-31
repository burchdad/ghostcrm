import { IntegrationTemplate } from '../types';

export const analyticsIntegrations: IntegrationTemplate[] = [
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Web analytics service offered by Google',
    category: 'Analytics',
    type: 'oauth',
    icon: '📊',
    color: 'bg-orange-500',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'propertyId', label: 'GA4 Property ID', type: 'text', required: false },
      { key: 'viewId', label: 'Universal Analytics View ID', type: 'text', required: false },
      { key: 'serviceAccountKey', label: 'Service Account Key (JSON)', type: 'textarea', required: false }
    ],
    defaultSettings: {
      syncMetrics: true,
      realTime: false,
      dimensions: ['country', 'deviceCategory', 'source'],
      metrics: ['sessions', 'users', 'pageviews']
    }
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    description: 'Business analytics service company',
    category: 'Analytics',
    type: 'api-key',
    icon: '📈',
    color: 'bg-purple-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'projectToken', label: 'Project Token', type: 'password', required: true },
      { key: 'apiSecret', label: 'API Secret', type: 'password', required: true },
      { key: 'projectId', label: 'Project ID', type: 'text', required: true }
    ],
    defaultSettings: {
      trackEvents: true,
      trackPeople: true,
      enableFunnels: false,
      enableCohorts: false
    }
  },
  {
    id: 'amplitude',
    name: 'Amplitude',
    description: 'Product analytics platform',
    category: 'Analytics',
    type: 'api-key',
    icon: '📊',
    color: 'bg-blue-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'secretKey', label: 'Secret Key', type: 'password', required: true }
    ],
    defaultSettings: {
      trackEvents: true,
      trackUsers: true,
      enableCohorts: false,
      batchSize: 100
    }
  },
  {
    id: 'hotjar',
    name: 'Hotjar',
    description: 'Website heatmaps and behavior analytics',
    category: 'Analytics',
    type: 'api-key',
    icon: '🔥',
    color: 'bg-red-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'siteId', label: 'Site ID', type: 'text', required: true }
    ],
    defaultSettings: {
      syncHeatmaps: true,
      syncRecordings: false,
      syncFeedback: true
    }
  }
];

export default analyticsIntegrations;