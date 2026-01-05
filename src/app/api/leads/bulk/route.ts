import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = "nodejs";

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check authentication using our server utility
    if (!(await isAuthenticated(req))) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return new Response(JSON.stringify({ error: "User organization not found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { leads = [] } = body;
    
    if (!Array.isArray(leads) || leads.length === 0) {
      return new Response(JSON.stringify({ error: "No leads provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const results = {
      created: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process each lead
    for (const leadData of leads) {
      try {
        // Create / upsert contact first if provided
        let contactId: string | null = null;
        if (leadData.email || leadData.phone) {
          const { data: contact, error: contactError } = await supabaseAdmin
            .from("contacts")
            .upsert(
              {
                organization_id: user.organizationId,
                first_name: leadData.fullName?.split(" ")[0] || "",
                last_name: leadData.fullName?.split(" ").slice(1).join(" ") || "",
                email: leadData.email || null,
                phone: leadData.phone || null,
                company: leadData.company || null,
              },
              { onConflict: "organization_id,email" }
            )
            .select("id")
            .single();

          if (!contactError) {
            contactId = contact?.id ?? null;
          }
        }

        // Create lead
        const { error } = await supabaseAdmin
          .from("leads")
          .insert({
            organization_id: user.organizationId,
            contact_id: contactId,
            title: leadData.fullName || "Imported Lead",
            description: leadData.notes || "",
            value: 0,
            currency: "USD",
            stage: "new",
            priority: "medium",
            source: leadData.source || "bulk_import",
            assigned_to: "",
            expected_close_date: null,
            probability: 0,
            tags: [],
            custom_fields: {},
          });

        if (error) {
          console.error("Error creating lead:", error);
          results.failed++;
          results.errors.push(`Failed to create lead for ${leadData.fullName}: ${error.message}`);
        } else {
          results.created++;
        }

      } catch (err) {
        console.error("Error processing lead:", err);
        results.failed++;
        results.errors.push(`Failed to process lead for ${leadData.fullName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Log audit event for bulk import
    await supabaseAdmin.from("audit_events").insert({
      organization_id: user.organizationId,
      entity: "lead",
      entity_id: null, // bulk operation, no specific entity ID
      action: "bulk_create",
      user_id: user.id,
      details: { created: results.created, failed: results.failed }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data: results,
      message: `Successfully imported ${results.created} leads${results.failed > 0 ? ` (${results.failed} failed)` : ''}`
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Bulk lead creation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}