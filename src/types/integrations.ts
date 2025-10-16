// Integration types and interfaces for comprehensive integration system
export interface BaseIntegration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  type: IntegrationType;
  icon: string;
  color: string;
  isConnected: boolean;
  status: 'active' | 'error' | 'pending' | 'disabled' | 'testing';
  lastSync?: string;
  connectedAt?: string;
  syncCount?: number;
  errorCount?: number;
  settings: Record<string, any>;
  credentials?: IntegrationCredentials;
  webhookUrl?: string;
  customConfig?: CustomIntegrationConfig;
}

export type IntegrationCategory = 
  | 'Database'
  | 'AI & ML'
  | 'Communication'
  | 'Email'
  | 'Productivity'
  | 'Finance'
  | 'CRM'
  | 'Marketing'
  | 'Automation'
  | 'Analytics'
  | 'Storage'
  | 'API'
  | 'Webhook'
  | 'Custom';

export type IntegrationType = 
  | 'oauth'
  | 'api-key'
  | 'database'
  | 'webhook'
  | 'custom-api'
  | 'credentials'
  | 'connection-string';

export interface IntegrationCredentials {
  type: IntegrationType;
  fields: CredentialField[];
  encrypted: boolean;
}

export interface CredentialField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'number' | 'select' | 'textarea' | 'json';
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: string[]; // For select fields
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface CustomIntegrationConfig {
  endpoints: APIEndpoint[];
  authentication: AuthConfig;
  dataMapping: DataMapping[];
  scheduleSync?: boolean;
  syncFrequency?: string;
}

export interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, string>;
  dataType: 'leads' | 'deals' | 'contacts' | 'companies' | 'activities' | 'custom';
}

export interface AuthConfig {
  type: 'none' | 'api-key' | 'bearer' | 'basic' | 'oauth2' | 'custom';
  keyLocation?: 'header' | 'query' | 'body';
  keyName?: string;
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transform?: 'lowercase' | 'uppercase' | 'date' | 'number' | 'custom';
  customTransform?: string;
}

export interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  type: IntegrationType;
  icon: string;
  color: string;
  popular: boolean;
  featured: boolean;
  credentialFields: CredentialField[];
  defaultSettings: Record<string, any>;
  testConnection?: {
    endpoint: string;
    method: string;
    expectedResponse?: any;
  };
}

// Predefined integration templates
export const INTEGRATION_TEMPLATES: IntegrationTemplate[] = [
  // Database Integrations
  {
    id: 'mysql',
    name: 'MySQL Database',
    description: 'Connect to MySQL database for custom data synchronization',
    category: 'Database',
    type: 'database',
    icon: '🗄️',
    color: 'bg-orange-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
      { key: 'port', label: 'Port', type: 'number', required: true, placeholder: '3306' },
      { key: 'database', label: 'Database', type: 'text', required: true },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
      { key: 'ssl', label: 'Use SSL', type: 'select', required: false, options: ['true', 'false'] }
    ],
    defaultSettings: {
      syncFrequency: '1hour',
      autoSync: true
    }
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL Database',
    description: 'Connect to PostgreSQL database for enterprise data integration',
    category: 'Database',
    type: 'database',
    icon: '🐘',
    color: 'bg-blue-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
      { key: 'port', label: 'Port', type: 'number', required: true, placeholder: '5432' },
      { key: 'database', label: 'Database', type: 'text', required: true },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
      { key: 'schema', label: 'Schema', type: 'text', required: false, placeholder: 'public' }
    ],
    defaultSettings: {
      syncFrequency: '30min',
      autoSync: true
    }
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    description: 'Connect to MongoDB for NoSQL data integration',
    category: 'Database',
    type: 'connection-string',
    icon: '🍃',
    color: 'bg-green-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'connectionString', label: 'Connection String', type: 'text', required: true, placeholder: 'mongodb://localhost:27017/mydb' },
      { key: 'database', label: 'Database', type: 'text', required: true },
      { key: 'collection', label: 'Collection', type: 'text', required: false }
    ],
    defaultSettings: {
      syncFrequency: '15min',
      autoSync: true
    }
  },

  // AI & ML Services
  {
    id: 'openai',
    name: 'OpenAI API',
    description: 'Integrate OpenAI models for AI-powered features',
    category: 'AI & ML',
    type: 'api-key',
    icon: '🤖',
    color: 'bg-black',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'sk-...' },
      { key: 'organization', label: 'Organization ID', type: 'text', required: false },
      { key: 'model', label: 'Default Model', type: 'select', required: false, options: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'] }
    ],
    defaultSettings: {
      temperature: 0.7,
      maxTokens: 1000
    }
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Integrate Claude AI for advanced language processing',
    category: 'AI & ML',
    type: 'api-key',
    icon: '🧠',
    color: 'bg-purple-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'model', label: 'Model', type: 'select', required: false, options: ['claude-3-opus', 'claude-3-sonnet'] }
    ],
    defaultSettings: {
      maxTokens: 1000
    }
  },

  // API Integrations
  {
    id: 'custom-api',
    name: 'Custom API',
    description: 'Connect to any REST API with custom configuration',
    category: 'API',
    type: 'custom-api',
    icon: '🔌',
    color: 'bg-gray-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'baseUrl', label: 'Base URL', type: 'url', required: true, placeholder: 'https://api.example.com' },
      { key: 'authType', label: 'Authentication', type: 'select', required: true, options: ['none', 'api-key', 'bearer', 'basic'] },
      { key: 'apiKey', label: 'API Key', type: 'password', required: false },
      { key: 'username', label: 'Username', type: 'text', required: false },
      { key: 'password', label: 'Password', type: 'password', required: false }
    ],
    defaultSettings: {
      timeout: 30000,
      retries: 3
    }
  },

  // Communication
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    category: 'Communication',
    type: 'oauth',
    icon: '💬',
    color: 'bg-purple-500',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true },
      { key: 'channels', label: 'Channels', type: 'text', required: false, placeholder: '#general,#sales' }
    ],
    defaultSettings: {
      notifications: ['deal-closed', 'new-lead']
    }
  },

  // Email Services
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery and marketing automation',
    category: 'Email',
    type: 'api-key',
    icon: '📧',
    color: 'bg-blue-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'fromEmail', label: 'From Email', type: 'text', required: true },
      { key: 'fromName', label: 'From Name', type: 'text', required: false }
    ],
    defaultSettings: {
      trackOpens: true,
      trackClicks: true
    }
  },

  // Webhooks
  {
    id: 'webhook',
    name: 'Generic Webhook',
    description: 'Send data to any webhook endpoint',
    category: 'Webhook',
    type: 'webhook',
    icon: '🔗',
    color: 'bg-indigo-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'url', label: 'Webhook URL', type: 'url', required: true },
      { key: 'secret', label: 'Secret', type: 'password', required: false },
      { key: 'events', label: 'Events', type: 'text', required: false, placeholder: 'lead.created,deal.closed' }
    ],
    defaultSettings: {
      retries: 3,
      timeout: 10000
    }
  }
];