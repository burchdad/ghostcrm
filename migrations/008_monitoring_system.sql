-- Monitoring & Performance Tracking System Database Schema
-- Migration: 008_monitoring_system.sql

-- Monitoring Alerts Table
CREATE TABLE IF NOT EXISTS monitoring_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    conditions JSONB NOT NULL DEFAULT '[]',
    actions JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alert History Table
CREATE TABLE IF NOT EXISTS alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES monitoring_alerts(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('triggered', 'resolved')),
    severity TEXT NOT NULL,
    message TEXT,
    metadata JSONB DEFAULT '{}',
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('counter', 'gauge', 'histogram', 'summary')),
    labels JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System Health Table
CREATE TABLE IF NOT EXISTS system_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id TEXT NOT NULL DEFAULT 'default',
    cpu_usage NUMERIC,
    memory_usage BIGINT,
    disk_usage NUMERIC,
    network_in BIGINT DEFAULT 0,
    network_out BIGINT DEFAULT 0,
    active_connections INTEGER DEFAULT 0,
    response_time NUMERIC,
    error_rate NUMERIC,
    uptime BIGINT,
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Database Performance Metrics Table
CREATE TABLE IF NOT EXISTS database_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query_type TEXT,
    table_name TEXT,
    execution_time NUMERIC NOT NULL,
    rows_affected INTEGER DEFAULT 0,
    query_hash TEXT,
    is_slow_query BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cache Performance Metrics Table
CREATE TABLE IF NOT EXISTS cache_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cache_type TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('hit', 'miss', 'set', 'eviction')),
    key_pattern TEXT,
    response_time NUMERIC,
    size_bytes INTEGER,
    ttl INTEGER,
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- API Performance Table
CREATE TABLE IF NOT EXISTS api_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time NUMERIC NOT NULL,
    request_size INTEGER DEFAULT 0,
    response_size INTEGER DEFAULT 0,
    user_agent TEXT,
    ip_address INET,
    error_message TEXT,
    trace_id TEXT,
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_tenant_id ON monitoring_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_active ON monitoring_alerts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_severity ON monitoring_alerts(severity);

CREATE INDEX IF NOT EXISTS idx_alert_history_alert_id ON alert_history(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_triggered_at ON alert_history(triggered_at);
CREATE INDEX IF NOT EXISTS idx_alert_history_action ON alert_history(action);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_tenant_id ON performance_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON performance_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_labels ON performance_metrics USING GIN(labels);

CREATE INDEX IF NOT EXISTS idx_system_health_node_id ON system_health(node_id);
CREATE INDEX IF NOT EXISTS idx_system_health_recorded_at ON system_health(recorded_at);

CREATE INDEX IF NOT EXISTS idx_database_metrics_tenant_id ON database_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_database_metrics_table_name ON database_metrics(table_name);
CREATE INDEX IF NOT EXISTS idx_database_metrics_executed_at ON database_metrics(executed_at);
CREATE INDEX IF NOT EXISTS idx_database_metrics_slow_query ON database_metrics(is_slow_query) WHERE is_slow_query = true;

CREATE INDEX IF NOT EXISTS idx_cache_metrics_tenant_id ON cache_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cache_metrics_cache_type ON cache_metrics(cache_type);
CREATE INDEX IF NOT EXISTS idx_cache_metrics_operation ON cache_metrics(operation);
CREATE INDEX IF NOT EXISTS idx_cache_metrics_recorded_at ON cache_metrics(recorded_at);

CREATE INDEX IF NOT EXISTS idx_api_performance_tenant_id ON api_performance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_performance_endpoint ON api_performance(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_performance_status_code ON api_performance(status_code);
CREATE INDEX IF NOT EXISTS idx_api_performance_recorded_at ON api_performance(recorded_at);
CREATE INDEX IF NOT EXISTS idx_api_performance_response_time ON api_performance(response_time);

-- Partitioning for large tables (by month)
-- This would be implemented in production for better performance
-- CREATE TABLE performance_metrics_y2025m01 PARTITION OF performance_metrics 
--     FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Row Level Security (RLS)
ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY monitoring_alerts_tenant_isolation ON monitoring_alerts
    FOR ALL USING (
        tenant_id IS NULL OR 
        tenant_id = (
            SELECT tenant_id FROM user_tenant_access 
            WHERE user_id = auth.uid() AND is_active = true
            LIMIT 1
        )
    );

CREATE POLICY alert_history_access ON alert_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM monitoring_alerts ma
            WHERE ma.id = alert_history.alert_id
            AND (ma.tenant_id IS NULL OR ma.tenant_id = (
                SELECT tenant_id FROM user_tenant_access 
                WHERE user_id = auth.uid() AND is_active = true
                LIMIT 1
            ))
        )
    );

CREATE POLICY performance_metrics_tenant_isolation ON performance_metrics
    FOR ALL USING (
        tenant_id IS NULL OR 
        tenant_id = (
            SELECT tenant_id FROM user_tenant_access 
            WHERE user_id = auth.uid() AND is_active = true
            LIMIT 1
        )
    );

CREATE POLICY database_metrics_tenant_isolation ON database_metrics
    FOR ALL USING (
        tenant_id IS NULL OR 
        tenant_id = (
            SELECT tenant_id FROM user_tenant_access 
            WHERE user_id = auth.uid() AND is_active = true
            LIMIT 1
        )
    );

CREATE POLICY cache_metrics_tenant_isolation ON cache_metrics
    FOR ALL USING (
        tenant_id IS NULL OR 
        tenant_id = (
            SELECT tenant_id FROM user_tenant_access 
            WHERE user_id = auth.uid() AND is_active = true
            LIMIT 1
        )
    );

CREATE POLICY api_performance_tenant_isolation ON api_performance
    FOR ALL USING (
        tenant_id IS NULL OR 
        tenant_id = (
            SELECT tenant_id FROM user_tenant_access 
            WHERE user_id = auth.uid() AND is_active = true
            LIMIT 1
        )
    );

-- Functions for monitoring and analytics
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE (
    active_connections INTEGER,
    total_connections INTEGER,
    avg_query_time NUMERIC,
    slow_queries_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT count(*)::INTEGER FROM pg_stat_activity WHERE state = 'active') as active_connections,
        (SELECT count(*)::INTEGER FROM pg_stat_activity) as total_connections,
        COALESCE(AVG(execution_time), 0) as avg_query_time,
        COUNT(*) FILTER (WHERE is_slow_query = true) as slow_queries_count
    FROM database_metrics
    WHERE executed_at >= NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_performance_summary(
    p_tenant_id UUID DEFAULT NULL,
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    total_requests BIGINT,
    avg_response_time NUMERIC,
    error_rate NUMERIC,
    p95_response_time NUMERIC,
    cache_hit_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH api_stats AS (
        SELECT 
            COUNT(*) as total_requests,
            AVG(response_time) as avg_response_time,
            COUNT(*) FILTER (WHERE status_code >= 400)::NUMERIC / COUNT(*)::NUMERIC * 100 as error_rate,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) as p95_response_time
        FROM api_performance
        WHERE (p_tenant_id IS NULL OR tenant_id = p_tenant_id)
            AND recorded_at >= NOW() - INTERVAL '1 hour' * p_hours
    ),
    cache_stats AS (
        SELECT 
            CASE 
                WHEN COUNT(*) FILTER (WHERE operation IN ('hit', 'miss')) > 0 THEN
                    COUNT(*) FILTER (WHERE operation = 'hit')::NUMERIC / 
                    COUNT(*) FILTER (WHERE operation IN ('hit', 'miss'))::NUMERIC * 100
                ELSE 0
            END as cache_hit_rate
        FROM cache_metrics
        WHERE (p_tenant_id IS NULL OR tenant_id = p_tenant_id)
            AND recorded_at >= NOW() - INTERVAL '1 hour' * p_hours
    )
    SELECT 
        COALESCE(a.total_requests, 0) as total_requests,
        COALESCE(a.avg_response_time, 0) as avg_response_time,
        COALESCE(a.error_rate, 0) as error_rate,
        COALESCE(a.p95_response_time, 0) as p95_response_time,
        COALESCE(c.cache_hit_rate, 0) as cache_hit_rate
    FROM api_stats a
    CROSS JOIN cache_stats c;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_old_metrics(
    retention_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    performance_metrics_deleted BIGINT,
    api_performance_deleted BIGINT,
    cache_metrics_deleted BIGINT,
    database_metrics_deleted BIGINT
) AS $$
DECLARE
    perf_deleted BIGINT;
    api_deleted BIGINT;
    cache_deleted BIGINT;
    db_deleted BIGINT;
BEGIN
    -- Clean up performance metrics
    DELETE FROM performance_metrics
    WHERE recorded_at < NOW() - INTERVAL '1 day' * retention_days;
    GET DIAGNOSTICS perf_deleted = ROW_COUNT;

    -- Clean up API performance metrics
    DELETE FROM api_performance
    WHERE recorded_at < NOW() - INTERVAL '1 day' * retention_days;
    GET DIAGNOSTICS api_deleted = ROW_COUNT;

    -- Clean up cache metrics
    DELETE FROM cache_metrics
    WHERE recorded_at < NOW() - INTERVAL '1 day' * retention_days;
    GET DIAGNOSTICS cache_deleted = ROW_COUNT;

    -- Clean up database metrics
    DELETE FROM database_metrics
    WHERE executed_at < NOW() - INTERVAL '1 day' * retention_days;
    GET DIAGNOSTICS db_deleted = ROW_COUNT;

    RETURN QUERY SELECT perf_deleted, api_deleted, cache_deleted, db_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record slow queries automatically
CREATE OR REPLACE FUNCTION log_slow_query()
RETURNS event_trigger AS $$
DECLARE
    query_text TEXT;
    execution_time NUMERIC;
BEGIN
    -- This would be implemented with pg_stat_statements extension
    -- For now, it's a placeholder for slow query logging
    NULL;
END;
$$ LANGUAGE plpgsql;

-- Alert evaluation function
CREATE OR REPLACE FUNCTION evaluate_alert_conditions(
    p_alert_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    alert_record monitoring_alerts%ROWTYPE;
    condition JSONB;
    metric_value NUMERIC;
    threshold NUMERIC;
    operator TEXT;
    duration_minutes INTEGER;
    condition_met BOOLEAN := false;
BEGIN
    -- Get alert details
    SELECT * INTO alert_record FROM monitoring_alerts WHERE id = p_alert_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Check each condition
    FOR condition IN SELECT jsonb_array_elements(alert_record.conditions)
    LOOP
        threshold := (condition->>'threshold')::NUMERIC;
        operator := condition->>'operator';
        duration_minutes := (condition->>'duration')::INTEGER;

        -- Get recent metric values (simplified - would be more complex in practice)
        SELECT AVG(metric_value) INTO metric_value
        FROM performance_metrics
        WHERE metric_name = condition->>'metric'
            AND recorded_at >= NOW() - INTERVAL '1 minute' * duration_minutes
            AND (alert_record.tenant_id IS NULL OR tenant_id = alert_record.tenant_id);

        -- Evaluate condition
        CASE operator
            WHEN '>' THEN condition_met := metric_value > threshold;
            WHEN '<' THEN condition_met := metric_value < threshold;
            WHEN '>=' THEN condition_met := metric_value >= threshold;
            WHEN '<=' THEN condition_met := metric_value <= threshold;
            WHEN '==' THEN condition_met := metric_value = threshold;
            WHEN '!=' THEN condition_met := metric_value != threshold;
            ELSE condition_met := false;
        END CASE;

        -- If any condition is met, return true
        IF condition_met THEN
            RETURN true;
        END IF;
    END LOOP;

    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_monitoring_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER monitoring_alerts_updated_at
    BEFORE UPDATE ON monitoring_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_monitoring_updated_at();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON monitoring_alerts TO authenticated;
GRANT ALL ON alert_history TO authenticated;
GRANT ALL ON performance_metrics TO authenticated;
GRANT ALL ON system_health TO authenticated;
GRANT ALL ON database_metrics TO authenticated;
GRANT ALL ON cache_metrics TO authenticated;
GRANT ALL ON api_performance TO authenticated;

GRANT EXECUTE ON FUNCTION get_database_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_performance_summary TO authenticated;
GRANT EXECUTE ON FUNCTION evaluate_alert_conditions TO authenticated;

-- Create scheduled jobs for cleanup (if pg_cron is available)
-- SELECT cron.schedule(
--     'cleanup-metrics',
--     '0 3 * * *', -- Daily at 3 AM
--     'SELECT cleanup_old_metrics(30);'
-- );

-- SELECT cron.schedule(
--     'check-alerts',
--     '* * * * *', -- Every minute
--     'SELECT id FROM monitoring_alerts WHERE is_active = true AND evaluate_alert_conditions(id);'
-- );

COMMENT ON TABLE monitoring_alerts IS 'Alert configurations for monitoring system';
COMMENT ON TABLE alert_history IS 'History of alert triggers and resolutions';
COMMENT ON TABLE performance_metrics IS 'Time-series performance metrics data';
COMMENT ON TABLE system_health IS 'System health and resource usage metrics';
COMMENT ON TABLE database_metrics IS 'Database performance and query metrics';
COMMENT ON TABLE cache_metrics IS 'Cache performance and hit rate metrics';
COMMENT ON TABLE api_performance IS 'API endpoint performance and usage metrics';

COMMENT ON FUNCTION get_database_stats IS 'Get current database statistics';
COMMENT ON FUNCTION get_performance_summary IS 'Get performance summary for dashboards';
COMMENT ON FUNCTION cleanup_old_metrics IS 'Clean up old metrics data for retention management';
COMMENT ON FUNCTION evaluate_alert_conditions IS 'Evaluate if alert conditions are met';