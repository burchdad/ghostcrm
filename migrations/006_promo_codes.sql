-- Promo Codes Table for GhostCRM
-- This table stores promotional discount codes that can be applied during billing

CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- The promo code itself (e.g., "TESTCLIENT70")
    description TEXT NOT NULL, -- Human-readable description
    
    -- Discount Configuration
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('fixed', 'percentage', 'custom_price')),
    discount_value DECIMAL(10,2), -- For fixed amount or percentage value
    custom_monthly_price DECIMAL(10,2), -- For custom pricing (e.g., $70/month)
    custom_yearly_price DECIMAL(10,2), -- For custom yearly pricing (e.g., $840/year)
    
    -- Usage Limits
    max_uses INTEGER DEFAULT NULL, -- NULL means unlimited uses
    used_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Validity Period
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT true NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by VARCHAR(100), -- Software owner who created it
    
    -- Additional metadata for tracking
    notes TEXT, -- Internal notes about the promo code
    target_customer VARCHAR(255) -- Who this code is intended for
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_expires_at ON promo_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_promo_codes_created_at ON promo_codes(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_promo_codes_updated_at 
    BEFORE UPDATE ON promo_codes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Usage tracking table for analytics
CREATE TABLE IF NOT EXISTS promo_code_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    used_by_email VARCHAR(255), -- Email of user who used it
    order_amount DECIMAL(10,2), -- Original order amount
    discount_amount DECIMAL(10,2), -- Amount discounted
    final_amount DECIMAL(10,2), -- Final amount after discount
    plan_selected VARCHAR(50), -- Which plan was selected
    metadata JSONB -- Additional context about the usage
);

-- Create indexes for usage tracking
CREATE INDEX IF NOT EXISTS idx_promo_usage_code_id ON promo_code_usage(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_usage_used_at ON promo_code_usage(used_at);
CREATE INDEX IF NOT EXISTS idx_promo_usage_email ON promo_code_usage(used_by_email);

-- Sample data for testing
INSERT INTO promo_codes (
    code, 
    description, 
    discount_type, 
    custom_monthly_price, 
    custom_yearly_price,
    max_uses,
    expires_at,
    created_by,
    notes,
    target_customer
) VALUES 
(
    'TESTCLIENT70',
    'Special pricing for test client - $70/month',
    'custom_price',
    70.00,
    840.00,
    1,
    NOW() + INTERVAL '1 year',
    'software_owner',
    'Custom pricing for initial test client',
    'Test Client Company'
),
(
    'SOFTWAREOWNER',
    'Free access for software owner testing',
    'custom_price',
    0.00,
    0.00,
    NULL,
    NULL,
    'software_owner',
    'Free access for internal testing and development',
    'Software Owner'
),
(
    'LAUNCH50',
    '50% off setup fee for launch customers',
    'percentage',
    50.00,
    NULL,
    100,
    NOW() + INTERVAL '3 months',
    'software_owner',
    'Launch promotion - 50% off setup fee',
    'Early adopters'
) ON CONFLICT (code) DO NOTHING;

-- Grant appropriate permissions (adjust based on your RLS policies)
-- Enable Row Level Security
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promo_codes (software owner can manage all, others can only read active ones)
CREATE POLICY "Software owners can manage all promo codes" ON promo_codes
    FOR ALL USING (true) WITH CHECK (true); -- Adjust based on your auth system

CREATE POLICY "Public can read active promo codes for validation" ON promo_codes
    FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- RLS Policies for usage tracking
CREATE POLICY "Software owners can view all usage" ON promo_code_usage
    FOR SELECT USING (true); -- Adjust based on your auth system

CREATE POLICY "System can insert usage records" ON promo_code_usage
    FOR INSERT WITH CHECK (true);