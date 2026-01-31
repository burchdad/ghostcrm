-- Multi-tenant database schema for tenant configuration
-- This manages tenant configuration and metadata

CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255), -- Custom domain support (optional)
  
  -- Configuration
  config JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  
  -- Status and metadata
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Database connection info (if using separate DBs per tenant)
  db_host VARCHAR(255),
  db_name VARCHAR(100),
  db_user VARCHAR(100),
  db_schema VARCHAR(100) DEFAULT 'public',
  
  -- Subscription and limits
  plan VARCHAR(50) DEFAULT 'basic',
  user_limit INTEGER DEFAULT 10,
  storage_limit_mb INTEGER DEFAULT 1000,
  
  -- Contact info
  admin_email VARCHAR(255),
  admin_name VARCHAR(255)
);

-- Index for fast subdomain lookups
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);

-- Trigger to update updated_at on changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample tenant data for development
INSERT INTO tenants (subdomain, name, admin_email, admin_name, config, branding) 
VALUES 
  ('demo', 'Demo Dealership', 'admin@demo.ghostautocrm.com', 'Demo Admin', 
   '{"features": ["leads", "inventory", "finance"]}',
   '{"primary_color": "#1f2937", "logo_url": null, "company_name": "Demo Dealership"}'),
  ('acme-auto', 'ACME Auto Sales', 'manager@acmeauto.com', 'John Manager',
   '{"features": ["leads", "inventory", "finance", "compliance"]}', 
   '{"primary_color": "#dc2626", "logo_url": null, "company_name": "ACME Auto Sales"}'),
  ('premium-cars', 'Premium Cars LLC', 'admin@premiumcars.com', 'Sarah Premium',
   '{"features": ["leads", "inventory", "finance", "compliance", "advanced_reporting"]}',
   '{"primary_color": "#059669", "logo_url": null, "company_name": "Premium Cars LLC"}')
ON CONFLICT (subdomain) DO NOTHING;

-- Row Level Security (RLS) setup for multi-tenant data isolation
-- This ensures users can only see data for their tenant

-- Enable RLS on existing tables (modify existing collaboration tables)
ALTER TABLE collab_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_scheduled_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_activity ENABLE ROW LEVEL SECURITY;

-- Add tenant_id column to existing tables
ALTER TABLE collab_notifications ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE collab_permissions ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE collab_scheduled_shares ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE collab_comments ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE collab_versions ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);
ALTER TABLE collab_activity ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id);

-- Create RLS policies for tenant isolation
-- Users can only access data from their own tenant

-- Function to get current tenant ID from JWT or session
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS INTEGER AS $$
BEGIN
  -- This would be set by your application when making DB calls
  -- For now, we'll use a session variable approach
  RETURN COALESCE(
    current_setting('app.current_tenant_id', true)::INTEGER,
    NULL
  );
END;
$$ LANGUAGE plpgsql;

-- Policies for collab_notifications
DROP POLICY IF EXISTS tenant_isolation_notifications ON collab_notifications;
CREATE POLICY tenant_isolation_notifications ON collab_notifications
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- Policies for collab_permissions  
DROP POLICY IF EXISTS tenant_isolation_permissions ON collab_permissions;
CREATE POLICY tenant_isolation_permissions ON collab_permissions
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- Policies for collab_scheduled_shares
DROP POLICY IF EXISTS tenant_isolation_scheduled_shares ON collab_scheduled_shares;
CREATE POLICY tenant_isolation_scheduled_shares ON collab_scheduled_shares
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- Policies for collab_comments
DROP POLICY IF EXISTS tenant_isolation_comments ON collab_comments;
CREATE POLICY tenant_isolation_comments ON collab_comments
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- Policies for collab_versions
DROP POLICY IF EXISTS tenant_isolation_versions ON collab_versions;
CREATE POLICY tenant_isolation_versions ON collab_versions
  FOR ALL USING (tenant_id = get_current_tenant_id());

-- Policies for collab_activity
DROP POLICY IF EXISTS tenant_isolation_activity ON collab_activity;
CREATE POLICY tenant_isolation_activity ON collab_activity
  FOR ALL USING (tenant_id = get_current_tenant_id());