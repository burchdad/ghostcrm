#!/usr/bin/env node

/**
 * 🎯 Sample Data Generator for GhostCRM
 * Creates realistic test data for multiple organizations
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Sample data sets
const ORGANIZATIONS = [
  {
    name: 'Acme Motors',
    subdomain: 'acme',
    status: 'active',
    subscription_tier: 'professional',
    settings: {
      industry: 'automotive',
      features: ['inventory', 'crm', 'campaigns'],
      timezone: 'America/New_York'
    }
  },
  {
    name: 'TechFlow Solutions',
    subdomain: 'techflow',
    status: 'active',
    subscription_tier: 'enterprise',
    settings: {
      industry: 'technology',
      features: ['crm', 'campaigns', 'collaboration'],
      timezone: 'America/Los_Angeles'
    }
  },
  {
    name: 'Green Valley Real Estate',
    subdomain: 'greenvalley',
    status: 'active',
    subscription_tier: 'professional',
    settings: {
      industry: 'real_estate',
      features: ['crm', 'appointments', 'campaigns'],
      timezone: 'America/Chicago'
    }
  }
];

const SAMPLE_CONTACTS = [
  // Acme Motors contacts
  {
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@gmail.com',
    phone: '555-0101',
    company: 'Smith & Associates',
    title: 'CEO',
    source: 'website',
    status: 'active',
    tags: ['vip', 'automotive'],
    custom_fields: {
      budget: 50000,
      interest: 'luxury_vehicles',
      last_purchase: '2023-06-15'
    }
  },
  {
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.j@businesscorp.com',
    phone: '555-0102',
    company: 'Business Corp',
    title: 'Fleet Manager',
    source: 'referral',
    status: 'active',
    tags: ['fleet', 'b2b'],
    custom_fields: {
      fleet_size: 25,
      budget: 200000,
      renewal_date: '2024-12-31'
    }
  },
  // TechFlow contacts
  {
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'mchen@startup.io',
    phone: '555-0201',
    company: 'InnovateTech',
    title: 'CTO',
    source: 'linkedin',
    status: 'active',
    tags: ['enterprise', 'tech'],
    custom_fields: {
      company_size: 150,
      tech_stack: ['React', 'Node.js', 'PostgreSQL'],
      contract_value: 75000
    }
  },
  {
    first_name: 'Emily',
    last_name: 'Rodriguez',
    email: 'emily.r@digitalagency.com',
    phone: '555-0202',
    company: 'Digital Agency Pro',
    title: 'Project Manager',
    source: 'conference',
    status: 'active',
    tags: ['agency', 'marketing'],
    custom_fields: {
      project_budget: 25000,
      timeline: '3_months',
      services_needed: ['web_dev', 'seo', 'analytics']
    }
  },
  // Green Valley contacts
  {
    first_name: 'David',
    last_name: 'Wilson',
    email: 'dwilson@email.com',
    phone: '555-0301',
    company: 'Wilson Family',
    title: 'Homebuyer',
    source: 'zillow',
    status: 'active',
    tags: ['first_time_buyer', 'family'],
    custom_fields: {
      budget_max: 450000,
      bedrooms_min: 3,
      preferred_areas: ['Downtown', 'Suburban'],
      timeline: 'immediate'
    }
  },
  {
    first_name: 'Lisa',
    last_name: 'Thompson',
    email: 'lisa.thompson@investor.com',
    phone: '555-0302',
    company: 'Thompson Investments',
    title: 'Real Estate Investor',
    source: 'referral',
    status: 'active',
    tags: ['investor', 'cash_buyer'],
    custom_fields: {
      investment_type: 'rental_properties',
      portfolio_size: 12,
      target_roi: 8.5,
      cash_available: 850000
    }
  }
];

const SAMPLE_INVENTORY = [
  // Acme Motors inventory
  {
    name: '2024 Tesla Model S',
    sku: 'TESLA-MS-2024-001',
    category: 'Electric Vehicles',
    brand: 'Tesla',
    model: 'Model S',
    year: 2024,
    condition: 'new',
    status: 'available',
    price_cost: 85000,
    price_msrp: 104990,
    price_selling: 99990,
    stock_on_hand: 3,
    stock_available: 3,
    loc_lot: 'A',
    loc_section: '1',
    loc_row: '2',
    loc_spot: '5',
    specifications: {
      range: '405 miles',
      acceleration: '3.1s 0-60mph',
      top_speed: '200mph',
      color: 'Pearl White',
      interior: 'Black Premium'
    },
    images: [
      'https://example.com/tesla-model-s-1.jpg',
      'https://example.com/tesla-model-s-2.jpg'
    ],
    custom_fields: {
      warranty_years: 4,
      delivery_time: '2-4 weeks',
      autopilot: true
    }
  },
  {
    name: '2023 BMW X5 xDrive40i',
    sku: 'BMW-X5-2023-002',
    category: 'SUVs',
    brand: 'BMW',
    model: 'X5',
    year: 2023,
    condition: 'used',
    status: 'available',
    price_cost: 42000,
    price_msrp: 65000,
    price_selling: 58900,
    stock_on_hand: 1,
    stock_available: 1,
    loc_lot: 'B',
    loc_section: '2',
    loc_row: '1',
    loc_spot: '3',
    specifications: {
      mileage: '15,242 miles',
      engine: '3.0L TwinPower Turbo',
      transmission: '8-Speed Automatic',
      color: 'Alpine White',
      interior: 'Black SensaTec'
    },
    custom_fields: {
      previous_owners: 1,
      service_history: 'complete',
      certified_preowned: true
    }
  }
];

async function createSampleData() {
  console.log('🎯 Creating Sample Data for GhostCRM\n');

  try {
    // Step 1: Create Organizations
    console.log('1️⃣ Creating sample organizations...');
    const createdOrgs = [];
    
    for (const orgData of ORGANIZATIONS) {
      const { data: org, error } = await supabase
        .from('organizations')
        .insert([orgData])
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Failed to create ${orgData.name}:`, error.message);
        continue;
      }
      
      createdOrgs.push(org);
      console.log(`✅ Created: ${org.name} (${org.subdomain})`);
    }

    if (createdOrgs.length === 0) {
      console.error('❌ No organizations created. Exiting.');
      return;
    }

    // Step 2: Create Contacts
    console.log('\n2️⃣ Creating sample contacts...');
    const contactsPerOrg = Math.ceil(SAMPLE_CONTACTS.length / createdOrgs.length);
    
    for (let i = 0; i < createdOrgs.length; i++) {
      const org = createdOrgs[i];
      const startIdx = i * contactsPerOrg;
      const endIdx = Math.min(startIdx + contactsPerOrg, SAMPLE_CONTACTS.length);
      const orgContacts = SAMPLE_CONTACTS.slice(startIdx, endIdx);
      
      for (const contactData of orgContacts) {
        const { error } = await supabase
          .from('contacts')
          .insert([{
            ...contactData,
            organization_id: org.id
          }]);
        
        if (error) {
          console.error(`❌ Failed to create contact ${contactData.first_name} ${contactData.last_name}:`, error.message);
          continue;
        }
        
        console.log(`✅ Created contact: ${contactData.first_name} ${contactData.last_name} (${org.name})`);
      }
    }

    // Step 3: Create Leads from Contacts
    console.log('\n3️⃣ Creating sample leads...');
    
    for (const org of createdOrgs) {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', org.id)
        .limit(2);
      
      if (!contacts || contacts.length === 0) continue;
      
      for (const contact of contacts) {
        const leadValue = Math.floor(Math.random() * 100000) + 10000;
        const stages = ['new', 'qualified', 'proposal', 'negotiation'];
        const randomStage = stages[Math.floor(Math.random() * stages.length)];
        
        const { error } = await supabase
          .from('leads')
          .insert([{
            organization_id: org.id,
            contact_id: contact.id,
            title: `${contact.company} - ${org.settings.industry} opportunity`,
            description: `Potential ${org.settings.industry} deal with ${contact.company}`,
            value: leadValue,
            stage: randomStage,
            priority: 'medium',
            source: contact.source,
            assigned_to: 'sales@' + org.subdomain + '.com',
            probability: Math.floor(Math.random() * 80) + 20,
            custom_fields: {
              industry: org.settings.industry,
              contact_preference: 'email',
              decision_timeline: '30-60 days'
            }
          }]);
        
        if (error) {
          console.error(`❌ Failed to create lead for ${contact.first_name}:`, error.message);
          continue;
        }
        
        console.log(`✅ Created lead: ${contact.company} opportunity (${org.name})`);
      }
    }

    // Step 4: Create Inventory (for Acme Motors only)
    console.log('\n4️⃣ Creating sample inventory...');
    const acmeOrg = createdOrgs.find(org => org.subdomain === 'acme');
    
    if (acmeOrg) {
      for (const inventoryData of SAMPLE_INVENTORY) {
        const { error } = await supabase
          .from('inventory')
          .insert([{
            ...inventoryData,
            organization_id: acmeOrg.id
          }]);
        
        if (error) {
          console.error(`❌ Failed to create inventory ${inventoryData.name}:`, error.message);
          continue;
        }
        
        console.log(`✅ Created inventory: ${inventoryData.name}`);
      }
    }

    // Step 5: Create Appointments
    console.log('\n5️⃣ Creating sample appointments...');
    
    for (const org of createdOrgs) {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', org.id)
        .limit(1);
      
      if (!contacts || contacts.length === 0) continue;
      
      const contact = contacts[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0); // 2 PM tomorrow
      
      const endTime = new Date(tomorrow);
      endTime.setHours(15, 0, 0, 0); // 3 PM tomorrow
      
      const { error } = await supabase
        .from('appointments')
        .insert([{
          organization_id: org.id,
          contact_id: contact.id,
          title: `Meeting with ${contact.first_name} ${contact.last_name}`,
          description: `Consultation meeting regarding ${org.settings.industry} services`,
          start_time: tomorrow.toISOString(),
          end_time: endTime.toISOString(),
          location: `${org.name} Office`,
          type: 'consultation',
          status: 'scheduled',
          attendees: [
            { name: contact.first_name + ' ' + contact.last_name, email: contact.email },
            { name: 'Sales Rep', email: 'sales@' + org.subdomain + '.com' }
          ],
          created_by: 'admin@' + org.subdomain + '.com'
        }]);
      
      if (error) {
        console.error(`❌ Failed to create appointment:`, error.message);
        continue;
      }
      
      console.log(`✅ Created appointment: Meeting with ${contact.first_name} (${org.name})`);
    }

    console.log('\n🎉 Sample data creation completed!');
    console.log('\n📊 Summary:');
    console.log(`   Organizations: ${createdOrgs.length}`);
    console.log(`   Contacts: ${SAMPLE_CONTACTS.length}`);
    console.log(`   Leads: ~${createdOrgs.length * 2}`);
    console.log(`   Inventory: ${SAMPLE_INVENTORY.length} (Acme Motors only)`);
    console.log(`   Appointments: ${createdOrgs.length}`);

  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
  }
}

async function cleanupSampleData() {
  console.log('🧹 Cleaning up sample data...\n');
  
  try {
    // Get all test organizations
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id, name')
      .in('subdomain', ['acme', 'techflow', 'greenvalley']);
    
    if (!orgs || orgs.length === 0) {
      console.log('No sample organizations found to clean up.');
      return;
    }
    
    console.log(`Found ${orgs.length} sample organizations to clean up...`);
    
    for (const org of orgs) {
      // Delete all related data (CASCADE should handle this, but being explicit)
      await supabase.from('appointments').delete().eq('organization_id', org.id);
      await supabase.from('inventory').delete().eq('organization_id', org.id);
      await supabase.from('leads').delete().eq('organization_id', org.id);
      await supabase.from('contacts').delete().eq('organization_id', org.id);
      await supabase.from('organizations').delete().eq('id', org.id);
      
      console.log(`✅ Cleaned up: ${org.name}`);
    }
    
    console.log('\n🎉 Sample data cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error cleaning up sample data:', error.message);
  }
}

// Command line interface
const command = process.argv[2];

if (command === 'create') {
  createSampleData();
} else if (command === 'cleanup') {
  cleanupSampleData();
} else {
  console.log('🎯 GhostCRM Sample Data Generator\n');
  console.log('Usage:');
  console.log('  node generate-sample-data.js create   - Create sample data');
  console.log('  node generate-sample-data.js cleanup  - Remove sample data\n');
}

process.on('SIGINT', () => {
  console.log('\n👋 Operation interrupted');
  process.exit(0);
});