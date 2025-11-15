-- ================================================
-- AUTOMATION SYSTEM DATABASE TABLES
-- ================================================
-- This script creates the necessary tables for the automation system
-- with proper tenant isolation and relationships

-- 1. Automation Workflows Table
-- ================================================
CREATE TABLE IF NOT EXISTS automation_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('active', 'paused', 'draft')),
    type VARCHAR(50) DEFAULT 'email' CHECK (type IN ('email', 'task', 'lead', 'follow-up')),
    
    -- Workflow configuration (JSON)
    configuration JSONB DEFAULT '{}',
    
    -- Performance tracking
    last_run TIMESTAMP WITH TIME ZONE,
    success_rate INTEGER DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
    total_runs INTEGER DEFAULT 0,
    successful_runs INTEGER DEFAULT 0,
    failed_runs INTEGER DEFAULT 0,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT automation_workflows_org_idx UNIQUE (organization_id, id)
);

-- Create indexes for automation_workflows
CREATE INDEX IF NOT EXISTS idx_automation_workflows_organization ON automation_workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_status ON automation_workflows(status);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_type ON automation_workflows(type);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_created_at ON automation_workflows(created_at DESC);

-- 2. Automation Workflow Triggers Table
-- ================================================
CREATE TABLE IF NOT EXISTS automation_workflow_triggers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES automation_workflows(id) ON DELETE CASCADE,
    organization_id TEXT NOT NULL,
    
    trigger_name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('event', 'schedule', 'condition')),
    trigger_config JSONB DEFAULT '{}',
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for automation_workflow_triggers
CREATE INDEX IF NOT EXISTS idx_automation_triggers_workflow ON automation_workflow_triggers(workflow_id);
CREATE INDEX IF NOT EXISTS idx_automation_triggers_organization ON automation_workflow_triggers(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_triggers_type ON automation_workflow_triggers(trigger_type);

-- 3. Automation Activity/Execution Log Table
-- ================================================
CREATE TABLE IF NOT EXISTS automation_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id TEXT NOT NULL,
    workflow_id UUID REFERENCES automation_workflows(id),
    
    -- Activity details
    activity_type VARCHAR(50) DEFAULT 'workflow' CHECK (activity_type IN ('workflow', 'trigger', 'campaign')),
    activity_name VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    
    -- Execution details
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('success', 'failed', 'pending', 'running')),
    error_message TEXT,
    execution_duration INTEGER, -- milliseconds
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for automation_activity
CREATE INDEX IF NOT EXISTS idx_automation_activity_organization ON automation_activity(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_activity_workflow ON automation_activity(workflow_id);
CREATE INDEX IF NOT EXISTS idx_automation_activity_status ON automation_activity(status);
CREATE INDEX IF NOT EXISTS idx_automation_activity_created_at ON automation_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_activity_type ON automation_activity(activity_type);

-- 4. Enable Row Level Security (RLS) for tenant isolation
-- ================================================
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflow_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_activity ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for tenant isolation
-- ================================================

-- Policies for automation_workflows
CREATE POLICY "Users can access their organization's workflows" ON automation_workflows
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true));

-- Policies for automation_workflow_triggers  
CREATE POLICY "Users can access their organization's triggers" ON automation_workflow_triggers
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true));

-- Policies for automation_activity
CREATE POLICY "Users can access their organization's activity" ON automation_activity
    FOR ALL USING (organization_id = current_setting('app.current_organization_id', true));

-- 6. Create some initial sample data for testing
-- ================================================
-- Note: This will be inserted with the current user's organization_id

-- Sample automation workflows (these will be inserted via the API to get proper org isolation)
-- INSERT INTO automation_workflows (organization_id, name, description, status, type, success_rate, total_runs)
-- VALUES 
--     ('current_org', 'Welcome Email Sequence', 'Automated welcome email series for new leads', 'active', 'email', 92, 48),
--     ('current_org', 'Lead Scoring System', 'Automatically score leads based on activity', 'active', 'lead', 88, 156),
--     ('current_org', 'Task Auto-Assignment', 'Assign follow-up tasks to team members', 'paused', 'task', 76, 23);

-- 7. Functions for automation system (optional)
-- ================================================

-- Function to update workflow performance stats
CREATE OR REPLACE FUNCTION update_workflow_stats(
    workflow_uuid UUID,
    execution_status TEXT
) RETURNS VOID AS $$
BEGIN
    UPDATE automation_workflows 
    SET 
        total_runs = total_runs + 1,
        successful_runs = CASE WHEN execution_status = 'success' THEN successful_runs + 1 ELSE successful_runs END,
        failed_runs = CASE WHEN execution_status = 'failed' THEN failed_runs + 1 ELSE failed_runs END,
        success_rate = CASE 
            WHEN (total_runs + 1) > 0 THEN 
                ROUND((successful_runs + CASE WHEN execution_status = 'success' THEN 1 ELSE 0 END) * 100.0 / (total_runs + 1))
            ELSE 0 
        END,
        last_run = NOW(),
        updated_at = NOW()
    WHERE id = workflow_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update workflow updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_automation_workflows_updated_at 
    BEFORE UPDATE ON automation_workflows 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_automation_workflow_triggers_updated_at 
    BEFORE UPDATE ON automation_workflow_triggers 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ================================================
-- GRANTS AND PERMISSIONS
-- ================================================
-- Grant necessary permissions for the service role and authenticated users

-- Grant permissions to service role (used by API)
GRANT ALL ON automation_workflows TO service_role;
GRANT ALL ON automation_workflow_triggers TO service_role;
GRANT ALL ON automation_activity TO service_role;

-- Grant permissions to authenticated users (if using user-level access)
GRANT SELECT, INSERT, UPDATE, DELETE ON automation_workflows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON automation_workflow_triggers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON automation_activity TO authenticated;

-- ================================================
-- SAMPLE DATA SETUP COMPLETE
-- ================================================
-- Run this script in Supabase SQL Editor to create all automation tables
-- Then use the API endpoints to create sample workflows with proper tenant isolation