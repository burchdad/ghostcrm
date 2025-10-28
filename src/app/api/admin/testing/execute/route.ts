/**
 * TEST EXECUTION API
 * Handles running functionality tests against main app and tenants
 */

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const runtime = 'nodejs';

/** ─────────────── Types ─────────────── */
type TestSuiteName = 'ui' | 'pages' | 'api' | 'auth' | 'db' | 'platform' | 'all';

type SuiteSummary = {
  total: number;
  passed: number;
  failed: number;
  passRate: number; // percentage 0..100
};

type SuiteResult = {
  summary: SuiteSummary;
  // You can add per-test detail fields here if your test runners output them
};

type TestResultsBySuite = {
  ui: SuiteResult | null;
  pages: SuiteResult | null;
  api: SuiteResult | null;
  auth: SuiteResult | null;
  db: SuiteResult | null;
  platform: SuiteResult | null;
};

type ExecutionStatus = 'starting' | 'running' | 'completed' | 'failed';

type ExecutionRecord = {
  id: string;
  tenant_id: string;
  tenant_name: string;
  test_suites: TestSuiteName[];
  status: ExecutionStatus;
  progress: number; // 0..100
  started_at: string; // ISO
  completed_at?: string; // ISO
  execution_type: 'manual' | 'scheduled';
  results: {
    individual: TestResultsBySuite;
    overall: SuiteSummary;
  } | null;
  error?: string;
};

type StartRequestBody = {
  tenants?: string[];
  testSuites?: TestSuiteName[];
  executionType?: 'manual' | 'scheduled';
};

/** ───────────── In-memory stores (use Redis/DB in prod) ───────────── */
const activeExecutions: Map<string, ExecutionRecord> = new Map();
const executionResults: Map<string, ExecutionRecord> = new Map();

/** ──────────────── Route: POST /api/tests/execute ──────────────── */
export async function POST(req: NextRequest) {
  try {
    const { tenants, testSuites, executionType = 'manual' } =
      (await req.json()) as StartRequestBody;

    if (!Array.isArray(tenants) || tenants.length === 0) {
      return NextResponse.json({ error: 'Tenants array is required' }, { status: 400 });
    }
    if (!Array.isArray(testSuites) || testSuites.length === 0) {
      return NextResponse.json({ error: 'Test suites array is required' }, { status: 400 });
    }

    // TODO: Verify admin auth here

    const executions: ExecutionRecord[] = [];

    // Create execution for each tenant
    for (const tenantIdRaw of tenants) {
      const tenantId = String(tenantIdRaw).trim();
      if (!tenantId) continue;

      const executionId = uuidv4();

      const execution: ExecutionRecord = {
        id: executionId,
        tenant_id: tenantId,
        tenant_name: await getTenantName(tenantId),
        test_suites: testSuites,
        status: 'starting',
        progress: 0,
        started_at: new Date().toISOString(),
        execution_type: executionType,
        results: null,
      };

      activeExecutions.set(executionId, execution);
      executions.push(execution);

      // Fire and forget the test execution (background work)
      // NOTE: In serverless environments, prefer a queue/worker.
      void executeTests(execution);
    }

    return NextResponse.json({ success: true, executions });
  } catch (error) {
    const msg = (error as Error)?.message ?? 'Unknown error';
    console.error('Test execution error:', msg);
    return NextResponse.json({ error: 'Failed to start test execution' }, { status: 500 });
  }
}

/** ─────────────── Helpers & Implementation ─────────────── */

async function getTenantName(tenantId: string): Promise<string> {
  if (tenantId === 'main') return 'Main Application';
  // TODO: Fetch tenant name from database
  return `Tenant ${tenantId}`;
}

async function executeTests(execution: ExecutionRecord): Promise<void> {
  try {
    const testDir = path.join(process.cwd(), 'tests', 'functionality');

    // mark running
    execution.status = 'running';
    execution.progress = 10;
    broadcastUpdate('test_progress', {
      testId: execution.id,
      progress: execution.progress,
      status: execution.status,
    });

    const testResults: TestResultsBySuite = {
      ui: null,
      pages: null,
      api: null,
      auth: null,
      db: null,
      platform: null,
    };

    // Determine total suites to run
    const selectedSuites: Exclude<TestSuiteName, 'all'>[] =
      execution.test_suites.includes('all')
        ? (['ui', 'pages', 'api', 'auth', 'db', 'platform'] as const).slice()
        : (execution.test_suites.filter(
            (s): s is Exclude<TestSuiteName, 'all'> =>
              ['ui', 'pages', 'api', 'auth', 'db', 'platform'].includes(s)
          ) as Exclude<TestSuiteName, 'all'>[]);

    let completedSuites = 0;
    const totalSuites = selectedSuites.length || 1;

    for (const suite of selectedSuites) {
      const result = await runTestSuite(suite, execution.tenant_id, testDir);
      testResults[suite] = result;

      completedSuites++;
      execution.progress = Math.min(99, Math.round((completedSuites / totalSuites) * 90) + 10);
      broadcastUpdate('test_progress', {
        testId: execution.id,
        progress: execution.progress,
        status: execution.status,
      });
    }

    // Calculate overall results
    const overallResults = calculateOverallResults(testResults);

    execution.status = 'completed';
    execution.progress = 100;
    execution.completed_at = new Date().toISOString();
    execution.results = { individual: testResults, overall: overallResults };

    await saveExecutionResults(execution);
    activeExecutions.delete(execution.id);

    broadcastUpdate('test_completed', {
      testId: execution.id,
      results: execution.results,
    });
  } catch (err) {
    const msg = (err as Error)?.message ?? 'Unknown error';
    console.error('Test execution failed:', msg);

    execution.status = 'failed';
    execution.error = msg;
    execution.completed_at = new Date().toISOString();

    activeExecutions.delete(execution.id);

    broadcastUpdate('test_failed', { testId: execution.id, error: msg });
  }
}

async function runTestSuite(
  suite: Exclude<TestSuiteName, 'all'>,
  tenantId: string,
  testDir: string
): Promise<SuiteResult> {
  return new Promise((resolve, reject) => {
    const testFile = getTestFile(suite);
    const testPath = path.join(testDir, testFile);

    const env = {
      ...process.env,
      TEST_BASE_URL: getTenantUrl(tenantId),
      TEST_TENANT_ID: tenantId,
      TEST_SUITE: suite,
    };

    const child = spawn('node', [testPath], {
      env,
      cwd: testDir,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));

    child.on('close', (code) => {
      if (code === 0) {
        try {
          const results = parseTestResults(stdout);
          resolve(results);
        } catch (parseErr) {
          const msg = (parseErr as Error)?.message ?? 'Unknown parse error';
          reject(new Error(`Failed to parse test results: ${msg}`));
        }
      } else {
        reject(new Error(`Test suite ${suite} failed with code ${code}: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to start test suite ${suite}: ${(error as Error).message}`));
    });
  });
}

function getTestFile(suite: Exclude<TestSuiteName, 'all'>): string {
  const testFiles: Record<Exclude<TestSuiteName, 'all'>, string> = {
    ui: 'ui-component-tests.js',
    pages: 'page-functionality-tests.js',
    api: 'api-endpoint-tests.js',
    auth: 'authentication-tests.js',
    db: 'database-integration-tests.js',
    platform: 'cross-platform-accessibility-tests.js',
  };
  return testFiles[suite] ?? 'master-test-suite.js';
}

function getTenantUrl(tenantId: string): string {
  if (tenantId === 'main') {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }
  // TODO: resolve tenant-specific URL from DB
  return `https://${tenantId}.ghostcrm.com`;
}

function parseTestResults(stdout: string): SuiteResult {
  // Prefer a JSON block that contains "summary"
  const jsonMatch = stdout.match(/\{[\s\S]*?"summary"[\s\S]*?\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]) as { summary?: Partial<SuiteSummary> };
    if (parsed.summary) {
      const s = parsed.summary;
      return {
        summary: {
          total: Number(s.total ?? 0),
          passed: Number(s.passed ?? 0),
          failed: Number(s.failed ?? 0),
          passRate: Number(s.passRate ?? calcRate(Number(s.passed ?? 0), Number(s.total ?? 0))),
        },
      };
    }
  }

  // Fallback: parse "Passed: X", "Failed: Y", "Total: Z"
  const passMatch = stdout.match(/Passed:\s*(\d+)/i);
  const failMatch = stdout.match(/Failed:\s*(\d+)/i);
  const totalMatch = stdout.match(/Total:\s*(\d+)/i);

  if (passMatch && failMatch && totalMatch) {
    const passed = parseInt(passMatch[1], 10);
    const failed = parseInt(failMatch[1], 10);
    const total = parseInt(totalMatch[1], 10);
    return {
      summary: {
        total,
        passed,
        failed,
        passRate: calcRate(passed, total),
      },
    };
  }

  throw new Error('Could not parse test results');
}

function calculateOverallResults(testResults: TestResultsBySuite): SuiteSummary {
  let total = 0;
  let passed = 0;
  let failed = 0;

  for (const key of Object.keys(testResults) as (keyof TestResultsBySuite)[]) {
    const res = testResults[key];
    if (res?.summary) {
      total += res.summary.total || 0;
      passed += res.summary.passed || 0;
      failed += res.summary.failed || 0;
    }
  }

  return {
    total,
    passed,
    failed,
    passRate: calcRate(passed, total),
  };
}

function calcRate(passed: number, total: number): number {
  return total > 0 ? Math.round((passed / total) * 10000) / 100 : 0; // 2 decimals
}

async function saveExecutionResults(execution: ExecutionRecord) {
  // TODO: Persist to DB
  console.log('Saving execution results:', execution.id);
  executionResults.set(execution.id, execution);
}

function broadcastUpdate(type: 'test_progress' | 'test_completed' | 'test_failed', data: unknown) {
  // TODO: Implement WebSocket/SSE to notify clients
  console.log('Broadcasting update:', type, data);
}

