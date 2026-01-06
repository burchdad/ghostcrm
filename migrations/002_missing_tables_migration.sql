-- Missing Tables Migration for GhostCRM
-- Date: January 5, 2026
-- Purpose: Create all missing tables identified in code analysis

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================================
-- COLLABORATION SYSTEM TABLES
-- ===================================================================

-- Collaboration channels for team communication
CREATE TABLE IF NOT EXISTS collaboration_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'text' CHECK (type IN ('text', 'voice', 'video', 'general')),
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_by TEXT, -- Supabase auth user ID
  member_count INTEGER DEFAULT 0,
  last_message_id UUID,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages within collaboration channels
CREATE TABLE IF NOT EXISTS collaboration_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES collaboration_channels(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Supabase auth user ID
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'system')),
  reply_to_id UUID REFERENCES collaboration_messages(id),
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaboration calls (voice/video)
CREATE TABLE IF NOT EXISTS collaboration_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES collaboration_channels(id) ON DELETE CASCADE,
  initiated_by TEXT NOT NULL, -- User ID who started the call
  call_type VARCHAR(50) DEFAULT 'voice' CHECK (call_type IN ('voice', 'video', 'screen_share')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'ended', 'failed')),
  participants JSONB DEFAULT '[]',
  recording_url TEXT,
  duration INTEGER DEFAULT 0, -- seconds
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled meetings
CREATE TABLE IF NOT EXISTS collaboration_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES collaboration_channels(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  organized_by TEXT NOT NULL, -- User ID
  attendees JSONB DEFAULT '[]',
  meeting_url TEXT,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads in collaboration
CREATE TABLE IF NOT EXISTS collaboration_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES collaboration_channels(id) ON DELETE CASCADE,
  uploaded_by TEXT NOT NULL, -- User ID
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_size BIGINT,
  mime_type VARCHAR(100),
  storage_path TEXT NOT NULL,
  download_url TEXT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- USER MANAGEMENT TABLES
-- ===================================================================

-- Enhanced users table (add columns if table exists, create if not)
DO $$
BEGIN
  -- Check if users table exists and add missing columns
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'organization_id') THEN
      ALTER TABLE users ADD COLUMN organization_id UUID REFERENCES organizations(id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
      ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
      ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
    END IF;
  ELSE
    -- Create users table if it doesn't exist
    CREATE TABLE users (
      id TEXT PRIMARY KEY, -- Supabase auth user ID
      email VARCHAR(255) UNIQUE,
      organization_id UUID REFERENCES organizations(id),
      role VARCHAR(50) DEFAULT 'user',
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END
$$;

-- Organization memberships
CREATE TABLE IF NOT EXISTS organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Supabase auth user ID
  role VARCHAR(50) DEFAULT 'member',
  permissions JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  invited_by TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- User organizations mapping
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- User notification preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  notification_types JSONB DEFAULT '{}',
  quiet_hours JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- ===================================================================
-- WORKFLOW & AUTOMATION TABLES
-- ===================================================================

-- Workflow triggers for automation
CREATE TABLE IF NOT EXISTS workflow_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(100) NOT NULL, -- lead_created, contact_updated, etc.
  conditions JSONB DEFAULT '{}',
  actions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- BILLING & SUBSCRIPTION TABLES  
-- ===================================================================

-- Main subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  plan_id VARCHAR(255),
  quantity INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenant-specific subscriptions
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  subscription_id VARCHAR(255) UNIQUE,
  customer_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  plan VARCHAR(100),
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing events log
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing sessions (checkout sessions)
CREATE TABLE IF NOT EXISTS billing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_session_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  success_url TEXT,
  cancel_url TEXT,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotional codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  stripe_promo_code_id VARCHAR(255),
  stripe_coupon_id VARCHAR(255),
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'amount')),
  discount_value DECIMAL(10,2),
  currency VARCHAR(3),
  max_redemptions INTEGER,
  times_redeemed INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- SYSTEM TABLES
-- ===================================================================

-- Subdomain management
CREATE TABLE IF NOT EXISTS subdomains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  ssl_enabled BOOLEAN DEFAULT false,
  custom_domain VARCHAR(255),
  dns_configured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration tracking
CREATE TABLE IF NOT EXISTS _migrations (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checksum VARCHAR(64)
);

-- ===================================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================================

-- Collaboration indexes
CREATE INDEX IF NOT EXISTS idx_collaboration_channels_org_id ON collaboration_channels(organization_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_channels_type ON collaboration_channels(type);
CREATE INDEX IF NOT EXISTS idx_collaboration_channels_archived ON collaboration_channels(is_archived);

CREATE INDEX IF NOT EXISTS idx_collaboration_messages_channel_id ON collaboration_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_messages_user_id ON collaboration_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_messages_created_at ON collaboration_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_collaboration_calls_channel_id ON collaboration_calls(channel_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_calls_status ON collaboration_calls(status);

CREATE INDEX IF NOT EXISTS idx_collaboration_meetings_channel_id ON collaboration_meetings(channel_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_meetings_scheduled_for ON collaboration_meetings(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_collaboration_meetings_status ON collaboration_meetings(status);

CREATE INDEX IF NOT EXISTS idx_collaboration_files_channel_id ON collaboration_files(channel_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_files_uploaded_by ON collaboration_files(uploaded_by);

-- User management indexes
CREATE INDEX IF NOT EXISTS idx_organization_memberships_org_id ON organization_memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_memberships_user_id ON organization_memberships(user_id);

CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(organization_id);

CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);

-- Workflow indexes
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_org_id ON workflow_triggers(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_active ON workflow_triggers(is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_type ON workflow_triggers(trigger_type);

-- Billing indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant_id ON tenant_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_status ON tenant_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_billing_events_tenant_id ON billing_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_processed ON billing_events(processed);

CREATE INDEX IF NOT EXISTS idx_billing_sessions_org_id ON billing_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_sessions_session_id ON billing_sessions(session_id);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(active);

-- System indexes
CREATE INDEX IF NOT EXISTS idx_subdomains_org_id ON subdomains(organization_id);
CREATE INDEX IF NOT EXISTS idx_subdomains_subdomain ON subdomains(subdomain);
CREATE INDEX IF NOT EXISTS idx_subdomains_status ON subdomains(status);

-- ===================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ===================================================================

-- Add updated_at triggers where needed
CREATE TRIGGER IF NOT EXISTS trigger_collaboration_channels_updated_at 
    BEFORE UPDATE ON collaboration_channels 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_organization_memberships_updated_at 
    BEFORE UPDATE ON organization_memberships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_user_notification_preferences_updated_at 
    BEFORE UPDATE ON user_notification_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_workflow_triggers_updated_at 
    BEFORE UPDATE ON workflow_triggers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_tenant_subscriptions_updated_at 
    BEFORE UPDATE ON tenant_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_promo_codes_updated_at 
    BEFORE UPDATE ON promo_codes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_subdomains_updated_at 
    BEFORE UPDATE ON subdomains 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================================================

-- Enable RLS on all new tables
ALTER TABLE collaboration_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subdomains ENABLE ROW LEVEL SECURITY;

-- Service role policies (bypass RLS for service operations)
CREATE POLICY IF NOT EXISTS "Service role access" ON collaboration_channels FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS "Service role access" ON collaboration_messages FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS "Service role access" ON collaboration_calls FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS "Service role access" ON collaboration_meetings FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS "Service role access" ON collaboration_files FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS "Service role access" ON organization_memberships FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS "Service role access" ON user_organizations FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS "Service role access" ON user_notification_preferences FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS "Service role access" ON workflow_triggers FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS "Service role access" ON subscriptions FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS "Service role access" ON tenant_subscriptions FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS "Service role access" ON billing_events FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS "Service role access" ON billing_sessions FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS "Service role access" ON promo_codes FOR ALL TO service_role USING (true);
CREATE POLICY IF NOT EXISTS "Service role access" ON subdomains FOR ALL TO service_role USING (true);

-- ===================================================================
-- FOREIGN KEY CONSTRAINTS
-- ===================================================================

-- Add foreign key for last_message_id in collaboration_channels
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'collaboration_channels_last_message_id_fkey'
  ) THEN
    ALTER TABLE collaboration_channels 
    ADD CONSTRAINT collaboration_channels_last_message_id_fkey 
    FOREIGN KEY (last_message_id) REFERENCES collaboration_messages(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- ===================================================================
-- MIGRATION RECORD
-- ===================================================================

-- Record this migration
INSERT INTO _migrations (id, name, checksum) 
VALUES (
  'missing_tables_2026_01_05',
  'Create missing tables for collaboration, billing, and user management',
  md5('missing_tables_migration_v1')
) ON CONFLICT (id) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Missing tables migration completed successfully!';
  RAISE NOTICE 'Created tables: collaboration_channels, collaboration_messages, collaboration_calls, collaboration_meetings, collaboration_files';
  RAISE NOTICE 'Created tables: organization_memberships, user_organizations, user_notification_preferences';
  RAISE NOTICE 'Created tables: workflow_triggers, subscriptions, tenant_subscriptions, billing_events, billing_sessions, promo_codes';
  RAISE NOTICE 'Created tables: subdomains, _migrations';
  RAISE NOTICE 'Added indexes, triggers, and RLS policies for all new tables';
END
$$;