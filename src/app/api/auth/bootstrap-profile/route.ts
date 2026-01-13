import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createSupabaseAdmin } from '@/utils/supabase/admin';

export async function POST() {
  try {
    const cookieStore = cookies();

    // IMPORTANT: this must be the SSR server client wired to cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: (name, value, options) => {
            // App Router: NextResponse handles sets; for route handlers, you can omit set/remove here
          },
          remove: (name, options) => {}
        }
      }
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: userErr?.message },
        { status: 401 }
      );
    }

    // 2) Upsert profile using admin client (bypasses RLS)
    const admin = createSupabaseAdmin();

    const { data: profile, error: upsertErr } = await admin
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email,
          updated_at: new Date().toISOString(),
          // Default values for new profiles
          role: user.user_metadata?.role || 'user',
          requires_password_reset: false,
          created_at: new Date().toISOString(),
          // Add organization_id and tenant_id with proper defaults
          organization_id: user.user_metadata?.organization_id || null,
          tenant_id: user.user_metadata?.tenant_id || null,
          status: 'active'
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (upsertErr) {
      console.error('❌ [Bootstrap] Failed to upsert profile:', upsertErr);
      return NextResponse.json({ ok: false, error: upsertErr.message }, { status: 500 });
    }

    console.log('✅ [Bootstrap] Profile created/updated:', profile?.id);
    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    console.error('❌ [Bootstrap] Unexpected error:', err);
    return NextResponse.json({ 
      ok: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    }, { status: 500 });
  }
}