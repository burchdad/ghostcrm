import { IntegrationTemplate } from '../types';

export const ecommerceIntegrations: IntegrationTemplate[] = [
  // Major E-commerce Platforms
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Multinational e-commerce company',
    category: 'E-commerce',
    type: 'api-key',
    icon: '🛍️',
    color: 'bg-green-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'shopName', label: 'Shop Name', type: 'text', required: true, placeholder: 'yourshop.myshopify.com' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'apiSecret', label: 'API Secret', type: 'password', required: true },
      { key: 'accessToken', label: 'Access Token', type: 'password', required: false }
    ],
    defaultSettings: {
      syncOrders: true,
      syncCustomers: true,
      syncProducts: false,
      syncInventory: false,
      webhookEvents: ['orders/create', 'orders/updated', 'customers/create']
    }
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'E-commerce plugin for WordPress',
    category: 'E-commerce',
    type: 'api-key',
    icon: '🛒',
    color: 'bg-purple-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'siteUrl', label: 'Site URL', type: 'url', required: true, placeholder: 'https://yourstore.com' },
      { key: 'consumerKey', label: 'Consumer Key', type: 'text', required: true },
      { key: 'consumerSecret', label: 'Consumer Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncOrders: true,
      syncCustomers: true,
      syncProducts: false,
      apiVersion: 'wc/v3',
      enableWebhooks: true
    }
  },
  {
    id: 'magento',
    name: 'Magento',
    description: 'Open-source e-commerce platform',
    category: 'E-commerce',
    type: 'oauth',
    icon: '🔷',
    color: 'bg-orange-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'baseUrl', label: 'Store Base URL', type: 'url', required: true },
      { key: 'consumerKey', label: 'Consumer Key', type: 'text', required: true },
      { key: 'consumerSecret', label: 'Consumer Secret', type: 'password', required: true },
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { key: 'accessTokenSecret', label: 'Access Token Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncOrders: true,
      syncCustomers: true,
      syncProducts: false,
      apiVersion: 'V1'
    }
  },
  {
    id: 'bigcommerce',
    name: 'BigCommerce',
    description: 'E-commerce platform for growing and established businesses',
    category: 'E-commerce',
    type: 'api-key',
    icon: '🏪',
    color: 'bg-blue-600',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'storeHash', label: 'Store Hash', type: 'text', required: true },
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true }
    ],
    defaultSettings: {
      syncOrders: true,
      syncCustomers: true,
      syncProducts: false,
      apiVersion: 'v2'
    }
  },
  {
    id: 'prestashop',
    name: 'PrestaShop',
    description: 'Open source e-commerce solution',
    category: 'E-commerce',
    type: 'api-key',
    icon: '🛍️',
    color: 'bg-pink-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'shopUrl', label: 'Shop URL', type: 'url', required: true },
      { key: 'webserviceKey', label: 'Webservice Key', type: 'password', required: true }
    ],
    defaultSettings: {
      syncOrders: true,
      syncCustomers: true,
      syncProducts: false,
      outputFormat: 'JSON'
    }
  },
  {
    id: 'opencart',
    name: 'OpenCart',
    description: 'Open source shopping cart solution',
    category: 'E-commerce',
    type: 'api-key',
    icon: '🛒',
    color: 'bg-blue-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'storeUrl', label: 'Store URL', type: 'url', required: true },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'username', label: 'API Username', type: 'text', required: true }
    ],
    defaultSettings: {
      syncOrders: true,
      syncCustomers: true,
      syncProducts: false
    }
  },

  // Marketplaces
  {
    id: 'amazon-seller',
    name: 'Amazon Seller Central',
    description: 'Amazon marketplace for sellers',
    category: 'E-commerce',
    type: 'oauth',
    icon: '📦',
    color: 'bg-orange-500',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'clientId', label: 'LWA Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'LWA Client Secret', type: 'password', required: true },
      { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
      { key: 'marketplaceId', label: 'Marketplace ID', type: 'text', required: true },
      { key: 'sellerId', label: 'Seller ID', type: 'text', required: true }
    ],
    defaultSettings: {
      syncOrders: true,
      syncInventory: false,
      syncReports: false,
      region: 'us-east-1'
    }
  },
  {
    id: 'ebay',
    name: 'eBay',
    description: 'Online marketplace and auction website',
    category: 'E-commerce',
    type: 'oauth',
    icon: '🏷️',
    color: 'bg-yellow-500',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID (App ID)', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret (Cert ID)', type: 'password', required: true },
      { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
      { key: 'environment', label: 'Environment', type: 'select', required: true, options: ['sandbox', 'production'] }
    ],
    defaultSettings: {
      syncOrders: true,
      syncListings: false,
      syncMessages: false,
      marketplaceId: 'EBAY_US'
    }
  },
  {
    id: 'etsy',
    name: 'Etsy',
    description: 'E-commerce website focused on handmade or vintage items',
    category: 'E-commerce',
    type: 'oauth',
    icon: '🎨',
    color: 'bg-orange-400',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'Keystring', type: 'text', required: true },
      { key: 'sharedSecret', label: 'Shared Secret', type: 'password', required: true },
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { key: 'accessTokenSecret', label: 'Access Token Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncOrders: true,
      syncListings: false,
      syncShop: false
    }
  },

  // Payment Processors
  {
    id: 'square',
    name: 'Square',
    description: 'Financial services and mobile payment company',
    category: 'E-commerce',
    type: 'oauth',
    icon: '⬜',
    color: 'bg-gray-800',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'applicationId', label: 'Application ID', type: 'text', required: true },
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { key: 'environment', label: 'Environment', type: 'select', required: true, options: ['sandbox', 'production'] },
      { key: 'locationId', label: 'Location ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncPayments: true,
      syncCustomers: true,
      syncOrders: true,
      syncInventory: false
    }
  },
  {
    id: 'clover',
    name: 'Clover',
    description: 'Point of sale and business management system',
    category: 'E-commerce',
    type: 'oauth',
    icon: '🍀',
    color: 'bg-green-700',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { key: 'environment', label: 'Environment', type: 'select', required: true, options: ['sandbox', 'production'] }
    ],
    defaultSettings: {
      syncOrders: true,
      syncPayments: true,
      syncCustomers: true,
      syncInventory: false
    }
  },

  // Subscription & SaaS
  {
    id: 'chargebee',
    name: 'Chargebee',
    description: 'Subscription billing and revenue management platform',
    category: 'E-commerce',
    type: 'api-key',
    icon: '🔄',
    color: 'bg-blue-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'siteName', label: 'Site Name', type: 'text', required: true, placeholder: 'yoursite-test' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true }
    ],
    defaultSettings: {
      syncSubscriptions: true,
      syncCustomers: true,
      syncInvoices: true,
      syncEvents: false
    }
  },
  {
    id: 'recurly',
    name: 'Recurly',
    description: 'Subscription management and billing platform',
    category: 'E-commerce',
    type: 'api-key',
    icon: '♻️',
    color: 'bg-purple-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'Private API Key', type: 'password', required: true },
      { key: 'subdomain', label: 'Subdomain', type: 'text', required: true }
    ],
    defaultSettings: {
      syncSubscriptions: true,
      syncAccounts: true,
      syncTransactions: true,
      apiVersion: 'v2021-02-25'
    }
  },

  // Inventory Management
  {
    id: 'tradegecko',
    name: 'TradeGecko (QuickBooks Commerce)',
    description: 'Inventory and order management platform',
    category: 'E-commerce',
    type: 'oauth',
    icon: '🦎',
    color: 'bg-green-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'redirectUri', label: 'Redirect URI', type: 'url', required: true }
    ],
    defaultSettings: {
      syncOrders: true,
      syncProducts: true,
      syncVariants: false,
      syncCompanies: true
    }
  },
  {
    id: 'orderhive',
    name: 'Orderhive',
    description: 'Inventory and order management system',
    category: 'E-commerce',
    type: 'api-key',
    icon: '📦',
    color: 'bg-yellow-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'companyId', label: 'Company ID', type: 'text', required: true }
    ],
    defaultSettings: {
      syncOrders: true,
      syncProducts: true,
      syncCustomers: true,
      syncStores: false
    }
  },

  // Shipping & Fulfillment
  {
    id: 'shipstation',
    name: 'ShipStation',
    description: 'Web-based shipping solution',
    category: 'E-commerce',
    type: 'api-key',
    icon: '🚢',
    color: 'bg-blue-700',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'apiSecret', label: 'API Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncOrders: true,
      syncShipments: true,
      syncCarriers: false,
      autoFulfill: false
    }
  },
  {
    id: 'easypost',
    name: 'EasyPost',
    description: 'Shipping API for e-commerce',
    category: 'E-commerce',
    type: 'api-key',
    icon: '📮',
    color: 'bg-green-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'environment', label: 'Environment', type: 'select', required: true, options: ['test', 'production'] }
    ],
    defaultSettings: {
      syncShipments: true,
      syncTrackers: true,
      enableInsurance: false,
      enableSignature: false
    }
  }
];

export default ecommerceIntegrations;