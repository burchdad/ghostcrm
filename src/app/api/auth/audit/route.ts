import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";

// Force dynamic rendering for request.headers usage
export const dynamic = 'force-dynamic'

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
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
    const { entity, entityId, action, diff } = await req.json();

    const { error } = await supabaseAdmin.from("audit_events").insert({
      org_id: organizationId, 
      entity, 
      entity_id: String(entityId), 
      action, 
      diff: diff ?? null
    });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth audit error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

