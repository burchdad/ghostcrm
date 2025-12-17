import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Extract event data
    const payload = body.payload || body.data || body;
    const eventType = body.event_type || payload.event_type;
    
    console.log('🔍 [DEBUG-WEBHOOK] Received event:', eventType);
    console.log('🔍 [DEBUG-WEBHOOK] Full body:', JSON.stringify(body, null, 2));
    
    if (eventType === 'call.machine.detection.ended') {
      const result = payload.result || payload.machine_detection_result;
      console.log('🤖 [DEBUG-WEBHOOK] Machine detection result:', result);
      
      if (result === 'human' || result === undefined || result === 'unknown') {
        console.log('🗣️ [DEBUG-WEBHOOK] Human detected - generating test response');
        
        const testResponse = {
          success: true,
          commands: [
            {
              command: 'speak',
              text: "Hello! This is a test response from the debug webhook. Can you hear me?",
              voice: 'female',
              service_level: "basic"
            },
            {
              command: 'gather_using_speech',
              speech_timeout: 8000,
              speech_end_timeout: 1500,
              language: 'en-US',
              webhook_url: 'https://ghostcrm.ai/api/voice/telnyx/ai-response',
              inter_digit_timeout: 5000,
              valid_digits: "1234567890*#"
            }
          ]
        };
        
        console.log('📤 [DEBUG-WEBHOOK] Test response being sent:', JSON.stringify(testResponse, null, 2));
        
        const response = NextResponse.json(testResponse);
        console.log('📤 [DEBUG-WEBHOOK] Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
        console.log('📤 [DEBUG-WEBHOOK] Response status:', response.status);
        
        return response;
      } else {
        console.log('🤖 [DEBUG-WEBHOOK] Machine detected, hanging up');
        return NextResponse.json({
          success: true,
          commands: [
            {
              command: 'hangup'
            }
          ]
        });
      }
    }
    
    console.log('📝 [DEBUG-WEBHOOK] Non-machine-detection event, returning basic response');
    return NextResponse.json({ 
      success: true, 
      message: 'Debug webhook processed event' 
    });
    
  } catch (error) {
    console.error('❌ [DEBUG-WEBHOOK] Error:', error);
    return NextResponse.json(
      { error: 'Debug webhook error' }, 
      { status: 500 }
    );
  }
}