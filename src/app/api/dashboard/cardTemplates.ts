import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const templateSchema = z.object({
  name: z.string(),
  card: z.any(),
  user: z.string(),
  org: z.string().optional()
});

// GET: Load templates for user/org
export async function GET(req: Request) {
  const url = new URL(req.url, 'http://localhost');
  const user = url.searchParams.get('user');
  const org = url.searchParams.get('org');
  let query = supabase.from('dashboard_card_templates').select('*');
  if (user) query = query.eq('user', user);
  if (org) query = query.eq('org', org);
  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, templates: data });
}

// POST: Save template
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid template data', details: parsed.error.errors }, { status: 400 });
  }
  const { error } = await supabase.from('dashboard_card_templates').insert([body]);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
