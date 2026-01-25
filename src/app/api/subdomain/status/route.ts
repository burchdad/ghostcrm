export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { withCORS } from '@/lib/cors';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function subdomainStatusHandler(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { subdomain } = body;

    if (!subdomain) {
      return jsonError('Subdomain is required', 400);
    }

    console.log('[SUBDOMAIN-STATUS] Checking status for:', subdomain);

    // Query subdomain status from database
    const { data: subdomainData, error: subdomainError } = await supabaseAdmin
      .from('subdomains')
      .select('id, subdomain, status, organization_id, created_at, updated_at, provisioned_at')
      .eq('subdomain', subdomain.toLowerCase())
      .single();

    if (subdomainError || !subdomainData) {
      console.log('[SUBDOMAIN-STATUS] Subdomain not found:', subdomain);
      return jsonError('Subdomain not found', 404);
    }

    console.log('[SUBDOMAIN-STATUS] Found subdomain:', {
      subdomain: subdomainData.subdomain,
      status: subdomainData.status,
      organizationId: subdomainData.organization_id
    });

    return NextResponse.json({
      success: true,
      subdomain: subdomainData.subdomain,
      status: subdomainData.status,
      organizationId: subdomainData.organization_id,
      isActive: subdomainData.status === 'active',
      isPending: subdomainData.status === 'pending',
      createdAt: subdomainData.created_at,
      updatedAt: subdomainData.updated_at,
      provisionedAt: subdomainData.provisioned_at
    });

  } catch (error) {
    console.error('[SUBDOMAIN-STATUS] Unexpected error:', error);
    return jsonError('Internal server error', 500);
  }
}

export const POST = withCORS(subdomainStatusHandler);