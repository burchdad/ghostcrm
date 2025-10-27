-- Webhook Management System Database Schema
-- Migration: 007_webhook_system.sql

-- Webhook Endpoints Table
CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL DEFAULT '{}',
    secret TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    headers JSONB DEFAULT '{}',
    retry_policy JSONB NOT NULL DEFAULT '{
        "maxAttempts": 3,
        "backoffStrategy": "exponential",
        "initialDelay": 1000,
        "maxDelay": 60000,
        "multiplier": 2
    }',
    rate_limit JSONB,
    timeout INTEGER NOT NULL DEFAULT 10000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Webhook Deliveries Table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'dead_letter')),
    attempts INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    next_attempt_at TIMESTAMPTZ,
    response_status INTEGER,
    response_headers JSONB,
    response_body TEXT,
    response_time INTEGER,
    error_message TEXT,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security Events Table (for webhook security monitoring)
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    endpoint TEXT,
    risk_score INTEGER DEFAULT 0,
    factors TEXT[] DEFAULT '{}',
    action_taken TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_tenant_id ON webhook_endpoints(tenant_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_active ON webhook_endpoints(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_events ON webhook_endpoints USING GIN(events);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_tenant_id ON webhook_deliveries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_next_attempt ON webhook_deliveries(next_attempt_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON webhook_deliveries(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event_type ON webhook_deliveries(event_type);

CREATE INDEX IF NOT EXISTS idx_security_events_tenant_id ON security_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_score ON security_events(risk_score) WHERE risk_score > 50;

-- Row Level Security (RLS)
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhook_endpoints
CREATE POLICY webhook_endpoints_tenant_isolation ON webhook_endpoints
    FOR ALL USING (
        tenant_id = (
            SELECT tenant_id FROM user_tenant_access 
            WHERE user_id = auth.uid() AND is_active = true
            LIMIT 1
        )
    );

-- RLS Policies for webhook_deliveries
CREATE POLICY webhook_deliveries_tenant_isolation ON webhook_deliveries
    FOR ALL USING (
        tenant_id = (
            SELECT tenant_id FROM user_tenant_access 
            WHERE user_id = auth.uid() AND is_active = true
            LIMIT 1
        )
    );

-- RLS Policies for security_events
CREATE POLICY security_events_tenant_isolation ON security_events
    FOR ALL USING (
        tenant_id = (
            SELECT tenant_id FROM user_tenant_access 
            WHERE user_id = auth.uid() AND is_active = true
            LIMIT 1
        )
    );

-- Functions for webhook management
CREATE OR REPLACE FUNCTION update_webhook_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER webhook_endpoints_updated_at
    BEFORE UPDATE ON webhook_endpoints
    FOR EACH ROW
    EXECUTE FUNCTION update_webhook_updated_at();

-- Function to get webhook statistics
CREATE OR REPLACE FUNCTION get_webhook_stats(
    p_tenant_id UUID,
    p_webhook_id UUID DEFAULT NULL,
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    total_deliveries BIGINT,
    successful_deliveries BIGINT,
    failed_deliveries BIGINT,
    pending_deliveries BIGINT,
    dead_letter_deliveries BIGINT,
    avg_response_time NUMERIC,
    success_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_deliveries,
        COUNT(*) FILTER (WHERE status = 'delivered')::BIGINT as successful_deliveries,
        COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_deliveries,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_deliveries,
        COUNT(*) FILTER (WHERE status = 'dead_letter')::BIGINT as dead_letter_deliveries,
        COALESCE(AVG(response_time) FILTER (WHERE response_time IS NOT NULL), 0) as avg_response_time,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE status = 'delivered')::NUMERIC / COUNT(*)::NUMERIC * 100)
            ELSE 0
        END as success_rate
    FROM webhook_deliveries
    WHERE tenant_id = p_tenant_id
        AND (p_webhook_id IS NULL OR webhook_id = p_webhook_id)
        AND created_at >= NOW() - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old webhook deliveries
CREATE OR REPLACE FUNCTION cleanup_old_webhook_deliveries(
    retention_days INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM webhook_deliveries
    WHERE created_at < NOW() - INTERVAL '1 day' * retention_days
        AND status IN ('delivered', 'dead_letter');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get webhook health status
CREATE OR REPLACE FUNCTION get_webhook_health(
    p_tenant_id UUID,
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    webhook_id UUID,
    webhook_url TEXT,
    total_attempts BIGINT,
    successful_attempts BIGINT,
    failed_attempts BIGINT,
    consecutive_failures BIGINT,
    avg_response_time NUMERIC,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    health_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH webhook_stats AS (
        SELECT 
            wd.webhook_id,
            we.url as webhook_url,
            COUNT(*) as total_attempts,
            COUNT(*) FILTER (WHERE wd.status = 'delivered') as successful_attempts,
            COUNT(*) FILTER (WHERE wd.status IN ('failed', 'dead_letter')) as failed_attempts,
            COALESCE(AVG(wd.response_time) FILTER (WHERE wd.response_time IS NOT NULL), 0) as avg_response_time,
            MAX(wd.created_at) FILTER (WHERE wd.status = 'delivered') as last_success_at,
            MAX(wd.created_at) FILTER (WHERE wd.status IN ('failed', 'dead_letter')) as last_failure_at
        FROM webhook_deliveries wd
        JOIN webhook_endpoints we ON wd.webhook_id = we.id
        WHERE wd.tenant_id = p_tenant_id
            AND wd.created_at >= NOW() - INTERVAL '1 hour' * p_hours
            AND we.is_active = true
        GROUP BY wd.webhook_id, we.url
    ),
    consecutive_failures AS (
        SELECT 
            webhook_id,
            COUNT(*) as consecutive_failures
        FROM (
            SELECT 
                webhook_id,
                status,
                ROW_NUMBER() OVER (PARTITION BY webhook_id ORDER BY created_at DESC) as rn
            FROM webhook_deliveries
            WHERE tenant_id = p_tenant_id
                AND created_at >= NOW() - INTERVAL '1 hour' * p_hours
        ) ranked
        WHERE status IN ('failed', 'dead_letter')
            AND rn <= (
                SELECT COALESCE(MIN(r2.rn), 0)
                FROM (
                    SELECT 
                        ROW_NUMBER() OVER (PARTITION BY webhook_id ORDER BY created_at DESC) as rn
                    FROM webhook_deliveries
                    WHERE tenant_id = p_tenant_id
                        AND created_at >= NOW() - INTERVAL '1 hour' * p_hours
                        AND status = 'delivered'
                ) r2
                WHERE r2.rn > ranked.rn
            )
        GROUP BY webhook_id
    )
    SELECT 
        ws.webhook_id,
        ws.webhook_url,
        ws.total_attempts,
        ws.successful_attempts,
        ws.failed_attempts,
        COALESCE(cf.consecutive_failures, 0) as consecutive_failures,
        ws.avg_response_time,
        ws.last_success_at,
        ws.last_failure_at,
        CASE 
            WHEN ws.total_attempts = 0 THEN 100
            WHEN ws.successful_attempts = 0 THEN 0
            ELSE (ws.successful_attempts::NUMERIC / ws.total_attempts::NUMERIC * 100)
        END as health_score
    FROM webhook_stats ws
    LEFT JOIN consecutive_failures cf ON ws.webhook_id = cf.webhook_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON webhook_endpoints TO authenticated;
GRANT ALL ON webhook_deliveries TO authenticated;
GRANT ALL ON security_events TO authenticated;
GRANT EXECUTE ON FUNCTION get_webhook_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_webhook_health TO authenticated;

-- Create a scheduled job to clean up old deliveries (if pg_cron is available)
-- SELECT cron.schedule(
--     'cleanup-webhook-deliveries',
--     '0 2 * * *', -- Daily at 2 AM
--     'SELECT cleanup_old_webhook_deliveries(90);'
-- );

COMMENT ON TABLE webhook_endpoints IS 'Webhook endpoint configurations for tenants';
COMMENT ON TABLE webhook_deliveries IS 'Webhook delivery attempts and their status';
COMMENT ON TABLE security_events IS 'Security events for monitoring and alerting';
COMMENT ON FUNCTION get_webhook_stats IS 'Get webhook delivery statistics for analytics';
COMMENT ON FUNCTION get_webhook_health IS 'Get webhook endpoint health status';
COMMENT ON FUNCTION cleanup_old_webhook_deliveries IS 'Clean up old webhook delivery records';