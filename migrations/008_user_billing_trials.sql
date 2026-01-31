-- User-specific billing for 14-day trial system
-- This complements the existing tenant subscription system

-- Create user_billing table for individual user trial tracking
CREATE TABLE IF NOT EXISTS user_billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References users table
    organization_id UUID, -- Optional reference to organizations table
    
    -- Stripe customer and subscription info
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    payment_method_id TEXT,
    
    -- Trial information
    trial_start_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    trial_period_days INTEGER DEFAULT 14,
    
    -- Setup intent for payment method collection
    setup_intent_id TEXT,
    setup_intent_status TEXT DEFAULT 'pending',
    
    -- Billing status
    billing_status TEXT NOT NULL DEFAULT 'no_trial' CHECK (billing_status IN (
        'no_trial',           -- User hasn't started a trial
        'trial',              -- Trial setup created but not active
        'trial_active',       -- Trial is active
        'trial_ending',       -- Trial ending soon (3 days warning)
        'active',             -- Paid subscription active
        'past_due',           -- Payment failed, grace period
        'payment_failed',     -- Payment failed
        'canceled',           -- Subscription canceled
        'unpaid'              -- Subscription unpaid and suspended
    )),
    
    -- Subscription details
    subscription_status TEXT, -- Direct from Stripe
    last_payment_date TIMESTAMP WITH TIME ZONE,
    next_billing_date TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_billing_user_id ON user_billing(user_id);
CREATE INDEX IF NOT EXISTS idx_user_billing_stripe_customer_id ON user_billing(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_billing_stripe_subscription_id ON user_billing(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_billing_billing_status ON user_billing(billing_status);
CREATE INDEX IF NOT EXISTS idx_user_billing_trial_end_date ON user_billing(trial_end_date);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_billing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_billing_updated_at_trigger
    BEFORE UPDATE ON user_billing
    FOR EACH ROW
    EXECUTE FUNCTION update_user_billing_updated_at();

-- Create function to check for expiring trials (for background jobs)
CREATE OR REPLACE FUNCTION get_expiring_trials(days_ahead INTEGER DEFAULT 3)
RETURNS TABLE (
    user_id UUID,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ub.user_id,
        ub.stripe_customer_id,
        ub.stripe_subscription_id,
        ub.trial_end_date,
        EXTRACT(DAY FROM (ub.trial_end_date - NOW()))::INTEGER as days_remaining
    FROM user_billing ub
    WHERE 
        ub.billing_status IN ('trial_active', 'trial')
        AND ub.trial_end_date IS NOT NULL
        AND ub.trial_end_date <= (NOW() + INTERVAL '%s days')
        AND ub.trial_end_date > NOW()
    ORDER BY ub.trial_end_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get expired trials that need billing
CREATE OR REPLACE FUNCTION get_expired_trials()
RETURNS TABLE (
    user_id UUID,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    payment_method_id TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ub.user_id,
        ub.stripe_customer_id,
        ub.stripe_subscription_id,
        ub.trial_end_date,
        ub.payment_method_id
    FROM user_billing ub
    WHERE 
        ub.billing_status = 'trial_active'
        AND ub.trial_end_date IS NOT NULL
        AND ub.trial_end_date <= NOW()
        AND ub.stripe_subscription_id IS NOT NULL
    ORDER BY ub.trial_end_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Add RLS (Row Level Security) policies if needed
-- Note: Adjust these based on your security requirements
ALTER TABLE user_billing ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see their own billing data
CREATE POLICY user_billing_user_access ON user_billing
    FOR ALL USING (
        auth.uid()::text = user_id::text OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- Insert initial data or update existing records if needed
-- This would be handled by the application during user signup

COMMENT ON TABLE user_billing IS 'Individual user billing and trial tracking for 14-day trial system';
COMMENT ON COLUMN user_billing.billing_status IS 'Current billing status of the user trial/subscription';
COMMENT ON COLUMN user_billing.trial_period_days IS 'Length of trial period in days (default 14)';
COMMENT ON FUNCTION get_expiring_trials IS 'Returns trials expiring within specified days for reminder notifications';
COMMENT ON FUNCTION get_expired_trials IS 'Returns expired trials that need to be converted to paid subscriptions';