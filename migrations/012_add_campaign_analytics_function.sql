-- Migration: Add missing get_campaign_analytics function
-- Date: 2025-11-06
-- Purpose: Fix "Could not find the function public.get_campaign_analytics(org_id)" error

-- Create the get_campaign_analytics function
CREATE OR REPLACE FUNCTION public.get_campaign_analytics(org_id text DEFAULT '1')
RETURNS TABLE (
    campaign_id bigint,
    campaign_name text,
    sent_count bigint,
    opened_count bigint,
    clicked_count bigint,
    called_count bigint,
    converted_count bigint,
    error_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- For now, return mock data since the campaigns table structure is not defined
    -- This can be updated when actual campaign tables are implemented
    RETURN QUERY
    SELECT 
        1::bigint as campaign_id,
        'Email Campaign Q4'::text as campaign_name,
        150::bigint as sent_count,
        45::bigint as opened_count,
        12::bigint as clicked_count,
        8::bigint as called_count,
        3::bigint as converted_count,
        2::bigint as error_count
    UNION ALL
    SELECT 
        2::bigint as campaign_id,
        'Social Media Outreach'::text as campaign_name,
        200::bigint as sent_count,
        60::bigint as opened_count,
        18::bigint as clicked_count,
        12::bigint as called_count,
        5::bigint as converted_count,
        1::bigint as error_count
    UNION ALL
    SELECT 
        3::bigint as campaign_id,
        'Phone Campaign'::text as campaign_name,
        100::bigint as sent_count,
        30::bigint as opened_count,
        8::bigint as clicked_count,
        25::bigint as called_count,
        4::bigint as converted_count,
        0::bigint as error_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_campaign_analytics(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_campaign_analytics(text) TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_campaign_analytics(text) IS 'Returns campaign analytics data for the specified organization. Currently returns mock data until campaign tables are implemented.';