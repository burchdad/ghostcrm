import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";
import { verifyNumberOwnership } from "@/lib/telephony/verify";

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get user data from JWT
    const user = getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: "User organization not found" }, { status: 401 });
    }

    const organizationId = user.organizationId;
    const { e164, provider_account_id } = await req.json();
    if (!e164) return NextResponse.json({ error: "missing e164" }, { status: 400 });

  const ok = await verifyNumberOwnership({ org_id, provider_account_id, e164 });
  const { data, error } = await s.from("phone_numbers")
    .insert({ org_id, e164, provider_account_id: provider_account_id ?? null, capabilities: { sms:true, mms:true, voice:true }, verified: ok })
    .select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201, headers: res.headers });
}

