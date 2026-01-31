-- Create team_invites table for enhanced invitation system
-- This table stores invitation tokens and metadata for the new invitation flow

CREATE TABLE IF NOT EXISTS public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  organization_name VARCHAR(255),
  inviter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  inviter_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON public.team_invites(token);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON public.team_invites(email);
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON public.team_invites(status);
CREATE INDEX IF NOT EXISTS idx_team_invites_expires_at ON public.team_invites(expires_at);
CREATE INDEX IF NOT EXISTS idx_team_invites_organization_id ON public.team_invites(organization_id);

-- Add requires_password_reset column to users table if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS requires_password_reset BOOLEAN DEFAULT FALSE;

-- Create index on requires_password_reset for performance
CREATE INDEX IF NOT EXISTS idx_users_requires_password_reset ON public.users(requires_password_reset) WHERE requires_password_reset = TRUE;