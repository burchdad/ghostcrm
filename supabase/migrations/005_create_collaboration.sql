-- Collaboration system database schema with proper tenant isolation
-- Run this migration to create the required tables for the collaboration system

-- Channels table
CREATE TABLE IF NOT EXISTS collaboration_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('public', 'private', 'direct')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  member_count INTEGER DEFAULT 0,
  members UUID[] DEFAULT '{}',
  last_message_id UUID,
  is_archived BOOLEAN DEFAULT FALSE
);

-- Messages table
CREATE TABLE IF NOT EXISTS collaboration_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id UUID NOT NULL,
  channel_id UUID NOT NULL REFERENCES collaboration_channels(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  attachments JSONB DEFAULT '[]',
  reply_to UUID REFERENCES collaboration_messages(id),
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Files table
CREATE TABLE IF NOT EXISTS collaboration_files (
  id VARCHAR(100) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  uploaded_by UUID NOT NULL,
  channel_id UUID NOT NULL REFERENCES collaboration_channels(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Meetings table
CREATE TABLE IF NOT EXISTS collaboration_meetings (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  meeting_link TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  organizer_id UUID NOT NULL,
  channel_id UUID NOT NULL REFERENCES collaboration_channels(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  attendees UUID[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  recording_url TEXT
);

-- Calls table
CREATE TABLE IF NOT EXISTS collaboration_calls (
  id VARCHAR(100) PRIMARY KEY,
  call_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  initiator_id UUID NOT NULL,
  channel_id UUID NOT NULL REFERENCES collaboration_channels(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  participants UUID[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  recording_url TEXT
);

-- User presence/status table
CREATE TABLE IF NOT EXISTS collaboration_user_presence (
  user_id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away', 'busy')),
  last_seen TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_collaboration_channels_org ON collaboration_channels(organization_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_channels_type ON collaboration_channels(organization_id, type);
CREATE INDEX IF NOT EXISTS idx_collaboration_channels_members ON collaboration_channels USING GIN(members);

CREATE INDEX IF NOT EXISTS idx_collaboration_messages_org ON collaboration_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_messages_channel ON collaboration_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaboration_messages_user ON collaboration_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_messages_search ON collaboration_messages USING GIN(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_collaboration_files_org ON collaboration_files(organization_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_files_channel ON collaboration_files(channel_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_files_user ON collaboration_files(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_collaboration_meetings_org ON collaboration_meetings(organization_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_meetings_channel ON collaboration_meetings(channel_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_meetings_organizer ON collaboration_meetings(organizer_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_meetings_time ON collaboration_meetings(start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_collaboration_calls_org ON collaboration_calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_calls_channel ON collaboration_calls(channel_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_calls_status ON collaboration_calls(status);

CREATE INDEX IF NOT EXISTS idx_collaboration_presence_org ON collaboration_user_presence(organization_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_presence_status ON collaboration_user_presence(organization_id, status);

-- Enable Row Level Security
ALTER TABLE collaboration_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_user_presence ENABLE ROW LEVEL SECURITY;

-- Function to get current organization ID from JWT or session
CREATE OR REPLACE FUNCTION get_current_organization_id()
RETURNS UUID AS $$
BEGIN
  -- This gets the organization ID from the JWT token or session
  RETURN COALESCE(
    current_setting('app.current_organization_id', true)::UUID,
    NULL
  );
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for organization isolation
-- Channels policies
DROP POLICY IF EXISTS organization_isolation_collaboration_channels ON collaboration_channels;
CREATE POLICY organization_isolation_collaboration_channels ON collaboration_channels
  FOR ALL USING (organization_id = get_current_organization_id());

-- Messages policies
DROP POLICY IF EXISTS organization_isolation_collaboration_messages ON collaboration_messages;
CREATE POLICY organization_isolation_collaboration_messages ON collaboration_messages
  FOR ALL USING (organization_id = get_current_organization_id());

-- Files policies
DROP POLICY IF EXISTS organization_isolation_collaboration_files ON collaboration_files;
CREATE POLICY organization_isolation_collaboration_files ON collaboration_files
  FOR ALL USING (organization_id = get_current_organization_id());

-- Meetings policies
DROP POLICY IF EXISTS organization_isolation_collaboration_meetings ON collaboration_meetings;
CREATE POLICY organization_isolation_collaboration_meetings ON collaboration_meetings
  FOR ALL USING (organization_id = get_current_organization_id());

-- Calls policies
DROP POLICY IF EXISTS organization_isolation_collaboration_calls ON collaboration_calls;
CREATE POLICY organization_isolation_collaboration_calls ON collaboration_calls
  FOR ALL USING (organization_id = get_current_organization_id());

-- User presence policies
DROP POLICY IF EXISTS organization_isolation_collaboration_presence ON collaboration_user_presence;
CREATE POLICY organization_isolation_collaboration_presence ON collaboration_user_presence
  FOR ALL USING (organization_id = get_current_organization_id());

-- Triggers to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_collaboration_channels_updated_at ON collaboration_channels;
CREATE TRIGGER update_collaboration_channels_updated_at
    BEFORE UPDATE ON collaboration_channels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_collaboration_messages_updated_at ON collaboration_messages;
CREATE TRIGGER update_collaboration_messages_updated_at
    BEFORE UPDATE ON collaboration_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_collaboration_meetings_updated_at ON collaboration_meetings;
CREATE TRIGGER update_collaboration_meetings_updated_at
    BEFORE UPDATE ON collaboration_meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_collaboration_presence_updated_at ON collaboration_user_presence;
CREATE TRIGGER update_collaboration_presence_updated_at
    BEFORE UPDATE ON collaboration_user_presence
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create default channels for existing organizations
INSERT INTO collaboration_channels (name, type, description, created_by, organization_id, member_count)
SELECT 
  'General',
  'public',
  'General team discussion and announcements',
  '00000000-0000-0000-0000-000000000000',
  id,
  0
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM collaboration_channels 
  WHERE organization_id = organizations.id AND name = 'General'
);

-- Add any missing columns to users table for collaboration features
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'offline';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

COMMENT ON TABLE collaboration_channels IS 'Team communication channels with organization isolation';
COMMENT ON TABLE collaboration_messages IS 'Messages within channels with organization isolation';
COMMENT ON TABLE collaboration_files IS 'File uploads shared in channels with organization isolation';
COMMENT ON TABLE collaboration_meetings IS 'Scheduled meetings linked to channels with organization isolation';
COMMENT ON TABLE collaboration_calls IS 'Video call sessions linked to channels with organization isolation';
COMMENT ON TABLE collaboration_user_presence IS 'User online status and presence with organization isolation';