-- PostgreSQL/Supabase Migration
-- Admin Testing Dashboard Database Migration
-- Creates tables for test execution tracking, scheduling, and audit logging

-- Test execution tracking
CREATE TABLE IF NOT EXISTS test_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    tenant_name VARCHAR(255),
    test_suite VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    execution_type VARCHAR(50) NOT NULL DEFAULT 'manual', -- manual, scheduled
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Results
    total_tests INTEGER DEFAULT 0,
    passed_tests INTEGER DEFAULT 0,
    failed_tests INTEGER DEFAULT 0,
    pass_rate DECIMAL(5,2) DEFAULT 0.0,
    
    -- Detailed results (JSON)
    detailed_results JSONB,
    error_message TEXT,
    
    -- Metadata
    triggered_by VARCHAR(255),
    environment VARCHAR(50) DEFAULT 'production',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test schedules
CREATE TABLE IF NOT EXISTS test_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Configuration
    test_suites VARCHAR[] NOT NULL, -- array of test suite names
    target_tenants VARCHAR[] NOT NULL, -- array of tenant IDs or ['all']
    cron_expression VARCHAR(100) NOT NULL,
    
    -- Status
    active BOOLEAN DEFAULT true,
    
    -- Execution tracking
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data integrity snapshots for tamper detection
CREATE TABLE IF NOT EXISTS data_integrity_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    table_name VARCHAR(255) NOT NULL,
    
    -- Integrity metrics
    record_count INTEGER NOT NULL,
    checksum VARCHAR(255) NOT NULL,
    data_hash VARCHAR(255),
    
    -- Metadata
    snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, table_name, snapshot_date)
);

-- Admin audit log for security tracking
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    action VARCHAR(255) NOT NULL,
    
    -- Request details
    ip_address INET,
    user_agent TEXT,
    
    -- Action details
    resource_type VARCHAR(100), -- test_execution, schedule, etc.
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    
    -- Metadata
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

-- Test alerts configuration
CREATE TABLE IF NOT EXISTS test_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    
    -- Alert conditions
    trigger_type VARCHAR(50) NOT NULL, -- failure_rate, response_time, data_integrity
    threshold_value DECIMAL(10,2) NOT NULL,
    threshold_operator VARCHAR(10) NOT NULL, -- >, <, >=, <=, =
    
    -- Targeting
    target_tenants VARCHAR[],
    target_test_suites VARCHAR[],
    
    -- Notification settings
    notification_channels VARCHAR[] NOT NULL, -- email, sms, webhook
    notification_recipients VARCHAR[] NOT NULL,
    
    -- Status
    active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenant health monitoring
CREATE TABLE IF NOT EXISTS tenant_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    
    -- Health metrics
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    connectivity_status VARCHAR(20) NOT NULL, -- healthy, degraded, unhealthy
    database_status VARCHAR(20) NOT NULL,
    api_status VARCHAR(20) NOT NULL,
    auth_status VARCHAR(20) NOT NULL,
    
    -- Performance metrics
    response_time_ms INTEGER,
    error_rate DECIMAL(5,2),
    uptime_percentage DECIMAL(5,2),
    
    -- Detailed results
    detailed_checks JSONB,
    
    -- Metadata
    check_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics aggregation
CREATE TABLE IF NOT EXISTS test_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    test_suite VARCHAR(100) NOT NULL,
    
    -- Performance data
    execution_date DATE NOT NULL,
    avg_response_time_ms DECIMAL(10,2),
    max_response_time_ms INTEGER,
    min_response_time_ms INTEGER,
    memory_usage_mb DECIMAL(10,2),
    cpu_usage_percent DECIMAL(5,2),
    
    -- Test statistics
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    avg_pass_rate DECIMAL(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, test_suite, execution_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_executions_tenant_status ON test_executions(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_test_executions_started_at ON test_executions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_executions_pass_rate ON test_executions(pass_rate);

CREATE INDEX IF NOT EXISTS idx_test_schedules_active ON test_schedules(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_test_schedules_next_run ON test_schedules(next_run) WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_data_integrity_tenant_table ON data_integrity_snapshots(tenant_id, table_name);
CREATE INDEX IF NOT EXISTS idx_data_integrity_date ON data_integrity_snapshots(snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_user_action ON admin_audit_log(user_id, action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_timestamp ON admin_audit_log(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_tenant_health_tenant_timestamp ON tenant_health_checks(tenant_id, check_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_tenant_date ON test_performance_metrics(tenant_id, execution_date DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_test_executions_updated_at 
    BEFORE UPDATE ON test_executions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_schedules_updated_at 
    BEFORE UPDATE ON test_schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_alerts_updated_at 
    BEFORE UPDATE ON test_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default test schedules
INSERT INTO test_schedules (name, description, test_suites, target_tenants, cron_expression, created_by) VALUES
('Daily Full Test Suite', 'Complete functionality test for all tenants', ARRAY['all'], ARRAY['all'], '0 2 * * *', 'system'),
('Weekly Security Audit', 'Authentication and security tests for critical tenants', ARRAY['auth', 'api'], ARRAY['main'], '0 0 * * 0', 'system'),
('Hourly Main App Health Check', 'Quick health check for main application', ARRAY['ui', 'api'], ARRAY['main'], '0 * * * *', 'system')
ON CONFLICT DO NOTHING;

-- Insert default alert configurations
INSERT INTO test_alerts (name, trigger_type, threshold_value, threshold_operator, target_tenants, target_test_suites, notification_channels, notification_recipients, created_by) VALUES
('Critical Test Failure Rate', 'failure_rate', 20.0, '>', ARRAY['all'], ARRAY['auth', 'api'], ARRAY['email'], ARRAY['admin@ghostcrm.com'], 'system'),
('Main App Performance Degradation', 'response_time', 5000.0, '>', ARRAY['main'], ARRAY['all'], ARRAY['email'], ARRAY['admin@ghostcrm.com'], 'system'),
('Data Integrity Violation', 'data_integrity', 1.0, '>=', ARRAY['all'], ARRAY['db'], ARRAY['email', 'sms'], ARRAY['admin@ghostcrm.com'], 'system')
ON CONFLICT DO NOTHING;

-- Create view for test execution summary
CREATE OR REPLACE VIEW test_execution_summary AS
SELECT 
    tenant_id,
    tenant_name,
    test_suite,
    COUNT(*) as total_executions,
    COUNT(*) FILTER (WHERE status = 'completed') as successful_executions,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_executions,
    ROUND(AVG(pass_rate), 2) as avg_pass_rate,
    MAX(started_at) as last_execution,
    ROUND(AVG(duration_seconds), 0) as avg_duration_seconds
FROM test_executions 
WHERE started_at >= NOW() - INTERVAL '30 days'
GROUP BY tenant_id, tenant_name, test_suite;

-- Create view for tenant health overview
CREATE OR REPLACE VIEW tenant_health_overview AS
SELECT DISTINCT ON (tenant_id)
    tenant_id,
    overall_score,
    connectivity_status,
    database_status,
    api_status,
    auth_status,
    response_time_ms,
    error_rate,
    uptime_percentage,
    check_timestamp
FROM tenant_health_checks 
ORDER BY tenant_id, check_timestamp DESC;