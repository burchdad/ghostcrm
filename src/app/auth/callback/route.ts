import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const rawNext = requestUrl.searchParams.get('next') || '/'
  
  // Sanitize next parameter to prevent open redirects
  const safeNext = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  // 🎯 Handle Supabase verification errors
  if (error) {
    console.error('[AUTH CALLBACK] Supabase returned error:', error)
    
    // Check for specific error types and provide appropriate redirects
    if (error === 'invalid_verification') {
      // This might be a fragment-based flow, redirect to a client-side handler
      return NextResponse.redirect(new URL('/auth/verify-callback', requestUrl.origin))
    }
    
    return NextResponse.redirect(new URL(`/login?error=${error}`, requestUrl.origin))
  }

  if (!code) {
    // No code parameter - might be implicit flow with fragments
    // Redirect to client-side handler that can access fragments
    return NextResponse.redirect(new URL('/auth/verify-callback', requestUrl.origin))
  }

  // Dynamic domain detection
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  const isGhostDomain = host === "ghostcrm.ai" || host.endsWith(".ghostcrm.ai");
  const isProduction = process.env.NODE_ENV === "production";

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Ensure proper cookie domain scoping for production
            const cookieOptions = {
              ...options,
              ...(isGhostDomain && isProduction && {
                domain: ".ghostcrm.ai",
                secure: true,
                sameSite: "lax" as const
              })
            };
            cookieStore.set(name, value, cookieOptions);
          });
        },
      },
    }
  )

  try {
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    const user = data?.user

    if (error || !user) {
      console.error('❌ [AUTH CALLBACK] Code exchange failed:', error)
      return NextResponse.redirect(new URL('/login?error=verification_failed', requestUrl.origin))
    }

    console.log('[AUTH CALLBACK] User verified successfully:', { 
      userId: user.id, 
      email: user.email,
      emailConfirmed: !!user.email_confirmed_at 
    });

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id, organization_id')
      .eq('id', user.id)
      .maybeSingle()

    if (userError) {
      console.error('❌ [AUTH CALLBACK] User lookup failed:', userError)
      return NextResponse.redirect(new URL('/login?error=user_lookup_failed', requestUrl.origin))
    }

    // 🎯 NEW USERS (no organization) should go to billing to select plan
    if (!userData?.organization_id) {
      console.log('[AUTH CALLBACK] New user without organization, redirecting to billing');
      const billingUrl = new URL("/billing", requestUrl.origin);
      billingUrl.searchParams.set("welcome", "true");
      return NextResponse.redirect(billingUrl);
    }

    // 🎯 EXISTING USERS with organization - check for active subdomain
    if (userData?.organization_id) {
      const { data: subdomainData, error: subdomainError } = await supabase
        .from('subdomains')
        .select('subdomain, status')
        .eq('organization_id', userData.organization_id)
        .eq('status', 'active') // Only get active subdomains
        .maybeSingle()

      if (subdomainError) {
        console.error('❌ [AUTH CALLBACK] Subdomain lookup failed:', subdomainError)
        // Continue to fallback - don't fail the whole auth flow
      }

      // Only redirect to subdomain if it exists, is active, and we're on ghost domain
      if (subdomainData?.subdomain && isGhostDomain) {
        const target = new URL(requestUrl.origin);
        target.host = `${subdomainData.subdomain}.ghostcrm.ai`;
        target.pathname = "/dashboard";
        target.searchParams.set("verified", "true");
        if (safeNext !== "/") {
          target.searchParams.set("next", safeNext);
        }
        return NextResponse.redirect(target);
      }
    }

    // Fallback: redirect to current domain with verified flag
    const fallbackUrl = new URL("/login", requestUrl.origin);
    fallbackUrl.searchParams.set("verified", "true");
    if (safeNext !== "/") {
      fallbackUrl.searchParams.set("next", safeNext);
    }
    return NextResponse.redirect(fallbackUrl);
  } catch (error) {
    console.error('❌ [AUTH CALLBACK] Unexpected error:', error)
    return NextResponse.redirect(new URL('/login?error=unexpected', requestUrl.origin))
  }
}