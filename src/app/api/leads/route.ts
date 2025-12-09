



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
            console.log(`🎬 Demo mode detected for leads API, using org ID: ${demoOrgId}`);
          }
        }
      } catch (jwtError) {
        console.log("JWT verification failed:", jwtError);
      }
    }

    let org_id;
    
    if (isDemoMode) {
      org_id = demoOrgId;
      console.log(`🎬 Demo mode - returning mock leads for org: ${org_id}`);
      
      // Return mock demo leads instead of querying database
      const mockLeads = [
        {
          id: 'demo-lead-1',
          organization_id: 'demo-org-id',
          contact_id: 'demo-contact-1',
          stage: 'qualified',
          source: 'website',
          interest_level: 'high',
          budget_range: '$25,000-$35,000',
          vehicle_interest: '2024 Toyota Camry',
          notes: 'Interested in financing options',
          created_at: '2025-10-25T10:00:00Z',
          updated_at: '2025-10-26T14:30:00Z',
          contacts: {
            first_name: 'John',
            last_name: 'Smith',
            email: 'john.smith@email.com',
            phone: '(555) 123-4567',
            company: 'Smith Enterprises'
          }
        },
        {
          id: 'demo-lead-2',
          organization_id: 'demo-org-id',
          contact_id: 'demo-contact-2',
          stage: 'new',
          source: 'referral',
          interest_level: 'medium',
          budget_range: '$40,000-$50,000',
          vehicle_interest: '2024 Honda Accord',
          notes: 'Referred by existing customer',
          created_at: '2025-10-25T15:30:00Z',
          updated_at: '2025-10-26T09:15:00Z',
          contacts: {
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah.j@email.com',
            phone: '(555) 987-6543',
            company: null
          }
        },
        {
          id: 'demo-lead-3',
          organization_id: 'demo-org-id',
          contact_id: 'demo-contact-3',
          stage: 'contacted',
          source: 'facebook',
          interest_level: 'high',
          budget_range: '$60,000+',
          vehicle_interest: '2024 BMW X5',
          notes: 'Looking for luxury SUV with latest features',
          created_at: '2025-10-24T08:45:00Z',
          updated_at: '2025-10-26T11:20:00Z',
          contacts: {
            first_name: 'Michael',
            last_name: 'Davis',
            email: 'mdavis@email.com',
            phone: '(555) 456-7890',
            company: 'Davis Industries'
          }
        }
      ];
      
      // Filter by stage if specified
      const filteredLeads = stage ? mockLeads.filter(lead => lead.stage === stage) : mockLeads;
      
      // Transform to match frontend expectations
      const transformedLeads = filteredLeads.map(lead => ({
        id: lead.id,
        organization_id: lead.organization_id,
        contact_id: lead.contact_id,
        "Full Name": `${lead.contacts.first_name} ${lead.contacts.last_name}`,
        "Email Address": lead.contacts.email,
        "Phone Number": lead.contacts.phone,
        "Company": lead.contacts.company,
        "Stage": lead.stage,
        "Source": lead.source,
        "Interest Level": lead.interest_level,
        "Budget Range": lead.budget_range,
        "Vehicle Interest": lead.vehicle_interest,
        "Notes": lead.notes,
        "Created Date": lead.created_at,
        "Updated Date": lead.updated_at,
        // Keep original field names for API compatibility
        first_name: lead.contacts.first_name,
        last_name: lead.contacts.last_name,
        email: lead.contacts.email,
        phone: lead.contacts.phone,
        company: lead.contacts.company,
        stage: lead.stage,
        source: lead.source,
        interest_level: lead.interest_level,
        budget_range: lead.budget_range,
        vehicle_interest: lead.vehicle_interest,
        notes: lead.notes,
        created_at: lead.created_at,
        updated_at: lead.updated_at
      }));
      
      console.log(`✅ Returning ${transformedLeads.length} demo leads`);
      return ok({ records: transformedLeads }, res.headers);
    } else {
      // Get the current organization ID - try JWT first, then membership lookup
      if (jwtOrgId && jwtUserId) {
        console.log(`🔍 Using JWT organization ID: ${jwtOrgId} for user: ${jwtUserId}`);
        
        // If JWT contains subdomain, look up the actual UUID
        if (typeof jwtOrgId === 'string' && !jwtOrgId.match(/^[0-9a-f-]{36}$/i)) {
          console.log(`🔍 JWT contains subdomain '${jwtOrgId}', looking up organization UUID`);
          const { data: orgData, error: orgError } = await supabaseAdmin
            .from("organizations")
            .select("id, subdomain, name")
            .eq("subdomain", jwtOrgId)
            .single();
            
          console.log(`🔍 Organization lookup result:`, { orgData, error: orgError });
            
          if (orgError || !orgData) {
            console.error(`❌ Could not find organization with subdomain: ${jwtOrgId}`, orgError?.message);
            org_id = null;
          } else {
            org_id = orgData.id;
            console.log(`✅ Found organization UUID: ${org_id} for subdomain: ${jwtOrgId}`);
          }
        } else {
          org_id = jwtOrgId;
          console.log(`🔍 Using JWT org_id directly (already UUID): ${org_id}`);
        }
      } else {
        // Fall back to membership lookup
        console.log(`🔍 No JWT org/user found, falling back to membership lookup`);
        org_id = await getMembershipOrgId(s);
        console.log(`🔍 Membership lookup result: ${org_id}`);
      }
      
      if (!org_id) {
        console.warn("No organization membership found for user");
        
        // FALLBACK: If no authentication but accessing leads page, 
        // return demo leads for demonstration purposes
        console.log("🎭 Fallback: Returning demo leads for unauthenticated access");
        const demoLeads = [
          {
            id: 'fallback-lead-1',
            organization_id: 'fallback-org',
            contact_id: 'fallback-contact-1',
            "Full Name": 'Demo Lead',
            "Email Address": 'demo.lead@example.com',
            "Phone Number": '(555) 000-0000',
            "Company": 'Demo Company',
            "Stage": 'new',
            "Source": 'demo',
            "Interest Level": 'high',
            "Budget Range": '$30,000-$40,000',
            "Vehicle Interest": 'Demo Vehicle',
            "Notes": 'This is a demo lead for testing purposes',
            "Created Date": new Date().toISOString(),
            "Updated Date": new Date().toISOString(),
            // Keep original field names for API compatibility
            first_name: 'Demo',
            last_name: 'Lead',
            email: 'demo.lead@example.com',
            phone: '(555) 000-0000',
            company: 'Demo Company',
            stage: 'new',
            source: 'demo',
            interest_level: 'high',
            budget_range: '$30,000-$40,000',
            vehicle_interest: 'Demo Vehicle',
            notes: 'This is a demo lead for testing purposes',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        return ok({ records: demoLeads }, res.headers);
      }
    }

    console.log(`✅ Found organization ID: ${org_id}`);

    // Query leads with contact information
    console.log(`🔍 Querying leads for organization: ${org_id}`);
    let q = supabaseAdmin.from("leads")
      .select(`
        *,
        contacts:contact_id (
          first_name,
          last_name,
          email,
          phone,
          company
        )
      `)
      .eq("organization_id", org_id)
      .order("updated_at", { ascending: false })
      .limit(200);
      
    if (stage) {
      q = q.eq("stage", stage);
      console.log(`🔍 Filtering by stage: ${stage}`);
    }

    const { data, error } = await q;
    console.log(`🔍 Database query completed:`, { 
      recordCount: data?.length || 0, 
      error: error?.message || null,
      sampleRecord: data?.[0] ? {
        id: data[0].id,
        title: data[0].title,
        organization_id: data[0].organization_id,
        stage: data[0].stage,
        industry: data[0].industry
      } : null
    });
    
    if (error) {
      console.error("Leads table error:", error.message);
      return ok({ records: [] }, res.headers);
    }

    // Transform data to match frontend expectations
    const transformedLeads = (data || []).map(lead => ({
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
      // NOTE: Removed opted_out field since it doesn't exist in database
    }));

    console.log(`✅ Returning ${transformedLeads.length} leads for organization: ${org_id}`);
    console.log('🔍 Sample transformed lead:', transformedLeads[0]);
    console.log('🔍 Full API response structure:', { 
      records: transformedLeads,
      recordCount: transformedLeads.length,
      sampleKeys: transformedLeads[0] ? Object.keys(transformedLeads[0]) : []
    });
    
    return ok({ records: transformedLeads }, res.headers);
  } catch (err) {
    console.error("Leads API error:", err);
    return ok({ records: [] }, res.headers);
  }
}

export async function POST(req: NextRequest) {
  console.log('🚀 POST /api/leads - Starting request');
  
  const { s, res } = supaFromReq(req);
  
  try {
    const requestBody = await req.json();
    console.log('📥 Request body received:', JSON.stringify(requestBody, null, 2));
    
    const parsed = LeadCreate.safeParse(requestBody);
    console.log('🔍 Validation result:', {
      success: parsed.success,
      error: parsed.success ? null : parsed.error.errors
    });
    
    if (!parsed.success) {
      console.error('❌ Validation failed:', parsed.error.errors);
      return bad(parsed.error.errors[0].message);
    }

    const org_id = await getMembershipOrgId(s);
    console.log('🏢 Organization ID resolved:', org_id);
    
    if (!org_id) {
      console.error('❌ No organization found');
      return bad("no_membership");
    }

    const body = parsed.data;
    console.log('📝 Parsed data:', body);

    // Upsert contact for this org (only if email/phone provided)
    let contactId: number | null = null;
    if (body.email || body.phone) {
      console.log('👤 Creating/updating contact...');
      
      const { data: contact, error: cErr } = await s
        .from("contacts")
        .upsert({
          organization_id: org_id,
          first_name: body.first_name,
          last_name: body.last_name ?? "",
          email: body.email ?? null,
          phone: body.phone ?? null,
          custom_fields: body.meta ?? {},
        })
        .select("id")
        .single();
        
      console.log('👤 Contact result:', { contact, error: cErr });
      
      if (cErr) {
        console.error('❌ Contact creation failed:', cErr);
        return oops(cErr.message);
      }
      contactId = (contact as any)?.id ?? null;
      console.log('👤 Contact ID:', contactId);
    }

    console.log('🎯 Creating lead...');
    const { data: lead, error } = await s
      .from("leads")
      .insert({
        organization_id: org_id,
        contact_id: contactId,
        title: `${body.first_name}${body.last_name ? " " + body.last_name : ""}`,
        stage: body.stage ?? "new",
        value: body.est_value ?? null,
        description: `Lead created for ${body.first_name}${body.last_name ? " " + body.last_name : ""}`,
        source: body.campaign ?? "website",
        priority: "medium"
      })
      .select()
      .single();

    console.log('🎯 Lead result:', { lead, error });

    if (error) {
      console.error('❌ Lead creation failed:', error);
      return oops(error.message);
    }
    
    await s.from("audit_events").insert({ organization_id: org_id, entity: "lead", entity_id: lead.id, action: "create" });

    console.log('✅ Lead created successfully:', lead.id);
    return ok(lead, res.headers);
  } catch (err) {
    console.error('❌ Unexpected error in POST /api/leads:', err);
    return oops("Unexpected error occurred");
  }
}


