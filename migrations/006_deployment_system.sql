-- Feature flags database schema for multi-environment deployment system
-- This will be added to your existing Supabase migrations

-- Create feature_flags table for persistent storage
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_key VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    environments JSONB NOT NULL DEFAULT '{}', -- Environment-specific settings
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    user_targeting JSONB DEFAULT '{}', -- User targeting rules
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create deployment_bundles table for tracking feature releases
CREATE TABLE IF NOT EXISTS deployment_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_name VARCHAR(255) NOT NULL,
    version VARCHAR(100) NOT NULL,
    source_environment VARCHAR(50) NOT NULL,
    target_environment VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, deployed, failed, rolled_back
    features JSONB NOT NULL DEFAULT '[]', -- Array of feature flag keys included
    changelog TEXT,
    approval_required BOOLEAN DEFAULT true,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    deployed_at TIMESTAMP WITH TIME ZONE,
    deployed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'
);

-- Create deployment_approvals table for approval workflow
CREATE TABLE IF NOT EXISTS deployment_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID NOT NULL REFERENCES deployment_bundles(id) ON DELETE CASCADE,
    approver_role VARCHAR(100) NOT NULL,
    approver_id UUID REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create environment_configs table for environment-specific settings
CREATE TABLE IF NOT EXISTS environment_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    database_config JSONB NOT NULL DEFAULT '{}',
    feature_defaults JSONB NOT NULL DEFAULT '{}',
    deployment_settings JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deployment_history table for tracking all deployments
CREATE TABLE IF NOT EXISTS deployment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID REFERENCES deployment_bundles(id),
    environment VARCHAR(50) NOT NULL,
    deployment_type VARCHAR(50) NOT NULL, -- promotion, rollback, hotfix
    status VARCHAR(50) NOT NULL, -- success, failed, in_progress
    git_commit_sha VARCHAR(100),
    build_number VARCHAR(100),
    health_check_results JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    error_logs TEXT,
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deployed_by UUID REFERENCES auth.users(id),
    duration_seconds INTEGER
);

-- Insert default environment configurations
INSERT INTO environment_configs (environment_name, display_name, base_url, database_config, feature_defaults, deployment_settings)
VALUES 
(
    'development',
    'Development Environment',
    'https://dev.ghostcrm.com',
    '{"supabase_url": "https://dev-dcwixbftjlzwptafvhpz.supabase.co", "redis_url": "redis://localhost:6379"}',
    '{"debug_mode": true, "experimental_features": true, "beta_features": true}',
    '{"auto_promote": false, "require_approval": false, "rollback_enabled": true}'
),
(
    'staging',
    'Staging Environment',
    'https://staging.ghostcrm.com',
    '{"supabase_url": "https://staging-abcdefghijklmnopqrst.supabase.co", "redis_url": "redis://staging-redis.ghostcrm.com:6379"}',
    '{"debug_mode": false, "experimental_features": false, "beta_features": false}',
    '{"auto_promote": false, "require_approval": true, "rollback_enabled": true}'
),
(
    'production',
    'Production Environment',
    'https://app.ghostcrm.com',
    '{"supabase_url": "https://prod-zyxwvutsrqponmlkjihg.supabase.co", "redis_url": "redis://prod-redis.ghostcrm.com:6379"}',
    '{"debug_mode": false, "experimental_features": false, "beta_features": false}',
    '{"auto_promote": false, "require_approval": true, "rollback_enabled": true, "health_check_enabled": true}'
)
ON CONFLICT (environment_name) DO NOTHING;

-- Insert default feature flags
INSERT INTO feature_flags (flag_key, name, description, environments, rollout_percentage, is_active)
VALUES 
(
    'ai_assistant',
    'AI Assistant',
    'Enable AI-powered assistant features throughout the application',
    '{"development": {"enabled": true, "rollout": 100}, "staging": {"enabled": true, "rollout": 100}, "production": {"enabled": true, "rollout": 50}}',
    50,
    true
),
(
    'new_dashboard',
    'New Dashboard Design',
    'Enable the redesigned dashboard interface',
    '{"development": {"enabled": true, "rollout": 100}, "staging": {"enabled": true, "rollout": 100}, "production": {"enabled": true, "rollout": 75}}',
    75,
    true
),
(
    'advanced_reports',
    'Advanced Reporting',
    'Enable advanced reporting and analytics features',
    '{"development": {"enabled": true, "rollout": 100}, "staging": {"enabled": false, "rollout": 0}, "production": {"enabled": false, "rollout": 0}}',
    0,
    true
),
(
    'beta_features',
    'Beta Features',
    'Enable access to beta features and experimental functionality',
    '{"development": {"enabled": true, "rollout": 100}, "staging": {"enabled": false, "rollout": 0}, "production": {"enabled": false, "rollout": 0}}',
    0,
    true
),
(
    'experimental_ui',
    'Experimental UI Components',
    'Enable experimental user interface components',
    '{"development": {"enabled": true, "rollout": 100}, "staging": {"enabled": false, "rollout": 0}, "production": {"enabled": false, "rollout": 0}}',
    0,
    true
)
ON CONFLICT (flag_key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feature_flags_flag_key ON feature_flags(flag_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_is_active ON feature_flags(is_active);
CREATE INDEX IF NOT EXISTS idx_deployment_bundles_status ON deployment_bundles(status);
CREATE INDEX IF NOT EXISTS idx_deployment_bundles_source_target ON deployment_bundles(source_environment, target_environment);
CREATE INDEX IF NOT EXISTS idx_deployment_approvals_bundle_id ON deployment_approvals(bundle_id);
CREATE INDEX IF NOT EXISTS idx_deployment_approvals_status ON deployment_approvals(status);
CREATE INDEX IF NOT EXISTS idx_environment_configs_environment_name ON environment_configs(environment_name);
CREATE INDEX IF NOT EXISTS idx_deployment_history_environment ON deployment_history(environment);
CREATE INDEX IF NOT EXISTS idx_deployment_history_deployed_at ON deployment_history(deployed_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_environment_configs_updated_at BEFORE UPDATE ON environment_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE environment_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read feature flags
CREATE POLICY "Allow authenticated users to read feature flags" ON feature_flags FOR SELECT TO authenticated USING (true);

-- Allow admin users to manage feature flags
CREATE POLICY "Allow admin users to manage feature flags" ON feature_flags FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (auth.users.raw_user_meta_data->>'role' = 'admin' OR auth.users.raw_user_meta_data->>'role' = 'developer')
    )
);

-- Allow authenticated users to read environment configs
CREATE POLICY "Allow authenticated users to read environment configs" ON environment_configs FOR SELECT TO authenticated USING (true);

-- Allow admin users to manage environment configs
CREATE POLICY "Allow admin users to manage environment configs" ON environment_configs FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

-- Allow authenticated users to read deployment bundles
CREATE POLICY "Allow authenticated users to read deployment bundles" ON deployment_bundles FOR SELECT TO authenticated USING (true);

-- Allow developers and admins to create deployment bundles
CREATE POLICY "Allow developers to create deployment bundles" ON deployment_bundles FOR INSERT TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (auth.users.raw_user_meta_data->>'role' IN ('admin', 'developer', 'lead-dev'))
    )
);

-- Allow users to read deployment history
CREATE POLICY "Allow authenticated users to read deployment history" ON deployment_history FOR SELECT TO authenticated USING (true);

-- Allow system to insert deployment history
CREATE POLICY "Allow system to insert deployment history" ON deployment_history FOR INSERT TO authenticated WITH CHECK (true);