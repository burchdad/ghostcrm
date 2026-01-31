// Debug Supabase connection and table access
// Check service role permissions and table access

const { createClient } = require('@supabase/supabase-js');

async function debugSupabaseAccess() {
  console.log('🔍 Debugging Supabase access...');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Environment variables:');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Service Role Key: ${serviceRoleKey ? serviceRoleKey.substring(0, 20) + '...' : 'MISSING'}`);
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }
  
  // Create Supabase client with different configurations
  console.log('\n🔧 Testing different client configurations...');
  
  // Configuration 1: Standard service role
  console.log('\n1️⃣ Testing standard service role client...');
  const supabase1 = createClient(supabaseUrl, serviceRoleKey);
  
  // Configuration 2: Service role with custom auth settings
  console.log('2️⃣ Testing service role with custom auth...');
  const supabase2 = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  // Configuration 3: Service role with schema specification
  console.log('3️⃣ Testing service role with schema...');
  const supabase3 = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  });
  
  const clients = [
    { name: 'Standard', client: supabase1 },
    { name: 'Custom Auth', client: supabase2 },
    { name: 'With Schema', client: supabase3 }
  ];
  
  for (const { name, client } of clients) {
    console.log(`\n🧪 Testing ${name} client...`);
    
    // Test basic table access
    try {
      const { data, error } = await client.from('organizations').select('count');
      if (error) {
        console.log(`❌ ${name} - organizations failed:`, error.message);
      } else {
        console.log(`✅ ${name} - organizations accessible`);
      }
    } catch (err) {
      console.log(`❌ ${name} - organizations error:`, err.message);
    }
    
    // Test deals table
    try {
      const { data, error } = await client.from('deals').select('count');
      if (error) {
        console.log(`❌ ${name} - deals failed:`, error.message);
      } else {
        console.log(`✅ ${name} - deals accessible`);
      }
    } catch (err) {
      console.log(`❌ ${name} - deals error:`, err.message);
    }
  }
  
  // Test raw SQL queries
  console.log('\n🔍 Testing raw SQL queries...');
  
  try {
    // Try to list all tables in public schema
    const { data, error } = await supabase2.rpc('exec_sql', {
      sql: "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
    });
    
    if (error) {
      console.log('❌ Raw SQL failed:', error.message);
    } else {
      console.log('✅ Raw SQL successful:', data);
    }
  } catch (err) {
    console.log('⚠️  exec_sql not available:', err.message);
  }
  
  // Check if we can create a simple test table
  console.log('\n🧪 Testing table creation permissions...');
  
  try {
    const { error } = await supabase2
      .from('test_table_permissions')
      .select('count');
    
    if (error && error.message.includes('does not exist')) {
      console.log('✅ Confirmed: Can detect non-existent tables');
    } else if (error) {
      console.log('❌ Unexpected error on non-existent table:', error.message);
    } else {
      console.log('⚠️  test_table_permissions exists');
    }
  } catch (err) {
    console.log('❌ Test table check failed:', err.message);
  }
  
  console.log('\n📊 Summary:');
  console.log('- If organizations table works but deals table fails with "schema cache" error,');
  console.log('  this suggests the deals table either:');
  console.log('  a) Does not exist in the database');
  console.log('  b) Has restrictive RLS policies');
  console.log('  c) Has a Supabase caching issue');
  console.log('\n💡 Recommended solution:');
  console.log('1. Check Supabase Dashboard > Table Editor to see if deals table exists');
  console.log('2. If missing, create it using the SQL provided in the migration file');
  console.log('3. If exists, check RLS policies and ensure service role can access it');
}

// Run the debug
debugSupabaseAccess().catch(console.error);