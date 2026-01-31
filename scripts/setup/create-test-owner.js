const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
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

async function createTestOwner() {
  console.log('👤 Creating test owner user for team management testing...');

  try {
    // First, find the burch-enterprises organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, subdomain')
      .eq('subdomain', 'burch-enterprises')
      .single();

    if (orgError || !org) {
      console.error('❌ Error finding organization:', orgError?.message || 'Organization not found');
      
      // Create the organization if it doesn't exist
      console.log('📋 Creating burch-enterprises organization...');
      const { data: newOrg, error: createOrgError } = await supabase
        .from('organizations')
        .insert([{
          name: 'Burch Enterprises',
          subdomain: 'burch-enterprises',
          domain: 'burch-enterprises.com',
          settings: {
            theme: 'default',
            features: ['team_management', 'automation', 'collaboration']
          }
        }])
        .select()
        .single();

      if (createOrgError) {
        console.error('❌ Error creating organization:', createOrgError.message);
        return;
      }

      console.log('✅ Created organization:', newOrg.name);
      org.id = newOrg.id;
    } else {
      console.log('✅ Found organization:', org.name, '(ID:', org.id + ')');
    }

    // Hash password for test user
    const password = 'TestOwner123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create test owner user
    const testUser = {
      first_name: 'Test',
      last_name: 'Owner',
      email: 'testowner@burch-enterprises.com',
      password_hash: hashedPassword,
      role: 'owner',
      organization_id: org.id,
      is_active: true,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', testUser.email)
      .single();

    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email, 'Role:', existingUser.role);
      console.log('🔑 Login credentials:');
      console.log('   Email:', testUser.email);
      console.log('   Password:', password);
      return;
    }

    // Create the test user
    const { data: createdUser, error: userError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();

    if (userError) {
      console.error('❌ Error creating test user:', userError.message);
      return;
    }

    console.log('✅ Successfully created test owner user!');
    console.log('👤 User Details:');
    console.log('   Name:', createdUser.first_name, createdUser.last_name);
    console.log('   Email:', createdUser.email);
    console.log('   Role:', createdUser.role);
    console.log('   Organization ID:', createdUser.organization_id);
    
    console.log('\n🔑 Login credentials for testing:');
    console.log('   Email:', testUser.email);
    console.log('   Password:', password);
    
    console.log('\n🌐 You can now login at: http://localhost:3003/auth/login');
    console.log('📋 After login, visit: http://localhost:3003/tenant-owner/team');

  } catch (error) {
    console.error('❌ Error in createTestOwner:', error.message);
  }
}

createTestOwner();