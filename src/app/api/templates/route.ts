import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET: List message templates
export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId") || "1";
  const { data, error } = await supabaseAdmin
    .from("message_templates")
    .select("id, channel, name, subject, body, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[TEMPLATES][GET]", error.message);
    return NextResponse.json({ error: "Failed to fetch templates", code: "TEMPLATES_FETCH_ERROR", details: error.message }, { status: 500 });
  }
  return NextResponse.json({ templates: data });
}

// POST: Create new template
export async function POST(req: NextRequest) {
  const { org_id, channel, name, subject, body } = await req.json();
  const { data, error } = await supabaseAdmin
    .from("message_templates")
    .insert([{ org_id, channel, name, subject, body }])
    .select()
    .single();
  if (error) {
    console.error("[TEMPLATES][POST]", error.message);
    return NextResponse.json({ error: "Failed to create template", code: "TEMPLATES_CREATE_ERROR", details: error.message }, { status: 500 });
  }
  return NextResponse.json({ template: data });
}

// PATCH: Update template
export async function PATCH(req: NextRequest) {
  const { id, ...fields } = await req.json();
  const { error } = await supabaseAdmin
    .from("message_templates")
    .update(fields)
    .eq("id", id);
  if (error) {
    console.error("[TEMPLATES][PATCH]", error.message);
    return NextResponse.json({ error: "Failed to update template", code: "TEMPLATES_UPDATE_ERROR", details: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

// DELETE: Remove template
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const { error } = await supabaseAdmin
    .from("message_templates")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("[TEMPLATES][DELETE]", error.message);
    return NextResponse.json({ error: "Failed to delete template", code: "TEMPLATES_DELETE_ERROR", details: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
