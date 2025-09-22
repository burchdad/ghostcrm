import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";

export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const limit = Math.min(parseInt(new URL(req.url).searchParams.get("limit") ?? "50", 10) || 50, 200);
  const { data, error } = await s
    .from("audit_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { headers: res.headers });
}
