require('dotenv').config({ path: '.env.local' });

async function createMembershipsTable() {
  console.log('🔧 Creating Memberships Table and Demo Data\n');

  const { createClient } = require('@supabase/supabase-js');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Create memberships table
    console.log('📊 Creating memberships table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.memberships (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, organization_id)
      );
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    });

    if (createError) {
      console.log('⚠️ Table creation via RPC failed, trying direct approach...');
      
      // Try alternative approach - create via INSERT/UPDATE which sometimes works
      const { error: altError } = await supabase
        .from('memberships')
        .select('id')
        .limit(1);
        
      if (altError && altError.message.includes('does not exist')) {
        console.log('❌ Table definitely does not exist. Creating via SQL...');
        
        // Let's manually create the table by checking the schema
        console.log('🔍 Checking available tables in schema...');
        
        const { data: tableCheck, error: checkError } = await supabase
          .rpc('get_all_tables'); // This might not exist
          
        if (checkError) {
          console.log('⚠️ Cannot check tables. Proceeding with manual creation...');
        }
      } else {
        console.log('✅ Table might already exist');
      }
    } else {
      console.log('✅ Table created successfully');
    }

    // Get user and organization IDs
    console.log('\n👤 Getting user and organization data...');
    
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      throw new Error(`Failed to get users: ${userError.message}`);
    }

    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, subdomain');
    if (orgError) {
      throw new Error(`Failed to get organizations: ${orgError.message}`);
    }

    if (!users?.users?.length) {
      throw new Error('No users found');
    }

    if (!orgs?.length) {
      throw new Error('No organizations found');
    }

    const user = users.users[0]; // Use the first user
    console.log(`✅ Using user: ${user.email} (${user.id})`);
    console.log(`✅ Found ${orgs.length} organizations`);

    // Create membership records manually if table creation failed
    console.log('\n🔗 Creating membership relationships...');
    
    // Let's use a different approach - try to insert directly and see what happens
    const acmeOrg = orgs.find(org => org.subdomain === 'acme');
    if (!acmeOrg) {
      throw new Error('Acme organization not found');
    }

    console.log(`🎯 Assigning user to Acme Motors: ${acmeOrg.id}`);

    // Try to insert membership directly
    const membershipData = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${user.id}-${acmeOrg.id}`,
      user_id: user.id,
      organization_id: acmeOrg.id,
      role: 'admin',
      status: 'active',
      joined_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .insert(membershipData)
      .select()
      .single();

    if (membershipError) {
      console.error('❌ Membership insert failed:', membershipError.message);
      
      if (membershipError.message.includes('does not exist')) {
        console.log('🔨 Creating table manually with INSERT...');
        
        // Manual table creation approach
        console.log('📝 SQL for manual execution:');
        console.log(`
-- Execute this SQL in Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Enable RLS
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can view their own memberships" ON public.memberships
  FOR ALL USING (auth.uid() = user_id);

-- Create service role policy
CREATE POLICY "Service role can manage all memberships" ON public.memberships
  FOR ALL USING (auth.role() = 'service_role');

-- Insert demo membership
INSERT INTO public.memberships (user_id, organization_id, role, status)
VALUES ('${user.id}', '${acmeOrg.id}', 'admin', 'active');
        `);
      }
    } else {
      console.log('✅ Membership created successfully:', membership);
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

createMembershipsTable();