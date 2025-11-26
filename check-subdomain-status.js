require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSubdomainStatus() {
  try {
    console.log('🔍 Checking subdomain status...');
    
    const { data: subdomains, error } = await supabase
      .from('subdomains')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching subdomains: ${error.message}`);
    }

    if (!subdomains || subdomains.length === 0) {
      console.log('❌ No subdomains found');
      return;
    }

    console.log('📊 Subdomain Status Report:');
    console.log('============================');
    
    subdomains.forEach((subdomain, index) => {
      console.log(`${index + 1}. ${subdomain.subdomain} (${subdomain.organization_id})`);
      console.log(`   Status: ${subdomain.status}`);
      console.log(`   Created: ${subdomain.created_at}`);
      console.log(`   Provisioned: ${subdomain.provisioned_at || 'Not provisioned'}`);
      console.log(`   DNS Status: ${subdomain.dns_status || 'Not set'}`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSubdomainStatus();