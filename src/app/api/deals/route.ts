

import { NextRequest } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";
import { DealCreate } from "@/lib/validators";
import { getMembershipOrgId } from "@/lib/rbac";
import { ok, bad, oops } from "@/lib/http";

export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const url = new URL(req.url);
  const stage = url.searchParams.get("stage") ?? undefined;
  const pipeline = url.searchParams.get("pipeline") ?? undefined;

  let q = s.from("deals").select("*").order("updated_at", { ascending: false }).limit(200);
  if (stage) q = q.eq("stage", stage);
  if (pipeline) q = q.eq("pipeline", pipeline);

  const { data, error } = await q;
  if (error) return oops(error.message);
  return ok(data, res.headers);
}

export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const parsed = DealCreate.safeParse(await req.json());
  if (!parsed.success) return bad(parsed.error.errors[0].message);
  const org_id = await getMembershipOrgId(s);
  if (!org_id) return bad("no_membership");

  const d = parsed.data;
  const { data: deal, error } = await s
    .from("deals")
    .insert({
      org_id,
      title: d.title,
      amount: d.amount ?? null,
      probability: d.probability ?? 10,
      close_date: d.close_date ?? null,
      pipeline: d.pipeline ?? "default",
      stage: d.stage ?? "prospect",
      owner_id: d.owner_id ?? null,
      lead_id: d.lead_id ?? null,
    })
    .select()
    .single();

  if (error) return oops(error.message);
  await s.from("audit_events").insert({ org_id, entity: "deal", entity_id: deal.id, action: "create" });
  return ok(deal, res.headers);
}

export async function PATCH(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const body = await req.json();
  if (!body?.id) return bad("missing id");

  const patch: Record<string, any> = {};
  for (const k of ["title", "amount", "probability", "close_date", "pipeline", "stage", "owner_id", "lead_id"]) {
    if (k in body) patch[k] = body[k];
  }
  patch.updated_at = new Date().toISOString();

  const { data: deal, error } = await s.from("deals").update(patch).eq("id", body.id).select().single();
  if (error) return oops(error.message);

  await s.from("audit_events").insert({ entity: "deal", entity_id: body.id, action: "update", diff: patch });
  return ok(deal, res.headers);
}
