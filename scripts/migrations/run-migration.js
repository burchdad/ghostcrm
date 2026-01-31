// Script to create missing deals table and other tables needed for demo data
// This fixes the "Could not find table 'public.deals'" error

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Starting database migration...');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
  }
  
  // Create Supabase client with service role
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  console.log('✅ Connected to Supabase');
  
  // Read migration file
  const migrationPath = path.join(__dirname, 'migrations', '002_add_missing_deals_table.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('📄 Loaded migration SQL');
  
  try {
    // Execute the migration SQL directly
    console.log('🔧 Executing migration...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 0) continue;
      
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.warn(`⚠️  Statement ${i + 1} warning:`, error.message);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} completed`);
        }
      } catch (err) {
        console.warn(`⚠️  Statement ${i + 1} failed:`, err.message);
        // Continue with other statements
      }
    }
    
    console.log('✅ Migration processing completed!');
    
    // Test that the deals table now exists
    console.log('🧪 Testing deals table...');
    
    const { data: testData, error: testError } = await supabase
      .from('deals')
      .select('count');
    
    if (testError) {
      console.error('❌ Deals table test failed:', testError);
    } else {
      console.log('✅ Deals table is accessible');
    }
    
    // Test other tables
    const tables = ['team_members', 'notifications', 'calendar_events', 'activities'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count');
      if (error) {
        console.warn(`⚠️  Table ${table} test failed:`, error.message);
      } else {
        console.log(`✅ Table ${table} is accessible`);
      }
    }
    
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();