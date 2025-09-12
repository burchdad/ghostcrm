import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

export async function POST(req: Request) {
  // SendGrid Inbound Parse sends multipart/form-data
  // For MVP, assume JSON body with 'from', 'to', 'subject', 'text'
  const data = await req.json();
  const from = data.from;
  const to = data.to;
  const text = data.text;

  // Find lead by email (assuming 'contact' field matches)
  const { data: lead } = await supabase
    .from('leads')
    .select('id')
    .eq('contact', from)
    .single();

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found for incoming email' }, { status: 404 });
  }

  // Insert inbound message
  await supabase.from('messages').insert([
    {
      lead_id: lead.id,
      action_type: 'email',
      contact: from,
      content: text,
      rep_id: null,
      direction: 'inbound',
      metadata: {}
    }
  ]);

  return NextResponse.json({ success: true });
}
