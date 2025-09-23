



import { NextRequest } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";
import { LeadCreate } from "@/lib/validators";
import { getMembershipOrgId } from "@/lib/rbac";
import { ok, bad, oops } from "@/lib/http";

export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const url = new URL(req.url);
  const stage = url.searchParams.get("stage") ?? undefined;

  let q = s.from("leads").select("*").order("updated_at", { ascending: false }).limit(200);
  if (stage) q = q.eq("stage", stage);

  const { data, error } = await q;
  if (error) return oops(error.message);
  return ok(data, res.headers);
}

export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const parsed = LeadCreate.safeParse(await req.json());
  if (!parsed.success) return bad(parsed.error.errors[0].message);

  const org_id = await getMembershipOrgId(s);
  if (!org_id) return bad("no_membership");

  const body = parsed.data;

  // Upsert contact for this org (only if email/phone provided)
  let contactId: number | null = null;
  if (body.email || body.phone) {
    const { data: contact, error: cErr } = await s
      .from("contacts")
      .upsert({
        org_id,
        first_name: body.first_name,
        last_name: body.last_name ?? "",
        email: body.email ?? null,
        phone: body.phone ?? null,
        data: body.meta ?? {},
      })
      .select("id")
      .single();
    if (cErr) return oops(cErr.message);
    contactId = (contact as any)?.id ?? null;
  }

  const { data: lead, error } = await s
    .from("leads")
    .insert({
      org_id,
      contact_id: contactId,
      full_name: `${body.first_name}${body.last_name ? " " + body.last_name : ""}`,
      stage: body.stage ?? "new",
      campaign: body.campaign ?? null,
      est_value: body.est_value ?? null,
      contact_email: body.email ?? null,
      contact_phone: body.phone ?? null,
      meta: body.meta ?? {},
    })
    .select()
    .single();

  if (error) return oops(error.message);
  await s.from("audit_events").insert({ org_id, entity: "lead", entity_id: lead.id, action: "create" });

  return ok(lead, res.headers);
}

