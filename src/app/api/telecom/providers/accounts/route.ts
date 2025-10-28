import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";
import { saveProviderSecrets } from "@/lib/telephony/secret-store";


export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const { provider_id, label, meta, secrets } = await req.json();
  if (!provider_id || !secrets) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const { data: mem } = await s.from("memberships").select("organization_id").limit(1);
  const org_id = mem?.[0]?.organization_id;
  if (!org_id) return NextResponse.json({ error: "no_membership" }, { status: 403 });

  const secret_ref = await saveProviderSecrets({ org_id, provider_id, secrets });
  const { data, error } = await s.from("org_provider_accounts")
    .insert({ org_id, provider_id, label: label ?? null, meta: { ...(meta ?? {}), secret_ref } })
    .select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201, headers: res.headers });
}

