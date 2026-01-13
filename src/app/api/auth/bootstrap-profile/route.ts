import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";
import { createSupabaseAdmin } from "@/utils/supabase/admin";

export async function POST() {
  try {
    // 1) Confirm the caller is logged in (cookie session)
    const supabase = await createSupabaseServer();
    const { data: { user }, error: userErr } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
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
          created_at: new Date().toISOString()
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