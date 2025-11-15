/**
 * Test Both Promo Codes
 * Verify TESTCLIENT70 and SOFTWAREOWNER codes work properly
 */

async function testBothPromoCodes() {
  console.log('🎫 Testing Both Promo Codes\n');

  const codes = [
    {
      code: 'TESTCLIENT70',
      expectedMonthly: 70.00,
      description: 'Test client special pricing'
    },
    {
      code: 'SOFTWAREOWNER', 
      expectedMonthly: 0.00,
      description: 'Software owner free access'
    }
  ];

  for (const promoTest of codes) {
    console.log(`🔍 Testing: ${promoTest.code}`);
    console.log(`   Expected: $${promoTest.expectedMonthly}/month`);
    
    try {
      const response = await fetch('http://localhost:3000/api/billing/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoTest.code })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.promoCode) {
          console.log(`   ✅ VALID: ${result.promoCode.description}`);
          console.log(`   💰 Monthly: $${result.promoCode.customMonthlyPrice || 'Standard pricing'}`);
          console.log(`   📅 Yearly: $${result.promoCode.customYearlyPrice || 'Standard pricing'}`);
          console.log(`   🔧 Type: ${result.promoCode.discountType}`);
          
          // Verify expected pricing
          if (result.promoCode.customMonthlyPrice === promoTest.expectedMonthly) {
            console.log(`   🎯 Pricing matches expected: $${promoTest.expectedMonthly}`);
          } else {
            console.log(`   ⚠️  Pricing mismatch: Expected $${promoTest.expectedMonthly}, got $${result.promoCode.customMonthlyPrice}`);
          }
        } else {
          console.log(`   ❌ INVALID: ${result.error || 'Unknown error'}`);
        }
      } else {
        const error = await response.text();
        console.log(`   ❌ API Error (${response.status}): ${error}`);
      }
    } catch (error) {
      console.log(`   ❌ Connection Error: ${error.message}`);
      console.log(`   💡 Make sure dev server is running: npm run dev`);
    }
    
    console.log(''); // Empty line between tests
  }

  console.log('📋 Summary:');
  console.log('   🎯 TESTCLIENT70: $70/month for your test client');
  console.log('   🆓 SOFTWAREOWNER: $0/month for you (software owner)');
  console.log('   🔄 Both codes should sync to Stripe when ready');
  console.log('   📊 Usage will be tracked in analytics');
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. Test codes in billing page: http://localhost:3000/billing');
  console.log('   2. Sync with Stripe: node scripts/manage-promo-codes.js sync-all');
  console.log('   3. Monitor usage: node scripts/manage-promo-codes.js analytics');
}

// Run the test
testBothPromoCodes().catch(console.error);