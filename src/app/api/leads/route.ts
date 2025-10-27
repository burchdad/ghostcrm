



import { NextRequest } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";
import { LeadCreate } from "@/lib/validators";
import { getMembershipOrgId } from "@/lib/rbac";
import { ok, bad, oops } from "@/lib/http";

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const url = new URL(req.url);
  const stage = url.searchParams.get("stage") ?? undefined;

  try {
    // Check for demo mode first by looking at JWT token
    const token = req.cookies.get("ghostcrm_jwt")?.value;
    let isDemoMode = false;
    let demoOrgId = null;
    
    console.log(`🔍 Checking for demo mode. Token exists: ${!!token}`);
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const jwtSecret = process.env.JWT_SECRET;
        console.log(`🔍 JWT Secret available: ${!!jwtSecret}`);
        
        if (jwtSecret) {
          const decoded = jwt.verify(token, jwtSecret) as any;
          console.log(`🔍 JWT decoded successfully. UserID: ${decoded.userId}, OrgID: ${decoded.orgId}`);
          
          if (decoded.userId === 'demo-user-id') {
            isDemoMode = true;
            demoOrgId = decoded.orgId || 'demo-org-id';
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
      // Get the current organization ID for proper multi-tenant filtering
      org_id = await getMembershipOrgId(s);
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
    let q = s.from("leads")
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
      
    if (stage) q = q.eq("stage", stage);

    const { data, error } = await q;
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
      org_id: lead.organization_id,
      opted_out: false // Add for compatibility with frontend filtering
    }));

    console.log(`✅ Returning ${transformedLeads.length} leads for organization: ${org_id}`);
    return ok({ records: transformedLeads }, res.headers);
  } catch (err) {
    console.error("Leads API error:", err);
    return ok({ records: [] }, res.headers);
  }
}

export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const parsed = LeadCreate.safeParse(await req.json());
  if (!parsed.success) return bad(parsed.error.errors[0].message);

  const org_id = await getMembershipOrgId(s);
  if (!org_id) return bad("no_membership");

  const body = parsed.data;

  // Upsert contact for this org (only if email/phone provided)
  let contactId: number | null = null;
  if (body.email || body.phone) {
    const { data: contact, error: cErr } = await s
      .from("contacts")
      .upsert({
        org_id,
        first_name: body.first_name,
        last_name: body.last_name ?? "",
        email: body.email ?? null,
        phone: body.phone ?? null,
        data: body.meta ?? {},
      })
      .select("id")
      .single();
    if (cErr) return oops(cErr.message);
    contactId = (contact as any)?.id ?? null;
  }

  const { data: lead, error } = await s
    .from("leads")
    .insert({
      org_id,
      contact_id: contactId,
      full_name: `${body.first_name}${body.last_name ? " " + body.last_name : ""}`,
      stage: body.stage ?? "new",
      campaign: body.campaign ?? null,
      est_value: body.est_value ?? null,
      contact_email: body.email ?? null,
      contact_phone: body.phone ?? null,
      meta: body.meta ?? {},
    })
    .select()
    .single();

  if (error) return oops(error.message);
  await s.from("audit_events").insert({ org_id, entity: "lead", entity_id: lead.id, action: "create" });

  return ok(lead, res.headers);
}

