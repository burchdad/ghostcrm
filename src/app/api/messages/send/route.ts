import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";
import { getSmsAdapterFor } from "@/lib/telephony/select";

export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const { to, from, body } = await req.json();
  if (!to || !body) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  // org scope (RLS)
  const { data: mems } = await s.from("memberships").select("organization_id").limit(1);
  const orgId = mems?.[0]?.organization_id;
  if (!orgId) return NextResponse.json({ error: "no_membership" }, { status: 403 });


  // Upstash rate limit per org
  const { limitKey } = await import("@/lib/edge-limit");
  const key = `org:${orgId}`;
  const { allow, reset } = await limitKey(key);
  if (!allow) {
    const secs = Math.max(1, Math.ceil((reset - Date.now())/1000));
    return NextResponse.json({ error: "rate_limited", retry_after: secs }, { status: 429, headers: res.headers });
  }

  // STOP/HELP opt-out check
  const { data: lead } = await s.from("leads").select("id, opt_out").eq("phone", to).single();
  if (lead?.opt_out) {
    return NextResponse.json({ error: "recipient_opted_out" }, { status: 403, headers: res.headers });
  }

  // Create queued message row first (works even if sending fails)
  const { data: msg, error: insErr } = await s.from("messages").insert({
    org_id: orgId, direction: "outbound", channel: "sms",
    to_addr: to, from_addr: from ?? null, body, status: "queued"
  }).select().single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  // Quiet hours enforcement (example: org_settings table)
  const { data: orgSettings } = await s.from("org_settings").select("quiet_hours_start, quiet_hours_end").eq("org_id", orgId).single();
  if (orgSettings) {
    const now = new Date();
    const start = orgSettings.quiet_hours_start;
    const end = orgSettings.quiet_hours_end;
    if (start !== null && end !== null) {
      const hour = now.getUTCHours();
      if (hour >= start && hour < end) {
        // Optionally queue instead of send
        await s.from("messages").update({ status: "queued_quiet_hours" }).eq("id", msg.id);
        return NextResponse.json({ error: "quiet_hours", queued: true }, { status: 202, headers: res.headers });
      }
    }
  }

  // Route to the correct adapter by org/number
  const adapter = await getSmsAdapterFor(orgId, from ?? undefined);
  const send = await adapter.sendSms({ orgId, to, from, body });

  // Update status + audit
  await s.from("messages").update({
    status: send.ok ? "sent" : "error",
    provider_id: send.ok ? send.providerId ?? null : null,
    error: send.ok ? null : send.error
  }).eq("id", msg.id);

  await s.from("audit_events").insert({
    org_id: orgId, entity: "message", entity_id: String(msg.id),
    action: send.ok ? "send" : "fail", diff: { to, from, providerId: (send as any).providerId, error: (send as any).error }
  });

  if (!send.ok) return NextResponse.json({ ok: false, error: send.error }, { status: 502, headers: res.headers });
  return NextResponse.json({ ok: true, provider_id: (send as any).providerId }, { headers: res.headers });
}

