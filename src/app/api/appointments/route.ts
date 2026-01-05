import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";
import { ApptCreate } from "@/lib/schemas/appointments";
import { ok, bad, oops } from "@/lib/http";

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!(await isAuthenticated(req))) {
      return bad("Authentication required");
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return bad("User organization not found");
    }

    const organizationId = user.organizationId;
    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? undefined;
    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;

    let q = supabaseAdmin.from("appointments").select("*").eq("organization_id", organizationId).order("starts_at", { ascending: true }).limit(500);
    if (status) q = q.eq("status", status);
    if (from) q = q.gte("starts_at", from);
    if (to) q = q.lte("ends_at", to);

    const { data, error } = await q;
    if (error) return oops(error.message);
    return ok(data);
  } catch (error) {
    console.error('Appointments GET error:', error);
    return oops("Internal server error");
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!(await isAuthenticated(req))) {
      return bad("Authentication required");
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return bad("User organization not found");
    }

    const organizationId = user.organizationId;
    const parsed = ApptCreate.safeParse(await req.json());
    if (!parsed.success) return bad(parsed.error.errors[0].message);
    
    const a = parsed.data;
    const { data: appt, error } = await supabaseAdmin
      .from("appointments")
      .insert({
        organization_id: organizationId,
        title: a.title,
        location: a.location ?? null,
        starts_at: a.starts_at,
        ends_at: a.ends_at,
        lead_id: a.lead_id ?? null,
        owner_id: a.owner_id ?? null,
        status: a.status ?? "scheduled",
      })
      .select()
      .single();

    if (error) return oops(error.message);
    await supabaseAdmin.from("audit_events").insert({ 
      organization_id: organizationId, 
      entity: "appointment", 
      entity_id: appt.id, 
      action: "create" 
    });
    return ok(appt);
  } catch (error) {
    console.error('Appointments POST error:', error);
    return oops("Internal server error");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!(await isAuthenticated(req))) {
      return bad("Authentication required");
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return bad("User organization not found");
    }

    const organizationId = user.organizationId;
    const body = await req.json();
    if (!body?.id) return bad("missing id");

    const patch: Record<string, any> = {};
    for (const k of ["title", "location", "starts_at", "ends_at", "status", "owner_id"]) {
      if (k in body) patch[k] = body[k];
    }

    const { data: appt, error } = await supabaseAdmin
      .from("appointments")
      .update(patch)
      .eq("id", body.id)
      .eq("organization_id", organizationId)
      .select()
      .single();
    
    if (error) return oops(error.message);

    await supabaseAdmin.from("audit_events").insert({ 
      organization_id: organizationId, 
      entity: "appointment", 
      entity_id: body.id, 
      action: "update", 
      diff: patch 
    });
    return ok(appt);
  } catch (error) {
    console.error('Appointments PATCH error:', error);
    return oops("Internal server error");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!(await isAuthenticated(req))) {
      return bad("Authentication required");
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return bad("User organization not found");
    }

    const organizationId = user.organizationId;
    const { id } = await req.json();
    if (!id) return bad("missing id");

    const { error } = await supabaseAdmin
      .from("appointments")
      .delete()
      .eq("id", id)
      .eq("organization_id", organizationId);
    
    if (error) return oops(error.message);

    await supabaseAdmin.from("audit_events").insert({ 
      organization_id: organizationId, 
      entity: "appointment", 
      entity_id: id, 
      action: "delete" 
    });
    return ok({ ok: true });
  } catch (error) {
    console.error('Appointments DELETE error:', error);
    return oops("Internal server error");
  }
}

