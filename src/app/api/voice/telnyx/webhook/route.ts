import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data } = body;
    
    if (!data || !data.event_type) {
      return NextResponse.json({ message: "Invalid webhook payload" }, { status: 400 });
    }

    const { event_type, payload } = data;
    console.log(`📞 [TELNYX_WEBHOOK] Received event: ${event_type}`, payload);

    switch (event_type) {
      case 'call.initiated':
        await handleCallInitiated(payload);
        break;
        
      case 'call.answered':
        await handleCallAnswered(payload);
        break;
        
      case 'call.ended':
        await handleCallEnded(payload);
        break;
        
      case 'call.recording.saved':
        await handleRecordingSaved(payload);
        break;
        
      default:
        console.log(`🔍 [TELNYX_WEBHOOK] Unhandled event type: ${event_type}`);
        break;
    }

    return NextResponse.json({ message: "Webhook processed successfully" });

  } catch (error: any) {
    console.error('❌ [TELNYX_WEBHOOK] Error processing webhook:', error);
    return NextResponse.json({ 
      error: "Failed to process webhook" 
    }, { status: 500 });
  }
}

async function handleCallInitiated(payload: any) {
  const { call_control_id, call_session_id, client_state } = payload;
  
  try {
    // Decode client state to get script and lead info
    const state = client_state ? JSON.parse(atob(client_state)) : {};
    
    console.log('📞 [TELNYX] Call initiated:', { call_control_id, state });
    
    // Update call log with control ID
    if (state.leadId) {
      await supabaseAdmin
        .from('call_logs')
        .update({ 
          call_control_id,
          call_session_id,
          status: 'ringing' 
        })
        .eq('lead_id', state.leadId)
        .eq('status', 'initiated');
    }
  } catch (error) {
    console.error('❌ [TELNYX] Error handling call initiated:', error);
  }
}

async function handleCallAnswered(payload: any) {
  const { call_control_id, client_state } = payload;
  
  try {
    // Decode client state to get the script
    const state = client_state ? JSON.parse(atob(client_state)) : {};
    const script = state.script || "Hello, this is GhostCRM calling to follow up on your inquiry.";
    
    console.log('📞 [TELNYX] Call answered, playing script:', script);
    
    // Use Telnyx Call Control API to speak the script
    const speakCommand = {
      call_control_id,
      payload: script,
      voice: 'female',
      language: 'en-US'
    };
    
    // Send speak command (this would require Telnyx Call Control API)
    // For now, we'll just log and update the status
    
    // Update call log
    if (state.leadId) {
      await supabaseAdmin
        .from('call_logs')
        .update({ 
          status: 'answered',
          answered_at: new Date().toISOString()
        })
        .eq('call_control_id', call_control_id);
    }
    
  } catch (error) {
    console.error('❌ [TELNYX] Error handling call answered:', error);
  }
}

async function handleCallEnded(payload: any) {
  const { call_control_id, hangup_cause, call_duration_secs } = payload;
  
  try {
    console.log('📞 [TELNYX] Call ended:', { 
      call_control_id, 
      hangup_cause, 
      duration: call_duration_secs 
    });
    
    // Update call log with final status
    await supabaseAdmin
      .from('call_logs')
      .update({ 
        status: 'ended',
        hangup_cause,
        duration_seconds: call_duration_secs,
        ended_at: new Date().toISOString()
      })
      .eq('call_control_id', call_control_id);
      
  } catch (error) {
    console.error('❌ [TELNYX] Error handling call ended:', error);
  }
}

async function handleRecordingSaved(payload: any) {
  const { call_control_id, recording_urls } = payload;
  
  try {
    console.log('🎙️ [TELNYX] Recording saved:', recording_urls);
    
    // Update call log with recording URL
    await supabaseAdmin
      .from('call_logs')
      .update({ 
        recording_url: recording_urls?.mp3 || recording_urls?.[0],
        has_recording: true
      })
      .eq('call_control_id', call_control_id);
      
  } catch (error) {
    console.error('❌ [TELNYX] Error handling recording saved:', error);
  }
}