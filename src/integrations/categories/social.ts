import { IntegrationTemplate } from '../types';

export const socialIntegrations: IntegrationTemplate[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Social networking platform',
    category: 'Social',
    type: 'oauth',
    icon: '📘',
    color: 'bg-blue-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'pageId', label: 'Facebook Page ID', type: 'text', required: false },
      { key: 'appId', label: 'App ID', type: 'text', required: true },
      { key: 'appSecret', label: 'App Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncPosts: false,
      syncComments: true,
      syncMessages: true,
      autoReply: false
    }
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Photo and video sharing social networking service',
    category: 'Social',
    type: 'oauth',
    icon: '📷',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'businessAccountId', label: 'Business Account ID', type: 'text', required: false }
    ],
    defaultSettings: {
      autoPost: false,
      trackMentions: true,
      syncComments: true,
      enableStories: false
    }
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Professional networking platform',
    category: 'Social',
    type: 'oauth',
    icon: '💼',
    color: 'bg-blue-700',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'companyId', label: 'Company Page ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncConnections: false,
      postUpdates: false,
      trackMentions: true,
      enableMessaging: true
    }
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    description: 'Social networking and microblogging service',
    category: 'Social',
    type: 'oauth',
    icon: '🐦',
    color: 'bg-black',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'username', label: 'Twitter Username', type: 'text', required: false }
    ],
    defaultSettings: {
      autoTweet: false,
      monitoring: true,
      trackMentions: true,
      enableRetweets: false
    }
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Video sharing platform',
    category: 'Social',
    type: 'oauth',
    icon: '📺',
    color: 'bg-red-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'channelId', label: 'Channel ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncVideos: false,
      syncComments: true,
      trackAnalytics: true,
      autoUpload: false
    }
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Short-form video hosting service',
    category: 'Social',
    type: 'oauth',
    icon: '🎵',
    color: 'bg-pink-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true }
    ],
    defaultSettings: {
      syncVideos: false,
      trackAnalytics: true,
      autoPost: false
    }
  }
];

export default socialIntegrations;