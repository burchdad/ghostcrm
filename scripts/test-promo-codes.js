#!/usr/bin/env node

/**
 * PROMO CODE VALIDATION TEST
 * Tests that promo codes work with your validation endpoint
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPromoCodeValidation() {
  console.log('🧪 Testing Promo Code Validation System\n');

  const testCodes = ['TESTCLIENT70', 'SOFTWAREOWNER', 'LAUNCH50', 'INVALID123'];

  for (const code of testCodes) {
    console.log(`🔍 Testing code: ${code}`);
    
    try {
      // Test database validation first
      const { data: promoCode, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error || !promoCode) {
        console.log(`   ❌ Database: Code not found or inactive`);
        continue;
      }

      console.log(`   ✅ Database: Found ${promoCode.discount_type} discount`);
      
      // Check sync status
      if (promoCode.sync_status === 'synced') {
        console.log(`   ✅ Stripe: Synced (Coupon: ${promoCode.stripe_coupon_id})`);
        console.log(`   ✅ Stripe: Promotion Code: ${promoCode.stripe_promotion_code_id}`);
      } else {
        console.log(`   ⚠️  Stripe: Not synced (Status: ${promoCode.sync_status})`);
      }

      // Show discount details
      if (promoCode.discount_type === 'percentage') {
        console.log(`   💰 Discount: ${promoCode.discount_value}% off`);
      } else if (promoCode.discount_type === 'custom_price') {
        if (promoCode.custom_monthly_price === 0) {
          console.log(`   💰 Discount: Free access`);
        } else {
          console.log(`   💰 Discount: $${promoCode.custom_monthly_price}/month`);
        }
      }

      // Check expiration
      if (promoCode.expires_at) {
        const expiryDate = new Date(promoCode.expires_at);
        const isExpired = expiryDate < new Date();
        console.log(`   📅 Expires: ${expiryDate.toLocaleDateString()} ${isExpired ? '(EXPIRED)' : '(Active)'}`);
      } else {
        console.log(`   📅 Expires: Never`);
      }

      // Check usage
      if (promoCode.max_uses) {
        console.log(`   📊 Usage: ${promoCode.used_count || 0}/${promoCode.max_uses}`);
      } else {
        console.log(`   📊 Usage: Unlimited`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log(''); // Empty line
  }
}

async function showStripePromoCodeStatus() {
  console.log('🔍 Checking Stripe Integration Status\n');

  // Check if we have Stripe keys
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('❌ STRIPE_SECRET_KEY not configured');
    return;
  }

  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });

    // List promotion codes
    const promoCodes = await stripe.promotionCodes.list({ limit: 10, active: true });
    
    console.log(`✅ Found ${promoCodes.data.length} active promotion codes in Stripe:`);
    
    promoCodes.data.forEach(promo => {
      console.log(`   • ${promo.code} (ID: ${promo.id})`);
      console.log(`     Coupon: ${promo.coupon}`);
      console.log(`     Active: ${promo.active}`);
      if (promo.max_redemptions) {
        console.log(`     Max uses: ${promo.max_redemptions}`);
      }
      console.log('');
    });

  } catch (error) {
    console.log(`❌ Stripe Error: ${error.message}`);
  }
}

// Run tests
async function runAllTests() {
  try {
    await testPromoCodeValidation();
    await showStripePromoCodeStatus();
    
    console.log('🎉 Testing complete!');
    console.log('\n💡 To test checkout flow:');
    console.log('1. Go to http://localhost:3000/billing');
    console.log('2. Enter a promo code (try LAUNCH50 for 50% off)');
    console.log('3. Verify discount is applied');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runAllTests();
}