import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { jwtVerify } from "jose";
import { limitKey } from "@/lib/rateLimitEdge";

// Force Node.js runtime for middleware to avoid Edge Runtime limitations
export const runtime = 'nodejs';

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/reset-password", 
  "/register",
  "/onboarding",
  "/api/health",
  "/api/auth/db-login",
  "/api/auth/request-reset", 
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/logout",
  "/_next",
  "/favicon.ico",
  "/icon.svg"
];

// Marketing site public paths  
const MARKETING_PATHS = [
  "/marketing",
  "/marketing/features",
  "/marketing/pricing", 
  "/marketing/about"
];

// Shared public paths (outside route groups)
const SHARED_PATHS = [
  "/", 
  "/login",
  "/register", 
  "/reset-password"
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host') || '';
  
  // Parse subdomain for tenant identification
  const subdomain = getSubdomain(hostname);
  const isMarketingSite = isMarketingRequest(hostname, subdomain);
  const isTenantSite = !isMarketingSite && subdomain && subdomain !== 'www';
  
  console.log(`🔍 Middleware: ${hostname} | Subdomain: ${subdomain} | Path: ${pathname} | Marketing: ${isMarketingSite} | Tenant: ${isTenantSite}`);

  // Handle marketing site routing
  if (isMarketingSite) {
    return handleMarketingRequest(req, pathname);
  }
  
  // Handle tenant site routing  
  if (isTenantSite) {
    return handleTenantRequest(req, pathname, subdomain);
  }
  
  // Fallback to existing auth logic for other requests
  return await handleDefaultRequest(req, pathname);
}

// Helper functions for tenant routing
function getSubdomain(hostname: string): string | null {
  // Handle localhost development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return null; // No subdomain in local development
  }
  
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts[0];
  }
  return null;
}

function isMarketingRequest(hostname: string, subdomain: string | null): boolean {
  // Main domain or www subdomain = marketing site
  return !subdomain || 
         subdomain === 'www' || 
         hostname === 'ghostautocrm.com' ||
         hostname === 'www.ghostautocrm.com' ||
         hostname.includes('localhost'); // Local development = marketing
}

function handleMarketingRequest(req: NextRequest, pathname: string): NextResponse {
  // Handle shared paths (login, register, etc.) - these are outside route groups
  if (SHARED_PATHS.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Block tenant-specific API calls on marketing site (they should return 404)
  if (pathname.startsWith('/api/tenant/') || 
      pathname.startsWith('/api/dashboard/') ||
      pathname.startsWith('/api/leads/') ||
      pathname.startsWith('/api/deals/') ||
      pathname.startsWith('/api/collab/')) {
    return NextResponse.json(
      { error: "API not available on marketing site" },
      { status: 404 }
    );
  }
  
  // Handle Next.js internal paths and allowed API routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api/health') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/contact')) {
    return NextResponse.next();
  }
  
  // Homepage - rewrite to marketing folder
  if (pathname === '/' || pathname === '') {
    const url = req.nextUrl.clone();
    url.pathname = '/marketing';
    return NextResponse.rewrite(url);
  }
  
  // Handle individual marketing pages
  if (pathname === '/features') {
    const url = req.nextUrl.clone();
    url.pathname = '/marketing/features';
    return NextResponse.rewrite(url);
  }
  
  if (pathname === '/pricing') {
    const url = req.nextUrl.clone();
    url.pathname = '/marketing/pricing';
    return NextResponse.rewrite(url);
  }
  
  if (pathname === '/about') {
    const url = req.nextUrl.clone();
    url.pathname = '/marketing/about';
    return NextResponse.rewrite(url);
  }
  
  // For other paths, redirect to homepage
  return NextResponse.redirect(new URL('/', req.url));
}

function handleTenantRequest(req: NextRequest, pathname: string, tenantId: string): NextResponse {
  // Add tenant context to headers
  const response = NextResponse.next();
  response.headers.set('x-tenant-id', tenantId);
  response.headers.set('x-tenant-slug', tenantId);
  
  // Rewrite to app route group if accessing root paths
  if (pathname === '/' || pathname === '') {
    const url = req.nextUrl.clone();
    url.pathname = '/(app)/dashboard';
    return NextResponse.rewrite(url);
  }
  
  // For tenant sites, ensure we're in the app route group
  if (!pathname.startsWith('/(app)') && 
      !pathname.startsWith('/_next') && 
      !pathname.startsWith('/api') &&
      !pathname.startsWith('/login')) {
    const url = req.nextUrl.clone();
    url.pathname = `/(app)${pathname}`;
    const tenantResponse = NextResponse.rewrite(url);
    tenantResponse.headers.set('x-tenant-id', tenantId);
    tenantResponse.headers.set('x-tenant-slug', tenantId);
    return tenantResponse;
  }
  
  return response;
}

async function handleDefaultRequest(req: NextRequest, pathname: string): Promise<NextResponse> {
  // Allow public paths and API routes during build
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  const token = req.cookies.get("ghostcrm_jwt")?.value;
  
  if (!token) {
    // Redirect to login for unauthenticated users
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // For development/build environments, allow access if JWT exists
  // In production, you'd verify the JWT here
  try {
    if (process.env.JWT_SECRET) {
      // Only verify JWT if secret is available (not during build)
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
    }
  } catch (error) {
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let res = NextResponse.next();
  
  // Only initialize Supabase if environment variables are available
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (cs) => {
            res = NextResponse.next();
            cs.forEach(c => res.cookies.set(c.name, c.value, c.options));
          },
        },
      }
    );
    try {
      await supabase.auth.getSession(); // refresh if needed
    } catch (error) {
      console.warn("Supabase session refresh failed during middleware:", error);
    }
  }

  // Security headers removed
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  return res;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.*).*)"],
};
