import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
  try {
    // Get the expired or soon-to-expire JWT cookie
    const jwtCookie = request.cookies.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      return NextResponse.json({ error: 'No token to refresh' }, { status: 401 });
    }

    // Decode the JWT without verification to get the payload
    let payload;
    try {
      const parts = jwtCookie.value.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    // Check if token is expired (allow 5 minute buffer)
    const now = Math.floor(Date.now() / 1000);
    const expiryBuffer = 5 * 60; // 5 minutes
    
    if (payload.exp && (now > payload.exp + expiryBuffer)) {
      // Token is too old to refresh, force re-login
      return NextResponse.json({ 
        error: 'Token too old to refresh',
        requiresLogin: true 
      }, { status: 401 });
    }

    // Create a new JWT with updated expiry (2 hours from now)
    const newPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      tenantId: payload.tenantId
    };

    const newToken = jwt.sign(newPayload, jwtSecret, { expiresIn: "2h" });

    // Set the new JWT cookie
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = [
      `ghostcrm_jwt=${newToken}`,
      "HttpOnly",
      isProd ? "Secure" : "",
      "Path=/",
      "Max-Age=7200", // 2 hours
      "SameSite=Lax"
    ].filter(Boolean).join("; ");

    const response = NextResponse.json({ 
      success: true,
      message: 'Token refreshed successfully',
      user: newPayload
    });
    
    response.headers.set("Set-Cookie", cookieOptions);
    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ 
      error: 'Failed to refresh token',
      requiresLogin: true 
    }, { status: 500 });
  }
}