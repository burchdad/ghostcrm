-- Client configuration table for multi-tenant database management
CREATE TABLE client_configs (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  database_type VARCHAR(50) NOT NULL CHECK (database_type IN ('supabase', 'mysql', 'postgresql', 'rest_api', 'custom')),
  connection_config JSONB NOT NULL DEFAULT '{}',
  field_mappings JSONB DEFAULT '{}',
  custom_validations JSONB DEFAULT '{}',
  integration_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'testing' CHECK (status IN ('active', 'inactive', 'testing'))
);

-- Indexes for performance
CREATE INDEX idx_client_configs_status ON client_configs(status);
CREATE INDEX idx_client_configs_database_type ON client_configs(database_type);
CREATE INDEX idx_client_configs_updated_at ON client_configs(updated_at);

-- Enhanced inventory table with support for dynamic fields
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  condition VARCHAR(20) DEFAULT 'new' CHECK (condition IN ('new', 'used', 'certified', 'damaged')),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'pending', 'maintenance')),
  
  -- Pricing information
  price_cost DECIMAL(12,2) DEFAULT 0,
  price_msrp DECIMAL(12,2) DEFAULT 0,
  price_selling DECIMAL(12,2) NOT NULL,
  price_currency VARCHAR(3) DEFAULT 'USD',
  
  -- Stock information
  stock_on_hand INTEGER DEFAULT 0,
  stock_reserved INTEGER DEFAULT 0,
  stock_available INTEGER DEFAULT 0,
  stock_reorder_level INTEGER DEFAULT 0,
  stock_reorder_qty INTEGER DEFAULT 0,
  
  -- Location information
  loc_lot VARCHAR(50),
  loc_section VARCHAR(50),
  loc_row VARCHAR(50),
  loc_spot VARCHAR(50),
  loc_warehouse VARCHAR(100),
  
  -- Flexible fields for client customization
  specifications JSONB DEFAULT '{}',
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}',
  
  -- Metadata
  description TEXT,
  notes TEXT,
  
  -- Activity tracking
  last_activity_type VARCHAR(50),
  last_activity_user VARCHAR(255),
  last_activity_details TEXT,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for inventory table
CREATE INDEX idx_inventory_sku ON inventory(sku);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_brand ON inventory(brand);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_condition ON inventory(condition);
CREATE INDEX idx_inventory_updated_at ON inventory(updated_at);
CREATE INDEX idx_inventory_search ON inventory USING gin (to_tsvector('english', name || ' ' || COALESCE(brand, '') || ' ' || COALESCE(model, '')));

-- Unique constraint on SKU
CREATE UNIQUE INDEX idx_inventory_sku_unique ON inventory(sku);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update timestamps
CREATE TRIGGER trigger_client_configs_updated_at 
    BEFORE UPDATE ON client_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_inventory_updated_at 
    BEFORE UPDATE ON inventory 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies for multi-tenancy
ALTER TABLE client_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Sample client configuration data
INSERT INTO client_configs (id, name, database_type, connection_config, field_mappings, integration_settings) VALUES 
(
  'default',
  'Default Configuration',
  'supabase',
  '{"url": "' || current_setting('app.supabase_url', true) || '", "key": "' || current_setting('app.supabase_key', true) || '"}',
  '{}',
  '{"sync_frequency": 30, "auto_sync": true, "sync_endpoints": {"inventory": "/api/inventory", "leads": "/api/leads", "deals": "/api/deals"}}'
),
(
  'demo-client',
  'Demo Auto Dealership',
  'supabase',
  '{"url": "' || current_setting('app.supabase_url', true) || '", "key": "' || current_setting('app.supabase_key', true) || '"}',
  '{"stock_on_hand": "qty_available", "price_selling": "sale_price"}',
  '{"sync_frequency": 15, "auto_sync": true, "webhook_url": "https://demo-client.com/webhooks/crm"}'
);

-- Sample inventory data
INSERT INTO inventory (name, sku, category, brand, model, year, condition, status, price_cost, price_msrp, price_selling, stock_on_hand, stock_available, specifications) VALUES 
(
  '2024 Tesla Model S Plaid',
  'TESLA-MS-PLAID-2024-001',
  'Electric Vehicle',
  'Tesla',
  'Model S Plaid',
  2024,
  'new',
  'available',
  95000.00,
  129990.00,
  124990.00,
  1,
  1,
  '{"battery": "100 kWh", "range": "396 miles", "acceleration": "1.99s 0-60mph", "drive": "All-Wheel Drive", "autopilot": true}'
),
(
  '2023 BMW X5 M Competition',
  'BMW-X5M-COMP-2023-001',
  'SUV',
  'BMW',
  'X5 M Competition',
  2023,
  'certified',
  'available',
  88000.00,
  108900.00,
  98900.00,
  1,
  1,
  '{"engine": "4.4L Twin-Turbo V8", "horsepower": "617 hp", "drive": "All-Wheel Drive", "fuel_economy": "13/18 mpg"}'
),
(
  '2022 Porsche 911 Carrera S',
  'PORSCHE-911-CS-2022-001',
  'Sports Car',
  'Porsche',
  '911 Carrera S',
  2022,
  'used',
  'available',
  95000.00,
  120350.00,
  108000.00,
  1,
  1,
  '{"engine": "3.0L Twin-Turbo Flat-6", "horsepower": "443 hp", "transmission": "8-Speed PDK", "top_speed": "191 mph"}'
);

-- Comments for documentation
COMMENT ON TABLE client_configs IS 'Configuration settings for multi-tenant client database integrations';
COMMENT ON TABLE inventory IS 'Vehicle inventory management with support for dynamic fields and multi-tenant configurations';
COMMENT ON COLUMN inventory.custom_fields IS 'Client-specific fields that can be dynamically added based on client requirements';
COMMENT ON COLUMN inventory.specifications IS 'Vehicle-specific technical specifications stored as JSON';
COMMENT ON COLUMN client_configs.field_mappings IS 'Maps standard CRM fields to client-specific field names';
COMMENT ON COLUMN client_configs.custom_validations IS 'Client-specific validation rules stored as JSON schema';