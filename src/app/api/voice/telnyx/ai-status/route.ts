// Telnyx AI Call Status Handler - Tracks call events and outcomes
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Telnyx AI Status Webhook:', body);
    
    const event = body.data;
    const eventType = event.event_type;
    const callId = event.id;
    
    // Handle different Telnyx call events
    switch (eventType) {
      case 'call.initiated':
        console.log(`AI call ${callId} initiated to ${event.to}`);
        await handleCallInitiated(event);
        break;
        
      case 'call.ringing':
        console.log(`AI call ${callId} is ringing...`);
        await handleCallRinging(event);
        break;
        
      case 'call.answered':
        console.log(`AI call ${callId} answered - conversation will begin`);
        await handleCallAnswered(event);
        break;
        
      case 'call.hangup':
        console.log(`AI call ${callId} ended - duration: ${event.call_duration_secs}s`);
        await handleCallEnded(event);
        break;
        
      case 'call.machine.detection.ended':
        console.log(`AI call ${callId} machine detection: ${event.machine_detection_result}`);
        const machineResponse = await handleMachineDetection(event);
        if (machineResponse && 'commands' in machineResponse && machineResponse.commands) {
          console.log('🎮 [AI-STATUS] Returning AI commands from machine detection');
          return NextResponse.json(machineResponse);
        }
        console.log('🚫 [AI-STATUS] No commands returned from machine detection');
        break;
        
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
    const result = event.machine_detection_result; // 'human', 'machine', or 'unknown'
    
    console.log('🤖 [MACHINE-DETECTION] Processing result:', {
      callId: event.id,
      result: result,
      eventData: JSON.stringify(event, null, 2)
    });
    
    // If human detected, return AI commands immediately
    if (result === 'human' || result === undefined || result === 'unknown') {
      console.log('🗣️ [MACHINE-DETECTION] Human detected - generating AI commands:', event.id);
      
      const aiCommands = {
        success: true,
        commands: [
          {
            command: 'speak',
            text: "Hello! Thank you for answering. I'm Sarah, an AI assistant calling about your interest in our services. How are you doing today?",
            voice: 'female'
          },
          {
            command: 'gather_using_speech',
            speech_timeout: 10000,
            speech_end_timeout: 2000,
            language: 'en-US',
            webhook_url: 'https://ghostcrm.ai/api/voice/telnyx/ai-response'
          }
        ]
      };
      
      console.log('🎮 [MACHINE-DETECTION] Generated AI commands:', JSON.stringify(aiCommands, null, 2));
      return aiCommands;
    } else {
      console.log('🤖 [MACHINE-DETECTION] Machine detected, not starting AI conversation');
      return { success: true, message: 'Machine detected' };
    }
    
    // TODO: Update call record with machine detection result
    /*
    await supabaseAdmin.from('ai_call_logs')
      .update({ 
        answered_by: result,
        updated_at: new Date().toISOString()
      })
      .eq('call_id', event.id);
    */
    
  } catch (error) {
    console.error('❌ [MACHINE-DETECTION] Error handling machine detection:', error);
    // Return error but allow fallback
    return { success: false, error: error.message };
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