import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { jwtVerify } from "jose";
import { limitKey } from "@/lib/rateLimitEdge";

// Force Node.js runtime for middleware to avoid Edge Runtime limitations
export const runtime = 'nodejs';

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/pricing",
  "/reset-password", 
  "/register",
  "/onboarding",
  "/unauthorized",
  "/debug", // Debug page for troubleshooting
  "/api/health",
  "/api/auth/db-login",
  "/api/auth/request-reset", 
  "/api/auth/register",
  "/api/auth/me",
  "/inventory/qr-vehicle-profile", // Public QR vehicle profiles
  "/terms",
  "/privacy",
  "/demo"
];

// Simplified: Direct registration users are owners, subdomain users have different flow
// Only need to protect a few owner-specific routes
const OWNER_ONLY_ROUTES = [
  "/billing",     // Owner-only billing right after account creation
  "/owner"        // Owner-specific admin panel
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => {
    if (path.endsWith("*")) {
      return pathname.startsWith(path.slice(0, -1));
    }
    return pathname === path || pathname.startsWith(path + "/");
  });
}

function getUserFromToken(token: string) {
  try {
    // Simple JWT decode for demo - in production use proper verification
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload;
  } catch {
    return null;
  }
}

function parseJwtCookie(req: NextRequest) {
  const token = req.cookies.get("ghostcrm_jwt")?.value;
  if (!token) {
    console.log("❌ [JWT] No ghostcrm_jwt cookie found");
    return { token: null, user: null };
  }
  
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    console.log("✅ [JWT] Successfully decoded cookie payload:", {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      tenantId: payload.tenantId,
      exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : "no expiry"
    });
    return { token, user: payload };
  } catch (error) {
    console.log("❌ [JWT] Failed to decode cookie:", error);
    return { token, user: null };
  }
}

function parseOwnerSession(req: NextRequest) {
  const ownerToken = req.cookies.get("owner_session")?.value;
  if (!ownerToken) {
    console.log("❌ [OWNER_SESSION] No owner_session cookie found");
    return { token: null, session: null };
  }
  
  try {
    const payload = JSON.parse(
      Buffer.from(ownerToken.split(".")[1], "base64").toString()
    );
    console.log("✅ [OWNER_SESSION] Successfully decoded owner session:", {
      type: payload.type,
      level: payload.level,
      permissions: payload.permissions,
      issued: new Date(payload.issued).toISOString(),
      expires: new Date(payload.expires).toISOString()
    });
    return { 
      token: ownerToken, 
      session: { 
        ...payload, 
        role: 'software_owner',
        isSoftwareOwner: true 
      } 
    };
  } catch (error) {
    console.log("❌ [OWNER_SESSION] Failed to decode owner session:", error);
    return { token: ownerToken, session: null };
  }
}

function isOwnerOnlyRoute(pathname: string): boolean {
  return OWNER_ONLY_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );
}

function canAccessOwnerRoute(role: string, pathname: string, isSoftwareOwner: boolean = false): boolean {
  console.log(`🔍 [OWNER ROUTE CHECK] Path: ${pathname}, Role: ${role}, Software Owner: ${isSoftwareOwner}`);
  
  if (pathname.startsWith('/billing')) {
    // Billing requires owner role AND billing.manage permission
    // For now, assume all owners have billing.manage (set in registration)
    const canAccess = role === "owner";
    console.log(`🔍 [BILLING ACCESS] ${canAccess ? '✅ ALLOWED' : '❌ DENIED'} for role: ${role}`);
    return canAccess;
  }
  
  if (pathname.startsWith('/owner')) {
    // Owner dashboard and related routes require software owner authentication
    const canAccess = isSoftwareOwner && role === "software_owner";
    console.log(`🔍 [SOFTWARE OWNER ACCESS] ${canAccess ? '✅ ALLOWED' : '❌ DENIED'} for role: ${role}, isSoftwareOwner: ${isSoftwareOwner}`);
    return canAccess;
  }
  
  // Other owner routes (legacy)
  const isOwner = role === "owner";
  console.log(`🔍 [OWNER ROUTE CHECK] Is Owner: ${isOwner ? '✅ YES' : '❌ NO'}`);
  return isOwner;
}

// Additional API and static paths
const ADDITIONAL_PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/billing/mock-checkout",
  "/api/billing/create-checkout",
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
  
  console.log(`🚀 [MIDDLEWARE START] ${hostname}${pathname}`);
  
  // Parse both JWT token and owner session
  const { token: jwtToken, user } = parseJwtCookie(req);
  const { token: ownerToken, session: ownerSession } = parseOwnerSession(req);
  
  // Determine authentication status - prioritize owner session for /owner routes
  let hasValidToken: boolean;
  let userRole: string;
  let isSoftwareOwner: boolean = false;
  let authUser: any;
  
  if (pathname.startsWith('/owner') && ownerSession) {
    // Use owner session for owner routes
    hasValidToken = !!ownerSession;
    userRole = ownerSession.role || 'software_owner';
    isSoftwareOwner = ownerSession.isSoftwareOwner || false;
    authUser = ownerSession;
    console.log(`🔑 [AUTH] Using OWNER SESSION for ${pathname}`);
  } else {
    // Use regular JWT for all other routes
    hasValidToken = !!(jwtToken && user);
    userRole = (user?.role as string) || "sales_rep";
    isSoftwareOwner = false;
    authUser = user;
    console.log(`🔑 [AUTH] Using JWT TOKEN for ${pathname}`);
  }
  
  console.log(`🔍 [MIDDLEWARE] Authentication Status:`, {
    pathname,
    hostname,
    hasValidToken,
    userRole,
    userEmail: authUser?.email || 'N/A',
    organizationId: authUser?.organizationId,
    isSoftwareOwner,
    isOwnerOnlyRoute: isOwnerOnlyRoute(pathname),
    canAccess: canAccessOwnerRoute(userRole, pathname, isSoftwareOwner)
  });
  
  // Enhanced debugging for authentication
  console.log("🔍 [MIDDLEWARE DEBUG] Authentication Analysis:", {
    pathname,
    hostname,
    hasJwtCookie: !!jwtToken,
    hasOwnerSession: !!ownerToken,
    jwtCookieLength: jwtToken?.length || 0,
    ownerTokenLength: ownerToken?.length || 0,
    hasUser: !!user,
    userRole,
    isSoftwareOwner,
    organizationId: authUser?.organizationId,
    tenantId: authUser?.tenantId,
    hasValidToken,
    authMethod: pathname.startsWith('/owner') && ownerSession ? 'OWNER_SESSION' : 'JWT_TOKEN',
    cookiePreview: (pathname.startsWith('/owner') && ownerToken ? ownerToken : jwtToken)?.substring(0, 50) + "..." || "none"
  });
  
  // Check if path is public (no authentication required)
  const allPublicPaths = [...PUBLIC_PATHS, ...ADDITIONAL_PUBLIC_PATHS];
  if (isPublicPath(pathname) || allPublicPaths.some(path => pathname.startsWith(path))) {
    // Parse subdomain for tenant identification for existing logic
    const subdomain = getSubdomain(hostname);
    
    // Log cookie status for debugging
    console.log("🍪 [MIDDLEWARE] Cookie check:", {
      hasCookie: !!jwtToken,
      cookieLength: jwtToken?.length || 0,
      hostname: hostname,
      pathname: pathname
    });
    
    const isMarketingSite = isMarketingRequest(hostname, subdomain, hasValidToken);
    
    // Override for specific marketing paths - always treat as marketing regardless of auth
    const marketingPaths = ['/', '/login', '/register', '/pricing', '/demo', '/marketing', '/features', '/about'];
    const isMarketingPath = marketingPaths.some(path => 
      pathname === path || pathname.startsWith(path + '/')
    );
    
    const finalIsMarketing = isMarketingPath ? true : isMarketingSite;
    
    // Determine if this is a tenant request
    let hasTenant = false;
    if (hostname.includes('localhost')) {
      // For localhost, check if user has tenant info in JWT
      hasTenant = !!(user?.organizationId || user?.tenantId);
    } else {
      // For production/Vercel, authenticated users on any domain are tenant users
      hasTenant = hasValidToken;
    }
    
    console.log(`🔍 Middleware: ${hostname} | Subdomain: ${subdomain} | Path: ${pathname} | Marketing: ${finalIsMarketing} | Tenant: ${!finalIsMarketing}`);

    // Simple owner-only route protection
    if (hasValidToken && isOwnerOnlyRoute(pathname) && !canAccessOwnerRoute(userRole, pathname, isSoftwareOwner)) {
      console.log(`❌ [ACCESS DENIED] Owner-only route ${pathname} blocked for role: ${userRole}, isSoftwareOwner: ${isSoftwareOwner}`);
      const url = req.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.rewrite(url);
    }

    // Handle marketing site routing
    if (finalIsMarketing) {
      return handleMarketingRequest(req, pathname);
    }
    
    // Handle tenant site routing  
    if (hasTenant && subdomain) {
      return handleTenantRequest(req, pathname, subdomain);
    }
    
    return NextResponse.next();
  }

  // For localhost development, use JWT auth check
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    if (!hasValidToken) {
      // Redirect to login if no auth token
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Simple owner-only route protection for localhost
    if (isOwnerOnlyRoute(pathname) && !canAccessOwnerRoute(userRole, pathname)) {
      console.log(`❌ [LOCALHOST ACCESS DENIED] Owner-only route ${pathname} blocked for role: ${userRole}`);
      const url = req.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.rewrite(url);
    }

    // For development, allow access if JWT token exists and role is allowed
    return NextResponse.next();
  }

  // For production/Vercel domains, handle authenticated users properly
  if (hasValidToken) {
    // Simple owner-only route protection for production
    if (isOwnerOnlyRoute(pathname) && !canAccessOwnerRoute(userRole, pathname)) {
      console.log(`❌ [PRODUCTION ACCESS DENIED] Owner-only route ${pathname} blocked for role: ${userRole}`);
      const url = req.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.rewrite(url);
    }
    
    const subdomain = getSubdomain(hostname) || 
      (hostname.includes("vercel.app") ? hostname.split(".")[0] : null) ||
      (hostname.includes("ghostcrm.ai") ? hostname.split(".")[0] : null);
    const tenantId = subdomain || "default";
    return handleTenantRequest(req, pathname, tenantId);
  }

  // For production, use the original JWT-based auth for unauthenticated users
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

function isMarketingRequest(hostname: string, subdomain: string | null, hasValidToken: boolean = false): boolean {
  // For Vercel deployments, check if this is a marketing page vs app page
  if (hostname.includes('vercel.app')) {
    // Marketing pages should always be marketing regardless of auth status
    const marketingPaths = ['/', '/login', '/register', '/pricing', '/demo', '/marketing', '/features', '/about'];
    // If we're on a marketing path, always treat as marketing
    // This will be checked in the main middleware function
    return !hasValidToken; // Default logic for non-marketing paths
  }
  
  // For localhost, if user has valid token, treat as tenant request
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return !hasValidToken; // If has valid token = tenant, no token = marketing
  }
  
  // Production domain handling for ghostcrm.ai
  // Main domain or www subdomain = marketing site
  return !subdomain || 
         subdomain === 'www' || 
         hostname === 'ghostcrm.ai' ||
         hostname === 'www.ghostcrm.ai' ||
         hostname === 'ghostdefenses.com' ||
         hostname === 'www.ghostdefenses.com';
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
  
  // Homepage - allow it to be served normally
  if (pathname === '/' || pathname === '') {
    return NextResponse.next();
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
  
  // Allow other marketing paths to continue
  return NextResponse.next();
}

function handleTenantRequest(req: NextRequest, pathname: string, tenantId: string): NextResponse {
  console.log("🏢 [TENANT REQUEST] Handling tenant request:", {
    pathname,
    tenantId,
    routeType: pathname === '/billing' ? 'billing-root-level' : 'app-route-group'
  });
  
  // Add tenant context to headers
  const response = NextResponse.next();
  response.headers.set('x-tenant-id', tenantId);
  response.headers.set('x-tenant-slug', tenantId);
  
  // Rewrite to app route group if accessing root paths
  if (pathname === '/' || pathname === '') {
    const url = req.nextUrl.clone();
    url.pathname = '/(app)/dashboard';
    console.log("🏢 [TENANT REQUEST] Rewriting root to dashboard:", url.pathname);
    return NextResponse.rewrite(url);
  }
  
  // Billing page is now at root level - allow natural routing
  if (pathname === '/billing' || pathname.startsWith('/billing/')) {
    console.log("🏢 [TENANT REQUEST] Processing billing route - allowing natural routing");
    const tenantResponse = NextResponse.next();
    tenantResponse.headers.set('x-tenant-id', tenantId);
    tenantResponse.headers.set('x-tenant-slug', tenantId);
    return tenantResponse;
  }
  
  // For tenant sites, ensure we're in the app route group
  if (!pathname.startsWith('/(app)') && 
      !pathname.startsWith('/(business)') &&
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
  // Apply rate limiting to sensitive endpoints
  if (pathname.startsWith('/api/auth/')) {
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateKey = `auth:${clientIP}`;
    
    const rateResult = await limitKey(rateKey);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Too many authentication requests. Please try again later." }, 
        { status: 429 }
      );
    }
  }

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
