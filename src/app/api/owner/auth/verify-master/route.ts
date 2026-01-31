/**
 * Owner Authentication API - Step 1: Master Key Verification
 * First layer of owner authentication system
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Environment variables for owner authentication
const OWNER_MASTER_KEY = process.env.OWNER_MASTER_KEY || '';
const OWNER_MASTER_KEY_HASH = process.env.OWNER_MASTER_KEY_HASH || '';

function getClientIp(req: NextRequest): string | null {
  const xfwd = req.headers.get('x-forwarded-for');
  if (xfwd) return xfwd.split(',')[0]?.trim() || null;
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf;
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return null;
}

function hashMasterKey(key: string): string {
  return crypto.createHash('sha256').update(key + process.env.AUTH_SALT || 'ghost_crm_salt').digest('hex');
}

async function logOwnerAuthAttempt(ip: string | null, userAgent: string | null, success: boolean, step: string) {
  try {
    // In production, this would log to a secure audit table
    console.log(`[OWNER_AUTH] ${step} - IP: ${ip}, Success: ${success}, UA: ${userAgent?.substring(0, 100)}`);
    
    // TODO: Add to database audit log when ready
    // await supabase.from('owner_auth_log').insert({
    //   ip_address: ip,
    //   user_agent: userAgent,
    //   success,
    //   step,
    //   timestamp: new Date().toISOString()
    // });
  } catch (error) {
    console.error('Failed to log owner auth attempt:', error);
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get('user-agent');

  // Debug logging
  console.log('🔐 Owner Auth Debug:');
  console.log('OWNER_MASTER_KEY exists:', !!OWNER_MASTER_KEY);
  console.log('OWNER_MASTER_KEY length:', OWNER_MASTER_KEY?.length || 0);
  console.log('OWNER_MASTER_KEY_HASH exists:', !!OWNER_MASTER_KEY_HASH);

  try {
    const { masterKey } = await req.json();
    console.log('Received masterKey length:', masterKey?.length || 0);

    if (!masterKey) {
      await logOwnerAuthAttempt(ip, userAgent, false, 'master_key_missing');
      return NextResponse.json(
        { success: false, error: 'Master key required' },
        { status: 400 }
      );
    }

    // Verify master key using either direct comparison or hash
    let isValidMasterKey = false;
    
    if (OWNER_MASTER_KEY && masterKey === OWNER_MASTER_KEY) {
      console.log('✅ Direct comparison match');
      isValidMasterKey = true;
    } else if (OWNER_MASTER_KEY_HASH && hashMasterKey(masterKey) === OWNER_MASTER_KEY_HASH) {
      console.log('✅ Hash comparison match');
      isValidMasterKey = true;
    } else {
      console.log('❌ No match - Direct:', masterKey === OWNER_MASTER_KEY);
      console.log('❌ Expected:', OWNER_MASTER_KEY);
      console.log('❌ Received:', masterKey);
    }

    if (!isValidMasterKey) {
      await logOwnerAuthAttempt(ip, userAgent, false, 'master_key_invalid');
      
      // Add delay for failed attempts to prevent brute force
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return NextResponse.json(
        { success: false, error: 'Invalid master key' },
        { status: 401 }
      );
    }

    await logOwnerAuthAttempt(ip, userAgent, true, 'master_key_verified');

    return NextResponse.json({
      success: true,
      message: 'Master key verified',
      nextStep: 'access_code'
    });

  } catch (error) {
    console.error('Owner master key verification error:', error);
    await logOwnerAuthAttempt(ip, userAgent, false, 'master_key_error');
    
    return NextResponse.json(
      { success: false, error: 'Authentication error' },
      { status: 500 }
    );
  }
}