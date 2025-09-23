import { NextRequest, NextResponse } from "next/server";
import Twilio from "twilio";
import { supaFromReq } from "@/lib/supa-ssr";

export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const { to, script } = await req.json();
  if (!to || !script) return NextResponse.json({ error: "missing fields" }, { status:400 });

  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken  = process.env.TWILIO_AUTH_TOKEN!;
  const from       = process.env.TWILIO_PHONE_NUMBER!;
  const client = Twilio(accountSid, authToken);

  // For conversational voice, stream to LLM endpoint
  const answerUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/voice/twilio/answer?script=${encodeURIComponent(script)}`;
  const call = await client.calls.create({ to, from, url: answerUrl });
  return NextResponse.json({ ok:true, sid: call.sid }, { headers: res.headers });
}
