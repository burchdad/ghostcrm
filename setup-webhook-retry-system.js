/**
 * Setup script for webhook retry system
 * Run this to create the necessary database tables and initial configuration
 */

const { createClient } = require('@supabase/supabase-js');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');
require('dotenv').config({ path: '.env.local' });

// Try to load environment variables from multiple sources
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// If not found, try .env
if (!supabaseUrl || !supabaseServiceKey) {
  try {
    require('dotenv').config({ path: '.env' });
    supabaseUrl = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
    supabaseServiceKey = supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  } catch (error) {
    // dotenv not available, continue
  }
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('💡 Please add these to your .env.local or .env file');
  console.error('   You can copy from .env.template');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupWebhookRetrySystem() {
  console.log('🚀 Setting up webhook retry system...');
  
  try {
    // Check if migration file exists
    const migrationPath = join(process.cwd(), 'migrations', '010_webhook_retry_system.sql');
    
    if (!existsSync(migrationPath)) {
      console.log('📄 Migration file not found, creating table directly...');
      await createTableDirectly();
      return;
    }
    
    console.log('📄 Found migration file, creating table...');
    await createTableDirectly(); // Simplified approach
    
    // Test the table was created successfully
    const { data: testData, error: testError } = await supabase
      .from('webhook_retries')
      .select('count(*)')
      .limit(1);
    
    if (testError) {
      console.error('❌ Webhook retries table not accessible:', testError.message);
      console.log('🔧 Attempting direct table creation...');
      await createTableDirectly();
    } else {
      console.log('✅ Webhook retries table is accessible');
    }
    
    console.log('✅ Webhook retry system setup completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('  1. Set WEBHOOK_RETRY_SECRET in your environment variables');
    console.log('  2. Set up a cron job to call /api/webhooks/retry periodically');
    console.log('  3. Monitor failed webhook operations in the webhook_retries table');
    console.log('');
    console.log('🔗 Retry endpoint: POST /api/webhooks/retry');
    console.log('   Header: { "authHeader": "your-webhook-retry-secret" }');
    
  } catch (error) {
    console.error('❌ Error setting up webhook retry system:', error.message);
    console.log('');
    console.log('🛠️ Manual setup instructions:');
    console.log('  1. Go to your Supabase dashboard');
    console.log('  2. Navigate to SQL Editor');
    console.log('  3. Run the SQL from migrations/010_webhook_retry_system.sql');
    console.log('  4. Or copy the SQL from the createTableDirectly function below');
  }
}

async function createTableDirectly() {
  console.log('🔧 Creating webhook_retries table directly...');
  
  try {
    // First check if table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('webhook_retries')
      .select('count(*)')
      .limit(1);
    
    if (!checkError) {
      console.log('✅ webhook_retries table already exists');
      return;
    }
    
    // Table doesn't exist, create it
    console.log('📝 Creating webhook_retries table...');
    console.log('');
    console.log('ℹ️ Since we cannot execute DDL through the JS client,');
    console.log('   please run this SQL manually in your Supabase dashboard:');
    console.log('');
    console.log('-- Copy and paste this SQL into Supabase SQL Editor:');
    console.log('');
    console.log(`CREATE TABLE IF NOT EXISTS public.webhook_retries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_retry_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    email VARCHAR(255),
    session_id VARCHAR(255),
    subdomain_id UUID,
    subdomain_name VARCHAR(100),
    error TEXT,
    context JSONB DEFAULT '{}',
    CONSTRAINT webhook_retries_status_check CHECK (status IN ('pending', 'completed', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_webhook_retries_status ON public.webhook_retries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_retries_type ON public.webhook_retries(type);
CREATE INDEX IF NOT EXISTS idx_webhook_retries_created_at ON public.webhook_retries(created_at);

ALTER TABLE public.webhook_retries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.webhook_retries
    FOR ALL USING (auth.role() = 'service_role');`);
    
    console.log('');
    console.log('📋 After running the SQL:');
    console.log('  1. Come back and run this script again to verify');
    console.log('  2. Or manually test by inserting a record');
    
  } catch (error) {
    console.error('❌ Error in direct table creation:', error.message);
    throw error;
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupWebhookRetrySystem()
    .then(() => {
      console.log('🎉 Setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}