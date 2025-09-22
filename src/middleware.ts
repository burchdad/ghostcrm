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
  return res;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.*).*)"],
};
