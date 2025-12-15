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
        await handleMachineDetection(event);
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
      const aiHandlerUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/telnyx/ai-answer`;
      console.log('🔗 [AI-STATUS] Forwarding to:', aiHandlerUrl);
      
      const response = await fetch(aiHandlerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: event
        })
      });
      
      const responseText = await response.text();
      console.log('🔍 [AI-STATUS] AI handler response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      
      if (!response.ok) {
        console.error('❌ [AI-STATUS] Failed to forward to AI handler:', response.statusText);
      } else {
        console.log('✅ [AI-STATUS] Successfully forwarded to AI handler');
      }
    } catch (forwardError) {
      console.error('❌ [AI-STATUS] Error forwarding to AI handler:', forwardError);
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
    
    console.log('Machine detection result:', {
      callId: event.id,
      result: result
    });
    
    // If human detected, start AI conversation
    if (result === 'human') {
      console.log('🤖 [AI-STATUS] Human detected, forwarding to AI handler:', event.id);
      
      try {
        const aiHandlerUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/telnyx/ai-answer`;
        console.log('🔗 [AI-STATUS] Forwarding to:', aiHandlerUrl);
        
        const response = await fetch(aiHandlerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              ...event,
              event_type: 'call.answered' // Simulate answered event for AI handler
            }
          })
        });
        
        const responseText = await response.text();
        console.log('🔍 [AI-STATUS] AI handler response:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });
        
        if (!response.ok) {
          console.error('❌ [AI-STATUS] Failed to forward to AI handler:', response.statusText);
        } else {
          console.log('✅ [AI-STATUS] Successfully forwarded to AI handler');
        }
      } catch (forwardError) {
        console.error('❌ [AI-STATUS] Error forwarding to AI handler:', forwardError);
      }
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
    console.error('Error handling machine detection:', error);
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

// Health check endpoint
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    status: 'Telnyx AI Status Handler Active',
    timestamp: new Date().toISOString() 
  });
}