-- Fix subdomains table to add all missing columns
-- Run this in your Supabase SQL editor

-- Add all missing columns from the full schema
ALTER TABLE subdomains ADD COLUMN IF NOT EXISTS organization_name VARCHAR(255) NOT NULL DEFAULT 'Unknown Organization';
ALTER TABLE subdomains ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255) NOT NULL DEFAULT 'unknown@example.com';
ALTER TABLE subdomains ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255);
ALTER TABLE subdomains ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE subdomains ADD COLUMN IF NOT EXISTS ssl_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE subdomains ADD COLUMN IF NOT EXISTS dns_provider VARCHAR(100);
ALTER TABLE subdomains ADD COLUMN IF NOT EXISTS vercel_domain_id VARCHAR(255);
ALTER TABLE subdomains ADD COLUMN IF NOT EXISTS last_health_check TIMESTAMP WITH TIME ZONE;
ALTER TABLE subdomains ADD COLUMN IF NOT EXISTS health_status VARCHAR(50) DEFAULT 'unknown';
ALTER TABLE subdomains ADD COLUMN IF NOT EXISTS provisioned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE subdomains ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE subdomains ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add constraints if they don't exist
DO $$ 
BEGIN
    -- Add check constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subdomains_status_check') THEN
        ALTER TABLE subdomains ADD CONSTRAINT subdomains_status_check 
        CHECK (status IN ('pending', 'pending_payment', 'active', 'inactive', 'failed', 'suspended'));
    ELSE
        -- Update existing constraint to include pending_payment
        ALTER TABLE subdomains DROP CONSTRAINT subdomains_status_check;
        ALTER TABLE subdomains ADD CONSTRAINT subdomains_status_check 
        CHECK (status IN ('pending', 'pending_payment', 'active', 'inactive', 'failed', 'suspended'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subdomains_ssl_status_check') THEN
        ALTER TABLE subdomains ADD CONSTRAINT subdomains_ssl_status_check 
        CHECK (ssl_status IN ('pending', 'active', 'failed', 'expired'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subdomains_health_status_check') THEN
        ALTER TABLE subdomains ADD CONSTRAINT subdomains_health_status_check 
        CHECK (health_status IN ('healthy', 'degraded', 'unhealthy', 'unknown'));
    END IF;
END $$;

-- Update any existing records to have proper values
UPDATE subdomains 
SET organization_name = COALESCE(
  (SELECT name FROM organizations WHERE organizations.id = subdomains.organization_id),
  'Unknown Organization'
),
owner_email = COALESCE(
  (SELECT email FROM users WHERE users.organization_id = subdomains.organization_id AND role = 'owner' LIMIT 1),
  'unknown@example.com'
)
WHERE organization_name = 'Unknown Organization' OR owner_email = 'unknown@example.com';

-- Verify all columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'subdomains' 
ORDER BY ordinal_position;