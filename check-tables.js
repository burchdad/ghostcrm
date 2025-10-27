// Create missing deals table directly using Supabase client
// This fixes the "Could not find table 'public.deals'" error

const { createClient } = require('@supabase/supabase-js');

async function createMissingTables() {
  console.log('🚀 Creating missing database tables...');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.log('Expected:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  console.log('🔗 Connecting to Supabase...');
  console.log(`URL: ${supabaseUrl}`);
  
  // Create Supabase client with service role
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  console.log('✅ Connected to Supabase');
  
  // Test connection by checking organizations table
  console.log('🧪 Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('count');
    
    if (error) {
      console.error('❌ Database connection test failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Database connection verified');
    
  } catch (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  }
  
  // Check which tables exist
  console.log('📋 Checking existing tables...');
  
  const tablesToCheck = ['deals', 'team_members', 'notifications', 'calendar_events', 'activities'];
  const missingTables = [];
  
  for (const table of tablesToCheck) {
    try {
      const { error } = await supabase.from(table).select('count');
      if (error && error.message.includes('does not exist')) {
        missingTables.push(table);
        console.log(`❌ Table '${table}' is missing`);
      } else if (error) {
        console.log(`⚠️  Table '${table}' exists but has access issues:`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`);
      }
    } catch (err) {
      missingTables.push(table);
      console.log(`❌ Table '${table}' check failed:`, err.message);
    }
  }
  
  if (missingTables.length === 0) {
    console.log('🎉 All required tables exist!');
    return;
  }
  
  console.log(`\n🔧 Found ${missingTables.length} missing tables: ${missingTables.join(', ')}`);
  console.log('\n❗ IMPORTANT: The database schema is missing required tables.');
  console.log('This needs to be fixed in your Supabase dashboard.');
  console.log('\n📝 Please run the following SQL in your Supabase SQL Editor:');
  console.log('=' * 60);
  
  // Output the SQL that needs to be run manually
  const createDealsTableSQL = `
-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  stage VARCHAR(100) DEFAULT 'prospect',
  amount DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  probability INTEGER DEFAULT 0,
  customer_name VARCHAR(255),
  vehicle VARCHAR(255),
  sales_rep VARCHAR(255),
  assigned_to VARCHAR(255),
  expected_close DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(100),
  hire_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  user_id TEXT,
  type VARCHAR(50) DEFAULT 'info',
  title VARCHAR(255),
  message TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  user_id TEXT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  type VARCHAR(50) DEFAULT 'event',
  customer_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  user_id TEXT,
  type VARCHAR(50),
  description TEXT,
  customer_name VARCHAR(255),
  user_name VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Enable Row Level Security and create service role policies
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Service role policies (allow demo data insertion)
CREATE POLICY "Service role can manage deals" ON deals FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage team_members" ON team_members FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage notifications" ON notifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage calendar_events" ON calendar_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage activities" ON activities FOR ALL USING (auth.role() = 'service_role');
`;
  
  console.log(createDealsTableSQL);
  console.log('=' * 60);
  console.log('\n📚 Instructions:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the SQL above');
  console.log('4. Click "Run" to create the missing tables');
  console.log('5. Try the demo login again');
  
  console.log('\n🔄 After running the SQL, restart this script to verify the tables were created.');
}

// Run the check
createMissingTables().catch(console.error);