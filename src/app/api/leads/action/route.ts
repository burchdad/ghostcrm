import { NextResponse } from 'next/server';
import Telnyx from 'telnyx';
import sgMail from '@sendgrid/mail';
import { createSafeSupabaseClient } from '@/lib/supabase-safe';


export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('Received payload:', data);

    const { leadId, action, phone, email, message, subject } = data;

    console.log('Received action:', action, 'for lead:', leadId);

    const supabase = createSafeSupabaseClient();
    
    if (action === 'sms' && (!phone || !message)) {
      return NextResponse.json({ error: 'Missing phone or message' }, { status: 400 });
    }
    if (action === 'email' && (!email || !message)) {
      return NextResponse.json({ error: 'Missing email or message' }, { status: 400 });
    }

    // Telnyx SMS integration
    if (action === 'sms') {
      const apiKey = process.env.TELNYX_API_KEY;
      const messagingProfileId = process.env.TELNYX_MESSAGING_PROFILE_ID;
      const fromNumber = process.env.TELNYX_PHONE_NUMBER;
      
      if (!apiKey || !messagingProfileId || !fromNumber) {
        return NextResponse.json({ error: 'Telnyx credentials or phone number missing' }, { status: 500 });
      }
      
      try {
        const client = Telnyx(apiKey);
        
        // Format phone number properly
        const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
        
        const messageData = {
          text: message,
          from: fromNumber,
          to: formattedPhone,
          messaging_profile_id: messagingProfileId
        };
        
        console.log('🔧 Telnyx SMS Parameters:', {
          from: messageData.from,
          to: messageData.to,
          messaging_profile_id: messageData.messaging_profile_id,
          text_length: messageData.text.length,
          text_preview: messageData.text.substring(0, 50) + '...',
          api_key_present: !!apiKey,
          profile_id_present: !!messagingProfileId
        });
        
        const result = await client.messages.create(messageData);
        
        // --- Slack/Email Alert Integration (placeholder) ---
        // TODO: Replace with actual Slack/email API call
        // Example: Send alert to Slack/email when a new message is created
        // await sendSlackAlert({ leadId, action, message });
        // await sendEmailAlert({ leadId, action, message });
        // For now, just log to console
        console.log(`ALERT: New message for lead ${leadId} via ${action}`);

        if (supabase) {
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
        }

        return NextResponse.json({ success: true, sid: result.data.id, message: `SMS sent to ${phone}` });
      } catch (err: any) {
        console.error('Telnyx SMS Error:', err);
        
        // Enhanced error logging for Telnyx
        if (err.raw?.errors) {
          console.error('Telnyx Error Details:', err.raw.errors);
        }
        
        // Extract meaningful error message
        let errorMessage = 'Failed to send SMS';
        if (err.raw?.errors && Array.isArray(err.raw.errors)) {
          const errorDetails = err.raw.errors.map((error: any) => 
            `${error.title || 'Error'}: ${error.detail || 'No details'}`
          ).join('; ');
          errorMessage = errorDetails;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        return NextResponse.json({ error: errorMessage }, { status: 500 });
      }
    }

    // Real SendGrid email integration
    if (action === 'email') {
      console.log('📧 Processing email action:', { email, subject: subject || 'CRM Lead Notification', messageLength: message?.length });
      
      const sendgridApiKey = process.env.SENDGRID_API_KEY;
      if (!sendgridApiKey) {
        console.warn('⚠️ SendGrid API key missing - using development email logging');
        
        // Development fallback - log email instead of sending
        console.log('📧 [DEV EMAIL] Would send email:');
        console.log('📧 [DEV EMAIL] To:', email);
        console.log('📧 [DEV EMAIL] Subject:', subject || 'CRM Lead Notification');
        console.log('📧 [DEV EMAIL] Message:', message);
        
        // Still save to database for tracking
        console.log('💾 Saving email to database...');
        if (supabase) {
          await supabase.from('messages').insert([
            {
              lead_id: leadId,
              action_type: 'email',
              contact: email,
              content: message,
              rep_id: null,
              metadata: { dev_mode: true, subject: subject || 'CRM Lead Notification' }
            }
          ]);
        }
        console.log('✅ Email logged and saved to database (dev mode)');
        
        return NextResponse.json({ 
          success: true, 
          message: `Email logged for development (would send to ${email})`,
          dev_mode: true 
        });
      }
      
      sgMail.setApiKey(sendgridApiKey);
      try {
        console.log('📤 Sending email via SendGrid...');
        await sgMail.send({
          to: email,
          from: 'support@ghostai.solutions',
          subject: subject || 'CRM Lead Notification',
          text: message,
          html: `<p>${message.replace(/\n/g, '<br>')}</p>`
        });
        console.log('✅ Email sent successfully via SendGrid');

        console.log('💾 Saving email to database...');
        if (supabase) {
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
        }

        console.log('✅ Email saved to database');
        return NextResponse.json({ success: true, message: `Email sent to ${email}` });
      } catch (err: any) {
        console.error('❌ Email sending error:', err);
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
      }
    }

    if (supabase) {
      const { error } = await supabase.from('leads').insert([
        {
          // ...fields...
        }
      ]);

      if (error) {
        console.error('[Supabase Insert Error]', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API Error]', err.message, err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
