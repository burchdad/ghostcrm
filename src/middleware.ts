import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { rateLimit } from "@/lib/rateLimitRedis";

const JWT_SECRET = process.env.JWT_SECRET!;
const PUBLIC_PATHS = [
  "/login",
  "/reset-password",
  "/api/health", // allow /api/health and all subroutes
  "/api/health/auth",
  "/api/health/app",
  "/api/health/version",
  "/api/auth/db-login",
  "/api/auth/request-reset",
  "/api/security/webauthn-register",
  "/api/security/webauthn-authenticate",
  "/api/security/totp-setup",
  "/api/security/totp-enable",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Set strict security headers for all responses
  const securityHeaders = {
    "Content-Security-Policy": "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block"
  };

  // Allow public paths (exact or startsWith for health endpoints)
  if (
    PUBLIC_PATHS.some(p => pathname === p) ||
    pathname.startsWith("/api/health")
  ) {
    const res = NextResponse.next();
    Object.entries(securityHeaders).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  // Protect /dashboard and most /api
  const needsAuth =
    pathname.startsWith("/dashboard") ||
    (pathname.startsWith("/api") && !PUBLIC_PATHS.some(p => pathname.startsWith(p)));

  if (!needsAuth) {
    const res = NextResponse.next();
    Object.entries(securityHeaders).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  const token = req.cookies.get("ghostcrm_jwt")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));
  // Redis rate limiting for authenticated requests
  const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";
  const rate = await rateLimit({ key: ip, max: 100, windowSec: 60 });
  if (rate.limited) {
    const res = new NextResponse("Rate limit exceeded. Try again later.", { status: 429 });
    Object.entries(securityHeaders).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  // Origin check for state-changing requests (POST, PUT, PATCH, DELETE)
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const allowedOrigin = process.env.APP_BASE_URL || "http://localhost:3000";
    const origin = req.headers.get("origin");
    if (!origin || origin !== allowedOrigin) {
      const res = new NextResponse("Invalid origin", { status: 403 });
      Object.entries(securityHeaders).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    const res = NextResponse.next();
    Object.entries(securityHeaders).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  } catch {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set("ghostcrm_jwt", "", { path: "/", maxAge: 0 });
    Object.entries(securityHeaders).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*", "/reset-password", "/login"],
};
