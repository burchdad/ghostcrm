import { IntegrationTemplate } from '../types';

export const emailIntegrations: IntegrationTemplate[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Email service developed by Google',
    category: 'Email',
    type: 'oauth',
    icon: '✉️',
    color: 'bg-red-500',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'fromName', label: 'From Name', type: 'text', required: false },
      { key: 'signature', label: 'Email Signature', type: 'textarea', required: false }
    ],
    defaultSettings: {
      trackOpens: true,
      trackClicks: true,
      autoReply: false,
      enableThreading: true
    }
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    description: 'Personal information manager from Microsoft',
    category: 'Email',
    type: 'oauth',
    icon: '📧',
    color: 'bg-blue-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'tenantId', label: 'Tenant ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncCalendar: true,
      syncContacts: true,
      enableRules: false,
      autoArchive: true
    }
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Cloud-based email delivery service',
    category: 'Email',
    type: 'api-key',
    icon: '📮',
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
      trackClicks: true,
      enableBounceHandling: true,
      enableUnsubscribeHandling: true
    }
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    description: 'Email delivery service for developers',
    category: 'Email',
    type: 'api-key',
    icon: '🔫',
    color: 'bg-red-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'domain', label: 'Domain', type: 'text', required: true },
      { key: 'region', label: 'Region', type: 'select', required: false, options: ['US', 'EU'] }
    ],
    defaultSettings: {
      trackOpens: true,
      trackClicks: true,
      enableDkim: true,
      testMode: false
    }
  },
  {
    id: 'ses',
    name: 'Amazon SES',
    description: 'Email sending service by AWS',
    category: 'Email',
    type: 'api-key',
    icon: '📬',
    color: 'bg-orange-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
      { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
      { key: 'region', label: 'AWS Region', type: 'text', required: true, placeholder: 'us-east-1' }
    ],
    defaultSettings: {
      enableTracking: true,
      enableBounceHandling: true,
      enableComplaintHandling: true
    }
  }
];

export default emailIntegrations;