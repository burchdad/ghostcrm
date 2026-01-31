// Main integration library hub
export * from './types';

// Category imports
import databaseIntegrations from './categories/database';
import crmIntegrations from './categories/crm';
import marketingIntegrations from './categories/marketing';
import productivityIntegrations from './categories/productivity';
import communicationIntegrations from './categories/communication';
import ecommerceIntegrations from './categories/ecommerce';
import financeIntegrations from './categories/finance';
import supportIntegrations from './categories/support';
import analyticsIntegrations from './categories/analytics';
import storageIntegrations from './categories/storage';
import aiMlIntegrations from './categories/ai-ml';
import emailIntegrations from './categories/email';
import socialIntegrations from './categories/social';
import apiIntegrations from './categories/api';
import webhookIntegrations from './categories/webhook';

import { IntegrationTemplate, IntegrationCategory, IntegrationSearchResult, IntegrationStats } from './types';

// Export individual categories
export {
  databaseIntegrations,
  crmIntegrations,
  marketingIntegrations,
  productivityIntegrations,
  communicationIntegrations,
  ecommerceIntegrations,
  financeIntegrations,
  supportIntegrations,
  analyticsIntegrations,
  storageIntegrations,
  aiMlIntegrations,
  emailIntegrations,
  socialIntegrations,
  apiIntegrations,
  webhookIntegrations
};

// Combined integrations array
export const ALL_INTEGRATIONS: IntegrationTemplate[] = [
  ...databaseIntegrations,
  ...crmIntegrations,
  ...marketingIntegrations,
  ...productivityIntegrations,
  ...communicationIntegrations,
  ...ecommerceIntegrations,
  ...financeIntegrations,
  ...supportIntegrations,
  ...analyticsIntegrations,
  ...storageIntegrations,
  ...aiMlIntegrations,
  ...emailIntegrations,
  ...socialIntegrations,
  ...apiIntegrations,
  ...webhookIntegrations
];

// Integration management helper functions
export const getIntegrationsByCategory = (category: IntegrationCategory): IntegrationTemplate[] => {
  switch (category) {
    case 'Database': return databaseIntegrations;
    case 'CRM': return crmIntegrations;
    case 'Marketing': return marketingIntegrations;
    case 'Productivity': return productivityIntegrations;
    case 'Communication': return communicationIntegrations;
    case 'E-commerce': return ecommerceIntegrations;
    case 'Finance': return financeIntegrations;
    case 'Support': return supportIntegrations;
    case 'Analytics': return analyticsIntegrations;
    case 'Storage': return storageIntegrations;
    case 'AI & ML': return aiMlIntegrations;
    case 'Email': return emailIntegrations;
    case 'Social': return socialIntegrations;
    case 'API': return apiIntegrations;
    case 'Webhook': return webhookIntegrations;
    default: return [];
  }
};

export const getAllIntegrations = (): IntegrationTemplate[] => {
  return ALL_INTEGRATIONS;
};

export const getPopularIntegrations = (): IntegrationTemplate[] => {
  return ALL_INTEGRATIONS.filter(integration => integration.popular);
};

export const getFeaturedIntegrations = (): IntegrationTemplate[] => {
  return ALL_INTEGRATIONS.filter(integration => integration.featured);
};

export const searchIntegrations = (
  query: string, 
  category?: IntegrationCategory,
  popular?: boolean,
  featured?: boolean
): IntegrationSearchResult => {
  let filteredIntegrations = ALL_INTEGRATIONS;

  // Filter by category
  if (category) {
    filteredIntegrations = getIntegrationsByCategory(category);
  }

  // Filter by popular
  if (popular) {
    filteredIntegrations = filteredIntegrations.filter(integration => integration.popular);
  }

  // Filter by featured
  if (featured) {
    filteredIntegrations = filteredIntegrations.filter(integration => integration.featured);
  }

  // Search by query
  if (query && query.trim()) {
    const searchTerm = query.toLowerCase().trim();
    filteredIntegrations = filteredIntegrations.filter(integration =>
      integration.name.toLowerCase().includes(searchTerm) ||
      integration.description.toLowerCase().includes(searchTerm) ||
      integration.category.toLowerCase().includes(searchTerm)
    );
  }

  // Get unique categories from filtered results
  const categories = [...new Set(filteredIntegrations.map(integration => integration.category))];

  return {
    integrations: filteredIntegrations,
    totalCount: filteredIntegrations.length,
    categories: categories as IntegrationCategory[]
  };
};

export const getIntegrationById = (id: string): IntegrationTemplate | undefined => {
  return ALL_INTEGRATIONS.find(integration => integration.id === id);
};

export const getIntegrationStats = (): IntegrationStats => {
  const total = ALL_INTEGRATIONS.length;
  const popular = ALL_INTEGRATIONS.filter(integration => integration.popular);
  const featured = ALL_INTEGRATIONS.filter(integration => integration.featured);

  return {
    totalIntegrations: total,
    connectedIntegrations: 0, // This would be calculated from actual connected integrations
    activeIntegrations: 0, // This would be calculated from actual active integrations
    errorIntegrations: 0, // This would be calculated from actual error integrations
    popularIntegrations: popular
  };
};

// Category helpers
export const getAllCategories = (): IntegrationCategory[] => {
  return [
    'Database',
    'CRM',
    'Marketing',
    'Productivity',
    'Communication',
    'E-commerce',
    'Finance',
    'Support',
    'Analytics',
    'Storage',
    'AI & ML',
    'Email',
    'Social',
    'API',
    'Webhook'
  ];
};

export const getCategoryStats = () => {
  const categories = getAllCategories();
  return categories.map(category => ({
    category,
    count: getIntegrationsByCategory(category).length,
    popular: getIntegrationsByCategory(category).filter(integration => integration.popular).length,
    featured: getIntegrationsByCategory(category).filter(integration => integration.featured).length
  }));
};

// Integration validation helpers
export const validateIntegrationCredentials = (integration: IntegrationTemplate, credentials: Record<string, any>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  integration.credentialFields.forEach(field => {
    if (field.required && (!credentials[field.key] || credentials[field.key].trim() === '')) {
      errors.push(`${field.label} is required`);
    }
    
    if (field.type === 'url' && credentials[field.key]) {
      try {
        new URL(credentials[field.key]);
      } catch {
        errors.push(`${field.label} must be a valid URL`);
      }
    }
    
    if (field.type === 'number' && credentials[field.key] && isNaN(Number(credentials[field.key]))) {
      errors.push(`${field.label} must be a number`);
    }
    
    if (field.validation?.pattern && credentials[field.key]) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(credentials[field.key])) {
        errors.push(`${field.label} format is invalid`);
      }
    }
    
    if (field.validation?.minLength && credentials[field.key] && credentials[field.key].length < field.validation.minLength) {
      errors.push(`${field.label} must be at least ${field.validation.minLength} characters`);
    }
    
    if (field.validation?.maxLength && credentials[field.key] && credentials[field.key].length > field.validation.maxLength) {
      errors.push(`${field.label} must be no more than ${field.validation.maxLength} characters`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export constants
export const INTEGRATION_LIBRARY_VERSION = '1.0.0';
export const TOTAL_INTEGRATION_COUNT = ALL_INTEGRATIONS.length;