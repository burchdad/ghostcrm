require('dotenv').config({ path: '.env.local' });

async function testLeadsAPIDirectly() {
  console.log('🔍 Testing Leads API Logic Directly\n');

  const { createClient } = require('@supabase/supabase-js');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔧 Testing organization filtering logic...');

  try {
    // Test the updated query directly
    const { data, error } = await supabase
      .from("leads")
      .select(`
        *,
        contacts:contact_id (
          first_name,
          last_name,
          email,
          phone,
          company
        )
      `)
      .eq("organization_id", "ec3eec6a-b131-48a2-9ecc-43ebabfc208b") // Acme Motors ID
      .order("updated_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Query error:', error.message);
      return;
    }

    console.log(`✅ Found ${data?.length || 0} leads for Acme Motors`);

    if (data && data.length > 0) {
      console.log('\n📋 Raw Lead Data:');
      console.log(JSON.stringify(data[0], null, 2));

      // Test the transformation logic
      console.log('\n🔄 Testing transformation...');
      const transformedLead = {
        id: data[0].id,
        "Full Name": data[0].title || 
          (data[0].contacts ? 
            `${data[0].contacts.first_name || ''} ${data[0].contacts.last_name || ''}`.trim() || 
            'Unknown' : 'Unknown'),
        "Email Address": data[0].contacts?.email || '',
        "Phone Number": data[0].contacts?.phone || '',
        "Company": data[0].contacts?.company || '',
        "Stage": data[0].stage || 'new',
        "Value": data[0].value || 0,
        "Priority": data[0].priority || 'medium',
        "Source": data[0].source || 'unknown',
        "Description": data[0].description || '',
        // Keep compatibility fields
        est_value: data[0].value,
        full_name: data[0].title,
        org_id: data[0].organization_id
      };

      console.log('✅ Transformed Lead:');
      console.log(JSON.stringify(transformedLead, null, 2));
    }

    // Test all organizations
    console.log('\n🏢 Testing all organizations...');
    const { data: allData, error: allError } = await supabase
      .from("leads")
      .select(`
        organization_id,
        title,
        stage,
        value,
        contacts:contact_id (
          first_name,
          last_name,
          email,
          phone,
          company
        )
      `)
      .order("updated_at", { ascending: false });

    if (allError) {
      console.error('❌ All leads error:', allError.message);
    } else {
      const orgGroups = {};
      (allData || []).forEach(lead => {
        const orgId = lead.organization_id;
        if (!orgGroups[orgId]) orgGroups[orgId] = [];
        orgGroups[orgId].push(lead);
      });

      console.log(`✅ Leads by Organization:`);
      Object.entries(orgGroups).forEach(([orgId, leads]) => {
        console.log(`  ${orgId}: ${leads.length} leads`);
      });
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testLeadsAPIDirectly();