import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of public routes
const PUBLIC_PATHS = ["/login", "/onboarding", "/api/auth/login", "/api/auth/check"];

export function middleware(request: NextRequest) {
  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production' && request.nextUrl.protocol === 'http:') {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }
  const { pathname } = request.nextUrl;
  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  // Check JWT in cookies or localStorage
  const token = request.cookies.get("ghostcrm_jwt")?.value;
  // If no token, redirect to login
  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }
  // Optionally: verify token validity here
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
