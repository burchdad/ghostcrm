// Run organization columns migration
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running organization columns migration...');
  
  try {
    // Add industry column
    console.log('📝 Adding industry column...');
    const { error: industryError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS industry VARCHAR(100)'
    });
    
    if (industryError) {
      console.error('❌ Error adding industry column:', industryError);
    } else {
      console.log('✅ Industry column added successfully');
    }
    
    // Add team_size column
    console.log('📝 Adding team_size column...');
    const { error: teamSizeError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS team_size VARCHAR(50)'
    });
    
    if (teamSizeError) {
      console.error('❌ Error adding team_size column:', teamSizeError);
    } else {
      console.log('✅ Team_size column added successfully');
    }
    
    // Add indexes
    console.log('📝 Adding indexes...');
    const { error: indexError1 } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_organizations_industry ON public.organizations(industry)'
    });
    
    const { error: indexError2 } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_organizations_team_size ON public.organizations(team_size)'
    });
    
    if (indexError1 || indexError2) {
      console.error('❌ Error adding indexes:', indexError1 || indexError2);
    } else {
      console.log('✅ Indexes added successfully');
    }
    
    // Update existing organizations with default values
    console.log('📝 Setting default values for existing organizations...');
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ 
        industry: 'technology', 
        team_size: 'small' 
      })
      .or('industry.is.null,team_size.is.null');
    
    if (updateError) {
      console.error('❌ Error updating existing organizations:', updateError);
    } else {
      console.log('✅ Default values set for existing organizations');
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();