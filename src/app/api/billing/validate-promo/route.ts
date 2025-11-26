/**
 * Billing Promo Code Validation API
 * Public endpoint for validating promo codes during checkout
 * Supabase-backed implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function validatePromoCode(code: string) {
  try {
    // Query the promo_codes table directly
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*, stripe_promotion_code_id, stripe_coupon_id, sync_status')
      .ilike('code', code.trim())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.log('❌ [BILLING_VALIDATION] Promo code not found or inactive:', code);
      return null;
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) <= new Date()) {
      console.log('❌ [BILLING_VALIDATION] Promo code expired:', code);
      return null;
    }

    // Check if usage limit reached
    if (data.max_uses && data.used_count >= data.max_uses) {
      console.log('❌ [BILLING_VALIDATION] Promo code usage limit reached:', code);
      return null;
    }

    console.log('✅ [BILLING_VALIDATION] Valid promo code found:', code);
    
    // Return the promo code data with camelCase field names for frontend
    return {
      id: data.id,
      code: data.code,
      description: data.description,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      customMonthlyPrice: data.custom_monthly_price,
      customYearlyPrice: data.custom_yearly_price,
      maxUses: data.max_uses,
      usedCount: data.used_count,
      expiresAt: data.expires_at,
      isActive: data.is_active,
      createdAt: data.created_at,
      createdBy: data.created_by,
      stripePromotionCodeId: data.stripe_promotion_code_id,
      stripeCouponId: data.stripe_coupon_id,
      syncStatus: data.sync_status
    };
  } catch (error) {
    console.error('❌ [BILLING_VALIDATION] Error validating promo code:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Promo code is required' },
        { status: 400 }
      );
    }

    console.log('🎫 [PROMO_VALIDATION] Validating code:', code);

    const promoCode = await validatePromoCode(code);

    if (!promoCode) {
      console.log('❌ [PROMO_VALIDATION] Invalid or expired code:', code);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired promo code' },
        { status: 400 }
      );
    }

    console.log('✅ [PROMO_VALIDATION] Valid code found:', code);

    return NextResponse.json({
      success: true,
      message: 'Promo code is valid',
      promoCode: {
        code: promoCode.code,
        description: promoCode.description,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        customMonthlyPrice: promoCode.customMonthlyPrice,
        customYearlyPrice: promoCode.customYearlyPrice,
        stripePromotionCodeId: promoCode.stripePromotionCodeId,
        // Don't expose sensitive data like usage counts or internal IDs
      }
    });
  } catch (error) {
    console.error('❌ [PROMO_VALIDATION] Error validating promo code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}