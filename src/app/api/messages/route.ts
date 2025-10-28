import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";


export const dynamic = 'force-dynamic';
// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const limit = Math.min(parseInt(new URL(req.url).searchParams.get("limit") ?? "50", 10) || 50, 200);
  
  try {
    const { data, error } = await s
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      console.warn("Messages table error:", error.message);
      // Return mock data if table doesn't exist
      const mockMessages = [
        { id: 1, content: "Welcome to GhostCRM!", sender: "system", created_at: new Date().toISOString() },
        { id: 2, content: "Your dashboard is ready", sender: "system", created_at: new Date().toISOString() }
      ];
      return NextResponse.json(mockMessages, { headers: res.headers });
    }
    
    return NextResponse.json(data, { headers: res.headers });
  } catch (err) {
    console.warn("Messages API error:", err);
    const mockMessages = [
      { id: 1, content: "Welcome to GhostCRM!", sender: "system", created_at: new Date().toISOString() },
      { id: 2, content: "Your dashboard is ready", sender: "system", created_at: new Date().toISOString() }
    ];
    return NextResponse.json(mockMessages, { headers: res.headers });
  }
}

