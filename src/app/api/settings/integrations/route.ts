import { NextRequest, NextResponse } from 'next/server';
import { ALL_INTEGRATIONS, getIntegrationsByCategory, getIntegrationStats } from '@/integrations';
import { IntegrationTemplate, IntegrationCategory } from '@/integrations/types';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

interface ConnectedIntegration {
  id: string;
  name: string;
  type: IntegrationCategory;
  provider: string;
  description: string;
  isEnabled: boolean;
  isConnected: boolean;
  status: 'active' | 'inactive' | 'error' | 'pending' | 'configuring';
  category: IntegrationCategory;
  features: string[];
  pricing: 'free' | 'paid' | 'freemium' | 'enterprise';
  configuration: {
    apiKey?: string;
    apiSecret?: string;
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    webhookUrl?: string;
    customFields?: Record<string, any>;
  };
  settings: {
    syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
    autoSync: boolean;
    bidirectionalSync: boolean;
    syncFields: string[];
    webhooksEnabled: boolean;
    rateLimitEnabled: boolean;
    rateLimitPerHour: number;
  };
  metrics: {
    lastSyncAt?: string;
    syncCount: number;
    errorCount: number;
    recordsSynced: number;
    avgSyncTime: number;
  };
  permissions: string[];
  connectedAt?: string;
  connectedBy?: string;
  lastActivity?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConnectIntegrationRequest {
  integrationId: string;
  configuration: Record<string, any>;
  settings?: Partial<ConnectedIntegration['settings']>;
}

interface UpdateIntegrationRequest {
  integrationId: string;
  settings?: Partial<ConnectedIntegration['settings']>;
  configuration?: Partial<ConnectedIntegration['configuration']>;
  isEnabled?: boolean;
}

interface TestIntegrationRequest {
  integrationId: string;
  testType: 'connection' | 'sync' | 'webhook' | 'auth';
}

// Convert IntegrationTemplate to ConnectedIntegration
const convertTemplateToConnectedIntegration = (template: IntegrationTemplate): ConnectedIntegration => {
  // Determine pricing based on template properties
  let pricing: 'free' | 'paid' | 'freemium' | 'enterprise' = 'free';
  if (template.popular && template.featured) pricing = 'enterprise';
  else if (template.popular) pricing = 'freemium';
  else if (template.featured) pricing = 'paid';

  return {
    id: template.id,
    name: template.name,
    type: template.category as IntegrationCategory,
    provider: template.name,
    description: template.description,
    isEnabled: false,
    isConnected: false,
    status: 'inactive',
    category: template.category,
    features: Object.keys(template.defaultSettings || {}),
    pricing,
    configuration: {},
    settings: {
      syncFrequency: 'daily',
      autoSync: false,
      bidirectionalSync: false,
      syncFields: [],
      webhooksEnabled: false,
      rateLimitEnabled: true,
      rateLimitPerHour: 100,
    },
    metrics: {
      syncCount: 0,
      errorCount: 0,
      recordsSynced: 0,
      avgSyncTime: 0,
    },
    permissions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Load all integrations from the library
const getAllAvailableIntegrations = (): ConnectedIntegration[] => {
  return ALL_INTEGRATIONS.map(convertTemplateToConnectedIntegration);
};

// Get all available integrations from the library (cached)
let cachedIntegrations: ConnectedIntegration[] | null = null;

const getAvailableIntegrations = (): ConnectedIntegration[] => {
  if (!cachedIntegrations) {
    cachedIntegrations = getAllAvailableIntegrations();
  }
  return cachedIntegrations;
};

const integrationTypes = [
  'Database', 'AI & ML', 'Communication', 'Email', 'Productivity', 'Finance', 
  'CRM', 'Marketing', 'Automation', 'Analytics', 'Storage', 'API', 'Webhook', 
  'E-commerce', 'Support', 'Social', 'Custom'
];

const integrationStatuses = ['active', 'inactive', 'error', 'pending', 'configuring'];

// Validation functions
const validateIntegrationId = (integrationId: string): ConnectedIntegration | null => {
  const integrations = getAvailableIntegrations();
  const integration = integrations.find(i => i.id === integrationId);
  return integration || null;
};

const validateConfiguration = (integration: ConnectedIntegration, config: Record<string, any>): string | null => {
  // Get the original template to validate against credential fields
  const template = ALL_INTEGRATIONS.find(t => t.id === integration.id);
  if (!template) return 'Integration template not found';

  // Validate required credential fields
  for (const field of template.credentialFields) {
    if (field.required && (!config[field.key] || config[field.key].toString().trim() === '')) {
      return `${field.label} is required`;
    }

    // Validate field types
    if (config[field.key]) {
      if (field.type === 'url' && !isValidUrl(config[field.key])) {
        return `${field.label} must be a valid URL`;
      }
      if (field.type === 'number' && isNaN(Number(config[field.key]))) {
        return `${field.label} must be a number`;
      }
      if (field.validation?.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(config[field.key])) {
          return `${field.label} format is invalid`;
        }
      }
    }
  }

  return null;
};

const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Storage for connected integrations (in production, this would be in a database)
const connectedIntegrationsStorage = new Map<string, ConnectedIntegration>();

// GET /api/settings/integrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    let integrations = getAvailableIntegrations();

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      integrations = integrations.filter(integration =>
        integration.name.toLowerCase().includes(searchLower) ||
        integration.description.toLowerCase().includes(searchLower) ||
        integration.provider.toLowerCase().includes(searchLower) ||
        integration.category.toLowerCase().includes(searchLower)
      );
    }

    if (type) {
      integrations = integrations.filter(integration => integration.type === type);
    }

    if (status) {
      integrations = integrations.filter(integration => integration.status === status);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedIntegrations = integrations.slice(startIndex, endIndex);

    // Generate stats
    const stats = {
      total: integrations.length,
      connected: integrations.filter(i => i.isConnected).length,
      active: integrations.filter(i => i.status === 'active').length,
      byType: integrationTypes.reduce((acc, type) => {
        acc[type] = integrations.filter(i => i.type === type).length;
        return acc;
      }, {} as Record<string, number>),
      totalSyncs: integrations.reduce((sum, i) => sum + i.metrics.syncCount, 0),
      totalErrors: integrations.reduce((sum, i) => sum + i.metrics.errorCount, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        integrations: paginatedIntegrations,
        stats,
        types: integrationTypes,
        pagination: {
          page,
          limit,
          total: integrations.length,
          pages: Math.ceil(integrations.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Integration fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch integrations'
    }, { status: 500 });
  }
}

// POST /api/settings/integrations - Connect an integration
export async function POST(request: NextRequest) {
  try {
    const body: ConnectIntegrationRequest = await request.json();
    const { integrationId, configuration, settings } = body;

    if (!integrationId || !configuration) {
      return NextResponse.json({
        success: false,
        error: 'Integration ID and configuration are required'
      }, { status: 400 });
    }

    const integration = validateIntegrationId(integrationId);
    if (!integration) {
      return NextResponse.json({
        success: false,
        error: 'Invalid integration ID'
      }, { status: 400 });
    }

    // Validate configuration
    const configError = validateConfiguration(integration, configuration);
    if (configError) {
      return NextResponse.json({
        success: false,
        error: configError
      }, { status: 400 });
    }

    // Create connected integration
    const connectedIntegration: ConnectedIntegration = {
      ...integration,
      isConnected: true,
      isEnabled: true,
      status: 'active',
      configuration,
      settings: { ...integration.settings, ...settings },
      connectedAt: new Date().toISOString(),
      connectedBy: 'current-user', // In production, get from auth
      lastActivity: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store the connected integration
    connectedIntegrationsStorage.set(integrationId, connectedIntegration);

    return NextResponse.json({
      success: true,
      data: connectedIntegration,
      message: `Successfully connected to ${integration.name}`
    });

  } catch (error) {
    console.error('Integration connection error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect integration'
    }, { status: 500 });
  }
}

// PUT /api/settings/integrations - Update an integration
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateIntegrationRequest = await request.json();
    const { integrationId, settings, configuration, isEnabled } = body;

    if (!integrationId) {
      return NextResponse.json({
        success: false,
        error: 'Integration ID is required'
      }, { status: 400 });
    }

    const integration = validateIntegrationId(integrationId);
    if (!integration) {
      return NextResponse.json({
        success: false,
        error: 'Invalid integration ID'
      }, { status: 400 });
    }

    // Get existing connected integration or create new one
    let connectedIntegration = connectedIntegrationsStorage.get(integrationId) || integration;

    // Update the integration
    const updatedIntegration: ConnectedIntegration = {
      ...connectedIntegration,
      settings: { ...connectedIntegration.settings, ...settings },
      configuration: { ...connectedIntegration.configuration, ...configuration },
      isEnabled: isEnabled !== undefined ? isEnabled : connectedIntegration.isEnabled,
      lastActivity: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Validate updated configuration if provided
    if (configuration) {
      const configError = validateConfiguration(updatedIntegration, { ...updatedIntegration.configuration, ...configuration });
      if (configError) {
        return NextResponse.json({
          success: false,
          error: configError
        }, { status: 400 });
      }
    }

    // Store the updated integration
    connectedIntegrationsStorage.set(integrationId, updatedIntegration);

    return NextResponse.json({
      success: true,
      data: updatedIntegration,
      message: `Successfully updated ${integration.name}`
    });

  } catch (error) {
    console.error('Integration update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update integration'
    }, { status: 500 });
  }
}

// DELETE /api/settings/integrations - Disconnect an integration
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { integrationId } = body;

    if (!integrationId) {
      return NextResponse.json({
        success: false,
        error: 'Integration ID is required'
      }, { status: 400 });
    }

    const integration = validateIntegrationId(integrationId);
    if (!integration) {
      return NextResponse.json({
        success: false,
        error: 'Invalid integration ID'
      }, { status: 400 });
    }

    // Remove the connected integration
    connectedIntegrationsStorage.delete(integrationId);

    // Return the disconnected integration
    const disconnectedIntegration: ConnectedIntegration = {
      ...integration,
      isConnected: false,
      isEnabled: false,
      status: 'inactive',
      configuration: {},
      connectedAt: undefined,
      connectedBy: undefined,
      lastActivity: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: disconnectedIntegration,
      message: `Successfully disconnected ${integration.name}`
    });

  } catch (error) {
    console.error('Integration disconnection error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to disconnect integration'
    }, { status: 500 });
  }
}