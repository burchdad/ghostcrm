import { NextRequest, NextResponse } from "next/server";


export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  try {
    const { name, email, dealership, phone, message, preferredContact } = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Format the contact form data for email
    const contactData = {
      name,
      email,
      dealership: dealership || "Not provided",
      phone: phone || "Not provided",
      preferredContact,
      message,
      timestamp: new Date().toISOString(),
      source: "Ghost CRM - Landing Page Contact Form"
    };

    // Here you can integrate with your preferred email service:
    // 1. SendGrid
    // 2. Nodemailer with SMTP
    // 3. AWS SES
    // 4. Postmark
    // 5. Save to database and notify via webhook

    // For now, let's use a simple approach with nodemailer (you'll need to configure SMTP)
    // Uncomment and configure the following if you want to send emails:
    
    /*
    import nodemailer from 'nodemailer';
    
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const emailHtml = `
      <h2>New Contact Form Submission - Ghost CRM</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Dealership:</strong> ${dealership || 'Not provided'}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Preferred Contact:</strong> ${preferredContact}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>Submitted: ${new Date().toLocaleString()}</small></p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@ghostautocrm.com',
      to: 'sales@ghostautocrm.com',
      subject: `New Sales Inquiry from ${name}`,
      html: emailHtml,
    });
    */

    // Alternative: Save to database (Supabase example)
    // You can uncomment this if you want to store in your database:
    /*
    import { supabaseAdmin } from "@/lib/supabaseAdmin";
    
    const { error: dbError } = await supabaseAdmin
      .from('contact_submissions')
      .insert([contactData]);

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue anyway, don't fail the request
    }
    */

    // For now, just log the submission (you can view this in your server logs)
    console.log('New contact form submission:', contactData);

    // You could also send this to a webhook service like Zapier, Make.com, or Slack
    /*
    // Example: Send to Slack webhook
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `New contact form submission from ${name} (${email}) - ${dealership}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*New Sales Lead*\n*Name:* ${name}\n*Email:* ${email}\n*Dealership:* ${dealership || 'Not provided'}\n*Phone:* ${phone || 'Not provided'}\n*Preferred Contact:* ${preferredContact}\n*Message:* ${message}`
              }
            }
          ]
        }),
      });
    }
    */

    return NextResponse.json({ 
      success: true,
      message: "Thank you for your inquiry! We'll contact you within 24 hours.",
      data: contactData
    });

  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to submit contact form. Please try again or contact us directly." },
      { status: 500 }
    );
  }
}
