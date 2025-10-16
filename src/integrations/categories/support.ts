import { IntegrationTemplate } from '../types';

export const supportIntegrations: IntegrationTemplate[] = [
  // Help Desk Platforms
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Customer service software and support ticketing system',
    category: 'Support',
    type: 'oauth',
    icon: '🎧',
    color: 'bg-green-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'subdomain', label: 'Subdomain', type: 'text', required: true, placeholder: 'yourcompany' },
      { key: 'email', label: 'Email', type: 'text', required: true },
      { key: 'apiToken', label: 'API Token', type: 'password', required: true }
    ],
    defaultSettings: {
      syncTickets: true,
      syncUsers: true,
      syncOrganizations: true,
      enableWebhooks: true,
      autoCreateUsers: true
    }
  },
  {
    id: 'intercom',
    name: 'Intercom',
    description: 'Customer messaging platform',
    category: 'Support',
    type: 'oauth',
    icon: '💬',
    color: 'bg-blue-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { key: 'appId', label: 'App ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncConversations: true,
      syncContacts: true,
      syncCompanies: false,
      enableMessenger: true,
      autoResolve: false
    }
  },
  {
    id: 'freshdesk',
    name: 'Freshdesk',
    description: 'Cloud-based customer support software',
    category: 'Support',
    type: 'api-key',
    icon: '🆘',
    color: 'bg-green-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'yourcompany.freshdesk.com' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true }
    ],
    defaultSettings: {
      syncTickets: true,
      syncContacts: true,
      syncAgents: false,
      enableAutomation: false
    }
  },
  {
    id: 'helpscout',
    name: 'Help Scout',
    description: 'Customer service platform and help desk software',
    category: 'Support',
    type: 'oauth',
    icon: '🔍',
    color: 'bg-yellow-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncConversations: true,
      syncCustomers: true,
      syncMailboxes: false,
      enableWebhooks: true
    }
  },
  {
    id: 'kayako',
    name: 'Kayako',
    description: 'Customer service software',
    category: 'Support',
    type: 'api-key',
    icon: '🛶',
    color: 'bg-blue-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'yourcompany.kayako.com' },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true }
    ],
    defaultSettings: {
      syncTickets: true,
      syncUsers: true,
      syncDepartments: false
    }
  },
  {
    id: 'servicenow',
    name: 'ServiceNow',
    description: 'Cloud computing platform for digital workflow management',
    category: 'Support',
    type: 'oauth',
    icon: '❄️',
    color: 'bg-blue-700',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'instanceUrl', label: 'Instance URL', type: 'url', required: true, placeholder: 'https://yourinstance.service-now.com' },
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true }
    ],
    defaultSettings: {
      syncIncidents: true,
      syncChangeRequests: false,
      syncUsers: false,
      tableName: 'incident'
    }
  },

  // Live Chat Platforms
  {
    id: 'drift',
    name: 'Drift',
    description: 'Conversational marketing and sales platform',
    category: 'Support',
    type: 'oauth',
    icon: '🎯',
    color: 'bg-purple-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true }
    ],
    defaultSettings: {
      syncConversations: true,
      syncContacts: true,
      enablePlaybooks: false,
      autoQualify: false
    }
  },
  {
    id: 'livechat',
    name: 'LiveChat',
    description: 'Online customer service software with live support',
    category: 'Support',
    type: 'oauth',
    icon: '💬',
    color: 'bg-green-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncChats: true,
      syncAgents: false,
      enableChatBot: false,
      autoArchive: true
    }
  },
  {
    id: 'olark',
    name: 'Olark',
    description: 'Live chat software for small businesses',
    category: 'Support',
    type: 'api-key',
    icon: '🗣️',
    color: 'bg-orange-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'siteId', label: 'Site ID', type: 'text', required: true }
    ],
    defaultSettings: {
      syncTranscripts: true,
      syncVisitors: false,
      enableOfflineMessages: true
    }
  },

  // Knowledge Base
  {
    id: 'confluence',
    name: 'Confluence',
    description: 'Team workspace where knowledge and collaboration meet',
    category: 'Support',
    type: 'oauth',
    icon: '📚',
    color: 'bg-blue-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'siteUrl', label: 'Site URL', type: 'url', required: true, placeholder: 'https://yoursite.atlassian.net' },
      { key: 'email', label: 'Email', type: 'text', required: true },
      { key: 'apiToken', label: 'API Token', type: 'password', required: true }
    ],
    defaultSettings: {
      syncPages: true,
      syncSpaces: false,
      enableComments: false
    }
  },
  {
    id: 'gitbook',
    name: 'GitBook',
    description: 'Knowledge management tool for technical teams',
    category: 'Support',
    type: 'api-key',
    icon: '📖',
    color: 'bg-purple-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiToken', label: 'API Token', type: 'password', required: true },
      { key: 'organizationId', label: 'Organization ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncPages: true,
      syncSpaces: false,
      enableSync: true
    }
  },

  // Community & Forums
  {
    id: 'discourse',
    name: 'Discourse',
    description: 'Open source discussion platform',
    category: 'Support',
    type: 'api-key',
    icon: '💭',
    color: 'bg-gray-700',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'baseUrl', label: 'Forum URL', type: 'url', required: true },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'apiUsername', label: 'API Username', type: 'text', required: true }
    ],
    defaultSettings: {
      syncTopics: true,
      syncUsers: false,
      syncCategories: false
    }
  }
];

export default supportIntegrations;