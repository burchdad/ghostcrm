/**
 * Authentication utilities for API routes
 * Handles both JWT cookies and Bearer tokens
 */
import { NextRequest } from "next/server";

/**
 * Parse JWT payload without verification (for quick validation)
 */
function parseJwtPayload(token: string): any {
  try {
    const payload = token.split('.')[1];
    const decoded = Buffer.from(payload, 'base64').toString();
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error parsing JWT payload:', error);
    return null;
  }
}

/**
 * Check if JWT token is still valid (not expired)
 */
function isJwtValid(token: string): boolean {
  try {
    const payload = parseJwtPayload(token);
    if (!payload || !payload.exp) return false;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch {
    return false;
  }
}

/**
 * Extract JWT token from request (either from cookie or Authorization header)
 */
export function getJwtFromRequest(req: NextRequest): string | null {
  // First try Authorization header (Bearer token)
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    if (token && isJwtValid(token)) {
      console.debug('Using JWT from Authorization header');
      return token;
    }
  }

  // Fallback to cookie
  const cookieToken = req.cookies.get("ghostcrm_jwt")?.value;
  if (cookieToken && isJwtValid(cookieToken)) {
    console.debug('Using JWT from cookie');
    return cookieToken;
  }

  return null;
}

/**
 * Get user data from JWT token in request
 */
export function getUserFromRequest(req: NextRequest): any {
  const token = getJwtFromRequest(req);
  if (!token) return null;

  const payload = parseJwtPayload(token);
  return payload;
}

/**
 * Check if request is authenticated
 */
export function isAuthenticated(req: NextRequest): boolean {
  return !!getJwtFromRequest(req);
}