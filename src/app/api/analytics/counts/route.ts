import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

interface AnalyticsCounts {
  leads: number;
  deals: number;
  dashboard: number;
  inventory: number;
  calendar: number;
  automation: number;
  collaboration: number;
  performance: number;
  finance: number;
}

async function getCountsFromDatabase(tenantId?: string): Promise<AnalyticsCounts> {
  if (!supabase) {
    console.log('📊 Supabase not configured, using mock data for development');
    return getMockCounts();
  }

  try {
    // Test connection with a simple query first
    const { error: connectionError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);

    if (connectionError) {
      console.log('📊 Supabase connection failed, falling back to mock data:', connectionError.message);
      return getMockCounts();
    }

    // TODO: Replace with actual database queries when schema is ready
    // For now, return mock data while database schema is being set up
    
    // Example of how the queries would look:
    // const { data: leads } = await supabase
    //   .from('leads')
    //   .select('id', { count: 'exact' })
    //   .eq('tenant_id', tenantId);
    
    console.log('📊 Supabase connected successfully, returning mock data for development');
    return getMockCounts();
  } catch (error) {
    console.error('📊 Error fetching analytics counts:', error);
    return getMockCounts();
  }
}

function getMockCounts(): AnalyticsCounts {
  return {
    leads: Math.floor(Math.random() * 100) + 20,
    deals: Math.floor(Math.random() * 50) + 10,
    dashboard: Math.floor(Math.random() * 200) + 100,
    inventory: Math.floor(Math.random() * 150) + 50,
    calendar: Math.floor(Math.random() * 40) + 15,
    automation: Math.floor(Math.random() * 20) + 5,
    collaboration: Math.floor(Math.random() * 60) + 20,
    performance: Math.floor(Math.random() * 120) + 60,
    finance: Math.floor(Math.random() * 100) + 40,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId } = body;

    console.log(`🔢 [ANALYTICS_COUNTS] Fetching counts for tenant: ${tenantId || 'default'}`);

    const counts = await getCountsFromDatabase(tenantId);

    return NextResponse.json({
      success: true,
      counts,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in analytics counts API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics counts',
      counts: getMockCounts()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Support GET requests as well
  const url = new URL(request.url);
  const tenantId = url.searchParams.get('tenantId');

  try {
    console.log(`🔢 [ANALYTICS_COUNTS] GET request for tenant: ${tenantId || 'default'}`);

    const counts = await getCountsFromDatabase(tenantId || undefined);

    return NextResponse.json({
      success: true,
      counts,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in analytics counts GET API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics counts',
      counts: getMockCounts()
    }, { status: 500 });
  }
}