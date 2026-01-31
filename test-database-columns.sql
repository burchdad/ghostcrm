-- Test if the migration was applied correctly
-- Run this in Supabase SQL Editor to verify columns exist

-- Check if all enhanced columns exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND column_name IN (
    'email', 
    'address', 
    'city', 
    'state', 
    'zip_code', 
    'country',
    'budget',
    'budget_range',
    'timeframe',
    'vehicle_interest',
    'lead_score',
    'referred_by',
    'campaign_source'
)
ORDER BY column_name;

-- Also check a sample of actual data
SELECT 
    id,
    title,
    email,
    address,
    city,
    state,
    budget,
    custom_fields
FROM leads 
LIMIT 3;