/**
 * ADMIN AUTHENTICATION VERIFICATION
 * Secure admin access verification middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ProfileRow = {
  role: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
};

function getClientIp(req: NextRequest): string | null {
  // NextRequest doesn't expose req.ip in app router; rely on headers
  const xfwd = req.headers.get('x-forwarded-for'); // "client, proxy1, proxy2"
  if (xfwd) return xfwd.split(',')[0]?.trim() || null;
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf;
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();

    // 1) Session user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 2) Load profile/role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, email, first_name, last_name')
      .eq('id', user.id)
      .single<ProfileRow>();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 403 });
    }

    // 3) Check owner/super-admin
    const ownerEmail = (process.env.OWNER_EMAIL || '').trim().toLowerCase();
    const profileEmail = (profile.email || '').trim().toLowerCase();

    const isOwner = ownerEmail && profileEmail && profileEmail === ownerEmail;
    const isSuperAdmin = (profile.role || '').toLowerCase() === 'super_admin';

    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    // 4) Fire-and-forget audit log (don’t block response)
    const ip = getClientIp(req);
    const ua = req.headers.get('user-agent');

    void (async () => {
      try {
        const { error: insertError } = await supabase.from('admin_audit_log').insert({
          user_id: user.id,
          action: 'admin_dashboard_access',
          ip_address: ip,
          user_agent: ua,
          // let DB default handle created_at/timestamp if present
        });
        if (insertError) {
          // log silently; do not throw to avoid breaking response
          console.warn('admin_audit_log insert failed:', insertError.message);
        }
      } catch (e) {
        console.warn('admin_audit_log insert exception:', (e as Error).message);
      }
    })();

    const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || null;

    return NextResponse.json({
      id: user.id,
      email: profile.email,
      name,
      role: profile.role,
      isOwner: Boolean(isOwner),
      isSuperAdmin,
    });
  } catch (error) {
    console.error('Admin auth verification error:', (error as Error)?.message ?? error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
