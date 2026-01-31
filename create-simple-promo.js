// Alternative approach to create promo code
require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function createSimplePromoCode() {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    console.log('🔍 Listing existing coupons to find one we can use...');
    
    // First, let's see what coupons exist
    const coupons = await stripe.coupons.list({ limit: 10 });
    console.log('📋 Found coupons:', coupons.data.map(c => ({ id: c.id, name: c.name, percent_off: c.percent_off })));
    
    // Find any 100% off coupon we can use
    const ownerCoupon = coupons.data.find(c => c.percent_off === 100);
    
    if (!ownerCoupon) {
      console.log('❌ No 100% off coupon found. Creating one...');
      
      const newCoupon = await stripe.coupons.create({
        percent_off: 100,
        duration: 'forever',
        name: 'Owner Access - 100% Off'
      });
      
      console.log('✅ Created coupon:', newCoupon.id);
    }
    
    const couponToUse = ownerCoupon || newCoupon;
    console.log('🎯 Using coupon:', couponToUse.id);
    
    // Now create a promotion code using direct Stripe API call
    console.log('🛠️ Creating promotion code with direct API...');
    
    const timestamp = Date.now();
    const newCode = `SOFTWAREOWNER${timestamp.toString().slice(-4)}`;
    
    const response = await fetch('https://api.stripe.com/v1/promotion_codes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'code': newCode,
        'coupon': couponToUse.id,
        'active': 'true',
        'max_redemptions': '25'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('🎉 SUCCESS! Created promotion code:', result.code);
      console.log('🆔 Promotion Code ID:', result.id);
      console.log('💰 Max redemptions:', result.max_redemptions);
      console.log('🎯 Use this code in checkout:', result.code);
      
      return result;
    } else {
      console.log('❌ Error:', result.error?.message || 'Failed to create promotion code');
      throw new Error(result.error?.message || 'Failed to create');
    }
    
  } catch (error) {
    console.error('💥 Failed:', error.message);
    throw error;
  }
}

// Run it
createSimplePromoCode()
  .then(result => {
    console.log('\n✅ Done! Your new promo code is ready to use.');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });