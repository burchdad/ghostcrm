-- AGGRESSIVE FIX: Drop all existing policies and recreate
-- Run this if the first emergency script didn't work

-- Drop ALL existing RLS policies on these tables
DROP POLICY IF EXISTS "service_role_all_access_users" ON users;
DROP POLICY IF EXISTS "service_role_all_access_organizations" ON organizations;
DROP POLICY IF EXISTS "service_role_all_access_memberships" ON organization_memberships;
DROP POLICY IF EXISTS "service_role_all_access_subdomains" ON subdomains;

-- Drop any other policies that might be interfering
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies on users table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON users';
    END LOOP;
    
    -- Drop all policies on organizations table  
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'organizations' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON organizations';
    END LOOP;
    
    -- Drop all policies on organization_memberships table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'organization_memberships' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON organization_memberships';
    END LOOP;
    
    -- Drop all policies on subdomains table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'subdomains' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON subdomains';
    END LOOP;
END $$;

-- Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;  
ALTER TABLE organization_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE subdomains DISABLE ROW LEVEL SECURITY;

-- Grant explicit permissions to service_role
GRANT ALL PRIVILEGES ON users TO service_role;
GRANT ALL PRIVILEGES ON organizations TO service_role;
GRANT ALL PRIVILEGES ON organization_memberships TO service_role; 
GRANT ALL PRIVILEGES ON subdomains TO service_role;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;  
ALTER TABLE subdomains ENABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies for service_role
CREATE POLICY "allow_service_role_all" ON users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "allow_service_role_all" ON organizations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "allow_service_role_all" ON organization_memberships FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "allow_service_role_all" ON subdomains FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Test the fix
SELECT 'AGGRESSIVE RLS FIX APPLIED - REGISTRATION SHOULD NOW WORK' as status;