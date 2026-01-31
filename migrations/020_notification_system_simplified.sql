-- Migration: Add notification system tables (Simplified)
-- File: 020_notification_system_simplified.sql

-- User notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Email preferences
  email_enabled BOOLEAN DEFAULT true,
  email_new_leads BOOLEAN DEFAULT true,
  email_lead_updates BOOLEAN DEFAULT true,
  email_deal_closed BOOLEAN DEFAULT true,
  email_task_reminders BOOLEAN DEFAULT true,
  email_system_alerts BOOLEAN DEFAULT true,
  email_daily_digest BOOLEAN DEFAULT false,
  email_weekly_reports BOOLEAN DEFAULT true,
  
  -- SMS preferences
  sms_enabled BOOLEAN DEFAULT false,
  sms_phone_number TEXT,
  sms_urgent_only BOOLEAN DEFAULT true,
  
  -- Push preferences
  push_enabled BOOLEAN DEFAULT true,
  push_browser BOOLEAN DEFAULT true,
  push_mobile BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, organization_id)
);

-- Enhanced notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  entity_id UUID,
  entity_type VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'medium',
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Notification delivery log
CREATE TABLE IF NOT EXISTS notification_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID,
  channel VARCHAR(20) NOT NULL, -- email, sms, push, in_app
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed, delivered, read
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_org_id ON user_notification_preferences(organization_id);

CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_notification_id ON notification_delivery_log(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_org_id ON notification_delivery_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_user_id ON notification_delivery_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_channel ON notification_delivery_log(channel);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_status ON notification_delivery_log(status);

-- Row Level Security (Simplified)
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service role access (idempotent)
DROP POLICY IF EXISTS "Service role can manage user notification preferences" ON user_notification_preferences;
CREATE POLICY "Service role can manage user notification preferences" 
ON user_notification_preferences FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage notifications" ON notifications;
CREATE POLICY "Service role can manage notifications" 
ON notifications FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage notification delivery log" ON notification_delivery_log;
CREATE POLICY "Service role can manage notification delivery log" 
ON notification_delivery_log FOR ALL USING (auth.role() = 'service_role');

-- Simplified user policies (allow all authenticated users for now) - idempotent
DROP POLICY IF EXISTS "Users can manage their own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can manage their own notification preferences" 
ON user_notification_preferences FOR ALL USING (
  auth.uid()::text = user_id::text
);

DROP POLICY IF EXISTS "Users can view notifications" ON notifications;
CREATE POLICY "Users can view notifications" 
ON notifications FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update notifications" ON notifications;
CREATE POLICY "Users can update notifications" 
ON notifications FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Function to automatically expire old notifications
CREATE OR REPLACE FUNCTION expire_old_notifications()
RETURNS void AS $$
BEGIN
  UPDATE notifications 
  SET expires_at = NOW() 
  WHERE created_at < NOW() - INTERVAL '30 days' 
  AND expires_at IS NULL
  AND type NOT IN ('security_alert', 'system_alert');
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE notifications IS 'Stores all notifications for users and organizations. Types include: new_lead, lead_update, deal_closed, task_reminder, system_alert, daily_digest, weekly_report, appointment_reminder, lead_status_change, team_invite, security_alert';

COMMENT ON COLUMN notifications.priority IS 'Notification priority: low, medium, high, critical';
COMMENT ON COLUMN notifications.type IS 'Notification type determines email template and user preferences';
COMMENT ON COLUMN notifications.metadata IS 'Additional data like entity IDs, source info, etc';

COMMENT ON TABLE notification_delivery_log IS 'Tracks delivery status across all notification channels';
COMMENT ON COLUMN notification_delivery_log.channel IS 'Delivery channel: email, sms, push, in_app';
COMMENT ON COLUMN notification_delivery_log.status IS 'Delivery status: pending, sent, failed, delivered, read';