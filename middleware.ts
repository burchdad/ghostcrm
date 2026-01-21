import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Helper to copy all cookies from one response to another (preserves all attributes)
function copyCookies(from: NextResponse, to: NextResponse) {
  for (const c of from.cookies.getAll()) {
    to.cookies.set(c);
  }
  return to;
}

// Helper to preserve cookies across redirects (critical for Supabase SSR)
function redirectWithCookies(response: NextResponse, url: string | URL) {
  return copyCookies(response, NextResponse.redirect(url));
}

// Helper to preserve cookies across rewrites
function rewriteWithCookies(response: NextResponse, url: string | URL) {
  return copyCookies(response, NextResponse.rewrite(url));
}

// Debug logging helper
function debugLog(message: string, ...args: any[]) {
  if (process.env.MW_DEBUG === "true") {
    console.log(message, ...args);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const hostHeader = request.headers.get("host") || "";
  const host = hostHeader.split(":")[0]; // Normalize to remove port
  const pathname = request.nextUrl.pathname;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const isProd = process.env.NODE_ENV === "production";
  const cookieDomain =
    isProd && (host === "ghostcrm.ai" || host.endsWith(".ghostcrm.ai"))
      ? ".ghostcrm.ai"
      : undefined;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              domain: cookieDomain,
              secure: isProd ? true : options.secure,
              sameSite: options.sameSite ?? "lax",
            });
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  debugLog('🍪 [MIDDLEWARE] Host:', host, 'Pathname:', pathname);
  debugLog('👤 [MIDDLEWARE] User:', user?.id ?? 'null', 'Email verified:', user?.email_confirmed_at ? 'yes' : 'no');

  const subdomain = extractSubdomain(host);

  if (subdomain) {
    return await handleSubdomainRouting(request, response, subdomain, user, supabase);
  }

  return await handleMainDomainRouting(request, response, pathname, user, supabase);
}

function extractSubdomain(host: string): string | null {
  // dev
  if (host.includes("localhost") || host.includes("127.0.0.1")) return null;

  // remove port
  const cleanHost = host.split(":")[0];
  const parts = cleanHost.split(".");

  // ghostcrm.ai or www.ghostcrm.ai
  if (parts.length === 2) return null;
  if (parts.length === 3 && parts[0] === "www") return null;

  // {subdomain}.ghostcrm.ai
  if (parts.length === 3 && parts[1] === "ghostcrm" && parts[2] === "ai") {
    return parts[0];
  }

  return null;
}

async function handleSubdomainRouting(
  request: NextRequest,
  response: NextResponse,
  subdomain: string,
  user: any,
  supabase: any
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  debugLog(`🏢 [MIDDLEWARE] Subdomain routing: ${subdomain}${pathname}`);

  // 🚨 FIX 1: Prevent rewrite loop for tenant-not-found
  if (pathname.startsWith("/tenant-not-found")) {
    return response;
  }

  // 🚨 FIX 2: Check public paths BEFORE doing DB lookup
  const publicPaths = ["/login", "/register", "/about", "/pricing", "/tenant-not-found"];
  if (publicPaths.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    debugLog('📖 [MIDDLEWARE] Public tenant path - allowing access');
    return response;
  }

  // 🌐 Check if subdomain exists and is active
  let subdomainData = null;
  try {
    const { data } = await supabase
      .from('subdomains')
      .select('id, status, organization_id, organization_name')
      .eq('subdomain', subdomain)
      .eq('status', 'active') // Only active subdomains are accessible
      .maybeSingle();
    
    subdomainData = data;
  } catch (error) {
    debugLog('⚠️ [MIDDLEWARE] Error fetching subdomain:', error);
  }

  // 🚫 Subdomain not found or not active
  if (!subdomainData) {
    debugLog('❌ [MIDDLEWARE] Subdomain not found or inactive:', subdomain);
    // Show tenant-not-found page instead of redirecting
    return rewriteWithCookies(response, new URL('/tenant-not-found', request.url));
  }

  // 🎯 User must be authenticated for protected paths
  if (!user) {
    debugLog('❌ [MIDDLEWARE] No user - redirecting to subdomain login');
    const loginUrl = new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url);
    return redirectWithCookies(response, loginUrl);
  }

  // 🔒 Check if user is a member of this organization
  try {
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('id, role, status')
      .eq('user_id', user.id)
      .eq('organization_id', subdomainData.organization_id)
      .eq('status', 'active')
      .maybeSingle();

    if (!membership) {
      debugLog('❌ [MIDDLEWARE] User not member of organization:', user.id, subdomainData.organization_id);
      // Redirect to main domain login (not tenant login)
      return redirectWithCookies(response, new URL('https://ghostcrm.ai/login', request.url));
    }

    debugLog('✅ [MIDDLEWARE] User authorized for subdomain:', user.id, 'Role:', membership.role);
  } catch (membershipError) {
    debugLog('⚠️ [MIDDLEWARE] Membership validation error:', membershipError);
    // Fail-safe: redirect to main domain login
    return redirectWithCookies(response, new URL('https://ghostcrm.ai/login', request.url));
  }

  // ✅ All checks passed
  debugLog('✅ [MIDDLEWARE] Allowing subdomain access');
  return response;
}

async function handleMainDomainRouting(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
  user: any,
  supabase: any
): Promise<NextResponse> {
  debugLog(`🏠 [MIDDLEWARE] Main domain routing: ${pathname}`);
  
  // Always allow these public/api endpoints
  const alwaysAllowedPaths = [
    "/api/", // All API routes
    "/verify-email", 
    "/forgot-password", 
    "/reset-password",
    "/favicon.ico", 
    "/robots.txt", 
    "/sitemap.xml"
  ];
  
  if (alwaysAllowedPaths.some(path => pathname.startsWith(path))) {
    return response;
  }

  // 🎯 STATE A: Unverified user
  if (!user) {
    const publicPaths = ["/", "/login", "/register"];
    if (publicPaths.some(p => pathname === p || pathname.startsWith(p + "/"))) {
      return response; // Allow access
    }
    
    // Redirect to login for protected paths
    debugLog('❌ [MIDDLEWARE] Unauthenticated - redirecting to login');
    return redirectWithCookies(response, new URL('/login', request.url));
  }

  // 🎯 STATE A: Authenticated but email not verified
  if (!user.email_confirmed_at) {
    const allowedPaths = ["/verify-email", "/login", "/register"];
    if (allowedPaths.some(p => pathname === p || pathname.startsWith(p + "/"))) {
      return response;
    }
    
    debugLog('📧 [MIDDLEWARE] Email not verified - redirecting to verify-email');
    return redirectWithCookies(response, new URL('/verify-email', request.url));
  }

  // 🎯 Get user tenant status for STATE B/C determination
  let userTenantId = null;
  try {
    const { data: userData } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .maybeSingle();
    
    userTenantId = userData?.tenant_id;
    debugLog('🏢 [MIDDLEWARE] User tenant_id:', userTenantId ?? 'null');
  } catch (error) {
    debugLog('⚠️ [MIDDLEWARE] Error fetching user tenant:', error);
  }

  // 🎯 STATE B: Verified, unpaid (tenant_id is null)
  if (!userTenantId) {
    const allowedPaths = ["/billing", "/account", "/logout"];
    if (allowedPaths.some(path => pathname.startsWith(path))) {
      return response; // Allow billing flow
    }
    
    // Redirect to billing for all other paths
    debugLog('💳 [MIDDLEWARE] No tenant - redirecting to billing');
    return redirectWithCookies(response, new URL('/billing', request.url));
  }

  // 🎯 STATE C: Paid + provisioned (tenant_id exists)
  // 🚨 FIX 3: Allow certain main-domain routes even in State C
  const stateCAllowed = ["/logout", "/account", "/billing/success", "/billing/cancel"];
  if (stateCAllowed.some(p => pathname.startsWith(p))) {
    return response;
  }

  // Get their subdomain and redirect them there
  try {
    const { data: orgData } = await supabase
      .from('organizations')
      .select('subdomain')
      .eq('id', userTenantId)
      .eq('status', 'active')
      .maybeSingle();
    
    if (orgData?.subdomain) {
      const subdomainUrl = `https://${orgData.subdomain}.ghostcrm.ai`;
      debugLog('🚀 [MIDDLEWARE] Redirecting to tenant subdomain:', subdomainUrl);
      return redirectWithCookies(response, new URL(subdomainUrl));
    }
  } catch (error) {
    debugLog('⚠️ [MIDDLEWARE] Error fetching org subdomain:', error);
  }

  // Fallback: allow access to main domain
  debugLog('✅ [MIDDLEWARE] Allowing main domain access');
  return response;
}
