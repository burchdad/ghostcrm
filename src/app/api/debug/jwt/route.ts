import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Force dynamic rendering for request.cookies usage
export const dynamic = 'force-dynamic'

const jwtSecret = process.env.JWT_SECRET!;

export async function GET(request: NextRequest) {
  try {
    
    // Check environment variables
    const hasJwtSecret = !!process.env.JWT_SECRET;
    const jwtSecretLength = process.env.JWT_SECRET?.length || 0;
    
    // Check all cookies
    const allCookies = request.cookies.getAll();
    
    // Get JWT cookie specifically
    const jwtCookie = request.cookies.get('ghostcrm_jwt');
    
    if (!jwtCookie) {
      return NextResponse.json({ 
        error: 'No JWT cookie found',
        cookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value, valueLength: c.value?.length })),
        headers: {
          cookie: request.headers.get('cookie') || 'No cookie header',
          userAgent: request.headers.get('user-agent'),
          referer: request.headers.get('referer')
        },
        environment: { hasJwtSecret, jwtSecretLength }
      }, { status: 401 });
    }

    console.log('JWT Cookie value length:', jwtCookie.value.length);
    console.log('JWT Cookie first 50 chars:', jwtCookie.value.substring(0, 50));
    
    // Check if JWT secret exists
    if (!jwtSecret) {
      return NextResponse.json({ 
        error: 'Server configuration error - JWT_SECRET not found',
        environment: { hasJwtSecret: false }
      }, { status: 500 });
    }
    
    // Try to decode JWT without verification first
    let decodedHeader, decodedPayload;
    try {
      const parts = jwtCookie.value.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format - not 3 parts');
      }
      
      decodedHeader = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      decodedPayload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      console.log('JWT header:', decodedHeader);
      console.log('JWT payload (unverified):', {
        userId: decodedPayload.userId,
        email: decodedPayload.email,
        role: decodedPayload.role,
        organizationId: decodedPayload.organizationId,
        exp: decodedPayload.exp ? new Date(decodedPayload.exp * 1000).toISOString() : 'no expiry',
        iat: decodedPayload.iat ? new Date(decodedPayload.iat * 1000).toISOString() : 'no issued time'
      });
      
    } catch (decodeError) {
      return NextResponse.json({ 
        error: 'JWT decode failed',
        details: decodeError.message,
        cookieValue: jwtCookie.value.substring(0, 100) + '...'
      }, { status: 400 });
    }
    
    // Try to verify JWT
    let jwtUser;
    try {
      jwtUser = jwt.verify(jwtCookie.value, jwtSecret) as any;
      console.log('✅ JWT verified successfully:', jwtUser);
    } catch (jwtError: any) {
      console.error('❌ JWT verification failed:', jwtError);
      return NextResponse.json({ 
        error: 'JWT verification failed',
        details: jwtError.message,
        errorType: jwtError.name,
        decodedPayload: decodedPayload,
        isExpired: jwtError.name === 'TokenExpiredError',
        expiry: decodedPayload.exp ? new Date(decodedPayload.exp * 1000).toISOString() : null,
        currentTime: new Date().toISOString()
      }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'JWT is valid and working correctly',
      user: {
        userId: jwtUser.userId,
        email: jwtUser.email,
        role: jwtUser.role,
        organizationId: jwtUser.organizationId,
        exp: jwtUser.exp ? new Date(jwtUser.exp * 1000).toISOString() : 'no expiry'
      },
      cookieFound: true,
      environment: { hasJwtSecret, jwtSecretLength }
    });

  } catch (error: any) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Server error in debug endpoint',
      details: error.message 
    }, { status: 500 });
  }
}