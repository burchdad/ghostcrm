const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createSampleDealsData() {
  console.log('🎯 Creating sample deals data for GhostCRM...');

  try {
    // First check if organizations exist
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, subdomain')
      .limit(5);

    if (orgError) {
      console.error('❌ Error fetching organizations:', orgError.message);
      return;
    }

    console.log(`✅ Found ${orgs?.length || 0} organizations`);
    if (orgs && orgs.length > 0) {
      orgs.forEach(org => {
        console.log(`   - ${org.name} (${org.subdomain})`);
      });
    }

    // Find your organization (burch-enterprises)
    const yourOrg = orgs?.find(org => org.subdomain === 'burch-enterprises') || orgs?.[0];
    
    if (!yourOrg) {
      console.log('❌ No organization found. Creating sample organization...');
      
      const { data: newOrg, error: createOrgError } = await supabase
        .from('organizations')
        .insert([{
          name: 'Burch Enterprises',
          subdomain: 'burch-enterprises',
          domain: 'burch-enterprises.com',
          settings: {
            industry: 'automotive',
            business_type: 'dealership',
            enable_demo_data: true
          }
        }])
        .select()
        .single();

      if (createOrgError) {
        console.error('❌ Error creating organization:', createOrgError.message);
        return;
      }

      console.log('✅ Created organization:', newOrg.name);
      yourOrg = newOrg;
    }

    console.log(`🏢 Using organization: ${yourOrg.name} (ID: ${yourOrg.id})`);

    // Create sample leads
    console.log('\\n👥 Creating sample leads...');
    const sampleLeads = [
      {
        organization_id: yourOrg.id,
        title: 'John Mitchell - Vehicle Purchase',
        stage: 'qualified',
        budget_range: '$25,000-$35,000',
        vehicle_interest: '2024 Toyota Camry',
        source: 'website',
        priority: 'high',
        value: 30000,
        description: 'Interested in a reliable sedan for family use',
        custom_fields: {
          preferred_contact: 'email',
          timeline: 'within_month',
          financing: true
        }
      },
      {
        organization_id: yourOrg.id,
        title: 'Sarah Johnson - SUV Purchase',
        stage: 'proposal',
        budget_range: '$40,000-$50,000',
        vehicle_interest: '2024 Honda CR-V',
        source: 'referral',
        priority: 'medium',
        value: 45000,
        description: 'Looking for a family SUV with good safety ratings',
        custom_fields: {
          preferred_contact: 'phone',
          timeline: 'flexible',
          trade_in: true
        }
      },
      {
        organization_id: yourOrg.id,
        title: 'Mike Wilson - Truck Purchase',
        stage: 'negotiation',
        budget_range: '$35,000-$45,000',
        vehicle_interest: '2024 Ford F-150',
        source: 'walk_in',
        priority: 'high',
        value: 42000,
        description: 'Needs a work truck for construction business',
        custom_fields: {
          preferred_contact: 'text',
          timeline: 'urgent',
          business_purchase: true
        }
      }
    ];

    const { data: createdLeads, error: leadsError } = await supabase
      .from('leads')
      .insert(sampleLeads)
      .select();

    if (leadsError) {
      console.error('❌ Error creating leads:', leadsError.message);
    } else {
      console.log(`✅ Created ${createdLeads?.length || 0} sample leads`);
    }

    // Create sample inventory
    console.log('\\n🚗 Creating sample inventory...');
    const sampleInventory = [
      {
        organization_id: yourOrg.id,
        make: 'Toyota',
        model: 'Camry',
        year: 2024,
        vin: '1HGBH41JXMN109186',
        price_selling: 32000,
        price_cost: 28000,
        condition: 'new',
        status: 'available',
        mileage: 0,
        color: 'Silver',
        description: 'Brand new Toyota Camry with all standard features',
        features: ['Backup Camera', 'Bluetooth', 'Cruise Control', 'Apple CarPlay'],
        location: 'Main Lot'
      },
      {
        organization_id: yourOrg.id,
        make: 'Honda',
        model: 'CR-V',
        year: 2024,
        vin: '2HKRW2H85NH123456',
        price_selling: 48000,
        price_cost: 42000,
        condition: 'new',
        status: 'available',
        mileage: 0,
        color: 'White Pearl',
        description: 'New Honda CR-V with premium safety package',
        features: ['AWD', 'Honda Sensing', 'Sunroof', 'Heated Seats'],
        location: 'Main Lot'
      },
      {
        organization_id: yourOrg.id,
        make: 'Ford',
        model: 'F-150',
        year: 2024,
        vin: '1FTFW1E50NFA12345',
        price_selling: 44000,
        price_cost: 38000,
        condition: 'new',
        status: 'available',
        mileage: 0,
        color: 'Magnetic Gray',
        description: 'Ford F-150 SuperCrew with 4WD capability',
        features: ['4WD', 'Towing Package', 'Bed Liner', 'Running Boards'],
        location: 'Main Lot'
      },
      {
        organization_id: yourOrg.id,
        make: 'Chevrolet',
        model: 'Malibu',
        year: 2023,
        vin: '1G1ZB5ST0NF123456',
        price_selling: 26000,
        price_cost: 22000,
        condition: 'used',
        status: 'available',
        mileage: 15000,
        color: 'Blue',
        description: 'Well-maintained 2023 Chevrolet Malibu with low mileage',
        features: ['Remote Start', 'Wireless Charging', 'Lane Assist'],
        location: 'Used Car Lot'
      }
    ];

    const { data: createdInventory, error: inventoryError } = await supabase
      .from('inventory')
      .insert(sampleInventory)
      .select();

    if (inventoryError) {
      console.error('❌ Error creating inventory:', inventoryError.message);
    } else {
      console.log(`✅ Created ${createdInventory?.length || 0} sample inventory items`);
    }

    // Try to create deals table if it doesn't exist
    console.log('\\n💼 Ensuring deals table exists...');
    
    const createDealsTableSQL = `
      CREATE TABLE IF NOT EXISTS deals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
        
        -- Basic deal information
        title VARCHAR(255) NOT NULL,
        description TEXT,
        stage VARCHAR(100) DEFAULT 'prospect' CHECK (stage IN ('prospect', 'qualified', 'proposal', 'negotiation', 'financing', 'paperwork', 'closed_won', 'closed_lost')),
        
        -- Financial information
        amount DECIMAL(12,2) DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'USD',
        probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
        
        -- Customer and sales information  
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        
        -- Vehicle information (for automotive CRM)
        vehicle VARCHAR(255),
        vehicle_details JSONB DEFAULT '{}',
        
        -- Sales process
        sales_rep VARCHAR(255),
        assigned_to VARCHAR(255),
        expected_close DATE,
        actual_close DATE,
        
        -- Deal metadata
        source VARCHAR(100),
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        tags TEXT[],
        notes TEXT,
        
        -- Financial breakdown
        trade_in JSONB DEFAULT '{}',
        financing JSONB DEFAULT '{}',
        tax_title_fees JSONB DEFAULT '{}',
        
        -- Custom fields for flexibility
        custom_fields JSONB DEFAULT '{}',
        
        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable Row Level Security
      ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

      -- Create policy for organization access
      DROP POLICY IF EXISTS "Users can access deals from their organization" ON deals;
      CREATE POLICY "Users can access deals from their organization" ON deals
        FOR ALL USING (organization_id IN (
          SELECT organization_id 
          FROM organization_memberships 
          WHERE user_id = auth.uid()
        ));

      -- Service role bypass policy for demo data
      DROP POLICY IF EXISTS "Service role can manage all deals" ON deals;
      CREATE POLICY "Service role can manage all deals" ON deals
        FOR ALL USING (auth.role() = 'service_role');
    `;

    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createDealsTableSQL });
    
    if (tableError) {
      console.error('❌ Error creating deals table:', tableError.message);
    } else {
      console.log('✅ Deals table ready');
    }

    // Create sample deals
    console.log('\\n💼 Creating sample deals...');
    const sampleDeals = [
      {
        organization_id: yourOrg.id,
        lead_id: createdLeads?.[0]?.id,
        title: 'John Mitchell - 2024 Toyota Camry',
        description: 'Family sedan purchase for reliable daily transportation',
        stage: 'negotiation',
        amount: 32000,
        probability: 75,
        customer_name: 'John Mitchell',
        customer_email: 'john.mitchell@email.com',
        customer_phone: '(555) 123-4567',
        vehicle: '2024 Toyota Camry Silver',
        vehicle_details: {
          make: 'Toyota',
          model: 'Camry',
          year: 2024,
          color: 'Silver',
          vin: '1HGBH41JXMN109186'
        },
        sales_rep: 'Sales Team',
        assigned_to: 'burchsl4@gmail.com',
        expected_close: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        source: 'website',
        priority: 'high',
        tags: ['family_car', 'first_time_buyer'],
        notes: 'Customer is very interested, waiting on financing approval',
        financing: {
          type: 'finance',
          down_payment: 5000,
          loan_amount: 27000,
          apr: 3.9
        }
      },
      {
        organization_id: yourOrg.id,
        lead_id: createdLeads?.[1]?.id,
        title: 'Sarah Johnson - 2024 Honda CR-V',
        description: 'Family SUV with safety features for growing family',
        stage: 'proposal',
        amount: 48000,
        probability: 60,
        customer_name: 'Sarah Johnson',
        customer_email: 'sarah.johnson@email.com',
        customer_phone: '(555) 234-5678',
        vehicle: '2024 Honda CR-V White Pearl',
        vehicle_details: {
          make: 'Honda',
          model: 'CR-V',
          year: 2024,
          color: 'White Pearl',
          vin: '2HKRW2H85NH123456'
        },
        sales_rep: 'Sales Team',
        assigned_to: 'burchsl4@gmail.com',
        expected_close: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        source: 'referral',
        priority: 'medium',
        tags: ['family_suv', 'safety_focused'],
        notes: 'Customer comparing with other SUVs, emphasis on safety ratings',
        trade_in: {
          vehicle: '2018 Honda Accord',
          estimated_value: 12000,
          condition: 'good'
        }
      }
    ];

    const { data: createdDeals, error: dealsError } = await supabase
      .from('deals')
      .insert(sampleDeals)
      .select();

    if (dealsError) {
      console.error('❌ Error creating deals:', dealsError.message);
      console.error('Details:', dealsError);
    } else {
      console.log(`✅ Created ${createdDeals?.length || 0} sample deals`);
    }

    console.log('\\n🎉 Sample data creation completed!');
    console.log('\\n📊 Summary:');
    console.log(`   Organizations: 1`);
    console.log(`   Leads: ${createdLeads?.length || 0}`);
    console.log(`   Inventory: ${createdInventory?.length || 0}`);
    console.log(`   Deals: ${createdDeals?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Error in sample data creation:', error);
  }
}

// Run the script
createSampleDealsData();