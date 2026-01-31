import { NextRequest, NextResponse } from 'next/server';
import { createSafeStripeClient } from '@/lib/stripe-safe';

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    const stripe = createSafeStripeClient();
    
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    console.log('🎫 Creating SOFTWAREOWNER promo code system...');

    // Create a 100% off coupon for software owner
    const coupon = await stripe.coupons.create({
      id: 'software_owner_100_off',
      name: 'Software Owner - 100% Off',
      percent_off: 100,
      duration: 'forever',
      max_redemptions: 10, // Limit to prevent abuse
      metadata: {
        type: 'software_owner',
        created_by: 'system',
        description: 'Full access coupon for software owner'
      }
    });

    console.log('✅ Created coupon:', coupon.id);

    // Create the promotion code
    const promoCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: 'SOFTWAREOWNER',
      active: true,
      max_redemptions: 10,
      metadata: {
        type: 'software_owner',
        created_by: 'system'
      }
    } as any);

    console.log('✅ Created promo code:', promoCode.code);

    // Also create some other useful promo codes
    const promoCodes: any[] = [];

    // 50% off for early adopters
    const earlyAdopterCoupon = await stripe.coupons.create({
      id: 'early_adopter_50_off',
      name: 'Early Adopter - 50% Off',
      percent_off: 50,
      duration: 'once',
      metadata: {
        type: 'early_adopter',
        created_by: 'system'
      }
    });

    const earlyAdopterPromo = await stripe.promotionCodes.create({
      coupon: earlyAdopterCoupon.id,
      code: 'EARLY50',
      active: true,
      max_redemptions: 100
    } as any);

    promoCodes.push(earlyAdopterPromo);

    // 25% off for launch
    const launchCoupon = await stripe.coupons.create({
      id: 'launch_25_off',
      name: 'Launch Special - 25% Off',
      percent_off: 25,
      duration: 'once',
      metadata: {
        type: 'launch_special',
        created_by: 'system'
      }
    });

    const launchPromo = await stripe.promotionCodes.create({
      coupon: launchCoupon.id,
      code: 'LAUNCH25',
      active: true,
      max_redemptions: 500
    } as any);

    promoCodes.push(launchPromo);

    return NextResponse.json({
      success: true,
      message: 'Promo codes created successfully!',
      created: {
        software_owner: {
          coupon: coupon.id,
          promo_code: promoCode.code,
          discount: '100% off',
          duration: 'forever'
        },
        early_adopter: {
          coupon: earlyAdopterCoupon.id,
          promo_code: earlyAdopterPromo.code,
          discount: '50% off',
          duration: 'once'
        },
        launch_special: {
          coupon: launchCoupon.id,
          promo_code: launchPromo.code,
          discount: '25% off',
          duration: 'once'
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Promo code creation failed:', error);
    
    // Handle case where coupon/promo already exists
    if (error.code === 'resource_already_exists') {
      return NextResponse.json({ 
        error: 'Promo codes already exist', 
        details: error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Creation failed', 
      details: error.message 
    }, { status: 500 });
  }
}