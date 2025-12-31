import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";
import { saveProviderSecrets } from "@/lib/telephony/secret-store";

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
    const { provider_id, label, meta, secrets } = await req.json();
    if (!provider_id || !secrets) return NextResponse.json({ error: "missing fields" }, { status: 400 });

    const secret_ref = await saveProviderSecrets({ org_id: organizationId, provider_id, secrets });
    const { data, error } = await supabaseAdmin.from("org_provider_accounts")
      .insert({ org_id: organizationId, provider_id, label: label ?? null, meta: { ...(meta ?? {}), secret_ref } })
      .select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201, headers: res.headers });
}

