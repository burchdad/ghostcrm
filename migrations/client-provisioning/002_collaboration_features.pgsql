-- =====================================
-- COLLABORATION FEATURES SCHEMA
-- Real-time collaboration system for CRM
-- =====================================
-- This migration adds advanced collaboration features to the client database
-- including notifications, permissions, comments, version history, and activity tracking

-- =====================================
-- 1. NOTIFICATIONS SYSTEM
-- =====================================

-- Real-time notifications for users
CREATE TABLE IF NOT EXISTS collab_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('mention', 'comment', 'share', 'assignment', 'approval', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    channel VARCHAR(50) DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'sms', 'push')),
    entity_type VARCHAR(50), -- 'contact', 'deal', 'dashboard', 'report'
    entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- =====================================
-- 2. PERMISSIONS & ACCESS CONTROL
-- =====================================

-- Advanced permissions for shared resources
CREATE TABLE IF NOT EXISTS collab_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('dashboard', 'report', 'contact', 'deal', 'campaign', 'folder')),
    resource_id UUID NOT NULL,
    permission_level VARCHAR(20) NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin', 'owner')),
    specific_permissions JSONB DEFAULT '{}', -- {"can_export": true, "can_share": false, etc.}
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 3. SCHEDULED SHARING
-- =====================================

-- Automated report and dashboard sharing
CREATE TABLE IF NOT EXISTS collab_scheduled_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('dashboard', 'report', 'analytics')),
    resource_id UUID NOT NULL,
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('user', 'email', 'group', 'external')),
    recipient_identifier TEXT NOT NULL, -- user_id, email, or group_name
    schedule_pattern VARCHAR(50) NOT NULL CHECK (schedule_pattern IN ('daily', 'weekly', 'monthly', 'custom')),
    schedule_config JSONB DEFAULT '{}', -- cron expression, days of week, etc.
    format VARCHAR(20) DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel', 'csv', 'link')),
    filters JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed')),
    last_sent_at TIMESTAMP WITH TIME ZONE,
    next_send_at TIMESTAMP WITH TIME ZONE,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 4. COMMENTS & DISCUSSIONS
-- =====================================

-- Comments on various CRM entities
CREATE TABLE IF NOT EXISTS collab_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('contact', 'deal', 'activity', 'dashboard', 'report', 'campaign')),
    entity_id UUID NOT NULL,
    parent_comment_id UUID REFERENCES collab_comments(id) ON DELETE CASCADE, -- for threaded comments
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text' CHECK (content_type IN ('text', 'markdown', 'html')),
    mentions UUID[] DEFAULT ARRAY[]::UUID[], -- array of mentioned user IDs
    attachments JSONB DEFAULT '[]', -- file attachments
    is_internal BOOLEAN DEFAULT false, -- internal team comments vs client-visible
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 5. VERSION HISTORY & CHANGE TRACKING
-- =====================================

-- Track changes to important entities
CREATE TABLE IF NOT EXISTS collab_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('contact', 'deal', 'dashboard', 'report', 'workflow', 'template')),
    entity_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('create', 'update', 'delete', 'restore')),
    changed_fields TEXT[], -- array of field names that changed
    previous_state JSONB, -- snapshot of previous state
    current_state JSONB, -- snapshot of current state
    change_summary TEXT,
    is_major_version BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 6. ACTIVITY STREAM
-- =====================================

-- Comprehensive activity logging for collaboration
CREATE TABLE IF NOT EXISTS collab_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255), -- to group related activities
    action VARCHAR(50) NOT NULL CHECK (action IN ('view', 'create', 'update', 'delete', 'share', 'comment', 'mention', 'export', 'import')),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- for actions targeting other users
    details JSONB DEFAULT '{}',
    source VARCHAR(50) DEFAULT 'web' CHECK (source IN ('web', 'mobile', 'api', 'automation', 'import')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 7. REAL-TIME PRESENCE
-- =====================================

-- Track who's currently viewing/editing what
CREATE TABLE IF NOT EXISTS collab_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('viewing', 'editing', 'idle')),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_data JSONB DEFAULT '{}',
    UNIQUE(user_id, entity_type, entity_id)
);

-- =====================================
-- 8. INDEXES FOR PERFORMANCE
-- =====================================

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_collab_notifications_recipient ON collab_notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_collab_notifications_entity ON collab_notifications(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_collab_notifications_created ON collab_notifications(created_at DESC);

-- Permissions indexes
CREATE INDEX IF NOT EXISTS idx_collab_permissions_user_resource ON collab_permissions(user_id, resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_collab_permissions_resource ON collab_permissions(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_collab_permissions_active ON collab_permissions(is_active, expires_at);

-- Scheduled shares indexes
CREATE INDEX IF NOT EXISTS idx_collab_scheduled_shares_next_send ON collab_scheduled_shares(next_send_at, status);
CREATE INDEX IF NOT EXISTS idx_collab_scheduled_shares_resource ON collab_scheduled_shares(resource_type, resource_id);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_collab_comments_entity ON collab_comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_collab_comments_user ON collab_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_collab_comments_parent ON collab_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_collab_comments_created ON collab_comments(created_at DESC);

-- Versions indexes
CREATE INDEX IF NOT EXISTS idx_collab_versions_entity ON collab_versions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_collab_versions_version ON collab_versions(entity_type, entity_id, version_number);
CREATE INDEX IF NOT EXISTS idx_collab_versions_user ON collab_versions(user_id, created_at DESC);

-- Activity indexes
CREATE INDEX IF NOT EXISTS idx_collab_activity_user ON collab_activity(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collab_activity_entity ON collab_activity(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_collab_activity_action ON collab_activity(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collab_activity_session ON collab_activity(session_id);

-- Presence indexes
CREATE INDEX IF NOT EXISTS idx_collab_presence_entity ON collab_presence(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_collab_presence_user ON collab_presence(user_id, last_seen_at DESC);

-- =====================================
-- 9. FUNCTIONS & TRIGGERS
-- =====================================

-- Function to clean up old presence records
CREATE OR REPLACE FUNCTION cleanup_old_presence()
RETURNS void AS $$
BEGIN
    -- Remove presence records older than 24 hours
    DELETE FROM collab_presence 
    WHERE last_seen_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create activity records
CREATE OR REPLACE FUNCTION log_collaboration_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- This would be called by triggers on other tables to log activity
    -- Implementation depends on specific requirements
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to handle notification creation
CREATE OR REPLACE FUNCTION create_collaboration_notification(
    p_user_id UUID,
    p_recipient_id UUID,
    p_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT,
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO collab_notifications (
        user_id, recipient_id, notification_type, title, message, 
        entity_type, entity_id
    ) VALUES (
        p_user_id, p_recipient_id, p_type, p_title, p_message,
        p_entity_type, p_entity_id
    )
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================
-- 10. ROW LEVEL SECURITY
-- =====================================

-- Enable RLS on all collaboration tables
ALTER TABLE collab_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_scheduled_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_presence ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (these would be customized based on requirements)
CREATE POLICY "Users can view their own notifications" ON collab_notifications
    FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users can view permissions they have" ON collab_permissions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view comments on entities they have access to" ON collab_comments
    FOR SELECT USING (true); -- This would be more complex in practice

CREATE POLICY "Users can view activity they're involved in" ON collab_activity
    FOR SELECT USING (user_id = auth.uid() OR target_user_id = auth.uid());

CREATE POLICY "Users can view their own presence" ON collab_presence
    FOR ALL USING (user_id = auth.uid());