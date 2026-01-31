import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = {
    hasApiKey: !!process.env.TELNYX_API_KEY,
    hasConnectionId: !!process.env.TELNYX_CONNECTION_ID,  
    hasPhoneNumber: !!process.env.TELNYX_PHONE_NUMBER,
    hasMessagingProfile: !!process.env.TELNYX_MESSAGING_PROFILE_ID,
    apiKeyPreview: process.env.TELNYX_API_KEY ? 
      `${process.env.TELNYX_API_KEY.substring(0, 8)}...` : 
      'Not set',
    phoneNumber: process.env.TELNYX_PHONE_NUMBER || 'Not set',
    connectionIdPreview: process.env.TELNYX_CONNECTION_ID ?
      `${process.env.TELNYX_CONNECTION_ID.substring(0, 8)}...` : 
      'Not set'
  };
  
  const allConfigured = config.hasApiKey && 
                       config.hasConnectionId && 
                       config.hasPhoneNumber && 
                       config.hasMessagingProfile;
  
  return NextResponse.json({
    status: allConfigured ? 'Ready' : 'Incomplete',
    configuration: config,
    message: allConfigured ? 
      'All Telnyx credentials are configured!' : 
      'Some Telnyx credentials are missing. Check your .env.local file.'
  });
}