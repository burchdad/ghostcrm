/**
 * Promo Code Analytics API
 * Provides comprehensive analytics data for promo code performance tracking
 * Only accessible to software owners
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- Supabase (service role: server-side only) ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- Owner session verification (reused from promo-codes API) ---
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
  if (!payload) return false;

  if (payload.role !== 'software_owner') return false;

  const expMs = payload.exp && payload.exp < 2_000_000_000 ? payload.exp * 1000 : payload.exp;
  if (!expMs || expMs <= Date.now()) return false;

  return true;
}

const badReq = (msg: string, code = 400) =>
  NextResponse.json({ success: false, error: msg }, { status: code });

const ok = (body: Record<string, any> = {}) =>
  NextResponse.json({ success: true, ...body });

// ---------- GET: Fetch analytics data ----------
export async function GET(req: NextRequest) {
  if (!verifyOwnerSession(req)) {
    return badReq('Unauthorized - Software owner access required', 401);
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'summary';
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '10');
    const orderBy = searchParams.get('orderBy') || 'roi_percentage';

    console.log('📊 [PROMO_ANALYTICS] Fetching analytics:', { type, days, limit, orderBy });

    switch (type) {
      case 'summary':
        return await getPerformanceSummary(days);
      
      case 'trends':
        return await getUsageTrends(days);
      
      case 'top-codes':
        return await getTopCodes(limit, orderBy);
      
      case 'detailed':
        return await getDetailedAnalytics();
      
      case 'revenue-analysis':
        return await getRevenueAnalysis(days);
        
      default:
        return badReq('Invalid analytics type. Available: summary, trends, top-codes, detailed, revenue-analysis');
    }

  } catch (error) {
    console.error('❌ [PROMO_ANALYTICS] Error:', error);
    return badReq('Failed to fetch analytics data', 500);
  }
}

// Get performance summary
async function getPerformanceSummary(days: number) {
  const { data, error } = await supabase.rpc('get_promo_performance_summary', { days_back: days });
  
  if (error) {
    console.error('❌ [ANALYTICS] Performance summary error:', error);
    return badReq('Failed to fetch performance summary', 500);
  }

  const summary = data[0] || {
    total_codes: 0,
    active_codes: 0,
    total_usage: 0,
    total_revenue: 0,
    total_discount_given: 0,
    avg_roi_percentage: 0,
    top_performing_code: null,
    conversion_rate: 0
  };

  return ok({
    summary: {
      totalCodes: summary.total_codes,
      activeCodes: summary.active_codes,
      totalUsage: summary.total_usage,
      totalRevenue: parseFloat(summary.total_revenue || '0'),
      totalDiscountGiven: parseFloat(summary.total_discount_given || '0'),
      avgRoiPercentage: parseFloat(summary.avg_roi_percentage || '0'),
      topPerformingCode: summary.top_performing_code,
      conversionRate: parseFloat(summary.conversion_rate || '0')
    }
  });
}

// Get usage trends
async function getUsageTrends(days: number) {
  const { data, error } = await supabase.rpc('get_promo_usage_trends', { days_back: days });
  
  if (error) {
    console.error('❌ [ANALYTICS] Usage trends error:', error);
    return badReq('Failed to fetch usage trends', 500);
  }

  const trends = (data || []).map((row: any) => ({
    date: row.usage_date,
    usageCount: parseInt(row.daily_usage_count || '0'),
    revenue: parseFloat(row.daily_revenue || '0'),
    discount: parseFloat(row.daily_discount || '0'),
    uniqueCodesUsed: parseInt(row.unique_codes_used || '0')
  }));

  return ok({ trends });
}

// Get top performing codes
async function getTopCodes(limit: number, orderBy: string) {
  const { data, error } = await supabase.rpc('get_top_promo_codes', { 
    limit_count: limit, 
    order_by: orderBy 
  });
  
  if (error) {
    console.error('❌ [ANALYTICS] Top codes error:', error);
    return badReq('Failed to fetch top performing codes', 500);
  }

  const topCodes = (data || []).map((row: any) => ({
    code: row.code,
    description: row.description,
    usageCount: parseInt(row.usage_count || '0'),
    totalRevenue: parseFloat(row.total_revenue || '0'),
    totalDiscount: parseFloat(row.total_discount || '0'),
    roiPercentage: parseFloat(row.roi_percentage || '0'),
    usageRatePercentage: parseFloat(row.usage_rate_percentage || '0')
  }));

  return ok({ topCodes });
}

// Get detailed analytics from materialized view
async function getDetailedAnalytics() {
  const { data, error } = await supabase
    .from('promo_code_analytics')
    .select('*')
    .order('roi_percentage', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('❌ [ANALYTICS] Detailed analytics error:', error);
    return badReq('Failed to fetch detailed analytics', 500);
  }

  const analytics = (data || []).map((row: any) => ({
    id: row.id,
    code: row.code,
    description: row.description,
    discountType: row.discount_type,
    discountValue: parseFloat(row.discount_value || '0'),
    customMonthlyPrice: parseFloat(row.custom_monthly_price || '0'),
    customYearlyPrice: parseFloat(row.custom_yearly_price || '0'),
    maxUses: row.max_uses,
    usedCount: row.used_count,
    actualUsageCount: row.actual_usage_count,
    totalDiscountGiven: parseFloat(row.total_discount_given || '0'),
    totalOrderValue: parseFloat(row.total_order_value || '0'),
    totalRevenue: parseFloat(row.total_revenue || '0'),
    avgDiscountAmount: parseFloat(row.avg_discount_amount || '0'),
    avgOrderValue: parseFloat(row.avg_order_value || '0'),
    usageRatePercentage: parseFloat(row.usage_rate_percentage || '0'),
    firstUsedAt: row.first_used_at,
    lastUsedAt: row.last_used_at,
    mostPopularPlan: row.most_popular_plan,
    roiPercentage: parseFloat(row.roi_percentage || '0'),
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    isActive: row.is_active
  }));

  return ok({ analytics });
}

// Get revenue analysis with breakdowns
async function getRevenueAnalysis(days: number) {
  // Get revenue by plan type
  const { data: planData, error: planError } = await supabase
    .from('promo_code_usage')
    .select('plan_selected, final_amount, discount_amount')
    .gte('used_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

  if (planError) {
    console.error('❌ [ANALYTICS] Revenue analysis error:', planError);
    return badReq('Failed to fetch revenue analysis', 500);
  }

  // Aggregate by plan
  const planStats = (planData || []).reduce((acc: any, row: any) => {
    const plan = row.plan_selected || 'Unknown';
    if (!acc[plan]) {
      acc[plan] = { 
        revenue: 0, 
        discount: 0, 
        count: 0,
        avgRevenue: 0,
        avgDiscount: 0 
      };
    }
    acc[plan].revenue += parseFloat(row.final_amount || '0');
    acc[plan].discount += parseFloat(row.discount_amount || '0');
    acc[plan].count += 1;
    return acc;
  }, {});

  // Calculate averages
  Object.keys(planStats).forEach(plan => {
    planStats[plan].avgRevenue = planStats[plan].revenue / planStats[plan].count;
    planStats[plan].avgDiscount = planStats[plan].discount / planStats[plan].count;
  });

  return ok({ 
    revenueAnalysis: {
      byPlan: planStats,
      totalPlans: Object.keys(planStats).length,
      analysisPeriodDays: days
    }
  });
}

// ---------- POST: Refresh analytics ----------
export async function POST(req: NextRequest) {
  if (!verifyOwnerSession(req)) {
    return badReq('Unauthorized - Software owner access required', 401);
  }

  try {
    console.log('🔄 [PROMO_ANALYTICS] Refreshing analytics...');
    
    const { error } = await supabase.rpc('refresh_promo_analytics');
    
    if (error) {
      console.error('❌ [ANALYTICS] Refresh error:', error);
      return badReq('Failed to refresh analytics', 500);
    }

    console.log('✅ [PROMO_ANALYTICS] Analytics refreshed successfully');
    return ok({ message: 'Analytics refreshed successfully' });

  } catch (error) {
    console.error('❌ [PROMO_ANALYTICS] Refresh error:', error);
    return badReq('Failed to refresh analytics', 500);
  }
}