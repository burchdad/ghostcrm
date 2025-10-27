-- =========================================
-- GHOSTCRM PRODUCTION FIX: MEMBERSHIPS TABLE
-- Execute this in Supabase SQL Editor
-- =========================================

-- 1. Create the memberships table
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- 2. Enable Row Level Security
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
CREATE POLICY "Users can view their own memberships" ON public.memberships
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all memberships" ON public.memberships
  FOR ALL USING (auth.role() = 'service_role');

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_organization_id ON public.memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_org ON public.memberships(user_id, organization_id);

-- 5. Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_memberships_updated_at 
  BEFORE UPDATE ON public.memberships 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Insert membership for existing user (burchsl4@gmail.com)
INSERT INTO public.memberships (user_id, organization_id, role, status, permissions)
VALUES 
  -- Link user to Acme Motors as admin
  ('3f52f47d-bc1c-4347-a2f4-dda664497965', 'ec3eec6a-b131-48a2-9ecc-43ebabfc208b', 'admin', 'active', '{"leads": "full", "contacts": "full", "reports": "view"}'),
  
  -- Also create memberships for other orgs for testing (optional)
  ('3f52f47d-bc1c-4347-a2f4-dda664497965', 'fb5ea7d5-c78e-40ff-8071-dfb4f1b87c19', 'member', 'active', '{"leads": "view", "contacts": "view"}'),
  ('3f52f47d-bc1c-4347-a2f4-dda664497965', 'cd37b8e8-1af3-417d-9f1e-ea4bc5311f01', 'member', 'active', '{"leads": "view", "contacts": "view"}')
ON CONFLICT (user_id, organization_id) DO UPDATE SET
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- 7. Verify the setup
SELECT 
  m.id,
  u.email as user_email,
  o.name as organization_name,
  o.subdomain,
  m.role,
  m.status,
  m.joined_at
FROM public.memberships m
JOIN auth.users u ON m.user_id = u.id
JOIN public.organizations o ON m.organization_id = o.id
ORDER BY m.joined_at;

-- Expected result: Should show 3 memberships for burchsl4@gmail.com