import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const scheduleSchema = z.object({
  url: z.string().url(),
  cron: z.string(),
  enabled: z.boolean(),
  user: z.string()
});

// GET: Fetch scheduled jobs for an endpoint
export async function GET(req: Request) {
  const url = new URL(req.url, 'http://localhost');
  const endpointUrl = url.searchParams.get('url');
  if (!endpointUrl) return NextResponse.json({ success: false, error: 'Missing url' }, { status: 400 });
  const { data, error } = await supabase.from('api_endpoint_schedules').select('*').eq('url', endpointUrl).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, schedules: data });
}

// POST: Schedule a job for an endpoint
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = scheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid schedule data', details: parsed.error.errors }, { status: 400 });
  }
  const entry = { ...body, created_at: new Date().toISOString() };
  const { error } = await supabase.from('api_endpoint_schedules').insert([entry]);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE: Remove a scheduled job
export async function DELETE(req: Request) {
  const body = await req.json();
  const { url, cron } = body;
  if (!url || !cron) return NextResponse.json({ success: false, error: 'Missing url or cron' }, { status: 400 });
  const { error } = await supabase.from('api_endpoint_schedules').delete().eq('url', url).eq('cron', cron);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
