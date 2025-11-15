import { NextRequest, NextResponse } from "next/server";
import Telnyx from "telnyx";
import { supaFromReq } from "@/lib/supa-ssr";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { s, res } = supaFromReq(req);
    const { to, script, leadId } = await req.json();
    
    if (!to || !script) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    // Get Telnyx configuration from environment
    const apiKey = process.env.TELNYX_API_KEY;
    const connectionId = process.env.TELNYX_CONNECTION_ID;
    const from = process.env.TELNYX_PHONE_NUMBER || process.env.BUSINESS_PHONE_NUMBER;

    if (!apiKey || !connectionId || !from) {
      return NextResponse.json({ 
        error: "Telnyx configuration missing. Please check your environment variables." 
      }, { status: 500 });
    }

    // Initialize Telnyx client
    const client = Telnyx(apiKey);

    // Create webhook URL for handling call events
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/voice/telnyx/webhook`;

    // Prepare call options
    const callOptions = {
      to,
      from,
      connection_id: connectionId,
      webhook_url: webhookUrl,
      webhook_url_method: 'POST',
      client_state: btoa(JSON.stringify({ 
        script, 
        leadId,
        timestamp: Date.now() 
      })),
      // Enable recording if needed
      record: 'record-on-answer',
      record_channels: 'dual',
      record_format: 'mp3'
    };

    console.log('🔗 [TELNYX] Initiating call with options:', {
      to,
      from,
      connection_id: connectionId,
      webhook_url: webhookUrl
    });

    // Create the call
    const call = await client.calls.create(callOptions);

    console.log('✅ [TELNYX] Call initiated successfully:', call.data);

    // Log the call attempt in the database
    if (leadId) {
      try {
        await s.from('call_logs').insert({
          lead_id: leadId,
          phone_number: to,
          call_id: call.data.id,
          status: 'initiated',
          provider: 'telnyx',
          script: script,
          created_at: new Date().toISOString()
        });
      } catch (dbError) {
        console.error('⚠️ [TELNYX] Failed to log call in database:', dbError);
        // Continue execution even if logging fails
      }
    }

    return NextResponse.json({ 
      ok: true, 
      callId: call.data.id,
      status: call.data.status,
      provider: 'telnyx'
    }, { headers: res.headers });

  } catch (error: any) {
    console.error('❌ [TELNYX] Error initiating call:', error);
    
    return NextResponse.json({ 
      error: error?.message || "Failed to initiate call",
      details: error?.code || "unknown_error"
    }, { status: 500 });
  }
}