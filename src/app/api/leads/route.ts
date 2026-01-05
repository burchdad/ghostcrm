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

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const stage = url.searchParams.get("stage") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "25", 10);
  const offset = (page - 1) * limit;

  try {
    // Get authenticated user (this also checks if authenticated)
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      console.log('❌ [LEADS API] Authentication failed or no organization');
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build query for leads with contact information
    let query = supabaseAdmin
      .from("leads")
      .select(
        `
        *,
        contacts:contact_id (
          first_name,
          last_name,
          email,
          phone,
          company
        )
      `,
        { count: "exact" }
      )
      .eq("organization_id", user.organizationId);

    // Apply filters
    if (stage) {
      query = query.eq("stage", stage);
    }

    if (search) {
      query = query.or(
        [
          `title.ilike.%${search}%`,
          `description.ilike.%${search}%`,
          `assigned_to.ilike.%${search}%`,
          `source.ilike.%${search}%`,
        ].join(",")
      );
    }

    // Apply pagination and ordering
    const {
      data: leads,
      count,
      error,
    } = await query
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Database error fetching leads:", error);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Transform data to match frontend expectations
    const transformedLeads = (leads || []).map((lead: any) => ({
      id: lead.id,
      "Full Name":
        lead.title ||
        (lead.contacts
          ? (
              `${lead.contacts.first_name || ""} ${
                lead.contacts.last_name || ""
              }`
            )
              .trim()
              .replace(/^$/, "Unknown")
          : "Unknown"),
      "Email Address": lead.email || lead.contacts?.email || "",
      "Phone Number": lead.contacts?.phone || "",
      "Company": lead.contacts?.company || "",
      "Stage": lead.stage || "new",
      "Value": lead.value || 0,
      "Priority": lead.priority || "medium",
      "Source": lead.source || "unknown",
      "Description": lead.description || "",
      "Assigned To": lead.assigned_to || "",
      "Expected Close": lead.expected_close_date || "",
      "Probability": lead.probability || 0,
      "Tags": lead.tags || [],
      "Created": lead.created_at,
      "Updated": lead.updated_at,
      // Keep original fields for compatibility
      ...lead,
      // Map database fields to expected names
      est_value: lead.value,
      full_name:
        lead.title ||
        (lead.contacts
          ? `${lead.contacts.first_name || ""} ${
              lead.contacts.last_name || ""
            }`.trim()
          : ""),
      contact_email: lead.email || lead.contacts?.email,
      contact_phone: lead.contacts?.phone,
      org_id: lead.organization_id,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        records: transformedLeads,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Leads GET API error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check authentication using our server utility (same as GET)
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

    // Create / upsert contact first if provided
    let contactId: string | null = null;
    if (body.email || body.phone || body["Email Address"] || body["Phone Number"]) {
      const contactData = {
        organization_id: user.organizationId,
        first_name:
          body.first_name ||
          body.Full_Name?.split(" ")[0] ||
          body["Full Name"]?.split(" ")[0] ||
          "",
        last_name:
          body.last_name ||
          body.Full_Name?.split(" ").slice(1).join(" ") ||
          body["Full Name"]?.split(" ").slice(1).join(" ") ||
          "",
        email: body.email || body["Email Address"] || null,
        phone: body.phone || body["Phone Number"] || null,
        company: body.company || body.Company || null,
      };

      // Try to find existing contact first
      const { data: existingContact } = await supabaseAdmin
        .from("contacts")
        .select("id")
        .eq("organization_id", user.organizationId)
        .eq("email", contactData.email)
        .maybeSingle();

      if (existingContact) {
        contactId = existingContact.id;
      } else {
        // Create new contact
        const { data: contact, error: contactError } = await supabaseAdmin
          .from("contacts")
          .insert(contactData)
          .select("id")
          .single();

        if (contactError) {
          console.error("Contact creation failed:", contactError);
        } else {
          contactId = contact?.id ?? null;
        }
      }
    }

    // Create lead data with enhanced fields
    const leadData = {
      organization_id: user.organizationId,
      contact_id: contactId,
      title:
        body.title ||
        body["Full Name"] ||
        body.Full_Name ||
        `${body.first_name || ""} ${body.last_name || ""}`.trim() ||
        "New Lead",
      description: body.description || body.Description || "",
      value: body.value || body.Value || body.est_value || 0,
      budget: body.budget || body.Budget || parseFloat(body.budget_amount) || null,
      budget_range: body.budget_range || body.budget || "",
      currency: body.currency || "USD",
      stage: body.stage || body.Stage || "new",
      priority: body.priority || body.Priority || "medium",
      source: body.source || body.Source || "unknown",
      assigned_to: body.assigned_to || body["Assigned To"] || "",
      expected_close_date:
        body.expected_close_date || body["Expected Close"] || null,
      probability: body.probability || body.Probability || 0,
      
      // New enhanced fields
      email: body.email || body["Email Address"] || null,
      address: body.address || body.Address || null,
      city: body.city || body.City || null,
      state: body.state || body.State || null,
      zip_code: body.zip_code || body.zipCode || body.ZipCode || null,
      country: body.country || body.Country || "USA",
      timeframe: body.timeframe || body.Timeframe || null,
      vehicle_interest: body.vehicle_interest || body.vehicleInterest || null,
      lead_score: body.lead_score || parseInt(body.leadScore) || 50,
      referred_by: body.referred_by || body.referredBy || null,
      campaign_source: body.campaign_source || body.campaignSource || null,
      
      tags: body.tags || body.Tags || [],
      custom_fields: body.custom_fields || {},
    };

    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error("Error creating lead:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create lead" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log audit event
    await supabaseAdmin.from("audit_events").insert({
      organization_id: user.organizationId,
      entity: "lead",
      entity_id: lead.id,
      action: "create",
      user_id: user.id,
    });

    return new Response(JSON.stringify({ success: true, data: lead }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Lead creation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('PUT request received with body:', body);
    
    const { id, ...updateData } = body;

    if (!id) {
      console.log('No ID provided in request');
      return new Response(JSON.stringify({ error: "Lead ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check authentication using our server utility (same as GET)
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

    // Update lead - try to update actual columns first, fallback to custom_fields
    const updatePayload: any = {
      title: updateData.title,
      description: updateData.description,
      value: updateData.value || updateData.budget, // Use budget as fallback for value
      stage: updateData.stage,
      priority: updateData.priority,
      source: updateData.source,
      assigned_to: updateData.assigned_to,
      expected_close_date: updateData.expected_close_date,
      probability: updateData.probability || updateData.lead_score, // Use lead_score as fallback
      tags: updateData.tags,
      updated_at: new Date().toISOString(),
    };

    // Add enhanced fields if they exist in the schema
    if (updateData.email !== undefined) updatePayload.email = updateData.email;
    if (updateData.address !== undefined) updatePayload.address = updateData.address;
    if (updateData.city !== undefined) updatePayload.city = updateData.city;
    if (updateData.state !== undefined) updatePayload.state = updateData.state;
    if (updateData.zip_code !== undefined) updatePayload.zip_code = updateData.zip_code;
    if (updateData.country !== undefined) updatePayload.country = updateData.country;
    if (updateData.budget !== undefined) updatePayload.budget = updateData.budget;
    if (updateData.budget_range !== undefined) updatePayload.budget_range = updateData.budget_range;
    if (updateData.timeframe !== undefined) updatePayload.timeframe = updateData.timeframe;
    if (updateData.vehicle_interest !== undefined) updatePayload.vehicle_interest = updateData.vehicle_interest;
    if (updateData.lead_score !== undefined) updatePayload.lead_score = updateData.lead_score;
    if (updateData.referred_by !== undefined) updatePayload.referred_by = updateData.referred_by;
    if (updateData.campaign_source !== undefined) updatePayload.campaign_source = updateData.campaign_source;

    // Always store in custom_fields as backup
    const enhancedCustomFields = {
      ...updateData.custom_fields,
      email: updateData.email,
      address: updateData.address,
      city: updateData.city,
      state: updateData.state,
      zip_code: updateData.zip_code,
      country: updateData.country,
      budget: updateData.budget,
      budget_range: updateData.budget_range,
      timeframe: updateData.timeframe,
      vehicle_interest: updateData.vehicle_interest,
      lead_score: updateData.lead_score,
      referred_by: updateData.referred_by,
      campaign_source: updateData.campaign_source,
    };
    
    updatePayload.custom_fields = enhancedCustomFields;

    console.log('Updating lead with payload:', JSON.stringify(updatePayload, null, 2));

    // Try the update
    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .update(updatePayload)
      .eq("id", id)
      .eq("organization_id", user.organizationId)
      .select()
      .single();

    console.log('Database update result:', { data: lead, error });
    
    if (error) {
      console.error("Database error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // If it's a column doesn't exist error, try updating custom_fields only
      if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        console.log('Column error detected, falling back to custom_fields only');
        const fallbackPayload = {
          custom_fields: updatePayload.custom_fields,
          updated_at: new Date().toISOString()
        };
        
        const { data: fallbackLead, error: fallbackError } = await supabaseAdmin
          .from("leads")
          .update(fallbackPayload)
          .eq("id", id)
          .eq("organization_id", user.organizationId)
          .select()
          .single();
          
        console.log('Fallback update result:', { data: fallbackLead, error: fallbackError });
        
        if (fallbackError) {
          return new Response(
            JSON.stringify({ error: "Failed to update lead even with fallback" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
        
        // Log audit event
        await supabaseAdmin.from("audit_events").insert({
          organization_id: user.organizationId,
          entity: "lead",
          entity_id: id,
          action: "update",
          user_id: user.id,
        });

        return new Response(JSON.stringify({ success: true, data: fallbackLead }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(
          JSON.stringify({ error: "Failed to update lead" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Log audit event
    await supabaseAdmin.from("audit_events").insert({
      organization_id: user.organizationId,
      entity: "lead",
      entity_id: id,
      action: "update",
      user_id: user.id,
    });

    return new Response(JSON.stringify({ success: true, data: lead }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Lead update error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Lead ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check authentication using our server utility (same as GET)
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

    // Delete lead
    const { error } = await supabaseAdmin
      .from("leads")
      .delete()
      .eq("id", id)
      .eq("organization_id", user.organizationId);

    if (error) {
      console.error("Error deleting lead:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete lead" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log audit event
    await supabaseAdmin.from("audit_events").insert({
      organization_id: user.organizationId,
      entity: "lead",
      entity_id: id,
      action: "delete",
      user_id: user.id,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Lead deletion error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
