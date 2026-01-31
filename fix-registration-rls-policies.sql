-- Fix Registration RLS Issues
-- Run this in Supabase SQL Editor to ensure service role can perform registration operations

-- 1. Ensure service role can bypass RLS for registration operations
-- Users table policies
DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users" 
  ON users FOR INSERT 
  TO service_role 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update users" ON users;
CREATE POLICY "Service role can update users" 
  ON users FOR UPDATE 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Organizations table policies  
DROP POLICY IF EXISTS "Service role can insert organizations" ON organizations;
CREATE POLICY "Service role can insert organizations" 
  ON organizations FOR INSERT 
  TO service_role 
  WITH CHECK (true);

-- Organization memberships table policies
DROP POLICY IF EXISTS "Service role can insert organization_memberships" ON organization_memberships;
CREATE POLICY "Service role can insert organization_memberships" 
  ON organization_memberships FOR INSERT 
  TO service_role 
  WITH CHECK (true);

-- Subdomains table policies
DROP POLICY IF EXISTS "Service role can insert subdomains" ON subdomains;
CREATE POLICY "Service role can insert subdomains" 
  ON subdomains FOR INSERT 
  TO service_role 
  WITH CHECK (true);

-- Audit events table policies (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_events') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Service role can insert audit_events" ON audit_events';
    EXECUTE 'CREATE POLICY "Service role can insert audit_events" ON audit_events FOR INSERT TO service_role WITH CHECK (true)';
  END IF;
END $$;

-- 2. Grant necessary permissions to service role
GRANT ALL ON users TO service_role;
GRANT ALL ON organizations TO service_role;
GRANT ALL ON organization_memberships TO service_role;  
GRANT ALL ON subdomains TO service_role;

-- Grant sequence permissions if they exist
DO $$
BEGIN
  -- Users sequence
  IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name LIKE '%users%') THEN
    EXECUTE 'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role';
  END IF;
END $$;

COMMENT ON POLICY "Service role can insert users" ON users IS 'Allow service role to create users during registration';
COMMENT ON POLICY "Service role can insert organizations" ON organizations IS 'Allow service role to create organizations during registration';

-- Show current policies for verification
SELECT schemaname, tablename, policyname, roles 
FROM pg_policies 
WHERE tablename IN ('users', 'organizations', 'organization_memberships', 'subdomains')
  AND 'service_role' = ANY(roles)
ORDER BY tablename, policyname;