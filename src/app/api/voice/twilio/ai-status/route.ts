// AI Call Status Handler - Tracks call progression and outcomes
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const callData = {
      callSid: formData.get('CallSid') as string,
      accountSid: formData.get('AccountSid') as string,
      from: formData.get('From') as string,
      to: formData.get('To') as string,
      callStatus: formData.get('CallStatus') as string,
      direction: formData.get('Direction') as string,
      timestamp: formData.get('Timestamp') as string,
      callDuration: formData.get('CallDuration') as string,
      answeredBy: formData.get('AnsweredBy') as string,
    };

    console.log('AI Call Status Update:', callData);

    // Update call record in database
    await updateAICallRecord(callData);
    
    // Handle specific call status events
    switch (callData.callStatus) {
      case 'ringing':
        console.log(`AI call ${callData.callSid} is ringing...`);
        break;
        
      case 'in-progress':
        console.log(`AI call ${callData.callSid} answered - conversation beginning`);
        break;
        
      case 'completed':
        console.log(`AI call ${callData.callSid} completed - duration: ${callData.callDuration}s`);
        await handleCallCompletion(callData);
        break;
        
      case 'failed':
      case 'busy':
      case 'no-answer':
        console.log(`AI call ${callData.callSid} failed - status: ${callData.callStatus}`);
        await handleCallFailure(callData);
        break;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Status update processed' 
    });

  } catch (error) {
    console.error('Error processing call status:', error);
    return NextResponse.json(
      { error: 'Failed to process status update' }, 
      { status: 500 }
    );
  }
}

// Update call record in database
async function updateAICallRecord(callData: any) {
  try {
    // TODO: Update your database with call information
    // This would integrate with your existing database schema
    console.log('Updating call record:', {
      callSid: callData.callSid,
      status: callData.callStatus,
      duration: callData.callDuration,
      answeredBy: callData.answeredBy
    });
    
    // Example database update (adjust based on your schema):
    /*
    await supabaseAdmin.from('ai_call_logs').upsert({
      call_sid: callData.callSid,
      phone_number: callData.to,
      status: callData.callStatus,
      duration: parseInt(callData.callDuration || '0'),
      answered_by: callData.answeredBy,
      updated_at: new Date().toISOString()
    });
    */
    
  } catch (error) {
    console.error('Error updating call record:', error);
  }
}

// Handle successful call completion
async function handleCallCompletion(callData: any) {
  const duration = parseInt(callData.callDuration || '0');
  
  // Categorize call outcome based on duration
  let outcome = 'unknown';
  if (duration < 10) {
    outcome = 'hung_up_early';
  } else if (duration < 60) {
    outcome = 'brief_conversation';
  } else {
    outcome = 'full_conversation';
  }
  
  console.log(`Call completed with outcome: ${outcome} (${duration}s)`);
  
  // TODO: Update lead status based on call outcome
  // TODO: Schedule follow-up actions if needed
  // TODO: Send notifications to sales team
}

// Handle call failures
async function handleCallFailure(callData: any) {
  const failureReason = callData.callStatus;
  
  console.log(`Call failed: ${failureReason}`);
  
  // TODO: Schedule retry based on failure reason
  // TODO: Update lead with call attempt
  // TODO: Notify sales team if multiple failures
  
  // Retry logic based on failure type
  if (failureReason === 'busy' || failureReason === 'no-answer') {
    // Schedule retry in 2-4 hours
    console.log('Scheduling retry for busy/no-answer');
  } else if (failureReason === 'failed') {
    // Check if it's a permanent failure or temporary
    console.log('Call failed - investigating cause');
  }
}

export async function GET(req: NextRequest) {
  // Health check endpoint
  return NextResponse.json({ 
    status: 'AI Call Status Handler Active',
    timestamp: new Date().toISOString() 
  });
}