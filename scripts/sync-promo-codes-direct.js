#!/usr/bin/env node

/**
 * DIRECT PROMO CODE STRIPE SYNC
 * Syncs promo codes directly with Stripe without needing the web server
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Check for Stripe configuration
function checkStripeConfig() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.log('📝 Please add your Stripe secret key to .env.local:');
    console.log('STRIPE_SECRET_KEY=sk_test_...');
    process.exit(1);
  }
  return true;
}

// Initialize Stripe (using require to avoid TypeScript issues)
function createStripeClient() {
  try {
    const Stripe = require('stripe');
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });
  } catch (error) {
    console.log('❌ Stripe package not installed. Installing now...');
    console.log('Run: npm install stripe');
    process.exit(1);
  }
}

/**
 * Sync a single promo code with Stripe
 */
async function syncPromoCodeWithStripe(stripe, promoCodeData) {
  try {
    let couponParams = {
      id: promoCodeData.code, // Use our code as the Stripe coupon ID
      name: promoCodeData.description,
      duration: 'repeating', // Default to repeating
    };

    // Configure discount based on type
    switch (promoCodeData.discount_type) {
      case 'percentage':
        couponParams.percent_off = parseFloat(promoCodeData.discount_value || 0);
        couponParams.duration_in_months = 12; // Default 1 year for percentage discounts
        break;
        
      case 'fixed':
        couponParams.amount_off = Math.round(parseFloat(promoCodeData.discount_value || 0) * 100); // Convert to cents
        couponParams.currency = 'usd';
        couponParams.duration_in_months = 12;
        break;
        
      case 'custom_price':
        // For custom pricing, create a 100% discount 
        // (you'll handle the custom pricing in your checkout logic)
        couponParams.percent_off = 100;
        couponParams.duration = 'forever';
        delete couponParams.duration_in_months;
        break;
        
      default:
        throw new Error(`Unsupported discount type: ${promoCodeData.discount_type}`);
    }

    // Create or update the coupon in Stripe
    let stripeCoupon;
    try {
      // Try to create new coupon
      stripeCoupon = await stripe.coupons.create(couponParams);
      console.log(`    ✅ Created Stripe coupon: ${stripeCoupon.id}`);
    } catch (error) {
      if (error.code === 'resource_already_exists') {
        // Coupon already exists, retrieve it
        stripeCoupon = await stripe.coupons.retrieve(promoCodeData.code);
        console.log(`    🔄 Using existing Stripe coupon: ${stripeCoupon.id}`);
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
      });
      console.log(`    ✅ Created Stripe promotion code: ${promotionCode.id}`);
    } catch (error) {
      if (error.code === 'resource_already_exists') {
        // Get existing promotion codes for this coupon
        const existingPromoCodes = await stripe.promotionCodes.list({
          coupon: stripeCoupon.id,
          code: promoCodeData.code,
        });
        promotionCode = existingPromoCodes.data[0];
        console.log(`    🔄 Using existing Stripe promotion code: ${promotionCode.id}`);
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
        synced_at: new Date().toISOString(),
        sync_status: 'synced',
        sync_error: null
      })
      .eq('code', promoCodeData.code);

    if (updateError) {
      console.error('    ❌ Failed to update database:', updateError);
      throw updateError;
    }

    console.log(`    ✅ Database updated with Stripe IDs`);

    return {
      stripeCoupon,
      promotionCode
    };

  } catch (error) {
    // Update database with error status
    await supabase
      .from('promo_codes')
      .update({
        sync_status: 'error',
        sync_error: error.message
      })
      .eq('code', promoCodeData.code);
    
    throw error;
  }
}

async function syncAllPromoCodes() {
  console.log('🔄 Direct Stripe Sync for Promo Codes\n');

  // Check configuration
  if (!checkStripeConfig()) return;
  
  const stripe = createStripeClient();
  console.log('✅ Stripe client initialized\n');

  // Get all active promo codes that need syncing
  const { data: promoCodes, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('is_active', true)
    .in('sync_status', ['pending', 'error']);

  if (error) {
    throw new Error(`Failed to fetch promo codes: ${error.message}`);
  }

  console.log(`📊 Found ${promoCodes.length} promo codes to sync:\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const promo of promoCodes) {
    console.log(`📝 Syncing: ${promo.code} - ${promo.description}`);
    console.log(`   Type: ${promo.discount_type}, Value: ${promo.discount_value || promo.custom_monthly_price || 'N/A'}`);
    
    try {
      await syncPromoCodeWithStripe(stripe, promo);
      console.log(`   ✅ SUCCESS: ${promo.code} synced with Stripe\n`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ FAILED: ${promo.code} - ${error.message}\n`);
      errorCount++;
    }
  }

  console.log('📊 Sync Summary:');
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Failed: ${errorCount}`);
  console.log(`  📈 Total: ${promoCodes.length}`);

  if (successCount > 0) {
    console.log('\n🎉 Promo codes are now available in Stripe!');
    console.log('💡 Customers can use these codes during checkout.');
  }
}

// Run the sync
if (require.main === module) {
  syncAllPromoCodes().catch(error => {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  });
}

module.exports = { syncAllPromoCodes };