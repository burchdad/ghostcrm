import { NextRequest } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";
import { ApptCreate } from "@/lib/schemas/appointments";
// If the correct export is 'getMembershipOrgId', ensure it is exported in '@/lib/rbac'.
// Otherwise, import the correct function or member, e.g.:
// If the correct export is 'getMembershipOrgId', ensure it is exported in '@/lib/rbac'.
// Otherwise, import the correct function or member, e.g.:
import { getMembershipOrgId } from "@/lib/rbac";
// And update usages of 'getMembershipOrgId' to 'getOrgIdFromMembership' below.
import { ok, bad, oops } from "@/lib/http";

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
  if (error) return oops(error.message);
  return ok(data, res.headers);
}

export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const parsed = ApptCreate.safeParse(await req.json());
  if (!parsed.success) return bad(parsed.error.errors[0].message);
  const org_id = await getMembershipOrgId(s);
  if (!org_id) return bad("no_membership");

  const a = parsed.data;
  const { data: appt, error } = await s
    .from("appointments")
    .insert({
      org_id,
      title: a.title,
      location: a.location ?? null,
      starts_at: a.starts_at,
      ends_at: a.ends_at,
      lead_id: a.lead_id ?? null,
      owner_id: a.owner_id ?? null,
      status: a.status ?? "scheduled",
    })
    .select()
    .single();

  if (error) return oops(error.message);
  await s.from("audit_events").insert({ org_id, entity: "appointment", entity_id: appt.id, action: "create" });
  return ok(appt, res.headers);
}

export async function PATCH(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const body = await req.json();
  if (!body?.id) return bad("missing id");

  const patch: Record<string, any> = {};
  for (const k of ["title", "location", "starts_at", "ends_at", "status", "owner_id"]) {
    if (k in body) patch[k] = body[k];
  }

  const { data: appt, error } = await s.from("appointments").update(patch).eq("id", body.id).select().single();
  if (error) return oops(error.message);

  await s.from("audit_events").insert({ entity: "appointment", entity_id: body.id, action: "update", diff: patch });
  return ok(appt, res.headers);
}

export async function DELETE(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const { id } = await req.json();
  if (!id) return bad("missing id");

  const { error } = await s.from("appointments").delete().eq("id", id);
  if (error) return oops(error.message);

  await s.from("audit_events").insert({ entity: "appointment", entity_id: id, action: "delete" });
  return ok({ ok: true }, res.headers);
}
