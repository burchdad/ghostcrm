import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";
import { updateLeadOptOut } from "@/lib/mock-leads";

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
    const { lead_id, opt_out } = await req.json();
    
    if (!lead_id || typeof opt_out !== "boolean") {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    // Try database first, fall back to mock data
    try {
      const { error } = await supabaseAdmin.from("leads").update({ opted_out: opt_out }).eq("id", lead_id).eq("organization_id", organizationId);
      if (!error) {
        return NextResponse.json({ ok: true });
      }
      console.warn("Database update failed, using mock data:", error.message);
    } catch (dbError) {
      console.warn("Database connection failed, using mock data:", dbError);
    }

    // Use mock data for demo mode
    const updated = updateLeadOptOut(lead_id, opt_out);
    if (updated) {
      return NextResponse.json({ ok: true, mock: true });
    } else {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
  } catch (e: any) {
    console.error("Opt-out API error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}

