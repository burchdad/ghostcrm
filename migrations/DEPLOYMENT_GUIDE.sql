-- =====================================================
-- DEPLOYMENT READY: Complete GhostCRM Security Setup
-- Run these migrations in exact order for enterprise-grade security
-- =====================================================

-- STEP 1: Ensure all base tables exist first
-- Execute these migrations if not already done:

-- 1.1 Base schema (if not exists)
-- SOURCE: migrations/001_complete_crm_schema.sql
-- Creates: organizations, contacts, leads, appointments, campaigns, etc.

-- 1.2 Missing deals table (if not exists) 
-- SOURCE: migrations/002_add_missing_deals_table.sql
-- Creates: deals table with proper structure

-- 1.3 Users table (if not exists - check if this exists in your setup)
-- May be in auth schema or public schema depending on Supabase setup

-- STEP 2: Deploy webhook idempotency (safe to run anytime)
-- SOURCE: migrations/010_webhook_idempotency.sql

-- STEP 3: Deploy enterprise security (after base tables exist)
-- SOURCE: migrations/009_secure_tenant_isolation_fixed.sql

-- =====================================================
-- VERIFICATION QUERIES - Run these to check readiness
-- =====================================================

-- Check if critical tables exist
DO $$
BEGIN
    RAISE NOTICE 'Checking table existence...';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
        RAISE NOTICE '✅ organizations table exists';
    ELSE
        RAISE NOTICE '❌ organizations table MISSING - run 001_complete_crm_schema.sql first';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
        RAISE NOTICE '✅ leads table exists';
    ELSE
        RAISE NOTICE '❌ leads table MISSING - run 001_complete_crm_schema.sql first';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') THEN
        RAISE NOTICE '✅ deals table exists';
    ELSE
        RAISE NOTICE '❌ deals table MISSING - run 002_add_missing_deals_table.sql first';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE NOTICE '✅ users table exists';
    ELSE
        RAISE NOTICE '⚠️ users table not found in public schema - check auth schema or create it';
    END IF;
END $$;

-- Check current RLS status
SELECT 
    t.table_name,
    t.row_security as rls_enabled,
    COALESCE(p.policy_count, 0) as policies
FROM information_schema.tables t
LEFT JOIN (
    SELECT tablename, COUNT(*) as policy_count 
    FROM information_schema.policies 
    WHERE schemaname = 'public'
    GROUP BY tablename
) p ON t.table_name = p.tablename
WHERE t.table_schema = 'public' 
AND t.table_name IN ('organizations', 'users', 'leads', 'deals', 'contacts', 'appointments')
ORDER BY t.table_name;

-- =====================================================
-- SAFE DEPLOYMENT COMMANDS (copy these to Supabase SQL editor)
-- =====================================================

/*
-- Run these one by one in Supabase SQL Editor:

-- 1. First, run base schema (if needed):
-- Copy and paste: migrations/001_complete_crm_schema.sql

-- 2. Then, add deals table (if needed):
-- Copy and paste: migrations/002_add_missing_deals_table.sql

-- 3. Deploy webhook protection:
-- Copy and paste: migrations/010_webhook_idempotency.sql

-- 4. Finally, deploy enterprise security:
-- Copy and paste: migrations/009_secure_tenant_isolation_fixed.sql

-- 5. Verify deployment:
-- Copy and paste the verification queries above
*/