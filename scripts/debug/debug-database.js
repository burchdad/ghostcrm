// Quick diagnostic script to check database contents
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseDatabaseContents() {
  const targetOrgId = 'a33323d3-a85c-4243-a3f3-e5f9a87a89b0';
  const targetUserId = '86b7a05a-62ba-48cf-9695-531ca616b310';
  
  console.log('=== DIAGNOSTIC: Database Contents ===');
  
  // Check organizations table
  console.log('\n1. ALL Organizations:');
  const { data: allOrgs, error: allOrgsError } = await supabase
    .from('organizations')
    .select('*');
  
  if (allOrgsError) {
    console.error('Error fetching all organizations:', allOrgsError);
  } else {
    console.log('Organizations found:', allOrgs?.length || 0);
    allOrgs?.forEach(org => {
      console.log(`  - ID: ${org.id} | Name: ${org.name} | Subdomain: ${org.subdomain}`);
    });
  }
  
  // Check specific organization
  console.log('\n2. Target Organization Lookup:');
  const { data: targetOrg, error: targetOrgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', targetOrgId)
    .single();
    
  if (targetOrgError) {
    console.error('Error fetching target org:', targetOrgError);
  } else {
    console.log('Target org found:', targetOrg);
  }
  
  // Check organization_memberships
  console.log('\n3. ALL Memberships:');
  const { data: allMemberships, error: allMembershipsError } = await supabase
    .from('organization_memberships')
    .select('*');
    
  if (allMembershipsError) {
    console.error('Error fetching memberships:', allMembershipsError);
  } else {
    console.log('Memberships found:', allMemberships?.length || 0);
    allMemberships?.forEach(membership => {
      console.log(`  - User: ${membership.user_id} | Org: ${membership.organization_id} | Role: ${membership.role}`);
    });
  }
  
  // Check target user membership
  console.log('\n4. Target User Membership:');
  const { data: targetMembership, error: targetMembershipError } = await supabase
    .from('organization_memberships')
    .select('*')
    .eq('user_id', targetUserId);
    
  if (targetMembershipError) {
    console.error('Error fetching target membership:', targetMembershipError);
  } else {
    console.log('Target user memberships:', targetMembership);
  }
  
  // Test the exact query from the API
  console.log('\n5. API Query Test (with join):');
  const { data: apiTestResult, error: apiTestError } = await supabase
    .from('organization_memberships')
    .select(`
      organization_id,
      organizations!inner (
        id,
        name,
        subdomain,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', targetUserId)
    .maybeSingle();
    
  if (apiTestError) {
    console.error('API test error:', apiTestError);
  } else {
    console.log('API test result:', apiTestResult);
  }
}

diagnoseDatabaseContents().catch(console.error);