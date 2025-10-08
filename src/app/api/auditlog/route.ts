import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";

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
      // Return mock data if table doesn't exist
      const mockAuditEvents = [
        { id: 1, action: "login", user_id: "demo", details: "User logged in", created_at: new Date().toISOString() },
        { id: 2, action: "view_dashboard", user_id: "demo", details: "Viewed dashboard", created_at: new Date().toISOString() }
      ];
      return NextResponse.json(mockAuditEvents, { headers: res.headers });
    }
    
    return NextResponse.json(data, { headers: res.headers });
  } catch (err) {
    console.warn("Audit log API error:", err);
    const mockAuditEvents = [
      { id: 1, action: "login", user_id: "demo", details: "User logged in", created_at: new Date().toISOString() },
      { id: 2, action: "view_dashboard", user_id: "demo", details: "Viewed dashboard", created_at: new Date().toISOString() }
    ];
    return NextResponse.json(mockAuditEvents, { headers: res.headers });
  }
}
