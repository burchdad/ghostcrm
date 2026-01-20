-- RPC functions to bypass RLS infinite recursion during registration
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

-- Grant execute permissions to authenticated and service role
GRANT EXECUTE ON FUNCTION create_organization_membership TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_tenant_membership TO authenticated, service_role;