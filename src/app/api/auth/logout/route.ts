import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log("🚪 [LOGOUT] Processing Supabase logout request...");
  
  try {
    const supabase = await createSupabaseServer();
    
    // Sign out from Supabase (this will clear the auth cookies)
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ [LOGOUT] Supabase signOut error:', error.message);
      return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
    
    console.log('✅ [LOGOUT] Successfully logged out from Supabase');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('💥 [LOGOUT] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

