import { NextRequest, NextResponse } from 'next/server';
import { getTenantBySubdomain } from '@/lib/tenant/database';
import { getSubdomain } from '@/lib/tenant/utils';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Optional dev fallback tenants
const sampleTenants = {
  'acme-auto': {
    id: 2,
    subdomain: 'acme-auto',
    name: 'ACME Auto Sales',
    config: { features: ['leads', 'inventory', 'finance', 'compliance'] },
    branding: { primary_color: '#dc2626', company_name: 'ACME Auto Sales' },
    settings: {},
    status: 'active' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    plan: 'professional' as const,
    user_limit: 25,
    storage_limit_mb: 5000,
    admin_email: 'manager@acmeauto.com',
  },
  'premium-cars': {
    id: 3,
    subdomain: 'premium-cars',
    name: 'Premium Cars LLC',
    config: {
      features: ['leads', 'inventory', 'finance', 'compliance', 'advanced_reporting'],
    },
    branding: { primary_color: '#059669', company_name: 'Premium Cars LLC' },
    settings: {},
    status: 'active' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    plan: 'enterprise' as const,
    user_limit: 100,
    storage_limit_mb: 20000,
    admin_email: 'admin@premiumcars.com',
  },
} as const;

export async function GET(request: NextRequest) {
  try {
    // Extract tenant subdomain from Host header
    const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    const subdomain = getSubdomain(hostname);

    if (!subdomain) {
      return NextResponse.json({ error: 'No tenant subdomain detected' }, { status: 400 });
    }

    // Try primary: database lookup
    let tenant: any = null;
    try {
      tenant = await getTenantBySubdomain(subdomain);
    } catch (dbError) {
      // Log and fall back (useful in dev/offline DB situations)
      console.error('Database fetch failed:', dbError);
    }

    // Fallback to sample tenants when DB lookup failed or returned null
    if (!tenant) {
      tenant = (sampleTenants as Record<string, unknown>)[subdomain] ?? null;
    }

    if (!tenant) {
      return NextResponse.json({ error: `Tenant '${subdomain}' not found` }, { status: 404 });
    }

    return NextResponse.json({
      tenant,
      subdomain,
      isMarketingSite: false,
    });
  } catch (error) {
    console.error('Error in tenant API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
