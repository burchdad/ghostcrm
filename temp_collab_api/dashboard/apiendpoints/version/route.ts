import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const versionSchema = z.object({
  url: z.string().url(),
  endpoint: z.any(),
  version: z.string()
});

// GET: Fetch version history for an endpoint
export async function GET(req: Request) {
  const url = new URL(req.url, 'http://localhost');
  const endpointUrl = url.searchParams.get('url');
  if (!endpointUrl) return NextResponse.json({ success: false, error: 'Missing url' }, { status: 400 });
  const { data, error } = await supabase.from('api_endpoint_versions').select('*').eq('url', endpointUrl).order('timestamp', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, versions: data });
}

// POST: Save a new version for an endpoint
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = versionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid version data', details: parsed.error.errors }, { status: 400 });
  }
  const entry = { ...body, timestamp: new Date().toISOString() };
  const { error } = await supabase.from('api_endpoint_versions').insert([entry]);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
