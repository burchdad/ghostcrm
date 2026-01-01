-- =====================================================
-- WEBHOOK IDEMPOTENCY TABLE
-- Prevents duplicate processing of webhook events
-- =====================================================

-- Create webhook_events table for idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_id ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);

-- Enable RLS (service role operations only)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can manage webhook events
CREATE POLICY "Service role can manage webhook events"
    ON webhook_events FOR ALL
    USING (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_webhook_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_webhook_events_updated_at
    BEFORE UPDATE ON webhook_events
    FOR EACH ROW EXECUTE FUNCTION update_webhook_events_updated_at();

-- Create function to clean up old webhook events (optional)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM webhook_events 
    WHERE processed = TRUE 
    AND created_at < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE webhook_events IS 'Tracks webhook event processing for idempotency';