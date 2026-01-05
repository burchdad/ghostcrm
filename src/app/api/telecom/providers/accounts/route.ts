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
    if (!(await isAuthenticated(req))) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: "User organization not found" }, { status: 401 });
    }

    const organizationId = user.organizationId;
    const { provider_id, label, meta, secrets } = await req.json();
    if (!provider_id || !secrets) return NextResponse.json({ error: "missing fields" }, { status: 400 });

    // Return mock provider account data for now
    return NextResponse.json({
      id: 1,
      provider_id,
      label: label || "Mock Provider",
      status: "active"
    }, { status: 201 });

  } catch (e: any) {
    console.error("Provider account creation error:", e);
    return NextResponse.json({ error: "Provider account creation failed" }, { status: 500 });
  }
}

