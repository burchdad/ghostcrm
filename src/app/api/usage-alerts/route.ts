/**
 * Usage Alerts API
 * Manages subscription usage monitoring, alerts, and limit enforcement
 * Provides endpoints for real-time usage tracking and alert management
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/utils/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- Authentication helpers ---
function decodeBase64Json<T = any>(b64: string): T | null {
  try {
    const json = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function verifyOwnerSession(req: NextRequest): boolean {
  const token = req.cookies.get('owner_session')?.value;
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length < 2) return false;

  const payload = decodeBase64Json<{ role?: string; exp?: number }>(parts[1]);
  if (!payload || payload.role !== 'software_owner') return false;

  const expMs = payload.exp && payload.exp < 2_000_000_000 ? payload.exp * 1000 : payload.exp;
  return !!(expMs && expMs > Date.now());
}

async function verifyUserSession(req: NextRequest): Promise<{ userId: string; organizationId: string } | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  // Get user's organization
  const { data: orgMember } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (!orgMember) return null;

  return {
    userId: user.id,
    organizationId: orgMember.organization_id
  };
}

const badReq = (msg: string, code = 400) =>
  NextResponse.json({ success: false, error: msg }, { status: code });

const ok = (body: Record<string, any> = {}) =>
  NextResponse.json({ success: true, ...body });

// ---------- GET: Fetch usage data and alerts ----------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'usage';
  const organizationId = searchParams.get('organizationId');

  // Owner can view any organization, users can only view their own
  let targetOrgId: string;
  if (verifyOwnerSession(req)) {
    targetOrgId = organizationId || '';
    if (!targetOrgId) {
      return badReq('Organization ID required for admin access');
    }
  } else {
    const userSession = await verifyUserSession(req);
    if (!userSession) {
      return badReq('Unauthorized - Valid session required', 401);
    }
    targetOrgId = userSession.organizationId;
  }

  try {
    console.log('📊 [USAGE_ALERTS] Fetching data:', { type, organizationId: targetOrgId });

    switch (type) {
      case 'usage':
        return await getUsageSummary(targetOrgId);
      
      case 'alerts':
        return await getActiveAlerts(targetOrgId);
      
      case 'history':
        const days = parseInt(searchParams.get('days') || '30');
        return await getAlertHistory(targetOrgId, days);
      
      case 'configs':
        return await getAlertConfigs();
        
      default:
        return badReq('Invalid type. Available: usage, alerts, history, configs');
    }

  } catch (error) {
    console.error('❌ [USAGE_ALERTS] Error:', error);
    return badReq('Failed to fetch usage data', 500);
  }
}

// ---------- POST: Track usage and manage alerts ----------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'track_usage';

    console.log('🎯 [USAGE_ALERTS] POST action:', action);

    switch (action) {
      case 'track_usage':
        return await trackUsage(body);
      
      case 'test_alerts':
        if (!verifyOwnerSession(req)) {
          return badReq('Unauthorized - Software owner access required', 401);
        }
        return await testAlerts(body);
      
      case 'resolve_alert':
        return await resolveAlert(req, body);
        
      default:
        return badReq('Invalid action. Available: track_usage, test_alerts, resolve_alert');
    }

  } catch (error) {
    console.error('❌ [USAGE_ALERTS] POST error:', error);
    return badReq('Failed to process request', 500);
  }
}

// ---------- PUT: Update alert configurations ----------
export async function PUT(req: NextRequest) {
  if (!verifyOwnerSession(req)) {
    return badReq('Unauthorized - Software owner access required', 401);
  }

  try {
    const body = await req.json();
    const { planName, featureName, config } = body;

    if (!planName || !featureName || !config) {
      return badReq('Missing required fields: planName, featureName, config');
    }

    console.log('⚙️ [USAGE_ALERTS] Updating config:', { planName, featureName });

    const { data, error } = await supabase
      .from('usage_alert_configs')
      .upsert({
        plan_name: planName,
        feature_name: featureName,
        limit_type: config.limitType || 'monthly',
        limit_value: config.limitValue,
        warning_thresholds: config.warningThresholds || [75, 90, 95],
        alert_enabled: config.alertEnabled !== false,
        email_enabled: config.emailEnabled !== false,
        sms_enabled: config.smsEnabled || false,
        slack_enabled: config.slackEnabled || false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'plan_name,feature_name,limit_type'
      })
      .select();

    if (error) {
      console.error('❌ [USAGE_ALERTS] Config update error:', error);
      return badReq('Failed to update configuration', 500);
    }

    return ok({ message: 'Alert configuration updated', config: data[0] });

  } catch (error) {
    console.error('❌ [USAGE_ALERTS] PUT error:', error);
    return badReq('Failed to update configuration', 500);
  }
}

// Get usage summary for organization
async function getUsageSummary(organizationId: string) {
  const { data, error } = await supabase.rpc('get_usage_summary', { 
    p_organization_id: organizationId 
  });

  if (error) {
    console.error('❌ [USAGE_ALERTS] Usage summary error:', error);
    return badReq('Failed to fetch usage summary', 500);
  }

  const summary = (data || []).map((row: any) => ({
    featureName: row.feature_name,
    currentUsage: parseInt(row.current_usage || '0'),
    usageLimit: parseInt(row.usage_limit || '0'),
    usagePercentage: parseFloat(row.usage_percentage || '0'),
    limitType: row.limit_type,
    alertLevel: row.alert_level,
    lastAlertAt: row.last_alert_at,
    status: getUsageStatus(parseFloat(row.usage_percentage || '0'))
  }));

  return ok({ usageSummary: summary });
}

// Get active alerts for organization
async function getActiveAlerts(organizationId: string) {
  const { data, error } = await supabase
    .from('usage_alerts')
    .select('*')
    .eq('organization_id', organizationId)
    .is('resolved_at', null)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('❌ [USAGE_ALERTS] Active alerts error:', error);
    return badReq('Failed to fetch active alerts', 500);
  }

  const alerts = (data || []).map((alert: any) => ({
    id: alert.id,
    planName: alert.plan_name,
    featureName: alert.feature_name,
    alertType: alert.alert_type,
    alertLevel: alert.alert_level,
    thresholdPercentage: alert.threshold_percentage,
    currentUsage: alert.current_usage,
    usageLimit: alert.usage_limit,
    message: alert.message,
    emailSent: alert.email_sent,
    smsSent: alert.sms_sent,
    slackSent: alert.slack_sent,
    createdAt: alert.created_at
  }));

  return ok({ alerts });
}

// Get alert history
async function getAlertHistory(organizationId: string, days: number) {
  const { data, error } = await supabase
    .from('usage_alerts')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('❌ [USAGE_ALERTS] Alert history error:', error);
    return badReq('Failed to fetch alert history', 500);
  }

  const history = (data || []).map((alert: any) => ({
    id: alert.id,
    featureName: alert.feature_name,
    alertType: alert.alert_type,
    alertLevel: alert.alert_level,
    message: alert.message,
    resolvedAt: alert.resolved_at,
    createdAt: alert.created_at
  }));

  return ok({ alertHistory: history });
}

// Get alert configurations
async function getAlertConfigs() {
  const { data, error } = await supabase
    .from('usage_alert_configs')
    .select('*')
    .eq('alert_enabled', true)
    .order('plan_name', { ascending: true });

  if (error) {
    console.error('❌ [USAGE_ALERTS] Alert configs error:', error);
    return badReq('Failed to fetch alert configurations', 500);
  }

  const configs = (data || []).map((config: any) => ({
    id: config.id,
    planName: config.plan_name,
    featureName: config.feature_name,
    limitType: config.limit_type,
    limitValue: config.limit_value,
    warningThresholds: config.warning_thresholds,
    alertEnabled: config.alert_enabled,
    emailEnabled: config.email_enabled,
    smsEnabled: config.sms_enabled,
    slackEnabled: config.slack_enabled
  }));

  return ok({ alertConfigs: configs });
}

// Track usage for a feature
async function trackUsage(body: any) {
  const { organizationId, userId, featureName, increment = 1 } = body;

  if (!organizationId || !featureName) {
    return badReq('Missing required fields: organizationId, featureName');
  }

  console.log('📈 [USAGE_ALERTS] Tracking usage:', { organizationId, featureName, increment });

  const { error } = await supabase.rpc('update_usage_tracking', {
    p_organization_id: organizationId,
    p_user_id: userId || null,
    p_feature_name: featureName,
    p_increment: increment
  });

  if (error) {
    console.error('❌ [USAGE_ALERTS] Track usage error:', error);
    return badReq('Failed to track usage', 500);
  }

  return ok({ message: 'Usage tracked successfully' });
}

// Test alerts (admin only)
async function testAlerts(body: any) {
  const { organizationId, featureName } = body;

  if (!organizationId || !featureName) {
    return badReq('Missing required fields: organizationId, featureName');
  }

  console.log('🧪 [USAGE_ALERTS] Testing alerts:', { organizationId, featureName });

  const { error } = await supabase.rpc('check_usage_limits', {
    p_organization_id: organizationId,
    p_feature_name: featureName
  });

  if (error) {
    console.error('❌ [USAGE_ALERTS] Test alerts error:', error);
    return badReq('Failed to test alerts', 500);
  }

  return ok({ message: 'Alert check triggered' });
}

// Resolve an alert
async function resolveAlert(req: NextRequest, body: any) {
  const { alertId } = body;

  if (!alertId) {
    return badReq('Missing required field: alertId');
  }

  // Verify user has access to this alert
  const userSession = await verifyUserSession(req);
  const isOwner = verifyOwnerSession(req);
  
  if (!isOwner && !userSession) {
    return badReq('Unauthorized - Valid session required', 401);
  }

  console.log('✅ [USAGE_ALERTS] Resolving alert:', { alertId });

  let query = supabase
    .from('usage_alerts')
    .update({ resolved_at: new Date().toISOString() })
    .eq('id', alertId);

  // Non-owners can only resolve their own org's alerts
  if (!isOwner && userSession) {
    query = query.eq('organization_id', userSession.organizationId);
  }

  const { error } = await query;

  if (error) {
    console.error('❌ [USAGE_ALERTS] Resolve alert error:', error);
    return badReq('Failed to resolve alert', 500);
  }

  return ok({ message: 'Alert resolved successfully' });
}

// Helper function to determine usage status
function getUsageStatus(percentage: number): string {
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 95) return 'critical';
  if (percentage >= 75) return 'warning';
  return 'normal';
}