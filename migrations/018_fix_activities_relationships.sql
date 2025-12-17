-- Add lead_id foreign key to activities table for proper relationship
-- This fixes the "Could not find a relationship between 'leads' and 'lead_activities'" error

-- Add lead_id column to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_lead_id 
ON activities(lead_id) WHERE lead_id IS NOT NULL;

-- Add deal_id column if it doesn't exist (referenced in indexes)
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS deal_id UUID;

-- Add tenant_id column if it doesn't exist (referenced in indexes) 
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add activity_type column if it doesn't exist (referenced in indexes)
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS activity_type VARCHAR(50);

-- Update existing data to have proper activity types
UPDATE activities 
SET activity_type = type 
WHERE activity_type IS NULL AND type IS NOT NULL;

COMMENT ON COLUMN activities.lead_id IS 'Foreign key reference to leads table';
COMMENT ON COLUMN activities.deal_id IS 'Foreign key reference to deals table when available';
COMMENT ON COLUMN activities.tenant_id IS 'Organization/tenant isolation for multi-tenancy';
COMMENT ON COLUMN activities.activity_type IS 'Type of activity for filtering and analytics';