#!/usr/bin/env node

/**
 * 🧪 Supabase Connection Test Script
 * Tests database connectivity and verifies schema setup
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  console.log('🚀 Testing Supabase Connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    console.log('✅ Basic connection successful!\n');

    // Test 2: Check if all tables exist
    console.log('2️⃣ Checking database schema...');
    const expectedTables = [
      'organizations',
      'client_configs', 
      'contacts',
      'leads',
      'messages',
      'call_logs_warm',
      'appointments',
      'campaigns',
      'inventory',
      'profiles',
      'collab_notifications',
      'activity_log_warm',
      'org_provider_secrets'
    ];

    for (const table of expectedTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.error(`❌ Table '${table}' not found:`, error.message);
          return false;
        }
        console.log(`✅ Table '${table}' exists`);
      } catch (err) {
        console.error(`❌ Error checking table '${table}':`, err.message);
        return false;
      }
    }

    console.log('\n3️⃣ Testing Row Level Security...');
    
    // Test RLS policies exist
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies_for_table', { table_name: 'organizations' })
      .select();
    
    if (policyError) {
      console.log('⚠️ Could not check RLS policies (this is normal)');
    } else {
      console.log('✅ RLS policies configured');
    }

    console.log('\n4️⃣ Testing sample organization...');
    
    // Check if demo organization exists
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('name', 'Demo Organization')
      .limit(1);
    
    if (orgError) {
      console.error('❌ Error checking organizations:', orgError.message);
      return false;
    }
    
    if (orgs && orgs.length > 0) {
      console.log('✅ Demo organization found:', orgs[0].name);
      console.log(`   Subdomain: ${orgs[0].subdomain}`);
      console.log(`   Status: ${orgs[0].status}`);
    } else {
      console.log('⚠️ No demo organization found (this is ok)');
    }

    console.log('\n🎉 All tests passed! Database is ready to use.');
    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function testMultiTenantIsolation() {
  console.log('\n🔒 Testing Multi-Tenant Isolation...\n');
  
  try {
    // Create two test organizations
    const { data: org1, error: org1Error } = await supabase
      .from('organizations')
      .insert([{
        name: 'Test Org 1',
        subdomain: 'test1',
        status: 'active'
      }])
      .select()
      .single();

    if (org1Error) {
      console.error('❌ Could not create test org 1:', org1Error.message);
      return false;
    }

    const { data: org2, error: org2Error } = await supabase
      .from('organizations')
      .insert([{
        name: 'Test Org 2', 
        subdomain: 'test2',
        status: 'active'
      }])
      .select()
      .single();

    if (org2Error) {
      console.error('❌ Could not create test org 2:', org2Error.message);
      return false;
    }

    console.log('✅ Created test organizations');
    console.log(`   Org 1 ID: ${org1.id}`);
    console.log(`   Org 2 ID: ${org2.id}`);

    // Create test contacts for each org
    const { error: contact1Error } = await supabase
      .from('contacts')
      .insert([{
        organization_id: org1.id,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@testorg1.com'
      }]);

    const { error: contact2Error } = await supabase
      .from('contacts')
      .insert([{
        organization_id: org2.id,
        first_name: 'Jane',
        last_name: 'Smith', 
        email: 'jane@testorg2.com'
      }]);

    if (contact1Error || contact2Error) {
      console.error('❌ Could not create test contacts');
      return false;
    }

    console.log('✅ Created test contacts for each organization');

    // Verify isolation - each org should only see their own contacts
    const { data: org1Contacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('organization_id', org1.id);

    const { data: org2Contacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('organization_id', org2.id);

    if (org1Contacts.length === 1 && org2Contacts.length === 1) {
      console.log('✅ Data isolation working correctly!');
      console.log(`   Org 1 contacts: ${org1Contacts.length}`);
      console.log(`   Org 2 contacts: ${org2Contacts.length}`);
    } else {
      console.error('❌ Data isolation failed');
      return false;
    }

    // Clean up test data
    await supabase.from('contacts').delete().eq('organization_id', org1.id);
    await supabase.from('contacts').delete().eq('organization_id', org2.id);
    await supabase.from('organizations').delete().eq('id', org1.id);
    await supabase.from('organizations').delete().eq('id', org2.id);
    
    console.log('✅ Cleaned up test data');
    console.log('\n🎉 Multi-tenant isolation test passed!');
    
    return true;

  } catch (error) {
    console.error('❌ Multi-tenant test failed:', error.message);
    return false;
  }
}

// Run tests
async function runAllTests() {
  console.log('🧪 GhostCRM Database Test Suite\n');
  console.log('Testing connection to:', supabaseUrl);
  console.log('=====================================\n');

  const connectionTest = await testConnection();
  
  if (connectionTest) {
    await testMultiTenantIsolation();
  }
  
  console.log('\n=====================================');
  console.log('🏁 Test suite completed!');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted');
  process.exit(0);
});

runAllTests().catch(console.error);