-- Promo Code Analytics Views and Functions
-- Enhanced analytics for tracking promo code performance and ROI

-- Create materialized view for promo code analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS promo_code_analytics AS
SELECT 
    pc.id,
    pc.code,
    pc.description,
    pc.discount_type,
    pc.discount_value,
    pc.custom_monthly_price,
    pc.custom_yearly_price,
    pc.max_uses,
    pc.used_count,
    pc.created_at,
    pc.expires_at,
    pc.is_active,
    
    -- Usage metrics
    COUNT(pcu.id) as actual_usage_count,
    COALESCE(SUM(pcu.discount_amount), 0) as total_discount_given,
    COALESCE(SUM(pcu.order_amount), 0) as total_order_value,
    COALESCE(SUM(pcu.final_amount), 0) as total_revenue,
    COALESCE(AVG(pcu.discount_amount), 0) as avg_discount_amount,
    COALESCE(AVG(pcu.order_amount), 0) as avg_order_value,
    
    -- Conversion metrics
    CASE 
        WHEN pc.max_uses > 0 THEN ROUND((COUNT(pcu.id)::DECIMAL / pc.max_uses) * 100, 2)
        ELSE NULL
    END as usage_rate_percentage,
    
    -- Time-based metrics
    MIN(pcu.used_at) as first_used_at,
    MAX(pcu.used_at) as last_used_at,
    
    -- Popular plans
    MODE() WITHIN GROUP (ORDER BY pcu.plan_selected) as most_popular_plan,
    
    -- ROI calculation (revenue vs discount given)
    CASE 
        WHEN COALESCE(SUM(pcu.discount_amount), 0) > 0 
        THEN ROUND((COALESCE(SUM(pcu.final_amount), 0) / COALESCE(SUM(pcu.discount_amount), 1)) * 100, 2)
        ELSE NULL
    END as roi_percentage

FROM promo_codes pc
LEFT JOIN promo_code_usage pcu ON pc.id = pcu.promo_code_id
GROUP BY pc.id, pc.code, pc.description, pc.discount_type, pc.discount_value, 
         pc.custom_monthly_price, pc.custom_yearly_price, pc.max_uses, pc.used_count,
         pc.created_at, pc.expires_at, pc.is_active;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_promo_analytics_code ON promo_code_analytics(code);
CREATE INDEX IF NOT EXISTS idx_promo_analytics_usage_rate ON promo_code_analytics(usage_rate_percentage);
CREATE INDEX IF NOT EXISTS idx_promo_analytics_roi ON promo_code_analytics(roi_percentage);

-- Function to refresh analytics (call this periodically)
CREATE OR REPLACE FUNCTION refresh_promo_analytics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW promo_code_analytics;
END;
$$ LANGUAGE plpgsql;

-- Function to get promo code performance summary
CREATE OR REPLACE FUNCTION get_promo_performance_summary(
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_codes INTEGER,
    active_codes INTEGER,
    total_usage INTEGER,
    total_revenue DECIMAL,
    total_discount_given DECIMAL,
    avg_roi_percentage DECIMAL,
    top_performing_code VARCHAR(50),
    conversion_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_codes,
        COUNT(*) FILTER (WHERE is_active = true)::INTEGER as active_codes,
        COALESCE(SUM(actual_usage_count), 0)::INTEGER as total_usage,
        COALESCE(SUM(total_revenue), 0) as total_revenue,
        COALESCE(SUM(total_discount_given), 0) as total_discount_given,
        COALESCE(AVG(roi_percentage), 0) as avg_roi_percentage,
        (SELECT code FROM promo_code_analytics 
         WHERE created_at >= NOW() - INTERVAL '%s days'
         ORDER BY roi_percentage DESC NULLS LAST 
         LIMIT 1) as top_performing_code,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE actual_usage_count > 0)::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0
        END as conversion_rate
    FROM promo_code_analytics
    WHERE created_at >= NOW() - INTERVAL '%s days';
END;
$$ LANGUAGE plpgsql;

-- Function to get usage trends by time period
CREATE OR REPLACE FUNCTION get_promo_usage_trends(
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    usage_date DATE,
    daily_usage_count BIGINT,
    daily_revenue DECIMAL,
    daily_discount DECIMAL,
    unique_codes_used BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pcu.used_at::DATE as usage_date,
        COUNT(pcu.id) as daily_usage_count,
        COALESCE(SUM(pcu.final_amount), 0) as daily_revenue,
        COALESCE(SUM(pcu.discount_amount), 0) as daily_discount,
        COUNT(DISTINCT pcu.promo_code_id) as unique_codes_used
    FROM promo_code_usage pcu
    WHERE pcu.used_at >= NOW() - INTERVAL '%s days'
    GROUP BY pcu.used_at::DATE
    ORDER BY usage_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get top performing promo codes
CREATE OR REPLACE FUNCTION get_top_promo_codes(
    limit_count INTEGER DEFAULT 10,
    order_by VARCHAR DEFAULT 'roi_percentage' -- roi_percentage, total_revenue, actual_usage_count
)
RETURNS TABLE (
    code VARCHAR(50),
    description TEXT,
    usage_count INTEGER,
    total_revenue DECIMAL,
    total_discount DECIMAL,
    roi_percentage DECIMAL,
    usage_rate_percentage DECIMAL
) AS $$
BEGIN
    IF order_by = 'roi_percentage' THEN
        RETURN QUERY
        SELECT pca.code, pca.description, pca.actual_usage_count, 
               pca.total_revenue, pca.total_discount_given, 
               pca.roi_percentage, pca.usage_rate_percentage
        FROM promo_code_analytics pca
        WHERE pca.roi_percentage IS NOT NULL
        ORDER BY pca.roi_percentage DESC
        LIMIT limit_count;
    ELSIF order_by = 'total_revenue' THEN
        RETURN QUERY
        SELECT pca.code, pca.description, pca.actual_usage_count, 
               pca.total_revenue, pca.total_discount_given, 
               pca.roi_percentage, pca.usage_rate_percentage
        FROM promo_code_analytics pca
        ORDER BY pca.total_revenue DESC
        LIMIT limit_count;
    ELSE
        RETURN QUERY
        SELECT pca.code, pca.description, pca.actual_usage_count, 
               pca.total_revenue, pca.total_discount_given, 
               pca.roi_percentage, pca.usage_rate_percentage
        FROM promo_code_analytics pca
        ORDER BY pca.actual_usage_count DESC
        LIMIT limit_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh analytics when usage data changes
CREATE OR REPLACE FUNCTION trigger_refresh_promo_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh the materialized view after any changes to usage
    PERFORM refresh_promo_analytics();
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER refresh_analytics_on_usage_change
    AFTER INSERT OR UPDATE OR DELETE ON promo_code_usage
    FOR EACH STATEMENT EXECUTE FUNCTION trigger_refresh_promo_analytics();

CREATE TRIGGER refresh_analytics_on_promo_change
    AFTER INSERT OR UPDATE OR DELETE ON promo_codes
    FOR EACH STATEMENT EXECUTE FUNCTION trigger_refresh_promo_analytics();

-- Initial refresh
SELECT refresh_promo_analytics();

COMMENT ON MATERIALIZED VIEW promo_code_analytics IS 'Comprehensive analytics view for promo code performance tracking';
COMMENT ON FUNCTION get_promo_performance_summary IS 'Returns overall promo code performance metrics for a given time period';
COMMENT ON FUNCTION get_promo_usage_trends IS 'Returns daily usage trends for promo codes';
COMMENT ON FUNCTION get_top_promo_codes IS 'Returns top performing promo codes based on various metrics';