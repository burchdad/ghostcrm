// Quick script to create a fresh SOFTWAREOWNER promo code
require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function createFreshPromoCode() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment');
      return;
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('🎫 Creating fresh SOFTWAREOWNER promo code...');

    // Create a new 100% off coupon with unique ID
    const timestamp = Date.now();
    const couponId = `software_owner_100_off_${timestamp}`;
    
    const coupon = await stripe.coupons.create({
      id: couponId,
      name: 'Software Owner - 100% Off (Fresh)',
      percent_off: 100,
      duration: 'forever',
      max_redemptions: 25, // Increased limit
      metadata: {
        type: 'software_owner',
        created_by: 'script',
        description: 'Fresh software owner coupon',
        created_at: new Date().toISOString()
      }
    });

    console.log('✅ Created coupon:', coupon.id);

    // Create the promotion code (the coupon created successfully!)
    console.log('🎯 Now creating promotion code using coupon:', couponId);
    
    // Use the actual coupon object passed 
    const promoCode = await stripe.promotionCodes.create({
      coupon: coupon.id,  // Use coupon.id from the created coupon
      code: 'SOFTWAREOWNER',
      active: true,
      max_redemptions: 25,
      metadata: {
        type: 'software_owner',
        created_by: 'script'
      }
    });

    console.log('✅ Created fresh promo code:', promoCode.code);
    console.log('🎯 Promotion code ID:', promoCode.id);
    console.log('💰 Max redemptions:', promoCode.max_redemptions);
    console.log('🆔 Coupon ID:', promoCode.coupon.id);
    
    return {
      promoCodeId: promoCode.id,
      couponId: coupon.id,
      code: promoCode.code
    };
    
  } catch (error) {
    if (error.code === 'resource_already_exists') {
      console.log('ℹ️ Promo code already exists, trying to update max redemptions...');
      
      try {
        // Try to create a new promotion code with a different approach
        const existingCoupons = await stripe.coupons.list({ limit: 10 });
        const ownerCoupon = existingCoupons.data.find(c => c.id.includes('software_owner'));
        
        if (ownerCoupon) {
          console.log('📋 Found existing coupon:', ownerCoupon.id);
          
          // Create new promotion code with timestamp
          const newPromoCode = await stripe.promotionCodes.create({
            coupon: ownerCoupon.id,
            code: `SOFTWAREOWNER${timestamp}`,
            active: true,
            max_redemptions: 25,
            metadata: {
              type: 'software_owner_fresh',
              created_by: 'script_refresh'
            }
          });
          
          console.log('✅ Created alternative promo code:', newPromoCode.code);
          console.log('🎯 Use this code instead:', newPromoCode.code);
          
          return {
            promoCodeId: newPromoCode.id,
            couponId: ownerCoupon.id,
            code: newPromoCode.code
          };
        }
      } catch (updateError) {
        console.error('❌ Failed to create alternative:', updateError.message);
      }
    }
    
    console.error('❌ Error creating promo code:', error.message);
    throw error;
  }
}

// Run the script
createFreshPromoCode()
  .then(result => {
    if (result) {
      console.log('\n🎉 SUCCESS! New promo code created:');
      console.log('Code to use:', result.code);
      console.log('Stripe Promotion ID:', result.promoCodeId);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });