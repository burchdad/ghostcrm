import { IntegrationTemplate } from '../types';

export const crmIntegrations: IntegrationTemplate[] = [
  // Major CRM Platforms
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Marketing, sales, and service software that helps your business grow',
    category: 'CRM',
    type: 'oauth',
    icon: '🧡',
    color: 'bg-orange-500',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'apiKey', label: 'Private App Token', type: 'password', required: true },
      { key: 'portalId', label: 'Portal ID', type: 'text', required: false },
      { key: 'scopes', label: 'Scopes', type: 'text', required: false, placeholder: 'contacts,deals,companies' }
    ],
    defaultSettings: {
      syncContacts: true,
      syncDeals: true,
      syncCompanies: true,
      syncTickets: false,
      webhookEvents: ['contact.creation', 'deal.propertyChange']
    }
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'World\'s leading customer relationship management (CRM) platform',
    category: 'CRM',
    type: 'oauth',
    icon: '☁️',
    color: 'bg-blue-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'instanceUrl', label: 'Instance URL', type: 'url', required: true, placeholder: 'https://your-instance.salesforce.com' },
      { key: 'clientId', label: 'Consumer Key', type: 'text', required: true },
      { key: 'clientSecret', label: 'Consumer Secret', type: 'password', required: true },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
      { key: 'securityToken', label: 'Security Token', type: 'password', required: true }
    ],
    defaultSettings: {
      apiVersion: '59.0',
      syncObjects: ['Lead', 'Contact', 'Opportunity', 'Account', 'Case'],
      bulkApi: true,
      sandboxMode: false
    }
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    description: 'Sales CRM and pipeline management tool designed by salespeople',
    category: 'CRM',
    type: 'api-key',
    icon: '🟢',
    color: 'bg-green-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'apiKey', label: 'API Token', type: 'password', required: true },
      { key: 'domain', label: 'Company Domain', type: 'text', required: true, placeholder: 'yourcompany.pipedrive.com' }
    ],
    defaultSettings: {
      syncDeals: true,
      syncPersons: true,
      syncOrganizations: true,
      syncActivities: true,
      webhookEvents: ['deal.*', 'person.*', 'organization.*']
    }
  },
  {
    id: 'zoho-crm',
    name: 'Zoho CRM',
    description: 'Customer relationship management software by Zoho Corporation',
    category: 'CRM',
    type: 'oauth',
    icon: '🔵',
    color: 'bg-blue-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'datacenter', label: 'Data Center', type: 'select', required: true, options: ['com', 'eu', 'in', 'com.au', 'jp'] },
      { key: 'scope', label: 'Scope', type: 'text', required: false, placeholder: 'ZohoCRM.modules.ALL' }
    ],
    defaultSettings: {
      syncModules: ['Leads', 'Contacts', 'Deals', 'Accounts'],
      bulkRead: true,
      apiVersion: 'v2'
    }
  },
  {
    id: 'monday-crm',
    name: 'monday.com CRM',
    description: 'Work management platform with built-in CRM capabilities',
    category: 'CRM',
    type: 'api-key',
    icon: '📅',
    color: 'bg-purple-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'boardId', label: 'CRM Board ID', type: 'text', required: false },
      { key: 'workspaceId', label: 'Workspace ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncItems: true,
      syncBoards: false,
      autoCreateBoards: false,
      webhookEvents: ['create_item', 'change_column_value']
    }
  },
  {
    id: 'freshsales',
    name: 'Freshsales',
    description: 'CRM software by Freshworks for sales teams',
    category: 'CRM',
    type: 'api-key',
    icon: '🌿',
    color: 'bg-green-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'yourcompany.freshsales.io' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true }
    ],
    defaultSettings: {
      syncContacts: true,
      syncDeals: true,
      syncAccounts: true,
      syncLeads: true
    }
  },
  {
    id: 'copper',
    name: 'Copper CRM',
    description: 'CRM designed for Google Workspace users',
    category: 'CRM',
    type: 'api-key',
    icon: '🥉',
    color: 'bg-orange-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'userEmail', label: 'User Email', type: 'text', required: true }
    ],
    defaultSettings: {
      syncPeople: true,
      syncCompanies: true,
      syncOpportunities: true,
      syncProjects: false
    }
  },
  {
    id: 'insightly',
    name: 'Insightly',
    description: 'CRM and project management platform for small businesses',
    category: 'CRM',
    type: 'api-key',
    icon: '👁️',
    color: 'bg-blue-700',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'podNumber', label: 'POD Number', type: 'text', required: false }
    ],
    defaultSettings: {
      syncContacts: true,
      syncOrganizations: true,
      syncOpportunities: true,
      syncProjects: false
    }
  },
  {
    id: 'nutshell',
    name: 'Nutshell CRM',
    description: 'All-in-one CRM and email marketing platform',
    category: 'CRM',
    type: 'api-key',
    icon: '🥜',
    color: 'bg-brown-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true }
    ],
    defaultSettings: {
      syncContacts: true,
      syncCompanies: true,
      syncLeads: true,
      syncActivities: true
    }
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Cloud collaboration service with spreadsheet-database hybrid',
    category: 'CRM',
    type: 'api-key',
    icon: '📋',
    color: 'bg-yellow-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'Personal Access Token', type: 'password', required: true },
      { key: 'baseId', label: 'Base ID', type: 'text', required: true },
      { key: 'tableId', label: 'Table ID/Name', type: 'text', required: false }
    ],
    defaultSettings: {
      syncRecords: true,
      maxRecords: 100,
      pageSize: 100,
      sort: [{ field: 'Created', direction: 'desc' }]
    }
  },
  {
    id: 'agilecrm',
    name: 'Agile CRM',
    description: 'All-in-one CRM with sales, marketing and service automation',
    category: 'CRM',
    type: 'api-key',
    icon: '⚡',
    color: 'bg-red-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'yourcompany.agilecrm.com' },
      { key: 'userEmail', label: 'User Email', type: 'text', required: true },
      { key: 'restApiKey', label: 'REST API Key', type: 'password', required: true }
    ],
    defaultSettings: {
      syncContacts: true,
      syncCompanies: true,
      syncDeals: true,
      syncTasks: false
    }
  },
  {
    id: 'close',
    name: 'Close',
    description: 'Inside sales CRM built for high-growth sales teams',
    category: 'CRM',
    type: 'api-key',
    icon: '🎯',
    color: 'bg-indigo-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true }
    ],
    defaultSettings: {
      syncLeads: true,
      syncContacts: true,
      syncOpportunities: true,
      syncActivities: true,
      webhookEvents: ['lead.created', 'opportunity.status_changed']
    }
  },
  {
    id: 'capsule',
    name: 'Capsule CRM',
    description: 'Simple online CRM for individuals, small businesses and sales teams',
    category: 'CRM',
    type: 'oauth',
    icon: '💊',
    color: 'bg-blue-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'subdomain', label: 'Subdomain', type: 'text', required: true }
    ],
    defaultSettings: {
      syncPeople: true,
      syncOrganisations: true,
      syncOpportunities: true,
      syncCases: false
    }
  },
  {
    id: 'sugarcrm',
    name: 'SugarCRM',
    description: 'Enterprise open source and cloud CRM software',
    category: 'CRM',
    type: 'oauth',
    icon: '🍯',
    color: 'bg-yellow-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'serverUrl', label: 'Sugar Server URL', type: 'url', required: true },
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true }
    ],
    defaultSettings: {
      syncModules: ['Accounts', 'Contacts', 'Leads', 'Opportunities'],
      platform: 'base',
      apiVersion: 'v11_9'
    }
  },
  {
    id: 'amoCRM',
    name: 'amoCRM',
    description: 'CRM system designed to increase sales and improve customer service',
    category: 'CRM',
    type: 'oauth',
    icon: '🔷',
    color: 'bg-blue-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Integration ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Secret Key', type: 'password', required: true },
      { key: 'subdomain', label: 'Subdomain', type: 'text', required: true },
      { key: 'redirectUri', label: 'Redirect URI', type: 'url', required: true }
    ],
    defaultSettings: {
      syncContacts: true,
      syncCompanies: true,
      syncLeads: true,
      syncDeals: true
    }
  },
  {
    id: 'vtiger',
    name: 'Vtiger CRM',
    description: 'Unified customer experience platform combining CRM, email marketing, and helpdesk',
    category: 'CRM',
    type: 'api-key',
    icon: '🐅',
    color: 'bg-orange-700',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'serverUrl', label: 'Vtiger Server URL', type: 'url', required: true },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'accessKey', label: 'Access Key', type: 'password', required: true }
    ],
    defaultSettings: {
      syncModules: ['Contacts', 'Accounts', 'Leads', 'Potentials'],
      sessionTimeout: 3600
    }
  }
];

export default crmIntegrations;