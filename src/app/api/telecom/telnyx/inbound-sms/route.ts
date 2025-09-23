import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  // Telnyx sends JSON; signature/HMAC optional to add here (X-Telnyx-Signature)
  const body = await req.json();
  const data = body?.data?.payload;
  const to = data?.to[0]?.phone_number || data?.to || "";
  const from = data?.from?.phone_number || data?.from || "";
  const text = data?.text || "";

  const { data: pn } = await supabaseAdmin.from("phone_numbers")
    .select("org_id").eq("e164", to).single();
  const org_id = pn?.org_id;
  if (!org_id) return NextResponse.json({ error: "unknown_destination" }, { status: 404 });

  await supabaseAdmin.from("messages").insert({
    org_id, direction: "inbound", channel: "sms",
    to_addr: to, from_addr: from, body: text, status: "received"
  });

  return NextResponse.json({ ok: true });
}
