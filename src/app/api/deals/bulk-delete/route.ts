import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = "nodejs";

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    if (!(await isAuthenticated(req))) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: "User organization not found" }, { status: 401 });
    }

    const { dealIds } = await req.json();
    
    if (!Array.isArray(dealIds) || dealIds.length === 0) {
      return NextResponse.json({ error: "No deal IDs provided" }, { status: 400 });
    }

    // Delete deals belonging to the user's organization
    const { error, count } = await supabaseAdmin
      .from("deals")
      .delete()
      .in("id", dealIds)
      .eq("organization_id", user.organizationId);
    
    if (error) {
      console.error("Bulk delete deals error:", error);
      return NextResponse.json({ error: "Failed to delete deals" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount: count,
      message: `Successfully deleted ${count} deals` 
    });
    
  } catch (e: any) {
    console.error("Bulk delete deals API error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}