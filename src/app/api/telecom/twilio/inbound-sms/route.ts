import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supaFromReq } from "@/lib/supa-ssr";

function validateTwilioSignature(req: NextRequest, authToken: string) {
  const twilioSignature = req.headers.get("x-twilio-signature") ?? "";
  const url = process.env.NEXT_PUBLIC_BASE_URL + req.nextUrl.pathname;
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const k of sortedKeys) data += k + params[k];
  const computed = crypto.createHmac("sha1", authToken).update(data).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(twilioSignature));
}

export async function POST(req: NextRequest) {
  // TODO: Load Twilio authToken for the org (from secret store)
  const authToken = process.env.TWILIO_AUTH_TOKEN ?? "";
  if (!validateTwilioSignature(req, authToken)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 403 });
  }
  const body = await req.formData();
  const to = body.get("To");
  const from = body.get("From");
  const text = body.get("Body");

  // Find org by 'to' number
  const { s, res } = supaFromReq(req);
  const { data: pn } = await s.from("phone_numbers").select("org_id").eq("e164", to).single();
  if (!pn?.org_id) return NextResponse.json({ error: "no_org" }, { status: 404 });

  // Insert inbound message
  await s.from("messages").insert({
    org_id: pn.org_id,
    direction: "inbound",
    channel: "sms",
    to_addr: to,
    from_addr: from,
    body: text,
    status: "received"
  });

  return NextResponse.json({ ok: true }, { headers: res.headers });
}
