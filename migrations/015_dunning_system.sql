-- Migration: Automated Dunning System
-- File: migrations/015_dunning_system.sql
-- Purpose: Implement automated failed payment recovery with retry logic and customer communication
-- Dependencies: Existing billing tables, Stripe integration, notification system

-- =============================================================================
-- DUNNING SYSTEM TABLES
-- =============================================================================

-- Dunning configuration and rules
CREATE TABLE IF NOT EXISTS dunning_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  grace_period_days INTEGER NOT NULL DEFAULT 3,
  max_retry_attempts INTEGER NOT NULL DEFAULT 3,
  retry_intervals INTEGER[] NOT NULL DEFAULT '{1,3,7}', -- Days between retries
  suspension_delay_days INTEGER NOT NULL DEFAULT 7,
  auto_cancel_days INTEGER NOT NULL DEFAULT 30,
  send_email_notifications BOOLEAN NOT NULL DEFAULT true,
  send_sms_notifications BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(plan_name)
);

-- Failed payment tracking and retry management
CREATE TABLE IF NOT EXISTS dunning_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  subscription_id UUID,
  stripe_subscription_id TEXT,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  payment_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  failure_reason TEXT,
  failure_code TEXT,
  
  -- Dunning status and progression
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'retrying', 'grace_period', 'suspended', 'recovered', 'cancelled', 'resolved'
  )),
  current_retry_attempt INTEGER NOT NULL DEFAULT 0,
  max_retry_attempts INTEGER NOT NULL DEFAULT 3,
  
  -- Important dates
  payment_failed_at TIMESTAMPTZ NOT NULL,
  grace_period_ends_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  recovered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  -- Customer communication tracking
  emails_sent INTEGER NOT NULL DEFAULT 0,
  sms_sent INTEGER NOT NULL DEFAULT 0,
  last_notification_sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  INDEX idx_dunning_cases_org (organization_id),
  INDEX idx_dunning_cases_status (status),
  INDEX idx_dunning_cases_next_retry (next_retry_at),
  INDEX idx_dunning_cases_stripe_sub (stripe_subscription_id),
  INDEX idx_dunning_cases_stripe_invoice (stripe_invoice_id)
);

-- Payment retry attempts log
CREATE TABLE IF NOT EXISTS payment_retry_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dunning_case_id UUID NOT NULL REFERENCES dunning_cases(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  
  -- Attempt details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method_id TEXT,
  
  -- Results
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
  failure_reason TEXT,
  failure_code TEXT,
  
  -- Timing
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  
  INDEX idx_retry_attempts_case (dunning_case_id),
  INDEX idx_retry_attempts_status (status),
  INDEX idx_retry_attempts_attempted (attempted_at)
);

-- Customer communication log
CREATE TABLE IF NOT EXISTS dunning_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dunning_case_id UUID NOT NULL REFERENCES dunning_cases(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  
  -- Communication details
  communication_type TEXT NOT NULL CHECK (communication_type IN (
    'payment_failed', 'retry_reminder', 'grace_period_warning', 
    'suspension_notice', 'final_notice', 'account_suspended', 
    'payment_recovered', 'welcome_back'
  )),
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'sms', 'in_app', 'webhook')),
  
  -- Recipients and content
  recipient_email TEXT,
  recipient_phone TEXT,
  subject TEXT,
  message_body TEXT,
  template_id TEXT,
  
  -- Delivery tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked'
  )),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  
  -- Provider details
  provider TEXT, -- 'sendgrid', 'twilio', etc.
  provider_message_id TEXT,
  provider_response JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  INDEX idx_dunning_comms_case (dunning_case_id),
  INDEX idx_dunning_comms_org (organization_id),
  INDEX idx_dunning_comms_type (communication_type),
  INDEX idx_dunning_comms_status (status),
  INDEX idx_dunning_comms_sent (sent_at)
);

-- Account status changes log
CREATE TABLE IF NOT EXISTS account_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  dunning_case_id UUID REFERENCES dunning_cases(id) ON DELETE SET NULL,
  
  -- Status change details
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  reason TEXT NOT NULL,
  changed_by TEXT, -- 'system', 'admin', 'customer'
  
  -- Impact details
  services_affected TEXT[], -- ['billing', 'api_access', 'features']
  access_restrictions JSONB,
  
  -- Timing
  effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  INDEX idx_account_status_org (organization_id),
  INDEX idx_account_status_case (dunning_case_id),
  INDEX idx_account_status_effective (effective_at)
);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS
ALTER TABLE dunning_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dunning_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_retry_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dunning_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_status_log ENABLE ROW LEVEL SECURITY;

-- Admin access to dunning configs
CREATE POLICY "Admin can manage dunning configs"
  ON dunning_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('owner@ghostcrm.com', 'admin@ghostcrm.com')
    )
  );

-- Organization access to their dunning cases
CREATE POLICY "Users can view own organization dunning cases"
  ON dunning_cases FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage dunning cases"
  ON dunning_cases FOR ALL
  USING (true); -- Service role access

-- Similar policies for related tables
CREATE POLICY "Users can view own organization retry attempts"
  ON payment_retry_attempts FOR SELECT
  USING (
    dunning_case_id IN (
      SELECT id FROM dunning_cases
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can manage retry attempts"
  ON payment_retry_attempts FOR ALL
  USING (true);

CREATE POLICY "Users can view own organization communications"
  ON dunning_communications FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage communications"
  ON dunning_communications FOR ALL
  USING (true);

CREATE POLICY "Users can view own organization status log"
  ON account_status_log FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage status log"
  ON account_status_log FOR ALL
  USING (true);

-- =============================================================================
-- CORE DUNNING FUNCTIONS
-- =============================================================================

-- Function: Create new dunning case for failed payment
CREATE OR REPLACE FUNCTION create_dunning_case(
  p_organization_id UUID,
  p_subscription_id UUID,
  p_stripe_subscription_id TEXT,
  p_stripe_invoice_id TEXT,
  p_stripe_payment_intent_id TEXT,
  p_payment_amount DECIMAL,
  p_currency TEXT DEFAULT 'USD',
  p_failure_reason TEXT DEFAULT NULL,
  p_failure_code TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  dunning_case_id UUID;
  config_record RECORD;
  subscription_record RECORD;
  grace_period_end TIMESTAMPTZ;
  next_retry TIMESTAMPTZ;
BEGIN
  -- Get subscription details
  SELECT * INTO subscription_record
  FROM subscriptions
  WHERE id = p_subscription_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found: %', p_subscription_id;
  END IF;

  -- Get dunning configuration for this plan
  SELECT * INTO config_record
  FROM dunning_configs
  WHERE plan_name = subscription_record.plan_name;

  -- Use default config if not found
  IF NOT FOUND THEN
    config_record.grace_period_days := 3;
    config_record.max_retry_attempts := 3;
    config_record.retry_intervals := ARRAY[1,3,7];
  END IF;

  -- Calculate important dates
  grace_period_end := NOW() + INTERVAL '1 day' * config_record.grace_period_days;
  next_retry := NOW() + INTERVAL '1 day' * config_record.retry_intervals[1];

  -- Create dunning case
  INSERT INTO dunning_cases (
    organization_id,
    subscription_id,
    stripe_subscription_id,
    stripe_invoice_id,
    stripe_payment_intent_id,
    payment_amount,
    currency,
    failure_reason,
    failure_code,
    status,
    max_retry_attempts,
    payment_failed_at,
    grace_period_ends_at,
    next_retry_at
  ) VALUES (
    p_organization_id,
    p_subscription_id,
    p_stripe_subscription_id,
    p_stripe_invoice_id,
    p_stripe_payment_intent_id,
    p_payment_amount,
    p_currency,
    p_failure_reason,
    p_failure_code,
    'active',
    config_record.max_retry_attempts,
    NOW(),
    grace_period_end,
    next_retry
  ) RETURNING id INTO dunning_case_id;

  -- Queue initial failed payment notification
  PERFORM queue_dunning_notification(
    dunning_case_id,
    'payment_failed'
  );

  RETURN dunning_case_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Process dunning case retry
CREATE OR REPLACE FUNCTION process_dunning_retry(
  p_dunning_case_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  case_record RECORD;
  config_record RECORD;
  retry_interval INTEGER;
  next_retry_date TIMESTAMPTZ;
BEGIN
  -- Get dunning case details
  SELECT * INTO case_record
  FROM dunning_cases
  WHERE id = p_dunning_case_id
    AND status IN ('active', 'retrying');

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check if we've exceeded max retries
  IF case_record.current_retry_attempt >= case_record.max_retry_attempts THEN
    -- Move to grace period or suspension
    UPDATE dunning_cases
    SET 
      status = CASE 
        WHEN grace_period_ends_at > NOW() THEN 'grace_period'
        ELSE 'suspended'
      END,
      suspended_at = CASE 
        WHEN grace_period_ends_at <= NOW() THEN NOW()
        ELSE NULL
      END,
      updated_at = NOW()
    WHERE id = p_dunning_case_id;

    -- Queue appropriate notification
    IF case_record.grace_period_ends_at > NOW() THEN
      PERFORM queue_dunning_notification(p_dunning_case_id, 'grace_period_warning');
    ELSE
      PERFORM queue_dunning_notification(p_dunning_case_id, 'account_suspended');
      PERFORM suspend_organization_access(case_record.organization_id, p_dunning_case_id);
    END IF;

    RETURN true;
  END IF;

  -- Get configuration for retry interval
  SELECT * INTO config_record
  FROM dunning_configs dc
  JOIN subscriptions s ON s.plan_name = dc.plan_name
  WHERE s.id = case_record.subscription_id;

  -- Calculate next retry interval
  IF config_record.retry_intervals IS NOT NULL 
     AND array_length(config_record.retry_intervals, 1) > case_record.current_retry_attempt THEN
    retry_interval := config_record.retry_intervals[case_record.current_retry_attempt + 1];
  ELSE
    retry_interval := 7; -- Default to weekly retries
  END IF;

  next_retry_date := NOW() + INTERVAL '1 day' * retry_interval;

  -- Update case for next retry
  UPDATE dunning_cases
  SET 
    status = 'retrying',
    current_retry_attempt = current_retry_attempt + 1,
    next_retry_at = next_retry_date,
    updated_at = NOW()
  WHERE id = p_dunning_case_id;

  -- Log the retry attempt
  INSERT INTO payment_retry_attempts (
    dunning_case_id,
    attempt_number,
    amount,
    currency,
    status,
    next_retry_at
  ) VALUES (
    p_dunning_case_id,
    case_record.current_retry_attempt + 1,
    case_record.payment_amount,
    case_record.currency,
    'pending',
    next_retry_date
  );

  -- Queue retry reminder notification
  PERFORM queue_dunning_notification(p_dunning_case_id, 'retry_reminder');

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Mark dunning case as recovered
CREATE OR REPLACE FUNCTION recover_dunning_case(
  p_dunning_case_id UUID,
  p_stripe_payment_intent_id TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  case_record RECORD;
BEGIN
  -- Get and update dunning case
  UPDATE dunning_cases
  SET 
    status = 'recovered',
    recovered_at = NOW(),
    resolved_at = NOW(),
    updated_at = NOW()
  WHERE id = p_dunning_case_id
    AND status IN ('active', 'retrying', 'grace_period', 'suspended')
  RETURNING * INTO case_record;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Update the latest retry attempt as successful
  UPDATE payment_retry_attempts
  SET 
    status = 'succeeded',
    completed_at = NOW(),
    stripe_payment_intent_id = p_stripe_payment_intent_id
  WHERE dunning_case_id = p_dunning_case_id
    AND status = 'pending'
    AND attempt_number = case_record.current_retry_attempt;

  -- Restore organization access if it was suspended
  IF case_record.status = 'suspended' THEN
    PERFORM restore_organization_access(case_record.organization_id, p_dunning_case_id);
  END IF;

  -- Queue welcome back notification
  PERFORM queue_dunning_notification(p_dunning_case_id, 'payment_recovered');

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Queue dunning notification
CREATE OR REPLACE FUNCTION queue_dunning_notification(
  p_dunning_case_id UUID,
  p_communication_type TEXT
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  case_record RECORD;
  org_record RECORD;
  subject_text TEXT;
  message_text TEXT;
BEGIN
  -- Get dunning case and organization details
  SELECT 
    dc.*,
    o.name as org_name,
    o.owner_email,
    o.owner_phone
  INTO case_record
  FROM dunning_cases dc
  JOIN organizations o ON o.id = dc.organization_id
  WHERE dc.id = p_dunning_case_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Generate message content based on type
  CASE p_communication_type
    WHEN 'payment_failed' THEN
      subject_text := 'Payment Failed - Action Required';
      message_text := format('Your payment of %s failed. We''ll retry automatically, but please update your payment method to avoid service disruption.', 
        case_record.payment_amount);
    
    WHEN 'retry_reminder' THEN
      subject_text := 'Payment Retry Reminder';
      message_text := format('We''re retrying your failed payment of %s. Attempt %s of %s. Please ensure your payment method is up to date.', 
        case_record.payment_amount, case_record.current_retry_attempt, case_record.max_retry_attempts);
    
    WHEN 'grace_period_warning' THEN
      subject_text := 'Final Notice - Payment Required';
      message_text := format('Your account will be suspended soon due to failed payment of %s. Please update your payment method immediately.', 
        case_record.payment_amount);
    
    WHEN 'account_suspended' THEN
      subject_text := 'Account Suspended - Payment Required';
      message_text := format('Your account has been suspended due to failed payment of %s. Please update your payment method to restore access.', 
        case_record.payment_amount);
    
    WHEN 'payment_recovered' THEN
      subject_text := 'Welcome Back - Payment Successful';
      message_text := 'Your payment has been successfully processed and your account access has been restored.';
    
    ELSE
      subject_text := 'Account Notice';
      message_text := 'There has been an update to your account status.';
  END CASE;

  -- Create communication record
  INSERT INTO dunning_communications (
    dunning_case_id,
    organization_id,
    communication_type,
    delivery_method,
    recipient_email,
    recipient_phone,
    subject,
    message_body,
    status
  ) VALUES (
    p_dunning_case_id,
    case_record.organization_id,
    p_communication_type,
    'email', -- Primary delivery method
    case_record.owner_email,
    case_record.owner_phone,
    subject_text,
    message_text,
    'pending'
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Suspend organization access
CREATE OR REPLACE FUNCTION suspend_organization_access(
  p_organization_id UUID,
  p_dunning_case_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Log status change
  INSERT INTO account_status_log (
    organization_id,
    dunning_case_id,
    previous_status,
    new_status,
    reason,
    changed_by,
    services_affected,
    access_restrictions
  ) VALUES (
    p_organization_id,
    p_dunning_case_id,
    'active',
    'suspended',
    'Payment failure - dunning process',
    'system',
    ARRAY['api_access', 'features', 'billing'],
    '{"api_calls": false, "feature_access": false, "data_export": false}'::JSONB
  );

  -- Update organization status
  UPDATE organizations
  SET 
    status = 'suspended',
    suspended_at = NOW(),
    suspension_reason = 'payment_failure',
    updated_at = NOW()
  WHERE id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Restore organization access
CREATE OR REPLACE FUNCTION restore_organization_access(
  p_organization_id UUID,
  p_dunning_case_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Log status change
  INSERT INTO account_status_log (
    organization_id,
    dunning_case_id,
    previous_status,
    new_status,
    reason,
    changed_by,
    services_affected
  ) VALUES (
    p_organization_id,
    p_dunning_case_id,
    'suspended',
    'active',
    'Payment recovered - access restored',
    'system',
    ARRAY['api_access', 'features', 'billing']
  );

  -- Update organization status
  UPDATE organizations
  SET 
    status = 'active',
    suspended_at = NULL,
    suspension_reason = NULL,
    updated_at = NOW()
  WHERE id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get dunning dashboard data
CREATE OR REPLACE FUNCTION get_dunning_dashboard(
  p_organization_id UUID DEFAULT NULL
) RETURNS TABLE (
  active_cases INTEGER,
  suspended_accounts INTEGER,
  total_outstanding DECIMAL,
  recovery_rate NUMERIC,
  avg_recovery_days NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH case_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE status IN ('active', 'retrying', 'grace_period')) as active,
      COUNT(*) FILTER (WHERE status = 'suspended') as suspended,
      SUM(payment_amount) FILTER (WHERE status NOT IN ('recovered', 'cancelled', 'resolved')) as outstanding,
      COUNT(*) FILTER (WHERE status = 'recovered') as recovered,
      COUNT(*) FILTER (WHERE status IN ('cancelled', 'resolved')) as closed,
      AVG(EXTRACT(DAYS FROM recovered_at - payment_failed_at)) FILTER (WHERE status = 'recovered') as avg_days
    FROM dunning_cases
    WHERE (p_organization_id IS NULL OR organization_id = p_organization_id)
  )
  SELECT 
    cs.active::INTEGER,
    cs.suspended::INTEGER,
    COALESCE(cs.outstanding, 0),
    CASE 
      WHEN (cs.recovered + cs.closed) > 0 THEN 
        round((cs.recovered::FLOAT / (cs.recovered + cs.closed) * 100)::NUMERIC, 2)
      ELSE 0
    END,
    COALESCE(round(cs.avg_days::NUMERIC, 1), 0)
  FROM case_stats cs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- DEFAULT CONFIGURATIONS
-- =============================================================================

-- Insert default dunning configurations
INSERT INTO dunning_configs (plan_name, grace_period_days, max_retry_attempts, retry_intervals, suspension_delay_days, auto_cancel_days) VALUES
('startup', 3, 3, '{1,3,7}', 7, 30),
('business', 5, 4, '{1,3,7,14}', 10, 45),
('enterprise', 7, 5, '{1,3,7,14,21}', 14, 60)
ON CONFLICT (plan_name) DO NOTHING;

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- =============================================================================

GRANT ALL ON dunning_configs TO service_role;
GRANT ALL ON dunning_cases TO service_role;
GRANT ALL ON payment_retry_attempts TO service_role;
GRANT ALL ON dunning_communications TO service_role;
GRANT ALL ON account_status_log TO service_role;

GRANT EXECUTE ON FUNCTION create_dunning_case TO service_role;
GRANT EXECUTE ON FUNCTION process_dunning_retry TO service_role;
GRANT EXECUTE ON FUNCTION recover_dunning_case TO service_role;
GRANT EXECUTE ON FUNCTION queue_dunning_notification TO service_role;
GRANT EXECUTE ON FUNCTION suspend_organization_access TO service_role;
GRANT EXECUTE ON FUNCTION restore_organization_access TO service_role;
GRANT EXECUTE ON FUNCTION get_dunning_dashboard TO service_role;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE dunning_configs IS 'Configuration rules for automated dunning process per subscription plan';
COMMENT ON TABLE dunning_cases IS 'Active and historical failed payment recovery cases with retry logic';
COMMENT ON TABLE payment_retry_attempts IS 'Log of all payment retry attempts with results and timing';
COMMENT ON TABLE dunning_communications IS 'Customer communication log for dunning notifications across all channels';
COMMENT ON TABLE account_status_log IS 'Audit trail of account status changes due to dunning process';