// Check if collaboration tables exist
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkCollaborationTables() {
  console.log('🔍 Checking collaboration tables...');
  
  const tables = [
    'collaboration_channels',
    'collaboration_messages', 
    'collaboration_files',
    'collaboration_meetings',
    'collaboration_calls',
    'collaboration_user_presence'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
        
      if (error) {
        console.log(`❌ Table '${table}' does not exist:`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}' error:`, err.message);
    }
  }
  
  // Also check if users table has collaboration fields
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, status, last_seen, avatar_url')
      .limit(1);
      
    if (error) {
      console.log('❌ Users table check failed:', error.message);
    } else {
      console.log('✅ Users table accessible');
      if (data && data.length > 0) {
        const user = data[0];
        console.log('Available user fields:', Object.keys(user));
      }
    }
  } catch (err) {
    console.log('❌ Users table error:', err.message);
  }
}

checkCollaborationTables().catch(console.error);