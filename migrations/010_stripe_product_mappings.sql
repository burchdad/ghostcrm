-- Create stripe_product_mappings table for syncing local products with Stripe
CREATE TABLE IF NOT EXISTS stripe_product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_product_id TEXT UNIQUE NOT NULL,
  local_product_name TEXT NOT NULL,
  stripe_product_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  price_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  billing_type TEXT DEFAULT 'monthly', -- 'monthly', 'yearly', 'one_time'
  sync_status TEXT DEFAULT 'synced', -- 'created', 'updated', 'synced', 'error'
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_mappings_local_id ON stripe_product_mappings(local_product_id);
CREATE INDEX IF NOT EXISTS idx_stripe_mappings_stripe_product ON stripe_product_mappings(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_stripe_mappings_stripe_price ON stripe_product_mappings(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_stripe_mappings_active ON stripe_product_mappings(active);
CREATE INDEX IF NOT EXISTS idx_stripe_mappings_sync_status ON stripe_product_mappings(sync_status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stripe_mappings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_stripe_mappings_updated_at
  BEFORE UPDATE ON stripe_product_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_stripe_mappings_updated_at();

-- Add comments for documentation
COMMENT ON TABLE stripe_product_mappings IS 'Maps local GhostCRM products to Stripe products and prices';
COMMENT ON COLUMN stripe_product_mappings.local_product_id IS 'Unique identifier for the product in GhostCRM (e.g., plan_starter_monthly)';
COMMENT ON COLUMN stripe_product_mappings.stripe_product_id IS 'Stripe product ID (prod_xxx)';
COMMENT ON COLUMN stripe_product_mappings.stripe_price_id IS 'Stripe price ID (price_xxx)';
COMMENT ON COLUMN stripe_product_mappings.sync_status IS 'Status of last sync operation';
COMMENT ON COLUMN stripe_product_mappings.metadata IS 'Additional metadata from the sync process';