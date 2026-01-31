-- Create missing deals table for GhostCRM
-- This table is referenced by the deals API and demo data provider but missing from the schema

CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  
  -- Basic deal information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  stage VARCHAR(100) DEFAULT 'prospect' CHECK (stage IN ('prospect', 'qualified', 'proposal', 'negotiation', 'financing', 'paperwork', 'closed_won', 'closed_lost')),
  
  -- Financial information
  amount DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  
  -- Customer and sales information  
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  
  -- Vehicle information (for automotive CRM)
  vehicle VARCHAR(255),
  vehicle_details JSONB DEFAULT '{}',
  
  -- Sales process
  sales_rep VARCHAR(255),
  assigned_to VARCHAR(255),
  expected_close DATE,
  actual_close DATE,
  
  -- Deal metadata
  source VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  tags TEXT[],
  notes TEXT,
  
  -- Financial breakdown
  trade_in JSONB DEFAULT '{}',
  financing JSONB DEFAULT '{}',
  tax_title_fees JSONB DEFAULT '{}',
  
  -- Custom fields for flexibility
  custom_fields JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_deals_organization_id ON deals(organization_id);
CREATE INDEX IF NOT EXISTS idx_deals_lead_id ON deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close ON deals(expected_close);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at);

-- Enable Row Level Security
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deals table
-- Users can only access deals from their organization
CREATE POLICY "Users can view deals from their organization" ON deals
    FOR SELECT USING (organization_id IN (
        SELECT organization_id 
        FROM organization_memberships 
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert deals into their organization" ON deals
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id 
        FROM organization_memberships 
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update deals in their organization" ON deals
    FOR UPDATE USING (organization_id IN (
        SELECT organization_id 
        FROM organization_memberships 
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete deals from their organization" ON deals
    FOR DELETE USING (organization_id IN (
        SELECT organization_id 
        FROM organization_memberships 
        WHERE user_id = auth.uid()
    ));

-- Service role bypass policy for demo data
CREATE POLICY "Service role can manage all deals" ON deals
    FOR ALL USING (auth.role() = 'service_role');

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update timestamps
CREATE TRIGGER trigger_deals_updated_at 
    BEFORE UPDATE ON deals 
    FOR EACH ROW EXECUTE FUNCTION update_deals_updated_at();

-- Add some missing tables that demo data provider expects

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(100),
  hire_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT,
  type VARCHAR(50) DEFAULT 'info',
  title VARCHAR(255),
  message TEXT,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar events table  
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  type VARCHAR(50) DEFAULT 'event',
  customer_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT,
  type VARCHAR(50),
  description TEXT,
  customer_name VARCHAR(255),
  user_name VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Organization settings table
CREATE TABLE IF NOT EXISTS organization_settings (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics metrics table
CREATE TABLE IF NOT EXISTS analytics_metrics (
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  metrics JSONB DEFAULT '{}',
  period VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (organization_id, period)
);

-- Enable RLS on all new tables
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Create service role policies for demo data population
CREATE POLICY "Service role can manage team_members" ON team_members FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage notifications" ON notifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage calendar_events" ON calendar_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage activities" ON activities FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage organization_settings" ON organization_settings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage analytics_metrics" ON analytics_metrics FOR ALL USING (auth.role() = 'service_role');