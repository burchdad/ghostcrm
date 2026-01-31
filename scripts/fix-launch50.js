#!/usr/bin/env node

/**
 * FIX LAUNCH50 SPECIFIC ISSUE
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixLaunch50() {
  console.log('🔧 Fixing LAUNCH50 data structure...');
  
  // LAUNCH50 should be a 50% discount, not custom pricing
  const { error } = await supabase
    .from('promo_codes')
    .update({
      discount_type: 'percentage',
      discount_value: 50.0,        // 50% discount
      custom_monthly_price: null,  // Clear this since it's not custom pricing
      custom_yearly_price: null,   // Clear this since it's not custom pricing
      sync_status: 'pending',
      sync_error: null
    })
    .eq('code', 'LAUNCH50');

  if (error) {
    console.error('❌ Failed to fix LAUNCH50:', error);
  } else {
    console.log('✅ Fixed LAUNCH50: Now properly configured as 50% percentage discount');
  }
}

fixLaunch50();