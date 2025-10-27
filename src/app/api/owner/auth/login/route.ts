/**
 * Owner Authentication API - Final Step: Complete Login
 * Creates owner session with maximum privileges
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Environment variables for owner authentication
const OWNER_MASTER_KEY = process.env.OWNER_MASTER_KEY || '';
const OWNER_ACCESS_CODE = process.env.OWNER_ACCESS_CODE || '';
const OWNER_VERIFICATION_PIN = process.env.OWNER_VERIFICATION_PIN || '';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

function getClientIp(req: NextRequest): string | null {
  const xfwd = req.headers.get('x-forwarded-for');
  if (xfwd) return xfwd.split(',')[0]?.trim() || null;
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf;
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return null;
}

function generateOwnerToken(): string {
  const payload = {
    type: 'OWNER_SESSION',
    level: 'MAXIMUM_PRIVILEGE',
    permissions: ['ALL'],
    issued: Date.now(),
    expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
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
    const { masterKey, accessCode, verificationPin } = await req.json();

    if (!masterKey || !accessCode || !verificationPin) {
      await logOwnerAuthAttempt(ip, userAgent, false, 'final_login_missing_credentials');
      return NextResponse.json(
        { success: false, error: 'All credentials required' },
        { status: 400 }
      );
    }

    // Final verification of all credentials
    const credentialsValid = 
      masterKey === OWNER_MASTER_KEY &&
      accessCode === OWNER_ACCESS_CODE &&
      verificationPin === OWNER_VERIFICATION_PIN;

    if (!credentialsValid) {
      await logOwnerAuthAttempt(ip, userAgent, false, 'final_login_invalid_credentials');
      
      // Longer delay for final step failure
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Generate owner session token
    const ownerToken = generateOwnerToken();
    const expires = new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString();

    await logOwnerAuthAttempt(ip, userAgent, true, 'owner_login_successful');

    // Set secure cookie for owner session
    const response = NextResponse.json({
      success: true,
      message: 'Owner authentication successful',
      token: ownerToken,
      expires,
      level: 'OWNER',
      permissions: ['ALL_SYSTEM_ACCESS', 'ALL_TENANT_ACCESS', 'ALL_USER_DATA', 'AI_AGENT_CONTROL', 'SYSTEM_CONFIGURATION']
    });

    // Set httpOnly cookie for server-side verification
    response.cookies.set('owner_session', ownerToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Owner final login error:', error);
    await logOwnerAuthAttempt(ip, userAgent, false, 'final_login_error');
    
    return NextResponse.json(
      { success: false, error: 'Authentication error' },
      { status: 500 }
    );
  }
}