

import { NextRequest } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

// Force dynamic rendering for cookies() usage
export const dynamic = 'force-dynamic'

// Auto Dealership Deal Stages in sales process order
const DEALERSHIP_DEAL_STAGES = [
  "prospect",
  "qualified", 
  "proposal",
  "negotiation",
  "financing",
  "paperwork",
  "closed_won",
  "closed_lost"
] as const;

// Deal probability by stage for auto dealership
const STAGE_PROBABILITIES: Record<string, number> = {
  "prospect": 10,
  "qualified": 25,
  "proposal": 40,
  "negotiation": 60,
  "financing": 80,
  "paperwork": 90,
  "closed_won": 100,
  "closed_lost": 0
};

// Calculate total deal amount including all costs
function calculateTotalDealAmount(dealData: any): {
  vehicle_price: number;
  trade_value: number;
  tax_fees: number;
  financing_charges: number;
  total_amount: number;
  customer_out_of_pocket: number;
} {
  const vehicle = dealData.vehicle_details || {};
  const tradeIn = dealData.trade_in || {};
  const taxes = dealData.tax_title_fees || {};
  const financing = dealData.financing || {};
  
  const vehiclePrice = vehicle.selling_price || dealData.amount || 0;
  const tradeValue = tradeIn.trade_value || 0;
  const taxFees = taxes.tax_amount + taxes.title_fee + taxes.doc_fee + taxes.other_fees || 0;
  const financingCharges = financing.finance_charges || 0;
  
  const totalAmount = vehiclePrice + taxFees + financingCharges;
  const customerOutOfPocket = totalAmount - tradeValue;
  
  return {
    vehicle_price: vehiclePrice,
    trade_value: tradeValue,
    tax_fees: taxFees,
    financing_charges: financingCharges,
    total_amount: totalAmount,
    customer_out_of_pocket: customerOutOfPocket
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const stage = url.searchParams.get("stage") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "25");
  const offset = (page - 1) * limit;

  try {
    console.log('🔍 [DEALS] Getting authenticated user...');
    
    const supabase = await createSupabaseServer();
    
    // Get the authenticated user from Supabase SSR
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('❌ [DEALS] No authenticated user:', authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    console.log('✅ [DEALS] User authenticated:', {
      id: user.id,
      email: user.email
    });

    // Get tenant context from user metadata
    const tenantId = user.user_metadata?.tenant_id || user.user_metadata?.organization_id;
    
    if (!tenantId) {
      console.log('❌ [DEALS] No tenant context found for user');
      return new Response(JSON.stringify({ error: 'No organization context' }), { status: 400 });
    }

    console.log('🏢 [DEALS] Using tenant context:', { tenantId });

    // Query deals with RLS - Supabase will automatically filter by user/tenant
    let query = supabase
      .from('deals')
      .select(`
        *,
        leads:lead_id (
          title,
          contact_id,
          contacts:contact_id (
            first_name,
            last_name,
            email,
            phone,
            company
          )
        )
      `, { count: 'exact' })
      .eq('organization_id', userOrg.organization_id);

    // Apply filters
    if (stage) {
      query = query.eq('stage', stage);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,customer_name.ilike.%${search}%,vehicle.ilike.%${search}%`
      );
    }

    // Apply pagination and ordering
    const { data: deals, count, error } = await query
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error fetching deals:', error);
      return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
    }

    // Transform data to match frontend expectations
    const transformedDeals = (deals || []).map(deal => {
      const dealAmounts = calculateTotalDealAmount(deal);
      const contact = deal.leads?.contacts;
      
      return {
        id: deal.id,
        title: deal.title || `${deal.customer_name || 'Unknown Customer'} - ${deal.vehicle || 'Vehicle'}`,
        description: deal.description || '',
        amount: dealAmounts.total_amount,
        stage: deal.stage || 'prospect',
        probability: STAGE_PROBABILITIES[deal.stage] || 0,
        customer_name: deal.customer_name || contact?.first_name + ' ' + contact?.last_name || 'Unknown',
        customer_email: deal.customer_email || contact?.email || '',
        customer_phone: deal.customer_phone || contact?.phone || '',
        vehicle: deal.vehicle || 'Not specified',
        vehicle_details: deal.vehicle_details || {},
        sales_rep: deal.sales_rep || deal.assigned_to || '',
        expected_close_date: deal.expected_close_date,
        trade_in: deal.trade_in || {},
        financing: deal.financing || {},
        tax_title_fees: deal.tax_title_fees || {},
        notes: deal.notes || '',
        created_at: deal.created_at,
        updated_at: deal.updated_at,
        organization_id: deal.organization_id,
        lead_id: deal.lead_id,
        // Additional calculated fields
        vehicle_price: dealAmounts.vehicle_price,
        trade_value: dealAmounts.trade_value,
        tax_fees: dealAmounts.tax_fees,
        financing_charges: dealAmounts.financing_charges,
        customer_out_of_pocket: dealAmounts.customer_out_of_pocket
      };
    });

    return new Response(JSON.stringify({
      success: true,
      deals: transformedDeals,
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
  } catch (error) {
    console.error('Deals fetch error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
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

    // Create deal data
    const dealData = {
      organization_id: userOrg.organization_id,
      title: body.title || `${body.customer_name || 'New Deal'} - ${body.vehicle || 'Vehicle'}`,
      description: body.description || '',
      amount: body.amount || 0,
      currency: body.currency || 'USD',
      stage: body.stage || 'prospect',
      probability: STAGE_PROBABILITIES[body.stage] || 0,
      customer_name: body.customer_name || '',
      customer_email: body.customer_email || '',
      customer_phone: body.customer_phone || '',
      vehicle: body.vehicle || '',
      vehicle_details: body.vehicle_details || {},
      sales_rep: body.sales_rep || body.assigned_to || '',
      assigned_to: body.assigned_to || '',
      expected_close_date: body.expected_close_date || null,
      lead_id: body.lead_id || null,
      trade_in: body.trade_in || {},
      financing: body.financing || {},
      tax_title_fees: body.tax_title_fees || {},
      notes: body.notes || ''
    };

    const { data: deal, error } = await supabaseAdmin
      .from('deals')
      .insert(dealData)
      .select()
      .single();

    if (error) {
      console.error('Error creating deal:', error);
      return new Response(JSON.stringify({ error: 'Failed to create deal' }), { status: 500 });
    }

    // Log audit event
    await supabaseAdmin.from("audit_events").insert({ 
      organization_id: userOrg.organization_id, 
      entity: "deal", 
      entity_id: deal.id, 
      action: "create",
      user_id: user.id
    });

    return new Response(JSON.stringify({ success: true, data: deal }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Deal creation error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Deal ID required' }), { status: 400 });
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

    // Update deal
    const { data: deal, error } = await supabaseAdmin
      .from('deals')
      .update({
        title: updateData.title,
        description: updateData.description,
        amount: updateData.amount,
        stage: updateData.stage,
        probability: updateData.stage ? STAGE_PROBABILITIES[updateData.stage] : updateData.probability,
        customer_name: updateData.customer_name,
        customer_email: updateData.customer_email,
        customer_phone: updateData.customer_phone,
        vehicle: updateData.vehicle,
        vehicle_details: updateData.vehicle_details,
        sales_rep: updateData.sales_rep,
        assigned_to: updateData.assigned_to,
        expected_close_date: updateData.expected_close_date,
        trade_in: updateData.trade_in,
        financing: updateData.financing,
        tax_title_fees: updateData.tax_title_fees,
        notes: updateData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', userOrg.organization_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating deal:', error);
      return new Response(JSON.stringify({ error: 'Failed to update deal' }), { status: 500 });
    }

    // Log audit event
    await supabaseAdmin.from("audit_events").insert({ 
      organization_id: userOrg.organization_id, 
      entity: "deal", 
      entity_id: id, 
      action: "update",
      user_id: user.id
    });

    return new Response(JSON.stringify({ success: true, data: deal }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Deal update error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Deal ID required' }), { status: 400 });
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

    // Delete deal
    const { error } = await supabaseAdmin
      .from('deals')
      .delete()
      .eq('id', id)
      .eq('organization_id', userOrg.organization_id);

    if (error) {
      console.error('Error deleting deal:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete deal' }), { status: 500 });
    }

    // Log audit event
    await supabaseAdmin.from("audit_events").insert({ 
      organization_id: userOrg.organization_id, 
      entity: "deal", 
      entity_id: id, 
      action: "delete",
      user_id: user.id
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Deal deletion error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

