import { IntegrationTemplate } from '../types';

export const webhookIntegrations: IntegrationTemplate[] = [
  {
    id: 'webhook',
    name: 'Generic Webhook',
    description: 'Send data to any webhook endpoint',
    category: 'Webhook',
    type: 'webhook',
    icon: '🔗',
    color: 'bg-indigo-500',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'url', label: 'Webhook URL', type: 'url', required: true },
      { key: 'secret', label: 'Secret', type: 'password', required: false },
      { key: 'events', label: 'Events', type: 'text', required: false, placeholder: 'lead.created,deal.closed' },
      { key: 'method', label: 'HTTP Method', type: 'select', required: false, options: ['POST', 'PUT', 'PATCH'] }
    ],
    defaultSettings: {
      retries: 3,
      timeout: 10000,
      enableSignature: true,
      contentType: 'application/json'
    }
  },
  {
    id: 'zapier-webhook',
    name: 'Zapier Webhook',
    description: 'Send data to Zapier workflows',
    category: 'Webhook',
    type: 'webhook',
    icon: '⚡',
    color: 'bg-orange-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'webhookUrl', label: 'Zapier Webhook URL', type: 'url', required: true }
    ],
    defaultSettings: {
      retries: 3,
      timeout: 15000,
      enableDelay: false
    }
  },
  {
    id: 'make-webhook',
    name: 'Make (Integromat) Webhook',
    description: 'Trigger Make scenarios with webhook data',
    category: 'Webhook',
    type: 'webhook',
    icon: '🔧',
    color: 'bg-blue-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'webhookUrl', label: 'Make Webhook URL', type: 'url', required: true }
    ],
    defaultSettings: {
      retries: 2,
      timeout: 30000,
      enableQueue: false
    }
  },
  {
    id: 'n8n-webhook',
    name: 'n8n Webhook',
    description: 'Connect to n8n workflow automation',
    category: 'Webhook',
    type: 'webhook',
    icon: '🤖',
    color: 'bg-purple-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'webhookUrl', label: 'n8n Webhook URL', type: 'url', required: true },
      { key: 'authHeaderName', label: 'Auth Header Name', type: 'text', required: false },
      { key: 'authHeaderValue', label: 'Auth Header Value', type: 'password', required: false }
    ],
    defaultSettings: {
      retries: 3,
      timeout: 20000,
      enableAuth: false
    }
  }
];

export default webhookIntegrations;