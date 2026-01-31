import { IntegrationTemplate } from '../types';

export const productivityIntegrations: IntegrationTemplate[] = [
  // Google Workspace
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Create and edit spreadsheets online, for free',
    category: 'Productivity',
    type: 'oauth',
    icon: '📊',
    color: 'bg-green-500',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: false },
      { key: 'sheetName', label: 'Sheet Name', type: 'text', required: false, placeholder: 'Sheet1' },
      { key: 'range', label: 'Default Range', type: 'text', required: false, placeholder: 'A1:Z1000' }
    ],
    defaultSettings: {
      autoSync: true,
      createHeaders: true,
      appendMode: true,
      dateTimeRenderOption: 'FORMATTED_STRING'
    }
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Time-management and scheduling calendar service',
    category: 'Productivity',
    type: 'oauth',
    icon: '📅',
    color: 'bg-blue-500',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'calendarId', label: 'Calendar ID', type: 'text', required: false, placeholder: 'primary' },
      { key: 'timeZone', label: 'Time Zone', type: 'text', required: false, placeholder: 'America/New_York' }
    ],
    defaultSettings: {
      syncEvents: true,
      createMeetings: true,
      sendNotifications: false,
      defaultDuration: 60
    }
  },
  {
    id: 'google-docs',
    name: 'Google Docs',
    description: 'Online document editor',
    category: 'Productivity',
    type: 'oauth',
    icon: '📄',
    color: 'bg-blue-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'folderId', label: 'Default Folder ID', type: 'text', required: false }
    ],
    defaultSettings: {
      autoCreateDocs: false,
      shareByDefault: false,
      templateDocId: ''
    }
  },
  {
    id: 'google-forms',
    name: 'Google Forms',
    description: 'Survey administration software',
    category: 'Productivity',
    type: 'oauth',
    icon: '📋',
    color: 'bg-purple-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'formId', label: 'Form ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncResponses: true,
      realTimeSync: false,
      includeTimestamp: true
    }
  },

  // Microsoft 365
  {
    id: 'excel-online',
    name: 'Microsoft Excel Online',
    description: 'Cloud-based spreadsheet application',
    category: 'Productivity',
    type: 'oauth',
    icon: '📈',
    color: 'bg-green-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'workbookId', label: 'Workbook ID', type: 'text', required: false },
      { key: 'worksheetName', label: 'Worksheet Name', type: 'text', required: false }
    ],
    defaultSettings: {
      autoSync: true,
      preserveFormatting: true,
      createTable: false
    }
  },
  {
    id: 'sharepoint',
    name: 'Microsoft SharePoint',
    description: 'Web-based collaborative platform',
    category: 'Productivity',
    type: 'oauth',
    icon: '🔷',
    color: 'bg-blue-700',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'siteUrl', label: 'SharePoint Site URL', type: 'url', required: true },
      { key: 'listId', label: 'List ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncLists: true,
      syncDocuments: false,
      createFolders: false
    }
  },

  // Project Management
  {
    id: 'asana',
    name: 'Asana',
    description: 'Web and mobile application designed to help teams organize and manage their work',
    category: 'Productivity',
    type: 'api-key',
    icon: '🔴',
    color: 'bg-red-500',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'accessToken', label: 'Personal Access Token', type: 'password', required: true },
      { key: 'workspaceGid', label: 'Workspace GID', type: 'text', required: false },
      { key: 'projectGid', label: 'Default Project GID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncTasks: true,
      syncProjects: true,
      syncUsers: false,
      createSubtasks: false
    }
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Web-based Kanban-style list-making application',
    category: 'Productivity',
    type: 'oauth',
    icon: '📋',
    color: 'bg-blue-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'text', required: true },
      { key: 'token', label: 'Token', type: 'password', required: true },
      { key: 'boardId', label: 'Default Board ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncCards: true,
      syncLists: true,
      syncMembers: false,
      enableWebhooks: true
    }
  },
  {
    id: 'clickup',
    name: 'ClickUp',
    description: 'All-in-one productivity platform',
    category: 'Productivity',
    type: 'api-key',
    icon: '⚡',
    color: 'bg-purple-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'teamId', label: 'Team ID', type: 'text', required: false },
      { key: 'spaceId', label: 'Space ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncTasks: true,
      syncGoals: false,
      syncTimeTracking: true,
      customFields: true
    }
  },
  {
    id: 'monday',
    name: 'monday.com',
    description: 'Work management platform that simplifies how teams manage projects',
    category: 'Productivity',
    type: 'api-key',
    icon: '📅',
    color: 'bg-purple-500',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'boardId', label: 'Board ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncItems: true,
      syncBoards: false,
      syncUsers: false,
      enableWebhooks: true
    }
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'All-in-one workspace for notes, docs, wikis, and project management',
    category: 'Productivity',
    type: 'oauth',
    icon: '📝',
    color: 'bg-gray-800',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'apiKey', label: 'Integration Token', type: 'password', required: true },
      { key: 'databaseId', label: 'Database ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncPages: true,
      syncDatabases: false,
      includeArchived: false,
      pageSize: 100
    }
  },
  {
    id: 'basecamp',
    name: 'Basecamp',
    description: 'Project management and team collaboration software',
    category: 'Productivity',
    type: 'oauth',
    icon: '🏕️',
    color: 'bg-green-700',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'accountId', label: 'Account ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncProjects: true,
      syncTodoLists: true,
      syncMessages: false,
      syncDocuments: false
    }
  },
  {
    id: 'wrike',
    name: 'Wrike',
    description: 'Project management and collaboration platform',
    category: 'Productivity',
    type: 'oauth',
    icon: '🟢',
    color: 'bg-green-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncTasks: true,
      syncProjects: true,
      syncFolders: false,
      syncTimeEntries: false
    }
  },
  {
    id: 'smartsheet',
    name: 'Smartsheet',
    description: 'Platform for work execution, enabling teams to plan, capture, manage, automate, and report on work',
    category: 'Productivity',
    type: 'api-key',
    icon: '📊',
    color: 'bg-blue-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true }
    ],
    defaultSettings: {
      syncSheets: true,
      syncReports: false,
      syncWorkspaces: false
    }
  },

  // Forms & Surveys
  {
    id: 'typeform',
    name: 'Typeform',
    description: 'Online form and survey builder',
    category: 'Productivity',
    type: 'oauth',
    icon: '📝',
    color: 'bg-gray-800',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'apiKey', label: 'Personal Access Token', type: 'password', required: true },
      { key: 'formId', label: 'Form ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncResponses: true,
      realTimeSync: true,
      includeHidden: false,
      pageSize: 1000
    }
  },
  {
    id: 'jotform',
    name: 'JotForm',
    description: 'Online form builder',
    category: 'Productivity',
    type: 'api-key',
    icon: '📋',
    color: 'bg-orange-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true }
    ],
    defaultSettings: {
      syncSubmissions: true,
      syncForms: false,
      limit: 1000
    }
  },
  {
    id: 'formstack',
    name: 'Formstack',
    description: 'Online form builder with workflow capabilities',
    category: 'Productivity',
    type: 'oauth',
    icon: '📄',
    color: 'bg-blue-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true }
    ],
    defaultSettings: {
      syncSubmissions: true,
      syncForms: false,
      encryptionPassword: ''
    }
  },

  // Scheduling
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Scheduling infrastructure for absolutely everyone',
    category: 'Productivity',
    type: 'oauth',
    icon: '📅',
    color: 'bg-blue-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'accessToken', label: 'Personal Access Token', type: 'password', required: true },
      { key: 'organizationUri', label: 'Organization URI', type: 'text', required: false }
    ],
    defaultSettings: {
      syncEvents: true,
      syncInvitees: true,
      syncEventTypes: false,
      webhookSigningKey: ''
    }
  },
  {
    id: 'acuity-scheduling',
    name: 'Acuity Scheduling',
    description: 'Online appointment scheduling software',
    category: 'Productivity',
    type: 'api-key',
    icon: '⏰',
    color: 'bg-green-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'userId', label: 'User ID', type: 'text', required: true },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true }
    ],
    defaultSettings: {
      syncAppointments: true,
      syncClients: true,
      syncAppointmentTypes: false
    }
  },
  {
    id: 'bookingcom',
    name: 'Booking.com',
    description: 'Online accommodation booking platform',
    category: 'Productivity',
    type: 'api-key',
    icon: '🏨',
    color: 'bg-blue-700',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
      { key: 'hotelId', label: 'Hotel ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncReservations: true,
      syncRates: false,
      syncInventory: false
    }
  },

  // Time Tracking
  {
    id: 'toggl',
    name: 'Toggl Track',
    description: 'Time tracking app for teams',
    category: 'Productivity',
    type: 'api-key',
    icon: '⏱️',
    color: 'bg-red-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Token', type: 'password', required: true },
      { key: 'workspaceId', label: 'Workspace ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncTimeEntries: true,
      syncProjects: true,
      syncClients: false,
      defaultProject: ''
    }
  },
  {
    id: 'harvest',
    name: 'Harvest',
    description: 'Time tracking and invoicing software',
    category: 'Productivity',
    type: 'oauth',
    icon: '🌾',
    color: 'bg-orange-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'accountId', label: 'Account ID', type: 'text', required: true }
    ],
    defaultSettings: {
      syncTimeEntries: true,
      syncProjects: true,
      syncClients: true,
      syncInvoices: false
    }
  },
  {
    id: 'clockify',
    name: 'Clockify',
    description: 'Free time tracker and timesheet app',
    category: 'Productivity',
    type: 'api-key',
    icon: '🕐',
    color: 'bg-blue-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'workspaceId', label: 'Workspace ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncTimeEntries: true,
      syncProjects: true,
      syncTags: false
    }
  }
];

export default productivityIntegrations;