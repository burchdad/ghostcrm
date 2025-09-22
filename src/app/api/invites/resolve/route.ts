import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";

export async function GET(req: NextRequest) {
  const { s } = supaFromReq(req);
  const token = new URL(req.url).searchParams.get("token") || "";
  const { data, error } = await s.from("invites").select("org_id, role, expires_at, accepted_at").eq("token", token).single();
  if (error || !data || data.accepted_at || new Date(data.expires_at) < new Date())
    return NextResponse.json({ error: "invalid_or_expired" }, { status: 400 });
  return NextResponse.json({ org_id: data.org_id, role: data.role });
}
