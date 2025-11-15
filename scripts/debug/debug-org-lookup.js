const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qckmuaabvqkybwlsfhir.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFja211YWFidnFreWJ3bHNmaGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDkyNjk1OSwiZXhwIjoyMDQ2NTAyOTU5fQ.HyMUrrNSzOjJ0H9Fz8RObL6x-xCfKT_j_0zIwOrsOFw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugOrgLookup() {
  try {
    console.log('🔍 SUPABASE URL:', supabaseUrl);
    console.log('🔑 SERVICE KEY EXISTS:', !!supabaseServiceKey);
    console.log('');

    console.log('📊 Checking organizations table...');
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*');
      
    if (orgError) {
      console.error('❌ Organizations error:', orgError);
    } else {
      console.log('✅ Found', orgs?.length || 0, 'organizations:');
      orgs?.forEach((org, index) => {
        console.log(`  ${index + 1}. ID: ${org.id}`);
        console.log(`     Name: ${org.name}`);
        console.log(`     Subdomain: ${org.subdomain}`);
        console.log(`     Created: ${org.created_at}`);
        console.log('');
      });
    }

    console.log('📊 Specifically looking for "burch-enterprises"...');
    const { data: burchOrg, error: burchError } = await supabase
      .from('organizations')
      .eq('subdomain', 'burch-enterprises')
      .select('*');
      
    if (burchError) {
      console.error('❌ Burch enterprises lookup error:', burchError);
    } else {
      console.log('✅ Burch enterprises lookup result:', burchOrg);
    }

    console.log('');
    console.log('📊 Checking leads table...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, title, organization_id')
      .limit(10);
      
    if (leadsError) {
      console.error('❌ Leads error:', leadsError);
    } else {
      console.log('✅ Found', leads?.length || 0, 'leads:');
      leads?.forEach((lead, index) => {
        console.log(`  ${index + 1}. ID: ${lead.id}`);
        console.log(`     Title: ${lead.title}`);
        console.log(`     Org ID: ${lead.organization_id}`);
        console.log('');
      });
    }

    // Check organization_memberships table too
    console.log('📊 Checking organization_memberships table...');
    const { data: memberships, error: membershipsError } = await supabase
      .from('organization_memberships')
      .select('*')
      .limit(10);
      
    if (membershipsError) {
      console.error('❌ Memberships error:', membershipsError);
    } else {
      console.log('✅ Found', memberships?.length || 0, 'memberships:');
      memberships?.forEach((membership, index) => {
        console.log(`  ${index + 1}. User ID: ${membership.user_id}`);
        console.log(`     Org ID: ${membership.organization_id}`);
        console.log(`     Role: ${membership.role}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('💥 Database check error:', error);
  }
}

debugOrgLookup();