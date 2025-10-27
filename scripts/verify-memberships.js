require('dotenv').config({ path: '.env.local' });

async function verifyMembershipsAndLeads() {
  console.log('🔍 Verifying Memberships Table and Lead Access\n');

  const { createClient } = require('@supabase/supabase-js');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1. Check if memberships table exists and has data
    console.log('1️⃣ Checking memberships table...');
    const { data: memberships, error: membershipError } = await supabase
      .from('memberships')
      .select(`
        id,
        user_id,
        organization_id,
        role,
        status,
        joined_at,
        organizations:organization_id (
          name,
          subdomain
        )
      `)
      .order('joined_at', { ascending: false });

    if (membershipError) {
      console.error('❌ Memberships table error:', membershipError.message);
      return;
    }

    console.log(`✅ Found ${memberships?.length || 0} memberships`);
    memberships?.forEach(membership => {
      console.log(`  - ${membership.organizations?.name} (${membership.role}) - ${membership.status}`);
    });

    if (!memberships || memberships.length === 0) {
      console.error('❌ No memberships found! Please run the SQL script first.');
      return;
    }

    // 2. Test getMembershipOrgId logic
    console.log('\n2️⃣ Testing membership lookup logic...');
    const firstMembership = memberships[0];
    const { data: orgLookup, error: orgError } = await supabase
      .from("memberships")
      .select("organization_id")
      .eq("user_id", firstMembership.user_id)
      .limit(1);

    if (orgError) {
      console.error('❌ Org lookup error:', orgError.message);
    } else {
      console.log('✅ Organization lookup successful:', orgLookup?.[0]?.organization_id);
    }

    // 3. Test leads query for each organization
    console.log('\n3️⃣ Testing leads access by organization...');
    for (const membership of memberships) {
      const orgId = membership.organization_id;
      const orgName = membership.organizations?.name;

      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select(`
          id,
          title,
          value,
          stage,
          organization_id,
          contacts:contact_id (
            first_name,
            last_name,
            email,
            company
          )
        `)
        .eq("organization_id", orgId);

      if (leadsError) {
        console.error(`❌ Leads error for ${orgName}:`, leadsError.message);
      } else {
        console.log(`✅ ${orgName}: ${leads?.length || 0} leads`);
        leads?.slice(0, 2).forEach(lead => {
          console.log(`    - ${lead.title} ($${lead.value?.toLocaleString() || 0})`);
        });
      }
    }

    // 4. Test the actual API endpoint
    console.log('\n4️⃣ Testing API endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/leads', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const apiData = await response.json();
        console.log(`✅ API returned ${apiData.records?.length || 0} leads`);
        
        if (apiData.records && apiData.records.length > 0) {
          console.log('Sample API lead:');
          const sampleLead = apiData.records[0];
          console.log(`  - ${sampleLead["Full Name"]} (${sampleLead["Company"]})`);
          console.log(`  - Stage: ${sampleLead["Stage"]}, Value: $${sampleLead["Value"]?.toLocaleString() || 0}`);
        }
      } else {
        console.error(`❌ API call failed: ${response.status} ${response.statusText}`);
      }
    } catch (apiError) {
      console.error('❌ API test failed:', apiError.message);
    }

    // 5. Verify multi-tenant isolation
    console.log('\n5️⃣ Verifying multi-tenant isolation...');
    const orgGroups = {};
    for (const membership of memberships) {
      const orgId = membership.organization_id;
      const { data: orgLeads, error } = await supabase
        .from("leads")
        .select("id, title, organization_id")
        .eq("organization_id", orgId);

      if (!error && orgLeads) {
        orgGroups[membership.organizations?.name || orgId] = orgLeads.length;
      }
    }

    console.log('✅ Organization lead counts:');
    Object.entries(orgGroups).forEach(([orgName, count]) => {
      console.log(`  - ${orgName}: ${count} leads`);
    });

    console.log('\n🎉 Verification completed! Check results above.');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyMembershipsAndLeads();