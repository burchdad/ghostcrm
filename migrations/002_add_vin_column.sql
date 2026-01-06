-- Migration: Add VIN column to inventory table
-- Created: 2026-01-06
-- Purpose: Add Vehicle Identification Number column for automotive inventory management

-- Add VIN column to inventory table
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS vin VARCHAR(17);

-- Create unique index on VIN to prevent duplicate entries
-- Using IF NOT EXISTS to handle cases where this might be run multiple times
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'inventory_vin_unique_idx'
  ) THEN
    CREATE UNIQUE INDEX inventory_vin_unique_idx ON inventory (vin) 
    WHERE vin IS NOT NULL;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN inventory.vin IS 'Vehicle Identification Number (VIN) - 17 character unique identifier for vehicles';