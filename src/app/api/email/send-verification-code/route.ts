import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/email/send-verification-code
 * Send verification code email (placeholder - implement with your email service)
 */
export async function POST(request: NextRequest) {
  try {
    const { email, firstName, verificationCode } = await request.json();
    
    if (!email || !verificationCode) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    console.log(`\n🔥🔥🔥 VERIFICATION CODE FOR ${email}: ${verificationCode} 🔥🔥🔥`);
    console.log(`📧 [EMAIL] User: ${firstName || 'User'}`);
    console.log(`📧 [EMAIL] Email: ${email}`);
    console.log(`📧 [EMAIL] Code: ${verificationCode}`);
    console.log(`🔥🔥🔥 USE THIS CODE IN THE MODAL 🔥🔥🔥\n`);
    
    // TODO: Implement actual email sending here
    // For now, just log the code - in production you'd use SendGrid, Resend, etc.
    
    // Example email content:
    const emailContent = {
      to: email,
      subject: 'Your GhostCRM Verification Code',
      html: `
        <h2>Welcome to GhostCRM, ${firstName || 'User'}!</h2>
        <p>Please enter this verification code to complete your login:</p>
        <div style="font-size: 24px; font-weight: bold; background: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
          ${verificationCode}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `
    };
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully'
    });

  } catch (error) {
    console.error('Error sending verification code email:', error);
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }
}