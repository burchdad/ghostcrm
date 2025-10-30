import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SubdomainListItem {
  id: string;
  subdomain: string;
  fullDomain: string;
  organizationId: string;
  organizationName: string;
  ownerEmail: string;
  status: string;
  healthStatus: string;
  sslStatus: string;
  createdAt: string;
  lastHealthCheck?: string;
  dnsRecordCount: number;
  customDomain?: string;
}

interface SubdomainStats {
  total: number;
  active: number;
  pending: number;
  failed: number;
  suspended: number;
  healthy: number;
  unhealthy: number;
}

/**
 * GET /api/subdomains/manage
 * Get all subdomains for owner dashboard management
 */
export async function GET(req: NextRequest) {
  try {
    // Verify software owner access
    const authResult = await verifySoftwareOwnerAccess(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    let query = supabase
      .from('subdomains')
      .select(`
        *,
        organizations!inner(organization_name),
        dns_records(count),
        subdomain_health_checks(
          status,
          checked_at,
          response_time_ms
        )
      `);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`subdomain.ilike.%${search}%,organization_name.ilike.%${search}%,owner_email.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: subdomains, error, count } = await query;

    if (error) {
      throw error;
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('subdomains')
      .select('*', { count: 'exact', head: true });

    // Transform data for response
    const transformedSubdomains: SubdomainListItem[] = (subdomains || []).map(subdomain => ({
      id: subdomain.id,
      subdomain: subdomain.subdomain,
      fullDomain: subdomain.custom_domain || `${subdomain.subdomain}.ghostcrm.ai`,
      organizationId: subdomain.organization_id,
      organizationName: subdomain.organizations?.organization_name || 'Unknown',
      ownerEmail: subdomain.owner_email,
      status: subdomain.status,
      healthStatus: subdomain.health_status,
      sslStatus: subdomain.ssl_status,
      createdAt: subdomain.created_at,
      lastHealthCheck: subdomain.last_health_check,
      dnsRecordCount: subdomain.dns_records?.length || 0,
      customDomain: subdomain.custom_domain
    }));

    // Get stats
    const stats = await getSubdomainStats();

    return NextResponse.json({
      success: true,
      data: transformedSubdomains,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Subdomain management error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch subdomains'
    }, { status: 500 });
  }
}

/**
 * POST /api/subdomains/manage
 * Create new subdomain from owner dashboard
 */
export async function POST(req: NextRequest) {
  try {
    // Verify software owner access
    const authResult = await verifySoftwareOwnerAccess(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const body = await req.json();
    const { subdomain, organizationId, organizationName, ownerEmail, customDomain, autoProvision = true } = body;

    // Validate required fields
    if (!subdomain || !organizationId || !organizationName || !ownerEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Call the provision API internally
    const provisionResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/subdomains/provision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subdomain,
        organizationId,
        organizationName,
        ownerEmail,
        customDomain,
        autoProvision
      })
    });

    const result = await provisionResponse.json();

    if (!result.success) {
      return NextResponse.json(result, { status: provisionResponse.status });
    }

    // Log the creation in activity log
    await logSubdomainActivity(result.subdomain, 'created_by_owner', {
      createdBy: authResult.userId,
      organizationId,
      autoProvision
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Subdomain creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create subdomain'
    }, { status: 500 });
  }
}

/**
 * PUT /api/subdomains/manage
 * Update subdomain configuration
 */
export async function PUT(req: NextRequest) {
  try {
    // Verify software owner access
    const authResult = await verifySoftwareOwnerAccess(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const body = await req.json();
    const { subdomainId, updates } = body;

    if (!subdomainId || !updates) {
      return NextResponse.json({
        success: false,
        error: 'Missing subdomainId or updates'
      }, { status: 400 });
    }

    // Update subdomain
    const { data, error } = await supabase
      .from('subdomains')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', subdomainId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the update
    await logSubdomainActivity(subdomainId, 'updated_by_owner', {
      updatedBy: authResult.userId,
      updates
    });

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Subdomain update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update subdomain'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/subdomains/manage
 * Delete/suspend subdomain
 */
export async function DELETE(req: NextRequest) {
  try {
    // Verify software owner access
    const authResult = await verifySoftwareOwnerAccess(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subdomainId = searchParams.get('id');
    const action = searchParams.get('action') || 'suspend'; // 'suspend' or 'delete'

    if (!subdomainId) {
      return NextResponse.json({
        success: false,
        error: 'Missing subdomain ID'
      }, { status: 400 });
    }

    if (action === 'delete') {
      // Permanent deletion
      const { error } = await supabase
        .from('subdomains')
        .delete()
        .eq('id', subdomainId);

      if (error) throw error;

      await logSubdomainActivity(subdomainId, 'deleted_by_owner', {
        deletedBy: authResult.userId
      });
    } else {
      // Suspend subdomain
      const { error } = await supabase
        .from('subdomains')
        .update({
          status: 'suspended',
          updated_at: new Date().toISOString()
        })
        .eq('id', subdomainId);

      if (error) throw error;

      await logSubdomainActivity(subdomainId, 'suspended_by_owner', {
        suspendedBy: authResult.userId
      });
    }

    return NextResponse.json({
      success: true,
      message: action === 'delete' ? 'Subdomain deleted successfully' : 'Subdomain suspended successfully'
    });

  } catch (error) {
    console.error('Subdomain deletion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete subdomain'
    }, { status: 500 });
  }
}

// Helper Functions

async function verifySoftwareOwnerAccess(req: NextRequest): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    // Check for owner session cookie
    const ownerToken = req.cookies.get('owner_session')?.value;
    
    if (!ownerToken) {
      return { success: false, error: 'No owner session found' };
    }

    // Decode and verify the owner token
    const payload = JSON.parse(
      Buffer.from(ownerToken.split('.')[1], 'base64').toString()
    );

    if (!payload.isSoftwareOwner || payload.role !== 'software_owner') {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Check if token is expired
    if (payload.expires && new Date(payload.expires) < new Date()) {
      return { success: false, error: 'Session expired' };
    }

    return { success: true, userId: payload.userId };
  } catch (error) {
    return { success: false, error: 'Invalid session' };
  }
}

async function getSubdomainStats(): Promise<SubdomainStats> {
  try {
    const { data, error } = await supabase
      .from('subdomains')
      .select('status, health_status');

    if (error) throw error;

    const stats: SubdomainStats = {
      total: data?.length || 0,
      active: 0,
      pending: 0,
      failed: 0,
      suspended: 0,
      healthy: 0,
      unhealthy: 0
    };

    data?.forEach(item => {
      // Count by status
      switch (item.status) {
        case 'active':
          stats.active++;
          break;
        case 'pending':
          stats.pending++;
          break;
        case 'failed':
          stats.failed++;
          break;
        case 'suspended':
          stats.suspended++;
          break;
      }

      // Count by health
      switch (item.health_status) {
        case 'healthy':
          stats.healthy++;
          break;
        case 'unhealthy':
        case 'degraded':
          stats.unhealthy++;
          break;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting subdomain stats:', error);
    return {
      total: 0,
      active: 0,
      pending: 0,
      failed: 0,
      suspended: 0,
      healthy: 0,
      unhealthy: 0
    };
  }
}

async function logSubdomainActivity(subdomainId: string, action: string, details: any): Promise<void> {
  try {
    await supabase
      .from('subdomain_activity_log')
      .insert({
        subdomain_id: subdomainId,
        action,
        details,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging subdomain activity:', error);
  }
}