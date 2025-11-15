const { createClient } = require('@supabase/supabase-js');

// Test script to check database tables and permissions
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection and table structure...');
  
  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // Test 1: Check if leads table exists and get structure
    console.log('\n📋 Testing leads table...');
    const { data: leadsTest, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);
    
    if (leadsError) {
      console.error('❌ Leads table error:', leadsError);
    } else {
      console.log('✅ Leads table accessible');
      console.log('Sample data structure:', Object.keys(leadsTest?.[0] || {}));
    }
    
    // Test 2: Check if contacts table exists and get structure
    console.log('\n📋 Testing contacts table...');
    const { data: contactsTest, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1);
    
    if (contactsError) {
      console.error('❌ Contacts table error:', contactsError);
    } else {
      console.log('✅ Contacts table accessible');
      console.log('Sample data structure:', Object.keys(contactsTest?.[0] || {}));
    }
    
    // Test 3: Check organizations table
    console.log('\n🏢 Testing organizations table...');
    const { data: orgsTest, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .limit(3);
    
    if (orgsError) {
      console.error('❌ Organizations table error:', orgsError);
    } else {
      console.log('✅ Organizations table accessible');
      console.log(`Found ${orgsTest?.length || 0} organizations`);
      orgsTest?.forEach(org => {
        console.log(`  - ${org.name} (${org.id})`);
      });
    }
    
    // Test 4: Try to create a test lead
    console.log('\n🧪 Testing lead creation...');
    
    // First, get or create a test organization
    let testOrgId;
    if (orgsTest && orgsTest.length > 0) {
      testOrgId = orgsTest[0].id;
      console.log(`Using existing organization: ${testOrgId}`);
    } else {
      console.log('Creating test organization...');
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: 'Test Organization',
          subdomain: 'test-' + Date.now()
        })
        .select()
        .single();
        
      if (orgError) {
        console.error('❌ Failed to create test organization:', orgError);
        return;
      }
      testOrgId = newOrg.id;
      console.log(`✅ Created test organization: ${testOrgId}`);
    }
    
    // Try to create a contact first
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .insert({
        organization_id: testOrgId,
        first_name: 'Test',
        last_name: 'Contact',
        email: 'test@example.com',
        phone: '555-1234'
      })
      .select()
      .single();
    
    if (contactError) {
      console.error('❌ Failed to create test contact:', contactError);
      return;
    }
    
    console.log('✅ Created test contact:', contact.id);
    
    // Now try to create a lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        organization_id: testOrgId,
        contact_id: contact.id,
        title: 'Test Lead',
        description: 'Test lead creation',
        stage: 'new',
        priority: 'medium',
        source: 'test'
      })
      .select()
      .single();
    
    if (leadError) {
      console.error('❌ Failed to create test lead:', leadError);
    } else {
      console.log('✅ Successfully created test lead:', lead.id);
      
      // Clean up test data
      await supabase.from('leads').delete().eq('id', lead.id);
      await supabase.from('contacts').delete().eq('id', contact.id);
      console.log('🧹 Cleaned up test data');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabaseConnection();