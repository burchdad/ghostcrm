// Telnyx AI Call Status Handler - Tracks call events and outcomes
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TELNYX_API_KEY = process.env.TELNYX_API_KEY!;

async function telnyxSpeak(callControlId: string, text: string) {
  const r = await fetch(
    `https://api.telnyx.com/v2/calls/${encodeURIComponent(callControlId)}/actions/speak`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TELNYX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voice: "female",
        language: "en-US", 
        text: text
      }),
    }
  );

  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Telnyx speak failed: ${r.status} ${t}`);
  }
  
  console.log(`✅ [TELNYX-SPEAK] Successfully sent speak command: "${text}"`);
}

function extractEvent(body: any) {
  // ✅ Standard Telnyx: { event_type, payload }
  const eventType = body?.event_type ?? body?.data?.event_type;
  const payload = body?.payload ?? body?.data?.payload ?? body?.data;

  // ✅ If your forwarder stripped wrapper and only sent payload under data:
  const payloadFallback = body?.data?.call_control_id ? body.data : undefined;

  return {
    eventType,
    payload: payload ?? payloadFallback ?? body,
    raw: body,
  };
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Telnyx AI status webhook endpoint is active" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('🎯 [AI-STATUS] Raw Telnyx webhook:', JSON.stringify(body, null, 2));
    
    // Use improved event extraction
    const { eventType, payload } = extractEvent(body);
    const callControlId = payload?.call_control_id;
    
    console.log("📞 [AI-STATUS] event:", eventType, "call:", callControlId);

    // Always ACK if missing to stop retries
    if (!eventType || !callControlId) {
      console.log("⚠️ [AI-STATUS] Missing event_type or call_control_id");
      return NextResponse.json({ ok: true });
    }

    try {
      // ✅ Speak when the callee answers
      if (eventType === "call.answered") {
        console.log("🎯 [AI-STATUS] Call answered, sending speak command");
        await telnyxSpeak(
          callControlId,
          "Hello. This is Ghost AI. I'm connected. Can you hear me?"
        );
        console.log("✅ [AI-STATUS] Speak command sent successfully");
      }

      // ✅ Wait for AMD result == human then speak
      if (eventType === "call.machine.detection.ended") {
        const result = payload?.result || payload?.machine_detection_result;
        console.log(`🤖 [AI-STATUS] Machine detection result: ${result}`);
        
        if (result === "human") {
          console.log("🎯 [AI-STATUS] Human detected, sending AI greeting");
          await telnyxSpeak(
            callControlId,
            "Perfect. Thanks for picking up. This is Sarah from Ghost AI calling about your CRM inquiry."
          );
          console.log("✅ [AI-STATUS] AI greeting sent successfully");
        }
      }

      return NextResponse.json({ ok: true });
    } catch (e: any) {
      console.error("❌ [AI-STATUS] error:", e?.message || e);
      return NextResponse.json({ ok: true });
    }
    
  } catch (error: any) {
    console.error('❌ [AI-STATUS] Error processing webhook:', error);
    return NextResponse.json({ ok: true });
  }
}