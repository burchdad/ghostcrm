/**
 * TENANT MANAGEMENT API
 * Handles tenant discovery and management for testing
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/** ───────────────────────── Types ───────────────────────── */
type Tenant = {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive';
  created_at: string; // ISO string
  last_test: string;  // ISO string
  health_score: number;
};

type ConnectivityCheck = { status: 'healthy' | 'degraded' | 'unhealthy'; responseTime: number };
type DatabaseCheck    = { status: 'healthy' | 'degraded' | 'unhealthy'; connectionTime: number };
type AuthCheck        = { status: 'healthy' | 'degraded' | 'unhealthy'; loginFlow: boolean };
type EndpointResult   = { endpoint: string; status: number; healthy: boolean; error?: string };
type EndpointsCheck   = { status: 'healthy' | 'degraded' | 'unhealthy'; endpoints: EndpointResult[] };

type HealthChecks = {
  connectivity?: ConnectivityCheck;
  database?: DatabaseCheck;
  authentication?: AuthCheck;
  apiEndpoints?: EndpointsCheck;
};

type HealthStatus = {
  tenant_id: string;
  url: string;
  timestamp: string;
  overall_score: number;
  checks: HealthChecks;
  error?: string;
};

/** ──────────────────────── Helpers ──────────────────────── */

// Node/WHATWG fetch does NOT support a `timeout` option.
// Use AbortController + setTimeout to enforce timeouts.
async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs, ...rest } = init;
  if (!timeoutMs) return fetch(input, rest);

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

/** ──────────────────────── Routes ──────────────────────── */

export async function GET(_req: NextRequest) {
  try {
    // TODO: Verify admin auth here

    const tenants = await getTenantsList();
    return NextResponse.json(tenants);
  } catch (error) {
    console.error('Tenant list error:', error);
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

// Health check endpoint for individual tenant
export async function POST(req: NextRequest) {
  try {
    const { tenantId } = (await req.json()) as { tenantId?: string };

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }

    const healthStatus = await checkTenantHealth(tenantId);
    return NextResponse.json(healthStatus);
  } catch (error) {
    console.error('Tenant health check error:', error);
    return NextResponse.json({ error: 'Failed to check tenant health' }, { status: 500 });
  }
}

/** ───────────────────── Implementation ──────────────────── */

async function getTenantsList(): Promise<Tenant[]> {
  // TODO: Implement actual tenant discovery (query your multi-tenant DB)
  return [
    {
      id: 'acme-corp',
      name: 'Acme Corporation',
      url: 'https://acme-corp.ghostcrm.com',
      status: 'active',
      created_at: '2024-01-15T10:00:00Z',
      last_test: '2024-01-20T14:30:00Z',
      health_score: 95,
    },
    {
      id: 'tech-startup',
      name: 'Tech Startup Inc',
      url: 'https://tech-startup.ghostcrm.com',
      status: 'active',
      created_at: '2024-02-01T09:15:00Z',
      last_test: '2024-01-20T12:45:00Z',
      health_score: 88,
    },
    {
      id: 'global-sales',
      name: 'Global Sales Ltd',
      url: 'https://global-sales.ghostcrm.com',
      status: 'active',
      created_at: '2024-01-10T16:20:00Z',
      last_test: '2024-01-19T18:00:00Z',
      health_score: 92,
    },
  ];
}

async function checkTenantHealth(tenantId: string): Promise<HealthStatus> {
  const tenantUrl = getTenantUrl(tenantId);

  try {
    const checks: HealthChecks = {
      connectivity: await checkConnectivity(tenantUrl),
      database: await checkDatabaseHealth(tenantId),
      authentication: await checkAuthenticationHealth(tenantUrl),
      apiEndpoints: await checkApiEndpoints(tenantUrl),
    };

    const overallHealth = calculateHealthScore(checks);

    return {
      tenant_id: tenantId,
      url: tenantUrl,
      timestamp: new Date().toISOString(),
      overall_score: overallHealth,
      checks,
    };
  } catch (error) {
    const message = (error as Error)?.message ?? 'Unknown error';
    return {
      tenant_id: tenantId,
      url: tenantUrl,
      timestamp: new Date().toISOString(),
      overall_score: 0,
      error: message,
      checks: {},
    };
  }
}

async function checkConnectivity(url: string): Promise<ConnectivityCheck> {
  const startTime = Date.now();

  try {
    const response = await fetchWithTimeout(`${url}/api/health`, {
      method: 'GET',
      timeoutMs: 10_000,
      // no headers needed for a simple health GET
    });

    const responseTime = Date.now() - startTime;
    return {
      status: response.ok ? 'healthy' : 'degraded',
      responseTime,
    };
  } catch {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
    };
  }
}

async function checkDatabaseHealth(_tenantId: string): Promise<DatabaseCheck> {
  const startTime = Date.now();
  try {
    // TODO: Implement tenant-specific DB connectivity probe
    // e.g., ping a minimal read endpoint / lightweight SELECT 1
    const connectionTime = Date.now() - startTime;
    return { status: 'healthy', connectionTime };
  } catch {
    return { status: 'unhealthy', connectionTime: Date.now() - startTime };
  }
}

async function checkAuthenticationHealth(url: string): Promise<AuthCheck> {
  try {
    // Should return 401 for invalid credentials
    const response = await fetchWithTimeout(`${url}/api/auth/signin`, {
      method: 'POST',
      timeoutMs: 10_000,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'healthcheck@test.com', password: 'invalid' }),
    });

    const loginFlow = response.status === 401;
    return { status: loginFlow ? 'healthy' : 'degraded', loginFlow };
  } catch {
    return { status: 'unhealthy', loginFlow: false };
  }
}

async function checkApiEndpoints(url: string): Promise<EndpointsCheck> {
  const criticalEndpoints = ['/api/leads', '/api/deals', '/api/contacts', '/api/auth/user'];

  const endpointResults: EndpointResult[] = [];

  for (const endpoint of criticalEndpoints) {
    try {
      const resp = await fetchWithTimeout(`${url}${endpoint}`, {
        method: 'GET',
        timeoutMs: 5_000,
      });

      endpointResults.push({
        endpoint,
        status: resp.status,
        healthy: resp.status < 500 && resp.status !== 0,
      });
    } catch (error) {
      endpointResults.push({
        endpoint,
        status: 0,
        healthy: false,
        error: (error as Error)?.message ?? 'Unknown error',
      });
    }
  }

  const healthyEndpoints = endpointResults.filter((e) => e.healthy).length;
  const totalEndpoints = endpointResults.length;
  const healthPercentage = (healthyEndpoints / Math.max(totalEndpoints, 1)) * 100;

  return {
    status: healthPercentage >= 80 ? 'healthy' : healthPercentage >= 50 ? 'degraded' : 'unhealthy',
    endpoints: endpointResults,
  };
}

function calculateHealthScore(checks: HealthChecks): number {
  let score = 0;

  // Connectivity (30%)
  if (checks.connectivity) {
    if (checks.connectivity.status === 'healthy') score += 30;
    else if (checks.connectivity.status === 'degraded') score += 15;
  }

  // Database (25%)
  if (checks.database) {
    if (checks.database.status === 'healthy') score += 25;
    else if (checks.database.status === 'degraded') score += 12;
  }

  // Authentication (25%)
  if (checks.authentication) {
    if (checks.authentication.status === 'healthy') score += 25;
    else if (checks.authentication.status === 'degraded') score += 12;
  }

  // API Endpoints (20%)
  if (checks.apiEndpoints) {
    if (checks.apiEndpoints.status === 'healthy') score += 20;
    else if (checks.apiEndpoints.status === 'degraded') score += 10;
  }

  return Math.round(score);
}

function getTenantUrl(tenantId: string): string {
  if (tenantId === 'main') {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }
  // TODO: resolve tenant subdomain from DB/config
  return `https://${tenantId}.ghostcrm.com`;
}
