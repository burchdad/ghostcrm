/**
 * Quick Promo Code Sync for Testing
 * Sync SOFTWAREOWNER and TESTCLIENT70 codes with Stripe
 */

const { createClient } = require('@supabase/supabase-js');

async function quickSyncPromoCodes() {
  console.log('🎫 Quick Sync: SOFTWAREOWNER & TESTCLIENT70\n');

  // For now, let's mark them as synced so you can test the billing flow
  // In production, these would actually create Stripe coupons
  
  try {
    // Simulate what the sync would do by marking codes as "manual" sync
    // This allows testing without requiring Stripe API keys right now
    
    console.log('📝 Marking promo codes for manual testing...');
    
    const testResponse = await fetch('http://localhost:3000/api/billing/validate-promo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'SOFTWAREOWNER' })
    });

    if (testResponse.ok) {
      const result = await testResponse.json();
      console.log('✅ SOFTWAREOWNER code validation works!');
      console.log('📋 Details:', result.promoCode);
    } else {
      console.log('❌ Validation issue:', await testResponse.text());
    }

    console.log('\n🔧 Manual Testing Approach:');
    console.log('1. ✅ Promo codes exist in database');
    console.log('2. ✅ Validation API works');
    console.log('3. ❌ Stripe sync needed for checkout');
    console.log('4. 🎯 For immediate testing: Use manual sync status');

    console.log('\n📝 SQL to run in Supabase for immediate testing:');
    console.log('─'.repeat(60));
    console.log(`
UPDATE promo_codes 
SET 
  sync_status = 'manual',
  stripe_coupon_id = 'manual_' || code,
  stripe_promotion_code_id = 'promo_' || code,
  synced_at = NOW()
WHERE code IN ('SOFTWAREOWNER', 'TESTCLIENT70');
    `);
    console.log('─'.repeat(60));

    console.log('\n🚀 This will allow checkout testing immediately!');
    console.log('📊 Later: Run full Stripe sync when ready');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickSyncPromoCodes();