import { NextRequest, NextResponse } from 'next/server';
import { createSafeSupabaseClient } from '@/lib/supabase-safe';


export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    const supabase = createSafeSupabaseClient();
    if (!supabase) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase client not available - check environment variables',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
    
    console.log('Supabase client created successfully');

    // Test basic connectivity by querying a simple endpoint
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);

    if (error) {
      console.log('Query error:', error);
      return NextResponse.json({
        status: 'error',
        message: 'Database query failed',
        error: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    console.log('✅ Supabase connection test successful');
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      config: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not configured',
        connected: true,
        status: 200
      }
    });

  } catch (error) {
    console.error('Supabase test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to test Supabase connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
