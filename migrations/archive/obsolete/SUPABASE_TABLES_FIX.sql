/* 
  GhostCRM Missing Tables Fix
  =========================
  
  This SQL creates the missing tables that the demo data provider expects.
  
  INSTRUCTIONS:
  1. Go to your Supabase Dashboard
  2. Navigate to SQL Editor
  3. Copy and paste this entire SQL script
  4. Click "Run" to execute
  5. Try the demo login again
  
  This will create:
  - deals table (main issue)
  - team_members table  
  - notifications table
  - calendar_events table
  - activities table
  - organization_settings table
  - analytics_metrics table
*/

-- ===================================================================
-- CREATE DEALS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  stage VARCHAR(100) DEFAULT 'prospect',
  amount DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  
  -- Customer information
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  
  -- Vehicle information (for automotive CRM)
  vehicle VARCHAR(255),
  
  -- Sales information
  sales_rep VARCHAR(255),
  assigned_to VARCHAR(255),
  expected_close DATE,
  actual_close DATE,
  
  -- Additional fields
  notes TEXT,
  value DECIMAL(12,2) DEFAULT 0, -- Alternative to amount
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- CREATE TEAM MEMBERS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
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

-- ===================================================================
-- CREATE NOTIFICATIONS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  user_id TEXT,
  type VARCHAR(50) DEFAULT 'info',
  title VARCHAR(255),
  message TEXT,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- CREATE CALENDAR EVENTS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
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

-- ===================================================================
-- CREATE ACTIVITIES TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  user_id TEXT,
  type VARCHAR(50),
  description TEXT,
  customer_name VARCHAR(255),
  user_name VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- ===================================================================
-- CREATE ORGANIZATION SETTINGS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS organization_settings (
  organization_id UUID PRIMARY KEY,
  settings JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- CREATE ANALYTICS METRICS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS analytics_metrics (
  organization_id UUID,
  metrics JSONB DEFAULT '{}',
  period VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (organization_id, period)
);

-- ===================================================================
-- ENABLE ROW LEVEL SECURITY
-- ===================================================================
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- CREATE SERVICE ROLE POLICIES (CRITICAL FOR DEMO DATA)
-- ===================================================================

-- Deals table policies
CREATE POLICY "Service role can manage deals" ON deals 
  FOR ALL USING (auth.role() = 'service_role');

-- Team members table policies
CREATE POLICY "Service role can manage team_members" ON team_members 
  FOR ALL USING (auth.role() = 'service_role');

-- Notifications table policies
CREATE POLICY "Service role can manage notifications" ON notifications 
  FOR ALL USING (auth.role() = 'service_role');

-- Calendar events table policies
CREATE POLICY "Service role can manage calendar_events" ON calendar_events 
  FOR ALL USING (auth.role() = 'service_role');

-- Activities table policies
CREATE POLICY "Service role can manage activities" ON activities 
  FOR ALL USING (auth.role() = 'service_role');

-- Organization settings table policies
CREATE POLICY "Service role can manage organization_settings" ON organization_settings 
  FOR ALL USING (auth.role() = 'service_role');

-- Analytics metrics table policies
CREATE POLICY "Service role can manage analytics_metrics" ON analytics_metrics 
  FOR ALL USING (auth.role() = 'service_role');

-- ===================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ===================================================================

-- Deals table indexes
CREATE INDEX IF NOT EXISTS idx_deals_organization_id ON deals(organization_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at);

-- Team members table indexes
CREATE INDEX IF NOT EXISTS idx_team_members_organization_id ON team_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Activities table indexes
CREATE INDEX IF NOT EXISTS idx_activities_organization_id ON activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp);

-- ===================================================================
-- VERIFICATION QUERIES (Optional - for testing)
-- ===================================================================

-- Verify all tables were created successfully
-- You can run these individually to test

-- SELECT 'deals' as table_name, count(*) as row_count FROM deals
-- UNION ALL
-- SELECT 'team_members' as table_name, count(*) as row_count FROM team_members
-- UNION ALL
-- SELECT 'notifications' as table_name, count(*) as row_count FROM notifications
-- UNION ALL
-- SELECT 'calendar_events' as table_name, count(*) as row_count FROM calendar_events
-- UNION ALL
-- SELECT 'activities' as table_name, count(*) as row_count FROM activities;

-- ===================================================================
-- NOTES
-- ===================================================================

/*
  After running this SQL:
  
  1. All required tables for demo data will exist
  2. Service role will have full access (required for demo login)
  3. RLS is enabled for security
  4. Proper indexes are created for performance
  
  The demo login should now work and populate data successfully!
*/