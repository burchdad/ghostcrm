import { NextRequest, NextResponse } from 'next/server';
import { ALL_INTEGRATIONS } from '../../../../../integrations';
import { IntegrationTemplate } from '../../../../../integrations/types';
import { connectionStorage } from '../../../../../lib/crypto/secure-storage';
import { credentialManager } from '../../../../../lib/crypto/secure-credentials';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

interface ConnectionRequest {
  integrationId: string;
  configuration: Record<string, any>;
  testOnly?: boolean;
  userId?: string;
}

interface ConnectionTest {
  success: boolean;
  error?: string;
  data?: {
    connected: boolean;
    connectionTime: number;
    metadata?: Record<string, any>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ConnectionRequest = await request.json();
    const { integrationId, configuration, testOnly } = body;

    // Find the integration template
    const integration = ALL_INTEGRATIONS.find(int => int.id === integrationId);
    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Validate required credentials
    const validationError = validateCredentials(integration, configuration);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    // Test the connection
    const testResult = await testConnection(integration, configuration);
    
    if (testOnly) {
      return NextResponse.json(testResult);
    }

    // Handle OAuth integrations differently
    if (integration.type === 'oauth') {
      if (testResult.success && testResult.data?.metadata?.requiresAuth) {
        // For OAuth, initiate the OAuth flow
        try {
          const baseUrl = new URL(request.url).origin;
          const oauthResponse = await fetch(`${baseUrl}/api/settings/integrations/oauth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              integrationId,
              clientId: configuration.clientId,
              clientSecret: configuration.clientSecret,
              userId: configuration.userId || 'anonymous'
            })
          });

          const oauthResult = await oauthResponse.json();
          
          if (oauthResult.success) {
            return NextResponse.json({
              success: true,
              data: {
                type: 'oauth_redirect',
                authUrl: oauthResult.data.authUrl,
                integrationId,
                message: 'Redirecting to OAuth authorization...'
              }
            });
          } else {
            return NextResponse.json({
              success: false,
              error: oauthResult.error || 'Failed to initiate OAuth flow'
            });
          }
        } catch (oauthError: any) {
          return NextResponse.json({
            success: false,
            error: `OAuth flow error: ${oauthError.message}`
          });
        }
      }
    }

    if (!testResult.success) {
      return NextResponse.json(testResult);
    }

    // Store the connection securely with encryption
    const userId = configuration.userId || 'anonymous';
    const storeResult = await connectionStorage.storeConnection({
      integrationId,
      userId,
      name: integration.name,
      category: integration.category,
      type: integration.type,
      status: 'active',
      isConnected: true,
      isEnabled: true,
      connectedAt: new Date().toISOString(),
      credentials: configuration, // This will be encrypted automatically
      metadata: {
        ...testResult.data?.metadata || {},
        connectionMethod: 'universal_handler',
        testResults: {
          connectionTime: testResult.data?.connectionTime,
          validated: true
        }
      }
    });

    if (!storeResult.success) {
      return NextResponse.json({
        success: false,
        error: `Failed to store connection: ${storeResult.error}`
      });
    }

    // Return success with connection info (credentials are not included)
    const responseData = {
      connectionId: storeResult.connectionId,
      integrationId,
      name: integration.name,
      category: integration.category,
      type: integration.type,
      status: 'active',
      isConnected: true,
      connectedAt: new Date().toISOString(),
      metadata: testResult.data?.metadata || {},
      securityNote: 'Credentials encrypted and stored securely'
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Integration connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validateCredentials(
  integration: IntegrationTemplate, 
  configuration: Record<string, any>
): string | null {
  const requiredFields = integration.credentialFields.filter(field => field.required);
  
  for (const field of requiredFields) {
    if (!configuration[field.key] || configuration[field.key].trim() === '') {
      return `Missing required field: ${field.label}`;
    }
  }
  
  return null;
}

async function testConnection(
  integration: IntegrationTemplate,
  configuration: Record<string, any>
): Promise<ConnectionTest> {
  const startTime = Date.now();
  
  try {
    switch (integration.type) {
      case 'api-key':
        return await testApiKeyConnection(integration, configuration);
      case 'oauth':
        return await testOAuthConnection(integration, configuration);
      case 'database':
        return await testDatabaseConnection(integration, configuration);
      case 'webhook':
        return await testWebhookConnection(integration, configuration);
      case 'credentials':
        return await testCredentialsConnection(integration, configuration);
      default:
        return {
          success: true,
          data: {
            connected: true,
            connectionTime: Date.now() - startTime,
            metadata: { type: integration.type, validated: true }
          }
        };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Connection test failed: ${error.message}`
    };
  }
}

async function testApiKeyConnection(
  integration: IntegrationTemplate,
  configuration: Record<string, any>
): Promise<ConnectionTest> {
  const startTime = Date.now();
  
  // Generic API key validation based on integration
  let testUrl = '';
  let headers: Record<string, string> = {};
  
  switch (integration.category) {
    case 'CRM':
      testUrl = getCrmTestUrl(integration.id, configuration);
      headers = getCrmHeaders(integration.id, configuration);
      break;
    case 'Email':
      testUrl = getEmailTestUrl(integration.id, configuration);
      headers = getEmailHeaders(integration.id, configuration);
      break;
    case 'Marketing':
      testUrl = getMarketingTestUrl(integration.id, configuration);
      headers = getMarketingHeaders(integration.id, configuration);
      break;
    case 'Productivity':
      testUrl = getProductivityTestUrl(integration.id, configuration);
      headers = getProductivityHeaders(integration.id, configuration);
      break;
    default:
      // Generic test for unknown categories
      return {
        success: true,
        data: {
          connected: true,
          connectionTime: Date.now() - startTime,
          metadata: { type: 'api-key', category: integration.category }
        }
      };
  }

  if (!testUrl) {
    return {
      success: true,
      data: {
        connected: true,
        connectionTime: Date.now() - startTime,
        metadata: { type: 'api-key', validated: false }
      }
    };
  }

  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers
    });

    const connectionTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: true,
        data: {
          connected: true,
          connectionTime,
          metadata: {
            type: 'api-key',
            status: response.status,
            responseData: data
          }
        }
      };
    } else {
      return {
        success: false,
        error: `API returned ${response.status}: ${response.statusText}`
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Connection failed: ${error.message}`
    };
  }
}

async function testOAuthConnection(
  integration: IntegrationTemplate,
  configuration: Record<string, any>
): Promise<ConnectionTest> {
  // For OAuth, we'll validate the client credentials format and check if OAuth is supported
  const requiredFields = ['clientId', 'clientSecret'];
  const missingFields = requiredFields.filter(field => !configuration[field]);
  
  if (missingFields.length > 0) {
    return {
      success: false,
      error: `Missing OAuth credentials: ${missingFields.join(', ')}`
    };
  }

  // Check if this integration has OAuth configuration
  const supportedOAuthProviders = [
    'google-workspace', 'microsoft-365', 'salesforce', 'hubspot', 
    'slack', 'github', 'discord', 'linkedin'
  ];

  if (!supportedOAuthProviders.includes(integration.id)) {
    return {
      success: false,
      error: `OAuth not yet configured for ${integration.name}. Please contact support.`
    };
  }

  // OAuth connections need full flow, so we'll validate credentials and provide auth URL
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const oauthUrl = `${baseUrl}/api/settings/integrations/oauth`;
  
  return {
    success: true,
    data: {
      connected: false, // Not connected until OAuth flow completes
      connectionTime: 0,
      metadata: {
        type: 'oauth',
        requiresAuth: true,
        authUrl: `${oauthUrl}?integrationId=${integration.id}`,
        provider: integration.id,
        status: 'ready_for_oauth'
      }
    }
  };
}

async function testDatabaseConnection(
  integration: IntegrationTemplate,
  configuration: Record<string, any>
): Promise<ConnectionTest> {
  // Database connections would need actual database clients
  // For now, validate required fields
  const requiredFields = ['host', 'username', 'password'];
  const missingFields = requiredFields.filter(field => !configuration[field]);
  
  if (missingFields.length > 0) {
    return {
      success: false,
      error: `Missing database credentials: ${missingFields.join(', ')}`
    };
  }

  return {
    success: true,
    data: {
      connected: true,
      connectionTime: 0,
      metadata: {
        type: 'database',
        host: configuration.host,
        database: configuration.database || 'default'
      }
    }
  };
}

async function testWebhookConnection(
  integration: IntegrationTemplate,
  configuration: Record<string, any>
): Promise<ConnectionTest> {
  const webhookUrl = configuration.webhookUrl || configuration.url;
  
  if (!webhookUrl) {
    return {
      success: false,
      error: 'Webhook URL is required'
    };
  }

  try {
    // Test webhook endpoint with a ping
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true, timestamp: Date.now() })
    });

    return {
      success: true,
      data: {
        connected: true,
        connectionTime: 0,
        metadata: {
          type: 'webhook',
          url: webhookUrl,
          status: response.status
        }
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Webhook test failed: ${error.message}`
    };
  }
}

async function testCredentialsConnection(
  integration: IntegrationTemplate,
  configuration: Record<string, any>
): Promise<ConnectionTest> {
  // Basic credential validation
  const hasCredentials = Object.values(configuration).some(value => 
    typeof value === 'string' && value.length > 0
  );

  if (!hasCredentials) {
    return {
      success: false,
      error: 'No credentials provided'
    };
  }

  return {
    success: true,
    data: {
      connected: true,
      connectionTime: 0,
      metadata: {
        type: 'credentials',
        fieldsProvided: Object.keys(configuration).length
      }
    }
  };
}

// Helper functions for different categories
function getCrmTestUrl(integrationId: string, config: Record<string, any>): string {
  switch (integrationId) {
    case 'hubspot':
      return 'https://api.hubapi.com/crm/v3/objects/contacts';
    case 'salesforce':
      return `${config.instanceUrl || 'https://na1.salesforce.com'}/services/data/v52.0/sobjects/`;
    case 'pipedrive':
      return `https://${config.domain}/api/v1/users`;
    default:
      return '';
  }
}

function getCrmHeaders(integrationId: string, config: Record<string, any>): Record<string, string> {
  switch (integrationId) {
    case 'hubspot':
      return { 'Authorization': `Bearer ${config.apiKey}` };
    case 'salesforce':
      return { 'Authorization': `Bearer ${config.accessToken}` };
    case 'pipedrive':
      return {};
    default:
      return { 'Authorization': `Bearer ${config.apiKey}` };
  }
}

function getEmailTestUrl(integrationId: string, config: Record<string, any>): string {
  switch (integrationId) {
    case 'sendgrid':
      return 'https://api.sendgrid.com/v3/user/account';
    case 'mailchimp':
      return `https://${config.dataCenter || 'us1'}.api.mailchimp.com/3.0/ping`;
    default:
      return '';
  }
}

function getEmailHeaders(integrationId: string, config: Record<string, any>): Record<string, string> {
  switch (integrationId) {
    case 'sendgrid':
      return { 'Authorization': `Bearer ${config.apiKey}` };
    case 'mailchimp':
      return { 'Authorization': `apikey ${config.apiKey}` };
    default:
      return { 'Authorization': `Bearer ${config.apiKey}` };
  }
}

function getMarketingTestUrl(integrationId: string, config: Record<string, any>): string {
  switch (integrationId) {
    case 'mailchimp':
      return `https://${config.dataCenter || 'us1'}.api.mailchimp.com/3.0/ping`;
    case 'constant-contact':
      return 'https://api.cc.email/v3/account/summary';
    default:
      return '';
  }
}

function getMarketingHeaders(integrationId: string, config: Record<string, any>): Record<string, string> {
  switch (integrationId) {
    case 'mailchimp':
      return { 'Authorization': `apikey ${config.apiKey}` };
    case 'constant-contact':
      return { 'Authorization': `Bearer ${config.accessToken}` };
    default:
      return { 'Authorization': `Bearer ${config.apiKey}` };
  }
}

function getProductivityTestUrl(integrationId: string, config: Record<string, any>): string {
  switch (integrationId) {
    case 'slack':
      return 'https://slack.com/api/auth.test';
    case 'microsoft-teams':
      return 'https://graph.microsoft.com/v1.0/me';
    default:
      return '';
  }
}

function getProductivityHeaders(integrationId: string, config: Record<string, any>): Record<string, string> {
  switch (integrationId) {
    case 'slack':
      return { 'Authorization': `Bearer ${config.botToken || config.apiKey}` };
    case 'microsoft-teams':
      return { 'Authorization': `Bearer ${config.accessToken}` };
    default:
      return { 'Authorization': `Bearer ${config.apiKey}` };
  }
}

function getOAuthUrl(integrationId: string, config: Record<string, any>): string {
  // Return OAuth authorization URLs for different services
  switch (integrationId) {
    case 'google-workspace':
      return `https://accounts.google.com/o/oauth2/auth?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&scope=https://www.googleapis.com/auth/gmail.readonly&response_type=code`;
    case 'microsoft-365':
      return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${config.clientId}&response_type=code&redirect_uri=${config.redirectUri}&scope=https://graph.microsoft.com/mail.read`;
    case 'salesforce':
      return `https://login.salesforce.com/services/oauth2/authorize?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=code`;
    default:
      return '';
  }
}

function sanitizeConfiguration(config: Record<string, any>): Record<string, any> {
  // Remove sensitive fields from stored configuration
  const sanitized = { ...config };
  delete sanitized.password;
  delete sanitized.clientSecret;
  delete sanitized.apiSecret;
  
  // Mask API keys (show only first 4 and last 4 characters)
  if (sanitized.apiKey && typeof sanitized.apiKey === 'string' && sanitized.apiKey.length > 8) {
    sanitized.apiKey = sanitized.apiKey.substring(0, 4) + '****' + sanitized.apiKey.substring(sanitized.apiKey.length - 4);
  }
  
  return sanitized;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const integrationId = searchParams.get('integrationId');
  
  if (integrationId) {
    const integration = ALL_INTEGRATIONS.find(int => int.id === integrationId);
    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        integration,
        credentialFields: integration.credentialFields,
        type: integration.type,
        category: integration.category
      }
    });
  }
  
  return NextResponse.json({
    success: true,
    data: {
      availableIntegrations: ALL_INTEGRATIONS.length,
      supportedTypes: ['api-key', 'oauth', 'database', 'webhook', 'credentials'],
      categories: [...new Set(ALL_INTEGRATIONS.map(int => int.category))]
    }
  });
}