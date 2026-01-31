/**
 * FEATURE USAGE TRACKING API
 * API endpoint for tracking feature usage from frontend
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';
import { FeatureId } from '@/lib/features/definitions';

export const runtime = 'nodejs';

/**
 * POST /api/features/track-usage
 * Track usage of a feature for a tenant
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, featureId, amount = 1 } = body;

    if (!tenantId || !featureId) {
      return NextResponse.json(
        { error: 'Missing tenantId or featureId' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServer();

    // Get current subscription
    const { data: subscription, error: subError } = await supabase
      .from('tenant_subscriptions')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Map feature to usage field
    const usageMapping: Record<string, keyof typeof subscription.current_usage> = {
      // Core features
      'contacts_management': 'contacts',
      'basic_deals': 'deals',
      'api_access': 'api_calls_this_month',
      
      // Marketing features
      'email_campaigns': 'email_campaigns_this_month',
      
      // Automation features
      'basic_workflows': 'workflow_runs_this_month',
      'advanced_workflows': 'workflow_runs_this_month',
      
      // File features
      'file_storage': 'storage_gb'
    };

    const usageField = usageMapping[featureId];
    if (!usageField) {
      // Feature doesn't have usage tracking
      return NextResponse.json({
        success: true,
        message: 'Feature does not require usage tracking',
        tracked: false
      });
    }

    // Update usage count
    const currentUsage = subscription.current_usage[usageField] || 0;
    const newUsage = currentUsage + amount;

    const { error: updateError } = await supabase
      .from('tenant_subscriptions')
      .update({
        current_usage: {
          ...subscription.current_usage,
          [usageField]: newUsage
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Usage update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update usage' },
        { status: 500 }
      );
    }

    // Log the usage event
    await supabase
      .from('billing_events')
      .insert({
        subscription_id: subscription.id,
        event_type: 'usage_tracked',
        description: `Usage tracked for ${featureId}: +${amount}`,
        status: 'processed',
        processed_at: new Date().toISOString(),
        event_data: {
          feature_id: featureId,
          amount_used: amount,
          previous_usage: currentUsage,
          new_usage: newUsage,
          usage_field: usageField
        }
      });

    return NextResponse.json({
      success: true,
      tracked: true,
      previousUsage: currentUsage,
      newUsage: newUsage,
      usageLimit: subscription.usage_limits[usageField as keyof typeof subscription.usage_limits],
      featureId,
      tenantId
    });

  } catch (error) {
    console.error('Usage tracking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
