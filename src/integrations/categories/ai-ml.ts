import { IntegrationTemplate } from '../types';

export const aiMlIntegrations: IntegrationTemplate[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'API access to GPT models and DALL-E for AI-powered features',
    category: 'AI & ML',
    type: 'api-key',
    icon: '🤖',
    color: 'bg-green-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'apiKey', label: 'OpenAI API Key', type: 'password', required: true },
      { key: 'organizationId', label: 'Organization ID', type: 'text', required: false },
      { key: 'model', label: 'Default Model', type: 'select', required: false, options: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o'] }
    ],
    defaultSettings: {
      temperature: 0.7,
      maxTokens: 1000,
      enableFunctionCalling: true,
      enableModeration: true
    }
  },
  {
    id: 'anthropic-claude',
    name: 'Anthropic Claude',
    description: 'Constitutional AI assistant by Anthropic',
    category: 'AI & ML',
    type: 'api-key',
    icon: '🧠',
    color: 'bg-purple-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'apiKey', label: 'Anthropic API Key', type: 'password', required: true },
      { key: 'model', label: 'Model Version', type: 'select', required: false, options: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'] }
    ],
    defaultSettings: {
      maxTokens: 4000,
      temperature: 0.7,
      enableSafety: true
    }
  },
  {
    id: 'google-ai',
    name: 'Google AI (Gemini)',
    description: 'Google\'s AI language model',
    category: 'AI & ML',
    type: 'api-key',
    icon: '🔮',
    color: 'bg-blue-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'Google AI API Key', type: 'password', required: true },
      { key: 'model', label: 'Model', type: 'select', required: false, options: ['gemini-pro', 'gemini-pro-vision'] }
    ],
    defaultSettings: {
      temperature: 0.9,
      maxOutputTokens: 2048,
      enableSafetySettings: true
    }
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'AI model hub and inference API',
    category: 'AI & ML',
    type: 'api-key',
    icon: '🤗',
    color: 'bg-yellow-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiToken', label: 'API Token', type: 'password', required: true },
      { key: 'modelId', label: 'Model ID', type: 'text', required: false, placeholder: 'microsoft/DialoGPT-medium' }
    ],
    defaultSettings: {
      useCache: true,
      waitForModel: false,
      returnFullText: false
    }
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Large language models for business',
    category: 'AI & ML',
    type: 'api-key',
    icon: '🧩',
    color: 'bg-indigo-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true }
    ],
    defaultSettings: {
      model: 'command',
      maxTokens: 300,
      temperature: 0.9,
      enableSafety: true
    }
  }
];

export default aiMlIntegrations;