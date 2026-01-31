import { NextRequest, NextResponse } from 'next/server';
import { createSafeStripeClient } from '@/lib/stripe-safe';

export async function GET(request: NextRequest) {
  try {
    const stripe = createSafeStripeClient();
    
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    console.log('🔍 Fetching all promotion codes from Stripe...');
    
    // Get all promotion codes
    const promoCodes = await stripe.promotionCodes.list({ 
      limit: 100,
      active: true 
    });
    
    // Get all coupons
    const coupons = await stripe.coupons.list({ 
      limit: 100 
    });
    
    return NextResponse.json({
      success: true,
      promotion_codes: promoCodes.data.map((pc: any) => {
        let couponId = null;
        try {
          if (pc.coupon) {
            couponId = typeof pc.coupon === 'string' ? pc.coupon : pc.coupon.id;
          }
        } catch (e) {
          console.error('Error accessing coupon for promo code:', pc.id, e);
        }
        
        return {
          id: pc.id,
          code: pc.code,
          coupon: couponId,
          active: pc.active,
          max_redemptions: pc.max_redemptions || null,
          times_redeemed: pc.times_redeemed || 0,
          expires_at: pc.expires_at || null
        };
      }),
      coupons: coupons.data.map(c => ({
        id: c.id,
        name: c.name || null,
        percent_off: c.percent_off || null,
        amount_off: c.amount_off || null,
        currency: c.currency || null,
        valid: c.valid,
        max_redemptions: c.max_redemptions || null,
        times_redeemed: c.times_redeemed || 0
      })),
      summary: {
        total_promo_codes: promoCodes.data.length,
        total_coupons: coupons.data.length,
        softwareowner_exists: promoCodes.data.some((pc: any) => pc.code && pc.code.toLowerCase() === 'softwareowner')
      }
    });

  } catch (error: any) {
    console.error('❌ Promo code debug failed:', error);
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error.message 
    }, { status: 500 });
  }
}