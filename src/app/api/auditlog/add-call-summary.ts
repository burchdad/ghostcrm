import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { summarizeCall } from "@/lib/ai/summarizeCall";

export async function POST(req: NextRequest) {
  const { call_id, transcript } = await req.json();
  if (!call_id || !transcript) return NextResponse.json({ error: "missing fields" }, { status: 400 });
  const summary = await summarizeCall(transcript);
  // Update audit_events table (assumes diff.summary column exists)
  const { error } = await supabaseAdmin
    .from("audit_events")
    .update({ diff: { summary } })
    .eq("item_id", call_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, summary });
}
