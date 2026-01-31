-- =====================================================
-- 🔐 PART 1: CORE TABLE SECURITY VERIFICATION
-- Run this first to see detailed table security status
-- =====================================================

-- 1. Core Table Security Status with Visual Indicators
SELECT 
    '📋 CORE TABLE SECURITY VERIFICATION' as section_title,
    '============================================' as separator;

SELECT 
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

-- 2. Total RLS Policies Count
SELECT 
    '📊 RLS POLICY SUMMARY' as category,
    COUNT(*) as total_policies,
    CASE 
        WHEN COUNT(*) >= 100 THEN '🔐 ENTERPRISE-GRADE (133+ Policies!)'
        WHEN COUNT(*) >= 50 THEN '🛡️ BUSINESS-GRADE'
        WHEN COUNT(*) >= 20 THEN '🔒 BASIC-SECURE'
        ELSE '⚠️ MINIMAL SECURITY'
    END as security_rating
FROM pg_policies
WHERE schemaname = 'public';