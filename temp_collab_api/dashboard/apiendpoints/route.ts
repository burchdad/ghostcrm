import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const endpointSchema = z.object({
  url: z.string().url(),
  type: z.string(),
  headers: z.record(z.string()).optional(),
  payloadTemplate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  version: z.string().optional(),
  status: z.string().optional(),
  lastCall: z.string().optional(),
  lastResponse: z.string().optional(),
  errorCount: z.number().optional(),
  auditHistory: z.array(z.object({ action: z.string(), timestamp: z.string(), user: z.string() })).optional(),
});

// GET: Fetch all API endpoints
export async function GET(req: Request) {
  const { data, error } = await supabase.from('api_endpoints').select('*');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, endpoints: data });
}

// POST: Register a new API endpoint
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = endpointSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid endpoint data', details: parsed.error.errors }, { status: 400 });
  }
  const { error } = await supabase.from('api_endpoints').insert([body]);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// PUT: Update an API endpoint
export async function PUT(req: Request) {
  const body = await req.json();
  const { url } = body;
  if (!url) return NextResponse.json({ success: false, error: 'Missing endpoint URL' }, { status: 400 });
  const parsed = endpointSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid endpoint data', details: parsed.error.errors }, { status: 400 });
  }
  const { error } = await supabase.from('api_endpoints').update(body).eq('url', url);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE: Remove an API endpoint
export async function DELETE(req: Request) {
  const body = await req.json();
  const { url } = body;
  if (!url) return NextResponse.json({ success: false, error: 'Missing endpoint URL' }, { status: 400 });
  const { error } = await supabase.from('api_endpoints').delete().eq('url', url);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
