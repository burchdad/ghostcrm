import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { limitKey } from "@/lib/rateLimitEdge";

function jsonError(message: string, status = 400, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    // Rate limit by IP + email combination
    const clientIP = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
    const rateKey = `resend-verification:${clientIP}:${email || 'no-email'}`;
    const rate = await limitKey(rateKey, { limit: 3, windowMs: 15 * 60 * 1000 }); // 3 attempts per 15 minutes

    if (!rate.allowed) {
      // Always return same message regardless of rate limit reason
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, we've sent a verification link. Please check your inbox and spam folder.",
      });
    }

    if (!email || typeof email !== 'string') {
      // Don't reveal email validation errors - consistent response
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, we've sent a verification link. Please check your inbox and spam folder.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectTo = `${siteUrl}/auth/callback`;

    // Simulate consistent timing to prevent enumeration via response time analysis
    const startTime = Date.now();
    const minProcessingTime = 1000; // Always take at least 1 second

    try {
      // Check if user exists and is unverified
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(normalizedEmail);
      
      console.log('[RESEND-VERIFICATION] User lookup result:', {
        hasUser: !!userData?.user,
        userExists: !!userData?.user?.id,
        isVerified: !!userData?.user?.email_confirmed_at,
        userError: userError?.message
      });
      
      // Only proceed if user exists and is unverified
      if (userData?.user && !userData.user.email_confirmed_at) {
        console.log('[RESEND-VERIFICATION] Generating verification link...');
        
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'signup',
          email: normalizedEmail,
          options: {
            redirectTo: redirectTo,
          }
        });

        console.log('[RESEND-VERIFICATION] generateLink result:', {
          hasData: !!linkData,
          hasProps: !!linkData?.properties,
          hasAction: !!linkData?.properties?.action_link,
          error: linkError?.message
        });

        if (!linkError && linkData?.properties?.action_link) {
          // Get user metadata for personalized email
          const firstName = userData.user.user_metadata?.first_name || 'there';

          console.log('[RESEND-VERIFICATION] About to send email via EmailService...');

          // Send the verification email using our custom email service
          const { EmailService } = await import('@/lib/email-service');
          const emailService = EmailService.getInstance();
          
          const emailSent = await emailService.sendVerificationEmail(
            normalizedEmail,
            firstName,
            linkData.properties.action_link
          );

          console.log('[RESEND-VERIFICATION] Email send result:', { emailSent });

          if (emailSent) {
            console.log('[RESEND-VERIFICATION] Verification email sent successfully to:', normalizedEmail);
          } else {
            console.warn('[RESEND-VERIFICATION] Email service failed for:', normalizedEmail);
          }
        } else {
          console.warn('[RESEND-VERIFICATION] Link generation failed for:', normalizedEmail, linkError?.message);
        }
      } else {
        console.warn('[RESEND-VERIFICATION] User not found, already verified, or error:', normalizedEmail, userError?.message);
      }
    } catch (error) {
      console.error('[RESEND-VERIFICATION] Unexpected error:', error);
      // Continue - don't reveal errors to client
    }

    // Ensure consistent response timing to prevent enumeration
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < minProcessingTime) {
      await new Promise(resolve => setTimeout(resolve, minProcessingTime - elapsedTime));
    }

    // Always return success message - never reveal if email exists or not
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, we've sent a verification link. Please check your inbox and spam folder.",
    });

  } catch (error) {
    console.error('[RESEND-VERIFICATION] Request parsing error:', error);
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, we've sent a verification link. Please check your inbox and spam folder.",
    });
  }
}