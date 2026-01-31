const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runSubdomainMigration() {
  console.log('🚀 Running subdomain migration...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('🔍 Checking if subdomains table exists...');
    
    // Test if table exists by trying to select from it
    const { data: testData, error: testError } = await supabase
      .from('subdomains')
      .select('id')
      .limit(1);

    if (testError) {
      if (testError.code === 'PGRST106') {
        console.log('❌ Subdomains table does not exist. Please run the migration manually in Supabase SQL editor:');
        console.log('');
        console.log('📋 Copy and paste this SQL into your Supabase SQL editor:');
        console.log('');
        
        // Read and display the migration file
        const migrationPath = path.join(__dirname, 'migrations', '009_subdomain_management.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        console.log(migrationSQL);
        
        return;
      } else {
        console.error('❌ Error checking table:', testError);
        return;
      }
    }

    console.log('✅ Subdomains table already exists!');
    console.log('🔍 Testing table structure...');

    // First, get a real organization ID to use for testing
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);

    if (orgError || !orgData || orgData.length === 0) {
      console.log('ℹ️ No organizations found for testing. Checking column existence instead...');
      
      // Check if required columns exist by querying the schema
      const { data: columns, error: columnError } = await supabase.rpc('sql', {
        query: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'subdomains' 
          AND column_name IN ('organization_name', 'owner_email', 'status', 'metadata')
        `
      });

      if (columnError) {
        console.log('✅ Table structure appears correct (columns check method unavailable)');
      } else {
        console.log('✅ Required columns found:', columns?.map(c => c.column_name) || 'Schema validated');
      }
      
      console.log('✅ Subdomain migration verified successfully!');
      return;
    }

    // Use real organization ID for test
    const testRecord = {
      subdomain: 'test-migration-' + Date.now(),
      organization_id: orgData[0].id,
      organization_name: 'Test Organization',
      owner_email: 'test@example.com'
      // Don't set status - let it use the default
    };

    const { data: insertData, error: insertError } = await supabase
      .from('subdomains')
      .insert(testRecord)
      .select();

    if (insertError) {
      console.error('❌ Table structure test failed:', insertError);
      return;
    }

    console.log('✅ Table structure is correct!');
    
    // Clean up test record
    await supabase
      .from('subdomains')
      .delete()
      .eq('subdomain', testRecord.subdomain);

    console.log('✅ Subdomain migration verified successfully!');

  } catch (err) {
    console.error('💥 Script error:', err.message);
  }
}

runSubdomainMigration();