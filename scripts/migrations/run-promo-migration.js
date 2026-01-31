/**
 * Simple Promo Code Migration Runner
 * Run this to apply the promo code Stripe sync fields
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runPromoCodeMigration() {
  console.log('🎫 Running Promo Code Stripe Sync Migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', '012_promo_codes_stripe_sync.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📖 Migration SQL loaded, applying to Supabase...');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      query: migrationSQL
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }

    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Next steps:');
    console.log('1. Run: node scripts/manage-promo-codes.js status');
    console.log('2. Run: node scripts/manage-promo-codes.js sync-all');
    console.log('3. Test promo codes in billing page');

  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    
    // If the rpc method doesn't exist, provide manual instructions
    if (error.message.includes('function') || error.message.includes('rpc')) {
      console.log('\n📋 Manual Migration Instructions:');
      console.log('=====================================');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Copy and paste the following SQL:');
      console.log('\n' + '─'.repeat(50));
      
      const migrationPath = path.join(__dirname, '..', 'migrations', '012_promo_codes_stripe_sync.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      console.log(migrationSQL);
      
      console.log('─'.repeat(50));
      console.log('3. Click "Run" to execute the migration');
      console.log('4. Verify that new columns are added to promo_codes table');
    }
    
    process.exit(1);
  }
}

// Run the migration
runPromoCodeMigration();