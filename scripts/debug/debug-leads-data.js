const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLeadsData() {
  console.log('🔍 [DATABASE DEBUG] Checking actual leads data...');
  
  const orgId = '122e543d-f112-4e21-8f29-726642316a19';
  
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        id, 
        title, 
        stage, 
        industry, 
        value,
        organization_id,
        contact_id,
        contacts:contact_id (
          first_name,
          last_name,
          email,
          phone,
          company
        )
      `)
      .eq('organization_id', orgId);
      
    if (error) {
      console.error('❌ Error querying leads:', error);
      return;
    }
    
    console.log(`✅ Found ${leads.length} leads in database`);
    
    leads.forEach((lead, i) => {
      console.log(`\n📋 Lead ${i + 1}:`);
      console.log(`  - ID: ${lead.id}`);
      console.log(`  - Title: ${lead.title}`);
      console.log(`  - Stage: ${lead.stage}`);
      console.log(`  - Industry: ${lead.industry}`);
      console.log(`  - Value: ${lead.value}`);
      console.log(`  - Contact: ${lead.contacts?.first_name} ${lead.contacts?.last_name}`);
      console.log(`  - Email: ${lead.contacts?.email}`);
    });
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkLeadsData();