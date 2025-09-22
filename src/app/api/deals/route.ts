
import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";

// GET /api/deals?stage=prospect&pipeline=default
export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const url = new URL(req.url);
  const stage = url.searchParams.get("stage") ?? undefined;
  const pipeline = url.searchParams.get("pipeline") ?? undefined;

  let q = s.from("deals").select("*").order("updated_at", { ascending: false }).limit(200);
  if (stage) q = q.eq("stage", stage);
  if (pipeline) q = q.eq("pipeline", pipeline);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { headers: res.headers });
}

// POST /api/deals  { title, amount?, probability?, close_date?, lead_id?, pipeline?, stage?, owner_id? }
export async function POST(req: NextRequest) {
  const { s, res } = supa(req);
  const body = await req.json();

  // Get the caller's org via memberships (RLS ensures only their orgs are visible)
  const { data: mems, error: mErr } = await s.from("memberships").select("organization_id").limit(1);
  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });
  const org_id = mems?.[0]?.organization_id;
  if (!org_id) return NextResponse.json({ error: "no_membership" }, { status: 403 });

  const { data: deal, error } = await s.from("deals").insert({
    org_id,
    title: body.title,
    amount: body.amount ?? null,
    probability: body.probability ?? 10,
    close_date: body.close_date ?? null,
    lead_id: body.lead_id ?? null,
    pipeline: body.pipeline ?? "default",
    stage: body.stage ?? "prospect",
    owner_id: body.owner_id ?? null
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await s.from("audit_events").insert({
    org_id, entity: "deal", entity_id: deal.id, action: "create", diff: { stage: deal.stage, pipeline: deal.pipeline }
  });

  return NextResponse.json(deal, { status: 201, headers: res.headers });
}

// PATCH /api/deals  { id, ...fields }
export async function PATCH(req: NextRequest) {
  const { s, res } = supa(req);
  const body = await req.json();
  const id = body.id;
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const patch: Record<string, any> = {};
  for (const k of ["title","amount","probability","close_date","pipeline","stage","owner_id"]) {
    if (k in body) patch[k] = body[k];
  }
  patch.updated_at = new Date().toISOString();

  const { data: deal, error } = await s.from("deals").update(patch).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await s.from("audit_events").insert({ entity: "deal", entity_id: id, action: "update", diff: patch });
  return NextResponse.json(deal, { headers: res.headers });
}
