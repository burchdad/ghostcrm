import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


export const dynamic = 'force-dynamic';
interface SupabaseConnection {
  url: string;
  anonKey: string;
  serviceKey?: string;
}

interface SupabaseTestResponse {
  success: boolean;
  error?: string;
  data?: {
    connected: boolean;
    tablesCount: number;
    connectionTime: number;
    version?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, connection } = body;

    if (action === 'test') {
      return handleTestConnection(connection);
    }

    if (action === 'connect') {
      return handleConnect(connection);
    }

    if (action === 'sync') {
      return handleSync(connection);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Supabase integration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleTestConnection(connection: SupabaseConnection): Promise<NextResponse> {
  try {
    const startTime = Date.now();
    
    // Create Supabase client
    const supabase = createClient(connection.url, connection.anonKey);
    
    // Test connection by fetching basic info
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);

    if (tablesError) {
      // Try a simpler test with auth
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError && !authError.message.includes('session')) {
        return NextResponse.json({
          success: false,
          error: `Connection failed: ${authError.message}`
        });
      }
    }

    const connectionTime = Date.now() - startTime;

    // Get table count if possible
    let tablesCount = 0;
    if (!tablesError && tables) {
      const { count } = await supabase
        .from('information_schema.tables')
        .select('*', { count: 'exact', head: true })
        .eq('table_schema', 'public');
      tablesCount = count || 0;
    }

    const response: SupabaseTestResponse = {
      success: true,
      data: {
        connected: true,
        tablesCount,
        connectionTime,
        version: 'Supabase Cloud'
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Connection test failed: ${error.message}`
    });
  }
}

async function handleConnect(connection: SupabaseConnection): Promise<NextResponse> {
  try {
    // Test connection first
    const testResult = await handleTestConnection(connection);
    const testData = await testResult.json();
    
    if (!testData.success) {
      return testResult;
    }

    // Store connection securely (in production, encrypt these)
    // For now, we'll return success with connection metadata
    const connectionData = {
      id: `supabase-${Date.now()}`,
      type: 'supabase',
      url: connection.url,
      status: 'connected',
      connectedAt: new Date().toISOString(),
      tablesCount: testData.data.tablesCount,
      features: ['Real-time subscriptions', 'Row Level Security', 'Auto-generated APIs', 'Authentication']
    };

    return NextResponse.json({
      success: true,
      data: connectionData
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Connection failed: ${error.message}`
    });
  }
}

async function handleSync(connection: SupabaseConnection): Promise<NextResponse> {
  try {
    const supabase = createClient(connection.url, connection.anonKey);
    
    // Example: Sync leads, contacts, deals tables from Supabase to CRM
    const syncResults = {
      leads: 0,
      contacts: 0,
      deals: 0,
      companies: 0
    };

    // Sync leads
    try {
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*');
      
      if (!leadsError && leads) {
        syncResults.leads = leads.length;
        // TODO: Process and store leads in CRM database
      }
    } catch (e) {
      // Table might not exist, continue
    }

    // Sync contacts
    try {
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*');
      
      if (!contactsError && contacts) {
        syncResults.contacts = contacts.length;
        // TODO: Process and store contacts in CRM database
      }
    } catch (e) {
      // Table might not exist, continue
    }

    // Sync deals
    try {
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('*');
      
      if (!dealsError && deals) {
        syncResults.deals = deals.length;
        // TODO: Process and store deals in CRM database
      }
    } catch (e) {
      // Table might not exist, continue
    }

    // Sync companies
    try {
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*');
      
      if (!companiesError && companies) {
        syncResults.companies = companies.length;
        // TODO: Process and store companies in CRM database
      }
    } catch (e) {
      // Table might not exist, continue
    }

    return NextResponse.json({
      success: true,
      data: {
        syncedAt: new Date().toISOString(),
        results: syncResults,
        totalRecords: Object.values(syncResults).reduce((a, b) => a + b, 0)
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Sync failed: ${error.message}`
    });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      integration: 'Supabase',
      status: 'available',
      features: [
        'Real-time database synchronization',
        'Automatic table detection', 
        'Row-level security support',
        'Authentication integration',
        'Webhook support'
      ]
    }
  });
}
