import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookies().getAll()
        }
      }
    );

    const payload = await req.json();

    const {
      full_name,
      contact_email,
      contact_phone,
      source,
      stage,
      assigned_rep_id,
      notes,
      priority,
      vehicle_of_interest,
      trade_in_details
    } = payload;

    const { error } = await supabase.from('leads').insert([
      {
        full_name,
        contact_email,
        contact_phone,
        source,
        stage,
        assigned_rep_id,
        data: {
          notes,
          priority,
          vehicle_of_interest,
          trade_in_details
        }
      }
    ]);

    if (error) {
      console.error('[Supabase Insert Error]', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('[API Error]', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
