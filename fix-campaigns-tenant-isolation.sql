-- =====================================================
-- 🔧 FIX CAMPAIGNS TABLE TENANT ISOLATION
-- This adds missing RLS policies for the campaigns table
-- =====================================================

-- Enable RLS on campaigns table (if not already enabled)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- 1. SELECT Policy - Users can only see campaigns from their tenants
DROP POLICY IF EXISTS "campaigns_tenant_isolation_select" ON campaigns;
CREATE POLICY "campaigns_tenant_isolation_select" ON campaigns
    FOR SELECT USING (
        organization_id = ANY(get_user_tenant_ids())
    );

-- 2. INSERT Policy - Users can only create campaigns for their tenants
DROP POLICY IF EXISTS "campaigns_tenant_isolation_insert" ON campaigns;
CREATE POLICY "campaigns_tenant_isolation_insert" ON campaigns
    FOR INSERT WITH CHECK (
        organization_id = ANY(get_user_tenant_ids())
    );

-- 3. UPDATE Policy - Users can only update campaigns from their tenants
DROP POLICY IF EXISTS "campaigns_tenant_isolation_update" ON campaigns;
CREATE POLICY "campaigns_tenant_isolation_update" ON campaigns
    FOR UPDATE USING (
        organization_id = ANY(get_user_tenant_ids())
    ) WITH CHECK (
        organization_id = ANY(get_user_tenant_ids())
    );

-- 4. DELETE Policy - Users can only delete campaigns from their tenants
DROP POLICY IF EXISTS "campaigns_tenant_isolation_delete" ON campaigns;
CREATE POLICY "campaigns_tenant_isolation_delete" ON campaigns
    FOR DELETE USING (
        organization_id = ANY(get_user_tenant_ids())
    );

-- 5. Service Role Policy - Full access for service role
DROP POLICY IF EXISTS "campaigns_service_role_access" ON campaigns;
CREATE POLICY "campaigns_service_role_access" ON campaigns
    FOR ALL USING (
        auth.role() = 'service_role'
    ) WITH CHECK (
        auth.role() = 'service_role'
    );

-- Verification: Check that campaigns table now has proper tenant isolation
DO $$
BEGIN
    RAISE NOTICE '✅ Campaigns table RLS policies have been created!';
    RAISE NOTICE 'Verifying campaigns table security...';
    
    -- Count policies for campaigns table
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'campaigns' 
        AND schemaname = 'public'
        AND (policyname ILIKE '%tenant%' OR policyname ILIKE '%organization%')
    ) THEN
        RAISE NOTICE '✅ Campaigns table now has tenant isolation policies';
    ELSE
        RAISE NOTICE '❌ Campaigns table still missing tenant isolation';
    END IF;
END $$;