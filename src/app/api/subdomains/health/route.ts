import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface HealthCheckResult {
  subdomain: string;
  fullDomain: string;
  connectivity: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    statusCode?: number;
    error?: string;
  };
  ssl: {
    status: 'active' | 'expired' | 'invalid' | 'pending';
    expiresAt?: string;
    issuer?: string;
  };
  dns: {
    status: 'resolved' | 'failed' | 'partial';
    records: any[];
    errors?: string[];
  };
  performance: {
    responseTime: number;
    throughput?: number;
    availability: number;
  };
  overall: 'healthy' | 'degraded' | 'unhealthy';
  lastChecked: string;
}

/**
 * GET /api/subdomains/health
 * Get health status for specific subdomain or all subdomains
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subdomain = searchParams.get('subdomain');
    const organizationId = searchParams.get('organizationId');
    const includeHistory = searchParams.get('includeHistory') === 'true';

    if (subdomain) {
      // Get health for specific subdomain
      const healthResult = await checkSubdomainHealth(subdomain);
      return NextResponse.json({
        success: true,
        data: healthResult,
        history: includeHistory ? await getHealthHistory(subdomain) : undefined
      });
    } else if (organizationId) {
      // Get health for all subdomains of an organization
      const orgSubdomains = await getOrganizationSubdomains(organizationId);
      const healthResults = await Promise.all(
        orgSubdomains.map(sub => checkSubdomainHealth(sub.subdomain))
      );
      return NextResponse.json({
        success: true,
        data: healthResults
      });
    } else {
      // Get health summary for all subdomains (owner view)
      const authResult = await verifySoftwareOwnerAccess(req);
      if (!authResult.success) {
        return NextResponse.json({ error: authResult.error }, { status: 401 });
      }

      const allSubdomains = await getAllActiveSubdomains();
      const healthSummary = await getHealthSummary(allSubdomains);
      
      return NextResponse.json({
        success: true,
        data: healthSummary
      });
    }
  } catch (error) {
    console.error('Health check API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve health information'
    }, { status: 500 });
  }
}

/**
 * POST /api/subdomains/health
 * Trigger manual health check for subdomain(s)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subdomain, subdomains, checkTypes = ['all'] } = body;

    if (subdomain) {
      // Check single subdomain
      const result = await performHealthCheck(subdomain, checkTypes);
      await saveHealthCheckResult(result);
      
      return NextResponse.json({
        success: true,
        data: result
      });
    } else if (subdomains && Array.isArray(subdomains)) {
      // Check multiple subdomains
      const results = await Promise.all(
        subdomains.map(sub => performHealthCheck(sub, checkTypes))
      );
      
      await Promise.all(results.map(result => saveHealthCheckResult(result)));
      
      return NextResponse.json({
        success: true,
        data: results
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Missing subdomain or subdomains parameter'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Manual health check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform health check'
    }, { status: 500 });
  }
}

// Helper Functions

async function checkSubdomainHealth(subdomain: string): Promise<HealthCheckResult> {
  const { data: subdomainData } = await supabase
    .from('subdomains')
    .select('*')
    .eq('subdomain', subdomain)
    .single();

  if (!subdomainData) {
    throw new Error('Subdomain not found');
  }

  const fullDomain = subdomainData.custom_domain || `${subdomain}.ghostcrm.ai`;
  
  // Perform all health checks in parallel
  const [connectivity, ssl, dns, performance] = await Promise.all([
    checkConnectivity(fullDomain),
    checkSSL(fullDomain),
    checkDNS(fullDomain),
    checkPerformance(fullDomain)
  ]);

  // Calculate overall health
  const overall = calculateOverallHealth(connectivity, ssl, dns, performance);

  const result: HealthCheckResult = {
    subdomain,
    fullDomain,
    connectivity,
    ssl,
    dns,
    performance,
    overall,
    lastChecked: new Date().toISOString()
  };

  // Update subdomain health status in database
  await updateSubdomainHealthStatus(subdomain, overall, result);

  return result;
}

async function checkConnectivity(domain: string): Promise<HealthCheckResult['connectivity']> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`https://${domain}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'GhostCRM-HealthMonitor/1.0'
      }
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    return {
      status: response.ok ? 'healthy' : response.status >= 500 ? 'unhealthy' : 'degraded',
      responseTime,
      statusCode: response.status
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Connection failed'
    };
  }
}

async function checkSSL(domain: string): Promise<HealthCheckResult['ssl']> {
  try {
    // Note: In a real implementation, you'd use a proper SSL checking library
    // This is a simplified version that checks if HTTPS is available
    
    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      return {
        status: 'active',
        // In a real implementation, you'd extract certificate details
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // Assume 90 days
        issuer: 'Unknown' // Would be extracted from certificate
      };
    } else {
      return { status: 'invalid' };
    }
  } catch (error) {
    return { 
      status: 'invalid'
    };
  }
}

async function checkDNS(domain: string): Promise<HealthCheckResult['dns']> {
  try {
    // Note: In a real implementation, you'd use a DNS resolution library
    // This is a simplified check using fetch to see if domain resolves
    
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);

    await fetch(`https://${domain}`, {
      method: 'HEAD',
      signal: controller.signal
    });

    return {
      status: 'resolved',
      records: [
        { type: 'A', value: 'resolved' } // Simplified - would contain actual DNS records
      ]
    };
  } catch (error) {
    return {
      status: 'failed',
      records: [],
      errors: [error instanceof Error ? error.message : 'DNS resolution failed']
    };
  }
}

async function checkPerformance(domain: string): Promise<HealthCheckResult['performance']> {
  const measurements: number[] = [];
  
  // Perform 3 quick performance checks
  for (let i = 0; i < 3; i++) {
    const startTime = Date.now();
    try {
      await fetch(`https://${domain}/api/health`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      measurements.push(Date.now() - startTime);
    } catch (error) {
      measurements.push(10000); // Treat failed requests as 10s response time
    }
  }

  const averageResponseTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
  const successfulMeasurements = measurements.filter(time => time < 10000).length;
  const availability = (successfulMeasurements / measurements.length) * 100;

  return {
    responseTime: Math.round(averageResponseTime),
    availability: Math.round(availability * 100) / 100
  };
}

function calculateOverallHealth(
  connectivity: HealthCheckResult['connectivity'],
  ssl: HealthCheckResult['ssl'],
  dns: HealthCheckResult['dns'],
  performance: HealthCheckResult['performance']
): 'healthy' | 'degraded' | 'unhealthy' {
  // Weighted scoring system
  let score = 0;
  
  // Connectivity (40% weight)
  if (connectivity.status === 'healthy') score += 40;
  else if (connectivity.status === 'degraded') score += 20;
  
  // SSL (25% weight)
  if (ssl.status === 'active') score += 25;
  else if (ssl.status === 'expired') score += 10;
  
  // DNS (25% weight)
  if (dns.status === 'resolved') score += 25;
  else if (dns.status === 'partial') score += 15;
  
  // Performance (10% weight)
  if (performance.availability >= 95 && performance.responseTime < 2000) score += 10;
  else if (performance.availability >= 90 && performance.responseTime < 5000) score += 5;
  
  if (score >= 80) return 'healthy';
  if (score >= 50) return 'degraded';
  return 'unhealthy';
}

async function performHealthCheck(subdomain: string, checkTypes: string[]): Promise<HealthCheckResult> {
  // This would be more sophisticated, allowing selective health checks
  return await checkSubdomainHealth(subdomain);
}

async function saveHealthCheckResult(result: HealthCheckResult): Promise<void> {
  try {
    // Get subdomain ID
    const { data: subdomainData } = await supabase
      .from('subdomains')
      .select('id')
      .eq('subdomain', result.subdomain)
      .single();

    if (subdomainData) {
      // Save individual check results
      const checks = [
        {
          subdomain_id: subdomainData.id,
          check_type: 'connectivity',
          status: result.connectivity.status,
          response_time_ms: result.connectivity.responseTime,
          status_code: result.connectivity.statusCode,
          error_message: result.connectivity.error,
          check_details: result.connectivity
        },
        {
          subdomain_id: subdomainData.id,
          check_type: 'ssl',
          status: result.ssl.status === 'active' ? 'healthy' : 
                  result.ssl.status === 'expired' ? 'unhealthy' : 'degraded',
          check_details: result.ssl
        },
        {
          subdomain_id: subdomainData.id,
          check_type: 'dns',
          status: result.dns.status === 'resolved' ? 'healthy' : 'unhealthy',
          check_details: result.dns
        },
        {
          subdomain_id: subdomainData.id,
          check_type: 'performance',
          status: result.performance.availability >= 95 ? 'healthy' : 
                  result.performance.availability >= 90 ? 'degraded' : 'unhealthy',
          response_time_ms: result.performance.responseTime,
          check_details: result.performance
        }
      ];

      await supabase
        .from('subdomain_health_checks')
        .insert(checks);
    }
  } catch (error) {
    console.error('Error saving health check result:', error);
  }
}

async function updateSubdomainHealthStatus(subdomain: string, status: string, details: any): Promise<void> {
  try {
    await supabase
      .from('subdomains')
      .update({
        health_status: status,
        last_health_check: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('subdomain', subdomain);
  } catch (error) {
    console.error('Error updating subdomain health status:', error);
  }
}

async function getHealthHistory(subdomain: string, days: number = 7): Promise<any[]> {
  try {
    const { data: subdomainData } = await supabase
      .from('subdomains')
      .select('id')
      .eq('subdomain', subdomain)
      .single();

    if (subdomainData) {
      const { data: history } = await supabase
        .from('subdomain_health_checks')
        .select('*')
        .eq('subdomain_id', subdomainData.id)
        .gte('checked_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('checked_at', { ascending: false });

      return history || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting health history:', error);
    return [];
  }
}

async function getOrganizationSubdomains(organizationId: string): Promise<any[]> {
  try {
    const { data } = await supabase
      .from('subdomains')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    return data || [];
  } catch (error) {
    console.error('Error getting organization subdomains:', error);
    return [];
  }
}

async function getAllActiveSubdomains(): Promise<any[]> {
  try {
    const { data } = await supabase
      .from('subdomains')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    return data || [];
  } catch (error) {
    console.error('Error getting all active subdomains:', error);
    return [];
  }
}

async function getHealthSummary(subdomains: any[]): Promise<any> {
  const summary = {
    total: subdomains.length,
    healthy: 0,
    degraded: 0,
    unhealthy: 0,
    unknown: 0,
    avgResponseTime: 0,
    uptime: 0
  };

  let totalResponseTime = 0;
  let responseTimeCount = 0;

  for (const subdomain of subdomains) {
    switch (subdomain.health_status) {
      case 'healthy':
        summary.healthy++;
        break;
      case 'degraded':
        summary.degraded++;
        break;
      case 'unhealthy':
        summary.unhealthy++;
        break;
      default:
        summary.unknown++;
    }
  }

  summary.uptime = summary.total > 0 ? 
    Math.round(((summary.healthy + summary.degraded) / summary.total) * 100) : 0;

  return summary;
}

async function verifySoftwareOwnerAccess(req: NextRequest): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const ownerToken = req.cookies.get('owner_session')?.value;
    
    if (!ownerToken) {
      return { success: false, error: 'No owner session found' };
    }

    const payload = JSON.parse(
      Buffer.from(ownerToken.split('.')[1], 'base64').toString()
    );

    if (!payload.isSoftwareOwner || payload.role !== 'software_owner') {
      return { success: false, error: 'Insufficient permissions' };
    }

    if (payload.expires && new Date(payload.expires) < new Date()) {
      return { success: false, error: 'Session expired' };
    }

    return { success: true, userId: payload.userId };
  } catch (error) {
    return { success: false, error: 'Invalid session' };
  }
}