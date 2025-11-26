const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createSubdomainsTableDirect() {
    console.log('🚀 [SETUP] Creating subdomains table using admin client...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔗 [SETUP] Connecting to:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        // First check if table already exists
        console.log('🔍 [SETUP] Checking if subdomains table exists...');
        
        const { data: existingData, error: checkError } = await supabase
            .from('subdomains')
            .select('id')
            .limit(1);

        if (!checkError) {
            console.log('✅ [SETUP] Subdomains table already exists!');
            return;
        }

        console.log('📝 [SETUP] Table does not exist, creating...');

        // Create the table by using the admin client to execute queries
        // We'll use a workaround - create a simple record in organizations first to test connection
        
        console.log('🔍 [SETUP] Testing database connection...');
        const { data: orgs, error: orgError } = await supabase
            .from('organizations')
            .select('id, subdomain')
            .limit(1);

        if (orgError) {
            console.error('❌ [SETUP] Database connection failed:', orgError);
            return;
        }

        console.log('✅ [SETUP] Database connection successful');
        console.log('📋 [SETUP] Sample organization:', orgs?.[0]);

        // Since we can't execute DDL directly, let's manually insert the missing subdomain records
        // for existing organizations that don't have subdomain entries
        
        console.log('🔄 [SETUP] Attempting to create subdomains table via SQL endpoint...');
        
        // Use the SQL editor approach - we'll create a simple insert operation
        // to test if we can work with subdomains
        console.log('⚠️ [SETUP] Manual intervention required:');
        console.log('Please run this SQL in your Supabase SQL Editor:');
        console.log(`
-- Create subdomains table
CREATE TABLE IF NOT EXISTS public.subdomains (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subdomain VARCHAR(63) NOT NULL UNIQUE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'placeholder' CHECK (status IN ('placeholder', 'active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subdomains_subdomain ON public.subdomains(subdomain);
CREATE INDEX IF NOT EXISTS idx_subdomains_organization_id ON public.subdomains(organization_id);
CREATE INDEX IF NOT EXISTS idx_subdomains_status ON public.subdomains(status);

-- Enable RLS
ALTER TABLE public.subdomains ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
CREATE POLICY "Service role full access" ON public.subdomains
    FOR ALL USING (true);
        `);

    } catch (error) {
        console.error('❌ [SETUP] Error:', error);
    }
}

createSubdomainsTableDirect();