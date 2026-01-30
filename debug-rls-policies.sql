-- Check existing RLS policies and permissions
-- Run this to debug what's blocking the registration

-- Check if RLS is enabled on tables
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public' 
AND tablename IN ('users', 'organizations', 'subdomains', 'organization_memberships');

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'organizations', 'subdomains', 'organization_memberships')
ORDER BY tablename, policyname;

-- Check service_role permissions
SELECT grantee, privilege_type, is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'organizations', 'subdomains', 'organization_memberships')
AND grantee = 'service_role'
ORDER BY table_name, privilege_type;

-- Test if we can actually insert into subdomains as service_role
SELECT 'Testing subdomain insert permissions' as status;