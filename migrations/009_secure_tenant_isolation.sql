-- =====================================================
-- CRITICAL SECURITY FIX: Proper JWT-based tenant isolation
-- This replaces the vulnerable session-variable RLS pattern
-- =====================================================

-- 1. Create tenant_memberships table for proper user-tenant relationships
CREATE TABLE IF NOT EXISTS tenant_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one membership per user per tenant
    UNIQUE(user_id, tenant_id)
);

-- Enable RLS on tenant_memberships
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;

-- Create policy for tenant_memberships - users can only see their own memberships
CREATE POLICY "Users can view their own memberships"
    ON tenant_memberships FOR SELECT
    USING (user_id = auth.uid());

-- Create policy for inserting memberships (admin only via service role)
CREATE POLICY "Service role can manage memberships"
    ON tenant_memberships FOR ALL
    USING (auth.role() = 'service_role');

-- 2. Create helper function to get user's tenant IDs via JWT or memberships
CREATE OR REPLACE FUNCTION get_user_tenant_ids()
RETURNS UUID[] AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create secure tenant isolation policy helper
CREATE OR REPLACE FUNCTION user_has_tenant_access(tenant_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN tenant_uuid = ANY(get_user_tenant_ids());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update organizations table RLS (if not already secure)
DROP POLICY IF EXISTS "Users can view organizations" ON organizations;
CREATE POLICY "Users can view their tenant organizations"
    ON organizations FOR SELECT
    USING (id = ANY(get_user_tenant_ids()));

DROP POLICY IF EXISTS "Users can update organizations" ON organizations;
CREATE POLICY "Users can update their tenant organizations"
    ON organizations FOR UPDATE
    USING (id = ANY(get_user_tenant_ids()));

-- 5. Update users table RLS for proper tenant isolation
DROP POLICY IF EXISTS "Users can view users" ON users;
CREATE POLICY "Users can view users in their tenant"
    ON users FOR SELECT
    USING (organization_id = ANY(get_user_tenant_ids()));

DROP POLICY IF EXISTS "Users can update users" ON users;
CREATE POLICY "Users can update users in their tenant"
    ON users FOR UPDATE
    USING (organization_id = ANY(get_user_tenant_ids()));

-- 6. Secure leads table with proper tenant isolation
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

-- 7. Secure deals table with proper tenant isolation
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

-- 8. Secure contacts table (if exists)
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

-- 9. Secure activities table (if exists)
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

-- 10. Secure appointments table
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

-- 11. Update existing collaboration table policies to use new method
DROP POLICY IF EXISTS "Users can view collab_notifications" ON collab_notifications;
CREATE POLICY "Users can view collab_notifications in their tenant"
    ON collab_notifications FOR SELECT
    USING (tenant_id = ANY(get_user_tenant_ids()));

DROP POLICY IF EXISTS "Users can insert collab_notifications" ON collab_notifications;
CREATE POLICY "Users can insert collab_notifications in their tenant"
    ON collab_notifications FOR INSERT
    WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

-- Repeat for other collab tables
DROP POLICY IF EXISTS "Users can view collab_permissions" ON collab_permissions;
CREATE POLICY "Users can view collab_permissions in their tenant"
    ON collab_permissions FOR SELECT
    USING (tenant_id = ANY(get_user_tenant_ids()));

DROP POLICY IF EXISTS "Users can manage collab_permissions" ON collab_permissions;
CREATE POLICY "Users can manage collab_permissions in their tenant"
    ON collab_permissions FOR ALL
    USING (tenant_id = ANY(get_user_tenant_ids()));

-- 12. Create secure function to populate tenant memberships from existing data
CREATE OR REPLACE FUNCTION migrate_existing_tenant_memberships()
RETURNS INTEGER AS $$
DECLARE
    membership_count INTEGER := 0;
BEGIN
    -- Insert memberships for existing users based on their organization_id
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
    WHERE u.organization_id IS NOT NULL
    ON CONFLICT (user_id, tenant_id) DO UPDATE SET
        role = EXCLUDED.role,
        updated_at = NOW();
    
    GET DIAGNOSTICS membership_count = ROW_COUNT;
    
    RETURN membership_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the migration
SELECT migrate_existing_tenant_memberships();

-- 13. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user_id ON tenant_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_tenant_id ON tenant_memberships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user_tenant ON tenant_memberships(user_id, tenant_id);

-- 14. Create trigger to keep tenant_memberships updated when user organizations change
CREATE OR REPLACE FUNCTION sync_user_tenant_membership()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_sync_user_tenant_membership ON users;
CREATE TRIGGER trigger_sync_user_tenant_membership
    AFTER INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION sync_user_tenant_membership();

-- 15. Add comments for documentation
COMMENT ON TABLE tenant_memberships IS 'Secure tenant isolation table - replaces session variable approach';
COMMENT ON FUNCTION get_user_tenant_ids() IS 'Returns tenant IDs user has access to via JWT claims or membership';
COMMENT ON FUNCTION user_has_tenant_access(UUID) IS 'Checks if user has access to specific tenant';