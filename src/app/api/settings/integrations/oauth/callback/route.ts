import { NextRequest, NextResponse } from 'next/server';
import { ALL_INTEGRATIONS } from '../../../../../../integrations';

interface OAuthState {
  integrationId: string;
  userId: string;
  redirectTo?: string;
  timestamp: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/settings/integrations?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || 'OAuth authorization failed')}`, request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=invalid_request&description=Missing authorization code or state', request.url)
      );
    }

    // Decode and validate state
    let stateData: OAuthState;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (err) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=invalid_state&description=Invalid state parameter', request.url)
      );
    }

    // Check state timestamp (prevent replay attacks)
    const stateAge = Date.now() - stateData.timestamp;
    if (stateAge > 10 * 60 * 1000) { // 10 minutes
      return NextResponse.redirect(
        new URL('/settings/integrations?error=expired_state&description=OAuth state has expired', request.url)
      );
    }

    // Find the integration
    const integration = ALL_INTEGRATIONS.find(int => int.id === stateData.integrationId);
    if (!integration) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=integration_not_found&description=Integration not found', request.url)
      );
    }

    // In a real implementation, retrieve the OAuth session data from secure storage
    // For this demo, we'll simulate the data that would have been stored
    const baseUrl = new URL(request.url).origin;
    const oauthConfig = getOAuthConfig(stateData.integrationId, baseUrl);
    
    if (!oauthConfig) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=config_error&description=OAuth configuration not found', request.url)
      );
    }

    // TODO: In production, retrieve clientId and clientSecret from secure session storage
    // For now, we'll show how this would work with placeholder credentials
    const clientCredentials = {
      clientId: 'retrieved_from_session',
      clientSecret: 'retrieved_from_session'
    };

    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForToken(
      oauthConfig,
      code,
      clientCredentials.clientId,
      clientCredentials.clientSecret
    );

    if (!tokenResponse.success) {
      return NextResponse.redirect(
        new URL(`/settings/integrations?error=token_exchange_failed&description=${encodeURIComponent(tokenResponse.error || 'Failed to exchange code for token')}`, request.url)
      );
    }

    // Store the connection data
    const connectionData = {
      id: `${stateData.integrationId}-${Date.now()}`,
      integrationId: stateData.integrationId,
      name: integration.name,
      category: integration.category,
      type: integration.type,
      status: 'connected',
      isConnected: true,
      isEnabled: true,
      connectedAt: new Date().toISOString(),
      userId: stateData.userId,
      tokens: {
        accessToken: tokenResponse.data.access_token,
        refreshToken: tokenResponse.data.refresh_token,
        expiresIn: tokenResponse.data.expires_in,
        tokenType: tokenResponse.data.token_type || 'Bearer',
        scope: tokenResponse.data.scope
      },
      metadata: {
        connectedVia: 'oauth',
        provider: stateData.integrationId
      }
    };

    // In production, save this to your database with proper encryption
    console.log('OAuth connection successful:', {
      integrationId: stateData.integrationId,
      userId: stateData.userId,
      connectedAt: connectionData.connectedAt
    });

    // Redirect back to integrations page with success
    const redirectUrl = new URL('/settings/integrations', request.url);
    redirectUrl.searchParams.set('connected', stateData.integrationId);
    redirectUrl.searchParams.set('status', 'success');
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/settings/integrations?error=callback_error&description=OAuth callback processing failed', request.url)
    );
  }
}

async function exchangeCodeForToken(
  oauthConfig: any,
  code: string,
  clientId: string,
  clientSecret: string
): Promise<{ success: boolean; data?: TokenResponse; error?: string }> {
  try {
    const tokenData = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: oauthConfig.redirectUri,
      client_id: clientId,
      client_secret: clientSecret
    });

    const response = await fetch(oauthConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenData
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Token exchange failed: ${response.status} ${errorText}`
      };
    }

    const tokenResponse: TokenResponse = await response.json();
    
    if (!tokenResponse.access_token) {
      return {
        success: false,
        error: 'No access token received'
      };
    }

    return {
      success: true,
      data: tokenResponse
    };

  } catch (error: any) {
    return {
      success: false,
      error: `Token exchange error: ${error.message}`
    };
  }
}

function getOAuthConfig(integrationId: string, baseUrl: string) {
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
}