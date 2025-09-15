import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const auditSchema = z.object({
  endpointUrl: z.string().url(),
  action: z.string(),
  user: z.string(),
  details: z.string().optional(),
  timestamp: z.string().optional()
});

// GET: Fetch audit logs for an endpoint
export async function GET(req: Request) {
  const url = new URL(req.url, 'http://localhost');
  const endpointUrl = url.searchParams.get('endpointUrl');
  if (!endpointUrl) return NextResponse.json({ success: false, error: 'Missing endpointUrl' }, { status: 400 });
  const { data, error } = await supabase.from('api_endpoint_audit').select('*').eq('endpoint_url', endpointUrl).order('timestamp', { ascending: false });
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
  const { error } = await supabase.from('api_endpoint_audit').insert([entry]);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
