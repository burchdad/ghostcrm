// Telnyx AI Call Status Handler - Tracks call events and outcomes
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Telnyx AI Status Webhook:', JSON.stringify(body, null, 2));
    
    // Handle both direct event format and nested format
    const event = body.data ? body.data : body;
    const payload = event.payload || event;
    const eventType = event.event_type || body.event_type;
    const callId = payload.call_control_id || payload.id || event.id;
    
    console.log('🔍 [AI-STATUS] Processed event:', {
      eventType,
      callId,
      hasPayload: !!event.payload,
      bodyKeys: Object.keys(body),
      eventKeys: Object.keys(event),
      payloadKeys: Object.keys(payload)
    });
    
    // Handle different Telnyx call events
    switch (eventType) {
      case 'call.initiated':
        console.log(`AI call ${callId} initiated to ${payload.to}`);
        await handleCallInitiated(payload);
        break;
        
      case 'call.ringing':
        console.log(`AI call ${callId} is ringing...`);
        await handleCallRinging(payload);
        break;
        
      case 'call.answered':
        console.log(`AI call ${callId} answered - conversation will begin`);
        await handleCallAnswered(payload);
        break;
        
      case 'call.hangup':
        console.log(`AI call ${callId} ended - duration: ${payload.call_duration_secs}s`);
        await handleCallEnded(payload);
        break;
        
      case 'call.machine.detection.ended':
        console.log(`AI call ${callId} machine detection: ${payload.result}`);
        const machineResponse = await handleMachineDetection(payload);
        console.log('🔍 [AI-STATUS] Machine detection response:', JSON.stringify(machineResponse, null, 2));
        
        // CRITICAL: Always return the machine detection response immediately
        // This ensures AI commands are delivered to Telnyx to start the conversation
        if (machineResponse) {
          console.log('🎮 [AI-STATUS] Returning machine detection response to Telnyx');
          console.log('📤 [AI-STATUS] Response payload:', JSON.stringify(machineResponse, null, 2));
          return NextResponse.json(machineResponse);
        } else {
          console.log('🚫 [AI-STATUS] No response from machine detection handler - this should not happen');
          // Return fallback response to ensure something is sent to Telnyx
          return NextResponse.json({
            success: true,
            commands: [
              {
                command: 'hangup'
              }
            ],
            message: 'No machine detection response'
          });
        }
        
      default:
        console.log(`Unhandled Telnyx event: ${eventType}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Status update processed' 
    });

  } catch (error) {
    console.error('Error processing Telnyx call status:', error);
    return NextResponse.json(
      { error: 'Failed to process status update' }, 
      { status: 500 }
    );
  }
}

// Handle call initiated event
async function handleCallInitiated(event: any) {
  try {
    // TODO: Update your database with call initiation
    console.log('Call initiated:', {
      callId: event.id,
      to: event.to,
      from: event.from,
      status: 'initiated'
    });
    
    // Example database update:
    /*
    await supabaseAdmin.from('ai_call_logs').insert({
      call_id: event.id,
      phone_number: event.to,
      from_number: event.from,
      status: 'initiated',
      provider: 'telnyx',
      created_at: new Date().toISOString()
    });
    */
    
  } catch (error) {
    console.error('Error handling call initiated:', error);
  }
}

// Handle call ringing event
async function handleCallRinging(event: any) {
  try {
    console.log('Call ringing:', event.id);
    
    // TODO: Update call status to ringing
    /*
    await supabaseAdmin.from('ai_call_logs')
      .update({ 
        status: 'ringing',
        updated_at: new Date().toISOString()
      })
      .eq('call_id', event.id);
    */
    
  } catch (error) {
    console.error('Error handling call ringing:', error);
  }
}

// Handle call answered event
async function handleCallAnswered(event: any) {
  try {
    console.log('Call answered:', {
      callId: event.id,
      answeredBy: event.answered_by || 'unknown'
    });
    
    // Forward to AI conversation handler when call is answered
    console.log('🤖 [AI-STATUS] Forwarding answered call to AI handler:', event.id);
    
    try {
      // TEMPORARY FIX: Hardcode correct domain until Vercel env var is set
      const baseUrl = 'https://ghostcrm.ai';
      const aiHandlerUrl = `${baseUrl}/api/voice/telnyx/ai-answer`;
      console.log('🔗 [AI-STATUS] Forwarding to:', aiHandlerUrl);
      
      const response = await fetch(aiHandlerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GhostCRM-Webhook-Forwarder/1.0',
        },
        body: JSON.stringify({
          data: event,
          meta: {
            forwarded_from: 'ai-status',
            original_event_type: event.event_type,
            forward_timestamp: new Date().toISOString()
          }
        })
      });
      
      const responseText = await response.text();
      console.log('🔍 [AI-STATUS] AI handler response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText.substring(0, 500) // Truncate long responses
      });
      
      if (!response.ok) {
        console.error('❌ [AI-STATUS] Failed to forward to AI handler:', response.statusText, responseText);
        // Try alternative approach - direct AI conversation start
        console.log('🔄 [AI-STATUS] Attempting direct AI conversation initiation...');
        await initiateDirectAIConversation(event);
      } else {
        console.log('✅ [AI-STATUS] Successfully forwarded to AI handler');
      }
    } catch (forwardError) {
      console.error('❌ [AI-STATUS] Error forwarding to AI handler:', forwardError);
      // Fallback to direct AI conversation
      console.log('🔄 [AI-STATUS] Attempting fallback AI conversation...');
      await initiateDirectAIConversation(event);
    }
    
    // TODO: Update call status and start tracking conversation
    /*
    await supabaseAdmin.from('ai_call_logs')
      .update({ 
        status: 'answered',
        answered_by: event.answered_by,
        answered_at: new Date().toISOString()
      })
      .eq('call_id', event.id);
    */
    
  } catch (error) {
    console.error('Error handling call answered:', error);
  }
}

// Handle call ended event
async function handleCallEnded(event: any) {
  try {
    const duration = event.call_duration_secs || 0;
    const hangupCause = event.hangup_cause;
    
    console.log('Call ended:', {
      callId: event.id,
      duration: duration,
      cause: hangupCause
    });
    
    // Categorize call outcome based on duration and hangup cause
    let outcome = determineCallOutcome(duration, hangupCause);
    
    console.log(`Call outcome: ${outcome} (${duration}s)`);
    
    // TODO: Update final call record
    /*
    await supabaseAdmin.from('ai_call_logs')
      .update({ 
        status: 'completed',
        duration_seconds: duration,
        hangup_cause: hangupCause,
        outcome: outcome,
        ended_at: new Date().toISOString()
      })
      .eq('call_id', event.id);
    */
    
    // Handle follow-up actions based on outcome
    await handleCallOutcome(event, outcome);
    
  } catch (error) {
    console.error('Error handling call ended:', error);
  }
}

// Handle machine detection results
async function handleMachineDetection(event: any) {
  try {
    const result = event.result || event.machine_detection_result; // Support both possible field names
    
    console.log('🤖 [MACHINE-DETECTION] Processing result:', {
      callId: event.call_control_id || event.id,
      result: result,
      rawEvent: {
        result: event.result,
        machine_detection_result: event.machine_detection_result,
        eventType: event.event_type,
        allKeys: Object.keys(event)
      }
    });
    
    // If human detected, return AI commands immediately
    if (result === 'human' || result === undefined || result === 'unknown') {
      console.log('🗣️ [MACHINE-DETECTION] Human detected - generating AI commands');
      
      // Extract voice configuration from client_state if available
      let voiceConfig: any = {};
      let language = 'en-US';
      let leadData: any = {};
      
      try {
        if (event.client_state) {
          const clientState = JSON.parse(Buffer.from(event.client_state, 'base64').toString());
          console.log('📋 [MACHINE-DETECTION] Parsed client state:', JSON.stringify(clientState, null, 2));
          
          if (clientState.voiceConfig && clientState.voiceConfig.voice) {
            voiceConfig = {
              voice: clientState.voiceConfig.voice.elevenLabsId || 'female'
            };
            language = clientState.voiceConfig.voice.language || 'en-US';
          }
          
          if (clientState.leadData) {
            leadData = clientState.leadData;
          }
        }
      } catch (parseError) {
        console.log('⚠️ [MACHINE-DETECTION] Could not parse client_state, using defaults:', parseError);
      }
      
      // Generate personalized greeting if we have lead data
      let greeting = "Hello! Thank you for answering. I'm Sarah calling about your interest in our services. Can you hear me okay? Please say yes or press 1 if you can hear me.";
      if (leadData.name) {
        greeting = `Hi ${leadData.name}! Thank you for answering. I'm Sarah calling about your interest in our services. Can you hear me okay? Please say yes or press 1 if you can hear me.`;
      }
      
      const aiCommands = {
        success: true,
        commands: [
          {
            command: 'speak',
            text: greeting,
            voice: voiceConfig.voice || 'female',
            service_level: "basic"
          },
          {
            command: 'gather_using_speech',
            speech_timeout: 8000,
            speech_end_timeout: 1500,
            language: language,
            webhook_url: 'https://ghostcrm.ai/api/voice/telnyx/ai-response',
            inter_digit_timeout: 5000,
            valid_digits: "1234567890*#"
          }
        ]
      };
      
      // Validate command structure before returning
      if (!aiCommands.commands || !Array.isArray(aiCommands.commands) || aiCommands.commands.length === 0) {
        console.error('❌ [MACHINE-DETECTION] Invalid AI commands structure!');
        throw new Error('Invalid AI commands structure');
      }
      
      console.log('🎮 [MACHINE-DETECTION] Generated AI commands:', JSON.stringify(aiCommands, null, 2));
      console.log('✨ [MACHINE-DETECTION] SUCCESS: Returning AI commands to start conversation');
      return aiCommands;
    } 
    
    // Machine or voicemail detected
    console.log('🤖 [MACHINE-DETECTION] Machine/voicemail detected, ending call');
    return {
      success: true,
      commands: [
        {
          command: 'hangup'
        }
      ],
      message: 'Machine detected'
    };
    
  } catch (error) {
    console.error('❌ [MACHINE-DETECTION] Error handling machine detection:', error);
    
    // Return fallback AI commands on error - better to try than fail silently
    console.log('🔄 [MACHINE-DETECTION] Returning fallback AI commands due to error');
    return {
      success: true,
      commands: [
        {
          command: 'speak',
          text: "Hello! Thank you for answering. I'm Sarah, an AI assistant. Can you hear me okay? Please say yes or press 1.",
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
  }
}

// Determine call outcome based on duration and hangup cause
function determineCallOutcome(duration: number, hangupCause: string): string {
  if (hangupCause === 'timeout' || hangupCause === 'no_answer') {
    return 'no_answer';
  }
  
  if (hangupCause === 'busy') {
    return 'busy';
  }
  
  if (duration < 10) {
    return 'hung_up_early';
  }
  
  if (duration < 60) {
    return 'brief_conversation';
  }
  
  if (duration >= 60) {
    return 'full_conversation';
  }
  
  return 'unknown';
}

// Handle post-call actions based on outcome
async function handleCallOutcome(event: any, outcome: string) {
  try {
    const callId = event.id;
    const phoneNumber = event.to;
    
    switch (outcome) {
      case 'no_answer':
      case 'busy':
        console.log(`Scheduling retry for ${outcome} - Call ${callId}`);
        // TODO: Schedule retry in 2-4 hours
        break;
        
      case 'hung_up_early':
        console.log(`Call ${callId} ended early - may need different approach`);
        // TODO: Mark lead as requiring different contact method
        break;
        
      case 'brief_conversation':
        console.log(`Call ${callId} had brief conversation - schedule follow-up`);
        // TODO: Schedule follow-up call or email
        break;
        
      case 'full_conversation':
        console.log(`Call ${callId} had full conversation - likely interested`);
        // TODO: Create high-priority lead for sales team
        // TODO: Schedule demo or proposal follow-up
        break;
    }
    
  } catch (error) {
    console.error('Error handling call outcome:', error);
  }
}

// Direct AI conversation initiation fallback
async function initiateDirectAIConversation(event: any) {
  try {
    console.log('🤖 [AI-STATUS] Direct AI conversation initiation for call:', event.id);
    
    // Use Telnyx API to start AI conversation directly
    const response = await fetch('https://api.telnyx.com/v2/ai/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        call_id: event.id,
        message: "Hello! Thank you for answering. I'm an AI assistant calling on behalf of our team. How are you doing today?",
        voice: 'female',
        language: 'en'
      })
    });
    
    if (response.ok) {
      console.log('✅ [AI-STATUS] Direct AI conversation initiated successfully');
    } else {
      const errorText = await response.text();
      console.error('❌ [AI-STATUS] Failed to initiate direct AI conversation:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ [AI-STATUS] Error in direct AI conversation initiation:', error);
  }
}

// Health check endpoint
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    status: 'Telnyx AI Status Handler Active',
    timestamp: new Date().toISOString() 
  });
}