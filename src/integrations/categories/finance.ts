import { IntegrationTemplate } from '../types';

export const financeIntegrations: IntegrationTemplate[] = [
  // Accounting Software
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    description: 'Business accounting software developed and marketed by Intuit',
    category: 'Finance',
    type: 'oauth',
    icon: '📊',
    color: 'bg-blue-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'companyId', label: 'Company ID', type: 'text', required: true },
      { key: 'environment', label: 'Environment', type: 'select', required: true, options: ['sandbox', 'production'] }
    ],
    defaultSettings: {
      syncCustomers: true,
      syncInvoices: true,
      syncPayments: true,
      syncItems: false,
      minorVersion: '65'
    }
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Cloud-based accounting software for small and medium-sized businesses',
    category: 'Finance',
    type: 'oauth',
    icon: '💙',
    color: 'bg-blue-500',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'tenantId', label: 'Tenant ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncContacts: true,
      syncInvoices: true,
      syncPayments: true,
      syncBankTransactions: false
    }
  },
  {
    id: 'freshbooks',
    name: 'FreshBooks',
    description: 'Cloud-based accounting software for small business owners',
    category: 'Finance',
    type: 'oauth',
    icon: '📚',
    color: 'bg-green-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'accountId', label: 'Account ID', type: 'text', required: false }
    ],
    defaultSettings: {
      syncClients: true,
      syncInvoices: true,
      syncPayments: true,
      syncExpenses: false
    }
  },
  {
    id: 'sage',
    name: 'Sage Business Cloud Accounting',
    description: 'Cloud accounting software by Sage',
    category: 'Finance',
    type: 'oauth',
    icon: '🌿',
    color: 'bg-green-700',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncContacts: true,
      syncSalesInvoices: true,
      syncBankAccounts: false,
      country: 'US'
    }
  },

  // Payment Processors
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Online payment processing platform',
    category: 'Finance',
    type: 'api-key',
    icon: '💳',
    color: 'bg-indigo-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
      { key: 'publishableKey', label: 'Publishable Key', type: 'text', required: false },
      { key: 'webhookSecret', label: 'Webhook Endpoint Secret', type: 'password', required: false }
    ],
    defaultSettings: {
      syncPayments: true,
      syncCustomers: true,
      syncSubscriptions: true,
      syncInvoices: true,
      apiVersion: '2023-10-16'
    }
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Online payments system',
    category: 'Finance',
    type: 'oauth',
    icon: '🅿️',
    color: 'bg-blue-600',
    popular: true,
    featured: true,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'environment', label: 'Environment', type: 'select', required: true, options: ['sandbox', 'live'] }
    ],
    defaultSettings: {
      syncPayments: true,
      syncSubscriptions: true,
      syncInvoices: false,
      webhookId: ''
    }
  },
  {
    id: 'adyen',
    name: 'Adyen',
    description: 'Global payment platform',
    category: 'Finance',
    type: 'api-key',
    icon: '💎',
    color: 'bg-green-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'merchantAccount', label: 'Merchant Account', type: 'text', required: true },
      { key: 'environment', label: 'Environment', type: 'select', required: true, options: ['test', 'live'] }
    ],
    defaultSettings: {
      syncPayments: true,
      syncPayouts: false,
      enableRecurring: false
    }
  },
  {
    id: 'braintree',
    name: 'Braintree',
    description: 'Payment platform owned by PayPal',
    category: 'Finance',
    type: 'api-key',
    icon: '🧠',
    color: 'bg-purple-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
      { key: 'publicKey', label: 'Public Key', type: 'text', required: true },
      { key: 'privateKey', label: 'Private Key', type: 'password', required: true },
      { key: 'environment', label: 'Environment', type: 'select', required: true, options: ['sandbox', 'production'] }
    ],
    defaultSettings: {
      syncTransactions: true,
      syncCustomers: true,
      syncSubscriptions: true
    }
  },

  // Banking & Financial Data
  {
    id: 'plaid',
    name: 'Plaid',
    description: 'Financial services company that enables applications to connect with users\' bank accounts',
    category: 'Finance',
    type: 'api-key',
    icon: '🏦',
    color: 'bg-blue-700',
    popular: true,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'secret', label: 'Secret', type: 'password', required: true },
      { key: 'environment', label: 'Environment', type: 'select', required: true, options: ['sandbox', 'development', 'production'] }
    ],
    defaultSettings: {
      syncTransactions: true,
      syncAccounts: true,
      syncIdentity: false,
      products: ['transactions', 'auth']
    }
  },
  {
    id: 'yodlee',
    name: 'Yodlee',
    description: 'Financial data aggregation and analytics platform',
    category: 'Finance',
    type: 'oauth',
    icon: '🔍',
    color: 'bg-orange-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'secret', label: 'Secret', type: 'password', required: true },
      { key: 'baseUrl', label: 'Base URL', type: 'url', required: true }
    ],
    defaultSettings: {
      syncAccounts: true,
      syncTransactions: true,
      syncHoldings: false
    }
  },

  // Expense Management
  {
    id: 'expensify',
    name: 'Expensify',
    description: 'Expense management software',
    category: 'Finance',
    type: 'api-key',
    icon: '🧾',
    color: 'bg-green-500',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'partnerUserID', label: 'Partner User ID', type: 'text', required: true },
      { key: 'partnerUserSecret', label: 'Partner User Secret', type: 'password', required: true }
    ],
    defaultSettings: {
      syncReports: true,
      syncExpenses: true,
      autoApprove: false
    }
  },
  {
    id: 'concur',
    name: 'SAP Concur',
    description: 'Travel and expense management solution',
    category: 'Finance',
    type: 'oauth',
    icon: '✈️',
    color: 'bg-blue-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'datacenter', label: 'Datacenter', type: 'select', required: true, options: ['us', 'emea', 'china'] }
    ],
    defaultSettings: {
      syncExpenses: true,
      syncReports: true,
      syncUsers: false
    }
  },

  // Tax Software
  {
    id: 'avalara',
    name: 'Avalara',
    description: 'Tax compliance automation software',
    category: 'Finance',
    type: 'api-key',
    icon: '🏛️',
    color: 'bg-gray-700',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'accountId', label: 'Account ID', type: 'text', required: true },
      { key: 'licenseKey', label: 'License Key', type: 'password', required: true },
      { key: 'environment', label: 'Environment', type: 'select', required: true, options: ['sandbox', 'production'] }
    ],
    defaultSettings: {
      calculateTax: true,
      commitTransactions: false,
      enableLogging: false
    }
  },
  {
    id: 'taxjar',
    name: 'TaxJar',
    description: 'Sales tax API and reporting service',
    category: 'Finance',
    type: 'api-key',
    icon: '🏺',
    color: 'bg-green-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'apiToken', label: 'API Token', type: 'password', required: true }
    ],
    defaultSettings: {
      calculateTax: true,
      createTransactions: false,
      enableNexus: false
    }
  },

  // Investment & Trading
  {
    id: 'alpaca',
    name: 'Alpaca',
    description: 'Commission-free trading API',
    category: 'Finance',
    type: 'api-key',
    icon: '🦙',
    color: 'bg-yellow-600',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'keyId', label: 'API Key ID', type: 'text', required: true },
      { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
      { key: 'environment', label: 'Environment', type: 'select', required: true, options: ['paper', 'live'] }
    ],
    defaultSettings: {
      syncPositions: true,
      syncOrders: true,
      syncAccount: true,
      enableTrading: false
    }
  },
  {
    id: 'robinhood',
    name: 'Robinhood',
    description: 'Commission-free investing app',
    category: 'Finance',
    type: 'oauth',
    icon: '🏹',
    color: 'bg-green-700',
    popular: false,
    featured: false,
    credentialFields: [
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true }
    ],
    defaultSettings: {
      syncPortfolio: true,
      syncPositions: true,
      syncOrders: false,
      enableTrading: false
    }
  }
];

export default financeIntegrations;