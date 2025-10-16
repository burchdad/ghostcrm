import { IntegrationTemplate } from '../types';

export const apiIntegrations: IntegrationTemplate[] = [
  {
    id: 'rest-api',
    name: 'REST API',
    description: 'Connect to any REST API endpoint',
    category: 'API',
    type: 'custom-api',
    icon: '🔌',
    color: 'bg-blue-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'baseUrl', label: 'Base URL', type: 'url', required: true, placeholder: 'https://api.example.com' },
      { key: 'authType', label: 'Authentication Type', type: 'select', required: true, options: ['none', 'api-key', 'bearer', 'basic', 'oauth2'] },
      { key: 'apiKey', label: 'API Key', type: 'password', required: false },
      { key: 'headerName', label: 'API Key Header', type: 'text', required: false, placeholder: 'X-API-Key' }
    ],
    defaultSettings: {
      timeout: 30000,
      retries: 3,
      rateLimit: 100,
      enableLogging: true
    }
  },
  {
    id: 'graphql-api',
    name: 'GraphQL API',
    description: 'Connect to GraphQL endpoints',
    category: 'API',
    type: 'custom-api',
    icon: '⚡',
    color: 'bg-pink-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'endpoint', label: 'GraphQL Endpoint', type: 'url', required: true },
      { key: 'authToken', label: 'Authorization Token', type: 'password', required: false },
      { key: 'introspection', label: 'Enable Introspection', type: 'select', required: false, options: ['true', 'false'] }
    ],
    defaultSettings: {
      enableIntrospection: true,
      timeout: 30000,
      enableSubscriptions: false
    }
  },
  {
    id: 'soap-api',
    name: 'SOAP API',
    description: 'Connect to SOAP web services',
    category: 'API',
    type: 'custom-api',
    icon: '🧼',
    color: 'bg-yellow-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'wsdlUrl', label: 'WSDL URL', type: 'url', required: true },
      { key: 'username', label: 'Username', type: 'text', required: false },
      { key: 'password', label: 'Password', type: 'password', required: false }
    ],
    defaultSettings: {
      timeout: 60000,
      enableWSSecurity: false,
      soapVersion: '1.1'
    }
  }
];

export default apiIntegrations;