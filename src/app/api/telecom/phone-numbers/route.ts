import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";
import { verifyNumberOwnership } from "@/lib/telephony/verify";


export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const { e164, provider_account_id } = await req.json();
  if (!e164) return NextResponse.json({ error: "missing e164" }, { status: 400 });

  const { data: mem } = await s.from("organization_memberships").select("organization_id").limit(1);
  const org_id = mem?.[0]?.organization_id;
  if (!org_id) return NextResponse.json({ error: "no_membership" }, { status: 403 });

  const ok = await verifyNumberOwnership({ org_id, provider_account_id, e164 });
  const { data, error } = await s.from("phone_numbers")
    .insert({ org_id, e164, provider_account_id: provider_account_id ?? null, capabilities: { sms:true, mms:true, voice:true }, verified: ok })
    .select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201, headers: res.headers });
}

