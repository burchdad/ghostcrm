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
  "/login-owner",     // Tenant owner login (public)
  "/login-admin",     // Tenant admin login (public)
  "/login-salesmanager",  // Tenant sales manager login (public)
  "/login-salesrep",  // Tenant sales rep login (public)
  "/pricing",
  "/billing",         // Public billing page for plan selection (pre-auth)
  "/reset-password", 
  "/register",
  "/unauthorized",
  "/debug", // Debug page for troubleshooting
  "/api/health",
  "/api/auth/login",      // Login API endpoint (public)
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
  "/tenant-owner",    // Tenant owner routes (post-auth)
  "/owner",           // Owner-specific admin panel
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
    return { token: null, user: null };
  }
  
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    return { token, user: payload };
  } catch (error) {
    return { token, user: null };
  }
}

function parseOwnerSession(req: NextRequest) {
  const ownerToken = req.cookies.get("owner_session")?.value;
  if (!ownerToken) {
    return { token: null, session: null };
  }
  
  try {
    const payload = JSON.parse(
      Buffer.from(ownerToken.split(".")[1], "base64").toString()
    );
    return { token: ownerToken, session: payload };
  } catch (error) {
    return { token: ownerToken, session: null };
  }
}
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
    return { token: ownerToken, session: null };
  }
}

function isOwnerOnlyRoute(pathname: string): boolean {
  return OWNER_ONLY_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );
}

function canAccessOwnerRoute(role: string, pathname: string, isSoftwareOwner: boolean = false): boolean {
  
  
  if (pathname.startsWith('/tenant-owner')) {
    // Tenant owner routes require owner role
    const canAccess = role === "owner";

    return canAccess;
  }
  
  if (pathname.startsWith('/owner')) {
    // Owner dashboard and related routes require software owner authentication
    const canAccess = isSoftwareOwner && role === "software_owner";

    return canAccess;
  }
  
  // Other owner routes (legacy)
  const isOwner = role === "owner";

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

// Role-specific login paths (public access for all subdomains)
const ROLE_LOGIN_PATHS = [
  "/login-owner",
  "/login-admin", 
  "/login-salesmanager", 
  "/login-salesrep"
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // 🎯 CRITICAL: Always bypass auth/marketing logic for Telnyx webhooks
  if (pathname.startsWith("/api/voice/telnyx/")) {
    console.log(`🎯 [TELNYX-BYPASS] Allowing direct access to: ${pathname}`);
    return NextResponse.next();
  }
  
  const hostname = req.headers.get('host') || '';
  
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
  } else {
    // Use regular JWT for all other routes
    hasValidToken = !!(jwtToken && user);
    userRole = (user?.role as string) || "visitor";
    isSoftwareOwner = false;
    authUser = user;
  }
  

  
  // Check if path is public (no authentication required)
  const allPublicPaths = [...PUBLIC_PATHS, ...ADDITIONAL_PUBLIC_PATHS];
  if (isPublicPath(pathname) || allPublicPaths.some(path => pathname.startsWith(path))) {
    // Parse subdomain for tenant identification for existing logic
    const subdomain = getSubdomain(hostname);
    
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
      // For localhost, if there's a subdomain, it's a tenant request regardless of auth status
      // This allows login/auth endpoints to work on tenant subdomains
      hasTenant = !!subdomain;

    } else {
      // For production/Vercel, authenticated users on any domain are tenant users
      // For unauthenticated requests, check if subdomain exists for tenant routing
      hasTenant = hasValidToken || !!subdomain;
      console.log(`🌐 [PRODUCTION TENANT LOGIC] hasValidToken: ${hasValidToken}, subdomain: ${subdomain}, hasTenant: ${hasTenant}`);
    }
    




    // Simple owner-only route protection
    if (hasValidToken && isOwnerOnlyRoute(pathname) && !canAccessOwnerRoute(userRole, pathname, isSoftwareOwner)) {

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

      return handleTenantRequest(req, pathname, subdomain, userRole);
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
    return handleTenantRequest(req, pathname, tenantId, userRole);
  }

  // For production, use the original JWT-based auth for unauthenticated users
  return await handleDefaultRequest(req, pathname);
}

// Helper functions for tenant routing
function getSubdomain(hostname: string): string | null {
  // Handle localhost development - extract subdomain from hostname like "burch-enterprises.localhost:3000"
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== '127') {
      // Extract subdomain like "burch-enterprises" from "burch-enterprises.localhost:3000"
      return parts[0];
    }
    return null; // Pure localhost without subdomain
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
  
  // For localhost development, check if there's a subdomain
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // If there's a subdomain (like burch-enterprises.localhost), treat as tenant
    // If no subdomain (just localhost), treat as marketing
    return !subdomain;
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
  
  // Handle role-specific login paths - allow access on any subdomain
  if (ROLE_LOGIN_PATHS.includes(pathname)) {
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

function handleTenantRequest(req: NextRequest, pathname: string, tenantId: string, userRole: string = 'sales_rep'): NextResponse {
  console.log("🏢 [TENANT REQUEST] Handling tenant request:", {
    pathname,
    tenantId,
    routeType: pathname === '/billing' ? 'billing-root-level' : 'app-route-group'
  });
  
  console.log("🚨 [DEBUG] API AUTH CHECK:", {
    pathname,
    isApiAuth: pathname.startsWith('/api/auth/'),
    isHealth: pathname.startsWith('/api/health'),
    isNext: pathname.startsWith('/_next')
  });
  
  // Allow API auth routes to pass through for login functionality
  if (pathname.startsWith('/api/auth/') || 
      pathname.startsWith('/api/health') ||
      pathname.startsWith('/_next')) {
    console.log("🏢 [TENANT REQUEST] ✅ ALLOWING API/system route:", pathname);
    const response = NextResponse.next();
    response.headers.set('x-tenant-id', tenantId);
    response.headers.set('x-tenant-slug', tenantId);
    return response;
  }
  
  // Add tenant context to headers
  const response = NextResponse.next();
  response.headers.set('x-tenant-id', tenantId);
  response.headers.set('x-tenant-slug', tenantId);

  // Handle role-specific login pages - allow them to pass through naturally
  if (ROLE_LOGIN_PATHS.includes(pathname)) {
    console.log("🏢 [TENANT REQUEST] Processing role-specific login page - allowing natural routing");
    const roleLoginResponse = NextResponse.next();
    roleLoginResponse.headers.set('x-tenant-id', tenantId);
    roleLoginResponse.headers.set('x-tenant-slug', tenantId);
    return roleLoginResponse;
  }

  // Track login page access for proper dashboard routing
  if (pathname === '/login-owner') {
    const response = NextResponse.next();
    response.cookies.set('login_intent', 'tenant-owner', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 300 // 5 minutes
    });
    return response;
  }
  
  if (pathname === '/login-admin') {
    const response = NextResponse.next();
    response.cookies.set('login_intent', 'tenant-admin', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 300 // 5 minutes
    });
    return response;
  }
  
  if (pathname === '/login-salesmanager') {
    const response = NextResponse.next();
    response.cookies.set('login_intent', 'tenant-salesmanager', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 300 // 5 minutes
    });
    return response;
  }
  
  if (pathname === '/login-salesrep') {
    const response = NextResponse.next();
    response.cookies.set('login_intent', 'tenant-salesrep', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 300 // 5 minutes
    });
    return response;
  }

  // Redirect authenticated users to appropriate dashboard if accessing root paths
  if (pathname === '/' || pathname === '') {
    const url = req.nextUrl.clone();
    
    // Check login intent cookie to determine correct dashboard
    const loginIntent = req.cookies.get('login_intent')?.value;
    
    if (loginIntent) {
      switch (loginIntent) {
        case 'tenant-owner':
          url.pathname = '/tenant-owner/dashboard';
          console.log("🏢 [TENANT REQUEST] Redirecting based on login intent (owner) to:", url.pathname);
          break;
        case 'tenant-admin':
          // Admin goes to main dashboard for now (until we create tenant-admin/dashboard)
          url.pathname = '/dashboard';
          console.log("🏢 [TENANT REQUEST] Redirecting based on login intent (admin) to:", url.pathname);
          break;
        case 'tenant-salesmanager':
          // Sales manager goes to their leads page since that's what exists
          url.pathname = '/tenant-salesmanager/leads';
          console.log("🏢 [TENANT REQUEST] Redirecting based on login intent (salesmanager) to:", url.pathname);
          break;
        case 'tenant-salesrep':
          // Sales rep goes to their leads page since that's what exists
          url.pathname = '/tenant-salesrep/leads';
          console.log("🏢 [TENANT REQUEST] Redirecting based on login intent (salesrep) to:", url.pathname);
          break;
        default:
          url.pathname = '/dashboard';
          console.log("🏢 [TENANT REQUEST] Redirecting to default dashboard:", url.pathname);
      }
      
      // Clear the login intent cookie after use
      const response = NextResponse.redirect(url);
      response.cookies.delete('login_intent');
      return response;
    } else {
      // Fallback to role-based routing if no login intent
      if (userRole === 'owner') {
        url.pathname = '/tenant-owner/dashboard';
        console.log("🏢 [TENANT REQUEST] Fallback: Redirecting authenticated owner to tenant dashboard:", url.pathname);
      } else {
        url.pathname = '/dashboard';
        console.log("🏢 [TENANT REQUEST] Fallback: Redirecting authenticated user to dashboard:", url.pathname);
      }
      return NextResponse.redirect(url);
    }
  }

  // Billing page is now at root level - allow natural routing
  if (pathname === '/billing' || pathname.startsWith('/billing/')) {
    console.log("🏢 [TENANT REQUEST] Processing billing route - allowing natural routing");
    const tenantResponse = NextResponse.next();
    tenantResponse.headers.set('x-tenant-id', tenantId);
    tenantResponse.headers.set('x-tenant-slug', tenantId);
    return tenantResponse;
  }

  // For most routes, just pass through with tenant headers - let Next.js handle routing naturally
  console.log(`🏢 [TENANT REQUEST] Allowing natural routing for ${pathname}`);
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
