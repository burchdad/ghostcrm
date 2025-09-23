import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET: Aggregate campaign analytics
export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId") || "1";
  // Aggregate outreach_events for campaign performance
  const { data, error } = await supabaseAdmin.rpc("get_campaign_analytics", { org_id: orgId });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ analytics: data });
}
