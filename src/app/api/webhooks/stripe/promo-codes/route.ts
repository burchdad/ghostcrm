/**
 * STRIPE WEBHOOK HANDLER FOR PROMO CODE SYNC
 * Handles webhook events from Stripe to keep promo codes in sync
 * 
 * Events handled:
 * - promotion_code.created: When a promo code is created in Stripe
 * - promotion_code.updated: When a promo code is updated in Stripe  
 * - coupon.created: When a coupon is created in Stripe
 * - coupon.updated: When a coupon is updated in Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createSafeStripeClient } from '@/lib/stripe-safe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Convert Stripe coupon to our promo code format
 */
function convertStripeCouponToPromoCode(coupon: Stripe.Coupon, promotionCode?: Stripe.PromotionCode) {
  let discount_type = 'percentage';
  let discount_value: number | null = null;
  let custom_monthly_price = null;
  let custom_yearly_price = null;

  if (coupon.percent_off) {
    discount_type = 'percentage';
    discount_value = coupon.percent_off;
  } else if (coupon.amount_off) {
    discount_type = 'fixed';
    discount_value = coupon.amount_off / 100; // Convert from cents to dollars
  } else {
    // If neither percent_off nor amount_off, assume custom pricing
    discount_type = 'custom_price';
    // You might need to extract custom pricing from metadata
  }

  return {
    code: promotionCode?.code || coupon.id,
    description: coupon.name || 'Imported from Stripe',
    discount_type,
    discount_value,
    custom_monthly_price,
    custom_yearly_price,
    max_uses: promotionCode?.max_redemptions || null,
    expires_at: promotionCode?.expires_at ? new Date(promotionCode.expires_at * 1000).toISOString() : null,
    is_active: promotionCode?.active ?? true,
    created_by: 'stripe_webhook',
    notes: 'Automatically synced from Stripe',
    stripe_coupon_id: coupon.id,
    stripe_promotion_code_id: promotionCode?.id || null,
    sync_status: 'synced',
    synced_at: new Date().toISOString()
  };
}

/**
 * Handle promotion_code.created event
 */
async function handlePromotionCodeCreated(event: Stripe.Event) {
  const promotionCode = event.data.object as Stripe.PromotionCode;

  const stripe = createSafeStripeClient();
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  // promotionCode.coupon is the coupon ID string, fetch the full coupon from Stripe
  const coupon = await stripe.coupons.retrieve((promotionCode as any).coupon as string);

  console.log(`🎫 New promotion code created in Stripe: ${promotionCode.code}`);

  // Check if we already have this promo code
  const { data: existingPromo, error: fetchError } = await supabase
    .from('promo_codes')
    .select('id, notes')
    .eq('code', promotionCode.code)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error checking existing promo code:', fetchError);
    throw fetchError;
  }

  if (existingPromo) {
    console.log(`⚠️ Promo code ${promotionCode.code} already exists, updating...`);
    
    // Update existing promo code
    const { error: updateError } = await supabase
      .from('promo_codes')
      .update({
        stripe_coupon_id: coupon.id,
        stripe_promotion_code_id: promotionCode.id,
        sync_status: 'synced',
        synced_at: new Date().toISOString(),
        notes: (existingPromo.notes || '') + ' - Updated from Stripe webhook'
      })
      .eq('code', promotionCode.code);

    if (updateError) {
      console.error('Error updating promo code:', updateError);
      throw updateError;
    }
  } else {
    console.log(`✅ Creating new promo code in database: ${promotionCode.code}`);
    
    // Create new promo code
    const promoCodeData = convertStripeCouponToPromoCode(coupon, promotionCode);
    
    const { error: insertError } = await supabase
      .from('promo_codes')
      .insert(promoCodeData);

    if (insertError) {
      console.error('Error inserting promo code:', insertError);
      throw insertError;
    }
  }

  console.log(`✅ Successfully synced promotion code: ${promotionCode.code}`);
}

/**
 * Handle promotion_code.updated event
 */
async function handlePromotionCodeUpdated(event: Stripe.Event) {
  const promotionCode = event.data.object as Stripe.PromotionCode;

  console.log(`🔄 Promotion code updated in Stripe: ${promotionCode.code}`);

  // Update our database
  const { error: updateError } = await supabase
    .from('promo_codes')
    .update({
      is_active: promotionCode.active,
      max_uses: promotionCode.max_redemptions,
      expires_at: promotionCode.expires_at ? new Date(promotionCode.expires_at * 1000).toISOString() : null,
      synced_at: new Date().toISOString()
    })
    .eq('stripe_promotion_code_id', promotionCode.id);

  if (updateError) {
    console.error('Error updating promo code from webhook:', updateError);
    throw updateError;
  }

  console.log(`✅ Successfully updated promotion code: ${promotionCode.code}`);
}

/**
 * Handle coupon.created event
 */
async function handleCouponCreated(event: Stripe.Event) {
  const coupon = event.data.object as Stripe.Coupon;

  console.log(`🎟️ New coupon created in Stripe: ${coupon.id}`);

  // Check if this coupon already has promotion codes
  const stripe = createSafeStripeClient();
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const promotionCodes = await stripe.promotionCodes.list({
    coupon: coupon.id,
    limit: 1
  });

  if (promotionCodes.data.length > 0) {
    // There's already a promotion code for this coupon, let the promotion_code.created event handle it
    console.log(`ℹ️ Coupon ${coupon.id} has promotion codes, skipping direct sync`);
    return;
  }

  // This is a standalone coupon without a promotion code
  console.log(`ℹ️ Standalone coupon ${coupon.id} created, not creating promo code entry`);
}

/**
 * Main webhook handler
 */
export async function POST(req: NextRequest) {
  try {
    const stripe = createSafeStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      );
    }

    const body = await req.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing webhook secret');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`📥 Received webhook: ${event.type}`);

    // Handle different event types
    try {
      switch (event.type) {
        case 'promotion_code.created':
          await handlePromotionCodeCreated(event);
          break;

        case 'promotion_code.updated':
          await handlePromotionCodeUpdated(event);
          break;

        case 'coupon.created':
          await handleCouponCreated(event);
          break;

        case 'coupon.updated':
          // Handle coupon updates if needed
          console.log(`ℹ️ Coupon updated: ${event.data.object.id}`);
          break;

        default:
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
          break;
      }

      return NextResponse.json({ received: true, processed: true });

    } catch (error) {
      console.error('Error processing webhook event:', error);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}