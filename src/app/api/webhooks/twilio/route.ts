import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

export async function POST(req: Request) {
  // Twilio sends data as x-www-form-urlencoded
  const body = await req.text();
  const params = new URLSearchParams(body);
  const from = params.get('From');
  const to = params.get('To');
  const text = params.get('Body');

  // Find lead by phone number (assuming 'contact' field matches)
  const { data: lead } = await supabase
    .from('leads')
    .select('id')
    .eq('contact', from)
    .single();

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found for incoming SMS' }, { status: 404 });
  }

  // Insert inbound message
  await supabase.from('messages').insert([
    {
      lead_id: lead.id,
      action_type: 'sms',
      contact: from,
      content: text,
      rep_id: null,
      direction: 'inbound',
      metadata: {}
    }
  ]);

  return NextResponse.json({ success: true });
}
