import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";

const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
const hasSendgrid = !!process.env.SENDGRID_API_KEY;
let twilio: any = null, sg: any = null;
if (hasTwilio) twilio = (await import("twilio")).default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
if (hasSendgrid) { sg = (await import("@sendgrid/mail")).default; sg.setApiKey(process.env.SENDGRID_API_KEY!); }

// ...removed supa, use supaFromReq instead

// POST { channel:'sms'|'email', to, from?, subject?, body, lead_id? }
export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const { channel, to, from, subject, body, lead_id } = await req.json();

  if (!channel || !to || !body) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  // Find org
  const { data: mems } = await s.from("memberships").select("organization_id").limit(1);
  const org_id = mems?.[0]?.organization_id;
  if (!org_id) return NextResponse.json({ error: "no_membership" }, { status: 403 });

  // Create queued row first (RLS enforces org)
  const { data: row, error: insErr } = await s.from("messages").insert({
    org_id, lead_id: lead_id ?? null, direction: "outbound", channel,
    to_addr: to, from_addr: from ?? null, subject: subject ?? null, body,
    status: "queued"
  }).select().single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  let provider_id: string | null = null;
  let status: "sent" | "error" = "sent";
  let errText: string | null = null;

  try {
    if (channel === "sms") {
      if (!hasTwilio) throw new Error("twilio_unconfigured");
      const resp = await twilio.messages.create({ to, from: from ?? process.env.TWILIO_PHONE_NUMBER, body });
      provider_id = resp?.sid || null;
    } else if (channel === "email") {
      if (!hasSendgrid) throw new Error("sendgrid_unconfigured");
      const resp = await sg.send({ to, from: from ?? process.env.SENDGRID_FROM, subject: subject ?? "", text: body });
      provider_id = resp?.[0]?.headers?.["x-message-id"] || null;
    } else {
      throw new Error("unsupported_channel");
    }
  } catch (e: any) {
    status = "error";
    errText = String(e?.message || e);
  }

  // Update message row and audit
  await s.from("messages").update({ status, provider_id, error: errText }).eq("id", row.id);
  await s.from("audit_events").insert({
    org_id, entity: "message", entity_id: String(row.id),
    action: status === "sent" ? "send" : "fail", diff: { channel, to, provider_id, error: errText }
  });

  if (status === "error") return NextResponse.json({ ok: false, error: errText }, { status: 502, headers: res.headers });
  return NextResponse.json({ ok: true, provider_id }, { headers: res.headers });
}
