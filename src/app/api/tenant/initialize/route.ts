/**
 * TENANT INITIALIZATION API
 * Creates an organization for the authenticated user and seeds baseline data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = 'nodejs';

type JsonBody = {
  companyName?: string;
  adminEmail?: string;
  industry?: string;
  teamSize?: string;
  subdomain?: string;
};

export async function POST(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!isAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user data from JWT
    const user = getUserFromRequest(req);
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      );
    }

    const body: JsonBody = await req.json().catch(() => ({}));
    const { companyName = "My Company", adminEmail, industry, teamSize, subdomain } = body;

    console.log(`🏢 [TENANT_INIT] Creating organization for user ${user.id}`);

    // Return mock organization data for now
    const mockOrganization = {
      id: `org_${Date.now()}`,
      name: companyName,
      subdomain: subdomain || `company${Date.now()}`,
      created_at: new Date().toISOString(),
      owner_id: user.id
    };

    return NextResponse.json(
      {
        success: true,
        organization: mockOrganization,
        message: 'Organization initialized successfully (mock mode)'
      },
      {}
    );
  } catch (error) {
    console.error('❌ [TENANT_INIT] Unexpected error:', (error as Error)?.message || error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!isAuthenticated(req)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user data from JWT
    const user = getUserFromRequest(req);
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      );
    }

    // Return mock organization status
    return NextResponse.json(
      {
        initialized: true,
        organization: {
          id: `org_${user.id}`,
          name: "Mock Organization",
          subdomain: "mock-org",
          created_at: new Date().toISOString()
        }
      },
      {}
    );
  } catch (error) {
    console.error('❌ [TENANT_INIT] Unexpected error:', (error as Error)?.message || error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

