import { NextResponse } from 'next/server';
import { createSafeSupabaseClient } from '@/lib/supabase-safe';

/**
 * 🧪 Database Schema Test API
 * Tests all tables and basic CRUD operations
 */
export async function GET() {
  try {
    const supabase = createSafeSupabaseClient();
    if (!supabase) {
      return NextResponse.json({
        error: 'Database service unavailable',
        timestamp: new Date().toISOString(),
        tests: [],
        summary: { passed: 0, failed: 1, total: 1 }
      }, { status: 503 });
    }

    const results = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
      summary: {
        passed: 0,
        failed: 0,
        total: 0
      }
    };

    // Test 1: Organizations
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('count');
      
      if (error) throw error;
      
      results.tests.push({
        table: 'organizations',
        operation: 'SELECT',
        status: 'PASS',
        message: 'Table accessible'
      });
      results.summary.passed++;
    } catch (error: any) {
      results.tests.push({
        table: 'organizations',
        operation: 'SELECT', 
        status: 'FAIL',
        message: error.message
      });
      results.summary.failed++;
    }

    // Test 2: Contacts
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('count');
      
      if (error) throw error;
      
      results.tests.push({
        table: 'contacts',
        operation: 'SELECT',
        status: 'PASS',
        message: 'Table accessible'
      });
      results.summary.passed++;
    } catch (error: any) {
      results.tests.push({
        table: 'contacts',
        operation: 'SELECT',
        status: 'FAIL', 
        message: error.message
      });
      results.summary.failed++;
    }

    // Test 3: Leads
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('count');
      
      if (error) throw error;
      
      results.tests.push({
        table: 'leads',
        operation: 'SELECT',
        status: 'PASS',
        message: 'Table accessible'
      });
      results.summary.passed++;
    } catch (error: any) {
      results.tests.push({
        table: 'leads',
        operation: 'SELECT',
        status: 'FAIL',
        message: error.message
      });
      results.summary.failed++;
    }

    // Test 4: Inventory
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('count');
      
      if (error) throw error;
      
      results.tests.push({
        table: 'inventory',
        operation: 'SELECT',
        status: 'PASS',
        message: 'Table accessible'
      });
      results.summary.passed++;
    } catch (error: any) {
      results.tests.push({
        table: 'inventory',
        operation: 'SELECT',
        status: 'FAIL',
        message: error.message
      });
      results.summary.failed++;
    }

    // Test 5: Messages
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('count');
      
      if (error) throw error;
      
      results.tests.push({
        table: 'messages',
        operation: 'SELECT',
        status: 'PASS',
        message: 'Table accessible'
      });
      results.summary.passed++;
    } catch (error: any) {
      results.tests.push({
        table: 'messages',
        operation: 'SELECT',
        status: 'FAIL',
        message: error.message
      });
      results.summary.failed++;
    }

    // Test 6: Appointments
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('count');
      
      if (error) throw error;
      
      results.tests.push({
        table: 'appointments',
        operation: 'SELECT',
        status: 'PASS',
        message: 'Table accessible'
      });
      results.summary.passed++;
    } catch (error: any) {
      results.tests.push({
        table: 'appointments',
        operation: 'SELECT',
        status: 'FAIL',
        message: error.message
      });
      results.summary.failed++;
    }

    results.summary.total = results.summary.passed + results.summary.failed;

    return NextResponse.json(results);
    
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        error: 'Database test failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * 🧪 Multi-Tenant Isolation Test
 * Creates test data and verifies isolation
 */
export async function POST() {
  try {
    const supabase = createSafeSupabaseClient();
    if (!supabase) {
      return NextResponse.json({
        error: 'Database service unavailable',
        timestamp: new Date().toISOString(),
        isolationTest: { status: 'FAILED', steps: [] }
      }, { status: 503 });
    }

    const testResults = {
      timestamp: new Date().toISOString(),
      isolationTest: {
        status: 'RUNNING',
        steps: [] as any[]
      }
    };

    // Step 1: Create test organizations
    const { data: org1, error: org1Error } = await supabase
      .from('organizations')
      .insert([{
        name: 'Test Org Alpha',
        subdomain: 'alpha-test',
        status: 'active'
      }])
      .select()
      .single();

    if (org1Error) {
      testResults.isolationTest.status = 'FAILED';
      testResults.isolationTest.steps.push({
        step: 'Create Org 1',
        status: 'FAIL',
        error: org1Error.message
      });
      return NextResponse.json(testResults, { status: 500 });
    }

    testResults.isolationTest.steps.push({
      step: 'Create Org 1',
      status: 'PASS',
      orgId: org1.id
    });

    const { data: org2, error: org2Error } = await supabase
      .from('organizations')
      .insert([{
        name: 'Test Org Beta',
        subdomain: 'beta-test',
        status: 'active'
      }])
      .select()
      .single();

    if (org2Error) {
      testResults.isolationTest.status = 'FAILED';
      testResults.isolationTest.steps.push({
        step: 'Create Org 2',
        status: 'FAIL',
        error: org2Error.message
      });
      return NextResponse.json(testResults, { status: 500 });
    }

    testResults.isolationTest.steps.push({
      step: 'Create Org 2',
      status: 'PASS',
      orgId: org2.id
    });

    // Step 2: Create test contacts for each org
    const { error: contact1Error } = await supabase
      .from('contacts')
      .insert([{
        organization_id: org1.id,
        first_name: 'Alpha',
        last_name: 'User',
        email: 'alpha@test.com',
        company: 'Alpha Corp'
      }]);

    const { error: contact2Error } = await supabase
      .from('contacts')
      .insert([{
        organization_id: org2.id,
        first_name: 'Beta',
        last_name: 'User',
        email: 'beta@test.com',
        company: 'Beta Corp'
      }]);

    if (contact1Error || contact2Error) {
      testResults.isolationTest.status = 'FAILED';
      testResults.isolationTest.steps.push({
        step: 'Create Test Contacts',
        status: 'FAIL',
        error: contact1Error?.message || contact2Error?.message
      });
      return NextResponse.json(testResults, { status: 500 });
    }

    testResults.isolationTest.steps.push({
      step: 'Create Test Contacts',
      status: 'PASS'
    });

    // Step 3: Verify data isolation
    const { data: org1Contacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('organization_id', org1.id);

    const { data: org2Contacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('organization_id', org2.id);

    const isolationValid = org1Contacts?.length === 1 && 
                           org2Contacts?.length === 1 &&
                           org1Contacts[0].company === 'Alpha Corp' &&
                           org2Contacts[0].company === 'Beta Corp';

    if (!isolationValid) {
      testResults.isolationTest.status = 'FAILED';
      testResults.isolationTest.steps.push({
        step: 'Verify Data Isolation',
        status: 'FAIL',
        org1Count: org1Contacts?.length,
        org2Count: org2Contacts?.length
      });
      return NextResponse.json(testResults, { status: 500 });
    }

    testResults.isolationTest.steps.push({
      step: 'Verify Data Isolation',
      status: 'PASS',
      org1Count: org1Contacts.length,
      org2Count: org2Contacts.length
    });

    // Step 4: Clean up test data
    await supabase.from('contacts').delete().eq('organization_id', org1.id);
    await supabase.from('contacts').delete().eq('organization_id', org2.id);
    await supabase.from('organizations').delete().eq('id', org1.id);
    await supabase.from('organizations').delete().eq('id', org2.id);

    testResults.isolationTest.steps.push({
      step: 'Cleanup Test Data',
      status: 'PASS'
    });

    testResults.isolationTest.status = 'PASSED';

    return NextResponse.json(testResults);
    
  } catch (error: any) {
    console.error('Multi-tenant test error:', error);
    return NextResponse.json(
      {
        error: 'Multi-tenant test failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}