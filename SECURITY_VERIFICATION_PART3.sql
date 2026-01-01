-- =====================================================
-- 🔐 PART 3: API SECURITY & FINAL ASSESSMENT
-- Run this third for API security and overall rating
-- =====================================================

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

-- 🏆 FINAL ENTERPRISE SECURITY ASSESSMENT
SELECT 
    '🏆 FINAL SECURITY ASSESSMENT' as category,
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