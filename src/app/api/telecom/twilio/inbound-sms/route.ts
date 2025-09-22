import { NextRequest, NextResponse } from "next/server";
import Twilio from "twilio";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  // Twilio sends application/x-www-form-urlencoded
  const rawBody = await req.text();
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/telecom/twilio/inbound-sms`;
  const sig = req.headers.get("x-twilio-signature") || "";
  const ok = Twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN!, sig, url, Object.fromEntries(new URLSearchParams(rawBody)));
  if (!ok) return NextResponse.json({ error: "invalid_signature" }, { status: 401 });

  const params = new URLSearchParams(rawBody);
  const to = params.get("To") || "";
  const from = params.get("From") || "";
  const body = params.get("Body") || "";

  // find org by "to" number
  const { data: pn } = await supabaseAdmin.from("phone_numbers")
    .select("org_id").eq("e164", to).single();
  const org_id = pn?.org_id;
  if (!org_id) return NextResponse.json({ error: "unknown_destination" }, { status: 404 });

  await supabaseAdmin.from("messages").insert({
    org_id, direction: "inbound", channel: "sms",
    to_addr: to, from_addr: from, body, status: "received"
  });
  // 200 with empty TwiML is ok
  return new NextResponse("<Response></Response>", { status: 200, headers: { "Content-Type": "text/xml" } });
}
