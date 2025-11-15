import { supabaseAdmin } from '@/lib/supabaseAdmin'
import fs from 'fs'
import path from 'path'

export async function runMigration() {
  console.log('🔄 Running organizations migration...')
  
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '005_create_organizations.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration SQL loaded, executing...')
    
    // Execute the migration
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      throw error
    }
    
    console.log('✅ Migration completed successfully!')
    
    // Verify tables were created
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['organizations', 'organization_memberships', 'billing_sessions'])
    
    if (tablesError) {
      console.warn('⚠️ Could not verify tables:', tablesError.message)
    } else {
      console.log('📋 Tables created:', tables?.map(t => t.table_name))
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('💥 Migration error:', error)
    return { success: false, error: error.message }
  }
}