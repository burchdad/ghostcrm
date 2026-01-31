const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema...');

  try {
    // Check what tables exist
    console.log('\\n📋 Checking tables...');
    
    // Try to get a sample row from each table to see the columns
    console.log('\\n👥 Leads table schema:');
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);
      
    if (leadsError) {
      console.error('❌ Leads table error:', leadsError.message);
    } else {
      if (leadsData && leadsData.length > 0) {
        console.log('✅ Leads columns:', Object.keys(leadsData[0]).join(', '));
      } else {
        console.log('✅ Leads table exists but is empty');
        // Try to get schema from error message
        const { error } = await supabase.from('leads').select('nonexistent_column');
        console.log('Schema hint:', error?.message);
      }
    }

    console.log('\\n🚗 Inventory table schema:');
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .limit(1);
      
    if (inventoryError) {
      console.error('❌ Inventory table error:', inventoryError.message);
    } else {
      if (inventoryData && inventoryData.length > 0) {
        console.log('✅ Inventory columns:', Object.keys(inventoryData[0]).join(', '));
      } else {
        console.log('✅ Inventory table exists but is empty');
      }
    }

    console.log('\\n💼 Deals table schema:');
    const { data: dealsData, error: dealsError } = await supabase
      .from('deals')
      .select('*')
      .limit(1);
      
    if (dealsError) {
      console.error('❌ Deals table error:', dealsError.message);
    } else {
      if (dealsData && dealsData.length > 0) {
        console.log('✅ Deals columns:', Object.keys(dealsData[0]).join(', '));
      } else {
        console.log('✅ Deals table exists but is empty');
      }
    }

    console.log('\\n🏢 Organizations table:');
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(1);
      
    if (orgError) {
      console.error('❌ Organizations table error:', orgError.message);
    } else {
      if (orgData && orgData.length > 0) {
        console.log('✅ Organizations columns:', Object.keys(orgData[0]).join(', '));
        console.log('Sample org data:', orgData[0]);
      } else {
        console.log('✅ Organizations table exists but is empty');
      }
    }

    console.log('\\n👤 Contacts table:');
    const { data: contactsData, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1);
      
    if (contactsError) {
      console.error('❌ Contacts table error:', contactsError.message);
    } else {
      if (contactsData && contactsData.length > 0) {
        console.log('✅ Contacts columns:', Object.keys(contactsData[0]).join(', '));
      } else {
        console.log('✅ Contacts table exists but is empty');
      }
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

// Run the script
checkDatabaseSchema();