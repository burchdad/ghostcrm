-- CRITICAL FIX: Create missing tables that registration depends on
-- Run this immediately in Supabase SQL Editor

-- 1. Create public.users table (extends auth.users with business data)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id),
    role VARCHAR(50) DEFAULT 'member',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    preferences JSONB DEFAULT '{}',
    last_seen_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create subdomains table
CREATE TABLE IF NOT EXISTS public.subdomains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    status VARCHAR(50) DEFAULT 'placeholder',
    custom_domain VARCHAR(255),
    ssl_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ
);

-- 3. Create organization_memberships table
CREATE TABLE IF NOT EXISTS public.organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    invited_by UUID REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 4. Enable RLS on all new tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subdomains ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;

-- 5. Create service_role policies for registration to work
CREATE POLICY "service_role_all_access" ON public.users 
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_access" ON public.subdomains 
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_access" ON public.organization_memberships 
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. Create tenant isolation policies for regular users
CREATE POLICY "users_tenant_isolation" ON public.users 
FOR ALL TO public USING (organization_id = ANY (get_user_tenant_ids()));

CREATE POLICY "subdomains_tenant_isolation" ON public.subdomains 
FOR ALL TO public USING (organization_id = ANY (get_user_tenant_ids()));

CREATE POLICY "memberships_tenant_isolation" ON public.organization_memberships 
FOR ALL TO public USING (organization_id = ANY (get_user_tenant_ids()));

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON public.users(organization_id);
CREATE INDEX IF NOT EXISTS idx_subdomains_organization_id ON public.subdomains(organization_id);
CREATE INDEX IF NOT EXISTS idx_subdomains_subdomain ON public.subdomains(subdomain);
CREATE INDEX IF NOT EXISTS idx_memberships_organization_id ON public.organization_memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.organization_memberships(user_id);

-- 8. Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subdomains_updated_at BEFORE UPDATE ON public.subdomains 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.organization_memberships 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'MISSING TABLES CREATED - REGISTRATION SHOULD NOW WORK!' as status;