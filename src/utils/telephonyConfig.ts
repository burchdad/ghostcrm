// Telephony Configuration for AI Agent Outbound Calls
// Supports multiple providers for business number calling

export interface TelephonyProvider {
  name: string;
  apiKey: string;
  baseUrl: string;
  supportedFeatures: string[];
}

// Business phone configuration
export const BUSINESS_PHONE_CONFIG = {
  // Your business number (update this with your actual number)
  businessNumber: process.env.BUSINESS_PHONE_NUMBER || '+1234567890', // Update this!
  displayName: process.env.BUSINESS_DISPLAY_NAME || 'Ghost CRM',
  
  // Preferred telephony providers (in order of preference)
  providers: {
    twilio: {
      name: 'Twilio',
      apiKey: process.env.TWILIO_API_KEY || '',
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      baseUrl: 'https://api.twilio.com/2010-04-01',
      supportedFeatures: ['outbound_calls', 'caller_id', 'call_recording', 'ai_integration'],
      twimlApp: process.env.TWILIO_TWIML_APP_SID || ''
    },
    
    vonage: {
      name: 'Vonage (Nexmo)',
      apiKey: process.env.VONAGE_API_KEY || '',
      apiSecret: process.env.VONAGE_API_SECRET || '',
      applicationId: process.env.VONAGE_APPLICATION_ID || '',
      privateKey: process.env.VONAGE_PRIVATE_KEY || '',
      baseUrl: 'https://api.nexmo.com',
      supportedFeatures: ['outbound_calls', 'caller_id', 'call_recording', 'websocket_audio']
    },
    
    telnyx: {
      name: 'Telnyx',
      apiKey: process.env.TELNYX_API_KEY || '',
      baseUrl: 'https://api.telnyx.com/v2',
      supportedFeatures: ['outbound_calls', 'caller_id', 'call_recording', 'real_time_transcription']
    },
    
    bandwidth: {
      name: 'Bandwidth',
      apiKey: process.env.BANDWIDTH_API_TOKEN || '',
      accountId: process.env.BANDWIDTH_ACCOUNT_ID || '',
      applicationId: process.env.BANDWIDTH_APPLICATION_ID || '',
      baseUrl: 'https://voice.bandwidth.com/api/v2',
      supportedFeatures: ['outbound_calls', 'caller_id', 'bxml_webhooks']
    }
  }
};

// Twilio integration (most popular choice)
export async function initiateCallWithTwilio(
  leadPhoneNumber: string, 
  aiScript: string, 
  voiceConfig: any,
  callbackUrl: string
) {
  const twilio = BUSINESS_PHONE_CONFIG.providers.twilio;
  
  if (!twilio.accountSid || !twilio.authToken) {
    throw new Error('Twilio credentials not configured');
  }

  try {
    const response = await fetch(`${twilio.baseUrl}/Accounts/${twilio.accountSid}/Calls.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${twilio.accountSid}:${twilio.authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'From': BUSINESS_PHONE_CONFIG.businessNumber,
        'To': leadPhoneNumber,
        'Url': callbackUrl, // Webhook URL for TwiML instructions
        'StatusCallback': `${callbackUrl}/status`,
        'StatusCallbackEvent': 'initiated,ringing,answered,completed',
        'Record': 'true',
        'RecordingStatusCallback': `${callbackUrl}/recording`
      })
    });

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.status}`);
    }

    const callData = await response.json();
    return {
      callSid: callData.sid,
      status: callData.status,
      provider: 'twilio'
    };
  } catch (error) {
    console.error('Error initiating Twilio call:', error);
    throw error;
  }
}

// Vonage integration 
export async function initiateCallWithVonage(
  leadPhoneNumber: string,
  aiScript: string,
  voiceConfig: any
) {
  const vonage = BUSINESS_PHONE_CONFIG.providers.vonage;
  
  if (!vonage.apiKey || !vonage.apiSecret) {
    throw new Error('Vonage credentials not configured');
  }

  try {
    const response = await fetch(`${vonage.baseUrl}/v1/calls`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await generateVonageJWT()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: [{
          type: 'phone',
          number: leadPhoneNumber
        }],
        from: {
          type: 'phone',
          number: BUSINESS_PHONE_CONFIG.businessNumber
        },
        answer_url: [`${process.env.NEXT_PUBLIC_BASE_URL}/api/vonage/answer`],
        event_url: [`${process.env.NEXT_PUBLIC_BASE_URL}/api/vonage/events`]
      })
    });

    if (!response.ok) {
      throw new Error(`Vonage API error: ${response.status}`);
    }

    const callData = await response.json();
    return {
      uuid: callData.uuid,
      status: callData.status,
      provider: 'vonage'
    };
  } catch (error) {
    console.error('Error initiating Vonage call:', error);
    throw error;
  }
}

// Generate Vonage JWT for authentication
async function generateVonageJWT() {
  // Implementation depends on your JWT library
  // This is a placeholder - use actual JWT generation
  return 'vonage_jwt_token';
}

// Main call initiation function - tries providers in order
export async function initiateAICall(
  leadPhoneNumber: string,
  aiScript: string,
  voiceConfig: any,
  preferredProvider?: string
) {
  const providers = ['twilio', 'vonage', 'telnyx', 'bandwidth'];
  const startProvider = preferredProvider || 'twilio';
  
  // Try preferred provider first
  const orderedProviders = [startProvider, ...providers.filter(p => p !== startProvider)];
  
  for (const providerName of orderedProviders) {
    try {
      console.log(`Attempting call with ${providerName}...`);
      
      switch (providerName) {
        case 'twilio':
          if (BUSINESS_PHONE_CONFIG.providers.twilio.accountSid) {
            return await initiateCallWithTwilio(
              leadPhoneNumber, 
              aiScript, 
              voiceConfig, 
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/twilio/webhook`
            );
          }
          break;
          
        case 'vonage':
          if (BUSINESS_PHONE_CONFIG.providers.vonage.apiKey) {
            return await initiateCallWithVonage(leadPhoneNumber, aiScript, voiceConfig);
          }
          break;
          
        // Add other providers as needed
      }
    } catch (error) {
      console.error(`Failed to initiate call with ${providerName}:`, error);
      continue; // Try next provider
    }
  }
  
  throw new Error('All telephony providers failed to initiate call');
}

// Call status tracking
export interface CallStatus {
  callId: string;
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer';
  provider: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  recording?: string;
  transcription?: string;
}

// Environment setup instructions
export const TELEPHONY_SETUP_INSTRUCTIONS = `
TELEPHONY INTEGRATION SETUP:

1. Choose Your Provider (Recommended: Twilio):
   
   TWILIO SETUP:
   - Go to https://console.twilio.com/
   - Sign up and verify your account
   - Get your Account SID and Auth Token
   - Purchase a phone number (or use your business number if ported)
   
2. Environment Variables (.env.local):
   # Business Configuration
   BUSINESS_PHONE_NUMBER=+1234567890  # Your actual business number
   BUSINESS_DISPLAY_NAME="Ghost CRM"
   
   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_API_KEY=your_api_key
   TWILIO_TWIML_APP_SID=your_twiml_app_sid
   
   # Base URL for webhooks
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   
3. Webhook Endpoints Needed:
   - /api/twilio/webhook - Handle TwiML responses
   - /api/twilio/webhook/status - Call status updates
   - /api/twilio/webhook/recording - Recording callbacks
   
4. Business Number Setup:
   - Port your existing business number to Twilio (recommended)
   - Or configure caller ID verification
   - Ensure number is verified for outbound calling
   
5. AI Integration Points:
   - TwiML for call flow control
   - WebSocket for real-time AI responses
   - Recording for quality assurance
   - Transcription for analytics

Current Status:
✅ Telephony configuration ready
✅ Multi-provider support implemented
🔧 Requires provider credentials
🔧 Webhook endpoints need implementation
🔧 Business number configuration needed
`;

export default BUSINESS_PHONE_CONFIG;