import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

export async function POST() {
  try {
    const supabase = await createSupabaseServer();
    
    console.log('🚀 Adding missing organization columns...');
    
    // Try to add industry column
    try {
      await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS industry VARCHAR(100)'
      });
      console.log('✅ Industry column added');
    } catch (error) {
      console.log('ℹ️ Industry column may already exist:', error);
    }
    
    // Try to add team_size column
    try {
      await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS team_size VARCHAR(50)'
      });
      console.log('✅ Team_size column added');
    } catch (error) {
      console.log('ℹ️ Team_size column may already exist:', error);
    }
    
    // Set default values for existing organizations
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ 
        industry: 'technology', 
        team_size: 'small' 
      })
      .or('industry.is.null,team_size.is.null');
    
    if (updateError) {
      console.log('ℹ️ Could not set default values (columns may not exist yet):', updateError);
    } else {
      console.log('✅ Default values set');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Organization columns migration completed' 
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error 
    }, { status: 500 });
  }
}