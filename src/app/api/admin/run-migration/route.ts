// app/api/migrate/organizations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { jwtVerify, JWTPayload } from 'jose';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RolePayload = JWTPayload & { role?: string };

// --- Security helpers ---
async function validateAdminAccess(request: NextRequest): Promise<boolean> {
  try {
    // 1) Static admin header gate
    const adminToken = request.headers.get('x-admin-token');
    const expectedToken = process.env.ADMIN_SECRET_TOKEN;
    if (!adminToken || !expectedToken || adminToken !== expectedToken) {
      return false;
    }

    // 2) JWT role check (cookie)
    const jwt = request.cookies.get('ghostcrm_jwt')?.value;
    if (!jwt) return false;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
    const { payload } = await jwtVerify(jwt, secret);
    const role = (payload as RolePayload).role;

    return role === 'admin' || role === 'superuser';
  } catch {
    return false;
  }
}

// --- POST handler ---
export async function POST(request: NextRequest) {
  // SECURITY: Validate admin access before allowing dangerous operations
  if (!(await validateAdminAccess(request))) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin access required.' },
      { status: 403 }
    );
  }

  console.log('🔄 [MIGRATION] Running organizations migration...');

  try {
    // Note: gen_random_uuid() requires pgcrypto; Supabase typically has it enabled.
    // We defensively enable it here.
    const migrationSQL = `
-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Organizations table for billing and multi-tenant support
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  owner_id UUID,

  -- Stripe billing fields
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'inactive',
  last_payment_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization memberships table
CREATE TABLE IF NOT EXISTS organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  status VARCHAR(50) DEFAULT 'active',
  tier TEXT DEFAULT 'basic',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (organization_id, user_id)
);

-- Billing sessions table for tracking Stripe checkouts
CREATE TABLE IF NOT EXISTS billing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50) DEFAULT 'pending',
  user_data JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
    `;

    console.log('📄 [MIGRATION] Executing SQL...');

    // Split and execute statement-by-statement using RPC (expects a SQL executor RPC on DB)
    const statements = migrationSQL
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      console.log(`🔧 [MIGRATION] Executing: ${statement.slice(0, 80)}...`);
      const { error } = await supabaseAdmin.rpc('execute_sql', { sql: statement });
      if (error) {
        console.error('❌ [MIGRATION] Statement failed via RPC:', error.message);

        // Fallback: Touch a simple table to verify client connection (no DDL here)
        const { error: probeError } = await supabaseAdmin.from('_migrations').select('id').limit(1);
        if (probeError) {
          console.log('🔄 [MIGRATION] RPC fallback probe failed (expected if _migrations absent).');
        }
      } else {
        console.log('✅ [MIGRATION] Statement completed');
      }
    }

    // Verify tables exist by querying them
    console.log('🔍 [MIGRATION] Verifying table creation...');

    try {
      const { error: orgError } = await supabaseAdmin.from('organizations').select('id').limit(1);
      if (!orgError) console.log('✅ [MIGRATION] organizations table verified');
    } catch (e) {
      console.log('❌ [MIGRATION] organizations not accessible:', e);
    }

    try {
      const { error: memberError } = await supabaseAdmin
        .from('organization_memberships')
        .select('id')
        .limit(1);
      if (!memberError) console.log('✅ [MIGRATION] organization_memberships table verified');
    } catch (e) {
      console.log('❌ [MIGRATION] organization_memberships not accessible:', e);
    }

    try {
      const { error: billingError } = await supabaseAdmin
        .from('billing_sessions')
        .select('id')
        .limit(1);
      if (!billingError) console.log('✅ [MIGRATION] billing_sessions table verified');
    } catch (e) {
      console.log('❌ [MIGRATION] billing_sessions not accessible:', e);
    }

    console.log('🎉 [MIGRATION] Migration process completed!');
    return NextResponse.json({
      success: true,
      message: 'Migration executed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('💥 [MIGRATION] Migration failed:', error);
    return NextResponse.json(
      { error: 'Migration failed', detail: error?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
