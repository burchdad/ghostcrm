import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const isProd = process.env.NODE_ENV === "production";
  const cookieDomain =
    isProd && host.endsWith(".ghostcrm.ai") ? ".ghostcrm.ai" : undefined;

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
              // Supabase cookies should be secure in prod
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

  // 🔍 Debug logs for troubleshooting auth flow
  console.log('🍪 [MIDDLEWARE] Cookies incoming:', request.cookies.getAll().map(c => c.name).join(', ') || 'none');
  console.log('👤 [MIDDLEWARE] User authenticated:', user?.id ?? 'null');
  console.log('🌐 [MIDDLEWARE] Host:', host, 'Pathname:', pathname);

  const subdomain = extractSubdomain(host);

  if (subdomain) {
    return await handleSubdomainRouting(request, response, subdomain, user, supabase);
  }

  return await handleMainDomainRouting(request, response, pathname, user);
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

// NOTE: These are placeholders — keep your existing implementations
async function handleSubdomainRouting(
  request: NextRequest,
  response: NextResponse,
  subdomain: string,
  user: any,
  supabase: any
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  console.log(`🏢 [MIDDLEWARE] Subdomain routing: ${subdomain}${pathname}`);

  // Public tenant pages
  const publicPaths = ["/login", "/register", "/about", "/pricing"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    console.log('📖 [MIDDLEWARE] Public path - allowing access');
    return response;
  }

  if (!user) {
    console.log('❌ [MIDDLEWARE] No user - redirecting to login');
    // Create redirect response and preserve any cookies that were set
    const redirectUrl = new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    
    // Copy any cookies that were set during auth check
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    
    return redirectResponse;
  }

  // Basic subdomain validation - allow 'pending' status for new users
  try {
    const { data: subdomainData } = await supabase
      .from('subdomains')
      .select('id, status, organization_id')
      .eq('subdomain', subdomain)
      .in('status', ['active', 'pending']) // 🎯 Allow pending for new registrations
      .single();
    
    if (!subdomainData) {
      console.log('❌ [MIDDLEWARE] Subdomain not found or inactive:', subdomain);
      const redirectResponse = NextResponse.redirect(new URL('/', request.url));
      response.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }
    
    console.log('✅ [MIDDLEWARE] Subdomain validated:', subdomain, 'Status:', subdomainData.status);
  } catch (error) {
    console.warn('⚠️ [MIDDLEWARE] Subdomain validation error:', error);
    // Allow access on validation errors to avoid blocking users
  }

  // Let the app routes handle detailed tenant membership validation
  console.log('✅ [MIDDLEWARE] Allowing subdomain access');
  return response;
}

async function handleMainDomainRouting(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
  user: any
): Promise<NextResponse> {
  console.log(`🏠 [MIDDLEWARE] Main domain routing: ${pathname}`);
  
  // Redirect authenticated users from landing/login to their account area
  if (user && (pathname === "/" || pathname === "/login")) {
    console.log('✅ [MIDDLEWARE] Authenticated user on public page - redirecting to billing');
    const redirectResponse = NextResponse.redirect(new URL("/billing", request.url));
    
    // Copy any cookies that were set during auth check
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    
    return redirectResponse;
  }

  console.log('✅ [MIDDLEWARE] Allowing main domain access');
  return response;
}
