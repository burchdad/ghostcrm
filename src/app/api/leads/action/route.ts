import { NextResponse } from 'next/server';
import twilio from 'twilio';
import sgMail from '@sendgrid/mail';
import { createSafeSupabaseClient } from '@/lib/supabase-safe';


export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('Received payload:', data);

    const { leadId, action, phone, email, message } = data;

    console.log('Received action:', action, 'for lead:', leadId);

    const supabase = createSafeSupabaseClient();
    
    if (action === 'sms' && (!phone || !message)) {
      return NextResponse.json({ error: 'Missing phone or message' }, { status: 400 });
    }
    if (action === 'email' && (!email || !message)) {
      return NextResponse.json({ error: 'Missing email or message' }, { status: 400 });
    }

    // Real Twilio SMS integration
    if (action === 'sms') {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;
      if (!accountSid || !authToken || !fromNumber) {
        return NextResponse.json({ error: 'Twilio credentials or phone number missing' }, { status: 500 });
      }
      try {
        const client = twilio(accountSid, authToken);
        const result = await client.messages.create({
          body: message,
          from: fromNumber,
          to: phone.startsWith('+') ? phone : `+1${phone}`
        });
        // --- Slack/Email Alert Integration (placeholder) ---
        // TODO: Replace with actual Slack/email API call
        // Example: Send alert to Slack/email when a new message is created
        // await sendSlackAlert({ leadId, action, message });
        // await sendEmailAlert({ leadId, action, message });
        // For now, just log to console
        console.log(`ALERT: New message for lead ${leadId} via ${action}`);

        await supabase.from('messages').insert([
          {
            lead_id: leadId,
            action_type: 'sms',
            contact: phone,
            content: message,
            rep_id: null,
            metadata: {}
          }
        ]);

        return NextResponse.json({ success: true, sid: result.sid, message: `SMS sent to ${phone}` });
      } catch (err: any) {
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
      }
    }

    // Real SendGrid email integration
    if (action === 'email') {
      const sendgridApiKey = process.env.SENDGRID_API_KEY;
      if (!sendgridApiKey) {
        return NextResponse.json({ error: 'SendGrid API key missing' }, { status: 500 });
      }
      sgMail.setApiKey(sendgridApiKey);
      try {
        await sgMail.send({
          to: email,
          from: 'support@ghostai.solutions',
          subject: 'CRM Lead Notification',
          text: message,
          html: `<p>${message}</p>`
        });

        await supabase.from('messages').insert([
          {
            lead_id: leadId,
            action_type: 'email',
            contact: email,
            content: message,
            rep_id: null,
            metadata: {}
          }
        ]);

        return NextResponse.json({ success: true, message: `Email sent to ${email}` });
      } catch (err: any) {
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
      }
    }

    const { error } = await supabase.from('leads').insert([
      {
        // ...fields...
      }
    ]);

    if (error) {
      console.error('[Supabase Insert Error]', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API Error]', err.message, err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
