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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
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
