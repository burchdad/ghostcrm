-- =====================================================
-- ENTERPRISE-GRADE SECURITY FIX: Bulletproof JWT-based tenant isolation
-- This addresses ChatGPT's 3 critical security gaps for enterprise deployment
-- =====================================================

-- 1. Create tenant_memberships table for proper user-tenant relationships
CREATE TABLE IF NOT EXISTS tenant_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    tenant_id UUID,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one membership per user per tenant
    UNIQUE(user_id, tenant_id)
);

-- Add foreign key constraints safely if tables exist
DO $$
BEGIN
    -- Add user_id foreign key to auth.users if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'tenant_memberships_user_id_fkey' 
                      AND table_name = 'tenant_memberships') THEN
            ALTER TABLE tenant_memberships 
            ADD CONSTRAINT tenant_memberships_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Add tenant_id foreign key to organizations if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'tenant_memberships_tenant_id_fkey' 
                      AND table_name = 'tenant_memberships') THEN
            ALTER TABLE tenant_memberships 
            ADD CONSTRAINT tenant_memberships_tenant_id_fkey 
            FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Enable RLS on tenant_memberships
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;

-- 🔧 CRITICAL FIX A: Explicit tenant_memberships policies (not FOR ALL)
-- Users can only see their own memberships
CREATE POLICY "Users can view their own memberships"
    ON tenant_memberships FOR SELECT
    USING (user_id = auth.uid());

-- Service role policies with explicit semantics
CREATE POLICY "Service role can insert memberships"
    ON tenant_memberships FOR INSERT 
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update memberships"
    ON tenant_memberships FOR UPDATE 
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can delete memberships"
    ON tenant_memberships FOR DELETE
    USING (auth.role() = 'service_role');

-- 2. 🔧 CRITICAL FIX A: SECURITY DEFINER functions with safe search_path
CREATE OR REPLACE FUNCTION get_user_tenant_ids()
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $$
DECLARE
    tenant_ids UUID[];
    jwt_tenant_id UUID;
BEGIN
    -- First try to get from JWT custom claims (preferred method)
    BEGIN
        jwt_tenant_id := (auth.jwt() ->> 'tenant_id')::UUID;
        IF jwt_tenant_id IS NOT NULL THEN
            RETURN ARRAY[jwt_tenant_id];
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- JWT claim doesn't exist or invalid, continue to membership lookup
    END;
    
    -- Fallback to membership table lookup
    SELECT ARRAY_AGG(tenant_id) INTO tenant_ids
    FROM tenant_memberships
    WHERE user_id = auth.uid();
    
    RETURN COALESCE(tenant_ids, ARRAY[]::UUID[]);
END;
$$;

-- 3. 🔧 CRITICAL FIX A: Secure tenant isolation policy helper with safe search_path
CREATE OR REPLACE FUNCTION user_has_tenant_access(tenant_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $$
BEGIN
    RETURN tenant_uuid = ANY(get_user_tenant_ids());
END;
$$;

-- 4. Update organizations table RLS (if exists and not already secure)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
        DROP POLICY IF EXISTS "Users can view organizations" ON organizations;
        CREATE POLICY "Users can view their tenant organizations"
            ON organizations FOR SELECT
            USING (id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can update organizations" ON organizations;
        CREATE POLICY "Users can update their tenant organizations"
            ON organizations FOR UPDATE
            USING (id = ANY(get_user_tenant_ids()));
    END IF;
END $$;

-- 5. Update users table RLS for proper tenant isolation (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        DROP POLICY IF EXISTS "Users can view users" ON users;
        CREATE POLICY "Users can view users in their tenant"
            ON users FOR SELECT
            USING (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can update users" ON users;
        CREATE POLICY "Users can update users in their tenant"
            ON users FOR UPDATE
            USING (organization_id = ANY(get_user_tenant_ids()));
    END IF;
END $$;

-- 6. Secure leads table with proper tenant isolation (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
        ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view leads" ON leads;
        CREATE POLICY "Users can view leads in their tenant"
            ON leads FOR SELECT
            USING (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can insert leads" ON leads;
        CREATE POLICY "Users can insert leads in their tenant"
            ON leads FOR INSERT
            WITH CHECK (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can update leads" ON leads;
        CREATE POLICY "Users can update leads in their tenant"
            ON leads FOR UPDATE
            USING (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can delete leads" ON leads;
        CREATE POLICY "Users can delete leads in their tenant"
            ON leads FOR DELETE
            USING (organization_id = ANY(get_user_tenant_ids()));
    END IF;
END $$;

-- 7. Secure deals table with proper tenant isolation (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') THEN
        ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view deals" ON deals;
        CREATE POLICY "Users can view deals in their tenant"
            ON deals FOR SELECT
            USING (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can insert deals" ON deals;
        CREATE POLICY "Users can insert deals in their tenant"
            ON deals FOR INSERT
            WITH CHECK (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can update deals" ON deals;
        CREATE POLICY "Users can update deals in their tenant"
            ON deals FOR UPDATE
            USING (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can delete deals" ON deals;
        CREATE POLICY "Users can delete deals in their tenant"
            ON deals FOR DELETE
            USING (organization_id = ANY(get_user_tenant_ids()));
    END IF;
END $$;

-- 8. 🔧 CRITICAL FIX C: Add missing billing/provisioning table RLS
-- Secure subscriptions table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view subscriptions" ON subscriptions;
        CREATE POLICY "Users can view subscriptions in their tenant"
            ON subscriptions FOR SELECT
            USING (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
        CREATE POLICY "Service role can manage subscriptions"
            ON subscriptions FOR ALL
            USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Secure tenant_subscriptions table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_subscriptions') THEN
        ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view tenant_subscriptions" ON tenant_subscriptions;
        CREATE POLICY "Users can view tenant_subscriptions in their tenant"
            ON tenant_subscriptions FOR SELECT
            USING (tenant_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Service role can manage tenant_subscriptions" ON tenant_subscriptions;
        CREATE POLICY "Service role can manage tenant_subscriptions"
            ON tenant_subscriptions FOR ALL
            USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Secure tenant_features table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_features') THEN
        ALTER TABLE tenant_features ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view tenant_features" ON tenant_features;
        CREATE POLICY "Users can view tenant_features in their tenant"
            ON tenant_features FOR SELECT
            USING (tenant_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Service role can manage tenant_features" ON tenant_features;
        CREATE POLICY "Service role can manage tenant_features"
            ON tenant_features FOR ALL
            USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Secure billing_events table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing_events') THEN
        ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view billing_events" ON billing_events;
        CREATE POLICY "Users can view billing_events in their tenant"
            ON billing_events FOR SELECT
            USING (tenant_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Service role can manage billing_events" ON billing_events;
        CREATE POLICY "Service role can manage billing_events"
            ON billing_events FOR ALL
            USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Secure subdomains table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subdomains') THEN
        ALTER TABLE subdomains ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view subdomains" ON subdomains;
        CREATE POLICY "Users can view subdomains in their tenant"
            ON subdomains FOR SELECT
            USING (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Service role can manage subdomains" ON subdomains;
        CREATE POLICY "Service role can manage subdomains"
            ON subdomains FOR ALL
            USING (auth.role() = 'service_role');
    END IF;
END $$;

-- 9. Secure contacts table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts') THEN
        ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view contacts" ON contacts;
        CREATE POLICY "Users can view contacts in their tenant"
            ON contacts FOR SELECT
            USING (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can insert contacts" ON contacts;
        CREATE POLICY "Users can insert contacts in their tenant"
            ON contacts FOR INSERT
            WITH CHECK (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can update contacts" ON contacts;
        CREATE POLICY "Users can update contacts in their tenant"
            ON contacts FOR UPDATE
            USING (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can delete contacts" ON contacts;
        CREATE POLICY "Users can delete contacts in their tenant"
            ON contacts FOR DELETE
            USING (organization_id = ANY(get_user_tenant_ids()));
    END IF;
END $$;

-- 10. Secure activities table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activities') THEN
        ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view activities" ON activities;
        CREATE POLICY "Users can view activities in their tenant"
            ON activities FOR SELECT
            USING (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can insert activities" ON activities;
        CREATE POLICY "Users can insert activities in their tenant"
            ON activities FOR INSERT
            WITH CHECK (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can update activities" ON activities;
        CREATE POLICY "Users can update activities in their tenant"
            ON activities FOR UPDATE
            USING (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can delete activities" ON activities;
        CREATE POLICY "Users can delete activities in their tenant"
            ON activities FOR DELETE
            USING (organization_id = ANY(get_user_tenant_ids()));
    END IF;
END $$;

-- 11. Secure appointments table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view appointments" ON appointments;
        CREATE POLICY "Users can view appointments in their tenant"
            ON appointments FOR SELECT
            USING (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can insert appointments" ON appointments;
        CREATE POLICY "Users can insert appointments in their tenant"
            ON appointments FOR INSERT
            WITH CHECK (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can update appointments" ON appointments;
        CREATE POLICY "Users can update appointments in their tenant"
            ON appointments FOR UPDATE
            USING (organization_id = ANY(get_user_tenant_ids()));

        DROP POLICY IF EXISTS "Users can delete appointments" ON appointments;
        CREATE POLICY "Users can delete appointments in their tenant"
            ON appointments FOR DELETE
            USING (organization_id = ANY(get_user_tenant_ids()));
    END IF;
END $$;

-- 12. Update existing collaboration table policies to use new method (if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collab_notifications') THEN
        -- Check if table has organization_id column (should be the case)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collab_notifications' AND column_name = 'organization_id') THEN
            DROP POLICY IF EXISTS "Users can view collab_notifications" ON collab_notifications;
            CREATE POLICY "Users can view collab_notifications in their tenant"
                ON collab_notifications FOR SELECT
                USING (organization_id = ANY(get_user_tenant_ids()));

            DROP POLICY IF EXISTS "Users can insert collab_notifications" ON collab_notifications;
            CREATE POLICY "Users can insert collab_notifications in their tenant"
                ON collab_notifications FOR INSERT
                WITH CHECK (organization_id = ANY(get_user_tenant_ids()));
        END IF;
    END IF;
END $$;

-- Note: collab_permissions table doesn't exist in base schema, skipping
-- If it gets added later, use this pattern:
/*
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collab_permissions') THEN
        -- Check column exists before using it
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collab_permissions' AND column_name = 'organization_id') THEN
            DROP POLICY IF EXISTS "Users can view collab_permissions" ON collab_permissions;
            CREATE POLICY "Users can view collab_permissions in their tenant"
                ON collab_permissions FOR SELECT
                USING (organization_id = ANY(get_user_tenant_ids()));

            DROP POLICY IF EXISTS "Users can manage collab_permissions" ON collab_permissions;
            CREATE POLICY "Users can manage collab_permissions in their tenant"
                ON collab_permissions FOR ALL
                USING (organization_id = ANY(get_user_tenant_ids()));
        END IF;
    END IF;
END $$;
*/

-- 13. Create secure function to populate tenant memberships from existing data
CREATE OR REPLACE FUNCTION migrate_existing_tenant_memberships()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    membership_count INTEGER := 0;
BEGIN
    -- Only insert memberships for users that exist in both public.users and auth.users
    INSERT INTO tenant_memberships (user_id, tenant_id, role, created_at)
    SELECT 
        u.id as user_id,
        u.organization_id as tenant_id,
        CASE 
            WHEN u.role = 'owner' THEN 'owner'
            WHEN u.role = 'admin' THEN 'admin'
            ELSE 'member'
        END as role,
        u.created_at
    FROM users u
    INNER JOIN auth.users au ON u.id = au.id  -- Only users that exist in auth.users
    WHERE u.organization_id IS NOT NULL
    ON CONFLICT (user_id, tenant_id) DO UPDATE SET
        role = EXCLUDED.role,
        updated_at = NOW();
    
    GET DIAGNOSTICS membership_count = ROW_COUNT;
    
    RETURN membership_count;
EXCEPTION
    WHEN OTHERS THEN
        -- If auth.users doesn't exist or other errors, return 0
        RETURN 0;
END;
$$;

-- Run the migration (only if both users and auth.users tables exist)
DO $$
DECLARE
    migration_result INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'auth') THEN
        
        SELECT migrate_existing_tenant_memberships() INTO migration_result;
        RAISE NOTICE 'Migrated % tenant memberships from users table', migration_result;
    ELSE
        RAISE NOTICE 'Users tables not found or incomplete - skipping tenant membership migration';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during tenant membership migration: %. Continuing...', SQLERRM;
END $$;

-- 14. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user_id ON tenant_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_tenant_id ON tenant_memberships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user_tenant ON tenant_memberships(user_id, tenant_id);

-- 15. Create trigger to keep tenant_memberships updated when user organizations change
CREATE OR REPLACE FUNCTION sync_user_tenant_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Handle organization changes
    IF TG_OP = 'UPDATE' AND OLD.organization_id IS DISTINCT FROM NEW.organization_id THEN
        -- Remove old membership if exists
        DELETE FROM tenant_memberships 
        WHERE user_id = NEW.id AND tenant_id = OLD.organization_id;
        
        -- Add new membership if organization_id is not null
        IF NEW.organization_id IS NOT NULL THEN
            INSERT INTO tenant_memberships (user_id, tenant_id, role)
            VALUES (NEW.id, NEW.organization_id, COALESCE(NEW.role, 'member'))
            ON CONFLICT (user_id, tenant_id) DO UPDATE SET
                role = EXCLUDED.role,
                updated_at = NOW();
        END IF;
    END IF;
    
    -- Handle new user creation
    IF TG_OP = 'INSERT' AND NEW.organization_id IS NOT NULL THEN
        INSERT INTO tenant_memberships (user_id, tenant_id, role)
        VALUES (NEW.id, NEW.organization_id, COALESCE(NEW.role, 'member'))
        ON CONFLICT (user_id, tenant_id) DO NOTHING;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger (only if users table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        DROP TRIGGER IF EXISTS trigger_sync_user_tenant_membership ON users;
        CREATE TRIGGER trigger_sync_user_tenant_membership
            AFTER INSERT OR UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION sync_user_tenant_membership();
        RAISE NOTICE 'Created user tenant membership sync trigger';
    ELSE
        RAISE NOTICE 'Users table not found - skipping trigger creation';
    END IF;
END $$;

-- 16. Add comments for documentation
COMMENT ON TABLE tenant_memberships IS 'Enterprise-grade tenant isolation table - replaces vulnerable session variable approach';
COMMENT ON FUNCTION get_user_tenant_ids() IS 'SECURITY DEFINER function with safe search_path - returns tenant IDs user has access to';
COMMENT ON FUNCTION user_has_tenant_access(UUID) IS 'SECURITY DEFINER function with safe search_path - checks tenant access';

-- 17. Security validation functions for testing
CREATE OR REPLACE FUNCTION validate_tenant_isolation()
RETURNS TABLE(test_name TEXT, status TEXT, details TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Test 1: Verify RLS is enabled on core tables
    RETURN QUERY
    SELECT 
        'rls_enabled_' || t.table_name::TEXT,
        CASE WHEN t.row_security THEN 'PASS' ELSE 'FAIL' END,
        'RLS ' || CASE WHEN t.row_security THEN 'enabled' ELSE 'disabled' END || ' on ' || t.table_name
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' 
    AND t.table_name IN ('leads', 'deals', 'users', 'organizations', 'tenant_memberships');
    
    -- Test 2: Verify policies exist
    RETURN QUERY
    SELECT 
        'policies_exist_' || p.tablename::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END,
        'Found ' || COUNT(*)::TEXT || ' policies on ' || p.tablename
    FROM information_schema.policies p
    WHERE p.schemaname = 'public'
    AND p.tablename IN ('leads', 'deals', 'users', 'organizations', 'tenant_memberships')
    GROUP BY p.tablename;
    
    RETURN;
END;
$$;