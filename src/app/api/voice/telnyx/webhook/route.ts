import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TELNYX_API_KEY = process.env.TELNYX_API_KEY!;

type TelnyxEvent =
  | { event_type?: string; payload?: any }
  | { data?: any; meta?: any };

function extractEvent(body: any) {
  // ✅ Standard Telnyx: { event_type, payload }
  const eventType = body?.event_type ?? body?.data?.event_type;
  const payload = body?.payload ?? body?.data?.payload ?? body?.payload;

  // ✅ If your forwarder stripped wrapper and only sent payload under data:
  const payloadFallback = body?.data?.call_control_id ? body.data : undefined;

  return {
    eventType,
    payload: payload ?? payloadFallback,
    raw: body,
  };
}

async function telnyxSpeak(callControlId: string, text: string) {
  const res = await fetch(
    `https://api.telnyx.com/v2/calls/${encodeURIComponent(
      callControlId
    )}/actions/speak`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TELNYX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payload: {
          voice: "female",
          language: "en-US",
          text,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Telnyx speak failed: ${res.status} ${errText}`);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { eventType, payload } = extractEvent(body);

  const callControlId = payload?.call_control_id;

  console.log("🎯 [TELNYX-WEBHOOK] eventType:", eventType);
  console.log("🎯 [TELNYX-WEBHOOK] call_control_id:", callControlId);
  console.log("🎯 [TELNYX-WEBHOOK] raw body:", JSON.stringify(body, null, 2));

  // If we still can't find it, just ACK so Telnyx stops retrying
  if (!callControlId) {
    console.log("⚠️ [TELNYX-WEBHOOK] Missing call_control_id, ACK");
    return NextResponse.json({ ok: true });
  }

  try {
    // ✅ simplest: speak when human answers
    if (eventType === "call.answered") {
      console.log("🎯 [TELNYX-WEBHOOK] Call answered, triggering speak command");
      await telnyxSpeak(
        callControlId,
        "Hello. This is Ghost AI. I'm connected and can hear you. Please say something to test the connection."
      );
      console.log("✅ [TELNYX-WEBHOOK] Speak command sent successfully");
    } else if (eventType === "call.machine.detection.ended") {
      const machineDetectionResult = payload?.result || payload?.machine_detection_result;
      console.log("🤖 [MACHINE-DETECTION]", machineDetectionResult);
      
      if (machineDetectionResult === "human") {
        console.log("🎯 [TELNYX-WEBHOOK] Human detected, triggering AI greeting");
        await telnyxSpeak(
          callControlId,
          "Hello! This is Sarah from Ghost AI. I'm calling to see if you're interested in learning about our CRM solutions. Can you hear me clearly?"
        );
        console.log("✅ [TELNYX-WEBHOOK] AI greeting sent successfully");
      }
    } else {
      console.log("ℹ️ [TELNYX-WEBHOOK] Event type not handled:", eventType);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("❌ [TELNYX-WEBHOOK] handler error:", e?.message || e);
    // Still ACK to avoid Telnyx retry storms
    return NextResponse.json({ ok: true });
  }
}