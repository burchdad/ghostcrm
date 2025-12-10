import { NextRequest, NextResponse } from 'next/server';
import { getTenantBySubdomain } from '@/lib/tenant/database';
import { getSubdomain } from '@/lib/tenant/utils';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Extract tenant subdomain from Host header
    const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    const subdomain = getSubdomain(hostname);

    if (!subdomain) {
      return NextResponse.json({ error: 'No tenant subdomain detected' }, { status: 400 });
    }

    // Database lookup
    const tenant = await getTenantBySubdomain(subdomain);

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
