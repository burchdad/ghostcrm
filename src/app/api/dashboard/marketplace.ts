import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const cardSchema = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string(),
  author: z.string().optional(),
  roles: z.array(z.string()),
  org: z.string().optional(),
  version: z.string().optional(),
  lastUpdated: z.string().optional(),
  recommended: z.boolean().optional(),
  rating: z.number().optional(),
  installCount: z.number().optional(),
  changelog: z.string().optional(),
  apiDocsUrl: z.string().optional(),
  theme: z.string().optional()
});

// GET: List marketplace cards (org-aware)
export async function GET(req: Request) {
  const url = new URL(req.url, 'http://localhost');
  const org = url.searchParams.get('org');
  let query = supabase.from('marketplace_cards').select('*');
  if (org) query = query.eq('org', org);
  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, cards: data });
}

// POST: Bulk install/uninstall/export cards
export async function POST(req: Request) {
  const body = await req.json();
  const { action, keys, org } = body;
  if (!Array.isArray(keys) || !action) {
    return NextResponse.json({ success: false, error: 'Missing action or keys' }, { status: 400 });
  }
  if (action === 'install') {
    // Mark cards as installed for org
    const { error } = await supabase.from('marketplace_installs').insert(keys.map(key => ({ key, org, installed_at: new Date().toISOString() })));
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } else if (action === 'uninstall') {
    // Remove installs for org
    const { error } = await supabase.from('marketplace_installs').delete().in('key', keys).eq('org', org);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } else if (action === 'export') {
    // Fetch card data for export
    const { data, error } = await supabase.from('marketplace_cards').select('*').in('key', keys);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, cards: data });
  }
  return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
}
