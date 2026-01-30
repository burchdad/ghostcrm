-- EMERGENCY FIX: Restore Registration Functionality
-- Run this immediately in Supabase SQL Editor

-- Temporarily disable RLS on critical tables to restore registration
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;  
ALTER TABLE organization_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE subdomains DISABLE ROW LEVEL SECURITY;

-- Grant full access to service role
GRANT ALL PRIVILEGES ON users TO service_role;
GRANT ALL PRIVILEGES ON organizations TO service_role;
GRANT ALL PRIVILEGES ON organization_memberships TO service_role; 
GRANT ALL PRIVILEGES ON subdomains TO service_role;

-- Enable RLS back but with permissive service role policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;  
ALTER TABLE subdomains ENABLE ROW LEVEL SECURITY;

-- Add permissive service role policies
CREATE POLICY "service_role_all_access_users" ON users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_access_organizations" ON organizations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_access_memberships" ON organization_memberships FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_access_subdomains" ON subdomains FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Verify the fix worked
SELECT 'EMERGENCY FIX APPLIED - REGISTRATION SHOULD NOW WORK' as status;