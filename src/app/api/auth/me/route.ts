import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken, hasJwtSecret } from '@/lib/jwt';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 [AUTH/ME] Checking authentication status...');
    
    // Check for JWT_SECRET
    if (!hasJwtSecret()) {
      console.error('❌ [AUTH/ME] JWT_SECRET not configured in environment');
      return NextResponse.json({ 
        error: 'Server configuration error',
        user: null 
      }, { status: 500 });
    }
    
    // Get JWT cookie
    const token = req.cookies.get('ghostcrm_jwt')?.value;
    
    if (!token) {
      console.log('❌ [AUTH/ME] No JWT cookie found');
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    // Decode JWT using shared utility
    const decoded = verifyJwtToken(token);
    
    if (!decoded) {
      console.log('❌ [AUTH/ME] Invalid JWT token');
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    console.log('✅ [AUTH/ME] User authenticated:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
      tenantId: decoded.tenantId
    });
    
    return NextResponse.json({ 
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        organizationId: decoded.organizationId,
        tenantId: decoded.tenantId,
        exp: decoded.exp
      }
    });
    
  } catch (error) {
    console.error('❌ [AUTH/ME] Error checking auth:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}