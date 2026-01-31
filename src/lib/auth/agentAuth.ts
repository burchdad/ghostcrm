/**
 * AI Agent API Authentication Middleware
 * Protects AI agent management endpoints from unauthorized access
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
  isOwner?: boolean;
  isSuperAdmin?: boolean;
}

/**
 * Verifies that the user has owner or super admin privileges
 * Required for AI agent management operations
 */
export async function verifyAgentAccess(req: NextRequest): Promise<AuthResult> {
  try {
    const supabase = await createSupabaseServer();

    // Get current user session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Load user profile and role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, email, first_name, last_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: 'User profile not found',
      };
    }

    // Check if user is owner or super admin
    const ownerEmail = (process.env.OWNER_EMAIL || '').trim().toLowerCase();
    const profileEmail = (profile.email || '').trim().toLowerCase();

    const isOwner = ownerEmail && profileEmail && profileEmail === ownerEmail;
    const isSuperAdmin = (profile.role || '').toLowerCase() === 'super_admin';

    if (!isOwner && !isSuperAdmin) {
      return {
        success: false,
        error: 'AI Agent access requires owner or super admin privileges',
      };
    }

    // Log access attempt for security audit
    const ip = getClientIp(req);
    const userAgent = req.headers.get('user-agent');

    // Fire-and-forget audit log
    void (async () => {
      try {
        await supabase.from('admin_audit_log').insert({
          user_id: user.id,
          action: 'ai_agent_api_access',
          ip_address: ip,
          user_agent: userAgent,
          metadata: {
            endpoint: req.url,
            method: req.method,
          },
        });
      } catch (auditError) {
        console.error('Failed to log agent access:', auditError);
      }
    })();

    return {
      success: true,
      user: {
        id: user.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
      },
      isOwner,
      isSuperAdmin,
    };
  } catch (error) {
    console.error('Agent access verification failed:', error);
    return {
      success: false,
      error: 'Access verification failed',
    };
  }
}

/**
 * Extract client IP address from request headers
 */
function getClientIp(req: NextRequest): string | null {
  const xfwd = req.headers.get('x-forwarded-for');
  if (xfwd) return xfwd.split(',')[0]?.trim() || null;
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf;
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return null;
}

/**
 * Create an unauthorized response with security headers
 */
export function createUnauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { 
      error: message,
      timestamp: new Date().toISOString(),
      access_level_required: 'owner_or_super_admin'
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

/**
 * Wrapper function to protect agent API routes
 */
export function withAgentAuth(handler: (req: NextRequest, authResult: AuthResult) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authResult = await verifyAgentAccess(req);
    
    if (!authResult.success) {
      return createUnauthorizedResponse(authResult.error);
    }
    
    return handler(req, authResult);
  };
}