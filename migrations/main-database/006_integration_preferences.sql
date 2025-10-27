-- Migration: Add integration preferences and tasks support
-- This migration adds tables and columns to support the enhanced onboarding integration system

-- Add integration preferences column to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS integration_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS implementation_support_level TEXT DEFAULT 'self_service' CHECK (implementation_support_level IN ('self_service', 'guided', 'white_glove'));

-- Create integration tasks table for tracking implementation work
CREATE TABLE IF NOT EXISTS integration_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL, -- 'database_integration', 'telephony_integration', 'messaging_integration', 'implementation_support'
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'blocked')),
    config JSONB DEFAULT '{}', -- Store integration-specific configuration
    assigned_to UUID REFERENCES users(id), -- Implementation team member
    estimated_hours INTEGER,
    actual_hours INTEGER,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for integration tasks
ALTER TABLE integration_tasks ENABLE ROW LEVEL SECURITY;

-- Organization members can view their org's integration tasks
CREATE POLICY "Organization members can view integration tasks" ON integration_tasks
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

-- Only admins can create/update integration tasks
CREATE POLICY "Admins can manage integration tasks" ON integration_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            JOIN user_roles ur ON om.user_id = ur.user_id
            WHERE om.organization_id = integration_tasks.organization_id
            AND om.user_id = auth.uid()
            AND ur.role = 'admin'
        )
    );

-- Create notifications table for implementation team alerts
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for system notifications
    type TEXT NOT NULL, -- 'integration_setup', 'task_assigned', 'task_completed', 'billing_alert'
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications and org notifications
CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        ))
    );

-- Only system can create notifications (handled by API)
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Users can mark their notifications as read
CREATE POLICY "Users can update their notifications" ON notifications
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        ))
    );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_integration_tasks_organization_id ON integration_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_integration_tasks_status ON integration_tasks(status);
CREATE INDEX IF NOT EXISTS idx_integration_tasks_type ON integration_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Update organizations table to include integration-related metadata
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS integration_setup_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS monthly_integration_cost DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS integration_status TEXT DEFAULT 'pending' CHECK (integration_status IN ('pending', 'in_progress', 'completed', 'needs_attention'));

-- Add function to calculate integration costs based on preferences
CREATE OR REPLACE FUNCTION calculate_integration_cost(preferences JSONB)
RETURNS DECIMAL AS $$
DECLARE
    total_cost DECIMAL := 0.00;
    database_type TEXT;
    telephony_provider TEXT;
    implementation_support TEXT;
BEGIN
    -- Database integration cost
    database_type := preferences->>'database'->>'type';
    CASE database_type
        WHEN 'mysql', 'postgresql' THEN total_cost := total_cost + 50.00;
        WHEN 'mongodb' THEN total_cost := total_cost + 75.00;
        WHEN 'salesforce' THEN total_cost := total_cost + 200.00;
        WHEN 'hubspot' THEN total_cost := total_cost + 150.00;
        WHEN 'existing_crm' THEN total_cost := total_cost + 300.00;
        ELSE total_cost := total_cost + 0.00; -- supabase is free
    END CASE;
    
    -- Telephony provider cost
    telephony_provider := preferences->>'telephony'->>'provider';
    CASE telephony_provider
        WHEN 'twilio' THEN total_cost := total_cost + 25.00;
        WHEN 'ringcentral' THEN total_cost := total_cost + 35.00;
        WHEN 'vonage' THEN total_cost := total_cost + 30.00;
        WHEN 'dialpad' THEN total_cost := total_cost + 40.00;
        WHEN 'aircall' THEN total_cost := total_cost + 45.00;
        ELSE total_cost := total_cost + 0.00; -- none
    END CASE;
    
    -- Implementation support (one-time, but we'll track monthly equivalent)
    implementation_support := preferences->>'implementationSupport';
    CASE implementation_support
        WHEN 'guided' THEN total_cost := total_cost + 41.67; -- $500 one-time / 12 months
        WHEN 'white_glove' THEN total_cost := total_cost + 166.67; -- $2000 one-time / 12 months
        ELSE total_cost := total_cost + 0.00; -- self_service
    END CASE;
    
    RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update integration cost when preferences change
CREATE OR REPLACE FUNCTION update_integration_cost()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.integration_preferences IS NOT NULL AND NEW.integration_preferences != OLD.integration_preferences THEN
        NEW.monthly_integration_cost := calculate_integration_cost(NEW.integration_preferences);
        NEW.updated_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_integration_cost ON organizations;
CREATE TRIGGER trigger_update_integration_cost
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_cost();

-- Add updated_at trigger for integration_tasks
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_integration_tasks_updated_at ON integration_tasks;
CREATE TRIGGER trigger_update_integration_tasks_updated_at
    BEFORE UPDATE ON integration_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for integration dashboard
CREATE OR REPLACE VIEW integration_dashboard AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    o.integration_preferences,
    o.onboarding_completed,
    o.implementation_support_level,
    o.monthly_integration_cost,
    o.integration_status,
    o.integration_setup_date,
    COUNT(it.id) as total_tasks,
    COUNT(CASE WHEN it.status = 'pending' THEN 1 END) as pending_tasks,
    COUNT(CASE WHEN it.status = 'in_progress' THEN 1 END) as in_progress_tasks,
    COUNT(CASE WHEN it.status = 'completed' THEN 1 END) as completed_tasks,
    AVG(it.actual_hours) as avg_task_hours
FROM organizations o
LEFT JOIN integration_tasks it ON o.id = it.organization_id
WHERE o.onboarding_completed = true
GROUP BY o.id, o.name, o.integration_preferences, o.onboarding_completed, 
         o.implementation_support_level, o.monthly_integration_cost, 
         o.integration_status, o.integration_setup_date;

-- Grant appropriate permissions
GRANT SELECT ON integration_dashboard TO authenticated;

-- Add sample integration preferences for demo
INSERT INTO organizations (name, integration_preferences, onboarding_completed, monthly_integration_cost)
VALUES 
    ('Demo Enterprise Corp', '{
        "database": {"type": "postgresql", "migrationRequired": true, "existingRecords": 5000},
        "telephony": {"provider": "twilio", "integrationLevel": "advanced"},
        "messaging": {"smsProvider": "twilio", "whatsappBusiness": true},
        "email": {"provider": "office365"},
        "implementationSupport": "white_glove"
    }', true, 241.67),
    ('Startup Inc', '{
        "database": {"type": "supabase"},
        "telephony": {"provider": "none"},
        "messaging": {"smsProvider": "none"},
        "email": {"provider": "smtp"},
        "implementationSupport": "self_service"
    }', true, 0.00)
ON CONFLICT (name) DO NOTHING;