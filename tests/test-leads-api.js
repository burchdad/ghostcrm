require('dotenv').config({ path: '.env.local' });

async function testLeadsAPI() {
  console.log('🔍 Testing Leads API with Organization Filtering\n');

  try {
    // Test the API endpoint directly (this simulates what the frontend does)
    const response = await fetch('http://localhost:3000/api/leads', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real scenario, this would need proper authentication headers
      }
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ API Response:', {
      success: response.ok,
      recordCount: data.records?.length || 0,
      records: data.records || []
    });

    if (data.records && data.records.length > 0) {
      console.log('\n📋 Sample Lead Data:');
      console.log('First Lead:', JSON.stringify(data.records[0], null, 2));
    }

  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  }

  // Test direct database connection with anon key
  console.log('\n🔄 Testing direct database with anon key...');
  
  const { createClient } = require('@supabase/supabase-js');
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    const { data: leads, error } = await supabaseAnon
      .from('leads')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Anon key error:', error.message);
    } else {
      console.log('✅ Anon Key Result:', {
        recordCount: leads?.length || 0
      });
    }
  } catch (dbError) {
    console.error('❌ Anon connection failed:', dbError.message);
  }

  // Test with service role key (bypasses RLS)
  console.log('\n🔧 Testing with service role key (bypasses RLS)...');
  
  const supabaseService = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data: allLeads, error } = await supabaseService
      .from('leads')
      .select('*')
      .limit(10);

    if (error) {
      console.error('❌ Service role error:', error.message);
    } else {
      console.log('✅ Service Role Result:', {
        recordCount: allLeads?.length || 0,
        organizations: [...new Set(allLeads?.map(lead => lead.org_id) || [])]
      });
      
      if (allLeads && allLeads.length > 0) {
        console.log('\n📋 Lead Sample (Service Role):');
        allLeads.slice(0, 2).forEach((lead, idx) => {
          console.log(`Lead ${idx + 1}:`, {
            id: lead.id,
            full_name: lead.full_name,
            org_id: lead.org_id,
            stage: lead.stage,
            est_value: lead.est_value
          });
        });
      }
    }
  } catch (serviceError) {
    console.error('❌ Service role connection failed:', serviceError.message);
  }

  // Test organizations table
  console.log('\n🏢 Testing organizations table...');
  try {
    const { data: orgs, error } = await supabaseService
      .from('organizations')
      .select('id, name, domain')
      .limit(5);

    if (error) {
      console.error('❌ Organizations error:', error.message);
    } else {
      console.log('✅ Organizations:', orgs);
    }
  } catch (orgError) {
    console.error('❌ Organizations connection failed:', orgError.message);
  }
}

testLeadsAPI();