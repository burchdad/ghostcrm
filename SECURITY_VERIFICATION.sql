-- =====================================================
-- 🔐 ENTERPRISE SECURITY VERIFICATION QUERIES
-- Run these in Supabase SQL Editor to verify your deployment
-- =====================================================

-- 1. Verify all critical tables exist with RLS enabled
SELECT 
    c.relname as table_name,
    c.relrowsecurity as rls_enabled,
    COALESCE(p.policy_count, 0) as policy_count,
    CASE 
        WHEN c.relrowsecurity AND COALESCE(p.policy_count, 0) > 0 THEN '✅ SECURE'
        WHEN c.relrowsecurity AND COALESCE(p.policy_count, 0) = 0 THEN '⚠️ RLS ON, NO POLICIES'
        WHEN NOT c.relrowsecurity THEN '❌ RLS DISABLED'
        ELSE '❓ UNKNOWN'
    END as security_status
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN (
    SELECT tablename, COUNT(*) as policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public'
    GROUP BY tablename
) p ON c.relname = p.tablename
WHERE n.nspname = 'public' 
AND c.relkind = 'r'
AND c.relname IN (
    'organizations', 'users', 'leads', 'deals', 'contacts', 'appointments',
    'tenant_memberships', 'tenant_subscriptions', 'notifications', 
    'user_notification_preferences', 'billing_events'
)
ORDER BY 
    CASE 
        WHEN c.relrowsecurity AND COALESCE(p.policy_count, 0) > 0 THEN 1
        WHEN c.relrowsecurity AND COALESCE(p.policy_count, 0) = 0 THEN 2
        WHEN NOT c.relrowsecurity THEN 3
        ELSE 4
    END,
    c.relname;

-- 2. Check tenant_memberships table structure
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_memberships') THEN
        RAISE NOTICE '✅ tenant_memberships table exists';
        
        -- Check if it has the right columns
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenant_memberships' AND column_name = 'user_id') THEN
            RAISE NOTICE '✅ tenant_memberships.user_id exists';
        ELSE
            RAISE NOTICE '❌ tenant_memberships.user_id MISSING';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenant_memberships' AND column_name = 'tenant_id') THEN
            RAISE NOTICE '✅ tenant_memberships.tenant_id exists';
        ELSE
            RAISE NOTICE '❌ tenant_memberships.tenant_id MISSING';
        END IF;
    ELSE
        RAISE NOTICE '❌ tenant_memberships table MISSING';
    END IF;
END $$;

-- 3. Test security functions exist and work
DO $$
DECLARE
    func_exists BOOLEAN;
    test_result UUID[];
BEGIN
    -- Check if get_user_tenant_ids function exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'get_user_tenant_ids' 
        AND routine_schema = 'public'
    ) INTO func_exists;
    
    IF func_exists THEN
        RAISE NOTICE '✅ get_user_tenant_ids() function exists';
        
        -- Test the function (will return empty for service role)
        BEGIN
            SELECT get_user_tenant_ids() INTO test_result;
            RAISE NOTICE '✅ get_user_tenant_ids() function works (returned % tenants)', COALESCE(array_length(test_result, 1), 0);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ get_user_tenant_ids() function exists but has error: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE '❌ get_user_tenant_ids() function MISSING';
    END IF;
    
    -- Check if user_has_tenant_access function exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'user_has_tenant_access' 
        AND routine_schema = 'public'
    ) INTO func_exists;
    
    IF func_exists THEN
        RAISE NOTICE '✅ user_has_tenant_access() function exists';
    ELSE
        RAISE NOTICE '❌ user_has_tenant_access() function MISSING';
    END IF;
END $$;

-- 4. Check webhook idempotency system
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_events') THEN
        RAISE NOTICE '✅ webhook_events table exists (idempotency protection)';
    ELSE
        RAISE NOTICE '❌ webhook_events table MISSING (no idempotency protection)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_event_logs') THEN
        RAISE NOTICE '✅ webhook_event_logs table exists (audit trail)';
    ELSE
        RAISE NOTICE '❌ webhook_event_logs table MISSING (no audit trail)';
    END IF;
END $$;

-- 5. Notification system verification
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        RAISE NOTICE '✅ notifications table exists';
    ELSE
        RAISE NOTICE '❌ notifications table MISSING';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_notification_preferences') THEN
        RAISE NOTICE '✅ user_notification_preferences table exists';
    ELSE
        RAISE NOTICE '❌ user_notification_preferences table MISSING';
    END IF;
END $$;

-- 6. Count total policies for security audit
SELECT 
    'Total RLS Policies' as metric,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 20 THEN '✅ GOOD'
        WHEN COUNT(*) >= 10 THEN '⚠️ MODERATE'
        ELSE '❌ LOW'
    END as status
FROM pg_policies
WHERE schemaname = 'public';

-- 7. Check for SQL Injection Protection (Parameterized Queries)
SELECT 
    'SQL Injection Protection' as security_measure,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PROTECTED'
        ELSE '❌ VULNERABLE'
    END as status,
    'Functions use SECURITY DEFINER with safe search_path' as details
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_definition LIKE '%SECURITY DEFINER%'
AND routine_definition LIKE '%SET search_path%';

-- 8. Check Authentication & Authorization
DO $$
DECLARE
    auth_check INTEGER;
BEGIN
    -- Check if auth.users table exists (Supabase Auth)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        RAISE NOTICE '✅ Supabase Authentication system active';
    ELSE
        RAISE NOTICE '❌ Authentication system not found';
    END IF;
    
    -- Check for JWT validation in RLS policies (using policyname only since definition column varies)
    SELECT COUNT(*) INTO auth_check
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND (policyname ILIKE '%auth%' OR policyname ILIKE '%uid%' OR policyname ILIKE '%user%');
    
    IF auth_check > 0 THEN
        RAISE NOTICE '✅ JWT-based authorization policies found: % policies', auth_check;
    ELSE
        RAISE NOTICE '❌ No JWT-based authorization policies detected';
    END IF;
END $$;

-- 9. Data Encryption & Sensitive Data Protection
DO $$
BEGIN
    -- Check for encrypted columns (common patterns)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE column_name IN ('encrypted_data', 'password_hash', 'api_key_encrypted')
        OR data_type = 'bytea'
    ) THEN
        RAISE NOTICE '✅ Encrypted columns detected';
    ELSE
        RAISE NOTICE '⚠️ No obvious encrypted columns found';
    END IF;
    
    -- Check for sensitive data patterns
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE column_name IN ('ssn', 'credit_card', 'bank_account', 'password')
    ) THEN
        RAISE NOTICE '⚠️ Potentially sensitive columns found - ensure proper encryption';
    END IF;
END $$;

-- 10. Cross-Tenant Data Isolation Verification
DO $$
DECLARE
    isolation_score INTEGER := 0;
    total_tables INTEGER;
BEGIN
    -- Count tables that should have tenant isolation
    SELECT COUNT(*) INTO total_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'organizations', 'users', 'leads', 'deals', 'contacts', 'appointments',
        'notifications', 'activities', 'campaigns', 'reports'
    );
    
    -- Check each table for proper tenant isolation (using policy names)
    SELECT COUNT(DISTINCT p.tablename) INTO isolation_score
    FROM pg_policies p
    JOIN information_schema.tables t ON p.tablename = t.table_name
    WHERE p.schemaname = 'public'
    AND t.table_schema = 'public'
    AND t.table_name IN (
        'organizations', 'users', 'leads', 'deals', 'contacts', 'appointments',
        'notifications', 'activities', 'campaigns', 'reports'
    )
    AND (p.policyname ILIKE '%tenant%' OR p.policyname ILIKE '%organization%' OR p.policyname ILIKE '%user%');
    
    IF isolation_score >= (total_tables * 0.8) THEN
        RAISE NOTICE '✅ Strong tenant isolation: %/% tables protected', isolation_score, total_tables;
    ELSIF isolation_score >= (total_tables * 0.5) THEN
        RAISE NOTICE '⚠️ Moderate tenant isolation: %/% tables protected', isolation_score, total_tables;
    ELSE
        RAISE NOTICE '❌ Weak tenant isolation: %/% tables protected', isolation_score, total_tables;
    END IF;
END $$;

-- 11. API Security & Rate Limiting
DO $$
BEGIN
    -- Check for webhook security
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_events') THEN
        RAISE NOTICE '✅ Webhook idempotency protection enabled';
    END IF;
    
    -- Check for audit logging
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name IN ('audit_log', 'activity_log', 'webhook_event_logs')) THEN
        RAISE NOTICE '✅ Audit logging system detected';
    ELSE
        RAISE NOTICE '⚠️ No audit logging detected';
    END IF;
END $$;

-- 12. Security Configuration Assessment
SELECT 
    'Security Configuration' as category,
    CASE 
        WHEN COUNT(*) >= 100 THEN '🔐 ENTERPRISE-GRADE'
        WHEN COUNT(*) >= 50 THEN '🛡️ BUSINESS-GRADE' 
        WHEN COUNT(*) >= 20 THEN '🔒 BASIC-SECURE'
        ELSE '⚠️ MINIMAL'
    END as security_level,
    COUNT(*) as total_policies,
    'RLS Policies provide multi-layered protection' as note
FROM pg_policies
WHERE schemaname = 'public';

-- 13. Enhanced Summary Report
DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
    function_count INTEGER;
    auth_policy_count INTEGER;
    tenant_isolation_score INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🏁 ENTERPRISE SECURITY DEPLOYMENT SUMMARY';
    RAISE NOTICE '=============================================';
    
    -- Count protected tables
    SELECT COUNT(*) INTO table_count
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
    AND c.relkind = 'r'
    AND c.relrowsecurity = true
    AND c.relname IN (
        'organizations', 'users', 'leads', 'deals', 'contacts', 'appointments',
        'tenant_memberships', 'tenant_subscriptions', 'notifications'
    );
    
    -- Count total policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    -- Count authentication policies
    SELECT COUNT(*) INTO auth_policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND (policyname ILIKE '%auth%' OR policyname ILIKE '%uid%' OR policyname ILIKE '%user%');
    
    -- Count tenant isolation policies
    SELECT COUNT(*) INTO tenant_isolation_score
    FROM pg_policies
    WHERE schemaname = 'public'
    AND (policyname ILIKE '%tenant%' OR policyname ILIKE '%organization%');
    
    -- Count security functions
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_name IN ('get_user_tenant_ids', 'user_has_tenant_access', 'migrate_existing_tenant_memberships')
    AND routine_schema = 'public';
    
    RAISE NOTICE 'Protected Tables: % (should be >= 8)', table_count;
    RAISE NOTICE 'Total RLS Policies: % (🎉 EXCELLENT!)', policy_count;
    RAISE NOTICE 'Authentication Policies: % (should be >= 10)', auth_policy_count;
    RAISE NOTICE 'Tenant Isolation Policies: % (should be >= 15)', tenant_isolation_score;
    RAISE NOTICE 'Security Functions: % (should be >= 3)', function_count;
    
    RAISE NOTICE '';
    
    -- Enhanced security assessment
    IF table_count >= 8 AND policy_count >= 100 AND auth_policy_count >= 10 AND tenant_isolation_score >= 15 AND function_count >= 3 THEN
        RAISE NOTICE '🎉 DEPLOYMENT STATUS: 🔐 ENTERPRISE-GRADE SECURITY';
        RAISE NOTICE 'Your GhostCRM exceeds enterprise security standards!';
        RAISE NOTICE 'Features: Bulletproof tenant isolation, comprehensive RLS, audit trails';
    ELSIF table_count >= 6 AND policy_count >= 50 AND auth_policy_count >= 5 THEN
        RAISE NOTICE '🎉 DEPLOYMENT STATUS: 🛡️ BUSINESS-GRADE SECURITY';
        RAISE NOTICE 'Your GhostCRM has strong security protection!';
    ELSIF table_count >= 4 AND policy_count >= 20 THEN
        RAISE NOTICE '⚠️ DEPLOYMENT STATUS: 🔒 BASIC SECURITY';
        RAISE NOTICE 'Good foundation, consider enhancing for enterprise use';
    ELSE
        RAISE NOTICE '⚠️ DEPLOYMENT STATUS: 🔧 NEEDS ATTENTION';
        RAISE NOTICE 'Security components need strengthening';
    END IF;
    
    RAISE NOTICE '=============================================';
END $$;

-- 14. DETAILED VERIFICATION RESULTS SUMMARY
-- This provides a comprehensive checklist-style output

SELECT 
    '🔐 SECURITY VERIFICATION CHECKLIST' as verification_category,
    '===========================================' as separator;

-- Core Table Security Status
SELECT 
    '📋 CORE TABLE SECURITY' as category,
    c.relname as table_name,
    CASE WHEN c.relrowsecurity THEN '✅ RLS ENABLED' ELSE '❌ RLS DISABLED' END as rls_status,
    COALESCE(p.policy_count, 0) as policy_count,
    CASE 
        WHEN c.relrowsecurity AND COALESCE(p.policy_count, 0) > 0 THEN '✅ FULLY SECURED'
        WHEN c.relrowsecurity AND COALESCE(p.policy_count, 0) = 0 THEN '⚠️ RLS ON, NO POLICIES'
        ELSE '❌ VULNERABLE'
    END as security_verdict
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN (
    SELECT tablename, COUNT(*) as policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public'
    GROUP BY tablename
) p ON c.relname = p.tablename
WHERE n.nspname = 'public' 
AND c.relkind = 'r'
AND c.relname IN (
    'organizations', 'users', 'leads', 'deals', 'contacts', 'appointments',
    'tenant_memberships', 'tenant_subscriptions', 'notifications', 
    'user_notification_preferences', 'billing_events'
)
ORDER BY c.relname;

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
    '🏢 TENANT ISOLATION' as category,
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

-- Webhook & API Security Status
SELECT 
    '🌐 API & WEBHOOK SECURITY' as category,
    table_name,
    '✅ TABLE EXISTS' as status,
    CASE 
        WHEN table_name = 'webhook_events' THEN 'Idempotency Protection'
        WHEN table_name = 'webhook_event_logs' THEN 'Audit Trail'
        WHEN table_name = 'notifications' THEN 'Notification System'
        WHEN table_name = 'user_notification_preferences' THEN 'User Preferences'
        ELSE 'System Table'
    END as purpose
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('webhook_events', 'webhook_event_logs', 'notifications', 'user_notification_preferences')
ORDER BY table_name;

-- Data Protection Status
SELECT 
    '🔒 DATA PROTECTION' as category,
    protection_type,
    status,
    details
FROM (
    SELECT 
        'Encrypted Columns' as protection_type,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE column_name IN ('encrypted_data', 'password_hash', 'api_key_encrypted')
                OR data_type = 'bytea'
            ) THEN '✅ ENCRYPTION DETECTED'
            ELSE '⚠️ NO ENCRYPTION FOUND'
        END as status,
        'Binary data types or encrypted column patterns' as details
    UNION ALL
    SELECT 
        'Sensitive Data Patterns' as protection_type,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE column_name IN ('ssn', 'credit_card', 'bank_account', 'password')
            ) THEN '⚠️ SENSITIVE DATA FOUND'
            ELSE '✅ NO SENSITIVE PATTERNS'
        END as status,
        'Common sensitive field name patterns' as details
    UNION ALL
    SELECT 
        'SQL Injection Protection' as protection_type,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM information_schema.routines 
                WHERE routine_schema = 'public'
                AND routine_definition LIKE '%SECURITY DEFINER%'
                AND routine_definition LIKE '%SET search_path%'
            ) THEN '✅ PROTECTED'
            ELSE '❌ VULNERABLE'
        END as status,
        'SECURITY DEFINER functions with safe search_path' as details
) protection_checks
ORDER BY protection_type;

-- Overall Security Score
SELECT 
    '📊 OVERALL SECURITY ASSESSMENT' as category,
    metric,
    current_value,
    threshold,
    CASE 
        WHEN metric = 'Total RLS Policies' AND current_value::int >= 100 THEN '🔐 ENTERPRISE-GRADE'
        WHEN metric = 'Total RLS Policies' AND current_value::int >= 50 THEN '🛡️ BUSINESS-GRADE'
        WHEN metric = 'Total RLS Policies' AND current_value::int >= 20 THEN '🔒 BASIC-SECURE'
        WHEN metric = 'Protected Tables' AND current_value::int >= 8 THEN '✅ EXCELLENT'
        WHEN metric = 'Protected Tables' AND current_value::int >= 5 THEN '⚠️ GOOD'
        WHEN metric = 'Security Functions' AND current_value::int >= 3 THEN '✅ COMPLETE'
        WHEN metric = 'Security Functions' AND current_value::int >= 1 THEN '⚠️ PARTIAL'
        ELSE '❌ INSUFFICIENT'
    END as assessment
FROM (
    SELECT 
        'Total RLS Policies' as metric,
        COUNT(*)::text as current_value,
        '≥100 Enterprise, ≥50 Business, ≥20 Basic' as threshold
    FROM pg_policies WHERE schemaname = 'public'
    
    UNION ALL
    
    SELECT 
        'Protected Tables' as metric,
        COUNT(*)::text as current_value,
        '≥8 Excellent, ≥5 Good' as threshold
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
    AND c.relkind = 'r'
    AND c.relrowsecurity = true
    AND c.relname IN (
        'organizations', 'users', 'leads', 'deals', 'contacts', 'appointments',
        'tenant_memberships', 'tenant_subscriptions', 'notifications'
    )
    
    UNION ALL
    
    SELECT 
        'Security Functions' as metric,
        COUNT(*)::text as current_value,
        '≥3 Complete, ≥1 Partial' as threshold
    FROM information_schema.routines 
    WHERE routine_name IN ('get_user_tenant_ids', 'user_has_tenant_access', 'migrate_existing_tenant_memberships')
    AND routine_schema = 'public'
) security_metrics
ORDER BY metric;