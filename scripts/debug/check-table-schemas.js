require('dotenv').config({ path: '.env.local' });

async function checkTableSchemas() {
  console.log('🔍 Checking Table Schemas\n');

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Check leads table structure
  console.log('📋 LEADS TABLE STRUCTURE:');
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Leads error:', error.message);
    } else {
      if (leads && leads.length > 0) {
        console.log('✅ Sample Lead Record:');
        console.log(JSON.stringify(leads[0], null, 2));
        console.log('\n🔑 Available Columns:', Object.keys(leads[0]));
      } else {
        console.log('⚠️ No leads found');
      }
    }
  } catch (error) {
    console.error('❌ Leads schema error:', error.message);
  }

  // Check organizations table structure
  console.log('\n\n🏢 ORGANIZATIONS TABLE STRUCTURE:');
  try {
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Organizations error:', error.message);
    } else {
      if (orgs && orgs.length > 0) {
        console.log('✅ Sample Organization Record:');
        console.log(JSON.stringify(orgs[0], null, 2));
        console.log('\n🔑 Available Columns:', Object.keys(orgs[0]));
      } else {
        console.log('⚠️ No organizations found');
      }
    }
  } catch (error) {
    console.error('❌ Organizations schema error:', error.message);
  }

  // Check all tables
  console.log('\n\n📊 ALL TABLES:');
  try {
    const { data: tables, error } = await supabase
      .rpc('get_schema_tables') // This might not work, let's try a different approach
      .select('*');

    if (error) {
      console.log('⚠️ Using fallback method to list tables...');
      
      // Try querying information_schema
      const tableNames = ['leads', 'organizations', 'contacts', 'inventory', 'deals'];
      
      for (const tableName of tableNames) {
        try {
          const { data, error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .limit(0); // Just get structure, no data

          if (!tableError) {
            console.log(`✅ Table '${tableName}' exists`);
          } else {
            console.log(`❌ Table '${tableName}' error:`, tableError.message);
          }
        } catch (err) {
          console.log(`❌ Table '${tableName}' failed:`, err.message);
        }
      }
    } else {
      console.log('✅ Tables:', tables);
    }
  } catch (error) {
    console.error('❌ Tables listing error:', error.message);
  }
}

checkTableSchemas();