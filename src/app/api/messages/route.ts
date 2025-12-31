import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';
// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const limit = Math.min(parseInt(new URL(req.url).searchParams.get("limit") ?? "50", 10) || 50, 200);
  
  try {
    // Check authentication using JWT
    if (!isAuthenticated(req)) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user data from JWT
    const user = getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return NextResponse.json(
        { error: "User organization not found" },
        { status: 401 }
      );
    }

    const organizationId = user.organizationId;
    
    const { data, error } = await supabaseAdmin
      .from("messages")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      console.warn("Messages table error:", error.message);
      // Return mock data if table doesn't exist
      const mockMessages = [
        { id: 1, content: "Welcome to GhostCRM!", sender: "system", created_at: new Date().toISOString() },
        { id: 2, content: "Your dashboard is ready", sender: "system", created_at: new Date().toISOString() }
      ];
      return NextResponse.json(mockMessages);
    }
    
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Messages API error:", err);
    const mockMessages = [
      { id: 1, content: "Welcome to GhostCRM!", sender: "system", created_at: new Date().toISOString() },
      { id: 2, content: "Your dashboard is ready", sender: "system", created_at: new Date().toISOString() }
    ];
    return NextResponse.json(mockMessages);
  }
}

