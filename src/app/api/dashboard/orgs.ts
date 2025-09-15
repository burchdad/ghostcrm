import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET: List organizations/tenants
export async function GET() {
  const { data, error } = await supabase.from('organizations').select('*');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, orgs: data });
}

// POST: Create organization/tenant
export async function POST(req: Request) {
  const body = await req.json();
  const { error } = await supabase.from('organizations').insert([body]);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
