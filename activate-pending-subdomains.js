const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function activatePendingSubdomains() {
  console.log('🚀 Activating pending payment subdomains...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Find all subdomains with pending_payment status
    const { data: pendingSubdomains, error: fetchError } = await supabase
      .from('subdomains')
      .select('*')
      .eq('status', 'pending_payment');

    if (fetchError) {
      console.error('❌ Error fetching pending subdomains:', fetchError);
      return;
    }

    if (!pendingSubdomains || pendingSubdomains.length === 0) {
      console.log('ℹ️ No pending payment subdomains found');
      return;
    }

    console.log(`🔍 Found ${pendingSubdomains.length} pending subdomain(s):`);
    
    for (const subdomain of pendingSubdomains) {
      console.log(`  - ${subdomain.subdomain} (${subdomain.organization_name})`);
      
      // Check if organization has an active subscription or completed payment
      // For now, we'll activate all pending ones - you can add payment verification logic here
      
      const { error: updateError } = await supabase
        .from('subdomains')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
          provisioned_at: new Date().toISOString()
        })
        .eq('id', subdomain.id);

      if (updateError) {
        console.error(`❌ Failed to activate ${subdomain.subdomain}:`, updateError);
      } else {
        console.log(`✅ Activated subdomain: ${subdomain.subdomain}`);
      }
    }

    console.log('🎉 Subdomain activation completed!');

  } catch (err) {
    console.error('💥 Script error:', err.message);
  }
}

activatePendingSubdomains();