#!/usr/bin/env node

/**
 * RUN ANALYTICS MIGRATION
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runAnalyticsMigration() {
  console.log('📊 Running Promo Code Analytics Migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', '013_promo_code_analytics.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error('Migration file not found: ' + migrationPath);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📖 Migration SQL loaded');

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`🔧 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length < 10) continue; // Skip very short statements
      
      console.log(`${i + 1}. Executing: ${statement.substring(0, 50)}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { query: statement + ';' });
        
        if (error) {
          console.log(`   ⚠️  Warning: ${error.message}`);
        } else {
          console.log('   ✅ Success');
        }
      } catch (e) {
        console.log(`   ⚠️  Warning: ${e.message}`);
      }
    }

    console.log('\n✅ Migration completed!');
    
    // Test the analytics view
    console.log('\n🧪 Testing analytics view...');
    const { data: testData, error: testError } = await supabase
      .from('promo_code_analytics')
      .select('code, actual_usage_count, total_revenue')
      .limit(5);

    if (testError) {
      console.log('❌ Analytics view test failed:', testError.message);
    } else {
      console.log('✅ Analytics view working!');
      console.log('📊 Sample data:', testData);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runAnalyticsMigration();