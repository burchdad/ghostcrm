/**
 * TEST RESULTS API
 * Handles retrieving and managing test execution results
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock data storage (replace with database in production)
const mockResults = [
  {
    id: '1',
    tenant_id: 'main',
    tenant_name: 'Main Application',
    test_suite: 'Complete Test Suite',
    status: 'completed',
    pass_rate: 94.5,
    total_tests: 487,
    passed_tests: 460,
    failed_tests: 27,
    duration: '18m 32s',
    executed_at: '2024-01-20T14:30:00Z',
    execution_type: 'scheduled'
  },
  {
    id: '2',
    tenant_id: 'acme-corp',
    tenant_name: 'Acme Corporation',
    test_suite: 'UI Components',
    status: 'completed',
    pass_rate: 96.2,
    total_tests: 127,
    passed_tests: 122,
    failed_tests: 5,
    duration: '4m 15s',
    executed_at: '2024-01-20T12:45:00Z',
    execution_type: 'manual'
  },
  {
    id: '3',
    tenant_id: 'tech-startup',
    tenant_name: 'Tech Startup Inc',
    test_suite: 'API Endpoints',
    status: 'failed',
    pass_rate: 67.8,
    total_tests: 89,
    passed_tests: 60,
    failed_tests: 29,
    duration: '6m 42s',
    executed_at: '2024-01-20T11:20:00Z',
    execution_type: 'scheduled'
  },
  {
    id: '4',
    tenant_id: 'main',
    tenant_name: 'Main Application',
    test_suite: 'Authentication',
    status: 'completed',
    pass_rate: 100.0,
    total_tests: 34,
    passed_tests: 34,
    failed_tests: 0,
    duration: '2m 18s',
    executed_at: '2024-01-20T10:15:00Z',
    execution_type: 'manual'
  },
  {
    id: '5',
    tenant_id: 'global-sales',
    tenant_name: 'Global Sales Ltd',
    test_suite: 'Cross-Platform',
    status: 'completed',
    pass_rate: 88.9,
    total_tests: 72,
    passed_tests: 64,
    failed_tests: 8,
    duration: '12m 05s',
    executed_at: '2024-01-19T18:00:00Z',
    execution_type: 'scheduled'
  }
];

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const tenantId = url.searchParams.get('tenant_id');
    const testSuite = url.searchParams.get('test_suite');
    const status = url.searchParams.get('status');

    // TODO: Verify admin auth here
    
    // Filter results
    let filteredResults = [...mockResults];
    
    if (tenantId) {
      filteredResults = filteredResults.filter(r => r.tenant_id === tenantId);
    }
    
    if (testSuite) {
      filteredResults = filteredResults.filter(r => r.test_suite.toLowerCase().includes(testSuite.toLowerCase()));
    }
    
    if (status) {
      filteredResults = filteredResults.filter(r => r.status === status);
    }

    // Sort by execution date (newest first)
    filteredResults.sort((a, b) => new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime());

    // Apply pagination
    const paginatedResults = filteredResults.slice(offset, offset + limit);
    
    // Calculate summary statistics
    const summary = {
      total_executions: filteredResults.length,
      average_pass_rate: filteredResults.length > 0 ? 
        filteredResults.reduce((sum, r) => sum + r.pass_rate, 0) / filteredResults.length : 0,
      successful_executions: filteredResults.filter(r => r.status === 'completed').length,
      failed_executions: filteredResults.filter(r => r.status === 'failed').length,
      recent_trend: calculateRecentTrend(filteredResults)
    };

    return NextResponse.json({
      results: paginatedResults,
      summary,
      pagination: {
        limit,
        offset,
        total: filteredResults.length,
        has_more: offset + limit < filteredResults.length
      }
    });

  } catch (error) {
    console.error('Test results error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test results' },
      { status: 500 }
    );
  }
}

// Get detailed results for a specific execution
export async function POST(req: NextRequest) {
  try {
    const { executionId } = await req.json();
    
    if (!executionId) {
      return NextResponse.json(
        { error: 'Execution ID is required' },
        { status: 400 }
      );
    }

    // TODO: Verify admin auth here
    
    const detailedResult = await getDetailedTestResult(executionId);
    
    if (!detailedResult) {
      return NextResponse.json(
        { error: 'Test execution not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(detailedResult);

  } catch (error) {
    console.error('Detailed results error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch detailed results' },
      { status: 500 }
    );
  }
}

function calculateRecentTrend(results: any[]): string {
  if (results.length < 2) return 'insufficient_data';
  
  // Get last 5 executions
  const recentResults = results.slice(0, 5);
  const averagePassRate = recentResults.reduce((sum, r) => sum + r.pass_rate, 0) / recentResults.length;
  
  // Compare with previous 5 executions
  const previousResults = results.slice(5, 10);
  if (previousResults.length === 0) return 'insufficient_data';
  
  const previousAveragePassRate = previousResults.reduce((sum, r) => sum + r.pass_rate, 0) / previousResults.length;
  
  const difference = averagePassRate - previousAveragePassRate;
  
  if (difference > 2) return 'improving';
  if (difference < -2) return 'declining';
  return 'stable';
}

async function getDetailedTestResult(executionId: string) {
  // TODO: Fetch from database
  
  // Mock detailed result
  return {
    id: executionId,
    tenant_id: 'main',
    tenant_name: 'Main Application',
    test_suite: 'Complete Test Suite',
    status: 'completed',
    started_at: '2024-01-20T14:30:00Z',
    completed_at: '2024-01-20T14:48:32Z',
    duration: '18m 32s',
    execution_type: 'scheduled',
    overall_results: {
      total: 487,
      passed: 460,
      failed: 27,
      pass_rate: 94.5
    },
    test_categories: [
      {
        name: 'UI Components',
        total: 127,
        passed: 122,
        failed: 5,
        pass_rate: 96.1,
        duration: '4m 15s',
        status: 'completed'
      },
      {
        name: 'Page Functionality',
        total: 89,
        passed: 86,
        failed: 3,
        pass_rate: 96.6,
        duration: '3m 42s',
        status: 'completed'
      },
      {
        name: 'API Endpoints',
        total: 98,
        passed: 89,
        failed: 9,
        pass_rate: 90.8,
        duration: '5m 18s',
        status: 'completed'
      },
      {
        name: 'Authentication',
        total: 34,
        passed: 34,
        failed: 0,
        pass_rate: 100.0,
        duration: '2m 12s',
        status: 'completed'
      },
      {
        name: 'Database Integration',
        total: 67,
        passed: 59,
        failed: 8,
        pass_rate: 88.1,
        duration: '2m 45s',
        status: 'completed'
      },
      {
        name: 'Cross-Platform',
        total: 72,
        passed: 70,
        failed: 2,
        pass_rate: 97.2,
        duration: '4m 20s',
        status: 'completed'
      }
    ],
    failures: [
      {
        category: 'UI Components',
        test: 'Modal close button functionality',
        error: 'Close button not found in mobile viewport',
        severity: 'medium'
      },
      {
        category: 'API Endpoints',
        test: 'Rate limiting validation',
        error: 'Rate limit not enforced for /api/leads endpoint',
        severity: 'high'
      },
      {
        category: 'Database Integration',
        test: 'Transaction rollback',
        error: 'Rollback failed for concurrent write operations',
        severity: 'high'
      }
    ],
    performance_metrics: {
      average_response_time: 245,
      slowest_endpoint: '/api/reports/analytics',
      memory_usage: '128MB',
      cpu_usage: '12%'
    },
    recommendations: [
      'Fix rate limiting on API endpoints',
      'Improve modal responsive design',
      'Review database transaction handling',
      'Optimize report generation performance'
    ]
  };
}
