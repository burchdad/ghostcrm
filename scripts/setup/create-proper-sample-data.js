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

async function createProperSampleData() {
  console.log('🎯 Creating sample data with correct schema...');

  try {
    const orgId = '122e543d-f112-4e21-8f29-726642316a19'; // Your Burch Enterprises org ID
    
    // Create sample contacts first
    console.log('\\n👤 Creating sample contacts...');
    const sampleContacts = [
      {
        organization_id: orgId,
        first_name: 'John',
        last_name: 'Mitchell',
        email: 'john.mitchell@email.com',
        phone: '(555) 123-4567',
        company: 'Mitchell Family',
        title: 'Head of Household',
        source: 'website',
        status: 'active',
        tags: ['family_customer', 'first_time_buyer'],
        custom_fields: {
          preferred_contact: 'email',
          budget_range: '25000-35000',
          vehicle_interest: 'sedan'
        }
      },
      {
        organization_id: orgId,
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 234-5678',
        company: 'Johnson Enterprises',
        title: 'Business Owner',
        source: 'referral',
        status: 'active',
        tags: ['business_customer', 'family_needs'],
        custom_fields: {
          preferred_contact: 'phone',
          budget_range: '40000-50000',
          vehicle_interest: 'suv'
        }
      },
      {
        organization_id: orgId,
        first_name: 'Mike',
        last_name: 'Wilson',
        email: 'mike.wilson@email.com',
        phone: '(555) 345-6789',
        company: 'Wilson Construction',
        title: 'Contractor',
        source: 'walk_in',
        status: 'active',
        tags: ['business_customer', 'work_vehicle'],
        custom_fields: {
          preferred_contact: 'text',
          budget_range: '35000-45000',
          vehicle_interest: 'truck'
        }
      }
    ];

    const { data: createdContacts, error: contactsError } = await supabase
      .from('contacts')
      .insert(sampleContacts)
      .select();

    if (contactsError) {
      console.error('❌ Error creating contacts:', contactsError.message);
    } else {
      console.log(`✅ Created ${createdContacts?.length || 0} sample contacts`);
    }

    // Create sample leads using the correct schema
    console.log('\\n👥 Creating sample leads...');
    const sampleLeads = [
      {
        organization_id: orgId,
        contact_id: createdContacts?.[0]?.id,
        title: 'John Mitchell - Vehicle Purchase',
        description: 'Interested in a reliable sedan for family use',
        value: 30000,
        currency: 'USD',
        stage: 'qualified',
        priority: 'high',
        source: 'website',
        assigned_to: 'burchsl4@gmail.com',
        expected_close_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        probability: 75,
        tags: ['family_car', 'first_time_buyer'],
        custom_fields: {
          vehicle_interest: '2024 Toyota Camry',
          budget_range: '$25,000-$35,000',
          financing_needed: true,
          timeline: 'within_month',
          trade_in: false
        }
      },
      {
        organization_id: orgId,
        contact_id: createdContacts?.[1]?.id,
        title: 'Sarah Johnson - SUV Purchase',
        description: 'Looking for a family SUV with good safety ratings',
        value: 45000,
        currency: 'USD',
        stage: 'proposal',
        priority: 'medium',
        source: 'referral',
        assigned_to: 'burchsl4@gmail.com',
        expected_close_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        probability: 60,
        tags: ['family_suv', 'safety_focused'],
        custom_fields: {
          vehicle_interest: '2024 Honda CR-V',
          budget_range: '$40,000-$50,000',
          financing_needed: false,
          timeline: 'flexible',
          trade_in: true,
          trade_in_vehicle: '2018 Honda Accord'
        }
      },
      {
        organization_id: orgId,
        contact_id: createdContacts?.[2]?.id,
        title: 'Mike Wilson - Truck Purchase',
        description: 'Needs a work truck for construction business',
        value: 42000,
        currency: 'USD',
        stage: 'negotiation',
        priority: 'high',
        source: 'walk_in',
        assigned_to: 'burchsl4@gmail.com',
        expected_close_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        probability: 80,
        tags: ['work_truck', 'business_purchase'],
        custom_fields: {
          vehicle_interest: '2024 Ford F-150',
          budget_range: '$35,000-$45,000',
          financing_needed: true,
          timeline: 'urgent',
          business_purchase: true,
          tax_deduction: true
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

    // Create sample inventory using the correct schema
    console.log('\\n🚗 Creating sample inventory...');
    const sampleInventory = [
      {
        organization_id: orgId,
        name: '2024 Toyota Camry LE',
        sku: 'TOY-CAM-2024-001',
        category: 'sedan',
        brand: 'Toyota',
        model: 'Camry',
        year: 2024,
        condition: 'new',
        status: 'available',
        price_cost: 28000,
        price_msrp: 35000,
        price_selling: 32000,
        price_currency: 'USD',
        stock_on_hand: 1,
        stock_reserved: 0,
        stock_available: 1,
        stock_reorder_level: 1,
        stock_reorder_qty: 2,
        loc_lot: 'Main Lot',
        loc_section: 'A',
        loc_row: '1',
        loc_spot: '5',
        specifications: {
          engine: '2.5L 4-Cylinder',
          transmission: 'CVT',
          drivetrain: 'FWD',
          fuel_economy: '32/41 mpg',
          color: 'Silver',
          interior: 'Black Fabric',
          vin: '1HGBH41JXMN109186',
          mileage: 0
        },
        description: 'Brand new 2024 Toyota Camry LE with all standard features including Toyota Safety Sense 2.0',
        notes: 'Popular family sedan with excellent reliability',
        custom_fields: {
          features: ['Backup Camera', 'Bluetooth', 'Cruise Control', 'Apple CarPlay'],
          warranty: '3yr/36k basic, 5yr/60k powertrain',
          incentives: 'First-time buyer rebate available'
        }
      },
      {
        organization_id: orgId,
        name: '2024 Honda CR-V EX',
        sku: 'HON-CRV-2024-001',
        category: 'suv',
        brand: 'Honda',
        model: 'CR-V',
        year: 2024,
        condition: 'new',
        status: 'available',
        price_cost: 42000,
        price_msrp: 52000,
        price_selling: 48000,
        price_currency: 'USD',
        stock_on_hand: 1,
        stock_reserved: 0,
        stock_available: 1,
        stock_reorder_level: 1,
        stock_reorder_qty: 1,
        loc_lot: 'Main Lot',
        loc_section: 'B',
        loc_row: '2',
        loc_spot: '3',
        specifications: {
          engine: '1.5L Turbo',
          transmission: 'CVT',
          drivetrain: 'AWD',
          fuel_economy: '28/34 mpg',
          color: 'White Pearl',
          interior: 'Black Leather',
          vin: '2HKRW2H85NH123456',
          mileage: 0
        },
        description: 'New Honda CR-V EX with premium safety package and all-wheel drive capability',
        notes: 'Top safety pick, excellent resale value',
        custom_fields: {
          features: ['AWD', 'Honda Sensing', 'Sunroof', 'Heated Seats', 'Remote Start'],
          warranty: '3yr/36k basic, 5yr/60k powertrain',
          incentives: 'College grad rebate, military discount available'
        }
      },
      {
        organization_id: orgId,
        name: '2024 Ford F-150 XLT SuperCrew',
        sku: 'FOR-F15-2024-001',
        category: 'truck',
        brand: 'Ford',
        model: 'F-150',
        year: 2024,
        condition: 'new',
        status: 'available',
        price_cost: 38000,
        price_msrp: 48000,
        price_selling: 44000,
        price_currency: 'USD',
        stock_on_hand: 1,
        stock_reserved: 0,
        stock_available: 1,
        stock_reorder_level: 1,
        stock_reorder_qty: 1,
        loc_lot: 'Main Lot',
        loc_section: 'C',
        loc_row: '1',
        loc_spot: '1',
        specifications: {
          engine: '3.5L EcoBoost V6',
          transmission: '10-Speed Automatic',
          drivetrain: '4WD',
          towing_capacity: '12700 lbs',
          color: 'Magnetic Gray',
          interior: 'ActiveX Black',
          vin: '1FTFW1E50NFA12345',
          mileage: 0
        },
        description: 'Ford F-150 SuperCrew with 4WD capability and max towing package',
        notes: 'Americas best-selling truck, great for work and family',
        custom_fields: {
          features: ['4WD', 'Towing Package', 'Bed Liner', 'Running Boards', 'FordPass Connect'],
          warranty: '3yr/36k basic, 5yr/60k powertrain',
          incentives: 'Business incentives available, trade-in bonus'
        }
      },
      {
        organization_id: orgId,
        name: '2023 Chevrolet Malibu LT',
        sku: 'CHE-MAL-2023-001',
        category: 'sedan',
        brand: 'Chevrolet',
        model: 'Malibu',
        year: 2023,
        condition: 'used',
        status: 'available',
        price_cost: 22000,
        price_msrp: 30000,
        price_selling: 26000,
        price_currency: 'USD',
        stock_on_hand: 1,
        stock_reserved: 0,
        stock_available: 1,
        stock_reorder_level: 1,
        stock_reorder_qty: 1,
        loc_lot: 'Used Car Lot',
        loc_section: 'A',
        loc_row: '3',
        loc_spot: '7',
        specifications: {
          engine: '1.5L Turbo',
          transmission: 'CVT',
          drivetrain: 'FWD',
          fuel_economy: '29/36 mpg',
          color: 'Blue',
          interior: 'Jet Black Cloth',
          vin: '1G1ZB5ST0NF123456',
          mileage: 15000
        },
        description: 'Well-maintained 2023 Chevrolet Malibu with low mileage and clean history',
        notes: 'One owner, all maintenance records available',
        custom_fields: {
          features: ['Remote Start', 'Wireless Charging', 'Lane Assist', 'Backup Camera'],
          warranty: 'Remaining factory warranty',
          certification: 'Certified Pre-Owned eligible'
        }
      }
    ];

    const { data: createdInventory, error: inventoryError } = await supabase
      .from('inventory')
      .insert(sampleInventory)
      .select();

    if (inventoryError) {
      console.error('❌ Error creating inventory:', inventoryError.message);
      console.error('Details:', inventoryError);
    } else {
      console.log(`✅ Created ${createdInventory?.length || 0} sample inventory items`);
    }

    console.log('\\n🎉 Sample data creation completed!');
    console.log('\\n📊 Summary:');
    console.log(`   Contacts: ${createdContacts?.length || 0}`);
    console.log(`   Leads: ${createdLeads?.length || 0}`);
    console.log(`   Inventory: ${createdInventory?.length || 0}`);
    console.log('\\n✨ Your deals page should now show leads and AI suggestions should work!');
    
  } catch (error) {
    console.error('❌ Error in sample data creation:', error);
  }
}

// Run the script
createProperSampleData();