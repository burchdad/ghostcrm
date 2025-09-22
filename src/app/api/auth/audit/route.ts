
import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";

export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const { entity, entityId, action, diff } = await req.json();

  const { data: mem } = await s.from("memberships").select("organization_id").limit(1);
  const org_id = mem?.[0]?.organization_id;
  if (!org_id) return NextResponse.json({ error: "no_membership" }, { status: 403 });

  const { error } = await s.from("audit_events").insert({
    org_id, entity, entity_id: String(entityId), action, diff: diff ?? null
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true }, { headers: res.headers });
}
