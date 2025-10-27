-- PostgreSQL/Supabase Migration
-- Feature-based subscription management system

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SUBSCRIPTION MANAGEMENT TABLES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Tenant subscription plans and billing
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL, -- References tenants table
    plan_id TEXT NOT NULL CHECK (plan_id IN ('starter', 'professional', 'business', 'enterprise')),
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')) DEFAULT 'monthly',
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'trial')) DEFAULT 'trial',
    
    -- Billing information
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Plan pricing (stored for historical tracking)
    plan_price_monthly INTEGER NOT NULL DEFAULT 0, -- cents
    plan_price_yearly INTEGER NOT NULL DEFAULT 0, -- cents
    
    -- Usage limits based on plan
    usage_limits JSONB NOT NULL DEFAULT '{
        "users": 3,
        "contacts": 1000,
        "deals": 200,
        "storage_gb": 5,
        "api_calls_monthly": 5000,
        "email_campaigns_monthly": 1000,
        "workflow_runs_monthly": 500
    }',
    
    -- Current usage tracking
    current_usage JSONB NOT NULL DEFAULT '{
        "users": 0,
        "contacts": 0,
        "deals": 0,
        "storage_gb": 0,
        "api_calls_this_month": 0,
        "email_campaigns_this_month": 0,
        "workflow_runs_this_month": 0
    }',
    
    -- Enabled features (plan + add-ons + manual overrides)
    enabled_features TEXT[] NOT NULL DEFAULT '{}',
    add_on_features TEXT[] NOT NULL DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add-on subscriptions (additional features purchased)
CREATE TABLE IF NOT EXISTS subscription_add_ons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES tenant_subscriptions(id) ON DELETE CASCADE,
    add_on_id TEXT NOT NULL, -- feature ID or package ID
    add_on_type TEXT NOT NULL CHECK (add_on_type IN ('feature', 'package')) DEFAULT 'feature',
    add_on_name TEXT NOT NULL,
    monthly_price INTEGER NOT NULL DEFAULT 0, -- cents
    
    -- Billing
    stripe_subscription_item_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled')) DEFAULT 'active',
    activated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(subscription_id, add_on_id)
);

-- Subscription usage history (for analytics and billing)
CREATE TABLE IF NOT EXISTS subscription_usage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES tenant_subscriptions(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    usage_type TEXT NOT NULL,
    usage_value INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(subscription_id, usage_date, usage_type)
);

-- Billing events and transactions
CREATE TABLE IF NOT EXISTS billing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES tenant_subscriptions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'subscription_created', 'subscription_updated', 'subscription_cancelled',
        'payment_succeeded', 'payment_failed', 'invoice_created', 'invoice_paid',
        'trial_started', 'trial_ended', 'add_on_added', 'add_on_removed',
        'plan_changed', 'usage_limit_exceeded'
    )),
    
    -- Event data
    stripe_event_id TEXT UNIQUE,
    amount INTEGER, -- cents
    currency TEXT DEFAULT 'usd',
    description TEXT,
    
    -- Status and processing
    status TEXT NOT NULL CHECK (status IN ('pending', 'processed', 'failed')) DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Raw event data
    event_data JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Feature access audit log
CREATE TABLE IF NOT EXISTS feature_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    feature_id TEXT NOT NULL,
    access_granted BOOLEAN NOT NULL,
    access_reason TEXT, -- 'included', 'add_on', 'trial', 'denied', 'limit_exceeded'
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    request_path TEXT,
    
    -- Usage context
    current_usage INTEGER,
    usage_limit INTEGER,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INDEXES FOR PERFORMANCE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant_id ON tenant_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_status ON tenant_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_stripe_subscription_id ON tenant_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_current_period_end ON tenant_subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_trial_ends_at ON tenant_subscriptions(trial_ends_at);

-- Add-on indexes
CREATE INDEX IF NOT EXISTS idx_subscription_add_ons_subscription_id ON subscription_add_ons(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_add_ons_add_on_id ON subscription_add_ons(add_on_id);
CREATE INDEX IF NOT EXISTS idx_subscription_add_ons_status ON subscription_add_ons(status);

-- Usage history indexes
CREATE INDEX IF NOT EXISTS idx_subscription_usage_history_subscription_id ON subscription_usage_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_history_usage_date ON subscription_usage_history(usage_date);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_history_usage_type ON subscription_usage_history(usage_type);

-- Billing events indexes
CREATE INDEX IF NOT EXISTS idx_billing_events_subscription_id ON billing_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_event_type ON billing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_billing_events_status ON billing_events(status);
CREATE INDEX IF NOT EXISTS idx_billing_events_created_at ON billing_events(created_at);

-- Feature access log indexes
CREATE INDEX IF NOT EXISTS idx_feature_access_log_tenant_id ON feature_access_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feature_access_log_user_id ON feature_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_access_log_feature_id ON feature_access_log(feature_id);
CREATE INDEX IF NOT EXISTS idx_feature_access_log_created_at ON feature_access_log(created_at);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STORED PROCEDURES AND FUNCTIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Function to increment usage counters
CREATE OR REPLACE FUNCTION increment_usage(
    p_tenant_id UUID,
    p_usage_type TEXT,
    p_amount INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
    current_limit INTEGER;
    current_value INTEGER;
BEGIN
    -- Get current usage and limit
    SELECT 
        (current_usage->p_usage_type)::INTEGER,
        (usage_limits->p_usage_type)::INTEGER
    INTO current_value, current_limit
    FROM tenant_subscriptions 
    WHERE tenant_id = p_tenant_id;
    
    -- Check if limit would be exceeded (-1 means unlimited)
    IF current_limit != -1 AND (current_value + p_amount) > current_limit THEN
        RETURN FALSE;
    END IF;
    
    -- Increment usage
    UPDATE tenant_subscriptions 
    SET 
        current_usage = jsonb_set(
            current_usage, 
            ARRAY[p_usage_type], 
            to_jsonb(COALESCE((current_usage->p_usage_type)::INTEGER, 0) + p_amount)
        ),
        updated_at = NOW()
    WHERE tenant_id = p_tenant_id;
    
    -- Record usage history
    INSERT INTO subscription_usage_history (subscription_id, usage_type, usage_value)
    SELECT id, p_usage_type, COALESCE((current_usage->p_usage_type)::INTEGER, 0) + p_amount
    FROM tenant_subscriptions 
    WHERE tenant_id = p_tenant_id
    ON CONFLICT (subscription_id, usage_date, usage_type) 
    DO UPDATE SET 
        usage_value = EXCLUDED.usage_value,
        created_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly usage counters
CREATE OR REPLACE FUNCTION reset_monthly_usage() RETURNS VOID AS $$
BEGIN
    UPDATE tenant_subscriptions 
    SET 
        current_usage = jsonb_set(
            jsonb_set(
                jsonb_set(
                    current_usage,
                    '{api_calls_this_month}',
                    '0'
                ),
                '{email_campaigns_this_month}',
                '0'
            ),
            '{workflow_runs_this_month}',
            '0'
        ),
        updated_at = NOW()
    WHERE status IN ('active', 'trial');
END;
$$ LANGUAGE plpgsql;

-- Function to activate subscription with features
CREATE OR REPLACE FUNCTION activate_subscription(
    p_tenant_id UUID,
    p_plan_id TEXT,
    p_billing_cycle TEXT DEFAULT 'monthly',
    p_stripe_subscription_id TEXT DEFAULT NULL,
    p_stripe_customer_id TEXT DEFAULT NULL,
    p_add_on_features TEXT[] DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    subscription_id UUID;
    plan_limits JSONB;
    plan_features TEXT[];
BEGIN
    -- Set usage limits based on plan
    CASE p_plan_id
        WHEN 'starter' THEN 
            plan_limits := '{
                "users": 3,
                "contacts": 1000,
                "deals": 200,
                "storage_gb": 5,
                "api_calls_monthly": 5000,
                "email_campaigns_monthly": 1000,
                "workflow_runs_monthly": 500
            }';
            plan_features := ARRAY[
                'contacts_management', 'basic_leads', 'basic_deals', 'task_management',
                'basic_reporting', 'file_storage', 'email_notifications',
                'email_integration', 'calendar_sync'
            ];
        WHEN 'professional' THEN 
            plan_limits := '{
                "users": 10,
                "contacts": 10000,
                "deals": 2000,
                "storage_gb": 25,
                "api_calls_monthly": 25000,
                "email_campaigns_monthly": 10000,
                "workflow_runs_monthly": 5000
            }';
            plan_features := ARRAY[
                'contacts_management', 'basic_leads', 'basic_deals', 'task_management',
                'basic_reporting', 'file_storage', 'email_notifications', 'email_integration',
                'calendar_sync', 'advanced_pipeline', 'sales_forecasting', 'quote_generation',
                'advanced_deals', 'email_campaigns', 'lead_scoring', 'workflow_automation',
                'advanced_reporting', 'data_export', 'team_collaboration', 'comment_system',
                'document_sharing', 'activity_feeds', 'mobile_app', 'zapier_integration'
            ];
        WHEN 'business' THEN 
            plan_limits := '{
                "users": 50,
                "contacts": 50000,
                "deals": 10000,
                "storage_gb": 100,
                "api_calls_monthly": 100000,
                "email_campaigns_monthly": 50000,
                "workflow_runs_monthly": 25000
            }';
            plan_features := ARRAY[
                'contacts_management', 'basic_leads', 'basic_deals', 'task_management',
                'basic_reporting', 'file_storage', 'email_notifications', 'email_integration',
                'calendar_sync', 'advanced_pipeline', 'sales_forecasting', 'quote_generation',
                'advanced_deals', 'email_campaigns', 'lead_scoring', 'workflow_automation',
                'advanced_reporting', 'data_export', 'team_collaboration', 'comment_system',
                'document_sharing', 'activity_feeds', 'mobile_app', 'zapier_integration',
                'contract_management', 'territory_management', 'commission_tracking',
                'marketing_automation', 'landing_pages', 'sms_marketing', 'drip_campaigns',
                'custom_triggers', 'api_webhooks', 'scheduled_actions', 'conditional_logic',
                'bulk_operations', 'custom_dashboards', 'performance_metrics', 'conversion_tracking',
                'roi_analysis', 'social_platforms', 'accounting_software', 'marketing_tools',
                'api_access', 'shared_workspaces', 'mention_notifications', 'real_time_updates',
                'predictive_scoring', 'sentiment_analysis', 'intelligent_routing', 'voice_integration',
                'offline_sync'
            ];
        WHEN 'enterprise' THEN 
            plan_limits := '{
                "users": -1,
                "contacts": -1,
                "deals": -1,
                "storage_gb": -1,
                "api_calls_monthly": -1,
                "email_campaigns_monthly": -1,
                "workflow_runs_monthly": -1
            }';
            plan_features := ARRAY[
                'contacts_management', 'basic_leads', 'basic_deals', 'task_management',
                'basic_reporting', 'file_storage', 'email_notifications', 'email_integration',
                'calendar_sync', 'advanced_pipeline', 'sales_forecasting', 'quote_generation',
                'advanced_deals', 'email_campaigns', 'lead_scoring', 'workflow_automation',
                'advanced_reporting', 'data_export', 'team_collaboration', 'comment_system',
                'document_sharing', 'activity_feeds', 'mobile_app', 'zapier_integration',
                'contract_management', 'territory_management', 'commission_tracking',
                'marketing_automation', 'landing_pages', 'sms_marketing', 'drip_campaigns',
                'custom_triggers', 'api_webhooks', 'scheduled_actions', 'conditional_logic',
                'bulk_operations', 'custom_dashboards', 'performance_metrics', 'conversion_tracking',
                'roi_analysis', 'predictive_analytics', 'social_platforms', 'accounting_software',
                'marketing_tools', 'custom_integrations', 'api_access', 'shared_workspaces',
                'mention_notifications', 'real_time_updates', 'ai_insights', 'predictive_scoring',
                'sentiment_analysis', 'intelligent_routing', 'voice_integration', 'offline_sync',
                'sso_authentication', 'advanced_security', 'audit_logging', 'custom_branding',
                'dedicated_support', 'priority_processing', 'data_residency', 'compliance_tools'
            ];
    END CASE;

    -- Create or update subscription
    INSERT INTO tenant_subscriptions (
        tenant_id, plan_id, billing_cycle, status, stripe_subscription_id, 
        stripe_customer_id, usage_limits, enabled_features, add_on_features
    ) VALUES (
        p_tenant_id, p_plan_id, p_billing_cycle, 'active', p_stripe_subscription_id,
        p_stripe_customer_id, plan_limits, plan_features, p_add_on_features
    )
    ON CONFLICT (tenant_id) DO UPDATE SET
        plan_id = EXCLUDED.plan_id,
        billing_cycle = EXCLUDED.billing_cycle,
        status = EXCLUDED.status,
        stripe_subscription_id = EXCLUDED.stripe_subscription_id,
        stripe_customer_id = EXCLUDED.stripe_customer_id,
        usage_limits = EXCLUDED.usage_limits,
        enabled_features = EXCLUDED.enabled_features,
        add_on_features = EXCLUDED.add_on_features,
        updated_at = NOW()
    RETURNING id INTO subscription_id;

    RETURN subscription_id;
END;
$$ LANGUAGE plpgsql;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Trigger function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
CREATE TRIGGER trigger_tenant_subscriptions_updated_at
    BEFORE UPDATE ON tenant_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_subscription_add_ons_updated_at
    BEFORE UPDATE ON subscription_add_ons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_billing_events_updated_at
    BEFORE UPDATE ON billing_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ROW LEVEL SECURITY (RLS)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Enable RLS on all tables
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_access_log ENABLE ROW LEVEL SECURITY;

-- Subscription access policies (users can only see their own tenant's subscription)
CREATE POLICY tenant_subscriptions_tenant_access ON tenant_subscriptions
    FOR ALL USING (
        tenant_id = (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    );

-- Admin access policy (superusers can see all)
CREATE POLICY tenant_subscriptions_admin_access ON tenant_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Similar policies for other tables
CREATE POLICY subscription_add_ons_access ON subscription_add_ons
    FOR ALL USING (
        subscription_id IN (
            SELECT id FROM tenant_subscriptions 
            WHERE tenant_id = (
                SELECT tenant_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY subscription_usage_history_access ON subscription_usage_history
    FOR ALL USING (
        subscription_id IN (
            SELECT id FROM tenant_subscriptions 
            WHERE tenant_id = (
                SELECT tenant_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY billing_events_access ON billing_events
    FOR ALL USING (
        subscription_id IN (
            SELECT id FROM tenant_subscriptions 
            WHERE tenant_id = (
                SELECT tenant_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY feature_access_log_access ON feature_access_log
    FOR ALL USING (
        tenant_id = (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INITIAL DATA AND CONSTRAINTS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Add foreign key constraint to tenants table (assuming it exists)
-- ALTER TABLE tenant_subscriptions ADD CONSTRAINT fk_tenant_subscriptions_tenant_id 
--     FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Add unique constraint for tenant_id (one subscription per tenant)
ALTER TABLE tenant_subscriptions ADD CONSTRAINT unique_tenant_subscription 
    UNIQUE (tenant_id);

-- Add check constraints
ALTER TABLE tenant_subscriptions ADD CONSTRAINT check_current_period_order 
    CHECK (current_period_start < current_period_end);

ALTER TABLE tenant_subscriptions ADD CONSTRAINT check_trial_end_future 
    CHECK (trial_ends_at IS NULL OR trial_ends_at > created_at);

-- Comments for documentation
COMMENT ON TABLE tenant_subscriptions IS 'Stores subscription plans and billing information for each tenant';
COMMENT ON TABLE subscription_add_ons IS 'Additional features or packages purchased as add-ons to base plans';
COMMENT ON TABLE subscription_usage_history IS 'Historical tracking of usage metrics for analytics and billing';
COMMENT ON TABLE billing_events IS 'Audit trail of all billing-related events and webhook processing';
COMMENT ON TABLE feature_access_log IS 'Security audit log for feature access attempts and decisions';

COMMENT ON FUNCTION increment_usage IS 'Safely increment usage counters while respecting limits';
COMMENT ON FUNCTION reset_monthly_usage IS 'Reset monthly usage counters (scheduled job)';
COMMENT ON FUNCTION activate_subscription IS 'Activate or update a tenant subscription with proper feature configuration';