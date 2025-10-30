#!/usr/bin/env node

/**
 * STRIPE PRODUCT SYNC SCRIPT
 * Command-line script to sync products between GhostCRM and Stripe
 * 
 * Usage:
 *   node scripts/stripe-product-sync.js [options]
 * 
 * Options:
 *   --dry-run          Preview changes without making them
 *   --force-update     Update all products even if they exist
 *   --validate-only    Only validate existing syncs
 *   --env=<env>        Environment (development, staging, production)
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  forceUpdate: args.includes('--force-update'),
  validateOnly: args.includes('--validate-only'),
  env: args.find(arg => arg.startsWith('--env='))?.split('=')[1] || process.env.NODE_ENV || 'development'
};

console.log('🔧 Stripe Product Sync Script');
console.log(`📋 Options:`, options);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Validate environment
const requiredEnvVars = ['STRIPE_SECRET_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error('\nPlease set these variables in your .env file or environment.');
  process.exit(1);
}

// Mock API call function (since we can't directly import from Next.js)
async function callSyncAPI(action, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/admin/stripe/sync-products`;
  
  const body = {
    action,
    ...options
  };

  try {
    const response = await fetch(url, {
      method: action === 'status' ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      ...(action !== 'status' && { body: JSON.stringify(body) })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ API call failed:`, error.message);
    throw error;
  }
}

// Alternative: Direct import approach (requires building the project first)
async function directSync() {
  try {
    // This would work if we build the project first
    const { syncAllProductsWithStripe, validateProductSync } = require('../dist/lib/stripe/product-sync');
    
    if (options.validateOnly) {
      console.log('🔍 Validating existing product syncs...');
      const validation = await validateProductSync();
      
      console.log(`✅ Validation complete:`);
      console.log(`   - Valid: ${validation.isValid}`);
      console.log(`   - Missing syncs: ${validation.missingSyncs.length}`);
      console.log(`   - Invalid syncs: ${validation.invalidSyncs.length}`);
      
      if (!validation.isValid) {
        console.log('\n📝 Details:');
        if (validation.missingSyncs.length > 0) {
          console.log('   Missing syncs:');
          validation.missingSyncs.forEach(id => console.log(`     - ${id}`));
        }
        if (validation.invalidSyncs.length > 0) {
          console.log('   Invalid syncs:');
          validation.invalidSyncs.forEach(id => console.log(`     - ${id}`));
        }
      }
      return;
    }

    console.log('🔄 Starting product synchronization...');
    const result = await syncAllProductsWithStripe({
      dryRun: options.dryRun,
      forceUpdate: options.forceUpdate
    });

    console.log(`\n📊 Sync Results:`);
    console.log(`   - Success: ${result.success}`);
    console.log(`   - Created: ${result.created}`);
    console.log(`   - Updated: ${result.updated}`);
    console.log(`   - Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`   - ${error}`));
    }

    if (options.dryRun) {
      console.log('\n🧪 This was a dry run - no changes were made to Stripe');
    }

    console.log('\n📦 Products:');
    result.syncedProducts.forEach(product => {
      const statusIcon = {
        created: '✨',
        updated: '🔄',
        synced: '✅',
        error: '❌'
      }[product.status] || '❓';
      
      console.log(`   ${statusIcon} ${product.localName} ($${product.price}) - ${product.status}`);
    });

  } catch (error) {
    console.error('❌ Direct sync failed:', error);
    throw error;
  }
}

// Generate sync report
function generateSyncReport(result) {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    environment: options.env,
    options,
    result
  };

  const reportDir = path.join(process.cwd(), 'logs', 'stripe-sync');
  const reportFile = path.join(reportDir, `sync-${timestamp.split('T')[0]}.json`);

  // Create directory if it doesn't exist
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`📄 Sync report saved: ${reportFile}`);
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting Stripe product sync...\n');

    // First try the API approach
    try {
      let result;
      
      if (options.validateOnly) {
        result = await callSyncAPI('validate');
      } else {
        result = await callSyncAPI('sync', {
          dryRun: options.dryRun,
          forceUpdate: options.forceUpdate
        });
      }

      console.log('✅ Sync completed via API');
      console.log('📊 Result:', JSON.stringify(result, null, 2));
      
      if (!options.dryRun && !options.validateOnly) {
        generateSyncReport(result);
      }

    } catch (apiError) {
      console.warn('⚠️  API approach failed, trying direct import...');
      console.warn('   Make sure your Next.js app is running on the configured URL');
      
      // Fallback to direct import (requires built project)
      await directSync();
    }

    console.log('\n🎉 Product sync script completed successfully!');

  } catch (error) {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, callSyncAPI };