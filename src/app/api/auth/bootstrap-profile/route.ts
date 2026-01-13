import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createSupabaseAdmin } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    let user: any = null;

    // 1) Try Bearer token first
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const accessToken = authHeader.slice(7);

      const supabaseWithToken = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: { get: () => undefined, set: () => {}, remove: () => {} },
          global: { headers: { Authorization: `Bearer ${accessToken}` } },
        }
      );

      const { data, error } = await supabaseWithToken.auth.getUser();
      if (!error && data.user) user = data.user;
    }

    // 2) Fallback to cookie session
    if (!user) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: (name) => cookieStore.get(name)?.value,
            set: () => {},
            remove: () => {},
          },
        }
      );

      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) user = data.user;
    }

    // Pre-login is normal
    if (!user) return new NextResponse(null, { status: 204 });

    // 3) Upsert into PROFILES (not USERS)
    const admin = createSupabaseAdmin();

    const now = new Date().toISOString();

    const { data: profile, error: upsertErr } = await admin
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email ?? null,
          role: user.user_metadata?.role ?? 'user',
          tenant_id: user.user_metadata?.tenant_id ?? null,
          organization_id: user.user_metadata?.organization_id ?? null,
          requires_password_reset: false,
          status: 'active',
          updated_at: now,
          // do NOT force created_at on upsert; let DB default handle inserts
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single();

    if (upsertErr) {
      console.error('❌ [Bootstrap] profiles upsert failed:', upsertErr);
      return NextResponse.json({ ok: false, error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    console.error('❌ [Bootstrap] Unexpected error:', err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}