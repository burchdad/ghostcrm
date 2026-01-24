-- Migration: Add webhook retry system
-- This table tracks failed webhook operations for retry processing

-- Create webhook_retries table for tracking failed operations
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
    
    -- Context data (JSON for flexibility)
    email VARCHAR(255),
    session_id VARCHAR(255),
    subdomain_id UUID,
    subdomain_name VARCHAR(100),
    error TEXT,
    context JSONB DEFAULT '{}',
    
    -- Indexes
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

-- Add foreign key constraint to subdomains if needed
ALTER TABLE public.webhook_retries 
ADD CONSTRAINT fk_webhook_retries_subdomain 
FOREIGN KEY (subdomain_id) 
REFERENCES public.subdomains(id) 
ON DELETE SET NULL;

-- Add comment for documentation
COMMENT ON TABLE public.webhook_retries IS 'Tracks failed webhook operations for retry processing and manual intervention';
COMMENT ON COLUMN public.webhook_retries.type IS 'Type of operation: user_not_found, dns_provisioning_failed, etc.';
COMMENT ON COLUMN public.webhook_retries.context IS 'Additional context data for the retry operation';
COMMENT ON COLUMN public.webhook_retries.retry_count IS 'Number of retry attempts made';