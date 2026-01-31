require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function activateBurchmotorsSubdomain() {
  try {
    console.log('🚀 Manually activating burchmotors subdomain...');
    
    // First, let's check the current status
    const { data: subdomain, error: fetchError } = await supabase
      .from('subdomains')
      .select('*')
      .eq('subdomain', 'burchmotors')
      .single();

    if (fetchError || !subdomain) {
      console.error('❌ Subdomain not found:', fetchError?.message);
      return;
    }

    console.log('📋 Current subdomain info:');
    console.log('   Subdomain:', subdomain.subdomain);
    console.log('   Status:', subdomain.status);
    console.log('   Organization ID:', subdomain.organization_id);
    console.log('   Created:', subdomain.created_at);
    console.log('');

    if (subdomain.status === 'active') {
      console.log('✅ Subdomain is already active!');
      return;
    }

    // Activate the subdomain
    const { error: updateError } = await supabase
      .from('subdomains')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
        provisioned_at: new Date().toISOString()
      })
      .eq('id', subdomain.id);

    if (updateError) {
      console.error('❌ Failed to activate subdomain:', updateError.message);
      return;
    }

    console.log('✅ Successfully activated burchmotors subdomain!');
    
    // Verify the update
    const { data: updatedSubdomain, error: verifyError } = await supabase
      .from('subdomains')
      .select('*')
      .eq('subdomain', 'burchmotors')
      .single();

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError.message);
      return;
    }

    console.log('📋 Updated subdomain info:');
    console.log('   Status:', updatedSubdomain.status);
    console.log('   Updated:', updatedSubdomain.updated_at);
    console.log('   Provisioned:', updatedSubdomain.provisioned_at);
    console.log('');
    console.log('🎉 Burchmotors subdomain is now active!');

  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

activateBurchmotorsSubdomain();