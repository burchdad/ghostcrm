
import { NextRequest } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";
import { MessageSend } from "@/lib/validators";
import { getMembershipOrgId } from "@/lib/rbac";
import { ok, bad, oops } from "@/lib/http";
import { limitKey } from "@/lib/edge-limit";
import { getSmsAdapterFor } from "@/lib/telephony/select";

async function isOptedOut(s: any, org_id: string, to: string) {
  const { data } = await s.from("lead_opt_outs").select("id").eq("org_id", org_id).eq("phone", to).limit(1);
  return !!data?.length;
}
async function getQuietHours(s: any) {
  const { data } = await s.from("org_settings").select("quiet_start, quiet_end, timezone").limit(1);
  return data?.[0] ?? null;
}
function withinQuiet(now: Date, qs?: string | null, qe?: string | null) {
  if (!qs || !qe) return false;
  const [sH,sM]=qs.split(":").map(Number), [eH,eM]=qe.split(":").map(Number);
  const mins = now.getHours()*60+now.getMinutes(), s = sH*60+sM, e = eH*60+eM;
  return s < e ? (mins>=s && mins<e) : (mins>=s || mins<e);
}

export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const parsed = MessageSend.safeParse(await req.json());
  if (!parsed.success) return bad(parsed.error.errors[0].message);

  const org_id = await getMembershipOrgId(s);
  if (!org_id) return bad("no_membership");

  const { channel, to, from, subject, body, lead_id } = parsed.data;

  // rate limit
  const { allow, reset } = await limitKey(`org:${org_id}:sms`);
  if (!allow) return new Response(JSON.stringify({ error: "rate_limited", retry_after: Math.ceil((reset-Date.now())/1000) }), { status: 429, headers: res.headers });

  // STOP/HELP opt-out
  if (await isOptedOut(s, org_id, to)) return bad("recipient_opted_out");

  // quiet hours
  const qs = await getQuietHours(s);
  if (channel === "sms" && qs && withinQuiet(new Date(), qs.quiet_start, qs.quiet_end)) {
    // log queued in messages table; return queued
    await s.from("messages").insert({
      org_id, lead_id: lead_id ?? null, direction: "outbound", channel,
      to_addr: to, from_addr: from ?? null, subject: subject ?? null, body, status: "queued_quiet_hours"
    });
    return ok({ queued: true }, res.headers);
  }

  // create queued row first
  const { data: row, error: insErr } = await s.from("messages").insert({
    org_id, lead_id: lead_id ?? null, direction: "outbound", channel,
    to_addr: to, from_addr: from ?? null, subject: subject ?? null, body, status: "queued"
  }).select().single();
  if (insErr) return oops(insErr.message);

  // send via adapter(s)
  let provider_id: string | null = null;
  let error: string | null = null;

  try {
    if (channel === "sms") {
      const adapter = await getSmsAdapterFor(org_id, from ?? undefined);
      const res = await adapter.sendSms({ orgId: org_id, to, from, body });
      if (!res.ok) throw new Error("SMS send failed");
      provider_id = res.providerId ?? null;
    } else {
      // email path (e.g., SendGrid) – call your existing code or /api/messages/send with channel 'email'
      const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/messages/send-email`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, from, subject, body, org_id, lead_id })
      });
      if (!r.ok) throw new Error(await r.text());
    }
  } catch (e: any) {
    error = String(e?.message || e);
  }

  await s.from("messages").update({
    status: error ? "error" : "sent",
    provider_id, error
  }).eq("id", row.id);

  await s.from("audit_events").insert({
    org_id, entity: "message", entity_id: String(row.id),
    action: error ? "fail" : "send", diff: { channel, to, provider_id, error }
  });

  if (error) return new Response(JSON.stringify({ ok: false, error }), { status: 502, headers: res.headers });
  return ok({ ok: true, provider_id }, res.headers);
}

