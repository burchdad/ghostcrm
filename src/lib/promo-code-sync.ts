/**
 * PROMO CODE STRIPE SYNC UTILITIES
 * Functions for syncing promo codes with Stripe
 */

import { supabaseAdmin } from './supabaseAdmin';
import { createSafeStripeClient } from '@/lib/stripe-safe';

const supabase = supabaseAdmin;

/**
 * Sync promo code with Stripe as a coupon
 */
export async function syncPromoCodeWithStripe(promoCodeData: any) {
  const stripe = createSafeStripeClient();
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    let couponParams: any = {
      id: promoCodeData.code, // Use our code as the Stripe coupon ID
      name: promoCodeData.description,
      duration: 'repeating', // Default to repeating
    };

    // Configure discount based on type
    switch (promoCodeData.discount_type) {
      case 'percentage':
        couponParams.percent_off = parseFloat(promoCodeData.discount_value);
        couponParams.duration_in_months = 12; // Default 1 year for percentage discounts
        break;
        
      case 'fixed':
        couponParams.amount_off = Math.round(parseFloat(promoCodeData.discount_value) * 100); // Convert to cents
        couponParams.currency = 'usd';
        couponParams.duration_in_months = 12;
        break;
        
      case 'custom_price':
        // For custom pricing, we'll need to create a special price in Stripe
        // This is more complex and requires product management
        couponParams = await createCustomPriceCoupon(promoCodeData);
        break;
        
      default:
        throw new Error(`Unsupported discount type: ${promoCodeData.discount_type}`);
    }

    // Create or update the coupon in Stripe
    let stripeCoupon;
    try {
      // Try to create new coupon
      stripeCoupon = await stripe.coupons.create(couponParams);
    } catch (error: any) {
      if (error.code === 'resource_already_exists') {
        // Coupon already exists, retrieve it
        stripeCoupon = await stripe.coupons.retrieve(promoCodeData.code);
      } else {
        throw error;
      }
    }

    // Create promotion code for the coupon
    let promotionCode;
    try {
      promotionCode = await stripe.promotionCodes.create({
        coupon: stripeCoupon.id,
        code: promoCodeData.code,
        active: promoCodeData.is_active || true,
        max_redemptions: promoCodeData.max_uses || undefined,
        expires_at: promoCodeData.expires_at ? Math.floor(new Date(promoCodeData.expires_at).getTime() / 1000) : undefined,
      } as any); // Type assertion to handle potential type mismatch
    } catch (error: any) {
      if (error.code === 'resource_already_exists') {
        // Get existing promotion codes for this coupon
        const existingPromoCodes = await stripe.promotionCodes.list({
          coupon: stripeCoupon.id,
          code: promoCodeData.code,
        });
        promotionCode = existingPromoCodes.data[0];
      } else {
        throw error;
      }
    }

    // Update our database with Stripe IDs
    const { error: updateError } = await supabase
      .from('promo_codes')
      .update({
        stripe_coupon_id: stripeCoupon.id,
        stripe_promotion_code_id: promotionCode.id,
        synced_at: new Date().toISOString()
      })
      .eq('code', promoCodeData.code);

    if (updateError) {
      console.error('Failed to update promo code with Stripe IDs:', updateError);
    }

    return {
      stripeCoupon,
      promotionCode
    };

  } catch (error) {
    console.error('Error syncing promo code with Stripe:', error);
    throw error;
  }
}

/**
 * Create custom price coupon for complex pricing scenarios
 */
async function createCustomPriceCoupon(promoCodeData: any) {
  // This would require more complex logic to create
  // custom prices and products in Stripe
  // For now, fall back to a simple percentage discount
  return {
    id: promoCodeData.code,
    name: promoCodeData.description,
    percent_off: 20, // Default to 20% off for custom pricing
    duration: 'repeating',
    duration_in_months: 12
  };
}