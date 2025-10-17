import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";
import { updateLeadOptOut } from "@/lib/mock-leads";

export async function POST(req: NextRequest) {
  try {
    const { lead_id, opt_out } = await req.json();
    
    if (!lead_id || typeof opt_out !== "boolean") {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    // Try database first, fall back to mock data
    try {
      const { s, res } = supaFromReq(req);
      const { error } = await s.from("leads").update({ opted_out: opt_out }).eq("id", lead_id);
      if (!error) {
        return NextResponse.json({ ok: true }, { headers: res.headers });
      }
      console.warn("Database update failed, using mock data:", error.message);
    } catch (dbError) {
      console.warn("Database connection failed, using mock data:", dbError);
    }

    // Use mock data for demo mode
    const updated = updateLeadOptOut(lead_id, opt_out);
    if (updated) {
      return NextResponse.json({ ok: true, mock: true });
    } else {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
  } catch (e: any) {
    console.error("Opt-out API error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
