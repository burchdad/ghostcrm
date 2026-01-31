/**
 * Owner Authentication API - Step 2: Access Code Verification
 * Second layer of owner authentication system
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Environment variables for owner authentication
const OWNER_ACCESS_CODE = process.env.OWNER_ACCESS_CODE || '';
const OWNER_ACCESS_CODE_HASH = process.env.OWNER_ACCESS_CODE_HASH || '';

function getClientIp(req: NextRequest): string | null {
  const xfwd = req.headers.get('x-forwarded-for');
  if (xfwd) return xfwd.split(',')[0]?.trim() || null;
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf;
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return null;
}

function hashAccessCode(code: string): string {
  return crypto.createHash('sha256').update(code + process.env.AUTH_SALT || 'ghost_crm_salt').digest('hex');
}

async function logOwnerAuthAttempt(ip: string | null, userAgent: string | null, success: boolean, step: string) {
  try {
    console.log(`[OWNER_AUTH] ${step} - IP: ${ip}, Success: ${success}, UA: ${userAgent?.substring(0, 100)}`);
  } catch (error) {
    console.error('Failed to log owner auth attempt:', error);
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get('user-agent');

  try {
    const { masterKey, accessCode } = await req.json();

    if (!masterKey || !accessCode) {
      await logOwnerAuthAttempt(ip, userAgent, false, 'access_code_missing');
      return NextResponse.json(
        { success: false, error: 'Master key and access code required' },
        { status: 400 }
      );
    }

    // Re-verify master key for security
    const OWNER_MASTER_KEY = process.env.OWNER_MASTER_KEY || '';
    const OWNER_MASTER_KEY_HASH = process.env.OWNER_MASTER_KEY_HASH || '';
    
    let isValidMasterKey = false;
    if (OWNER_MASTER_KEY && masterKey === OWNER_MASTER_KEY) {
      isValidMasterKey = true;
    } else if (OWNER_MASTER_KEY_HASH && crypto.createHash('sha256').update(masterKey + process.env.AUTH_SALT || 'ghost_crm_salt').digest('hex') === OWNER_MASTER_KEY_HASH) {
      isValidMasterKey = true;
    }

    if (!isValidMasterKey) {
      await logOwnerAuthAttempt(ip, userAgent, false, 'access_code_master_invalid');
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Verify access code
    let isValidAccessCode = false;
    
    if (OWNER_ACCESS_CODE && accessCode === OWNER_ACCESS_CODE) {
      isValidAccessCode = true;
    } else if (OWNER_ACCESS_CODE_HASH && hashAccessCode(accessCode) === OWNER_ACCESS_CODE_HASH) {
      isValidAccessCode = true;
    }

    if (!isValidAccessCode) {
      await logOwnerAuthAttempt(ip, userAgent, false, 'access_code_invalid');
      
      // Add delay for failed attempts
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return NextResponse.json(
        { success: false, error: 'Invalid access code' },
        { status: 401 }
      );
    }

    await logOwnerAuthAttempt(ip, userAgent, true, 'access_code_verified');

    return NextResponse.json({
      success: true,
      message: 'Access code verified',
      nextStep: 'verification_pin'
    });

  } catch (error) {
    console.error('Owner access code verification error:', error);
    await logOwnerAuthAttempt(ip, userAgent, false, 'access_code_error');
    
    return NextResponse.json(
      { success: false, error: 'Authentication error' },
      { status: 500 }
    );
  }
}