-- Subdomain Management System Schema
-- Create tables for managing subdomains and DNS records

-- Subdomains table for tracking all client subdomains
CREATE TABLE IF NOT EXISTS subdomains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain VARCHAR(63) UNIQUE NOT NULL,
    organization_id UUID NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    custom_domain VARCHAR(255), -- For custom domains like client.com instead of client.ghostcrm.ai
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'failed', 'suspended')),
    ssl_status VARCHAR(50) DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed', 'expired')),
    dns_provider VARCHAR(100), -- 'vercel', 'cloudflare', 'manual', etc.
    vercel_domain_id VARCHAR(255), -- Vercel domain ID if using Vercel
    last_health_check TIMESTAMP WITH TIME ZONE,
    health_status VARCHAR(50) DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    provisioned_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- For trial or temporary subdomains
    metadata JSONB DEFAULT '{}', -- Additional configuration data
    
    -- Foreign key to organizations table
    CONSTRAINT fk_subdomain_organization 
        FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) 
        ON DELETE CASCADE
);

-- DNS Records table for tracking DNS configurations
CREATE TABLE IF NOT EXISTS dns_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain_id UUID NOT NULL,
    record_type VARCHAR(10) NOT NULL CHECK (record_type IN ('A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV')),
    record_name VARCHAR(255) NOT NULL,
    record_value TEXT NOT NULL,
    ttl INTEGER DEFAULT 300,
    priority INTEGER, -- For MX and SRV records
    provider_record_id VARCHAR(255), -- ID from DNS provider
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_dns_record_subdomain 
        FOREIGN KEY (subdomain_id) 
        REFERENCES subdomains(id) 
        ON DELETE CASCADE
);

-- Subdomain Health Checks table for monitoring
CREATE TABLE IF NOT EXISTS subdomain_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain_id UUID NOT NULL,
    check_type VARCHAR(50) NOT NULL CHECK (check_type IN ('connectivity', 'ssl', 'dns', 'performance', 'uptime')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy', 'timeout', 'error')),
    response_time_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    check_details JSONB DEFAULT '{}',
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_health_check_subdomain 
        FOREIGN KEY (subdomain_id) 
        REFERENCES subdomains(id) 
        ON DELETE CASCADE
);

-- Subdomain Activity Log for audit trail
CREATE TABLE IF NOT EXISTS subdomain_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'created', 'activated', 'suspended', 'dns_updated', etc.
    performed_by UUID, -- User ID who performed the action
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_activity_subdomain 
        FOREIGN KEY (subdomain_id) 
        REFERENCES subdomains(id) 
        ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subdomains_organization_id ON subdomains(organization_id);
CREATE INDEX IF NOT EXISTS idx_subdomains_status ON subdomains(status);
CREATE INDEX IF NOT EXISTS idx_subdomains_subdomain_lower ON subdomains(LOWER(subdomain));
CREATE INDEX IF NOT EXISTS idx_subdomains_created_at ON subdomains(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subdomains_health_status ON subdomains(health_status);

CREATE INDEX IF NOT EXISTS idx_dns_records_subdomain_id ON dns_records(subdomain_id);
CREATE INDEX IF NOT EXISTS idx_dns_records_type ON dns_records(record_type);
CREATE INDEX IF NOT EXISTS idx_dns_records_status ON dns_records(status);

CREATE INDEX IF NOT EXISTS idx_health_checks_subdomain_id ON subdomain_health_checks(subdomain_id);
CREATE INDEX IF NOT EXISTS idx_health_checks_checked_at ON subdomain_health_checks(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_checks_type_status ON subdomain_health_checks(check_type, status);

CREATE INDEX IF NOT EXISTS idx_activity_log_subdomain_id ON subdomain_activity_log(subdomain_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON subdomain_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON subdomain_activity_log(action);

-- Row Level Security (RLS) policies
ALTER TABLE subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE subdomain_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subdomain_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy for organization access to their subdomains
CREATE POLICY "Users can view their organization's subdomains" ON subdomains
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for software owners to access all subdomains
CREATE POLICY "Software owners can manage all subdomains" ON subdomains
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'software_owner'
        )
    );

-- Similar policies for related tables
CREATE POLICY "DNS records follow subdomain access" ON dns_records
    FOR SELECT USING (
        subdomain_id IN (
            SELECT id FROM subdomains
            WHERE organization_id IN (
                SELECT organization_id FROM user_profiles 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Software owners can manage all DNS records" ON dns_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'software_owner'
        )
    );

-- Health checks policies
CREATE POLICY "Health checks follow subdomain access" ON subdomain_health_checks
    FOR SELECT USING (
        subdomain_id IN (
            SELECT id FROM subdomains
            WHERE organization_id IN (
                SELECT organization_id FROM user_profiles 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Software owners can view all health checks" ON subdomain_health_checks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'software_owner'
        )
    );

-- Activity log policies
CREATE POLICY "Activity logs follow subdomain access" ON subdomain_activity_log
    FOR SELECT USING (
        subdomain_id IN (
            SELECT id FROM subdomains
            WHERE organization_id IN (
                SELECT organization_id FROM user_profiles 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Software owners can view all activity logs" ON subdomain_activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'software_owner'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_subdomains_updated_at 
    BEFORE UPDATE ON subdomains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dns_records_updated_at 
    BEFORE UPDATE ON dns_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log subdomain activities
CREATE OR REPLACE FUNCTION log_subdomain_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO subdomain_activity_log (subdomain_id, action, details)
        VALUES (NEW.id, 'created', jsonb_build_object('subdomain', NEW.subdomain, 'organization_id', NEW.organization_id));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Log status changes
        IF OLD.status != NEW.status THEN
            INSERT INTO subdomain_activity_log (subdomain_id, action, details)
            VALUES (NEW.id, 'status_changed', jsonb_build_object(
                'old_status', OLD.status, 
                'new_status', NEW.status,
                'subdomain', NEW.subdomain
            ));
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO subdomain_activity_log (subdomain_id, action, details)
        VALUES (OLD.id, 'deleted', jsonb_build_object('subdomain', OLD.subdomain));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for activity logging
CREATE TRIGGER log_subdomain_changes 
    AFTER INSERT OR UPDATE OR DELETE ON subdomains
    FOR EACH ROW EXECUTE FUNCTION log_subdomain_activity();

-- Views for easier querying

-- Active subdomains with health status
CREATE OR REPLACE VIEW active_subdomains AS
SELECT 
    s.*,
    o.organization_name as org_name,
    CASE 
        WHEN s.custom_domain IS NOT NULL THEN s.custom_domain
        ELSE s.subdomain || '.ghostcrm.ai'
    END as full_domain,
    COUNT(dns.id) as dns_record_count,
    MAX(hc.checked_at) as last_health_check
FROM subdomains s
LEFT JOIN organizations o ON s.organization_id = o.id
LEFT JOIN dns_records dns ON s.id = dns.subdomain_id AND dns.status = 'active'
LEFT JOIN subdomain_health_checks hc ON s.id = hc.subdomain_id
WHERE s.status = 'active'
GROUP BY s.id, o.organization_name;

-- Subdomain health summary
CREATE OR REPLACE VIEW subdomain_health_summary AS
SELECT 
    s.id,
    s.subdomain,
    s.status,
    s.health_status,
    s.last_health_check,
    COUNT(CASE WHEN hc.status = 'healthy' THEN 1 END) as healthy_checks,
    COUNT(CASE WHEN hc.status = 'unhealthy' THEN 1 END) as unhealthy_checks,
    COUNT(hc.id) as total_checks,
    AVG(hc.response_time_ms) as avg_response_time
FROM subdomains s
LEFT JOIN subdomain_health_checks hc ON s.id = hc.subdomain_id 
    AND hc.checked_at > NOW() - INTERVAL '24 hours'
GROUP BY s.id, s.subdomain, s.status, s.health_status, s.last_health_check;

-- Comments for documentation
COMMENT ON TABLE subdomains IS 'Stores all client subdomains and their configuration';
COMMENT ON TABLE dns_records IS 'DNS records associated with each subdomain';
COMMENT ON TABLE subdomain_health_checks IS 'Health monitoring results for subdomains';
COMMENT ON TABLE subdomain_activity_log IS 'Audit trail for all subdomain-related activities';

COMMENT ON COLUMN subdomains.subdomain IS 'The subdomain name (e.g., "acme" for acme.ghostcrm.ai)';
COMMENT ON COLUMN subdomains.custom_domain IS 'Custom domain if client uses their own domain';
COMMENT ON COLUMN subdomains.metadata IS 'Additional configuration data in JSON format';
COMMENT ON COLUMN subdomains.vercel_domain_id IS 'Vercel domain ID for API integration';