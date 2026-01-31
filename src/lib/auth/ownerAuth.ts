/**
 * Owner Session Management
 * Handles owner-level authentication and session verification
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export interface OwnerSession {
  type: 'OWNER_SESSION';
  level: 'MAXIMUM_PRIVILEGE';
  permissions: string[];
  issued: number;
  expires: number;
  iat?: number;
  exp?: number;
}

export interface OwnerAuthResult {
  success: boolean;
  session?: OwnerSession;
  error?: string;
  isOwner: boolean;
  hasMaxPrivileges: boolean;
}

/**
 * Verify owner session from request
 */
export async function verifyOwnerSession(req: NextRequest): Promise<OwnerAuthResult> {
  try {
    // Check for owner session cookie first
    const ownerCookie = req.cookies.get('owner_session');
    let token = ownerCookie?.value;

    // Fallback to Authorization header
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // Check localStorage token (for client-side)
    if (!token) {
      const ownerSessionHeader = req.headers.get('x-owner-session');
      if (ownerSessionHeader) {
        token = ownerSessionHeader;
      }
    }

    if (!token) {
      return {
        success: false,
        error: 'No owner session found',
        isOwner: false,
        hasMaxPrivileges: false
      };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as OwnerSession;

    // Validate owner session structure
    if (
      decoded.type !== 'OWNER_SESSION' ||
      decoded.level !== 'MAXIMUM_PRIVILEGE' ||
      !decoded.permissions?.includes('ALL')
    ) {
      return {
        success: false,
        error: 'Invalid owner session',
        isOwner: false,
        hasMaxPrivileges: false
      };
    }

    // Check if session is expired
    if (decoded.expires && decoded.expires < Date.now()) {
      return {
        success: false,
        error: 'Owner session expired',
        isOwner: false,
        hasMaxPrivileges: false
      };
    }

    return {
      success: true,
      session: decoded,
      isOwner: true,
      hasMaxPrivileges: true
    };

  } catch (error) {
    console.error('Owner session verification failed:', error);
    return {
      success: false,
      error: 'Session verification failed',
      isOwner: false,
      hasMaxPrivileges: false
    };
  }
}

/**
 * Middleware wrapper for owner-only routes
 */
export function withOwnerAuth(
  handler: (req: NextRequest, ownerAuth: OwnerAuthResult) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const ownerAuth = await verifyOwnerSession(req);
    
    if (!ownerAuth.success || !ownerAuth.isOwner) {
      return NextResponse.json(
        { 
          error: ownerAuth.error || 'Owner access required',
          requiredLevel: 'OWNER_SESSION',
          timestamp: new Date().toISOString()
        },
        { 
          status: 403,
          headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
          }
        }
      );
    }
    
    return handler(req, ownerAuth);
  };
}

/**
 * Create owner session response with secure headers
 */
export function createOwnerResponse(data: any): NextResponse {
  const response = NextResponse.json({
    success: true,
    data,
    ownerAccess: true,
    timestamp: new Date().toISOString()
  });

  // Add security headers for owner responses
  response.headers.set('X-Owner-Access', 'true');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

/**
 * Refresh owner session (extend expiry)
 */
export function refreshOwnerSession(session: OwnerSession): string {
  const refreshedPayload = {
    ...session,
    issued: Date.now(),
    expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
  };
  
  return jwt.sign(refreshedPayload, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Logout owner session
 */
export function createOwnerLogoutResponse(): NextResponse {
  const response = NextResponse.json({
    success: true,
    message: 'Owner session terminated',
    timestamp: new Date().toISOString()
  });

  // Clear owner session cookie
  response.cookies.set('owner_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });

  return response;
}

/**
 * Check if request has owner privileges (for client-side usage)
 */
export async function hasOwnerPrivileges(req: NextRequest): Promise<boolean> {
  const ownerAuth = await verifyOwnerSession(req);
  return ownerAuth.success && ownerAuth.hasMaxPrivileges;
}