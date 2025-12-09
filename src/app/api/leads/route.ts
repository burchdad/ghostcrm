



import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const stage = url.searchParams.get("stage") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "25");
  const offset = (page - 1) * limit;

  try {
    // Get authenticated user and organization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from('user_organizations')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (orgError || !userOrg) {
      return new Response(JSON.stringify({ error: 'No organization found' }), { status: 403 });
    }

    // Build query for leads with contact information
    let query = supabaseAdmin
      .from('leads')
      .select(`
        *,
        contacts:contact_id (
          first_name,
          last_name,
          email,
          phone,
          company
        )
      `, { count: 'exact' })
      .eq('organization_id', userOrg.organization_id);

    // Apply filters
    if (stage) {
      query = query.eq('stage', stage);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,assigned_to.ilike.%${search}%,source.ilike.%${search}%`
      );
    }

    // Apply pagination and ordering
    const { data: leads, count, error } = await query
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error fetching leads:', error);
      return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
    }

    // Transform data to match frontend expectations
    const transformedLeads = (leads || []).map(lead => ({
      id: lead.id,
      "Full Name": lead.title || 
        (lead.contacts ? 
          `${lead.contacts.first_name || ''} ${lead.contacts.last_name || ''}`.trim() || 
          'Unknown' : 'Unknown'),
      "Email Address": lead.contacts?.email || '',
      "Phone Number": lead.contacts?.phone || '',
      "Company": lead.contacts?.company || '',
      "Stage": lead.stage || 'new',
      "Value": lead.value || 0,
      "Priority": lead.priority || 'medium',
      "Source": lead.source || 'unknown',
      "Description": lead.description || '',
      "Assigned To": lead.assigned_to || '',
      "Expected Close": lead.expected_close_date || '',
      "Probability": lead.probability || 0,
      "Tags": lead.tags || [],
      "Created": lead.created_at,
      "Updated": lead.updated_at,
      // Keep original fields for compatibility
      ...lead,
      // Map database fields to expected names
      est_value: lead.value,
      full_name: lead.title || (lead.contacts ? 
        `${lead.contacts.first_name || ''} ${lead.contacts.last_name || ''}`.trim() : ''),
      contact_email: lead.contacts?.email,
      contact_phone: lead.contacts?.phone,
      org_id: lead.organization_id
    }));

    return new Response(JSON.stringify({
      success: true,
      records: transformedLeads,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Leads API error:", err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get authenticated user and organization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !userOrg) {
      return new Response(JSON.stringify({ error: 'No organization found' }), { status: 403 });
    }

    // Create contact first if provided
    let contactId: string | null = null;
    if (body.email || body.phone) {
      const { data: contact, error: contactError } = await supabaseAdmin
        .from("contacts")
        .upsert({
          organization_id: userOrg.organization_id,
          first_name: body.first_name || body.Full_Name?.split(' ')[0] || '',
          last_name: body.last_name || body.Full_Name?.split(' ').slice(1).join(' ') || '',
          email: body.email || body['Email Address'] || null,
          phone: body.phone || body['Phone Number'] || null,
          company: body.company || body.Company || null,
        })
        .select("id")
        .single();
        
      if (contactError) {
        console.error('Contact creation failed:', contactError);
      } else {
        contactId = contact?.id;
      }
    }

    // Create lead data
    const leadData = {
      organization_id: userOrg.organization_id,
      contact_id: contactId,
      title: body.title || body['Full Name'] || `${body.first_name || ''} ${body.last_name || ''}`.trim() || 'New Lead',
      description: body.description || body.Description || '',
      value: body.value || body.Value || body.est_value || 0,
      currency: body.currency || 'USD',
      stage: body.stage || body.Stage || 'new',
      priority: body.priority || body.Priority || 'medium',
      source: body.source || body.Source || 'unknown',
      assigned_to: body.assigned_to || body['Assigned To'] || '',
      expected_close_date: body.expected_close_date || body['Expected Close'] || null,
      probability: body.probability || body.Probability || 0,
      tags: body.tags || body.Tags || [],
      custom_fields: body.custom_fields || {}
    };

    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      return new Response(JSON.stringify({ error: 'Failed to create lead' }), { status: 500 });
    }

    // Log audit event
    await supabaseAdmin.from("audit_events").insert({ 
      organization_id: userOrg.organization_id, 
      entity: "lead", 
      entity_id: lead.id, 
      action: "create",
      user_id: user.id
    });

    return new Response(JSON.stringify({ success: true, data: lead }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Lead creation error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Lead ID required' }), { status: 400 });
    }

    // Get authenticated user and organization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !userOrg) {
      return new Response(JSON.stringify({ error: 'No organization found' }), { status: 403 });
    }

    // Update lead
    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .update({
        title: updateData.title,
        description: updateData.description,
        value: updateData.value,
        stage: updateData.stage,
        priority: updateData.priority,
        source: updateData.source,
        assigned_to: updateData.assigned_to,
        expected_close_date: updateData.expected_close_date,
        probability: updateData.probability,
        tags: updateData.tags,
        custom_fields: updateData.custom_fields,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', userOrg.organization_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead:', error);
      return new Response(JSON.stringify({ error: 'Failed to update lead' }), { status: 500 });
    }

    // Log audit event
    await supabaseAdmin.from("audit_events").insert({ 
      organization_id: userOrg.organization_id, 
      entity: "lead", 
      entity_id: id, 
      action: "update",
      user_id: user.id
    });

    return new Response(JSON.stringify({ success: true, data: lead }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Lead update error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Lead ID required' }), { status: 400 });
    }

    // Get authenticated user and organization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !userOrg) {
      return new Response(JSON.stringify({ error: 'No organization found' }), { status: 403 });
    }

    // Delete lead
    const { error } = await supabaseAdmin
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('organization_id', userOrg.organization_id);

    if (error) {
      console.error('Error deleting lead:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete lead' }), { status: 500 });
    }

    // Log audit event
    await supabaseAdmin.from("audit_events").insert({ 
      organization_id: userOrg.organization_id, 
      entity: "lead", 
      entity_id: id, 
      action: "delete",
      user_id: user.id
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Lead deletion error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}


