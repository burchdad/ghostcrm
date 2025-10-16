import { IntegrationTemplate } from '../types';

export const marketingIntegrations: IntegrationTemplate[] = [
  // Email Marketing Platforms
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Marketing automation platform and email marketing service',
    category: 'Marketing',
    type: 'api-key',
    icon: '🐵',
    color: 'bg-yellow-500',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'server', label: 'Server Prefix', type: 'text', required: true, placeholder: 'us1' },
      { key: 'listId', label: 'Default Audience ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncSubscribers: true,
      doubleOptin: true,
      updateExisting: true,
      sendWelcomeEmail: false
    }
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    description: 'Email marketing and SMS platform for ecommerce',
    category: 'Marketing',
    type: 'api-key',
    icon: '📧',
    color: 'bg-orange-500',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'apiKey', label: 'Private API Key', type: 'password', required: true },
      { key: 'publicKey', label: 'Public API Key', type: 'text', required: false }
    ],
    defaultSettings: {
      syncProfiles: true,
      syncLists: true,
      trackEvents: true,
      createSegments: false
    }
  },
  {
    id: 'activecampaign',
    name: 'ActiveCampaign',
    description: 'Email marketing, marketing automation, and CRM platform',
    category: 'Marketing',
    type: 'api-key',
    icon: '🎯',
    color: 'bg-blue-700',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'apiUrl', label: 'API URL', type: 'url', required: true, placeholder: 'https://youraccountname.api-us1.com' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true }
    ],
    defaultSettings: {
      syncContacts: true,
      syncDeals: true,
      syncLists: true,
      syncTags: true
    }
  },
  {
    id: 'constantcontact',
    name: 'Constant Contact',
    description: 'Email marketing and online survey tool',
    category: 'Marketing',
    type: 'oauth',
    icon: '📮',
    color: 'bg-blue-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'API Key', type: 'text', required: true },
      { key: 'clientSecret', label: 'App Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncContacts: true,
      syncLists: true,
      autoCreateLists: false
    }
  },
  {
    id: 'convertkit',
    name: 'ConvertKit',
    description: 'Email marketing for online creators',
    category: 'Marketing',
    type: 'api-key',
    icon: '✉️',
    color: 'bg-pink-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'apiSecret', label: 'API Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncSubscribers: true,
      syncTags: true,
      syncForms: false
    }
  },
  {
    id: 'sendinblue',
    name: 'Brevo (formerly Sendinblue)',
    description: 'Email marketing, SMS, and marketing automation platform',
    category: 'Marketing',
    type: 'api-key',
    icon: '💙',
    color: 'bg-blue-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true }
    ],
    defaultSettings: {
      syncContacts: true,
      syncLists: true,
      enableSms: false,
      enableEmailCampaigns: true
    }
  },
  {
    id: 'getresponse',
    name: 'GetResponse',
    description: 'Email marketing and online campaign management platform',
    category: 'Marketing',
    type: 'api-key',
    icon: '📬',
    color: 'bg-green-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'domain', label: 'Domain', type: 'select', required: false, options: ['api.getresponse.com', 'api3.getresponse360.com', 'api3.getresponse360.pl'] }
    ],
    defaultSettings: {
      syncContacts: true,
      syncCampaigns: false,
      syncCustomFields: true
    }
  },

  // Social Media & Advertising
  {
    id: 'facebook-lead-ads',
    name: 'Facebook Lead Ads',
    description: 'Collect leads directly from Facebook and Instagram ads',
    category: 'Marketing',
    type: 'oauth',
    icon: '📘',
    color: 'bg-blue-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { key: 'pageId', label: 'Facebook Page ID', type: 'text', required: true },
      { key: 'formId', label: 'Lead Form ID', type: 'text', required: false }
    ],
    defaultSettings: {
      autoImportLeads: true,
      leadQuality: 'all',
      webhookVerifyToken: 'auto-generated'
    }
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    description: 'Online advertising platform developed by Google',
    category: 'Marketing',
    type: 'oauth',
    icon: '🎯',
    color: 'bg-yellow-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'customerId', label: 'Customer ID', type: 'text', required: true },
      { key: 'developerToken', label: 'Developer Token', type: 'password', required: true },
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncCampaigns: true,
      syncConversions: true,
      autoImportLeads: true
    }
  },
  {
    id: 'linkedin-ads',
    name: 'LinkedIn Ads',
    description: 'Professional advertising platform by LinkedIn',
    category: 'Marketing',
    type: 'oauth',
    icon: '💼',
    color: 'bg-blue-700',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'accountId', label: 'Ad Account ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncCampaigns: true,
      syncLeadGenForms: true,
      trackConversions: true
    }
  },
  {
    id: 'twitter-ads',
    name: 'Twitter Ads',
    description: 'Advertising platform for Twitter/X',
    category: 'Marketing',
    type: 'oauth',
    icon: '🐦',
    color: 'bg-black',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'text', required: true },
      { key: 'apiSecret', label: 'API Secret', type: 'password', required: true },
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { key: 'accessTokenSecret', label: 'Access Token Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncCampaigns: false,
      trackEngagement: true
    }
  },

  // Marketing Automation
  {
    id: 'pardot',
    name: 'Salesforce Pardot',
    description: 'B2B marketing automation by Salesforce',
    category: 'Marketing',
    type: 'oauth',
    icon: '🔷',
    color: 'bg-blue-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'businessUnitId', label: 'Business Unit ID', type: 'text', required: true },
      { key: 'clientId', label: 'Connected App Consumer Key', type: 'text', required: true },
      { key: 'clientSecret', label: 'Connected App Consumer Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncProspects: true,
      syncCampaigns: true,
      syncForms: false
    }
  },
  {
    id: 'marketo',
    name: 'Adobe Marketo Engage',
    description: 'Marketing automation software focused on account-based marketing',
    category: 'Marketing',
    type: 'oauth',
    icon: '🔺',
    color: 'bg-red-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'munchkinId', label: 'Munchkin ID', type: 'text', required: true },
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'identityUrl', label: 'Identity URL', type: 'url', required: true }
    ],
    defaultSettings: {
      syncLeads: true,
      syncPrograms: false,
      syncActivities: true
    }
  },
  {
    id: 'autopilot',
    name: 'Autopilot',
    description: 'Visual marketing automation software',
    category: 'Marketing',
    type: 'api-key',
    icon: '🚁',
    color: 'bg-purple-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true }
    ],
    defaultSettings: {
      syncContacts: true,
      syncJourneys: false,
      enableTracking: true
    }
  },
  {
    id: 'drip',
    name: 'Drip',
    description: 'ECRM (Ecommerce CRM) built for online retailers',
    category: 'Marketing',
    type: 'oauth',
    icon: '💧',
    color: 'bg-blue-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'accountId', label: 'Account ID', type: 'text', required: true }
    ],
    defaultSettings: {
      syncSubscribers: true,
      syncCampaigns: false,
      enableEcommerce: true
    }
  },

  // Analytics & Attribution
  {
    id: 'attribution',
    name: 'Attribution',
    description: 'Multi-touch attribution platform for marketers',
    category: 'Marketing',
    type: 'api-key',
    icon: '📊',
    color: 'bg-indigo-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'projectId', label: 'Project ID', type: 'text', required: true }
    ],
    defaultSettings: {
      trackConversions: true,
      attributionModel: 'last-click',
      lookbackWindow: 30
    }
  },
  {
    id: 'branch',
    name: 'Branch',
    description: 'Mobile measurement and deep linking platform',
    category: 'Marketing',
    type: 'api-key',
    icon: '🌿',
    color: 'bg-green-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'branchKey', label: 'Branch Key', type: 'password', required: true },
      { key: 'branchSecret', label: 'Branch Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      trackInstalls: true,
      trackEvents: true,
      enableDeepLinking: true
    }
  },

  // SMS & Mobile Marketing
  {
    id: 'textmagic',
    name: 'TextMagic',
    description: 'Business text messaging service',
    category: 'Marketing',
    type: 'api-key',
    icon: '📱',
    color: 'bg-purple-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true }
    ],
    defaultSettings: {
      enableSms: true,
      defaultFrom: '',
      enableDeliveryReports: true
    }
  },
  {
    id: 'clicksend',
    name: 'ClickSend',
    description: 'Global SMS, email, voice, fax and post API',
    category: 'Marketing',
    type: 'api-key',
    icon: '📲',
    color: 'bg-orange-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true }
    ],
    defaultSettings: {
      enableSms: true,
      enableEmail: false,
      enableVoice: false,
      country: 'US'
    }
  }
];

export default marketingIntegrations;