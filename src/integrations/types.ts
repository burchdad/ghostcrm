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
  | 'E-commerce'
  | 'Support'
  | 'Social'
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

// Integration helper types
export interface IntegrationStats {
  totalIntegrations: number;
  connectedIntegrations: number;
  activeIntegrations: number;
  errorIntegrations: number;
  popularIntegrations: IntegrationTemplate[];
}

export interface IntegrationSearchResult {
  integrations: IntegrationTemplate[];
  totalCount: number;
  categories: IntegrationCategory[];
}

export interface IntegrationConnectionTest {
  success: boolean;
  message: string;
  details?: {
    endpoint?: string;
    statusCode?: number;
    responseTime?: number;
    error?: string;
  };
}