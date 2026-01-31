/**
 * Owner System Data API
 * Provides comprehensive system data access for owners only
 * Includes all tenant data, user information, and system metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { withOwnerAuth, createOwnerResponse } from '@/lib/auth/ownerAuth';
import { createSupabaseServer } from '@/utils/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withOwnerAuth(async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const dataType = url.searchParams.get('type') || 'overview';
    
    const supabase = await createSupabaseServer();

    switch (dataType) {
      case 'overview':
        return await getSystemOverview(supabase);
      
      case 'tenants':
        return await getAllTenants(supabase);
      
      case 'users':
        return await getAllUsers(supabase);
      
      case 'security':
        return await getSecurityData(supabase);
      
      case 'analytics':
        return await getAnalyticsData(supabase);
      
      default:
        return NextResponse.json(
          { error: 'Invalid data type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Owner system data API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve system data' },
      { status: 500 }
    );
  }
});

async function getSystemOverview(supabase: any) {
  try {
    // Get user count
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get organization count (tenants)
    const { count: tenantCount } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true });

    // Get recent activity count
    const { count: recentActivity } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // System metrics
    const systemMetrics = {
      totalUsers: userCount || 0,
      activeTenants: tenantCount || 0,
      totalRevenue: 0, // Would be calculated from billing data
      systemUptime: 99.97, // Would be from monitoring system
      apiCalls24h: recentActivity || 0,
      errorRate: 0.03, // Would be from error tracking
      lastUpdated: new Date().toISOString()
    };

    return createOwnerResponse({
      type: 'overview',
      metrics: systemMetrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting system overview:', error);
    throw error;
  }
}

async function getAllTenants(supabase: any) {
  try {
    // Get all organizations (tenants)
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select(`
        *,
        users!inner(count)
      `);

    if (orgError) throw orgError;

    // Get user counts for each organization
    const tenantsWithUserCounts = await Promise.all(
      (organizations || []).map(async (org: any) => {
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', org.id);

        const { data: recentActivity } = await supabase
          .from('audit_logs')
          .select('created_at')
          .eq('organization_id', org.id)
          .order('created_at', { ascending: false })
          .limit(1);

        return {
          id: org.id,
          name: org.name || `Organization ${org.id}`,
          userCount: userCount || 0,
          status: org.status || 'active',
          lastActivity: recentActivity?.[0]?.created_at || org.created_at,
          revenue: 0, // Would be calculated from billing
          plan: org.plan || 'Standard',
          createdAt: org.created_at,
          metadata: org.metadata || {}
        };
      })
    );

    return createOwnerResponse({
      type: 'tenants',
      tenants: tenantsWithUserCounts,
      total: tenantsWithUserCounts.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting all tenants:', error);
    throw error;
  }
}

async function getAllUsers(supabase: any) {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        organizations(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const processedUsers = (users || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      status: user.status || 'active',
      organizationId: user.organization_id,
      organizationName: user.organizations?.name || 'No Organization',
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
      metadata: user.metadata || {}
    }));

    return createOwnerResponse({
      type: 'users',
      users: processedUsers,
      total: processedUsers.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

async function getSecurityData(supabase: any) {
  try {
    // Get recent security events
    const { data: securityLogs, error: securityError } = await supabase
      .from('audit_logs')
      .select('*')
      .in('action', ['login_attempt', 'failed_login', 'password_reset', 'account_locked'])
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (securityError) throw securityError;

    // Get admin access logs
    const { data: adminLogs, error: adminError } = await supabase
      .from('admin_audit_log')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (adminError && adminError.code !== 'PGRST116') throw adminError;

    const securitySummary = {
      totalSecurityEvents: securityLogs?.length || 0,
      failedLogins: securityLogs?.filter(log => log.action === 'failed_login').length || 0,
      adminAccesses: adminLogs?.length || 0,
      lastSecurityEvent: securityLogs?.[0]?.created_at || null,
      alerts: [] // Would include processed security alerts
    };

    return createOwnerResponse({
      type: 'security',
      summary: securitySummary,
      recentEvents: securityLogs || [],
      adminLogs: adminLogs || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting security data:', error);
    throw error;
  }
}

async function getAnalyticsData(supabase: any) {
  try {
    // Get usage analytics
    const { data: dailyUsage, error: usageError } = await supabase
      .from('audit_logs')
      .select('created_at, action')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (usageError) throw usageError;

    // Process usage data by day
    const usageByDay = (dailyUsage || []).reduce((acc: any, log: any) => {
      const day = new Date(log.created_at).toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    // Get feature usage
    const featureUsage = (dailyUsage || []).reduce((acc: any, log: any) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});

    return createOwnerResponse({
      type: 'analytics',
      usageByDay,
      featureUsage,
      totalEvents: dailyUsage?.length || 0,
      period: '30 days',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting analytics data:', error);
    throw error;
  }
}