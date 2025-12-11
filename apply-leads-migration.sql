-- Apply the enhanced leads table migration
-- This should be run in Supabase SQL Editor

-- First, check if columns exist before adding them
DO $$ 
BEGIN 
    -- Add email field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='email') THEN
        ALTER TABLE leads ADD COLUMN email VARCHAR(255);
    END IF;
    
    -- Add address fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='address') THEN
        ALTER TABLE leads ADD COLUMN address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='city') THEN
        ALTER TABLE leads ADD COLUMN city VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='state') THEN
        ALTER TABLE leads ADD COLUMN state VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='zip_code') THEN
        ALTER TABLE leads ADD COLUMN zip_code VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='country') THEN
        ALTER TABLE leads ADD COLUMN country VARCHAR(100) DEFAULT 'USA';
    END IF;
    
    -- Add budget fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='budget') THEN
        ALTER TABLE leads ADD COLUMN budget DECIMAL(12,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='budget_range') THEN
        ALTER TABLE leads ADD COLUMN budget_range VARCHAR(50);
    END IF;
    
    -- Add tracking fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='timeframe') THEN
        ALTER TABLE leads ADD COLUMN timeframe VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='vehicle_interest') THEN
        ALTER TABLE leads ADD COLUMN vehicle_interest TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='lead_score') THEN
        ALTER TABLE leads ADD COLUMN lead_score INTEGER DEFAULT 50 CHECK (lead_score >= 0 AND lead_score <= 100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='referred_by') THEN
        ALTER TABLE leads ADD COLUMN referred_by VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='campaign_source') THEN
        ALTER TABLE leads ADD COLUMN campaign_source VARCHAR(255);
    END IF;
END $$;