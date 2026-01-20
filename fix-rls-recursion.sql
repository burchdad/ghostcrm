-- RPC functions to bypass RLS infinite recursion during registration and profile access
-- These functions run with SECURITY DEFINER to bypass RLS policies

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
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create organization membership: %', SQLERRM;
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
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create tenant membership: %', SQLERRM;
END;
$$;

-- Function to get user profile bypassing RLS
CREATE OR REPLACE FUNCTION get_user_profile(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  email TEXT,
  role TEXT,
  organization_id UUID,
  tenant_id UUID,
  requires_password_reset BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check both users and profiles tables to handle different schema versions
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.role,
    u.organization_id,
    u.tenant_id,
    COALESCE(u.requires_password_reset, false) as requires_password_reset
  FROM users u
  WHERE u.id = p_user_id
  LIMIT 1;

  -- If not found in users, try profiles table
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.email,
      p.role,
      p.organization_id,
      p.tenant_id,
      COALESCE(p.requires_password_reset, false) as requires_password_reset
    FROM profiles p
    WHERE p.id = p_user_id
    LIMIT 1;
  END IF;
END;
$$;

-- Function to get user tenant IDs bypassing RLS
CREATE OR REPLACE FUNCTION get_user_tenant_ids(p_user_id UUID)
RETURNS TABLE(tenant_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT tm.tenant_id
  FROM tenant_memberships tm
  WHERE tm.user_id = p_user_id;
END;
$$;

-- Grant execute permissions to authenticated and service role
GRANT EXECUTE ON FUNCTION create_organization_membership TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_tenant_membership TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_profile TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_tenant_ids TO authenticated, service_role;