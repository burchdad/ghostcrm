-- Add invite token functionality to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS invite_token VARCHAR(64),
ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index on invite_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_invite_token ON public.users(invite_token) WHERE invite_token IS NOT NULL;

-- Update any existing users without invite tokens to have null values (which they already should)
UPDATE public.users 
SET invite_token = NULL, invite_expires_at = NULL 
WHERE invite_token IS NOT NULL AND password_hash = 'PENDING_INVITE';