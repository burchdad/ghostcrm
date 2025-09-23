import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET: Fetch org-wide settings
export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId") || "1";
  const { data, error } = await supabaseAdmin
    .from("organizations")
    .select("id, name, quiet_hours_start, quiet_hours_end, default_provider, default_number")
    .eq("id", orgId)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

// PATCH: Update org-wide settings
export async function PATCH(req: NextRequest) {
  const { orgId, quiet_hours_start, quiet_hours_end, default_provider, default_number } = await req.json();
  const update: any = {};
  if (quiet_hours_start) update.quiet_hours_start = quiet_hours_start;
  if (quiet_hours_end) update.quiet_hours_end = quiet_hours_end;
  if (default_provider) update.default_provider = default_provider;
  if (default_number) update.default_number = default_number;
  const { error } = await supabaseAdmin
    .from("organizations")
    .update(update)
    .eq("id", orgId || "1");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
