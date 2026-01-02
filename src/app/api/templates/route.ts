import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

// GET: List message templates
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Get the authenticated user from Supabase SSR
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant context from user metadata
    const tenantId = user.user_metadata?.tenant_id || user.user_metadata?.organization_id;
    
    if (!tenantId) {
      return NextResponse.json({ error: 'No organization context' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("message_templates")
      .select("id, channel, name, subject, body, created_at")
      .eq("org_id", tenantId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[TEMPLATES][GET]", error.message);
      return NextResponse.json({ error: "Failed to fetch templates", code: "TEMPLATES_FETCH_ERROR", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ templates: data });
  } catch (error) {
    console.error('Templates fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new template
export async function POST(req: NextRequest) {
  try {
    const { channel, name, subject, body } = await req.json();
    
    const supabase = await createSupabaseServer();
    
    // Get the authenticated user from Supabase SSR
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant context from user metadata
    const tenantId = user.user_metadata?.tenant_id || user.user_metadata?.organization_id;
    
    if (!tenantId) {
      return NextResponse.json({ error: 'No organization context' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("message_templates")
      .insert([{ org_id: tenantId, channel, name, subject, body }])
      .select()
      .single();
    if (error) {
      console.error("[TEMPLATES][POST]", error.message);
      return NextResponse.json({ error: "Failed to create template", code: "TEMPLATES_CREATE_ERROR", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ template: data });
  } catch (error) {
    console.error('Template creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update template
export async function PATCH(req: NextRequest) {
  try {
    const { id, ...fields } = await req.json();
    
    const supabase = await createSupabaseServer();
    
    // Get the authenticated user from Supabase SSR
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant context from user metadata
    const tenantId = user.user_metadata?.tenant_id || user.user_metadata?.organization_id;
    
    if (!tenantId) {
      return NextResponse.json({ error: 'No organization context' }, { status: 400 });
    }

    const { error } = await supabase
      .from("message_templates")
      .update(fields)
      .eq("id", id)
      .eq("org_id", tenantId);
    if (error) {
      console.error("[TEMPLATES][PATCH]", error.message);
      return NextResponse.json({ error: "Failed to update template", code: "TEMPLATES_UPDATE_ERROR", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Template update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove template
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    
    const supabase = await createSupabaseServer();
    
    // Get the authenticated user from Supabase SSR
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant context from user metadata
    const tenantId = user.user_metadata?.tenant_id || user.user_metadata?.organization_id;
    
    if (!tenantId) {
      return NextResponse.json({ error: 'No organization context' }, { status: 400 });
    }

    const { error } = await supabase
      .from("message_templates")
      .delete()
      .eq("id", id)
      .eq("org_id", tenantId);
      
    if (error) {
      console.error("[TEMPLATES][DELETE]", error.message);
      return NextResponse.json({ error: "Failed to delete template", code: "TEMPLATES_DELETE_ERROR", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Template deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
