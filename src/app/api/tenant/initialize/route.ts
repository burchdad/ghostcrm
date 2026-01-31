/**
 * TENANT INITIALIZATION API
 * Creates an organization for the authenticated user and seeds baseline data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from "@/utils/supabase/admin";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";

export const runtime = 'nodejs';

type JsonBody = {
  companyName?: string;
  adminEmail?: string;
  industry?: string;
  teamSize?: string;
  subdomain?: string;
};

export async function POST(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!(await isAuthenticated(req))) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      );
    }

    const body: JsonBody = await req.json().catch(() => ({}));
    const { companyName = "My Company", adminEmail, industry, teamSize, subdomain } = body;

    console.log(`🏢 [TENANT_INIT] Creating organization for user ${user.id}`);

    // Create the organization in the database
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: companyName,
        subdomain: subdomain || `company-${Date.now()}`,
        owner_id: user.id,
        industry,
        team_size: teamSize,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orgError) {
      console.error('❌ [TENANT_INIT] Organization creation failed:', orgError);
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500 }
      );
    }

    // Create tenant membership for the owner
    const { error: membershipError } = await supabaseAdmin
      .from('tenant_memberships')
      .insert({
        tenant_id: organization.id,
        user_id: user.id,
        role: 'owner',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (membershipError) {
      console.error('❌ [TENANT_INIT] Membership creation failed:', membershipError);
      // Clean up the organization if membership fails
      await supabaseAdmin.from('organizations').delete().eq('id', organization.id);
      return NextResponse.json(
        { error: 'Failed to create organization membership' },
        { status: 500 }
      );
    }

    // Initialize basic tenant data (settings, default stages, etc.)
    await initializeBasicTenantData(supabaseAdmin, organization.id, user.id);

    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        subdomain: organization.subdomain,
        created_at: organization.created_at,
        owner_id: organization.owner_id
      },
      message: 'Organization initialized successfully'
    });
  } catch (error) {
    console.error('❌ [TENANT_INIT] Unexpected error:', (error as Error)?.message || error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!(await isAuthenticated(req))) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      );
    }

    // Check if user already has a tenant membership
    const { data: membership } = await supabaseAdmin
      .from('tenant_memberships')
      .select(`
        tenant_id,
        role,
        organizations!inner(
          id,
          name,
          subdomain,
          created_at,
          owner_id
        )
      `)
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single();

    if (membership) {
      return NextResponse.json({
        initialized: true,
        organization: membership.organizations
      });
    }

    return NextResponse.json({
      initialized: false,
      message: 'No organization found for user'
    });

  } catch (error) {
    console.error('❌ [TENANT_INIT] GET error:', (error as Error)?.message || error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to initialize basic tenant data
async function initializeBasicTenantData(supabase: any, organizationId: string, userId: string) {
  try {
    // Create default lead stages
    await supabase.from('lead_stages').insert([
      { organization_id: organizationId, name: 'New', position: 1, color: '#3B82F6' },
      { organization_id: organizationId, name: 'Contacted', position: 2, color: '#F59E0B' },
      { organization_id: organizationId, name: 'Qualified', position: 3, color: '#10B981' },
      { organization_id: organizationId, name: 'Proposal Sent', position: 4, color: '#8B5CF6' },
      { organization_id: organizationId, name: 'Closed Won', position: 5, color: '#059669' },
      { organization_id: organizationId, name: 'Closed Lost', position: 6, color: '#DC2626' }
    ]);

    // Create default settings
    await supabase.from('organization_settings').insert({
      organization_id: organizationId,
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        date_format: 'MM/DD/YYYY',
        business_hours: {
          start: '09:00',
          end: '17:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
      }
    });

    console.log(`✅ [TENANT_INIT] Initialized basic data for org ${organizationId}`);
  } catch (error) {
    console.error('❌ [TENANT_INIT] Failed to initialize tenant data:', error);
    // Don't throw - let the organization creation succeed even if defaults fail
  }
}

