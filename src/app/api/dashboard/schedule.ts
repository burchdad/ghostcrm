import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const scheduleSchema = z.object({
  cardId: z.string(),
  email: z.string().email(),
  freq: z.string(),
  user: z.string(),
  org: z.string().optional()
});

// GET: Fetch schedules for user/org
export async function GET(req: Request) {
  const url = new URL(req.url, 'http://localhost');
  const user = url.searchParams.get('user');
  const org = url.searchParams.get('org');
  let query = supabase.from('dashboard_schedules').select('*');
  if (user) query = query.eq('user', user);
  if (org) query = query.eq('org', org);
  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, schedules: data });
}

// POST: Schedule card export/notification
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = scheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid schedule data', details: parsed.error.errors }, { status: 400 });
  }
  const { error } = await supabase.from('dashboard_schedules').insert([body]);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
