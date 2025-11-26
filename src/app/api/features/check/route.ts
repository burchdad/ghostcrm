/**
 * FEATURE CHECK API
 * API endpoint for checking feature access from frontend
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';
import { FeatureAccessControl } from '@/lib/features/access-control';
import { FeatureId } from '@/lib/features/definitions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/features/check
 * Check if a tenant has access to a specific feature
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const featureId = searchParams.get('featureId') as FeatureId;

    if (!tenantId || !featureId) {
      return NextResponse.json(
        { error: 'Missing tenantId or featureId parameter' },
        { status: 400 }
      );
    }

    // Get tenant subscription from database
    const supabase = await createSupabaseServer();
    const { data: subscription, error } = await supabase
      .from('tenant_subscriptions')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return NextResponse.json({
        hasAccess: false,
        error: 'Failed to fetch subscription',
        featureId,
        tenantId
      });
    }

    const accessControl = new FeatureAccessControl(subscription);
    
    // Check feature access
    const accessResult = accessControl.hasFeatureAccess(featureId);
    
    // Get usage information if available
    let usageInfo: null | { currentUsage: number; limit: number | undefined; } = null;
    if (accessResult.currentUsage !== undefined) {
      usageInfo = {
        currentUsage: accessResult.currentUsage,
        limit: accessResult.limit
      };
    }

    return NextResponse.json({
      hasAccess: accessResult.hasAccess,
      reason: accessResult.reason,
      usageCount: accessResult.currentUsage,
      usageLimit: accessResult.limit,
      requiredPlan: accessResult.requiredPlan,
      upgradeUrl: accessResult.upgradeUrl,
      featureId,
      tenantId
    });

  } catch (error) {
    console.error('Feature check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}