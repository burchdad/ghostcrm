-- Comprehensive RLS Policy Fix
-- Created: 2025-01-15
-- Purpose: Completely resolve RLS infinite recursion by replacing problematic policies

BEGIN;

-- 1. Drop ALL existing RLS policies that might cause circular dependencies
-- Start fresh with simple, non-recursive policies

-- Drop all policies on profiles
DO $$ 
DECLARE 
  pol RECORD;
BEGIN 
  FOR pol IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- Drop all policies on organization_memberships
DO $$ 
DECLARE 
  pol RECORD;
BEGIN 
  FOR pol IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'organization_memberships'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- Drop all policies on tenant_memberships
DO $$ 
DECLARE 
  pol RECORD;
BEGIN 
  FOR pol IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'tenant_memberships'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- 2. Create simple, non-recursive RLS policies

-- Profiles: Simple user ownership
CREATE POLICY "profiles_own_data" ON profiles
  FOR ALL USING (id = auth.uid());

-- Organization memberships: Simple user ownership
CREATE POLICY "org_memberships_own_data" ON organization_memberships
  FOR ALL USING (user_id = auth.uid());

-- Tenant memberships: Simple user ownership  
CREATE POLICY "tenant_memberships_own_data" ON tenant_memberships
  FOR ALL USING (user_id = auth.uid());

-- 3. Add comprehensive RPC bypass functions

-- Function to get complete user data without RLS
CREATE OR REPLACE FUNCTION get_user_complete_data(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  email TEXT,
  role TEXT,
  organization_id UUID,
  tenant_id UUID,
  requires_password_reset BOOLEAN,
  organization_memberships JSONB,
  tenant_memberships JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_data RECORD;
  org_memberships JSONB;
  tenant_memberships JSONB;
BEGIN
  -- Get user profile data
  SELECT u.id, u.email, u.role, u.organization_id, u.tenant_id, 
         COALESCE(u.requires_password_reset, false) as requires_password_reset
  INTO user_data
  FROM users u
  WHERE u.id = p_user_id;

  -- If not found in users table, try profiles
  IF NOT FOUND THEN
    SELECT p.id, p.email, p.role, p.organization_id, p.tenant_id, 
           COALESCE(p.requires_password_reset, false) as requires_password_reset
    INTO user_data
    FROM profiles p
    WHERE p.id = p_user_id;
  END IF;

  -- Get organization memberships as JSONB
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', om.id,
    'organization_id', om.organization_id,
    'role', om.role,
    'status', om.status,
    'created_at', om.created_at
  )), '[]'::jsonb)
  INTO org_memberships
  FROM organization_memberships om
  WHERE om.user_id = p_user_id;

  -- Get tenant memberships as JSONB
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', tm.id,
    'tenant_id', tm.tenant_id,
    'role', tm.role,
    'created_at', tm.created_at
  )), '[]'::jsonb)
  INTO tenant_memberships
  FROM tenant_memberships tm
  WHERE tm.user_id = p_user_id;

  -- Return combined data
  RETURN QUERY
  SELECT 
    user_data.id,
    user_data.email,
    user_data.role,
    user_data.organization_id,
    user_data.tenant_id,
    user_data.requires_password_reset,
    org_memberships,
    tenant_memberships;
END;
$$;

-- Function to safely insert organization membership
CREATE OR REPLACE FUNCTION safe_create_organization_membership(
  p_organization_id UUID,
  p_user_id UUID,
  p_role TEXT DEFAULT 'owner',
  p_status TEXT DEFAULT 'active'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  membership_id UUID;
BEGIN
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
EXCEPTION
  WHEN unique_violation THEN
    -- Return existing membership ID
    SELECT id INTO membership_id
    FROM organization_memberships
    WHERE organization_id = p_organization_id AND user_id = p_user_id;
    RETURN membership_id;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create organization membership: %', SQLERRM;
END;
$$;

-- Function to safely insert tenant membership
CREATE OR REPLACE FUNCTION safe_create_tenant_membership(
  p_user_id UUID,
  p_tenant_id UUID,
  p_role TEXT DEFAULT 'owner'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  membership_id UUID;
BEGIN
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
EXCEPTION
  WHEN unique_violation THEN
    -- Return existing membership ID
    SELECT id INTO membership_id
    FROM tenant_memberships
    WHERE user_id = p_user_id AND tenant_id = p_tenant_id;
    RETURN membership_id;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create tenant membership: %', SQLERRM;
END;
$$;

-- Function to check user access without RLS recursion
CREATE OR REPLACE FUNCTION check_user_access(p_user_id UUID, p_organization_id UUID DEFAULT NULL, p_tenant_id UUID DEFAULT NULL)
RETURNS TABLE(
  has_org_access BOOLEAN,
  has_tenant_access BOOLEAN,
  org_role TEXT,
  tenant_role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_access BOOLEAN := FALSE;
  tenant_access BOOLEAN := FALSE;
  user_org_role TEXT := NULL;
  user_tenant_role TEXT := NULL;
BEGIN
  -- Check organization access if provided
  IF p_organization_id IS NOT NULL THEN
    SELECT om.role INTO user_org_role
    FROM organization_memberships om
    WHERE om.user_id = p_user_id AND om.organization_id = p_organization_id
    LIMIT 1;
    
    org_access := user_org_role IS NOT NULL;
  END IF;

  -- Check tenant access if provided
  IF p_tenant_id IS NOT NULL THEN
    SELECT tm.role INTO user_tenant_role
    FROM tenant_memberships tm
    WHERE tm.user_id = p_user_id AND tm.tenant_id = p_tenant_id
    LIMIT 1;
    
    tenant_access := user_tenant_role IS NOT NULL;
  END IF;

  RETURN QUERY
  SELECT org_access, tenant_access, user_org_role, user_tenant_role;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_complete_data TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION safe_create_organization_membership TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION safe_create_tenant_membership TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION check_user_access TO authenticated, service_role;

COMMIT;