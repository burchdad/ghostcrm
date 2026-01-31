const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testAuthMeLogic() {
    console.log('🔍 [DEBUG] Testing auth/me subdomain logic...');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        // Simulate the logic from /api/auth/me
        const organizationId = '6355db0f-e8c6-4da5-bd18-71653b675f96';
        
        console.log('🔍 [DEBUG] Fetching organization with ID:', organizationId);
        
        const { data: org, error } = await supabase
            .from('organizations')
            .select('subdomain')
            .eq('id', organizationId)
            .single();

        console.log('📊 [DEBUG] Query result:');
        console.log('  Data:', org);
        console.log('  Error:', error);
        
        const organizationSubdomain = org?.subdomain || null;
        console.log('🎯 [DEBUG] Final organizationSubdomain:', organizationSubdomain);

    } catch (error) {
        console.error('❌ [DEBUG] Unexpected error:', error);
    }
}

testAuthMeLogic();