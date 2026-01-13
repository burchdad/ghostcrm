import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createSupabaseAdmin } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    let user: any = null;
    let userErr: any = null;

    // Try Bearer token first (bulletproof for subdomains)
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const accessToken = authHeader.substring(7);
      
      try {
        // Create supabase client with access token for verification
        const supabaseWithToken = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              get: () => undefined,
              set: () => {},
              remove: () => {}
            },
            global: {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          }
        );
        
        const result = await supabaseWithToken.auth.getUser();
        user = result.data.user;
        userErr = result.error;
        
        if (user) {
          console.log('🔑 [BOOTSTRAP] Using Bearer token authentication for user:', user.id);
        }
      } catch (tokenError) {
        console.warn('⚠️ [BOOTSTRAP] Bearer token validation failed, will try cookies:', tokenError);
        // Don't set userErr here - let it fall through to cookie auth
      }
    }
    
    // Fallback to cookie session if Bearer token didn't work
    if (!user && !userErr) {
      console.log('🍪 [BOOTSTRAP] Falling back to cookie session authentication');
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

      const result = await supabase.auth.getUser();
      user = result.data.user;
      userErr = result.error;
      
      if (user) {
        console.log('🍪 [BOOTSTRAP] Cookie authentication successful for user:', user.id);
      }
    }
    
    if (userErr || !user) {
      // Not signed in yet → do nothing (pre-login is normal)
      console.log('🚫 [BOOTSTRAP] No session, returning 204 (pre-login is normal)');
      return new NextResponse(null, { status: 204 });
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