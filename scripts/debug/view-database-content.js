#!/usr/bin/env node

/**
 * 🔍 Database Content Viewer
 * Shows current data in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function viewDatabaseContent() {
  console.log('🔍 GhostCRM Database Content Viewer\n');
  
  try {
    // Check organizations
    console.log('1️⃣ Organizations:');
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (orgError) {
      console.error('❌ Error fetching organizations:', orgError.message);
    } else if (orgs && orgs.length > 0) {
      orgs.forEach((org, index) => {
        console.log(`   ${index + 1}. ${org.name} (${org.subdomain})`);
        console.log(`      ID: ${org.id}`);
        console.log(`      Status: ${org.status}`);
        console.log(`      Tier: ${org.subscription_tier}`);
        console.log('');
      });
    } else {
      console.log('   No organizations found');
    }

    // Check contacts
    console.log('2️⃣ Contacts:');
    const { data: contacts, error: contactError } = await supabase
      .from('contacts')
      .select('*, organizations(name)')
      .order('created_at', { ascending: true });
    
    if (contactError) {
      console.error('❌ Error fetching contacts:', contactError.message);
    } else if (contacts && contacts.length > 0) {
      contacts.forEach((contact, index) => {
        console.log(`   ${index + 1}. ${contact.first_name} ${contact.last_name} (${contact.email})`);
        console.log(`      Organization: ${contact.organizations?.name || 'N/A'}`);
        console.log(`      Company: ${contact.company}`);
        console.log('');
      });
    } else {
      console.log('   No contacts found');
    }

    // Check leads
    console.log('3️⃣ Leads:');
    const { data: leads, error: leadError } = await supabase
      .from('leads')
      .select('*, organizations(name)')
      .order('created_at', { ascending: true });
    
    if (leadError) {
      console.error('❌ Error fetching leads:', leadError.message);
    } else if (leads && leads.length > 0) {
      leads.forEach((lead, index) => {
        console.log(`   ${index + 1}. ${lead.title} - $${lead.value}`);
        console.log(`      Organization: ${lead.organizations?.name || 'N/A'}`);
        console.log(`      Stage: ${lead.stage} | Priority: ${lead.priority}`);
        console.log('');
      });
    } else {
      console.log('   No leads found');
    }

    // Check inventory
    console.log('4️⃣ Inventory:');
    const { data: inventory, error: invError } = await supabase
      .from('inventory')
      .select('*, organizations(name)')
      .order('created_at', { ascending: true });
    
    if (invError) {
      console.error('❌ Error fetching inventory:', invError.message);
    } else if (inventory && inventory.length > 0) {
      inventory.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} - $${item.price_selling}`);
        console.log(`      Organization: ${item.organizations?.name || 'N/A'}`);
        console.log(`      SKU: ${item.sku} | Status: ${item.status}`);
        console.log('');
      });
    } else {
      console.log('   No inventory found');
    }

    // Summary
    console.log('📊 Summary:');
    console.log(`   Organizations: ${orgs?.length || 0}`);
    console.log(`   Contacts: ${contacts?.length || 0}`);
    console.log(`   Leads: ${leads?.length || 0}`);
    console.log(`   Inventory: ${inventory?.length || 0}`);

  } catch (error) {
    console.error('❌ Error viewing database content:', error.message);
  }
}

viewDatabaseContent().catch(console.error);