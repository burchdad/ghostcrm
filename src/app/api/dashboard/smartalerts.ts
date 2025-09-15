import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const alertSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  message: z.string(),
  created_at: z.string(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  org: z.string().optional()
});

// GET: List smart alerts (org-aware)
export async function GET(req: Request) {
  const url = new URL(req.url, 'http://localhost');
  const org = url.searchParams.get('org');
  let query = supabase.from('smart_alerts').select('*');
  if (org) query = query.eq('org', org);
  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, alerts: data });
}

// POST: Bulk update alerts (resolve, snooze, dismiss)
export async function POST(req: Request) {
  const body = await req.json();
  const { action, ids, org } = body;
  if (!Array.isArray(ids) || !action) {
    return NextResponse.json({ success: false, error: 'Missing action or ids' }, { status: 400 });
  }
  let status = '';
  if (action === 'resolve') status = 'resolved';
  else if (action === 'snooze') status = 'snoozed';
  else if (action === 'dismiss') status = 'dismissed';
  if (status) {
    const { error } = await supabase.from('smart_alerts').update({ status }).in('id', ids).eq('org', org);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
}
