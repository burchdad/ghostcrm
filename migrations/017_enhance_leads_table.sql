-- Add missing fields to leads table for better lead management
-- Date: December 11, 2025

-- Add email field directly to leads for easier querying (redundant with contact but useful)
ALTER TABLE leads ADD COLUMN email VARCHAR(255);

-- Add address fields for lead location tracking
ALTER TABLE leads ADD COLUMN address TEXT;
ALTER TABLE leads ADD COLUMN city VARCHAR(100);
ALTER TABLE leads ADD COLUMN state VARCHAR(100);
ALTER TABLE leads ADD COLUMN zip_code VARCHAR(20);
ALTER TABLE leads ADD COLUMN country VARCHAR(100) DEFAULT 'USA';

-- Add budget-specific field (separate from general value)
ALTER TABLE leads ADD COLUMN budget DECIMAL(12,2);
ALTER TABLE leads ADD COLUMN budget_range VARCHAR(50); -- e.g., "$50k-75k"

-- Add lead-specific tracking fields
ALTER TABLE leads ADD COLUMN timeframe VARCHAR(100); -- e.g., "1-3 months"
ALTER TABLE leads ADD COLUMN vehicle_interest TEXT; -- automotive specific
ALTER TABLE leads ADD COLUMN lead_score INTEGER DEFAULT 50 CHECK (lead_score >= 0 AND lead_score <= 100);

-- Add referral tracking
ALTER TABLE leads ADD COLUMN referred_by VARCHAR(255);
ALTER TABLE leads ADD COLUMN campaign_source VARCHAR(255);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_city_state ON leads(city, state);
CREATE INDEX IF NOT EXISTS idx_leads_budget ON leads(budget);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_leads_stage_priority ON leads(stage, priority);