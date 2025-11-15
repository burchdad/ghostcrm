-- Add industry and team_size columns to organizations table
-- This migration adds the missing columns that the onboarding system expects

-- Add industry column if it doesn't exist
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS industry VARCHAR(100);

-- Add team_size column if it doesn't exist
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS team_size VARCHAR(50);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_industry ON public.organizations(industry);
CREATE INDEX IF NOT EXISTS idx_organizations_team_size ON public.organizations(team_size);

-- Add some default values for existing organizations if needed
UPDATE public.organizations 
SET industry = 'technology', team_size = 'small' 
WHERE industry IS NULL OR team_size IS NULL;