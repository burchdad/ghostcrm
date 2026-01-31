-- AI Telephony Integration Database Schema
-- Create tables and data for Telnyx AI calling system

-- 1. Create telephony_providers table if it doesn't exist
CREATE TABLE IF NOT EXISTS telephony_providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id TEXT NOT NULL,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('twilio', 'telnyx', 'vonage', 'bandwidth')),
    provider_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    meta JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create ai_call_logs table for tracking AI calls
CREATE TABLE IF NOT EXISTS ai_call_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id TEXT NOT NULL,
    call_id TEXT NOT NULL UNIQUE, -- Provider call ID (Telnyx call SID)
    phone_number TEXT NOT NULL,
    from_number TEXT NOT NULL,
    to_number TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'telnyx',
    status TEXT NOT NULL DEFAULT 'initiated',
    duration_seconds INTEGER DEFAULT 0,
    answered_by TEXT, -- 'human', 'machine', 'unknown'
    hangup_cause TEXT,
    outcome TEXT, -- 'no_answer', 'busy', 'hung_up_early', 'brief_conversation', 'full_conversation'
    voice_config JSONB DEFAULT '{}', -- AI voice and language settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answered_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- 3. Create ai_call_recordings table for call recordings
CREATE TABLE IF NOT EXISTS ai_call_recordings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id TEXT NOT NULL REFERENCES ai_call_logs(call_id) ON DELETE CASCADE,
    recording_id TEXT NOT NULL UNIQUE, -- Provider recording ID
    download_url TEXT NOT NULL,
    duration_ms INTEGER DEFAULT 0,
    channels INTEGER DEFAULT 1,
    provider TEXT NOT NULL DEFAULT 'telnyx',
    status TEXT NOT NULL DEFAULT 'completed',
    file_format TEXT DEFAULT 'mp3',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create ai_call_analysis table for call analysis results
CREATE TABLE IF NOT EXISTS ai_call_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id TEXT NOT NULL REFERENCES ai_call_logs(call_id) ON DELETE CASCADE,
    transcription TEXT,
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    customer_interest TEXT CHECK (customer_interest IN ('high', 'medium', 'low', 'none')),
    key_topics JSONB DEFAULT '[]',
    action_items JSONB DEFAULT '[]',
    next_steps TEXT,
    lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100),
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Insert Telnyx provider configuration
INSERT INTO telephony_providers (
    org_id,
    provider_type,
    provider_name,
    is_active,
    meta
) VALUES (
    'burch-enterprises', -- Replace with your actual org_id
    'telnyx',
    'Ghost AI Solutions - Telnyx',
    true,
    '{
        "apiKey": "YOUR_TELNYX_API_KEY_HERE",
        "connectionId": "YOUR_CONNECTION_ID_HERE",
        "defaultFrom": "+1XXXXXXXXXX",
        "messagingProfileId": null,
        "webhookUrl": "https://ghostcrm.ai/api/voice/telnyx/ai-answer",
        "statusWebhookUrl": "https://ghostcrm.ai/api/voice/telnyx/ai-status",
        "recordingWebhookUrl": "https://ghostcrm.ai/api/voice/telnyx/ai-recording",
        "capabilities": ["voice", "sms", "ai_calling"]
    }'::jsonb
)
ON CONFLICT DO NOTHING;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_call_logs_org_id ON ai_call_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_ai_call_logs_phone_number ON ai_call_logs(phone_number);
CREATE INDEX IF NOT EXISTS idx_ai_call_logs_status ON ai_call_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_call_logs_created_at ON ai_call_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_telephony_providers_org_id ON telephony_providers(org_id);
CREATE INDEX IF NOT EXISTS idx_telephony_providers_type ON telephony_providers(provider_type);

-- 7. Create updated_at triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_telephony_providers_updated_at ON telephony_providers;
CREATE TRIGGER update_telephony_providers_updated_at 
    BEFORE UPDATE ON telephony_providers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_call_logs_updated_at ON ai_call_logs;
CREATE TRIGGER update_ai_call_logs_updated_at 
    BEFORE UPDATE ON ai_call_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Add Row Level Security (RLS) policies
ALTER TABLE telephony_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_call_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your auth system)
CREATE POLICY "Users can view their org's telephony providers" ON telephony_providers
    FOR SELECT USING (org_id = auth.jwt() ->> 'organizationId');

CREATE POLICY "Users can view their org's call logs" ON ai_call_logs
    FOR SELECT USING (org_id = auth.jwt() ->> 'organizationId');

CREATE POLICY "Users can insert call logs for their org" ON ai_call_logs
    FOR INSERT WITH CHECK (org_id = auth.jwt() ->> 'organizationId');

CREATE POLICY "Users can update their org's call logs" ON ai_call_logs
    FOR UPDATE USING (org_id = auth.jwt() ->> 'organizationId');

-- 9. Create views for easy querying
CREATE OR REPLACE VIEW ai_calls_with_analysis AS
SELECT 
    acl.*,
    aca.transcription,
    aca.sentiment,
    aca.customer_interest,
    aca.key_topics,
    aca.action_items,
    aca.next_steps,
    aca.lead_score,
    acr.download_url as recording_url,
    acr.duration_ms as recording_duration_ms
FROM ai_call_logs acl
LEFT JOIN ai_call_analysis aca ON acl.call_id = aca.call_id
LEFT JOIN ai_call_recordings acr ON acl.call_id = acr.call_id;

-- 10. Create helper functions for AI calling system
CREATE OR REPLACE FUNCTION get_active_telnyx_provider(org_id_param TEXT)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT row_to_json(tp)
        FROM telephony_providers tp
        WHERE tp.org_id = org_id_param 
        AND tp.provider_type = 'telnyx' 
        AND tp.is_active = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Sample AI call log entry (for testing)
INSERT INTO ai_call_logs (
    org_id,
    call_id,
    phone_number,
    from_number,
    to_number,
    provider,
    status,
    voice_config
) VALUES (
    'burch-enterprises',
    'sample-call-' || extract(epoch from now())::text,
    '+15551234567',
    '+1XXXXXXXXXX',
    '+15551234567',
    'telnyx',
    'completed',
    '{
        "voice": "sarah",
        "language": "en",
        "elevenLabsId": "EXAVITQu4vr4xnSDxMaL"
    }'::jsonb
)
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ AI Telephony Integration database setup completed successfully!';
    RAISE NOTICE '📞 Telnyx provider configured for org: burch-enterprises';
    RAISE NOTICE '🎤 AI calling system tables created and ready';
    RAISE NOTICE '🔐 Row Level Security policies applied';
    RAISE NOTICE '📊 Views and helper functions created';
END $$;