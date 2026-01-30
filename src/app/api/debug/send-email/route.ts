import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    console.log('[DEBUG-EMAIL] Testing email send to:', email);
    console.log('[DEBUG-EMAIL] Environment check:', {
      hasSendgridKey: !!process.env.SENDGRID_API_KEY,
      sendgridFrom: process.env.SENDGRID_FROM,
      nodeEnv: process.env.NODE_ENV
    });

    // Test basic SendGrid API call
    try {
      const { EmailService } = await import('@/lib/email-service');
      const emailService = EmailService.getInstance();
      
      const emailSent = await emailService.sendVerificationEmail(
        email,
        'Test User',
        'https://example.com/verify-test-link'
      );

      return NextResponse.json({
        ok: emailSent,
        message: emailSent ? 'Email sent successfully' : 'Email send failed',
        timestamp: new Date().toISOString()
      });

    } catch (emailError) {
      console.error('[DEBUG-EMAIL] Email service error:', emailError);
      return NextResponse.json({
        ok: false,
        message: 'Email service error',
        error: emailError.message,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('[DEBUG-EMAIL] Request error:', error);
    return NextResponse.json({
      ok: false,
      message: 'Request processing error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}