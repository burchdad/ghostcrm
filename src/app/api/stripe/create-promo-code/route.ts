import { NextRequest, NextResponse } from 'next/server';
import { createSafeStripeClient } from '@/lib/stripe-safe';

export async function GET(request: NextRequest) {
  try {
    const stripe = createSafeStripeClient();
    
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    console.log('🎫 Creating promotion code for existing coupon...');

    // Use fetch to directly call Stripe API since TypeScript types seem incorrect
    const response = await fetch('https://api.stripe.com/v1/promotion_codes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'code': 'SOFTWAREOWNER',
        'coupon': 'software_owner_100_off',
        'active': 'true',
        'max_redemptions': '10',
        'metadata[type]': 'software_owner',
        'metadata[created_by]': 'system'
      })
    });

    const promoCodeData = await response.json();

    if (!response.ok) {
      throw new Error(promoCodeData.error?.message || 'Failed to create promotion code');
    }

    console.log('✅ Created promo code:', promoCodeData.code);

    return NextResponse.json({
      success: true,
      message: 'SOFTWAREOWNER promo code created successfully!',
      promo_code: {
        id: promoCodeData.id,
        code: promoCodeData.code,
        coupon: promoCodeData.coupon,
        active: promoCodeData.active,
        max_redemptions: promoCodeData.max_redemptions
      }
    });

  } catch (error: any) {
    console.error('❌ Promo code creation failed:', error);
    
    if (error.code === 'resource_already_exists') {
      return NextResponse.json({ 
        success: true,
        message: 'SOFTWAREOWNER promo code already exists!',
        details: error.message 
      });
    }
    
    return NextResponse.json({ 
      error: 'Creation failed', 
      details: error.message 
    }, { status: 500 });
  }
}