-- Apply RLS fixes via Supabase SQL Editor
-- Copy and paste this entire script into your Supabase SQL Editor and run it

-- First, apply the original RLS bypass functions
BEGIN;

-- Create organization membership function
CREATE OR REPLACE FUNCTION create_organization_membership(
  p_organization_id UUID,
  p_user_id UUID,
  p_role TEXT,
  p_status TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  membership_id UUID;
BEGIN
  -- Insert directly without triggering RLS
  INSERT INTO organization_memberships (
    organization_id,
    user_id,
    role,
    status,
    created_at,
    updated_at
  ) VALUES (
    p_organization_id,
    p_user_id,
    p_role,
    p_status,
    NOW(),
    NOW()
  ) RETURNING id INTO membership_id;
  
  RETURN membership_id;
  -- No exception handler - let real errors surface for debugging
END;
$$;

-- Create tenant membership function
CREATE OR REPLACE FUNCTION create_tenant_membership(
  p_user_id UUID,
  p_tenant_id UUID,
  p_role TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  membership_id UUID;
BEGIN
  -- Insert directly without triggering RLS
  INSERT INTO tenant_memberships (
    user_id,
    tenant_id,
    role,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_tenant_id,
    p_role,
    NOW(),
    NOW()
  ) RETURNING id INTO membership_id;
  
  RETURN membership_id;
  -- No exception handler - let real errors surface for debugging
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_organization_membership TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_tenant_membership TO authenticated, service_role;

-- Apply simplified RLS policies to prevent infinite recursion
-- Drop problematic existing policies
DO $$ 
DECLARE 
  pol RECORD;
BEGIN 
  -- Drop all policies on organization_memberships
  FOR pol IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'organization_memberships'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;

  -- Drop all policies on tenant_memberships  
  FOR pol IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'tenant_memberships'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- Create simple, non-recursive policies
CREATE POLICY "org_memberships_own_data" ON organization_memberships
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "tenant_memberships_own_data" ON tenant_memberships
  FOR ALL USING (user_id = auth.uid());

COMMIT;