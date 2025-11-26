#!/usr/bin/env node

/**
 * QUICK TABLE STRUCTURE CHECK
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTablesExist() {
  console.log('🔍 Checking if promo code tables exist...\n');

  // Test promo_code_usage table by inserting a record
  try {
    const testRecord = {
      promo_code_id: '550e8400-e29b-41d4-a716-446655440000', // fake UUID
      used_by_email: 'table-test@example.com',
      order_amount: 100.00,
      discount_amount: 50.00,
      final_amount: 50.00,
      plan_selected: 'test',
      metadata: { test: true }
    };

    const { data, error } = await supabase
      .from('promo_code_usage')
      .insert(testRecord)
      .select()
      .single();

    if (error) {
      console.log('❌ promo_code_usage table issue:', error.message);
    } else {
      console.log('✅ promo_code_usage table structure is correct!');
      console.log('📊 Created test record ID:', data.id);
      
      // Clean up the test record
      await supabase
        .from('promo_code_usage')
        .delete()
        .eq('used_by_email', 'table-test@example.com');
      console.log('🧹 Cleaned up test record');
    }
  } catch (error) {
    console.log('❌ Error testing promo_code_usage table:', error.message);
  }

  // Check if we have the analytics view
  try {
    const { data, error } = await supabase
      .from('promo_code_analytics')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.log('\n❌ promo_code_analytics view issue:', error.message);
      console.log('💡 You may need to run: migrations/013_promo_code_analytics.sql');
    } else {
      console.log('\n✅ promo_code_analytics view is available!');
    }
  } catch (error) {
    console.log('\n❌ Error testing analytics view:', error.message);
  }

  console.log('\n🎉 Table structure verification complete!');
}

checkTablesExist();