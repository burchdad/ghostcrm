-- Fix users table - Add missing columns for registration
-- This adds the security-related columns that the registration API expects

-- Add missing columns to users table if they don't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(64);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS webauthn_credentials JSONB DEFAULT '[]';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS jwt_token VARCHAR(512);

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_password_hash ON public.users(password_hash);

-- Add comment
COMMENT ON TABLE public.users IS 'Users table with security authentication fields for GhostCRM registration';