-- Migration: Customer Success Workflows
-- File: migrations/016_customer_success_workflows.sql
-- Purpose: Implement trial-to-paid conversion automation with onboarding sequences and engagement tracking
-- Dependencies: Existing user/organization tables, billing system, usage tracking

-- =============================================================================
-- CUSTOMER SUCCESS WORKFLOW TABLES
-- =============================================================================

-- Customer journey stages and milestones
CREATE TABLE IF NOT EXISTS customer_journey_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_name TEXT NOT NULL UNIQUE,
  stage_order INTEGER NOT NULL UNIQUE,
  description TEXT,
  target_duration_days INTEGER,
  success_criteria JSONB, -- Conditions for progression
  automatic_progression BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  INDEX idx_journey_stages_order (stage_order)
);

-- Customer onboarding workflows and sequences
CREATE TABLE IF NOT EXISTS onboarding_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name TEXT NOT NULL UNIQUE,
  target_plan TEXT, -- 'trial', 'startup', 'business', 'enterprise', 'all'
  workflow_description TEXT,
  
  -- Workflow settings
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_enroll BOOLEAN NOT NULL DEFAULT true,
  trigger_conditions JSONB, -- When to start this workflow
  
  -- Timing and progression
  total_duration_days INTEGER DEFAULT 14,
  step_intervals INTEGER[] DEFAULT '{1,3,7,10,14}', -- Days for each step
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual workflow steps and touchpoints
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES onboarding_workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_description TEXT,
  
  -- Step configuration
  trigger_delay_days INTEGER NOT NULL DEFAULT 0,
  step_type TEXT NOT NULL CHECK (step_type IN (
    'welcome_email', 'feature_introduction', 'usage_tip', 'milestone_celebration',
    'engagement_check', 'upgrade_prompt', 'trial_reminder', 'retention_offer'
  )),
  
  -- Content and actions
  email_template_id TEXT,
  in_app_message TEXT,
  redirect_url TEXT,
  
  -- Conditions and targeting
  trigger_conditions JSONB, -- When to execute this step
  success_criteria JSONB, -- What defines completion
  
  -- Behavior settings
  auto_execute BOOLEAN NOT NULL DEFAULT true,
  repeatable BOOLEAN NOT NULL DEFAULT false,
  max_executions INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(workflow_id, step_order)
);

-- Customer enrollment and progress tracking
CREATE TABLE IF NOT EXISTS customer_workflow_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID,
  workflow_id UUID NOT NULL REFERENCES onboarding_workflows(id) ON DELETE CASCADE,
  
  -- Enrollment details
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  enrollment_source TEXT DEFAULT 'automatic', -- 'automatic', 'manual', 'trigger'
  
  -- Progress tracking
  current_step_order INTEGER DEFAULT 0,
  current_step_id UUID REFERENCES workflow_steps(id),
  
  -- Status and completion
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'paused', 'completed', 'cancelled', 'failed'
  )),
  completed_at TIMESTAMPTZ,
  completion_reason TEXT,
  
  -- Success metrics
  steps_completed INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  completion_percentage NUMERIC DEFAULT 0,
  
  -- Engagement tracking
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  engagement_score INTEGER DEFAULT 0, -- 0-100 score
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(organization_id, workflow_id),
  INDEX idx_workflow_enrollments_org (organization_id),
  INDEX idx_workflow_enrollments_workflow (workflow_id),
  INDEX idx_workflow_enrollments_status (status),
  INDEX idx_workflow_enrollments_current_step (current_step_id)
);

-- Step execution and interaction tracking
CREATE TABLE IF NOT EXISTS workflow_step_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES customer_workflow_enrollments(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  
  -- Execution details
  execution_order INTEGER NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ,
  
  -- Status and results
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'executing', 'completed', 'failed', 'skipped', 'cancelled'
  )),
  
  -- User interaction tracking
  email_sent BOOLEAN DEFAULT false,
  email_opened BOOLEAN DEFAULT false,
  email_clicked BOOLEAN DEFAULT false,
  in_app_viewed BOOLEAN DEFAULT false,
  in_app_interacted BOOLEAN DEFAULT false,
  
  -- Success criteria evaluation
  success_achieved BOOLEAN DEFAULT false,
  success_criteria_met JSONB,
  
  -- Error handling
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  
  -- Response tracking
  response_data JSONB,
  interaction_score INTEGER DEFAULT 0, -- Contribution to engagement
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  INDEX idx_step_executions_enrollment (enrollment_id),
  INDEX idx_step_executions_step (step_id),
  INDEX idx_step_executions_status (status),
  INDEX idx_step_executions_scheduled (scheduled_at),
  INDEX idx_step_executions_org (organization_id)
);

-- Customer engagement and behavior analytics
CREATE TABLE IF NOT EXISTS customer_engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID,
  enrollment_id UUID REFERENCES customer_workflow_enrollments(id),
  
  -- Event details
  event_type TEXT NOT NULL, -- 'login', 'feature_used', 'milestone_reached', etc.
  event_name TEXT NOT NULL,
  event_data JSONB,
  
  -- Engagement scoring
  engagement_value INTEGER DEFAULT 1, -- Points contributed to engagement score
  milestone_achieved BOOLEAN DEFAULT false,
  
  -- Context and attribution
  workflow_step_id UUID REFERENCES workflow_steps(id),
  attribution_source TEXT, -- Which touchpoint influenced this action
  
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  INDEX idx_engagement_events_org (organization_id),
  INDEX idx_engagement_events_enrollment (enrollment_id),
  INDEX idx_engagement_events_type (event_type),
  INDEX idx_engagement_events_occurred (occurred_at)
);

-- Conversion and success tracking
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID,
  enrollment_id UUID REFERENCES customer_workflow_enrollments(id),
  
  -- Conversion details
  conversion_type TEXT NOT NULL CHECK (conversion_type IN (
    'trial_to_paid', 'plan_upgrade', 'feature_adoption', 'milestone_completion'
  )),
  
  -- Previous and new state
  from_state TEXT,
  to_state TEXT,
  
  -- Financial impact
  revenue_impact DECIMAL(10,2) DEFAULT 0,
  ltv_impact DECIMAL(10,2) DEFAULT 0,
  
  -- Attribution and journey
  workflow_attribution TEXT,
  journey_duration_days INTEGER,
  touchpoint_count INTEGER,
  
  -- Success metrics
  success_score INTEGER DEFAULT 0,
  conversion_confidence NUMERIC DEFAULT 0, -- 0-1 confidence score
  
  converted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  INDEX idx_conversions_org (organization_id),
  INDEX idx_conversions_enrollment (enrollment_id),
  INDEX idx_conversions_type (conversion_type),
  INDEX idx_conversions_converted (converted_at)
);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS
ALTER TABLE customer_journey_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_workflow_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

-- Admin access to configuration tables
CREATE POLICY "Admin can manage journey stages"
  ON customer_journey_stages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('owner@ghostcrm.com', 'admin@ghostcrm.com')
    )
  );

CREATE POLICY "Admin can manage workflows"
  ON onboarding_workflows FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('owner@ghostcrm.com', 'admin@ghostcrm.com')
    )
  );

CREATE POLICY "Admin can manage workflow steps"
  ON workflow_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('owner@ghostcrm.com', 'admin@ghostcrm.com')
    )
  );

-- Organization access to their data
CREATE POLICY "Users can view own organization enrollment"
  ON customer_workflow_enrollments FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage enrollments"
  ON customer_workflow_enrollments FOR ALL
  USING (true);

-- Similar policies for other tables
CREATE POLICY "Users can view own step executions"
  ON workflow_step_executions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage step executions"
  ON workflow_step_executions FOR ALL
  USING (true);

CREATE POLICY "Users can view own engagement events"
  ON customer_engagement_events FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage engagement events"
  ON customer_engagement_events FOR ALL
  USING (true);

CREATE POLICY "Users can view own conversions"
  ON conversion_events FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage conversions"
  ON conversion_events FOR ALL
  USING (true);

-- =============================================================================
-- CORE CUSTOMER SUCCESS FUNCTIONS
-- =============================================================================

-- Function: Enroll customer in workflow
CREATE OR REPLACE FUNCTION enroll_customer_in_workflow(
  p_organization_id UUID,
  p_user_id UUID,
  p_workflow_id UUID,
  p_enrollment_source TEXT DEFAULT 'automatic'
) RETURNS UUID AS $$
DECLARE
  enrollment_id UUID;
  workflow_record RECORD;
  total_step_count INTEGER;
BEGIN
  -- Get workflow details
  SELECT * INTO workflow_record
  FROM onboarding_workflows
  WHERE id = p_workflow_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workflow not found or inactive: %', p_workflow_id;
  END IF;

  -- Check if already enrolled
  IF EXISTS (
    SELECT 1 FROM customer_workflow_enrollments
    WHERE organization_id = p_organization_id AND workflow_id = p_workflow_id
  ) THEN
    RAISE EXCEPTION 'Customer already enrolled in this workflow';
  END IF;

  -- Count total steps
  SELECT COUNT(*) INTO total_step_count
  FROM workflow_steps
  WHERE workflow_id = p_workflow_id;

  -- Create enrollment
  INSERT INTO customer_workflow_enrollments (
    organization_id,
    user_id,
    workflow_id,
    enrollment_source,
    total_steps,
    current_step_order
  ) VALUES (
    p_organization_id,
    p_user_id,
    p_workflow_id,
    p_enrollment_source,
    total_step_count,
    0
  ) RETURNING id INTO enrollment_id;

  -- Schedule first step
  PERFORM schedule_next_workflow_step(enrollment_id);

  RETURN enrollment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Schedule next workflow step
CREATE OR REPLACE FUNCTION schedule_next_workflow_step(
  p_enrollment_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  enrollment_record RECORD;
  next_step_record RECORD;
  execution_time TIMESTAMPTZ;
BEGIN
  -- Get enrollment details
  SELECT * INTO enrollment_record
  FROM customer_workflow_enrollments
  WHERE id = p_enrollment_id AND status = 'active';

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Get next step
  SELECT * INTO next_step_record
  FROM workflow_steps
  WHERE workflow_id = enrollment_record.workflow_id
    AND step_order = enrollment_record.current_step_order + 1;

  IF NOT FOUND THEN
    -- No more steps, complete workflow
    UPDATE customer_workflow_enrollments
    SET 
      status = 'completed',
      completed_at = NOW(),
      completion_reason = 'all_steps_completed',
      completion_percentage = 100,
      updated_at = NOW()
    WHERE id = p_enrollment_id;
    
    RETURN true;
  END IF;

  -- Calculate execution time
  execution_time := enrollment_record.enrolled_at + INTERVAL '1 day' * next_step_record.trigger_delay_days;

  -- Update enrollment with next step
  UPDATE customer_workflow_enrollments
  SET 
    current_step_order = next_step_record.step_order,
    current_step_id = next_step_record.id,
    completion_percentage = round((next_step_record.step_order::FLOAT / total_steps * 100)::NUMERIC, 1),
    updated_at = NOW()
  WHERE id = p_enrollment_id;

  -- Schedule step execution
  INSERT INTO workflow_step_executions (
    enrollment_id,
    step_id,
    organization_id,
    execution_order,
    scheduled_at,
    status
  ) VALUES (
    p_enrollment_id,
    next_step_record.id,
    enrollment_record.organization_id,
    next_step_record.step_order,
    execution_time,
    CASE WHEN execution_time <= NOW() THEN 'executing' ELSE 'pending' END
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Execute workflow step
CREATE OR REPLACE FUNCTION execute_workflow_step(
  p_execution_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  execution_record RECORD;
  step_record RECORD;
  enrollment_record RECORD;
BEGIN
  -- Get execution details with related data
  SELECT 
    wse.*,
    ws.step_type,
    ws.email_template_id,
    ws.in_app_message,
    ws.auto_execute,
    cwe.organization_id,
    cwe.user_id
  INTO execution_record
  FROM workflow_step_executions wse
  JOIN workflow_steps ws ON ws.id = wse.step_id
  JOIN customer_workflow_enrollments cwe ON cwe.id = wse.enrollment_id
  WHERE wse.id = p_execution_id
    AND wse.status = 'pending';

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Update execution status
  UPDATE workflow_step_executions
  SET 
    status = 'executing',
    executed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_execution_id;

  -- Execute step based on type
  CASE execution_record.step_type
    WHEN 'welcome_email', 'feature_introduction', 'usage_tip', 'trial_reminder' THEN
      -- Queue email (would integrate with your email system)
      UPDATE workflow_step_executions
      SET 
        email_sent = true,
        status = 'completed',
        updated_at = NOW()
      WHERE id = p_execution_id;

    WHEN 'milestone_celebration', 'engagement_check' THEN
      -- Create in-app message or notification
      UPDATE workflow_step_executions
      SET 
        in_app_viewed = true,
        status = 'completed',
        updated_at = NOW()
      WHERE id = p_execution_id;

    WHEN 'upgrade_prompt', 'retention_offer' THEN
      -- Special handling for conversion-focused steps
      UPDATE workflow_step_executions
      SET 
        email_sent = true,
        status = 'completed',
        interaction_score = 10, -- Higher score for conversion steps
        updated_at = NOW()
      WHERE id = p_execution_id;

    ELSE
      -- Default execution
      UPDATE workflow_step_executions
      SET 
        status = 'completed',
        updated_at = NOW()
      WHERE id = p_execution_id;
  END CASE;

  -- Update enrollment progress
  UPDATE customer_workflow_enrollments
  SET 
    steps_completed = steps_completed + 1,
    completion_percentage = round(((steps_completed + 1)::FLOAT / total_steps * 100)::NUMERIC, 1),
    last_activity_at = NOW(),
    updated_at = NOW()
  WHERE id = execution_record.enrollment_id;

  -- Schedule next step
  PERFORM schedule_next_workflow_step(execution_record.enrollment_id);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Track customer engagement event
CREATE OR REPLACE FUNCTION track_engagement_event(
  p_organization_id UUID,
  p_user_id UUID,
  p_event_type TEXT,
  p_event_name TEXT,
  p_event_data JSONB DEFAULT NULL,
  p_engagement_value INTEGER DEFAULT 1
) RETURNS UUID AS $$
DECLARE
  event_id UUID;
  enrollment_record RECORD;
  current_score INTEGER;
BEGIN
  -- Create engagement event
  INSERT INTO customer_engagement_events (
    organization_id,
    user_id,
    event_type,
    event_name,
    event_data,
    engagement_value
  ) VALUES (
    p_organization_id,
    p_user_id,
    p_event_type,
    p_event_name,
    p_event_data,
    p_engagement_value
  ) RETURNING id INTO event_id;

  -- Update engagement score in active enrollments
  FOR enrollment_record IN 
    SELECT id, engagement_score
    FROM customer_workflow_enrollments
    WHERE organization_id = p_organization_id 
      AND status = 'active'
  LOOP
    current_score := LEAST(100, enrollment_record.engagement_score + p_engagement_value);
    
    UPDATE customer_workflow_enrollments
    SET 
      engagement_score = current_score,
      last_activity_at = NOW(),
      updated_at = NOW()
    WHERE id = enrollment_record.id;
  END LOOP;

  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Record conversion event
CREATE OR REPLACE FUNCTION record_conversion_event(
  p_organization_id UUID,
  p_user_id UUID,
  p_conversion_type TEXT,
  p_from_state TEXT,
  p_to_state TEXT,
  p_revenue_impact DECIMAL DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  conversion_id UUID;
  enrollment_record RECORD;
  journey_duration INTEGER;
  touchpoint_count INTEGER;
BEGIN
  -- Get related enrollment info
  SELECT 
    id,
    enrolled_at,
    steps_completed
  INTO enrollment_record
  FROM customer_workflow_enrollments
  WHERE organization_id = p_organization_id
    AND status = 'active'
  ORDER BY enrolled_at DESC
  LIMIT 1;

  -- Calculate journey metrics
  IF enrollment_record.id IS NOT NULL THEN
    journey_duration := EXTRACT(DAYS FROM NOW() - enrollment_record.enrolled_at);
    
    SELECT COUNT(*) INTO touchpoint_count
    FROM workflow_step_executions
    WHERE enrollment_id = enrollment_record.id
      AND status = 'completed';
  ELSE
    journey_duration := 0;
    touchpoint_count := 0;
  END IF;

  -- Create conversion event
  INSERT INTO conversion_events (
    organization_id,
    user_id,
    enrollment_id,
    conversion_type,
    from_state,
    to_state,
    revenue_impact,
    journey_duration_days,
    touchpoint_count,
    success_score
  ) VALUES (
    p_organization_id,
    p_user_id,
    enrollment_record.id,
    p_conversion_type,
    p_from_state,
    p_to_state,
    p_revenue_impact,
    journey_duration,
    touchpoint_count,
    CASE p_conversion_type
      WHEN 'trial_to_paid' THEN 100
      WHEN 'plan_upgrade' THEN 75
      WHEN 'feature_adoption' THEN 50
      ELSE 25
    END
  ) RETURNING id INTO conversion_id;

  -- Complete enrollment if it's a trial conversion
  IF p_conversion_type = 'trial_to_paid' AND enrollment_record.id IS NOT NULL THEN
    UPDATE customer_workflow_enrollments
    SET 
      status = 'completed',
      completed_at = NOW(),
      completion_reason = 'converted_to_paid',
      updated_at = NOW()
    WHERE id = enrollment_record.id;
  END IF;

  RETURN conversion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get customer success dashboard
CREATE OR REPLACE FUNCTION get_customer_success_dashboard(
  p_organization_id UUID DEFAULT NULL
) RETURNS TABLE (
  active_enrollments INTEGER,
  completed_workflows INTEGER,
  trial_conversions INTEGER,
  avg_engagement_score NUMERIC,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH enrollment_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE status = 'active') as active,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      AVG(engagement_score) FILTER (WHERE status = 'active') as avg_engagement
    FROM customer_workflow_enrollments
    WHERE (p_organization_id IS NULL OR organization_id = p_organization_id)
  ),
  conversion_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE conversion_type = 'trial_to_paid') as conversions,
      COUNT(*) as total_enrollments
    FROM conversion_events ce
    WHERE (p_organization_id IS NULL OR organization_id = p_organization_id)
      AND created_at >= NOW() - INTERVAL '30 days'
  )
  SELECT 
    es.active::INTEGER,
    es.completed::INTEGER,
    cs.conversions::INTEGER,
    COALESCE(round(es.avg_engagement::NUMERIC, 1), 0),
    CASE 
      WHEN cs.total_enrollments > 0 THEN 
        round((cs.conversions::FLOAT / cs.total_enrollments * 100)::NUMERIC, 2)
      ELSE 0
    END
  FROM enrollment_stats es
  CROSS JOIN conversion_stats cs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- DEFAULT DATA AND CONFIGURATIONS
-- =============================================================================

-- Insert default customer journey stages
INSERT INTO customer_journey_stages (stage_name, stage_order, description, target_duration_days) VALUES
('trial_signup', 1, 'Customer has signed up for trial', 0),
('initial_setup', 2, 'Customer is setting up their account', 1),
('first_usage', 3, 'Customer has used core features', 3),
('engagement_building', 4, 'Customer is actively using the platform', 7),
('value_realization', 5, 'Customer has achieved initial value', 10),
('conversion_ready', 6, 'Customer is ready for paid conversion', 14),
('paid_customer', 7, 'Customer has converted to paid plan', 0)
ON CONFLICT (stage_name) DO NOTHING;

-- Insert default trial onboarding workflow
INSERT INTO onboarding_workflows (
  workflow_name, 
  target_plan, 
  workflow_description, 
  total_duration_days,
  step_intervals
) VALUES (
  'Trial Onboarding Sequence',
  'trial',
  'Comprehensive 14-day trial onboarding with conversion optimization',
  14,
  '{0,1,3,7,10,12,14}'
) ON CONFLICT (workflow_name) DO NOTHING;

-- Insert default workflow steps for trial onboarding
WITH workflow_data AS (
  SELECT id as workflow_id FROM onboarding_workflows WHERE workflow_name = 'Trial Onboarding Sequence'
)
INSERT INTO workflow_steps (workflow_id, step_order, step_name, step_description, trigger_delay_days, step_type) 
SELECT 
  wd.workflow_id,
  step_order,
  step_name,
  step_description,
  trigger_delay_days,
  step_type
FROM workflow_data wd,
VALUES 
  (1, 'Welcome & Setup', 'Welcome email with setup guidance', 0, 'welcome_email'),
  (2, 'Feature Introduction', 'Introduction to core features', 1, 'feature_introduction'),
  (3, 'Usage Tips', 'Best practices and usage tips', 3, 'usage_tip'),
  (4, 'Milestone Check', 'Check on progress and engagement', 7, 'engagement_check'),
  (5, 'Value Demonstration', 'Show value achieved so far', 10, 'milestone_celebration'),
  (6, 'Upgrade Prompt', 'Invitation to upgrade with benefits', 12, 'upgrade_prompt'),
  (7, 'Final Reminder', 'Last chance trial conversion', 14, 'trial_reminder')
AS step_data(step_order, step_name, step_description, trigger_delay_days, step_type)
ON CONFLICT (workflow_id, step_order) DO NOTHING;

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- =============================================================================

GRANT ALL ON customer_journey_stages TO service_role;
GRANT ALL ON onboarding_workflows TO service_role;
GRANT ALL ON workflow_steps TO service_role;
GRANT ALL ON customer_workflow_enrollments TO service_role;
GRANT ALL ON workflow_step_executions TO service_role;
GRANT ALL ON customer_engagement_events TO service_role;
GRANT ALL ON conversion_events TO service_role;

GRANT EXECUTE ON FUNCTION enroll_customer_in_workflow TO service_role;
GRANT EXECUTE ON FUNCTION schedule_next_workflow_step TO service_role;
GRANT EXECUTE ON FUNCTION execute_workflow_step TO service_role;
GRANT EXECUTE ON FUNCTION track_engagement_event TO service_role;
GRANT EXECUTE ON FUNCTION record_conversion_event TO service_role;
GRANT EXECUTE ON FUNCTION get_customer_success_dashboard TO service_role;

-- =============================================================================
-- COMMENTS AND DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE customer_journey_stages IS 'Defines the stages of customer journey from trial to paid conversion';
COMMENT ON TABLE onboarding_workflows IS 'Configurable workflows for customer onboarding and engagement sequences';
COMMENT ON TABLE workflow_steps IS 'Individual steps and touchpoints within onboarding workflows';
COMMENT ON TABLE customer_workflow_enrollments IS 'Tracks customer enrollment and progress through workflows';
COMMENT ON TABLE workflow_step_executions IS 'Logs execution and interaction with individual workflow steps';
COMMENT ON TABLE customer_engagement_events IS 'Records customer engagement activities and behavior analytics';
COMMENT ON TABLE conversion_events IS 'Tracks successful conversions and their attribution to workflows';

COMMENT ON FUNCTION enroll_customer_in_workflow IS 'Enrolls a customer in an onboarding workflow and schedules initial steps';
COMMENT ON FUNCTION schedule_next_workflow_step IS 'Schedules the next step in a customer workflow sequence';
COMMENT ON FUNCTION execute_workflow_step IS 'Executes a workflow step and tracks customer interaction';
COMMENT ON FUNCTION track_engagement_event IS 'Records customer engagement events and updates engagement scores';
COMMENT ON FUNCTION record_conversion_event IS 'Records conversion events with journey attribution and metrics';
COMMENT ON FUNCTION get_customer_success_dashboard IS 'Provides dashboard metrics for customer success performance';