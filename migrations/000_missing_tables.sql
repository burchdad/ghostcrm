-- =====================================================
-- MISSING TABLES MIGRATION
-- Creates essential tables referenced by security migration but missing from base schema
-- =====================================================

-- 1. Create users table (referenced by tenant_memberships)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited', 'suspended')),
    settings JSONB DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users (will be configured properly by security migration)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Create subscriptions table (for billing system)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
    trial_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Create tenant_subscriptions table (for multi-tenant billing)
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    billing_cycle TEXT DEFAULT 'monthly',
    status TEXT DEFAULT 'active',
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tenant_subscriptions
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Create tenant_features table (for feature provisioning)
CREATE TABLE IF NOT EXISTS tenant_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one feature per tenant
    UNIQUE(tenant_id, feature_name)
);

-- Enable RLS on tenant_features
ALTER TABLE tenant_features ENABLE ROW LEVEL SECURITY;

-- 5. Create billing_events table (for billing history)
CREATE TABLE IF NOT EXISTS billing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    stripe_event_id TEXT UNIQUE,
    amount INTEGER, -- cents
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on billing_events
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- 6. Create subdomains table (referenced in security migration)
CREATE TABLE IF NOT EXISTS subdomains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    subdomain TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'suspended')),
    ssl_enabled BOOLEAN DEFAULT false,
    custom_domain TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subdomains
ALTER TABLE subdomains ENABLE ROW LEVEL SECURITY;

-- 7. Create activities table (for activity tracking)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    title TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    related_id UUID, -- Generic foreign key
    related_type TEXT, -- 'lead', 'deal', 'contact', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant_id ON tenant_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_features_tenant_id ON tenant_features(tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_tenant_id ON billing_events(tenant_id);

CREATE INDEX IF NOT EXISTS idx_subdomains_organization_id ON subdomains(organization_id);
CREATE INDEX IF NOT EXISTS idx_subdomains_subdomain ON subdomains(subdomain);

CREATE INDEX IF NOT EXISTS idx_activities_organization_id ON activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);

-- 9. Add update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions  
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenant_subscriptions_updated_at ON tenant_subscriptions;
CREATE TRIGGER update_tenant_subscriptions_updated_at BEFORE UPDATE ON tenant_subscriptions
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenant_features_updated_at ON tenant_features;
CREATE TRIGGER update_tenant_features_updated_at BEFORE UPDATE ON tenant_features
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_subdomains_updated_at ON subdomains;
CREATE TRIGGER update_subdomains_updated_at BEFORE UPDATE ON subdomains
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 10. Add comments
COMMENT ON TABLE users IS 'System users with organization membership';
COMMENT ON TABLE subscriptions IS 'Stripe subscription management';
COMMENT ON TABLE tenant_subscriptions IS 'Multi-tenant subscription tracking';
COMMENT ON TABLE tenant_features IS 'Feature provisioning per tenant';
COMMENT ON TABLE billing_events IS 'Billing event history';
COMMENT ON TABLE subdomains IS 'Subdomain management for tenants';
COMMENT ON TABLE activities IS 'Activity tracking across the system';