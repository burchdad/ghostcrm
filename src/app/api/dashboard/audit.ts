import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const auditSchema = z.object({
  cardId: z.string(),
  action: z.string(),
  user: z.string(),
  org: z.string().optional(),
  details: z.string().optional(),
  timestamp: z.string().optional()
});

// GET: Fetch audit logs for card/user/org
export async function GET(req: Request) {
  const url = new URL(req.url, 'http://localhost');
  const cardId = url.searchParams.get('cardId');
  const user = url.searchParams.get('user');
  const org = url.searchParams.get('org');
  let query = supabase.from('dashboard_card_audit').select('*');
  if (cardId) query = query.eq('cardId', cardId);
  if (user) query = query.eq('user', user);
  if (org) query = query.eq('org', org);
  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, audit: data });
}

// POST: Add audit log entry
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = auditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid audit data', details: parsed.error.errors }, { status: 400 });
  }
  const entry = { ...body, timestamp: new Date().toISOString() };
  const { error } = await supabase.from('dashboard_card_audit').insert([entry]);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
