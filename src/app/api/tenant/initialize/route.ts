/**
 * TENANT INITIALIZATION API
 * Creates an organization for the authenticated user and seeds baseline data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supaFromReq } from '@/lib/supa-ssr';
import { getMembershipOrgId } from '@/lib/rbac';

export const runtime = 'nodejs';

type JsonBody = {
  companyName?: string;
  adminEmail?: string;
  industry?: string;
  teamSize?: string;
  subdomain?: string;
};

export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);

  try {
    const body = (await req.json()) as JsonBody;
    const { companyName, adminEmail, industry, teamSize, subdomain } = body;

    console.log('🏢 [TENANT_INIT] Creating organization:', {
      companyName,
      subdomain,
      adminEmail,
    });

    // Validate required fields
    if (!companyName || !adminEmail || !subdomain) {
      return NextResponse.json(
        { error: 'Missing required fields: companyName, adminEmail, subdomain' },
        { status: 400, headers: res.headers }
      );
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!subdomainRegex.test(subdomain) || subdomain.length < 3) {
      return NextResponse.json(
        {
          error:
            'Invalid subdomain format. Must be 3+ characters, lowercase letters, numbers, and hyphens only.',
        },
        { status: 400, headers: res.headers }
      );
    }

    // Get current authenticated user
    const {
      data: { user },
      error: authError,
    } = await s.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: res.headers }
      );
    }

    console.log('🔍 [TENANT_INIT] Using authenticated user:', user.email);

    // Ensure the user doesn't already belong to an org
    const existingOrgId = await getMembershipOrgId(s);
    if (existingOrgId) {
      return NextResponse.json(
        { error: 'User already has an organization' },
        { status: 400, headers: res.headers }
      );
    }

    // Create organization
    const { data: orgData, error: orgError } = await s
      .from('organizations')
      .insert({
        name: companyName,
        subdomain: subdomain.toLowerCase(),
        industry: industry || 'automotive',
        team_size: teamSize || 'small',
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          date_format: 'MM/DD/YYYY',
          first_day_of_week: 'monday',
          business_hours: {
            monday: { start: '09:00', end: '17:00', enabled: true },
            tuesday: { start: '09:00', end: '17:00', enabled: true },
            wednesday: { start: '09:00', end: '17:00', enabled: true },
            thursday: { start: '09:00', end: '17:00', enabled: true },
            friday: { start: '09:00', end: '17:00', enabled: true },
            saturday: { start: '09:00', end: '17:00', enabled: false },
            sunday: { start: '09:00', end: '17:00', enabled: false },
          },
        },
        branding: {
          primary_color: '#3B82F6',
          secondary_color: '#6B7280',
          logo_url: null,
          company_name: companyName,
        },
        plan: 'trial',
        status: 'active',
        created_by: user.id,
      })
      .select('*')
      .single();

    if (orgError || !orgData) {
      console.error('❌ [TENANT_INIT] Failed to create organization:', orgError);
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500, headers: res.headers }
      );
    }

    const organization = orgData;

    // Create membership (owner/admin)
    const { error: membershipError } = await s
      .from('organization_memberships')
      .insert({
        user_id: user.id,
        organization_id: organization.id,
        role: 'owner',
        status: 'active',
        tier: 'basic',
      });

    if (membershipError) {
      console.error('❌ [TENANT_INIT] Membership creation error:', membershipError);
      // Cleanup: delete org if membership fails
      await s.from('organizations').delete().eq('id', organization.id);
      return NextResponse.json(
        { error: 'Failed to create user membership' },
        { status: 500, headers: res.headers }
      );
    }

    // Initialize baseline data for the org
    try {
      await initializeEmptyTenantData(s, organization.id, user.id);
    } catch (seedErr) {
      console.error('❌ [TENANT_INIT] Seeding error, rolling back org:', seedErr);
      // Best-effort cleanup if seeding fails
      await s.from('organization_memberships').delete().eq('organization_id', organization.id);
      await s.from('organizations').delete().eq('id', organization.id);
      return NextResponse.json(
        { error: 'Failed to set up organization' },
        { status: 500, headers: res.headers }
      );
    }

    // Audit entry (best-effort)
    try {
      await s.from('audit_events').insert({
        organization_id: organization.id,
        user_id: user.id,
        entity: 'organization',
        entity_id: organization.id,
        action: 'create',
        details: {
          company_name: companyName,
          subdomain,
          industry: industry || 'automotive',
          team_size: teamSize || 'small',
          initialization_completed: true,
        },
      });
    } catch (auditError) {
      console.warn('⚠️ [TENANT_INIT] Audit log creation failed:', (auditError as Error)?.message);
    }

    console.log('✅ [TENANT_INIT] Organization initialized successfully:', organization.subdomain);

    return NextResponse.json(
      {
        success: true,
        organization: {
          id: organization.id,
          name: organization.name,
          subdomain: organization.subdomain,
          industry: organization.industry,
          team_size: organization.team_size,
          plan: organization.plan || 'trial',
          status: organization.status || 'active',
        },
        message: 'Organization initialized successfully with clean state',
      },
      { headers: res.headers }
    );
  } catch (error) {
    console.error('❌ [TENANT_INIT] Unexpected error:', (error as Error)?.message || error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 /* no res.headers since cookies unlikely changed */ }
    );
  }
}

/**
 * Initialize empty tenant data for a new organization.
 */
async function initializeEmptyTenantData(
  supabase: ReturnType<typeof supaFromReq>['s'],
  organizationId: string,
  userId: string
) {
  // 1) Settings (extra table)
  const { error: settingsError } = await supabase.from('organization_settings').insert({
    organization_id: organizationId,
    settings: {
      features: {
        ai_assistant: true,
        advanced_reporting: true,
        integrations: true,
        automation: true,
      },
      permissions: {
        can_invite_users: true,
        can_modify_settings: true,
        can_export_data: true,
      },
    },
  });
  if (settingsError) {
    console.error('Failed to create organization settings:', settingsError);
  }

  // 2) Dashboard config
  const { error: dashboardError } = await supabase.from('dashboard_configs').insert({
    organization_id: organizationId,
    user_id: userId,
    config: {
      widgets: [
        { type: 'metrics', position: { x: 0, y: 0 }, size: { w: 4, h: 2 } },
        { type: 'recent_leads', position: { x: 4, y: 0 }, size: { w: 4, h: 3 } },
        { type: 'pipeline', position: { x: 0, y: 2 }, size: { w: 4, h: 3 } },
      ],
      layout: 'grid',
    },
  });
  if (dashboardError) {
    console.error('Failed to create dashboard config:', dashboardError);
  }

  // 3) Pipelines (default)
  const defaultPipelines = [
    {
      organization_id: organizationId,
      name: 'Sales Pipeline',
      type: 'sales',
      stages: [
        { name: 'prospect', order: 1, probability: 10 },
        { name: 'qualified', order: 2, probability: 25 },
        { name: 'proposal', order: 3, probability: 50 },
        { name: 'negotiation', order: 4, probability: 75 },
        { name: 'closed_won', order: 5, probability: 100 },
        { name: 'closed_lost', order: 6, probability: 0 },
      ],
      created_by: userId,
      is_default: true,
    },
  ];
  await supabase.from('pipelines').insert(defaultPipelines);

  // 4) Lead stages
  const defaultLeadStages = [
    { organization_id: organizationId, name: 'new', order: 1, color: '#3B82F6' },
    { organization_id: organizationId, name: 'contacted', order: 2, color: '#F59E0B' },
    { organization_id: organizationId, name: 'qualified', order: 3, color: '#10B981' },
    { organization_id: organizationId, name: 'closed_won', order: 4, color: '#059669' },
    { organization_id: organizationId, name: 'closed_lost', order: 5, color: '#DC2626' },
  ];
  await supabase.from('lead_stages').insert(defaultLeadStages);

  // 5) User preferences
  const defaultPreferences = {
    user_id: userId,
    organization_id: organizationId,
    dashboard_layout: 'default',
    notifications: {
      email: true,
      browser: true,
      sms: false,
      lead_updates: true,
      deal_updates: true,
      appointment_reminders: true,
    },
    ui_preferences: {
      theme: 'light',
      sidebar_collapsed: false,
      table_density: 'comfortable',
    },
  };
  await supabase.from('user_preferences').insert(defaultPreferences);

  // 6) Inventory categories
  const defaultInventoryCategories = [
    { organization_id: organizationId, name: 'New Vehicles', type: 'new' },
    { organization_id: organizationId, name: 'Used Vehicles', type: 'used' },
    { organization_id: organizationId, name: 'Certified Pre-Owned', type: 'cpo' },
    { organization_id: organizationId, name: 'Parts & Accessories', type: 'parts' },
  ];
  await supabase.from('inventory_categories').insert(defaultInventoryCategories);

  console.log(`✅ [TENANT_INIT] Seeded defaults for org ${organizationId}`);
}

export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);

  try {
    // Auth
    const {
      data: { user },
      error: authError,
    } = await s.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: res.headers }
      );
    }

    const organizationId = await getMembershipOrgId(s);

    if (!organizationId) {
      return NextResponse.json(
        { initialized: false, message: 'No organization found for user' },
        { headers: res.headers }
      );
    }

    // Load org
    const { data: organization, error: orgError } = await s
      .from('organizations')
      .select('id, name, subdomain, status, created_at')
      .eq('id', organizationId)
      .single();

    if (orgError || !organization) {
      return NextResponse.json(
        { initialized: false, message: 'Organization not found' },
        { headers: res.headers }
      );
    }

    // Confirm initialization via audit event
    const { data: initLog } = await s
      .from('audit_events')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('action', 'create')
      .eq('entity', 'organization')
      .limit(1);

    return NextResponse.json(
      {
        initialized: true,
        organization: {
          id: organization.id,
          name: organization.name,
          subdomain: organization.subdomain,
          status: organization.status,
          created_at: organization.created_at,
        },
        initialization_confirmed: !!(initLog && initLog.length > 0),
      },
      { headers: res.headers }
    );
  } catch (error) {
    console.error('Error checking tenant initialization:', (error as Error)?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
