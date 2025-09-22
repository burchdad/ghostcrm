
import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";

export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;

  let q = s.from("appointments").select("*").order("starts_at", { ascending: true }).limit(500);
  if (status) q = q.eq("status", status);
  if (from) q = q.gte("starts_at", from);
  if (to) q = q.lte("ends_at", to);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { headers: res.headers });
}

export async function POST(req: NextRequest) {
  const { s, res } = supa(req);
  const body = await req.json();

  const { data: mems, error: mErr } = await s.from("memberships").select("organization_id").limit(1);
  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });
  const org_id = mems?.[0]?.organization_id;
  if (!org_id) return NextResponse.json({ error: "no_membership" }, { status: 403 });

  const { data: appt, error } = await s.from("appointments").insert({
    org_id,
    title: body.title,
    location: body.location ?? null,
    starts_at: body.starts_at,
    ends_at: body.ends_at,
    lead_id: body.lead_id ?? null,
    owner_id: body.owner_id ?? null,
    status: body.status ?? "scheduled"
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await s.from("audit_events").insert({
    org_id, entity: "appointment", entity_id: appt.id, action: "create",
    diff: { title: appt.title, starts_at: appt.starts_at }
  });

  return NextResponse.json(appt, { status: 201, headers: res.headers });
}

export async function PATCH(req: NextRequest) {
  const { s, res } = supa(req);
  const body = await req.json();
  const id = body.id;
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const patch: Record<string, any> = {};
  for (const k of ["title","location","starts_at","ends_at","status","owner_id"]) {
    if (k in body) patch[k] = body[k];
  }

  const { data: appt, error } = await s.from("appointments").update(patch).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await s.from("audit_events").insert({ entity: "appointment", entity_id: id, action: "update", diff: patch });
  return NextResponse.json(appt, { headers: res.headers });
}

export async function DELETE(req: NextRequest) {
  const { s, res } = supa(req);
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const { data: before } = await s.from("appointments").select("id").eq("id", id).single();
  const { error } = await s.from("appointments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (before) await s.from("audit_events").insert({ entity: "appointment", entity_id: id, action: "delete" });
  return NextResponse.json({ ok: true }, { headers: res.headers });
}
