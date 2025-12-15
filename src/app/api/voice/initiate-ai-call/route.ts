// AI Call Initiation API - Integrates with existing telephony infrastructure
import { NextRequest, NextResponse } from 'next/server';
import { getOrgProviderAccount } from '@/lib/telephony/store';
import { telnyxVoice } from '@/lib/telephony/providers/telnyx';
import jwt from 'jsonwebtoken';

// Force dynamic rendering for production
export const dynamic = 'force-dynamic';

// Helper function to sanitize text for telephony APIs
function sanitizeTextForTelephony(text: string): string {
  return text
    // Remove emojis and special Unicode characters
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    // Remove other problematic characters
    .replace(/[^\x20-\x7E\s]/g, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function to format phone numbers to E.164 format
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 1 and is 11 digits, add + prefix
  if (digits.length === 11 && digits.startsWith('1')) {
    return '+' + digits;
  }
  
  // If it's 10 digits, assume US and add +1 prefix
  if (digits.length === 10) {
    return '+1' + digits;
  }
  
  // If it already starts with + and has digits, return as is
  if (phone.startsWith('+') && digits.length >= 10) {
    return phone;
  }
  
  // Default: add +1 prefix (assuming US number)
  return '+1' + digits;
}

export async function POST(request: NextRequest) {
  try {
    // Get JWT token from cookies (same as middleware)
    const token = request.cookies.get("ghostcrm_jwt")?.value;
    
    if (!token) {
      console.error('❌ [VOICE API] No JWT token found');
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Decode JWT token
    let user;
    let orgId;
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
      }
      
      const decoded = jwt.verify(token, jwtSecret) as any;
      user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
      orgId = decoded.organizationId || decoded.tenantId;
      
      console.log('🔍 [VOICE API] JWT authentication successful:', {
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        orgId: orgId
      });
    } catch (jwtError) {
      console.error('❌ [VOICE API] JWT verification failed:', jwtError);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    const { 
      to, 
      leadData, 
      aiConfig
    } = await request.json();

    if (!to || !leadData || !aiConfig) {
      return NextResponse.json(
        { error: 'Missing required parameters: to, leadData, aiConfig' },
        { status: 400 }
      );
    }

    if (!orgId) {
      console.error('❌ [VOICE API] No organization ID found in token');
      return NextResponse.json(
        { error: 'No organization found for authenticated user' },
        { status: 401 }
      );
    }

    // Get organization's telephony configuration
    // For now, use environment variables directly since Telnyx is configured
    const telnyxApiKey = process.env.TELNYX_API_KEY;
    const telnyxConnectionId = process.env.TELNYX_CONNECTION_ID;
    const telnyxPhoneNumber = process.env.TELNYX_PHONE_NUMBER || process.env.BUSINESS_PHONE_NUMBER;
    
    console.log('🔧 [TELNYX CONFIG] Checking environment variables:', {
      apiKey: telnyxApiKey ? 'Present' : 'Missing',
      connectionId: telnyxConnectionId ? 'Present' : 'Missing', 
      phoneNumber: telnyxPhoneNumber ? telnyxPhoneNumber : 'Missing',
      env: process.env.NODE_ENV || 'development'
    });
    
    const providerAccount = {
      slug: 'telnyx',
      type: 'telnyx',
      meta: {
        apiKey: telnyxApiKey,
        connectionId: telnyxConnectionId,
        defaultFrom: telnyxPhoneNumber
      }
    };

    if (!providerAccount.meta.apiKey || !providerAccount.meta.connectionId || !providerAccount.meta.defaultFrom) {
      console.error('❌ [TELNYX CONFIG] Missing required configuration:', {
        apiKey: !!providerAccount.meta.apiKey,
        connectionId: !!providerAccount.meta.connectionId,
        defaultFrom: !!providerAccount.meta.defaultFrom,
        availableEnvVars: Object.keys(process.env).filter(key => key.includes('TELNYX'))
      });
      return NextResponse.json(
        { error: 'Failed to initiate call. Please check your telephony configuration.' },
        { status: 500 }
      );
    }

    console.log('📞 Using Telnyx provider for organization:', orgId);
    console.log('📞 [TELNYX CONFIG] Final configuration:', {
      provider: providerAccount.slug,
      hasApiKey: !!providerAccount.meta.apiKey,
      hasConnectionId: !!providerAccount.meta.connectionId,
      fromNumber: providerAccount.meta.defaultFrom
    });

    // Use configured business phone number or environment fallback
    const fromNumber = providerAccount.meta.defaultFrom;
    
    if (!fromNumber) {
      console.error('❌ [TELNYX CONFIG] No phone number configured');
      return NextResponse.json(
        { error: 'No business phone number configured for calls.' },
        { status: 500 }
      );
    }
    
    // Format the destination phone number to E.164 format
    const formattedToNumber = formatPhoneNumber(to);
    console.log('📞 [PHONE FORMAT] Phone number formatting:', { 
      original: to, 
      formatted: formattedToNumber,
      fromNumber: fromNumber
    });
    
    // Validate phone numbers
    if (!formattedToNumber || formattedToNumber.length < 10) {
      console.error('❌ [PHONE FORMAT] Invalid destination number:', formattedToNumber);
      return NextResponse.json(
        { error: 'Invalid phone number format. Please check the number and try again.' },
        { status: 400 }
      );
    }

    // Initiate call based on provider type
    let callResult;
    console.log('🚀 Initiating AI call via:', providerAccount.slug);
    
    switch (providerAccount.slug) {
      case 'twilio':
        callResult = await initiateTwilioAICall(
          providerAccount,
          fromNumber,
          to,
          aiConfig,
          leadData
        );
        break;
      
      case 'telnyx':
        callResult = await initiateTelnyxAICall(
          providerAccount,
          orgId,
          fromNumber,
          formattedToNumber,
          aiConfig,
          leadData
        );
        break;
        
      default:
        return NextResponse.json(
          { error: `Provider ${providerAccount.slug} not supported for AI calls` },
          { status: 400 }
        );
    }

    // Log call initiation for tracking
    console.log('AI Call initiated:', {
      provider: providerAccount.slug,
      from: fromNumber,
      to: to,
      leadName: leadData.name,
      voice: aiConfig.voice.name,
      language: aiConfig.voice.language,
      callId: callResult.callId
    });

    return NextResponse.json({
      success: true,
      callId: callResult.callId,
      provider: providerAccount.slug,
      status: 'initiated',
      message: `AI call initiated to ${leadData.name} using ${aiConfig.voice.name} voice`
    });

  } catch (error) {
    console.error('Error initiating AI call:', error);
    return NextResponse.json(
      { error: 'Internal server error during call initiation' },
      { status: 500 }
    );
  }
}

// Twilio AI call initiation
async function initiateTwilioAICall(
  providerAccount: any,
  fromNumber: string,
  toNumber: string,
  aiConfig: any,
  leadData: any
) {
  const { accountSid, authToken } = providerAccount.secrets;
  
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured');
  }

  // Create TwiML script URL with AI configuration embedded
  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/twilio/ai-answer`;
  const aiScript = encodeURIComponent(aiConfig.script || '');
  const voiceConfig = encodeURIComponent(JSON.stringify(aiConfig.voice || {}));
  const leadDataString = encodeURIComponent(JSON.stringify(leadData));
  
  const twimlUrl = `${webhookUrl}?script=${aiScript}&voice=${voiceConfig}&lead=${leadDataString}&mode=${aiConfig.personalityMode || 'professional'}`;

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'From': fromNumber,
        'To': toNumber,
        'Url': twimlUrl,
        'StatusCallback': `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/twilio/ai-status`,
        'StatusCallbackEvent': 'initiated,ringing,answered,completed',
        'Record': 'true',
        'RecordingStatusCallback': `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/twilio/ai-recording`,
        'Timeout': '30', // Ring timeout
        'MachineDetection': 'Enable', // Detect answering machines
        'MachineDetectionTimeout': '5'
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twilio API error: ${response.status} - ${error}`);
  }

  const callData = await response.json();
  return {
    callId: callData.sid,
    status: callData.status
  };
}
async function initiateTelnyxAICall(
  providerAccount: any,
  orgId: string,
  fromNumber: string,
  toNumber: string,
  aiConfig: any,
  leadData: any
) {
  try {
    console.log('📞 Initiating Telnyx AI call...');
    
    // Sanitize the script to remove emojis and problematic characters
    const sanitizedConfig = {
      ...aiConfig,
      script: sanitizeTextForTelephony(aiConfig.script)
    };
    
    console.log('🧹 Sanitized script:', sanitizedConfig.script);
    
    // Create voice adapter using existing telephony infrastructure
    const voiceAdapter = telnyxVoice(providerAccount);
    
    // Use configured phone number
    const businessNumber = fromNumber;

    // Prepare webhook and client state for AI conversation
    const meta = {
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/telnyx/ai-answer`,
      clientState: {
        voiceConfig: sanitizedConfig,
        leadData: leadData,
        leadPhone: toNumber,
        timestamp: new Date().toISOString()
      },
      telnyxOptions: {
        // Enable machine detection
        answering_machine_detection: 'detect',
        // Enable call recording
        record: 'record-from-answer',
        record_format: 'mp3',
        record_max_length: 300, // 5 minutes max
        record_timeout: 10,
        // Status callbacks
        command_id: `ai-call-${Date.now()}`,
        webhook_url_method: 'POST'
      }
    };

    console.log('📞 Placing call with meta:', JSON.stringify(meta, null, 2));

    // Place the call using existing telephony infrastructure
    const result = await voiceAdapter.placeCall({
      orgId,
      from: businessNumber,
      to: toNumber,
      meta
    });

    console.log('📞 Telnyx call result:', result);

    if (!result.ok) {
      const errorMessage = 'error' in result ? result.error : 'Unknown error from Telnyx';
      console.error('❌ Telnyx API error details:', {
        error: errorMessage,
        result: result,
        requestData: {
          from: businessNumber,
          to: toNumber,
          connectionId: process.env.TELNYX_CONNECTION_ID,
          webhookUrl: meta.webhookUrl
        }
      });
      throw new Error(errorMessage);
    }

    return {
      callId: result.providerId || 'unknown',
      status: 'initiated'
    };

  } catch (error: any) {
    console.error('❌ Telnyx call initiation error:', error);
    throw new Error(`Failed to initiate Telnyx call: ${error.message}`);
  }
}


// GET endpoint to check call status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callId = searchParams.get('callId');
  
  if (!callId) {
    return NextResponse.json({ error: 'Missing callId parameter' }, { status: 400 });
  }

  // TODO: Implement call status checking based on provider
  return NextResponse.json({
    callId,
    status: 'in-progress',
    message: 'Call status checking not yet implemented'
  });
}