-- Add opted_out field to contacts table for production use
-- This migration adds the opted_out column to track marketing opt-out status

-- Add opted_out to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS opted_out BOOLEAN DEFAULT FALSE;

-- Add opted_out to leads table as well for backward compatibility
ALTER TABLE leads ADD COLUMN IF NOT EXISTS opted_out BOOLEAN DEFAULT FALSE;

-- Update existing records to have explicit opt-out status (default false)
UPDATE contacts SET opted_out = FALSE WHERE opted_out IS NULL;
UPDATE leads SET opted_out = FALSE WHERE opted_out IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_opted_out ON contacts(opted_out);
CREATE INDEX IF NOT EXISTS idx_leads_opted_out ON leads(opted_out);

-- Add comments
COMMENT ON COLUMN contacts.opted_out IS 'Marketing opt-out status - true means contact has opted out of marketing communications';
COMMENT ON COLUMN leads.opted_out IS 'Marketing opt-out status - true means lead has opted out of marketing communications';