import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { jwtVerify } from "jose";
import { limitKey } from "@/lib/rateLimitEdge";

const PUBLIC_PATHS = [
  "/login",
  "/reset-password",
  "/register",
  "/api/health",
  "/api/auth/db-login",
  "/api/auth/request-reset",
  "/api/auth/register",
  "/api/security/webauthn-register",
  "/api/security/webauthn-authenticate",
  "/api/security/ai-chat",
  "/api/security/totp-setup",
  "/api/security/totp-enable",
];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  await supabase.auth.getSession(); // refresh if needed

  // Add security headers
  res.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://*.supabase.co; connect-src 'self' https://*.supabase.co https://api.openai.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
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
