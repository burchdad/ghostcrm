import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Scaffolded admin/org check (replace with real logic)
function isAdmin(req: NextRequest) {
  // TODO: Replace with real auth logic
  return true;
}
function getOrgFromReq(req: NextRequest) {
  // TODO: Replace with real org extraction logic
  return req.nextUrl.searchParams.get("org") || "";
}

// GET: List triggers for org
export async function GET(req: NextRequest) {
  const org = getOrgFromReq(req);
  let query = supabase.from("workflow_triggers").select("*");
  if (org) query = query.eq("org", org);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ triggers: data });
}

// POST: Bulk create/update triggers for org
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await req.json();
  const org = body.org || "";
  const triggers = body.triggers || [];
  const { error } = await supabase
    .from("workflow_triggers")
    .upsert(triggers.map(t => ({ ...t, org })));
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE: Bulk delete triggers for org
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await req.json();
  const org = body.org || "";
  const ids = body.ids || [];
  let query = supabase.from("workflow_triggers").delete().in("id", ids);
  if (org) query = query.eq("org", org);
  const { error } = await query;
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ success: true });
}

// PATCH: Bulk test triggers for org
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await req.json();
  const org = body.org || "";
  const ids = body.ids || [];
  // Simulate test logic (replace with real test logic)
  const results = ids.map(id => ({ id, result: "success" }));
  return NextResponse.json({ results });
}
