require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeWebhookIssue() {
  try {
    console.log('🔍 Analyzing why webhook subdomain activation failed...');
    console.log('');

    // 1. Check user with burchsl4@gmail.com
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, organization_id')
      .eq('email', 'burchsl4@gmail.com')
      .single();

    if (userError || !user) {
      console.error('❌ User not found for burchsl4@gmail.com:', userError?.message);
      return;
    }

    console.log('👤 User found:');
    console.log('   Email:', user.email);
    console.log('   ID:', user.id);
    console.log('   Organization ID:', user.organization_id);
    console.log('');

    // 2. Check if organization matches subdomain - look for ALL subdomains for this org
    const { data: subdomains, error: subdomainError } = await supabase
      .from('subdomains')
      .select('*')
      .eq('organization_id', user.organization_id);

    if (subdomainError) {
      console.error('❌ Error fetching subdomains:', subdomainError.message);
      return;
    }

    console.log(`🌐 Found ${subdomains?.length || 0} subdomain(s) for this organization:`);
    if (subdomains && subdomains.length > 0) {
      subdomains.forEach((sub, index) => {
        console.log(`   ${index + 1}. ${sub.subdomain} - Status: ${sub.status}`);
      });
    }
    console.log('');

    const burchmotorsSubdomain = subdomains?.find(s => s.subdomain === 'burchmotors');
    if (!burchmotorsSubdomain) {
      console.error('❌ Burchmotors subdomain not found for this organization!');
      return;
    }

    console.log('🌐 Burchmotors subdomain details:');
    console.log('   Subdomain:', burchmotorsSubdomain.subdomain);
    console.log('   Status:', burchmotorsSubdomain.status);
    console.log('   Organization ID:', burchmotorsSubdomain.organization_id);
    console.log('   Match with user org:', user.organization_id === burchmotorsSubdomain.organization_id);
    console.log('');

    // 3. Check what the webhook query would find
    const { data: webhookQuery, error: webhookError } = await supabase
      .from('subdomains')
      .select('*')
      .eq('organization_id', user.organization_id)
      .eq('status', 'pending_payment');

    console.log('🔧 Webhook query simulation (pending_payment status):');
    if (webhookError) {
      console.log('   ❌ Error:', webhookError.message);
    } else if (!webhookQuery || webhookQuery.length === 0) {
      console.log('   ❌ No subdomains found with pending_payment status');
      console.log('   This explains why the webhook failed!');
    } else {
      console.log(`   ✅ Found ${webhookQuery.length} subdomain(s) with pending_payment status:`);
      webhookQuery.forEach((sub, index) => {
        console.log(`      ${index + 1}. ${sub.subdomain}`);
      });
    }
    console.log('');

    // 4. Recommendations
    console.log('💡 Analysis & Recommendations:');
    console.log('1. User and organization mapping is correct');
    if (subdomains && subdomains.length > 0) {
      console.log(`2. Found ${subdomains.length} subdomain(s) for this organization`);
    }
    if (burchmotorsSubdomain.status === 'active') {
      console.log('3. Burchmotors subdomain is now active (manually fixed)');
      console.log('4. Webhook likely failed because:');
      console.log('   - Webhook processed before subdomain was created, OR');
      console.log('   - Webhook email lookup failed, OR');  
      console.log('   - Webhook found no pending_payment records');
    } else {
      console.log('3. Burchmotors subdomain is still pending_payment');
      console.log('4. Webhook should have activated it but failed');
    }
    console.log('');
    console.log('🔧 Next steps:');
    console.log('- Add more logging to webhook for debugging');
    console.log('- Add backup activation check after payment success page');
    console.log('- Consider webhook retry logic');

  } catch (error) {
    console.error('❌ Analysis error:', error.message);
  }
}

analyzeWebhookIssue();