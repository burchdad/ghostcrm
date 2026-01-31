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

    const { leadIds } = await req.json();
    
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: "No lead IDs provided" }, { status: 400 });
    }

    // Delete leads belonging to the user's organization
    const { error, count } = await supabaseAdmin
      .from("leads")
      .delete()
      .in("id", leadIds)
      .eq("organization_id", user.organizationId);
    
    if (error) {
      console.error("Bulk delete error:", error);
      return NextResponse.json({ error: "Failed to delete leads" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount: count,
      message: `Successfully deleted ${count} leads` 
    });
    
  } catch (e: any) {
    console.error("Bulk delete API error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}