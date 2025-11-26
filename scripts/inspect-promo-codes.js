#!/usr/bin/env node

/**
 * PROMO CODE DATABASE INSPECTOR
 * Inspect and fix promo code data issues
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectPromoCodes() {
  console.log('🔍 Inspecting Promo Code Data\n');

  // Get all promo codes with full details
  const { data: promoCodes, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch promo codes: ${error.message}`);
  }

  promoCodes.forEach(promo => {
    console.log(`📋 Code: ${promo.code}`);
    console.log(`   Description: "${promo.description}" (${promo.description.length} chars)`);
    console.log(`   Discount Type: ${promo.discount_type}`);
    console.log(`   Discount Value: ${promo.discount_value} (${typeof promo.discount_value})`);
    console.log(`   Custom Monthly Price: ${promo.custom_monthly_price}`);
    console.log(`   Custom Yearly Price: ${promo.custom_yearly_price}`);
    console.log(`   Max Uses: ${promo.max_uses}`);
    console.log(`   Expires At: ${promo.expires_at}`);
    console.log(`   Sync Status: ${promo.sync_status}`);
    console.log(`   Sync Error: ${promo.sync_error}`);
    console.log('   ---');
  });
}

async function fixPromoCodeIssues() {
  console.log('🔧 Fixing Promo Code Issues\n');

  // Fix TESTCLIENT70 - shorten description
  const { error: testclientError } = await supabase
    .from('promo_codes')
    .update({
      description: 'Test client special - $70/month',
      sync_status: 'pending',
      sync_error: null
    })
    .eq('code', 'TESTCLIENT70');

  if (testclientError) {
    console.error('❌ Failed to fix TESTCLIENT70:', testclientError);
  } else {
    console.log('✅ Fixed TESTCLIENT70 description');
  }

  // Fix LAUNCH50 - ensure discount_value is set
  const { error: launchError } = await supabase
    .from('promo_codes')
    .update({
      discount_value: 50.0,
      sync_status: 'pending', 
      sync_error: null
    })
    .eq('code', 'LAUNCH50');

  if (launchError) {
    console.error('❌ Failed to fix LAUNCH50:', launchError);
  } else {
    console.log('✅ Fixed LAUNCH50 discount value');
  }

  console.log('\n🔄 Ready to re-sync promo codes!');
}

// Parse command line arguments
const command = process.argv[2];

async function main() {
  try {
    if (command === 'inspect') {
      await inspectPromoCodes();
    } else if (command === 'fix') {
      await fixPromoCodeIssues();
    } else {
      console.log('Usage:');
      console.log('  node scripts/inspect-promo-codes.js inspect');
      console.log('  node scripts/inspect-promo-codes.js fix');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}