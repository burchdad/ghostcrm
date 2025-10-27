import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const limit = Math.min(parseInt(new URL(req.url).searchParams.get("limit") ?? "50", 10) || 50, 200);
  
  try {
    const { data, error } = await s
      .from("audit_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      console.warn("Audit events table error:", error.message);
      // Return empty array for new tenants - no mock data
      return NextResponse.json([], { headers: res.headers });
    }
    
    return NextResponse.json(data || [], { headers: res.headers });
  } catch (err) {
    console.warn("Audit log API error:", err);
    // Return empty array for new tenants - no mock data
    return NextResponse.json([], { headers: res.headers });
  }
}
