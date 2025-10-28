import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 [AUTH/ME] Checking authentication status...');
    
    // Get JWT cookie
    const token = req.cookies.get('ghostcrm_jwt')?.value;
    
    if (!token) {
      console.log('❌ [AUTH/ME] No JWT cookie found');
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    // Decode JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
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