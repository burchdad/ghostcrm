-- Add personal contact fields to users table for post-login verification setup

-- Add personal phone number field
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS personal_phone VARCHAR(15);

-- Add confirmed email field (may differ from login email)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS confirmed_email VARCHAR(255);

-- Add verification setup tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_setup_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Create index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_users_personal_phone ON users(personal_phone);

-- Create index for confirmed email lookups  
CREATE INDEX IF NOT EXISTS idx_users_confirmed_email ON users(confirmed_email);

COMMENT ON COLUMN users.personal_phone IS 'User personal phone number for security notifications (not company phone)';
COMMENT ON COLUMN users.confirmed_email IS 'User confirmed email address (may differ from login email)';
COMMENT ON COLUMN users.email_verified IS 'Whether the user has completed email verification setup';
COMMENT ON COLUMN users.verification_setup_completed IS 'Whether the user has completed the post-login verification setup flow';
COMMENT ON COLUMN users.email_verified_at IS 'Timestamp when email was verified';