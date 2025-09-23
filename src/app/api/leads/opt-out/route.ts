import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";

export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const { lead_id, opt_out } = await req.json();
  if (!lead_id || typeof opt_out !== "boolean") return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const { error } = await s.from("leads").update({ opt_out }).eq("id", lead_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { headers: res.headers });
}
