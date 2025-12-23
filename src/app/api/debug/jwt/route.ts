import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET!;

export async function GET(request: NextRequest) {
  try {
    console.log('=== JWT Debug Endpoint ===');
    
    // Check all cookies
    const allCookies = request.cookies.getAll();
    console.log('All cookies:', allCookies);
    
    // Get JWT cookie specifically
    const jwtCookie = request.cookies.get('ghostcrm_jwt');
    console.log('JWT Cookie found:', !!jwtCookie);
    
    if (!jwtCookie) {
      return NextResponse.json({ 
        error: 'No JWT cookie found',
        cookies: allCookies,
        headers: Object.fromEntries(request.headers.entries())
      }, { status: 401 });
    }

    console.log('JWT Cookie value length:', jwtCookie.value.length);
    
    // Try to decode JWT
    let jwtUser;
    try {
      jwtUser = jwt.verify(jwtCookie.value, jwtSecret) as any;
      console.log('JWT decoded successfully:', jwtUser);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json({ 
        error: 'JWT verification failed',
        details: jwtError.message,
        cookieValue: jwtCookie.value.substring(0, 50) + '...'
      }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true,
      user: jwtUser,
      cookieFound: true
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}