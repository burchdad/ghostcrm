import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  try {
    // Create Supabase client for server-side operations
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // We'll handle cookie setting in the response
          },
          remove(name: string, options: CookieOptions) {
            // We'll handle cookie removal in the response
          },
        },
      }
    );

    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return NextResponse.json({ 
        error: "No valid session found", 
        message: "Please log in again" 
      }, { status: 401 });
    }

    // Refresh the session
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError || !refreshData.session) {
      return NextResponse.json({ 
        error: "Failed to refresh session", 
        message: "Please log in again" 
      }, { status: 401 });
    }

    // Create response with new session cookies
    const response = NextResponse.json({ 
      success: true,
      message: "Session refreshed successfully",
      session: {
        access_token: refreshData.session.access_token,
        expires_at: refreshData.session.expires_at,
        user: refreshData.session.user
      }
    });

    // Set the new session cookies using Supabase's cookie handling
    const supabaseResponse = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set(name, value, options);
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set(name, '', { ...options, maxAge: 0 });
          },
        },
      }
    );

    return response;

  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ 
      error: "Internal server error during token refresh",
      message: "Please try logging in again"
    }, { status: 500 });
  }
}
