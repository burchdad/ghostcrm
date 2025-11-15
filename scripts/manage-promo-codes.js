#!/usr/bin/env node

/**
 * PROMO CODE MANAGEMENT SCRIPT
 * Comprehensive tool for managing promo codes and Stripe integration
 * 
 * Usage:
 *   node scripts/manage-promo-codes.js sync-all
 *   node scripts/manage-promo-codes.js create "NEWCODE50" "50% off new customers" percentage 50
 *   node scripts/manage-promo-codes.js status
 *   node scripts/manage-promo-codes.js analytics
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const COMMANDS = {
  'sync-all': syncAllPromoCodes,
  'create': createPromoCode,
  'status': showStatus,
  'analytics': showAnalytics,
  'help': showHelp
};

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command || !COMMANDS[command]) {
    showHelp();
    process.exit(1);
  }

  try {
    await COMMANDS[command](...args);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function syncAllPromoCodes() {
  console.log('🔄 Syncing all promo codes with Stripe...\n');

  // Get all active promo codes that need syncing
  const { data: promoCodes, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('is_active', true)
    .in('sync_status', ['pending', 'error']);

  if (error) {
    throw new Error(`Failed to fetch promo codes: ${error.message}`);
  }

  console.log(`Found ${promoCodes.length} promo codes to sync:`);

  let successCount = 0;
  let errorCount = 0;

  for (const promo of promoCodes) {
    try {
      console.log(`  📝 Syncing: ${promo.code} (${promo.description})`);
      
      // Call the sync API
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/promo-codes/sync-stripe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoCodeId: promo.id })
      });

      if (response.ok) {
        console.log(`  ✅ Successfully synced: ${promo.code}`);
        successCount++;
      } else {
        const error = await response.text();
        console.log(`  ❌ Failed to sync ${promo.code}: ${error}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`  ❌ Failed to sync ${promo.code}: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Sync Summary:`);
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Failed: ${errorCount}`);
  console.log(`  📈 Total: ${promoCodes.length}`);
}

async function createPromoCode(code, description, type, value, ...options) {
  if (!code || !description || !type) {
    console.log('❌ Usage: create <code> <description> <type> <value> [options]');
    console.log('   Types: percentage, fixed, custom_price');
    console.log('   Example: create "SAVE20" "20% off" percentage 20');
    return;
  }

  console.log(`🆕 Creating promo code: ${code}`);

  const promoData = {
    code: code.toUpperCase(),
    description,
    discountType: type,
    discountValue: parseFloat(value),
    autoSyncStripe: true
  };

  // Parse additional options
  if (type === 'custom_price' && options[0]) {
    promoData.customMonthlyPrice = parseFloat(options[0]);
    promoData.customYearlyPrice = parseFloat(options[1]) || promoData.customMonthlyPrice * 12;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/owner/promo-codes`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': 'owner_session=dummy_token_for_script' // You'd need proper auth
      },
      body: JSON.stringify(promoData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Promo code created successfully!');
      console.log('📋 Details:', result.promoCode);
    } else {
      const error = await response.text();
      console.log('❌ Failed to create promo code:', error);
    }
  } catch (error) {
    console.log('❌ Error creating promo code:', error.message);
  }
}

async function showStatus() {
  console.log('📊 Promo Code Status Report\n');

  const { data: promoCodes, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch promo codes: ${error.message}`);
  }

  console.log(`Total promo codes: ${promoCodes.length}\n`);

  // Group by status
  const byStatus = promoCodes.reduce((acc, promo) => {
    const status = promo.is_active ? 'active' : 'inactive';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  console.log('📈 Status Breakdown:');
  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  // Group by sync status
  const bySyncStatus = promoCodes.reduce((acc, promo) => {
    acc[promo.sync_status] = (acc[promo.sync_status] || 0) + 1;
    return acc;
  }, {});

  console.log('\n🔄 Sync Status:');
  Object.entries(bySyncStatus).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  console.log('\n📋 Recent Promo Codes:');
  promoCodes.slice(0, 5).forEach(promo => {
    const expiry = promo.expires_at ? new Date(promo.expires_at).toLocaleDateString() : 'Never';
    const usage = promo.max_uses ? `${promo.used_count}/${promo.max_uses}` : `${promo.used_count}/∞`;
    console.log(`  • ${promo.code} - ${promo.description}`);
    console.log(`    Type: ${promo.discount_type}, Usage: ${usage}, Expires: ${expiry}`);
    console.log(`    Sync: ${promo.sync_status}, Active: ${promo.is_active ? 'Yes' : 'No'}\n`);
  });
}

async function showAnalytics() {
  console.log('📊 Promo Code Analytics\n');

  // Get usage data
  const { data: usage, error } = await supabase
    .from('promo_code_usage')
    .select(`
      *,
      promo_codes:promo_code_id (
        code,
        description,
        discount_type
      )
    `)
    .order('used_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch analytics: ${error.message}`);
  }

  console.log(`Total usage records: ${usage.length}\n`);

  if (usage.length === 0) {
    console.log('No usage data available yet.');
    return;
  }

  // Calculate total savings
  const totalSavings = usage.reduce((sum, record) => sum + (record.discount_amount || 0), 0);
  console.log(`💰 Total customer savings: $${(totalSavings / 100).toFixed(2)}`);

  // Most popular codes
  const codeUsage = usage.reduce((acc, record) => {
    const code = record.promo_codes?.code || 'Unknown';
    acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {});

  console.log('\n🏆 Most Popular Codes:');
  Object.entries(codeUsage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([code, count]) => {
      console.log(`  ${code}: ${count} uses`);
    });

  // Recent usage
  console.log('\n📅 Recent Usage:');
  usage.slice(0, 10).forEach(record => {
    const code = record.promo_codes?.code || 'Unknown';
    const date = new Date(record.used_at).toLocaleDateString();
    const savings = `$${(record.discount_amount / 100).toFixed(2)}`;
    console.log(`  ${date}: ${code} - ${savings} saved by ${record.used_by_email}`);
  });
}

function showHelp() {
  console.log(`
🎫 GhostCRM Promo Code Management Tool

COMMANDS:
  sync-all             Sync all pending promo codes with Stripe
  create <args>        Create a new promo code
  status              Show promo code status summary
  analytics           Show usage analytics
  help                Show this help message

EXAMPLES:
  # Sync all codes with Stripe
  node scripts/manage-promo-codes.js sync-all

  # Create a percentage discount
  node scripts/manage-promo-codes.js create "SAVE25" "25% off new customers" percentage 25

  # Create custom pricing
  node scripts/manage-promo-codes.js create "SPECIAL99" "Special pricing" custom_price 0 99 1188

  # Show status and analytics
  node scripts/manage-promo-codes.js status
  node scripts/manage-promo-codes.js analytics

ENVIRONMENT VARIABLES REQUIRED:
  NEXT_PUBLIC_SUPABASE_URL     - Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY    - Supabase service role key
  NEXT_PUBLIC_APP_URL          - Your app URL (for API calls)
  STRIPE_SECRET_KEY            - Stripe secret key
`);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, syncAllPromoCodes, createPromoCode, showStatus, showAnalytics };