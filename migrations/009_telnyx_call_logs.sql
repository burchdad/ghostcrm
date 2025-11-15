-- Migration: Add call logs table for Telnyx voice calls
-- This table tracks all outbound calls initiated through the AI system

CREATE TABLE IF NOT EXISTS call_logs (
    id BIGSERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    call_id TEXT NOT NULL, -- Telnyx call ID
    call_control_id TEXT, -- Telnyx call control ID for webhooks
    call_session_id TEXT, -- Telnyx call session ID
    status TEXT NOT NULL DEFAULT 'initiated', -- 'initiated', 'ringing', 'answered', 'ended'
    provider TEXT NOT NULL DEFAULT 'telnyx', -- 'telnyx', 'twilio', etc.
    script TEXT, -- The AI script used for the call
    hangup_cause TEXT, -- Reason for call ending
    duration_seconds INTEGER, -- Call duration in seconds
    recording_url TEXT, -- URL to call recording
    has_recording BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answered_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_logs_lead_id ON call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_provider ON call_logs(provider);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON call_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_control_id ON call_logs(call_control_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_call_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER call_logs_updated_at_trigger
    BEFORE UPDATE ON call_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_call_logs_updated_at();

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON call_logs TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE call_logs_id_seq TO your_app_user;