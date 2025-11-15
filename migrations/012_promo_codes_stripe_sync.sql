-- Add Stripe sync fields to promo_codes table
-- This migration adds proper Stripe integration columns

ALTER TABLE promo_codes 
ADD COLUMN IF NOT EXISTS stripe_coupon_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_promotion_code_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'error', 'manual')),
ADD COLUMN IF NOT EXISTS sync_error TEXT;

-- Create indexes for Stripe fields
CREATE INDEX IF NOT EXISTS idx_promo_codes_stripe_coupon_id ON promo_codes(stripe_coupon_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_stripe_promotion_code_id ON promo_codes(stripe_promotion_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_sync_status ON promo_codes(sync_status);

-- Update existing promo codes to pending sync status
UPDATE promo_codes 
SET sync_status = 'pending'
WHERE stripe_coupon_id IS NULL AND is_active = true;

-- Add trigger to automatically mark for sync when promo code is created/updated
CREATE OR REPLACE FUNCTION mark_promo_for_sync()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a new promo code or key fields changed, mark for sync
    IF (TG_OP = 'INSERT') OR 
       (OLD.code != NEW.code OR 
        OLD.discount_type != NEW.discount_type OR 
        OLD.discount_value != NEW.discount_value OR 
        OLD.custom_monthly_price != NEW.custom_monthly_price OR 
        OLD.custom_yearly_price != NEW.custom_yearly_price OR 
        OLD.max_uses != NEW.max_uses OR 
        OLD.expires_at != NEW.expires_at OR 
        OLD.is_active != NEW.is_active) THEN
        
        NEW.sync_status = 'pending';
        NEW.synced_at = NULL;
        NEW.sync_error = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_mark_promo_for_sync
    BEFORE INSERT OR UPDATE ON promo_codes
    FOR EACH ROW EXECUTE FUNCTION mark_promo_for_sync();

-- Sample promo codes with proper Stripe integration setup
-- Update existing test codes
UPDATE promo_codes 
SET 
    sync_status = 'pending',
    notes = COALESCE(notes, '') || ' - Marked for Stripe sync'
WHERE code IN ('TESTCLIENT70', 'SOFTWAREOWNER', 'LAUNCH50');

-- Insert new comprehensive promo codes for testing
INSERT INTO promo_codes (
    code, 
    description, 
    discount_type, 
    discount_value,
    custom_monthly_price, 
    custom_yearly_price,
    max_uses,
    expires_at,
    created_by,
    notes,
    target_customer,
    sync_status
) VALUES 
(
    'BETA50',
    'Beta testing - 50% off for 6 months',
    'percentage',
    50.00,
    NULL,
    NULL,
    50,
    NOW() + INTERVAL '6 months',
    'software_owner',
    'Beta testing discount for early adopters',
    'Beta testers',
    'pending'
),
(
    'FIRSTMONTH',
    'First month free for new customers',
    'percentage',
    100.00,
    NULL,
    NULL,
    NULL,
    NOW() + INTERVAL '3 months',
    'software_owner',
    'First month free promotion',
    'New customers',
    'pending'
),
(
    'ENTERPRISE99',
    'Special enterprise pricing - $99/month',
    'custom_price',
    NULL,
    99.00,
    1188.00,
    5,
    NOW() + INTERVAL '1 year',
    'software_owner',
    'Enterprise trial pricing',
    'Enterprise prospects',
    'pending'
) ON CONFLICT (code) DO UPDATE SET
    description = EXCLUDED.description,
    sync_status = 'pending',
    updated_at = NOW();

-- Grant permissions for API access
GRANT SELECT, UPDATE ON promo_codes TO anon, authenticated;

-- RLS policy for syncing (software owners only)
CREATE POLICY "Software owners can sync promo codes" ON promo_codes
    FOR UPDATE USING (true) WITH CHECK (true); -- Adjust based on your auth system

-- View for promo code status tracking
CREATE OR REPLACE VIEW promo_code_sync_status AS
SELECT 
    id,
    code,
    description,
    discount_type,
    is_active,
    sync_status,
    synced_at,
    sync_error,
    stripe_coupon_id IS NOT NULL as has_stripe_coupon,
    stripe_promotion_code_id IS NOT NULL as has_stripe_promotion,
    created_at,
    updated_at
FROM promo_codes
ORDER BY created_at DESC;