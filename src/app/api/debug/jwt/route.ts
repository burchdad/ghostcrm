import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, getUserFromRequest } from '@/lib/auth/server';

// Force dynamic rendering for request.cookies usage
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated with Supabase SSR
    const authenticated = await isAuthenticated(request);
    
    if (!authenticated) {
      return NextResponse.json({ 
        error: 'Not authenticated with Supabase SSR',
        message: 'This debug endpoint now uses Supabase SSR authentication instead of JWT',
        migrationStatus: 'JWT authentication has been replaced with Supabase SSR'
      }, { status: 401 });
    }

    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User data not available',
        authenticated: true,
        migrationStatus: 'Supabase SSR authentication active but user data unavailable'
      }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Authentication is working correctly with Supabase SSR',
      authenticationMethod: 'Supabase SSR (replaced JWT)',
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
        role: user.role,
        migrationStatus: 'Successfully migrated from JWT to Supabase SSR'
      },
      debugInfo: {
        hasSupabaseSession: !!user,
        authMethod: 'supabase_ssr',
        migrationComplete: true
      }
    });

  } catch (error: any) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Server error in debug endpoint',
      details: error.message 
    }, { status: 500 });
  }
}