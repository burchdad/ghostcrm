-- GhostCRM Complete Database Schema
-- Version: Fresh Start - October 26, 2025
-- This creates the complete CRM schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================================
-- ORGANIZATIONS & TENANTS
-- ===================================================================

-- Organizations table (multi-tenant support)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  database_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  subscription_tier VARCHAR(50) DEFAULT 'starter',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client configuration for multi-tenant database management
CREATE TABLE client_configs (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  database_type VARCHAR(50) NOT NULL CHECK (database_type IN ('supabase', 'mysql', 'postgresql', 'rest_api', 'custom')),
  connection_config JSONB NOT NULL DEFAULT '{}',
  field_mappings JSONB DEFAULT '{}',
  custom_validations JSONB DEFAULT '{}',
  integration_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'testing' CHECK (status IN ('active', 'inactive', 'testing'))
);

-- ===================================================================
-- CONTACTS & LEADS
-- ===================================================================

-- Contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  title VARCHAR(100),
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  value DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  stage VARCHAR(100) DEFAULT 'new',
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  source VARCHAR(100),
  assigned_to VARCHAR(255),
  expected_close_date DATE,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- COMMUNICATIONS
-- ===================================================================

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  type VARCHAR(50) DEFAULT 'email' CHECK (type IN ('email', 'sms', 'call', 'chat', 'note')),
  subject VARCHAR(500),
  content TEXT,
  direction VARCHAR(20) DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
  status VARCHAR(50) DEFAULT 'sent',
  sent_by VARCHAR(255),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Call logs for warm storage (recent calls)
CREATE TABLE call_logs_warm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),
  duration INTEGER DEFAULT 0,
  status VARCHAR(50),
  recording_url TEXT,
  notes TEXT,
  called_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- APPOINTMENTS & CALENDAR
-- ===================================================================

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(500),
  type VARCHAR(100) DEFAULT 'meeting',
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  attendees JSONB DEFAULT '[]',
  reminders JSONB DEFAULT '[]',
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- MARKETING & CAMPAIGNS
-- ===================================================================

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) DEFAULT 'email',
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  target_audience JSONB DEFAULT '{}',
  content JSONB DEFAULT '{}',
  schedule JSONB DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  budget DECIMAL(12,2) DEFAULT 0,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- INVENTORY MANAGEMENT
-- ===================================================================

-- Enhanced inventory table with support for dynamic fields
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  vin VARCHAR(17) UNIQUE, -- Vehicle Identification Number (17 characters for standard VIN)
  condition VARCHAR(20) DEFAULT 'new' CHECK (condition IN ('new', 'used', 'certified', 'damaged')),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'pending', 'maintenance')),
  
  -- Pricing information
  price_cost DECIMAL(12,2) DEFAULT 0,
  price_msrp DECIMAL(12,2) DEFAULT 0,
  price_selling DECIMAL(12,2) NOT NULL,
  price_currency VARCHAR(3) DEFAULT 'USD',
  
  -- Stock information
  stock_on_hand INTEGER DEFAULT 0,
  stock_reserved INTEGER DEFAULT 0,
  stock_available INTEGER DEFAULT 0,
  stock_reorder_level INTEGER DEFAULT 0,
  stock_reorder_qty INTEGER DEFAULT 0,
  
  -- Location information
  loc_lot VARCHAR(50),
  loc_section VARCHAR(50),
  loc_row VARCHAR(50),
  loc_spot VARCHAR(50),
  loc_warehouse VARCHAR(100),
  
  -- Flexible fields for client customization
  specifications JSONB DEFAULT '{}',
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}',
  
  -- Metadata
  description TEXT,
  notes TEXT,
  
  -- Activity tracking
  last_activity_type VARCHAR(50),
  last_activity_user VARCHAR(255),
  last_activity_details TEXT,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- COLLABORATION FEATURES
-- ===================================================================

-- User profiles for collaboration
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Supabase auth user ID
  email VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'member',
  permissions JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE collab_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT,
  channel TEXT,
  type TEXT,
  message TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- SYSTEM & UTILITY TABLES
-- ===================================================================

-- Activity logs for tracking all system activities
CREATE TABLE activity_log_warm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization provider secrets (encrypted)
CREATE TABLE org_provider_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(100) NOT NULL,
  secret_name VARCHAR(100) NOT NULL,
  encrypted_value TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, provider, secret_name)
);

-- ===================================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================================

-- Organizations indexes
CREATE INDEX idx_organizations_subdomain ON organizations(subdomain);
CREATE INDEX idx_organizations_status ON organizations(status);

-- Client configs indexes
CREATE INDEX idx_client_configs_org_id ON client_configs(organization_id);
CREATE INDEX idx_client_configs_status ON client_configs(status);
CREATE INDEX idx_client_configs_database_type ON client_configs(database_type);

-- Contacts indexes
CREATE INDEX idx_contacts_org_id ON contacts(organization_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_company ON contacts(company);
CREATE INDEX idx_contacts_status ON contacts(status);

-- Leads indexes
CREATE INDEX idx_leads_org_id ON leads(organization_id);
CREATE INDEX idx_leads_contact_id ON leads(contact_id);
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_value ON leads(value);

-- Messages indexes
CREATE INDEX idx_messages_org_id ON messages(organization_id);
CREATE INDEX idx_messages_contact_id ON messages(contact_id);
CREATE INDEX idx_messages_lead_id ON messages(lead_id);
CREATE INDEX idx_messages_type ON messages(type);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);

-- Appointments indexes
CREATE INDEX idx_appointments_org_id ON appointments(organization_id);
CREATE INDEX idx_appointments_contact_id ON appointments(contact_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Inventory indexes
CREATE INDEX idx_inventory_org_id ON inventory(organization_id);
CREATE INDEX idx_inventory_sku ON inventory(sku);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_brand ON inventory(brand);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_condition ON inventory(condition);

-- Search indexes
CREATE INDEX idx_contacts_search ON contacts USING gin (to_tsvector('english', 
  COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') || ' ' || COALESCE(company, '')));
CREATE INDEX idx_inventory_search ON inventory USING gin (to_tsvector('english', 
  name || ' ' || COALESCE(brand, '') || ' ' || COALESCE(model, '')));

-- ===================================================================
-- FUNCTIONS AND TRIGGERS
-- ===================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER trigger_organizations_updated_at 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_client_configs_updated_at 
    BEFORE UPDATE ON client_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_campaigns_updated_at 
    BEFORE UPDATE ON campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_inventory_updated_at 
    BEFORE UPDATE ON inventory 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_org_provider_secrets_updated_at 
    BEFORE UPDATE ON org_provider_secrets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs_warm ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log_warm ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_provider_secrets ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized per organization)
-- Allow service role to access everything
CREATE POLICY "Service role can access all data" ON organizations FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all data" ON client_configs FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all data" ON contacts FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all data" ON leads FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all data" ON messages FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all data" ON call_logs_warm FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all data" ON appointments FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all data" ON campaigns FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all data" ON inventory FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all data" ON profiles FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all data" ON collab_notifications FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all data" ON activity_log_warm FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all data" ON org_provider_secrets FOR ALL TO service_role USING (true);

-- ===================================================================
-- SAMPLE DATA (Optional)
-- ===================================================================

-- Insert a default organization for demo purposes
INSERT INTO organizations (id, name, subdomain, status, subscription_tier, settings) 
VALUES (
  gen_random_uuid(),
  'Demo Organization',
  'demo',
  'active',
  'professional',
  '{"demo_mode": true, "features": ["crm", "inventory", "campaigns"]}'
) ON CONFLICT DO NOTHING;

-- Comment to confirm successful migration
COMMENT ON SCHEMA public IS 'GhostCRM Database Schema - Fresh Installation October 26, 2025';