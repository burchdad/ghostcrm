const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Testing organization lookup...');
console.log('Supabase URL:', supabaseUrl);
console.log('Service key exists:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testOrgLookup() {
  console.log('\n🔍 Testing organization lookup by subdomain...');
  
  try {
    // Test the exact query from the API
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .select("id, subdomain, name")
      .eq("subdomain", "burch-enterprises")
      .single();
      
    console.log('✅ Query result:', { orgData, error: orgError });
    
    if (orgData) {
      console.log('🎉 Organization found!');
      console.log('  ID:', orgData.id);
      console.log('  Name:', orgData.name);
      console.log('  Subdomain:', orgData.subdomain);
    } else {
      console.log('❌ No organization found with subdomain "burch-enterprises"');
    }
    
  } catch (error) {
    console.error('❌ Query failed:', error);
  }
  
  // Let's also check all organizations to see what's in the table
  console.log('\n🔍 Checking all organizations in the table...');
  
  try {
    const { data: allOrgs, error: allError } = await supabase
      .from("organizations")
      .select("id, subdomain, name")
      .limit(10);
      
    console.log('All organizations result:', { count: allOrgs?.length || 0, error: allError });
    
    if (allOrgs && allOrgs.length > 0) {
      console.log('📋 Organizations found:');
      allOrgs.forEach((org, i) => {
        console.log(`  ${i + 1}. ID: ${org.id}, Subdomain: "${org.subdomain}", Name: "${org.name}"`);
      });
    } else {
      console.log('❌ No organizations found in table');
    }
    
  } catch (error) {
    console.error('❌ Query for all orgs failed:', error);
  }
}

testOrgLookup().catch(console.error);