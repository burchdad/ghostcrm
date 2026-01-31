/**
 * COMPREHENSIVE PROMO CODE STRIPE INTEGRATION
 * This creates a proper system for syncing promo codes with Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { syncPromoCodeWithStripe } from '@/lib/promo-code-sync';
import { createSafeStripeClient } from '@/lib/stripe-safe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Create custom price coupon for custom_price discount type
 */
async function createCustomPriceCoupon(promoCodeData: any) {
  const stripe = createSafeStripeClient();
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  // For custom pricing, we need to calculate the discount percentage
  // based on the original plan prices vs custom prices
  
  // This is a complex scenario - you might want to:
  // 1. Create specific products/prices for custom pricing
  // 2. Use a percentage discount that achieves the target price
  // 3. Handle this manually in checkout

  // For now, let's create a percentage discount that gets close to the target
  // This requires knowing your standard pricing
  const standardMonthlyPrice = 199; // Your standard price
  const customMonthlyPrice = promoCodeData.custom_monthly_price;
  
  if (customMonthlyPrice === 0) {
    // 100% discount for free access
    return {
      percent_off: 100,
      duration: promoCodeData.expires_at ? 'repeating' : 'forever',
      duration_in_months: promoCodeData.expires_at ? 12 : undefined
    };
  }
  
  const discountPercentage = Math.round(((standardMonthlyPrice - customMonthlyPrice) / standardMonthlyPrice) * 100);
  
  return {
    percent_off: Math.max(0, Math.min(100, discountPercentage)),
    duration: 'repeating',
    duration_in_months: 12
  };
}

/**
 * API Endpoint: Sync promo code with Stripe
 */
export async function POST(request: NextRequest) {
  try {
    const { promoCodeId } = await request.json();

    if (!promoCodeId) {
      return NextResponse.json(
        { error: 'Promo code ID is required' },
        { status: 400 }
      );
    }

    // Get promo code from database
    const { data: promoCode, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('id', promoCodeId)
      .single();

    if (error || !promoCode) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      );
    }

    // Sync with Stripe
    const result = await syncPromoCodeWithStripe(promoCode);

    return NextResponse.json({
      success: true,
      message: 'Promo code synced with Stripe successfully',
      stripe_coupon_id: result.stripeCoupon.id,
      stripe_promotion_code_id: result.promotionCode.id
    });

  } catch (error) {
    console.error('Error syncing promo code:', error);
    return NextResponse.json(
      { error: 'Failed to sync promo code with Stripe' },
      { status: 500 }
    );
  }
}

/**
 * Bulk sync all promo codes
 */
export async function PUT(request: NextRequest) {
  try {
    // Get all active promo codes that aren't synced yet
    const { data: promoCodes, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('is_active', true)
      .is('stripe_coupon_id', null);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch promo codes' },
        { status: 500 }
      );
    }

    const results: any[] = [];
    const errors: any[] = [];

    for (const promoCode of promoCodes) {
      try {
        const result = await syncPromoCodeWithStripe(promoCode);
        results.push({
          code: promoCode.code,
          stripe_coupon_id: result.stripeCoupon.id,
          stripe_promotion_code_id: result.promotionCode.id
        });
      } catch (error) {
        errors.push({
          code: promoCode.code,
          error: String(error)
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${results.length} promo codes with Stripe`,
      results,
      errors
    });

  } catch (error) {
    console.error('Error bulk syncing promo codes:', error);
    return NextResponse.json(
      { error: 'Failed to bulk sync promo codes' },
      { status: 500 }
    );
  }
}