import { NextResponse } from 'next/server';

/**
 * 🧪 Simple Database Connection Test
 * Basic connectivity test without complex operations
 */
export async function GET() {
  try {
    // Test basic response first
    const testResult = {
      timestamp: new Date().toISOString(),
      status: 'RUNNING',
      message: 'Database test endpoint is working',
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing',
      }
    };

    // Only test Supabase if environment is configured
    if (testResult.environment.supabaseUrl === 'configured' && 
        testResult.environment.serviceKey === 'configured') {
      
      try {
        const { createClient } = require('@supabase/supabase-js');
        
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        );

        // Simple test query
        const { data, error } = await supabase
          .from('organizations')
          .select('count');

        if (error) {
          testResult.status = 'DATABASE_ERROR';
          testResult.message = `Database connection failed: ${error.message}`;
        } else {
          testResult.status = 'SUCCESS';
          testResult.message = 'Database connection successful!';
          (testResult as any).databaseTest = {
            connected: true,
            tablesAccessible: true,
            organizationsTable: 'accessible'
          };
        }

      } catch (dbError: any) {
        testResult.status = 'CONNECTION_ERROR';
        testResult.message = `Connection error: ${dbError.message}`;
      }
    } else {
      testResult.status = 'CONFIG_ERROR';
      testResult.message = 'Supabase environment variables not properly configured';
    }

    return NextResponse.json(testResult);
    
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Test endpoint failed',
        message: error.message,
        timestamp: new Date().toISOString(),
        status: 'ERROR'
      },
      { status: 500 }
    );
  }
}