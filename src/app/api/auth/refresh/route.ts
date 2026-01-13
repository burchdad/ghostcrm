import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [Auth] Refresh token requested');
    
    // Create Supabase server client
    const supabase = await createSupabaseServer();
    
    // Get current session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ [Auth] Session error:', sessionError.message);
      return NextResponse.json({ 
        error: "Invalid session", 
        message: "Please log in again",
        shouldReload: true,
        requiresLogin: true
      }, { status: 401 });
    }
    
    if (!session) {
      console.log('ℹ️ [Auth] No session found');
      return NextResponse.json({ 
        error: "No session found", 
        message: "Please log in again",
        shouldReload: true,
        requiresLogin: true
      }, { status: 401 });
    }
    
    // Try to refresh the Supabase session
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError || !refreshData.session) {
      console.log('❌ [Auth] Supabase refresh failed:', refreshError?.message);
      
      // Sign out to clean up corrupted session
      await supabase.auth.signOut();
      
      return NextResponse.json({ 
        error: "Refresh failed", 
        message: "Please log in again",
        shouldReload: true,
        shouldSignOut: true,
        requiresLogin: true
      }, { status: 401 });
    }
    
    console.log('✅ [Auth] Supabase token refreshed successfully');
    
    return NextResponse.json({ 
      success: true,
      message: "Session refreshed successfully",
      session: {
        access_token: refreshData.session.access_token,
        expires_at: refreshData.session.expires_at,
        user: refreshData.session.user
      }
    });

  } catch (error) {
    console.error('❌ [Auth] Refresh error:', error);
    
    return NextResponse.json({ 
      error: "Internal server error",
      message: "Please try again or log in",
      shouldReload: true,
      requiresLogin: true
    }, { status: 500 });
  }
}