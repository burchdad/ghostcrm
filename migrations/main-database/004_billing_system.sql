-- Billing and Subscription Management Schema for GhostCRM
-- Add these tables to your existing Supabase schema

-- Checkout Sessions Table
CREATE TABLE checkout_sessions (
    id TEXT PRIMARY KEY, -- Stripe checkout session ID
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')),
    selected_users JSONB NOT NULL, -- Store the user role/tier selections
    setup_fee INTEGER DEFAULT 0, -- Setup fee in cents
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Subscription Management
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' 
    CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due', 'unpaid'));
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Organization Settings Table (for storing configuration)
CREATE TABLE IF NOT EXISTS organization_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, setting_key)
);

-- User Role Definitions Table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_system_role BOOLEAN DEFAULT FALSE, -- True for predefined roles
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization User Subscriptions (tracks billing per user)
CREATE TABLE organization_user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES user_roles(id),
    tier TEXT NOT NULL, -- basic, pro, elite
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
    monthly_price INTEGER NOT NULL DEFAULT 0, -- Price in cents
    stripe_subscription_item_id TEXT, -- For usage-based billing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Update organization_memberships to reference user_roles
ALTER TABLE organization_memberships ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES user_roles(id);
ALTER TABLE organization_memberships ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'basic';

-- Insert default system roles
INSERT INTO user_roles (name, display_name, description, is_system_role, permissions) VALUES 
(
    'admin', 
    'Administrator', 
    'Full system access and organizational control',
    TRUE,
    '[
        "users.manage",
        "billing.manage", 
        "organization.manage",
        "settings.manage",
        "data.export",
        "audit.view",
        "integrations.manage",
        "workflows.manage",
        "reports.advanced"
    ]'::jsonb
),
(
    'sales_manager', 
    'Sales Manager', 
    'Team oversight and performance management',
    TRUE,
    '[
        "leads.view_all",
        "leads.assign",
        "deals.view_all",
        "team.manage",
        "reports.team",
        "goals.manage",
        "territories.manage",
        "coaching.access"
    ]'::jsonb
),
(
    'sales_rep', 
    'Sales Representative', 
    'Individual contributor sales activities',
    TRUE,
    '[
        "leads.view_own",
        "leads.edit_own",
        "deals.view_own",
        "deals.edit_own",
        "contacts.manage",
        "activities.manage",
        "calendar.manage",
        "reports.basic"
    ]'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_id ON checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_status ON checkout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_organization_settings_org_id ON organization_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_settings_key ON organization_settings(organization_id, setting_key);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_org_id ON organization_user_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON organization_user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON organizations(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_status ON organizations(subscription_status);

-- RLS Policies
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Checkout sessions - users can only see their own
CREATE POLICY "Users can view own checkout sessions" ON checkout_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkout sessions" ON checkout_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Organization settings - members can view, admins can manage
CREATE POLICY "Organization members can view settings" ON organization_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_memberships 
            WHERE organization_id = organization_settings.organization_id 
            AND user_id = auth.uid() 
            AND status = 'active'
        )
    );

CREATE POLICY "Organization admins can manage settings" ON organization_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_memberships om
            JOIN user_roles ur ON om.role_id = ur.id
            WHERE om.organization_id = organization_settings.organization_id 
            AND om.user_id = auth.uid() 
            AND om.status = 'active'
            AND ur.name IN ('admin', 'owner')
        )
    );

-- User roles - everyone can view, but only system admins can modify
CREATE POLICY "Anyone can view user roles" ON user_roles
    FOR SELECT USING (TRUE);

CREATE POLICY "Only system admins can manage roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_memberships om
            JOIN user_roles ur ON om.role_id = ur.id
            WHERE om.user_id = auth.uid() 
            AND ur.name = 'admin'
        )
    );

-- User subscriptions - organization admins can view/manage
CREATE POLICY "Organization admins can manage user subscriptions" ON organization_user_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_memberships om
            JOIN user_roles ur ON om.role_id = ur.id
            WHERE om.organization_id = organization_user_subscriptions.organization_id 
            AND om.user_id = auth.uid() 
            AND om.status = 'active'
            AND ur.name IN ('admin', 'owner')
        )
    );

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON organization_user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Functions for billing automation
CREATE OR REPLACE FUNCTION calculate_monthly_subscription_total(org_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total INTEGER := 0;
BEGIN
    SELECT COALESCE(SUM(monthly_price), 0) INTO total
    FROM organization_user_subscriptions 
    WHERE organization_id = org_id AND status = 'active';
    
    RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get organization billing status
CREATE OR REPLACE FUNCTION get_organization_billing_status(org_id UUID)
RETURNS TABLE (
    subscription_status TEXT,
    active_users INTEGER,
    monthly_total INTEGER,
    last_payment DATE,
    next_billing DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.subscription_status,
        COUNT(ous.*)::INTEGER as active_users,
        COALESCE(SUM(ous.monthly_price), 0)::INTEGER as monthly_total,
        o.last_payment_at::DATE as last_payment,
        (o.last_payment_at + INTERVAL '1 month')::DATE as next_billing
    FROM organizations o
    LEFT JOIN organization_user_subscriptions ous ON o.id = ous.organization_id AND ous.status = 'active'
    WHERE o.id = org_id
    GROUP BY o.id, o.subscription_status, o.last_payment_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;