-- =====================================================
-- 🔐 PART 2: AUTHENTICATION & TENANT ISOLATION
-- Run this second to see authentication and tenant security
-- =====================================================

-- Authentication & Authorization Status
SELECT 
    '🔑 AUTHENTICATION & AUTHORIZATION' as category,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') 
        THEN '✅ SUPABASE AUTH ACTIVE'
        ELSE '❌ NO AUTH SYSTEM'
    END as auth_system,
    COUNT(CASE WHEN policyname ILIKE '%auth%' OR policyname ILIKE '%uid%' THEN 1 END) as auth_policies,
    CASE 
        WHEN COUNT(CASE WHEN policyname ILIKE '%auth%' OR policyname ILIKE '%uid%' THEN 1 END) >= 10 
        THEN '✅ STRONG AUTH COVERAGE'
        WHEN COUNT(CASE WHEN policyname ILIKE '%auth%' OR policyname ILIKE '%uid%' THEN 1 END) >= 5 
        THEN '⚠️ MODERATE AUTH COVERAGE'
        ELSE '❌ WEAK AUTH COVERAGE'
    END as auth_verdict
FROM pg_policies 
WHERE schemaname = 'public';

-- Security Functions Status
SELECT 
    '⚙️ SECURITY FUNCTIONS' as category,
    routine_name as function_name,
    CASE WHEN routine_definition LIKE '%SECURITY DEFINER%' THEN '✅ SECURE DEFINER' ELSE '⚠️ NOT DEFINER' END as definer_status,
    CASE WHEN routine_definition LIKE '%SET search_path%' THEN '✅ SAFE SEARCH_PATH' ELSE '⚠️ UNSAFE PATH' END as path_status,
    '✅ FUNCTION EXISTS' as existence_status
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('get_user_tenant_ids', 'user_has_tenant_access', 'migrate_existing_tenant_memberships')
ORDER BY routine_name;

-- Tenant Isolation Status
SELECT 
    '🏢 TENANT ISOLATION VERIFICATION' as category,
    t.table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies p 
            WHERE p.tablename = t.table_name 
            AND p.schemaname = 'public'
            AND (p.policyname ILIKE '%tenant%' OR p.policyname ILIKE '%organization%' OR p.policyname ILIKE '%user%')
        ) THEN '✅ TENANT ISOLATED'
        ELSE '❌ NOT ISOLATED'
    END as isolation_status,
    COALESCE((
        SELECT COUNT(*) FROM pg_policies p 
        WHERE p.tablename = t.table_name 
        AND p.schemaname = 'public'
    ), 0) as total_policies
FROM information_schema.tables t
WHERE t.table_schema = 'public'
AND t.table_name IN (
    'organizations', 'users', 'leads', 'deals', 'contacts', 'appointments',
    'notifications', 'activities', 'campaigns'
)
ORDER BY t.table_name;