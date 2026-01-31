import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";


export const dynamic = 'force-dynamic';
// GET: List all opted-out leads
export async function GET(req: NextRequest) {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("id, full_name, phone_number, email_address, opted_out, updated_at")
    .eq("opted_out", true)
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data });
}

