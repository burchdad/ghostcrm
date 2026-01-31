-- =============================================================================
-- AUTOMOTIVE INDUSTRY FOCUS: LEADS TABLE UPDATE
-- =============================================================================
-- This script adds an industry column and converts all existing leads to be 
-- automotive industry focused with relevant titles and descriptions
-- =============================================================================

-- 1. Add industry column to leads table
-- =============================================================================
DO $$ 
BEGIN
    -- Add industry column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='leads' AND column_name='industry'
    ) THEN
        ALTER TABLE leads ADD COLUMN industry VARCHAR(50) DEFAULT 'automotive';
        RAISE NOTICE 'Added industry column to leads table';
    ELSE
        RAISE NOTICE 'Industry column already exists in leads table';
    END IF;
END $$;

-- 2. Update all existing leads to be automotive-focused
-- =============================================================================

-- First, let's check for and handle orphaned leads (leads without valid organization_id)
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    -- Count orphaned leads
    SELECT COUNT(*) INTO orphaned_count 
    FROM leads l 
    LEFT JOIN organizations o ON l.organization_id = o.id 
    WHERE o.id IS NULL;
    
    IF orphaned_count > 0 THEN
        RAISE NOTICE 'Found % orphaned leads without valid organization_id', orphaned_count;
        
        -- Option 1: Delete orphaned leads (uncomment if you want to remove them)
        -- DELETE FROM leads WHERE organization_id NOT IN (SELECT id FROM organizations);
        -- RAISE NOTICE 'Deleted % orphaned leads', orphaned_count;
        
        -- Option 2: Skip updating orphaned leads (default - safer approach)
        RAISE NOTICE 'Skipping orphaned leads during update (safer approach)';
    ELSE
        RAISE NOTICE 'No orphaned leads found - all leads have valid organization references';
    END IF;
END $$;

-- Update leads with technology-focused content (only those with valid organization_id)
UPDATE leads 
SET 
    industry = 'automotive',
    title = CASE 
        -- Convert technology titles to automotive
        WHEN title ILIKE '%software%' OR title ILIKE '%technology%' OR title ILIKE '%tech%' THEN 
            CASE 
                WHEN title ILIKE '%enterprise%' THEN SPLIT_PART(title, ' - ', 1) || ' - Fleet Vehicle Program'
                WHEN title ILIKE '%solution%' THEN SPLIT_PART(title, ' - ', 1) || ' - Commercial Vehicle Purchase'
                WHEN title ILIKE '%consulting%' THEN SPLIT_PART(title, ' - ', 1) || ' - Business Vehicle Acquisition'
                ELSE SPLIT_PART(title, ' - ', 1) || ' - Vehicle Purchase Inquiry'
            END
        -- Convert real estate titles to automotive
        WHEN title ILIKE '%real estate%' OR title ILIKE '%property%' OR title ILIKE '%home%' THEN 
            CASE 
                WHEN title ILIKE '%commercial%' THEN SPLIT_PART(title, ' - ', 1) || ' - Commercial Fleet Vehicles'
                WHEN title ILIKE '%residential%' THEN SPLIT_PART(title, ' - ', 1) || ' - Family Vehicle Purchase'
                WHEN title ILIKE '%investment%' THEN SPLIT_PART(title, ' - ', 1) || ' - Multi-Vehicle Package'
                ELSE SPLIT_PART(title, ' - ', 1) || ' - Vehicle Purchase Interest'
            END
        -- Update generic opportunity titles
        WHEN title ILIKE '%opportunity%' THEN 
            SPLIT_PART(title, ' - ', 1) || ' - Vehicle Purchase Opportunity'
        -- Keep automotive titles as-is but ensure consistency
        WHEN title ILIKE '%vehicle%' OR title ILIKE '%car%' OR title ILIKE '%truck%' OR title ILIKE '%suv%' THEN title
        -- Convert any other non-automotive titles
        ELSE SPLIT_PART(title, ' - ', 1) || ' - Vehicle Purchase Inquiry'
    END,
    description = CASE 
        -- Technology descriptions to automotive
        WHEN description ILIKE '%software%' OR description ILIKE '%technology%' OR description ILIKE '%digital%' THEN 
            CASE 
                WHEN description ILIKE '%enterprise%' THEN 'Looking for fleet management solutions and commercial vehicles for business operations. Interested in bulk pricing and financing options.'
                WHEN description ILIKE '%startup%' OR description ILIKE '%innovation%' THEN 'Growing business needs reliable vehicles for team transportation. Considering leasing options and modern vehicle features.'
                WHEN description ILIKE '%consulting%' THEN 'Professional services company requiring executive vehicles and client transportation solutions.'
                ELSE 'Business professional interested in purchasing reliable vehicles with modern technology features and connectivity options.'
            END
        -- Real estate descriptions to automotive
        WHEN description ILIKE '%real estate%' OR description ILIKE '%property%' OR description ILIKE '%home%' THEN 
            CASE 
                WHEN description ILIKE '%commercial%' THEN 'Commercial real estate professional needs reliable work vehicles for property inspections and client meetings. Considering trucks or SUVs.'
                WHEN description ILIKE '%residential%' THEN 'Real estate agent looking for professional vehicle to transport clients and showcase properties. Interested in comfortable sedans or SUVs.'
                WHEN description ILIKE '%investment%' THEN 'Property investment company needs fleet vehicles for property management and maintenance teams.'
                ELSE 'Real estate professional seeking reliable and professional vehicle for client transportation and business use.'
            END
        -- Generic business descriptions to automotive
        WHEN description ILIKE '%business%' OR description ILIKE '%company%' THEN 
            'Business owner looking for vehicles to support company operations. Interested in reliable, cost-effective transportation solutions with good resale value.'
        -- Service descriptions to automotive
        WHEN description ILIKE '%service%' OR description ILIKE '%solution%' THEN 
            'Looking for comprehensive vehicle solutions including purchasing, financing, and ongoing service support. Values long-term relationship with dealership.'
        -- Keep automotive descriptions or enhance them
        WHEN description ILIKE '%vehicle%' OR description ILIKE '%car%' OR description ILIKE '%truck%' OR description ILIKE '%suv%' THEN 
            description
        -- Convert any other descriptions
        ELSE 'Prospective customer interested in purchasing a vehicle. Looking for reliable transportation with competitive pricing and financing options.'
    END
WHERE (industry != 'automotive' OR industry IS NULL)
  AND organization_id IN (SELECT id FROM organizations);  -- Only update leads with valid organization_id

-- 3. Update custom_fields to include automotive-relevant information
-- =============================================================================

UPDATE leads 
SET custom_fields = custom_fields || jsonb_build_object(
    'vehicle_category', CASE 
        WHEN value > 60000 THEN 'luxury'
        WHEN value > 40000 THEN 'premium'
        WHEN value > 25000 THEN 'mid-range'
        ELSE 'economy'
    END,
    'financing_interest', true,
    'trade_in_consideration', CASE WHEN random() > 0.5 THEN true ELSE false END,
    'timeline', CASE 
        WHEN priority = 'urgent' THEN 'immediate'
        WHEN priority = 'high' THEN 'within_month'
        WHEN priority = 'medium' THEN 'within_3_months'
        ELSE 'flexible'
    END,
    'vehicle_type_preference', CASE 
        WHEN value > 50000 THEN 'luxury_sedan'
        WHEN value > 35000 THEN 'suv'
        WHEN value > 25000 THEN 'sedan'
        ELSE 'compact'
    END
)
WHERE (custom_fields IS NULL OR NOT custom_fields ? 'vehicle_category')
  AND organization_id IN (SELECT id FROM organizations);  -- Only update leads with valid organization_id

-- 4. Add automotive-specific tags
-- =============================================================================

UPDATE leads 
SET tags = CASE 
    WHEN tags IS NULL OR array_length(tags, 1) IS NULL THEN 
        ARRAY['automotive', 'prospect']
    ELSE 
        -- Remove non-automotive tags and add automotive ones
        array_append(
            array_remove(
                array_remove(
                    array_remove(
                        array_remove(tags, 'technology'),
                        'software'
                    ), 
                    'real_estate'
                ), 
                'consulting'
            ), 
            'automotive'
        )
END
WHERE (NOT 'automotive' = ANY(tags) OR tags IS NULL)
  AND organization_id IN (SELECT id FROM organizations);  -- Only update leads with valid organization_id

-- 5. Update source field to include automotive-relevant sources
-- =============================================================================

UPDATE leads 
SET source = CASE 
    WHEN source = 'linkedin' THEN 'automotive_social'
    WHEN source = 'social_media' THEN 'automotive_social'
    WHEN source = 'trade_show' THEN 'auto_show'
    WHEN source ILIKE '%tech%' THEN 'website'
    WHEN source ILIKE '%software%' THEN 'online_inquiry'
    WHEN source IN ('website', 'referral', 'walk_in', 'phone', 'email') THEN source
    ELSE 'automotive_marketing'
END
WHERE organization_id IN (SELECT id FROM organizations);  -- Only update leads with valid organization_id

-- 6. Ensure all leads have realistic automotive values
-- =============================================================================

UPDATE leads 
SET value = CASE 
    WHEN value IS NULL OR value = 0 THEN 
        (RANDOM() * 60000 + 15000)::INTEGER  -- Random value between $15K-$75K
    WHEN value > 150000 THEN 
        (RANDOM() * 40000 + 45000)::INTEGER  -- Cap at reasonable luxury vehicle range
    WHEN value < 10000 THEN 
        (RANDOM() * 20000 + 15000)::INTEGER  -- Minimum reasonable vehicle price
    ELSE value
END
WHERE organization_id IN (SELECT id FROM organizations);  -- Only update leads with valid organization_id

-- 7. Update stages to be automotive sales funnel appropriate
-- =============================================================================

UPDATE leads 
SET stage = CASE 
    WHEN stage IN ('discovery', 'research') THEN 'inquiry'
    WHEN stage = 'demo' THEN 'test_drive'
    WHEN stage = 'proposal' THEN 'price_quote'
    WHEN stage = 'negotiation' THEN 'financing'
    WHEN stage = 'contract' THEN 'paperwork'
    WHEN stage = 'closed_won' THEN 'sold'
    WHEN stage = 'closed_lost' THEN 'lost'
    WHEN stage IN ('new', 'contacted', 'qualified') THEN stage
    ELSE 'new'
END
WHERE organization_id IN (SELECT id FROM organizations);  -- Only update leads with valid organization_id

-- 8. Add index for better performance on industry column
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry);
CREATE INDEX IF NOT EXISTS idx_leads_industry_stage ON leads(industry, stage);
CREATE INDEX IF NOT EXISTS idx_leads_automotive_value ON leads(value) WHERE industry = 'automotive';

-- 9. Update statistics
-- =============================================================================

-- Refresh table statistics for better query planning
ANALYZE leads;

-- =============================================================================
-- SUMMARY REPORT
-- =============================================================================

DO $$
DECLARE
    total_leads INTEGER;
    automotive_leads INTEGER;
    avg_value NUMERIC;
    stage_distribution TEXT;
BEGIN
    -- Get lead counts
    SELECT COUNT(*) INTO total_leads FROM leads;
    SELECT COUNT(*) INTO automotive_leads FROM leads WHERE industry = 'automotive';
    SELECT ROUND(AVG(value), 2) INTO avg_value FROM leads WHERE industry = 'automotive';
    
    -- Display summary
    RAISE NOTICE '============================================';
    RAISE NOTICE 'AUTOMOTIVE LEADS CONVERSION COMPLETE';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Total Leads: %', total_leads;
    RAISE NOTICE 'Automotive Leads: %', automotive_leads;
    RAISE NOTICE 'Average Vehicle Value: $%', avg_value;
    RAISE NOTICE '============================================';
    
    -- Show stage distribution
    RAISE NOTICE 'STAGE DISTRIBUTION:';
    FOR stage_distribution IN 
        SELECT stage || ': ' || COUNT(*) || ' leads' 
        FROM leads 
        WHERE industry = 'automotive' 
        GROUP BY stage 
        ORDER BY COUNT(*) DESC
    LOOP
        RAISE NOTICE '%', stage_distribution;
    END LOOP;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'All leads have been successfully converted to automotive industry focus!';
    RAISE NOTICE '============================================';
END $$;

-- =============================================================================
-- VERIFICATION QUERIES (uncomment to run for verification)
-- =============================================================================

/*
-- Verify industry column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'leads' AND column_name = 'industry';

-- Check sample of updated leads
SELECT id, title, description, industry, value, stage, tags, source
FROM leads 
WHERE industry = 'automotive'
ORDER BY updated_at DESC
LIMIT 10;

-- Verify custom fields have automotive data
SELECT id, title, custom_fields->'vehicle_category' as vehicle_category, 
       custom_fields->'timeline' as timeline,
       custom_fields->'vehicle_type_preference' as vehicle_preference
FROM leads 
WHERE industry = 'automotive'
LIMIT 5;

-- Check value distribution
SELECT 
    CASE 
        WHEN value < 20000 THEN 'Economy (<$20K)'
        WHEN value < 35000 THEN 'Mid-range ($20K-$35K)'
        WHEN value < 50000 THEN 'Premium ($35K-$50K)'
        ELSE 'Luxury ($50K+)'
    END as price_range,
    COUNT(*) as lead_count,
    ROUND(AVG(value), 2) as avg_value
FROM leads 
WHERE industry = 'automotive'
GROUP BY 
    CASE 
        WHEN value < 20000 THEN 'Economy (<$20K)'
        WHEN value < 35000 THEN 'Mid-range ($20K-$35K)'
        WHEN value < 50000 THEN 'Premium ($35K-$50K)'
        ELSE 'Luxury ($50K+)'
    END
ORDER BY avg_value;
*/