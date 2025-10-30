-- Create product_change_log table for tracking automatic sync triggers
CREATE TABLE IF NOT EXISTS product_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_type TEXT NOT NULL, -- 'plan', 'addon', 'role_tier', 'org_plan'
  changes JSONB DEFAULT '{}',
  user_id TEXT,
  triggered_sync BOOLEAN DEFAULT false,
  sync_result JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_change_log_product_id ON product_change_log(product_id);
CREATE INDEX IF NOT EXISTS idx_product_change_log_event_type ON product_change_log(event_type);
CREATE INDEX IF NOT EXISTS idx_product_change_log_created_at ON product_change_log(created_at);
CREATE INDEX IF NOT EXISTS idx_product_change_log_user_id ON product_change_log(user_id);
CREATE INDEX IF NOT EXISTS idx_product_change_log_triggered_sync ON product_change_log(triggered_sync);

-- Add comments for documentation
COMMENT ON TABLE product_change_log IS 'Logs all product changes that trigger Stripe synchronization';
COMMENT ON COLUMN product_change_log.event_type IS 'Type of change event (e.g., plan.updated, addon.created)';
COMMENT ON COLUMN product_change_log.product_id IS 'ID of the product that changed';
COMMENT ON COLUMN product_change_log.product_type IS 'Category of product (plan, addon, role_tier, org_plan)';
COMMENT ON COLUMN product_change_log.changes IS 'JSON object containing the specific changes made';
COMMENT ON COLUMN product_change_log.triggered_sync IS 'Whether this change triggered an automatic sync';
COMMENT ON COLUMN product_change_log.sync_result IS 'Result of the sync operation (if applicable)';