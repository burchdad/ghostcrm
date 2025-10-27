-- =====================================
-- INVENTORY & CLIENT CONFIGURATION SCHEMA
-- Advanced inventory management and multi-tenant configuration
-- =====================================
-- This migration adds comprehensive inventory management and client configuration
-- capabilities for automotive dealerships and other inventory-based businesses

-- =====================================
-- 1. CLIENT CONFIGURATION SYSTEM
-- =====================================

-- Client-specific configuration for multi-tenant database management
CREATE TABLE IF NOT EXISTS client_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    database_type VARCHAR(50) NOT NULL CHECK (database_type IN ('supabase', 'mysql', 'postgresql', 'rest_api', 'custom')),
    connection_config JSONB NOT NULL DEFAULT '{}',
    field_mappings JSONB DEFAULT '{}',
    custom_validations JSONB DEFAULT '{}',
    integration_settings JSONB DEFAULT '{}',
    sync_frequency INTEGER DEFAULT 30, -- minutes
    auto_sync_enabled BOOLEAN DEFAULT true,
    webhook_url TEXT,
    api_key_hash VARCHAR(255),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'active', 'error', 'disabled')),
    sync_error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'testing' CHECK (status IN ('active', 'inactive', 'testing'))
);

-- =====================================
-- 2. COMPREHENSIVE INVENTORY SYSTEM
-- =====================================

-- Enhanced inventory table with support for dynamic fields and automotive specifics
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    
    -- Condition and Status
    condition VARCHAR(20) DEFAULT 'new' CHECK (condition IN ('new', 'used', 'certified', 'damaged', 'parts_only')),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'pending', 'maintenance', 'transit', 'discontinued')),
    
    -- Pricing Information
    price_cost DECIMAL(15,2) DEFAULT 0,
    price_msrp DECIMAL(15,2) DEFAULT 0,
    price_selling DECIMAL(15,2) NOT NULL,
    price_reserve DECIMAL(15,2), -- minimum acceptable price
    price_currency VARCHAR(3) DEFAULT 'USD',
    pricing_strategy VARCHAR(50) DEFAULT 'fixed' CHECK (pricing_strategy IN ('fixed', 'negotiable', 'auction', 'make_offer')),
    
    -- Stock Information
    stock_on_hand INTEGER DEFAULT 0,
    stock_reserved INTEGER DEFAULT 0,
    stock_available INTEGER GENERATED ALWAYS AS (stock_on_hand - stock_reserved) STORED,
    stock_reorder_level INTEGER DEFAULT 0,
    stock_reorder_qty INTEGER DEFAULT 0,
    
    -- Location Information
    location_warehouse VARCHAR(100),
    location_lot VARCHAR(50),
    location_section VARCHAR(50),
    location_row VARCHAR(50),
    location_spot VARCHAR(50),
    location_notes TEXT,
    
    -- Automotive Specific Fields
    vin VARCHAR(17), -- Vehicle Identification Number
    engine_type VARCHAR(100),
    transmission VARCHAR(50),
    fuel_type VARCHAR(30) CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid', 'plug_in_hybrid', 'hydrogen')),
    drivetrain VARCHAR(20) CHECK (drivetrain IN ('fwd', 'rwd', 'awd', '4wd')),
    exterior_color VARCHAR(50),
    interior_color VARCHAR(50),
    mileage INTEGER,
    doors INTEGER,
    cylinders INTEGER,
    
    -- Flexible Data Storage
    specifications JSONB DEFAULT '{}',
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    documents TEXT[] DEFAULT ARRAY[]::TEXT[],
    custom_fields JSONB DEFAULT '{}',
    
    -- Marketing and Sales
    description TEXT,
    marketing_description TEXT,
    highlights TEXT[],
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_featured BOOLEAN DEFAULT false,
    is_certified BOOLEAN DEFAULT false,
    warranty_info JSONB DEFAULT '{}',
    
    -- Ownership and History
    previous_owners INTEGER DEFAULT 0,
    accident_history BOOLEAN DEFAULT false,
    service_history JSONB DEFAULT '[]',
    ownership_history JSONB DEFAULT '[]',
    
    -- Activity Tracking
    last_activity_type VARCHAR(50),
    last_activity_user_id UUID REFERENCES users(id),
    last_activity_details TEXT,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    
    -- Lead and Sale Tracking
    lead_source VARCHAR(100),
    assigned_to UUID REFERENCES users(id),
    interested_customers JSONB DEFAULT '[]',
    
    -- SEO and Marketing
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    marketing_channels TEXT[],
    
    -- Notes and Internal Info
    notes TEXT,
    internal_notes TEXT,
    purchase_date DATE,
    purchase_source VARCHAR(100),
    expected_sale_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    sold_at TIMESTAMP WITH TIME ZONE
);

-- =====================================
-- 3. INVENTORY CATEGORIES & ATTRIBUTES
-- =====================================

-- Predefined categories for inventory organization
CREATE TABLE IF NOT EXISTS inventory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES inventory_categories(id),
    description TEXT,
    attributes JSONB DEFAULT '{}', -- category-specific attributes
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dynamic attributes for different inventory types
CREATE TABLE IF NOT EXISTS inventory_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES inventory_categories(id),
    attribute_name VARCHAR(100) NOT NULL,
    attribute_type VARCHAR(20) CHECK (attribute_type IN ('text', 'number', 'boolean', 'date', 'select', 'multiselect')),
    attribute_options JSONB DEFAULT '[]', -- for select/multiselect types
    is_required BOOLEAN DEFAULT false,
    is_searchable BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 4. INVENTORY TRANSACTIONS
-- =====================================

-- Track all inventory movements and changes
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'transfer', 'adjustment', 'reservation', 'return')),
    quantity_change INTEGER NOT NULL, -- positive for additions, negative for reductions
    unit_price DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    reference_type VARCHAR(50), -- 'deal', 'purchase_order', 'manual_adjustment'
    reference_id UUID,
    notes TEXT,
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 5. INDEXES FOR PERFORMANCE
-- =====================================

-- Client configs indexes
CREATE INDEX IF NOT EXISTS idx_client_configs_status ON client_configs(status);
CREATE INDEX IF NOT EXISTS idx_client_configs_database_type ON client_configs(database_type);
CREATE INDEX IF NOT EXISTS idx_client_configs_updated_at ON client_configs(updated_at);
CREATE INDEX IF NOT EXISTS idx_client_configs_sync_status ON client_configs(sync_status, last_sync_at);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_inventory_brand_model ON inventory(brand, model);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_condition ON inventory(condition);
CREATE INDEX IF NOT EXISTS idx_inventory_year ON inventory(year);
CREATE INDEX IF NOT EXISTS idx_inventory_price ON inventory(price_selling);
CREATE INDEX IF NOT EXISTS idx_inventory_updated_at ON inventory(updated_at);
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON inventory(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_vin ON inventory(vin);
CREATE INDEX IF NOT EXISTS idx_inventory_assigned_to ON inventory(assigned_to);
CREATE INDEX IF NOT EXISTS idx_inventory_featured ON inventory(is_featured, status);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_inventory_search ON inventory USING gin (
    to_tsvector('english', 
        COALESCE(name, '') || ' ' || 
        COALESCE(brand, '') || ' ' || 
        COALESCE(model, '') || ' ' || 
        COALESCE(description, '') || ' ' ||
        COALESCE(array_to_string(tags, ' '), '')
    )
);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_inventory_categories_parent ON inventory_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_active ON inventory_categories(is_active, sort_order);

-- Attributes indexes
CREATE INDEX IF NOT EXISTS idx_inventory_attributes_category ON inventory_attributes(category_id);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_inventory ON inventory_transactions(inventory_id, processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type, processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_reference ON inventory_transactions(reference_type, reference_id);

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_sku_unique ON inventory(sku);
CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_vin_unique ON inventory(vin) WHERE vin IS NOT NULL;

-- =====================================
-- 6. FUNCTIONS & TRIGGERS
-- =====================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log inventory changes
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log significant changes to inventory
    IF (TG_OP = 'UPDATE') THEN
        -- Only log if important fields changed
        IF (OLD.status != NEW.status OR 
            OLD.price_selling != NEW.price_selling OR 
            OLD.stock_on_hand != NEW.stock_on_hand) THEN
            
            INSERT INTO inventory_transactions (
                inventory_id, transaction_type, quantity_change, 
                unit_price, notes, processed_by
            ) VALUES (
                NEW.id, 'adjustment', 
                NEW.stock_on_hand - OLD.stock_on_hand,
                NEW.price_selling,
                'Automatic log: ' || TG_OP,
                NEW.last_activity_user_id
            );
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO inventory_transactions (
            inventory_id, transaction_type, quantity_change,
            unit_price, notes, processed_by
        ) VALUES (
            NEW.id, 'purchase', NEW.stock_on_hand,
            NEW.price_selling, 'Initial inventory creation',
            NEW.last_activity_user_id
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_client_configs_updated_at 
    BEFORE UPDATE ON client_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_inventory_updated_at 
    BEFORE UPDATE ON inventory 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_inventory_change_log
    AFTER INSERT OR UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION log_inventory_change();

-- =====================================
-- 7. ROW LEVEL SECURITY
-- =====================================

-- Enable RLS on all tables
ALTER TABLE client_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view inventory" ON inventory
    FOR SELECT USING (true);

CREATE POLICY "Users can edit assigned inventory" ON inventory
    FOR UPDATE USING (assigned_to = auth.uid() OR auth.role() IN ('admin', 'manager'));

CREATE POLICY "Admin can manage client configs" ON client_configs
    FOR ALL USING (auth.role() IN ('admin', 'super_admin'));

-- =====================================
-- 8. INITIAL DATA SEEDING
-- =====================================

-- Insert default inventory categories
INSERT INTO inventory_categories (name, description, attributes) VALUES 
('Vehicles', 'Motor vehicles for sale', '{"requires_vin": true, "requires_mileage": true}'),
('Parts', 'Vehicle parts and accessories', '{"requires_part_number": true}'),
('Services', 'Service packages and warranties', '{"is_service": true}')
ON CONFLICT DO NOTHING;

-- Insert default client configuration
INSERT INTO client_configs (
    id, name, database_type, connection_config, field_mappings, integration_settings
) VALUES (
    gen_random_uuid(),
    'Default Configuration',
    'supabase',
    '{}',
    '{}',
    '{"sync_frequency": 30, "auto_sync": true, "sync_endpoints": {"inventory": "/api/inventory", "leads": "/api/leads", "deals": "/api/deals"}}'
)
ON CONFLICT (id) DO NOTHING;