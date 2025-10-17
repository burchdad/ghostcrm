import { NextRequest, NextResponse } from 'next/server';
import { ALL_INTEGRATIONS } from '../../../../../integrations';

interface OAuthState {
  integrationId: string;
  userId: string;
  redirectTo?: string;
  timestamp: number;
}

// OAuth configuration for different providers
const getOAuthConfig = (integrationId: string, baseUrl: string) => {
  const redirectUri = `${baseUrl}/api/settings/integrations/oauth/callback`;
  
  switch (integrationId) {
    case 'google-workspace':
      return {
        authUrl: 'https://accounts.google.com/o/oauth2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar',
        redirectUri
      };
    
    case 'microsoft-365':
      return {
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        scope: 'https://graph.microsoft.com/mail.read https://graph.microsoft.com/calendars.read',
        redirectUri
      };
    
    case 'salesforce':
      return {
        authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
        tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
        scope: 'api refresh_token',
        redirectUri
      };
    
    case 'hubspot':
      return {
        authUrl: 'https://app.hubspot.com/oauth/authorize',
        tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
        scope: 'contacts',
        redirectUri
      };
    
    case 'slack':
      return {
        authUrl: 'https://slack.com/oauth/v2/authorize',
        tokenUrl: 'https://slack.com/api/oauth.v2.access',
        scope: 'channels:read chat:write',
        redirectUri
      };
    
    case 'github':
      return {
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        scope: 'repo user',
        redirectUri
      };
    
    case 'discord':
      return {
        authUrl: 'https://discord.com/api/oauth2/authorize',
        tokenUrl: 'https://discord.com/api/oauth2/token',
        scope: 'identify guilds',
        redirectUri
      };
    
    case 'linkedin':
      return {
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        scope: 'r_liteprofile r_emailaddress',
        redirectUri
      };
    
    default:
      return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { integrationId, clientId, clientSecret, userId = 'anonymous' } = body;

    // Find the integration template
    const integration = ALL_INTEGRATIONS.find(int => int.id === integrationId);
    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Check if integration supports OAuth
    if (integration.type !== 'oauth') {
      return NextResponse.json(
        { success: false, error: 'Integration does not support OAuth' },
        { status: 400 }
      );
    }

    // Validate OAuth credentials
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { success: false, error: 'Client ID and Client Secret are required' },
        { status: 400 }
      );
    }

    // Get OAuth configuration
    const baseUrl = new URL(request.url).origin;
    const oauthConfig = getOAuthConfig(integrationId, baseUrl);
    
    if (!oauthConfig) {
      return NextResponse.json(
        { success: false, error: 'OAuth configuration not available for this integration' },
        { status: 400 }
      );
    }

    // Create state parameter for security
    const state: OAuthState = {
      integrationId,
      userId,
      timestamp: Date.now()
    };
    
    const stateParam = Buffer.from(JSON.stringify(state)).toString('base64');

    // Build authorization URL
    const authUrl = new URL(oauthConfig.authUrl);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', oauthConfig.redirectUri);
    authUrl.searchParams.set('scope', oauthConfig.scope);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', stateParam);
    
    // Add provider-specific parameters
    if (integrationId === 'microsoft-365') {
      authUrl.searchParams.set('response_mode', 'query');
    } else if (integrationId === 'salesforce') {
      authUrl.searchParams.set('prompt', 'consent');
    } else if (integrationId === 'google-workspace') {
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
    }

    // Store OAuth session temporarily (in production, use Redis or database)
    // For now, we'll include it in the response for the client to handle
    const sessionData = {
      integrationId,
      clientId,
      clientSecret,
      oauthConfig,
      userId,
      timestamp: Date.now()
    };

    return NextResponse.json({
      success: true,
      data: {
        authUrl: authUrl.toString(),
        state: stateParam,
        integrationId,
        redirectUri: oauthConfig.redirectUri,
        sessionData // In production, store this securely and return session ID
      }
    });

  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
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

    const baseUrl = new URL(request.url).origin;
    const oauthConfig = getOAuthConfig(integrationId, baseUrl);
    
    return NextResponse.json({
      success: true,
      data: {
        integration,
        supportsOAuth: integration.type === 'oauth',
        oauthConfig: oauthConfig ? {
          authUrl: oauthConfig.authUrl,
          scope: oauthConfig.scope,
          redirectUri: oauthConfig.redirectUri
        } : null
      }
    });
  }
  
  // Return list of OAuth-enabled integrations
  const oauthIntegrations = ALL_INTEGRATIONS
    .filter(int => int.type === 'oauth')
    .map(int => ({
      id: int.id,
      name: int.name,
      category: int.category,
      description: int.description
    }));
  
  return NextResponse.json({
    success: true,
    data: {
      oauthIntegrations,
      totalOAuthIntegrations: oauthIntegrations.length,
      supportedProviders: [
        'google-workspace',
        'microsoft-365', 
        'salesforce',
        'hubspot',
        'slack',
        'github',
        'discord',
        'linkedin'
      ]
    }
  });
}