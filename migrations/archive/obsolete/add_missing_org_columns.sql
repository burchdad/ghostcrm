-- Add missing columns to existing organizations table
-- This adds the columns that the registration API expects

-- Add onboarding_completed column if it doesn't exist
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add owner_id column if it doesn't exist (the registration API tries to set this)
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Create index for owner_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON public.organizations(owner_id);

-- Add foreign key constraint for owner_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_organizations_owner'
    ) THEN
        ALTER TABLE public.organizations
        ADD CONSTRAINT fk_organizations_owner
        FOREIGN KEY (owner_id) REFERENCES public.users(id);
    END IF;
END $$;