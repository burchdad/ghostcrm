require('dotenv').config({ path: '.env.local' });

async function debugAuthAndMemberships() {
  console.log('🔍 Debugging Authentication and Memberships\n');

  const { createClient } = require('@supabase/supabase-js');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Check if memberships table exists
  console.log('📊 Checking memberships table...');
  try {
    const { data: memberships, error } = await supabase
      .from('memberships')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Memberships table error:', error.message);
    } else {
      console.log(`✅ Found ${memberships?.length || 0} memberships`);
      if (memberships && memberships.length > 0) {
        console.log('Sample membership:', JSON.stringify(memberships[0], null, 2));
      }
    }
  } catch (err) {
    console.error('❌ Memberships query failed:', err.message);
  }

  // Check auth users table
  console.log('\n👤 Checking auth.users table...');
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('❌ Users error:', error.message);
    } else {
      console.log(`✅ Found ${users?.users?.length || 0} users`);
      if (users?.users && users.users.length > 0) {
        console.log('Sample user:', {
          id: users.users[0].id,
          email: users.users[0].email,
          created_at: users.users[0].created_at
        });
      }
    }
  } catch (err) {
    console.error('❌ Users query failed:', err.message);
  }

  // Test what happens without auth context
  console.log('\n🔐 Testing getMembershipOrgId without auth...');
  try {
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data } = await supabaseAnon.from("memberships").select("organization_id").limit(1);
    console.log('✅ Anon key membership result:', data);
  } catch (err) {
    console.error('❌ Anon membership failed:', err.message);
  }

  // Check if there's a demo user or default setup
  console.log('\n🎭 Looking for demo/default setup...');
  try {
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('*')
      .limit(3);

    if (error) {
      console.error('❌ Organizations error:', error.message);
    } else {
      console.log('Organizations for reference:');
      orgs?.forEach(org => {
        console.log(`  - ${org.name} (${org.subdomain}): ${org.id}`);
      });
    }
  } catch (err) {
    console.error('❌ Organizations failed:', err.message);
  }
}

debugAuthAndMemberships();