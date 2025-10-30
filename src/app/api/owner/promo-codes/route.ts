/**
 * Owner Promo Codes API - CRUD operations for promotional codes
 * Only accessible to software owners with valid owner session
 * Supabase-backed implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- Supabase (service role: server-side only) ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- Helpers ---
function decodeBase64Json<T = any>(b64: string): T | null {
  try {
    const json = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Very light owner-session check:
 * - expects a cookie "owner_session" that is a JWT-like string
 * - decodes payload (no signature verification here)
 * - requires role === "software_owner" and exp (in seconds) in the future
 */
function verifyOwnerSession(req: NextRequest): boolean {
  const token = req.cookies.get('owner_session')?.value;
  if (!token) {
    console.log('❌ [PROMO_API] No owner session cookie found');
    return false;
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    console.log('❌ [PROMO_API] Malformed owner session token');
    return false;
  }

  const payload = decodeBase64Json<{ role?: string; exp?: number }>(parts[1]);
  if (!payload) {
    console.log('❌ [PROMO_API] Unable to decode owner session payload');
    return false;
  }

  if (payload.role !== 'software_owner') {
    console.log('❌ [PROMO_API] Invalid role in owner session');
    return false;
  }

  // exp usually seconds; treat as seconds if it's small, ms if it's large
  const expMs = payload.exp && payload.exp < 2_000_000_000 ? payload.exp * 1000 : payload.exp;
  if (!expMs || expMs <= Date.now()) {
    console.log('❌ [PROMO_API] Owner session expired');
    return false;
  }

  console.log('✅ [PROMO_API] Owner session valid');
  return true;
}

const badReq = (msg: string, code = 400) =>
  NextResponse.json({ success: false, error: msg }, { status: code });

const ok = (body: Record<string, any> = {}) =>
  NextResponse.json({ success: true, ...body });

// ---------- GET: list promo codes ----------
export async function GET(req: NextRequest) {
  if (!verifyOwnerSession(req)) {
    return badReq('Unauthorized - Software owner access required', 401);
  }

  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [PROMO_API] Supabase GET error:', error);
      return badReq('Failed to fetch promo codes', 500);
    }

    return ok({ promoCodes: data ?? [] });
  } catch (e) {
    console.error('❌ [PROMO_API] GET exception:', e);
    return badReq('Failed to fetch promo codes', 500);
  }
}

// ---------- POST: create promo code ----------
export async function POST(req: NextRequest) {
  if (!verifyOwnerSession(req)) {
    return badReq('Unauthorized - Software owner access required', 401);
  }

  try {
    const body = await req.json();

    const code = String(body.code || '').trim();
    const description = String(body.description || '').trim();
    if (!code || !description) {
      return badReq('Code and description are required');
    }

    // ensure unique code (case-insensitive)
    const { data: existing, error: existErr } = await supabase
      .from('promo_codes')
      .select('id, code')
      .ilike('code', code); // ilike for case-insensitive match
    if (existErr) {
      console.error('❌ [PROMO_API] Supabase lookup error:', existErr);
      return badReq('Failed to validate promo code uniqueness', 500);
    }
    if (existing && existing.length > 0) {
      return badReq('Promo code already exists', 400);
    }

    const insertPayload = {
      code: code.toUpperCase(),
      description,
      discount_type: body.discountType ?? 'fixed',
      discount_value: body.discountValue != null ? Number(body.discountValue) : 0,
      monthly_price: body.monthlyPrice != null ? Number(body.monthlyPrice) : 0,
      yearly_price: body.yearlyPrice != null ? Number(body.yearlyPrice) : 0,
      max_uses: body.maxUses != null ? Number(body.maxUses) : 1,
      used_count: 0,
      expires_at: body.expiresAt ?? null,
      is_active: body.isActive !== undefined ? !!body.isActive : true,
      created_by: 'Software Owner',
    };

    const { data, error } = await supabase
      .from('promo_codes')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('❌ [PROMO_API] Supabase insert error:', error);
      return badReq('Failed to create promo code', 500);
    }

    console.log('✅ [PROMO_API] Created new promo code:', data.code);
    return ok({ message: 'Promo code created successfully', promoCode: data });
  } catch (e) {
    console.error('❌ [PROMO_API] POST exception:', e);
    return badReq('Failed to create promo code', 500);
  }
}

// ---------- PUT: update promo code ----------
export async function PUT(req: NextRequest) {
  if (!verifyOwnerSession(req)) {
    return badReq('Unauthorized - Software owner access required', 401);
  }

  try {
    const { id, ...raw } = await req.json();
    if (!id) return badReq('Promo code ID is required');

    // Map camelCase → snake_case for fields you allow to update
    const update: Record<string, any> = {};
    if (raw.code !== undefined) update.code = String(raw.code).toUpperCase();
    if (raw.description !== undefined) update.description = String(raw.description);
    if (raw.discountType !== undefined) update.discount_type = raw.discountType;
    if (raw.discountValue !== undefined) update.discount_value = Number(raw.discountValue);
    if (raw.monthlyPrice !== undefined) update.monthly_price = Number(raw.monthlyPrice);
    if (raw.yearlyPrice !== undefined) update.yearly_price = Number(raw.yearlyPrice);
    if (raw.maxUses !== undefined) update.max_uses = Number(raw.maxUses);
    if (raw.usedCount !== undefined) update.used_count = Number(raw.usedCount);
    if (raw.expiresAt !== undefined) update.expires_at = raw.expiresAt ?? null;
    if (raw.isActive !== undefined) update.is_active = !!raw.isActive;

    const { data, error } = await supabase
      .from('promo_codes')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [PROMO_API] Supabase update error:', error);
      return badReq('Failed to update promo code', 500);
    }

    console.log('✅ [PROMO_API] Updated promo code:', data.code);
    return ok({ message: 'Promo code updated successfully', promoCode: data });
  } catch (e) {
    console.error('❌ [PROMO_API] PUT exception:', e);
    return badReq('Failed to update promo code', 500);
  }
}

// ---------- DELETE: remove promo code ----------
export async function DELETE(req: NextRequest) {
  if (!verifyOwnerSession(req)) {
    return badReq('Unauthorized - Software owner access required', 401);
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return badReq('Promo code ID is required');

    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (error) {
      console.error('❌ [PROMO_API] Supabase delete error:', error);
      return badReq('Failed to delete promo code', 500);
    }

    console.log('✅ [PROMO_API] Deleted promo code:', id);
    return ok({ message: 'Promo code deleted successfully' });
  } catch (e) {
    console.error('❌ [PROMO_API] DELETE exception:', e);
    return badReq('Failed to delete promo code', 500);
  }
}
