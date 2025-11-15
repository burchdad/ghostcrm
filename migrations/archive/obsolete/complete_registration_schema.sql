-- GhostCRM Complete Registration Database Schema
-- This ensures all tables required by the registration API exist with proper structure

-- ===================================================================
-- 1. USERS TABLE (already exists, but ensure all required columns)
-- ===================================================================

-- Add any missing columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS organization_id UUID;

-- ===================================================================
-- 2. ORGANIZATIONS TABLE (add missing columns)
-- ===================================================================

-- Add missing columns to existing organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Create index for owner_id
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON public.organizations(owner_id);

-- ===================================================================
-- 3. ORGANIZATION_MEMBERSHIPS TABLE (create if missing)
-- ===================================================================

-- Create organization_memberships table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'owner')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Create indexes for organization_memberships
CREATE INDEX IF NOT EXISTS idx_org_memberships_org_id ON public.organization_memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_user_id ON public.organization_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_status ON public.organization_memberships(status);

-- ===================================================================
-- 4. AUDIT_EVENTS TABLE (create if missing)
-- ===================================================================

-- Create audit_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,
  actor_id UUID,
  entity VARCHAR(100),
  entity_id UUID,
  action VARCHAR(100),
  diff JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit_events
CREATE INDEX IF NOT EXISTS idx_audit_events_org_id ON public.audit_events(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor_id ON public.audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON public.audit_events(entity);
CREATE INDEX IF NOT EXISTS idx_audit_events_action ON public.audit_events(action);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON public.audit_events(created_at);

-- ===================================================================
-- 5. FOREIGN KEY CONSTRAINTS
-- ===================================================================

-- Add foreign key constraints (with conditional logic to avoid duplicates)
DO $$
BEGIN
    -- users.organization_id -> organizations.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_users_organization'
    ) THEN
        ALTER TABLE public.users
        ADD CONSTRAINT fk_users_organization
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
    END IF;

    -- organizations.owner_id -> users.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_organizations_owner'
    ) THEN
        ALTER TABLE public.organizations
        ADD CONSTRAINT fk_organizations_owner
        FOREIGN KEY (owner_id) REFERENCES public.users(id);
    END IF;

    -- organization_memberships.organization_id -> organizations.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_org_memberships_organization'
    ) THEN
        ALTER TABLE public.organization_memberships
        ADD CONSTRAINT fk_org_memberships_organization
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;

    -- organization_memberships.user_id -> users.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_org_memberships_user'
    ) THEN
        ALTER TABLE public.organization_memberships
        ADD CONSTRAINT fk_org_memberships_user
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- audit_events.actor_id -> users.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_audit_events_actor'
    ) THEN
        ALTER TABLE public.audit_events
        ADD CONSTRAINT fk_audit_events_actor
        FOREIGN KEY (actor_id) REFERENCES public.users(id);
    END IF;
END $$;

-- ===================================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Organization memberships policies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their memberships" ON public.organization_memberships;
CREATE POLICY "Users can view their memberships" ON public.organization_memberships
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert memberships during registration" ON public.organization_memberships;
CREATE POLICY "Users can insert memberships during registration" ON public.organization_memberships
  FOR INSERT WITH CHECK (true);

-- Audit events policies  
DROP POLICY IF EXISTS "Users can view audit events for their org" ON public.audit_events;
CREATE POLICY "Users can view audit events for their org" ON public.audit_events
  FOR SELECT USING (
    org_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Allow audit event insertion" ON public.audit_events;
CREATE POLICY "Allow audit event insertion" ON public.audit_events
  FOR INSERT WITH CHECK (true);

-- ===================================================================
-- 7. GRANTS AND PERMISSIONS
-- ===================================================================

-- Grant permissions for all tables
GRANT ALL ON public.organization_memberships TO authenticated;
GRANT ALL ON public.organization_memberships TO anon;
GRANT ALL ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO anon;

-- ===================================================================
-- 8. TRIGGERS FOR UPDATED_AT
-- ===================================================================

-- Create updated_at triggers for new tables
DROP TRIGGER IF EXISTS update_org_memberships_updated_at ON public.organization_memberships;
CREATE TRIGGER update_org_memberships_updated_at 
  BEFORE UPDATE ON public.organization_memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: audit_events doesn't need updated_at trigger as it's append-only