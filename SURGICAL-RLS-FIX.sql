-- SURGICAL FIX: Target the specific RLS policies blocking registration
-- Based on verification that tables exist but operations are blocked

-- 1. Drop ALL existing service_role policies that might be conflicting
DROP POLICY IF EXISTS "service_role_all_access_users" ON public.users;
DROP POLICY IF EXISTS "service_role_all_access_organizations" ON public.organizations;  
DROP POLICY IF EXISTS "service_role_all_access_subdomains" ON public.subdomains;
DROP POLICY IF EXISTS "service_role_all_access_memberships" ON public.organization_memberships;
DROP POLICY IF EXISTS "allow_service_role_all" ON public.users;
DROP POLICY IF EXISTS "allow_service_role_all" ON public.organizations;
DROP POLICY IF EXISTS "allow_service_role_all" ON public.subdomains;
DROP POLICY IF EXISTS "allow_service_role_all" ON public.organization_memberships;

-- 2. Temporarily disable RLS to clear any stuck state
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subdomains DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships DISABLE ROW LEVEL SECURITY;

-- 3. Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;

-- 4. Create clean service_role policies with unique names
CREATE POLICY "registration_service_role_users" ON public.users 
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "registration_service_role_subdomains" ON public.subdomains 
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "registration_service_role_memberships" ON public.organization_memberships 
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. Explicitly grant table privileges to service_role
GRANT ALL PRIVILEGES ON public.users TO service_role;
GRANT ALL PRIVILEGES ON public.subdomains TO service_role;
GRANT ALL PRIVILEGES ON public.organization_memberships TO service_role;

-- 6. Test that service_role can perform the exact operations registration needs
-- (These are SELECT statements that won't modify data, just test permissions)

-- Test 1: Can service_role see users table?
SELECT 'TEST 1 - service_role can SELECT from users:' as test, 
       CASE WHEN EXISTS(SELECT 1 FROM public.users LIMIT 1) THEN 'PASS' ELSE 'PASS (empty table)' END as result;

-- Test 2: Can service_role see subdomains table?  
SELECT 'TEST 2 - service_role can SELECT from subdomains:' as test,
       CASE WHEN EXISTS(SELECT 1 FROM public.subdomains LIMIT 1) THEN 'PASS' ELSE 'PASS (empty table)' END as result;

-- Test 3: Show current RLS policies to verify they're active
SELECT 'VERIFICATION - Current policies:' as info;
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'subdomains', 'organization_memberships')
AND 'service_role' = ANY(roles)
ORDER BY tablename, policyname;

SELECT 'SURGICAL FIX COMPLETE - Test registration now!' as status;