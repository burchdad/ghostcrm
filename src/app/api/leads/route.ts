


import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";

export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const stage = new URL(req.url).searchParams.get("stage") ?? undefined;

  let q = s.from("leads").select("*").order("updated_at", { ascending: false }).limit(200);
  if (stage) q = q.eq("stage", stage);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { headers: res.headers });
}

export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const body = await req.json();

  // upsert contact (RLS scopes to caller's org via memberships)
  const { data: contact, error: cErr } = await s.from("contacts").upsert({
    email: body.email ?? null,
    phone: body.phone ?? null,
    first_name: body.first_name ?? null,
    last_name: body.last_name ?? null,
  }).select().single();
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

  const { data: lead, error } = await s.from("leads").insert({
    contact_id: contact?.id ?? null,
    stage: body.stage ?? "new",
    owner_id: body.owner_id ?? null,
    campaign: body.campaign ?? null,
    est_value: body.est_value ?? null,
    meta: body.meta ?? {},
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await s.from("audit_events").insert({ entity: "lead", entity_id: lead.id, action: "create", diff: { stage: lead.stage } });
  return NextResponse.json(lead, { status: 201, headers: res.headers });
}
export async function PATCH(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const body = await req.json();
  const ids = body.ids || [];
  const rep = body.rep || "";
  const { error } = await s.from("leads").update({ "Assigned Rep": rep }).in("id", ids);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true }, { headers: res.headers });
}

