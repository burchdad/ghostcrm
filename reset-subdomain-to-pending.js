require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetSubdomainToPending() {
  try {
    console.log('🔄 Resetting subdomain to pending_payment status...');
    
    const { data: subdomains, error: fetchError } = await supabase
      .from('subdomains')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching subdomains:', fetchError);
      return;
    }

    if (!subdomains || subdomains.length === 0) {
      console.log('ℹ️ No active subdomains found to reset');
      return;
    }

    console.log(`🔍 Found ${subdomains.length} active subdomain(s):`);
    
    for (const subdomain of subdomains) {
      console.log(`  - ${subdomain.subdomain} (${subdomain.organization_name})`);
      
      const { error: updateError } = await supabase
        .from('subdomains')
        .update({
          status: 'pending_payment',
          updated_at: new Date().toISOString(),
          provisioned_at: null
        })
        .eq('id', subdomain.id);

      if (updateError) {
        console.error(`❌ Failed to reset ${subdomain.subdomain}:`, updateError);
      } else {
        console.log(`✅ Reset subdomain: ${subdomain.subdomain} to pending_payment`);
      }
    }

    console.log('🎉 Subdomain reset completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetSubdomainToPending();