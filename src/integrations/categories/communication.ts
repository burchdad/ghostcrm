import { IntegrationTemplate } from '../types';

export const communicationIntegrations: IntegrationTemplate[] = [
  // Team Communication
  {
    id: 'slack',
    name: 'Slack',
    description: 'Business communication platform for teams',
    category: 'Communication',
    type: 'oauth',
    icon: '💬',
    color: 'bg-purple-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'botToken', label: 'Bot User OAuth Token', type: 'password', required: true },
      { key: 'signingSecret', label: 'Signing Secret', type: 'password', required: false },
      { key: 'channelId', label: 'Default Channel ID', type: 'text', required: false }
    ],
    defaultSettings: {
      notifications: ['lead-created', 'deal-closed', 'task-assigned'],
      mentionUsers: false,
      useThreads: false
    }
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Unified communication and collaboration platform',
    category: 'Communication',
    type: 'oauth',
    icon: '🟦',
    color: 'bg-blue-700',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'clientId', label: 'Application (client) ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'tenantId', label: 'Directory (tenant) ID', type: 'text', required: true },
      { key: 'teamId', label: 'Team ID', type: 'text', required: false },
      { key: 'channelId', label: 'Channel ID', type: 'text', required: false }
    ],
    defaultSettings: {
      notifications: ['lead-created', 'deal-closed'],
      enableBots: true,
      sendAsAdaptiveCards: true
    }
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'VoIP and instant messaging social platform',
    category: 'Communication',
    type: 'webhook',
    icon: '🎮',
    color: 'bg-indigo-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true },
      { key: 'botToken', label: 'Bot Token', type: 'password', required: false },
      { key: 'guildId', label: 'Server ID', type: 'text', required: false }
    ],
    defaultSettings: {
      notifications: ['lead-created', 'deal-closed'],
      embedMessages: true,
      mentionRole: ''
    }
  },

  // Video Conferencing
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Video communications platform',
    category: 'Communication',
    type: 'oauth',
    icon: '📹',
    color: 'bg-blue-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'accountId', label: 'Account ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncMeetings: true,
      recordMeetings: false,
      enableWaitingRoom: true,
      defaultDuration: 60
    }
  },
  {
    id: 'webex',
    name: 'Cisco Webex',
    description: 'Video conferencing and collaboration platform',
    category: 'Communication',
    type: 'oauth',
    icon: '🎥',
    color: 'bg-green-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncMeetings: true,
      enableRecording: false,
      defaultMeetingType: 'instant'
    }
  },
  {
    id: 'gotomeeting',
    name: 'GoToMeeting',
    description: 'Online meeting and video conferencing software',
    category: 'Communication',
    type: 'oauth',
    icon: '🎯',
    color: 'bg-orange-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncMeetings: true,
      defaultDuration: 60,
      enableHdVideo: true
    }
  },

  // SMS & Phone
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Cloud communications platform as a service',
    category: 'Communication',
    type: 'api-key',
    icon: '📱',
    color: 'bg-red-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'accountSid', label: 'Account SID', type: 'text', required: true },
      { key: 'authToken', label: 'Auth Token', type: 'password', required: true },
      { key: 'phoneNumber', label: 'Twilio Phone Number', type: 'text', required: false, placeholder: '+1234567890' }
    ],
    defaultSettings: {
      sendSms: true,
      sendVoice: false,
      enableDeliveryReports: true,
      messagingServiceSid: ''
    }
  },
  {
    id: 'nexmo',
    name: 'Vonage (Nexmo)',
    description: 'Communications platform for SMS, voice, and messaging',
    category: 'Communication',
    type: 'api-key',
    icon: '📲',
    color: 'bg-purple-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'text', required: true },
      { key: 'apiSecret', label: 'API Secret', type: 'password', required: true },
      { key: 'fromNumber', label: 'From Number', type: 'text', required: false }
    ],
    defaultSettings: {
      sendSms: true,
      enableDeliveryReceipts: true,
      defaultTtl: 86400
    }
  },
  {
    id: 'whatsapp-business',
    name: 'WhatsApp Business',
    description: 'Business messaging on WhatsApp',
    category: 'Communication',
    type: 'api-key',
    icon: '💬',
    color: 'bg-green-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true },
      { key: 'webhookVerifyToken', label: 'Webhook Verify Token', type: 'password', required: false }
    ],
    defaultSettings: {
      sendMessages: true,
      receiveMessages: true,
      enableReadReceipts: true,
      mediaSupport: true
    }
  },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    description: 'Cloud-based instant messaging service',
    category: 'Communication',
    type: 'api-key',
    icon: '✈️',
    color: 'bg-blue-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'botToken', label: 'Bot Token', type: 'password', required: true },
      { key: 'chatId', label: 'Default Chat ID', type: 'text', required: false }
    ],
    defaultSettings: {
      sendMessages: true,
      enableNotifications: true,
      parseMode: 'HTML'
    }
  },

  // VoIP & Phone Systems
  {
    id: 'ringcentral',
    name: 'RingCentral',
    description: 'Cloud-based business phone system',
    category: 'Communication',
    type: 'oauth',
    icon: '📞',
    color: 'bg-orange-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'serverUrl', label: 'Server URL', type: 'select', required: true, options: ['https://platform.ringcentral.com', 'https://platform.devtest.ringcentral.com'] }
    ],
    defaultSettings: {
      syncCalls: true,
      syncSms: true,
      syncFax: false,
      enablePresence: false
    }
  },
  {
    id: 'dialpad',
    name: 'Dialpad',
    description: 'AI-powered cloud communication platform',
    category: 'Communication',
    type: 'api-key',
    icon: '🔢',
    color: 'bg-green-700',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true }
    ],
    defaultSettings: {
      syncCalls: true,
      syncSms: true,
      enableCallRecording: false,
      enableTranscription: false
    }
  },

  // Push Notifications
  {
    id: 'firebase-messaging',
    name: 'Firebase Cloud Messaging',
    description: 'Cross-platform messaging solution by Google',
    category: 'Communication',
    type: 'api-key',
    icon: '🔥',
    color: 'bg-orange-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'serverKey', label: 'Server Key', type: 'password', required: true },
      { key: 'senderId', label: 'Sender ID', type: 'text', required: true },
      { key: 'projectId', label: 'Project ID', type: 'text', required: false }
    ],
    defaultSettings: {
      enableNotifications: true,
      priority: 'high',
      timeToLive: 2419200
    }
  },
  {
    id: 'onesignal',
    name: 'OneSignal',
    description: 'Multi-platform push notification service',
    category: 'Communication',
    type: 'api-key',
    icon: '🔔',
    color: 'bg-red-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'appId', label: 'OneSignal App ID', type: 'text', required: true },
      { key: 'restApiKey', label: 'REST API Key', type: 'password', required: true }
    ],
    defaultSettings: {
      enablePushNotifications: true,
      enableEmailNotifications: false,
      enableSmsNotifications: false
    }
  },
  {
    id: 'pushbullet',
    name: 'Pushbullet',
    description: 'Service that connects your devices',
    category: 'Communication',
    type: 'api-key',
    icon: '🔫',
    color: 'bg-green-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true }
    ],
    defaultSettings: {
      enablePushes: true,
      defaultDeviceIden: ''
    }
  }
];

export default communicationIntegrations;