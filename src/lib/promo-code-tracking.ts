/**
 * Promo Code Usage Tracking
 * Tracks when promo codes are used in successful checkouts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Track promo code usage when checkout session is completed
 */
export async function trackPromoCodeUsage(session: any) {
  try {
    // Check if session has promotion code applied
    if (!session.total_details?.breakdown?.discounts || session.total_details.breakdown.discounts.length === 0) {
      return; // No discounts applied
    }

    const discount = session.total_details.breakdown.discounts[0];
    const promotionCodeId = discount.promotion_code;

    if (!promotionCodeId) {
      return; // No promotion code
    }

    console.log(`🎫 [USAGE_TRACKING] Tracking promotion code usage: ${promotionCodeId}`);

    // Find our promo code by Stripe promotion code ID
    const { data: promoCode, error: findError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('stripe_promotion_code_id', promotionCodeId)
      .single();

    if (findError || !promoCode) {
      console.error('❌ [USAGE_TRACKING] Promo code not found in database:', promotionCodeId);
      return;
    }

    // Calculate discount amount
    const originalAmount = session.amount_total + discount.amount;
    const discountAmount = discount.amount;
    const finalAmount = session.amount_total;

    // Record usage in promo_code_usage table
    const { error: usageError } = await supabase
      .from('promo_code_usage')
      .insert({
        promo_code_id: promoCode.id,
        used_by_email: session.customer_details?.email || 'unknown',
        order_amount: originalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        plan_selected: session.metadata?.planId || 'unknown',
        metadata: {
          stripe_session_id: session.id,
          stripe_promotion_code_id: promotionCodeId,
          billing_type: session.metadata?.billing || 'monthly',
          tenant_id: session.metadata?.tenantId
        }
      });

    if (usageError) {
      console.error('❌ [USAGE_TRACKING] Error recording usage:', usageError);
      return;
    }

    // Increment used_count in promo_codes table
    const { error: incrementError } = await supabase
      .from('promo_codes')
      .update({
        used_count: promoCode.used_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', promoCode.id);

    if (incrementError) {
      console.error('❌ [USAGE_TRACKING] Error incrementing usage count:', incrementError);
      return;
    }

    console.log(`✅ [USAGE_TRACKING] Successfully tracked usage for: ${promoCode.code}`);

    // Check if promo code has reached usage limit
    if (promoCode.max_uses && (promoCode.used_count + 1) >= promoCode.max_uses) {
      console.log(`⚠️ [USAGE_TRACKING] Promo code ${promoCode.code} has reached usage limit`);
      
      // Optionally deactivate in Stripe as well
      // This would require additional Stripe API calls
    }

  } catch (error) {
    console.error('❌ [USAGE_TRACKING] Error tracking promo code usage:', error);
  }
}

/**
 * Get promo code usage analytics
 */
export async function getPromoCodeAnalytics(promoCodeId?: string) {
  try {
    let query = supabase
      .from('promo_code_usage')
      .select(`
        *,
        promo_codes:promo_code_id (
          code,
          description,
          discount_type,
          discount_value
        )
      `)
      .order('used_at', { ascending: false });

    if (promoCodeId) {
      query = query.eq('promo_code_id', promoCodeId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching promo code analytics:', error);
    throw error;
  }
}

/**
 * Get promo code performance summary
 */
export async function getPromoCodeSummary() {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select(`
        id,
        code,
        description,
        discount_type,
        discount_value,
        max_uses,
        used_count,
        is_active,
        expires_at,
        sync_status,
        stripe_coupon_id,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate additional metrics
    const summary = data.map(promo => {
      const usageRate = promo.max_uses ? (promo.used_count / promo.max_uses) * 100 : 0;
      const isExpired = promo.expires_at ? new Date(promo.expires_at) <= new Date() : false;
      const isAtLimit = promo.max_uses ? promo.used_count >= promo.max_uses : false;
      
      return {
        ...promo,
        usage_rate: Math.round(usageRate),
        is_expired: isExpired,
        is_at_limit: isAtLimit,
        status: isExpired ? 'expired' : isAtLimit ? 'limit_reached' : promo.is_active ? 'active' : 'inactive'
      };
    });

    return summary;
  } catch (error) {
    console.error('Error fetching promo code summary:', error);
    throw error;
  }
}