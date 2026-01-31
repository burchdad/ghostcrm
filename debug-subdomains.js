const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkSubdomains() {
    console.log('🔍 [DEBUG] Checking organization subdomains...');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        // Get all organizations with their subdomains
        const { data: orgs, error } = await supabase
            .from('organizations')
            .select('id, name, subdomain, owner_id, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ [DEBUG] Error fetching organizations:', error);
            return;
        }

        console.log('📋 [DEBUG] Organizations found:');
        orgs.forEach(org => {
            console.log(`  - ${org.name} (${org.id})`);
            console.log(`    Subdomain: ${org.subdomain || 'NULL'}`);
            console.log(`    Owner: ${org.owner_id}`);
            console.log(`    Created: ${org.created_at}`);
            console.log('');
        });

        // Check the specific organization from your logs
        const targetOrgId = '6355db0f-e8c6-4da5-bd18-71653b675f96';
        const { data: targetOrg, error: targetError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', targetOrgId)
            .single();

        if (targetError) {
            console.error('❌ [DEBUG] Error fetching target org:', targetError);
        } else {
            console.log('🎯 [DEBUG] Target organization details:');
            console.log(JSON.stringify(targetOrg, null, 2));
        }

    } catch (error) {
        console.error('❌ [DEBUG] Unexpected error:', error);
    }
}

checkSubdomains();