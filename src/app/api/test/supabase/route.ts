import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔍 Testing Supabase connection...');
    console.log('URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING');
    console.log('Service Key:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'MISSING');

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase configuration missing',
        config: {
          url: !!supabaseUrl,
          serviceKey: !!supabaseServiceKey
        }
      }, { status: 500 });
    }

    // Test basic HTTP connectivity to Supabase
    const healthUrl = `${supabaseUrl}/rest/v1/`;
    console.log('Testing basic connectivity to:', healthUrl);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
      },
      // Add timeout
      signal: AbortSignal.timeout(10000)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      
      return NextResponse.json({
        success: false,
        error: `Supabase HTTP error: ${response.status}`,
        details: errorText,
        url: supabaseUrl
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      config: {
        url: supabaseUrl,
        connected: true,
        status: response.status
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