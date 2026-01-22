import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log('🔐 [LOGIN] Attempting login for:', String(email).toLowerCase().trim());
    
    const cookieStore = cookies();

    // Capture cookies Supabase wants to set during auth
    let pendingCookies: Array<{ name: string; value: string; options: any }> = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            pendingCookies = cookiesToSet.map(({ name, value, options }) => ({
              name,
              value,
              options,
            }));
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).toLowerCase().trim(),
      password: String(password),
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }

    const user = data?.user;
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 401 });
    }

    // 🎯 CHECK EMAIL VERIFICATION - Block unverified users
    if (!user.email_confirmed_at) {
      console.log('[LOGIN] Blocking unverified user:', user.email);
      return NextResponse.json({ 
        success: false, 
        error: "Please verify your email address before signing in. Check your email for the verification link.",
        code: "email_not_verified",
        email: user.email
      }, { status: 403 });
    }

    console.log('[LOGIN] Email verified user logged in successfully:', {
      userId: user.id,
      email: user.email,
      emailConfirmed: !!user.email_confirmed_at
    });

    // Build the REAL response now (JSON body), then apply cookies to it
    const res = NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
    });

    pendingCookies.forEach(({ name, value, options }) => {
      const cookieOptions = {
        ...options,
        domain: process.env.NODE_ENV === "production" ? ".ghostcrm.ai" : options.domain,
      };
      res.cookies.set(name, value, cookieOptions);
      
      // 🔍 Debug log for cookie setting
      console.log(`🍪 [LOGIN] Setting cookie: ${name}, Domain: ${cookieOptions.domain || 'default'}`);
    });

    return res;
  } catch (e: any) {
    // This will show up in Vercel logs
    console.error("[api/auth/login] ERROR:", e);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
