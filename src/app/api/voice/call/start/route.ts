import { NextRequest, NextResponse } from "next/server";
import Telnyx from "telnyx";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!(await isAuthenticated(req))) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return NextResponse.json(
        { error: "User organization not found" },
        { status: 401 }
      );
    }

    const organizationId = user.organizationId;
    const { to, script, leadId } = await req.json();
    
    if (!to || !script) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    // Get Telnyx configuration from environment with detailed logging
    const apiKey = process.env.TELNYX_API_KEY;
    const connectionId = process.env.TELNYX_CONNECTION_ID;
    const from = process.env.TELNYX_PHONE_NUMBER || process.env.BUSINESS_PHONE_NUMBER;

    console.log('🔧 [TELNYX CALL START] Environment check:', {
      hasApiKey: !!apiKey,
      hasConnectionId: !!connectionId,
      hasFromNumber: !!from,
      fromNumber: from,
      nodeEnv: process.env.NODE_ENV,
      availableEnvVars: Object.keys(process.env).filter(key => key.includes('TELNYX')).length
    });

    if (!apiKey || !connectionId || !from) {
      console.error('❌ [TELNYX CALL START] Missing configuration:', {
        apiKey: !!apiKey,
        connectionId: !!connectionId,
        from: !!from,
        allEnvKeys: Object.keys(process.env).filter(key => key.includes('TELNYX'))
      });
      return NextResponse.json({ 
        error: "Failed to initiate call. Please check your telephony configuration." 
      }, { status: 500 });
    }

    // Initialize Telnyx client
    const client = Telnyx(apiKey);

    // Create webhook URL for handling call events
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/voice/telnyx/webhook`;

    // Prepare call options with safe client_state encoding
    let clientStateEncoded: string | undefined;
    try {
      // Create a safe copy of the data to avoid circular references
      const clientStateData = {
        script: typeof script === 'string' ? script : JSON.stringify(script),
        leadId,
        timestamp: Date.now()
      };
      clientStateEncoded = btoa(JSON.stringify(clientStateData));
    } catch (encodeError) {
      console.error('⚠️ [TELNYX] Failed to encode client_state:', encodeError);
      // Use minimal state as fallback
      clientStateEncoded = btoa(JSON.stringify({
        leadId,
        timestamp: Date.now()
      }));
    }

    const callOptions = {
      to,
      from,
      connection_id: connectionId,
      webhook_url: webhookUrl,
      webhook_url_method: 'POST',
      client_state: clientStateEncoded,
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
        await supabaseAdmin.from('call_logs').insert({
          organization_id: organizationId,
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
      provider: 'telnyx',
      sid: call.data.id // For backward compatibility
    });

  } catch (error: any) {
    console.error('❌ [TELNYX] Error initiating call:', error);
    
    return NextResponse.json({ 
      error: error?.message || "Failed to initiate call",
      details: error?.code || "unknown_error"
    }, { status: 500 });
  }
}

