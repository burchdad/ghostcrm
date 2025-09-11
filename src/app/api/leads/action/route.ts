import { NextResponse } from 'next/server';
import twilio from 'twilio';
import sgMail from '@sendgrid/mail';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

export async function POST(req: Request) {
  const body = await req.json();
  const { leadId, action, phone, email, message } = body;

  console.log('Received action:', action, 'for lead:', leadId);

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

  // Simulate other actions
  return NextResponse.json({
    success: true,
    message: `Simulated ${action} to ${phone}: "${message}"`,
  });
}