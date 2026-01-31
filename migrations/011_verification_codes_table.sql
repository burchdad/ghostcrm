-- Migration: Create verification codes table
-- Purpose: Store email verification codes instead of using email links
-- Date: 2026-01-25

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS public.verification_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON public.verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON public.verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON public.verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON public.verification_codes(expires_at);

-- RLS Policies
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own verification codes
CREATE POLICY "Users can view their own verification codes" ON public.verification_codes
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own verification codes (for resend functionality)
CREATE POLICY "Users can create their own verification codes" ON public.verification_codes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own verification codes (mark as used)
CREATE POLICY "Users can update their own verification codes" ON public.verification_codes
    FOR UPDATE USING (auth.uid() = user_id);

-- Service role can manage all verification codes (for cleanup, admin operations)
CREATE POLICY "Service role can manage all verification codes" ON public.verification_codes
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_verification_codes()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_verification_codes_updated_at
    BEFORE UPDATE ON public.verification_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_verification_codes();

-- Function to clean up expired codes (call this periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.verification_codes 
    WHERE expires_at < NOW() - INTERVAL '1 hour'; -- Keep for 1 hour after expiry for debugging
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.verification_codes IS 'Store email verification codes for modern auth flow';
COMMENT ON FUNCTION public.cleanup_expired_verification_codes() IS 'Remove expired verification codes - run periodically';