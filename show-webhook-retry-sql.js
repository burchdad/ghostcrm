/**
 * Simple SQL output for webhook retry system
 * Use this if the main setup script doesn't work
 */

console.log('🚀 GhostCRM Webhook Retry System SQL');
console.log('=====================================');
console.log('');
console.log('📋 Copy and paste this SQL into your Supabase SQL Editor:');
console.log('');

const sql = `-- Webhook Retry System for GhostCRM
-- This creates the necessary table and policies for webhook failure recovery

CREATE TABLE IF NOT EXISTS public.webhook_retries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'user_not_found', 'dns_provisioning_failed', etc.
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    
    -- Retry metadata
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_retry_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Context data
    email VARCHAR(255),
    session_id VARCHAR(255),
    subdomain_id UUID,
    subdomain_name VARCHAR(100),
    error TEXT,
    context JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT webhook_retries_status_check CHECK (status IN ('pending', 'completed', 'failed'))
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_webhook_retries_status ON public.webhook_retries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_retries_type ON public.webhook_retries(type);
CREATE INDEX IF NOT EXISTS idx_webhook_retries_created_at ON public.webhook_retries(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_retries_retry_count ON public.webhook_retries(retry_count);

-- Add RLS policy for admin access
ALTER TABLE public.webhook_retries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.webhook_retries
    FOR ALL USING (auth.role() = 'service_role');

-- Optional: Add foreign key constraint to subdomains
-- (Only run this if your subdomains table exists)
-- ALTER TABLE public.webhook_retries 
-- ADD CONSTRAINT fk_webhook_retries_subdomain 
-- FOREIGN KEY (subdomain_id) 
-- REFERENCES public.subdomains(id) 
-- ON DELETE SET NULL;`;

console.log(sql);
console.log('');
console.log('✅ After running the SQL above:');
console.log('  1. Add WEBHOOK_RETRY_SECRET to your .env.local file');
console.log('  2. Test the webhook retry endpoint: POST /api/webhooks/retry');
console.log('  3. Set up a cron job to call the retry endpoint every 5 minutes');
console.log('');
console.log('📝 Environment variable to add:');
console.log('WEBHOOK_RETRY_SECRET=your-secure-random-secret-here');
console.log('');
console.log('🔗 API Usage:');
console.log('POST /api/webhooks/retry');
console.log('Content-Type: application/json');
console.log('Body: { "authHeader": "your-secure-random-secret-here" }');