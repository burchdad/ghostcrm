-- Migration: Usage Alerts and Monitoring System
-- File: migrations/014_usage_alerts_system.sql
-- Purpose: Implement automated usage monitoring and alert system for subscription limits
-- Dependencies: Existing billing tables, RLS policies

-- =============================================================================
-- USAGE ALERTS SYSTEM TABLES
-- =============================================================================

-- Usage monitoring configuration
CREATE TABLE IF NOT EXISTS usage_alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  limit_type TEXT NOT NULL CHECK (limit_type IN ('monthly', 'daily', 'total')),
  limit_value INTEGER NOT NULL,
  warning_thresholds INTEGER[] NOT NULL DEFAULT '{75,90,95}', -- Percentage thresholds
  alert_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  slack_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(plan_name, feature_name, limit_type)
);

-- Usage tracking and current counts
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID,
  feature_name TEXT NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  monthly_count INTEGER NOT NULL DEFAULT 0,
  daily_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(organization_id, feature_name, usage_date)
);

-- Alert history and status
CREATE TABLE IF NOT EXISTS usage_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID,
  plan_name TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('warning', 'limit_reached', 'overage')),
  threshold_percentage INTEGER NOT NULL,
  current_usage INTEGER NOT NULL,
  usage_limit INTEGER NOT NULL,
  alert_level TEXT NOT NULL CHECK (alert_level IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  sms_sent BOOLEAN NOT NULL DEFAULT false,
  slack_sent BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  INDEX idx_usage_alerts_org_feature (organization_id, feature_name),
  INDEX idx_usage_alerts_created (created_at),
  INDEX idx_usage_alerts_resolved (resolved_at)
);

-- Alert delivery tracking
CREATE TABLE IF NOT EXISTS alert_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES usage_alerts(id) ON DELETE CASCADE,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'sms', 'slack', 'webhook')),
  recipient TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  response_data JSONB,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  failed_reason TEXT,
  
  INDEX idx_alert_delivery_alert (alert_id),
  INDEX idx_alert_delivery_status (status),
  INDEX idx_alert_delivery_method (delivery_method)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_usage_tracking_org_feature_date 
  ON usage_tracking(organization_id, feature_name, usage_date);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_monthly 
  ON usage_tracking(organization_id, feature_name) 
  WHERE usage_date >= date_trunc('month', CURRENT_DATE);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS
ALTER TABLE usage_alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_delivery_log ENABLE ROW LEVEL SECURITY;

-- Policies for usage_alert_configs (admin only)
CREATE POLICY "Admin can manage usage alert configs"
  ON usage_alert_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN (
        'owner@ghostcrm.com',
        'admin@ghostcrm.com'
      )
    )
  );

-- Policies for usage_tracking
CREATE POLICY "Users can view own organization usage"
  ON usage_tracking FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert usage tracking"
  ON usage_tracking FOR INSERT
  WITH CHECK (true); -- Allows service role to insert

CREATE POLICY "System can update usage tracking"
  ON usage_tracking FOR UPDATE
  USING (true); -- Allows service role to update

-- Policies for usage_alerts
CREATE POLICY "Users can view own organization alerts"
  ON usage_alerts FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage usage alerts"
  ON usage_alerts FOR ALL
  USING (true); -- Allows service role to manage alerts

-- Policies for alert_delivery_log (admin only)
CREATE POLICY "Admin can view alert delivery logs"
  ON alert_delivery_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN (
        'owner@ghostcrm.com',
        'admin@ghostcrm.com'
      )
    )
  );

-- =============================================================================
-- CORE FUNCTIONS
-- =============================================================================

-- Function: Update usage tracking
CREATE OR REPLACE FUNCTION update_usage_tracking(
  p_organization_id UUID,
  p_user_id UUID,
  p_feature_name TEXT,
  p_increment INTEGER DEFAULT 1
) RETURNS VOID AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  current_month DATE := date_trunc('month', CURRENT_DATE);
BEGIN
  -- Insert or update daily usage
  INSERT INTO usage_tracking (
    organization_id,
    user_id,
    feature_name,
    usage_date,
    usage_count,
    daily_count
  )
  VALUES (
    p_organization_id,
    p_user_id,
    p_feature_name,
    current_date,
    p_increment,
    p_increment
  )
  ON CONFLICT (organization_id, feature_name, usage_date)
  DO UPDATE SET
    usage_count = usage_tracking.usage_count + p_increment,
    daily_count = usage_tracking.daily_count + p_increment,
    updated_at = NOW();

  -- Update monthly count for the current month
  UPDATE usage_tracking 
  SET 
    monthly_count = (
      SELECT COALESCE(SUM(daily_count), 0)
      FROM usage_tracking ut
      WHERE ut.organization_id = p_organization_id
        AND ut.feature_name = p_feature_name
        AND ut.usage_date >= current_month
        AND ut.usage_date < current_month + INTERVAL '1 month'
    ),
    updated_at = NOW()
  WHERE organization_id = p_organization_id
    AND feature_name = p_feature_name
    AND usage_date >= current_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check usage limits and create alerts
CREATE OR REPLACE FUNCTION check_usage_limits(
  p_organization_id UUID,
  p_feature_name TEXT
) RETURNS VOID AS $$
DECLARE
  org_subscription RECORD;
  usage_config RECORD;
  current_usage INTEGER;
  usage_limit INTEGER;
  threshold_percent INTEGER;
  alert_level TEXT;
  alert_message TEXT;
BEGIN
  -- Get organization subscription
  SELECT s.* INTO org_subscription
  FROM subscriptions s
  WHERE s.organization_id = p_organization_id
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN; -- No active subscription
  END IF;

  -- Get usage configuration for this plan and feature
  SELECT * INTO usage_config
  FROM usage_alert_configs
  WHERE plan_name = org_subscription.plan_name
    AND feature_name = p_feature_name
    AND alert_enabled = true;

  IF NOT FOUND THEN
    RETURN; -- No alert config for this feature
  END IF;

  -- Get current usage based on limit type
  IF usage_config.limit_type = 'monthly' THEN
    SELECT COALESCE(MAX(monthly_count), 0) INTO current_usage
    FROM usage_tracking
    WHERE organization_id = p_organization_id
      AND feature_name = p_feature_name
      AND usage_date >= date_trunc('month', CURRENT_DATE);
  ELSIF usage_config.limit_type = 'daily' THEN
    SELECT COALESCE(MAX(daily_count), 0) INTO current_usage
    FROM usage_tracking
    WHERE organization_id = p_organization_id
      AND feature_name = p_feature_name
      AND usage_date = CURRENT_DATE;
  ELSE -- 'total'
    SELECT COALESCE(SUM(usage_count), 0) INTO current_usage
    FROM usage_tracking
    WHERE organization_id = p_organization_id
      AND feature_name = p_feature_name;
  END IF;

  usage_limit := usage_config.limit_value;

  -- Check if we need to create alerts
  FOR i IN 1..array_length(usage_config.warning_thresholds, 1) LOOP
    threshold_percent := usage_config.warning_thresholds[i];
    
    -- Skip if usage hasn't reached this threshold
    IF current_usage < (usage_limit * threshold_percent / 100) THEN
      CONTINUE;
    END IF;

    -- Check if we already sent this alert today
    IF EXISTS (
      SELECT 1 FROM usage_alerts
      WHERE organization_id = p_organization_id
        AND feature_name = p_feature_name
        AND threshold_percentage = threshold_percent
        AND created_at >= CURRENT_DATE
    ) THEN
      CONTINUE;
    END IF;

    -- Determine alert level and message
    IF threshold_percent >= 95 THEN
      alert_level := 'critical';
      IF current_usage >= usage_limit THEN
        alert_message := format('CRITICAL: %s limit exceeded! Usage: %s/%s (%s%%)', 
          p_feature_name, current_usage, usage_limit, 
          round((current_usage::FLOAT / usage_limit * 100)::NUMERIC, 1));
      ELSE
        alert_message := format('CRITICAL: %s usage at %s%% of limit (%s/%s)', 
          p_feature_name, threshold_percent, current_usage, usage_limit);
      END IF;
    ELSIF threshold_percent >= 90 THEN
      alert_level := 'warning';
      alert_message := format('WARNING: %s usage at %s%% of limit (%s/%s)', 
        p_feature_name, threshold_percent, current_usage, usage_limit);
    ELSE
      alert_level := 'info';
      alert_message := format('INFO: %s usage at %s%% of limit (%s/%s)', 
        p_feature_name, threshold_percent, current_usage, usage_limit);
    END IF;

    -- Create the alert
    INSERT INTO usage_alerts (
      organization_id,
      user_id, -- Will be set by calling context
      plan_name,
      feature_name,
      alert_type,
      threshold_percentage,
      current_usage,
      usage_limit,
      alert_level,
      message
    ) VALUES (
      p_organization_id,
      NULL, -- Will be updated by trigger or calling code
      org_subscription.plan_name,
      p_feature_name,
      CASE 
        WHEN current_usage >= usage_limit THEN 'limit_reached'
        WHEN current_usage > usage_limit THEN 'overage'
        ELSE 'warning'
      END,
      threshold_percent,
      current_usage,
      usage_limit,
      alert_level,
      alert_message
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get usage summary for organization
CREATE OR REPLACE FUNCTION get_usage_summary(
  p_organization_id UUID,
  p_period TEXT DEFAULT 'monthly'
) RETURNS TABLE (
  feature_name TEXT,
  current_usage INTEGER,
  usage_limit INTEGER,
  usage_percentage NUMERIC,
  limit_type TEXT,
  alert_level TEXT,
  last_alert_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH subscription_info AS (
    SELECT s.plan_name
    FROM subscriptions s
    WHERE s.organization_id = p_organization_id
      AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1
  ),
  current_usage AS (
    SELECT 
      ut.feature_name,
      CASE 
        WHEN uac.limit_type = 'monthly' THEN COALESCE(MAX(ut.monthly_count), 0)
        WHEN uac.limit_type = 'daily' THEN COALESCE(MAX(ut.daily_count), 0)
        ELSE COALESCE(SUM(ut.usage_count), 0)
      END as usage_count,
      uac.limit_value,
      uac.limit_type
    FROM usage_tracking ut
    JOIN usage_alert_configs uac ON uac.feature_name = ut.feature_name
    JOIN subscription_info si ON si.plan_name = uac.plan_name
    WHERE ut.organization_id = p_organization_id
      AND (
        (uac.limit_type = 'monthly' AND ut.usage_date >= date_trunc('month', CURRENT_DATE)) OR
        (uac.limit_type = 'daily' AND ut.usage_date = CURRENT_DATE) OR
        (uac.limit_type = 'total')
      )
    GROUP BY ut.feature_name, uac.limit_value, uac.limit_type
  ),
  latest_alerts AS (
    SELECT 
      ua.feature_name,
      ua.alert_level,
      MAX(ua.created_at) as last_alert_at
    FROM usage_alerts ua
    WHERE ua.organization_id = p_organization_id
      AND ua.created_at >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY ua.feature_name, ua.alert_level
  )
  SELECT 
    cu.feature_name,
    cu.usage_count::INTEGER,
    cu.limit_value::INTEGER,
    CASE 
      WHEN cu.limit_value > 0 THEN round((cu.usage_count::FLOAT / cu.limit_value * 100)::NUMERIC, 1)
      ELSE 0
    END,
    cu.limit_type,
    COALESCE(la.alert_level, 'none'),
    la.last_alert_at
  FROM current_usage cu
  LEFT JOIN latest_alerts la ON la.feature_name = cu.feature_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TRIGGERS AND AUTOMATION
-- =============================================================================

-- Trigger: Auto-check limits when usage is updated
CREATE OR REPLACE FUNCTION trigger_usage_limit_check()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue limit check for this organization and feature
  PERFORM check_usage_limits(NEW.organization_id, NEW.feature_name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER usage_tracking_limit_check
  AFTER INSERT OR UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION trigger_usage_limit_check();

-- =============================================================================
-- SAMPLE DATA AND CONFIGURATIONS
-- =============================================================================

-- Insert default alert configurations for common plans
INSERT INTO usage_alert_configs (plan_name, feature_name, limit_type, limit_value, warning_thresholds) VALUES
('startup', 'leads', 'monthly', 100, '{75,90,95}'),
('startup', 'sms_messages', 'monthly', 500, '{80,95,100}'),
('startup', 'phone_calls', 'monthly', 50, '{80,90,95}'),
('business', 'leads', 'monthly', 1000, '{75,90,95}'),
('business', 'sms_messages', 'monthly', 2000, '{80,95,100}'),
('business', 'phone_calls', 'monthly', 200, '{80,90,95}'),
('business', 'automations', 'monthly', 50, '{75,90,95}'),
('enterprise', 'leads', 'monthly', 10000, '{85,95,98}'),
('enterprise', 'sms_messages', 'monthly', 10000, '{85,95,98}'),
('enterprise', 'phone_calls', 'monthly', 1000, '{85,95,98}'),
('enterprise', 'automations', 'monthly', 500, '{85,95,98}')
ON CONFLICT (plan_name, feature_name, limit_type) DO NOTHING;

-- =============================================================================
-- COMMENTS AND DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE usage_alert_configs IS 'Configuration for usage monitoring and alert thresholds per plan and feature';
COMMENT ON TABLE usage_tracking IS 'Real-time tracking of feature usage by organization and date';
COMMENT ON TABLE usage_alerts IS 'Generated alerts when usage thresholds are exceeded';
COMMENT ON TABLE alert_delivery_log IS 'Log of alert delivery attempts across different channels';

COMMENT ON FUNCTION update_usage_tracking IS 'Increments usage counter for a feature and triggers limit checks';
COMMENT ON FUNCTION check_usage_limits IS 'Evaluates current usage against limits and creates alerts when thresholds are exceeded';
COMMENT ON FUNCTION get_usage_summary IS 'Returns comprehensive usage overview for an organization with alert status';

-- Grant permissions to service role
GRANT ALL ON usage_alert_configs TO service_role;
GRANT ALL ON usage_tracking TO service_role;
GRANT ALL ON usage_alerts TO service_role;
GRANT ALL ON alert_delivery_log TO service_role;

GRANT EXECUTE ON FUNCTION update_usage_tracking TO service_role;
GRANT EXECUTE ON FUNCTION check_usage_limits TO service_role;
GRANT EXECUTE ON FUNCTION get_usage_summary TO service_role;