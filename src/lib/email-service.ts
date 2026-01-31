import sgMail from '@sendgrid/mail';

interface TeamInviteEmailData {
  inviteeName: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  organizationName: string;
  role: string;
  inviteUrl: string;
  tempPassword: string;
  expiresAt: string;
}

export class EmailService {
  private static instance: EmailService;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeSendGrid();
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private initializeSendGrid() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.isConfigured = true;
      console.log('✅ [EMAIL] SendGrid configured successfully');
    } else {
      console.warn('⚠️ [EMAIL] SendGrid API key not found in environment');
      this.isConfigured = false;
    }
  }

  async sendTeamInvitation(email: string, data: TeamInviteEmailData): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('⚠️ [EMAIL] SendGrid not configured, skipping email send');
      console.info('💡 [EMAIL] To enable email invitations:');
      console.info('   1. Sign up for SendGrid at https://sendgrid.com');
      console.info('   2. Create an API key in your SendGrid dashboard');
      console.info('   3. Add SENDGRID_API_KEY=your_api_key to your .env.local file');
      console.info('   4. Restart your development server');
      return false;
    }

    if (!process.env.SENDGRID_FROM) {
      console.error('❌ [EMAIL] SENDGRID_FROM not configured');
      console.info('💡 [EMAIL] Add SENDGRID_FROM environment variable with a verified sender email');
      console.info('   Example: SENDGRID_FROM=noreply@yourdomain.com');
      console.info('   Note: The sender email must be verified in your SendGrid account');
      return false;
    }

    const emailHtml = this.generateInviteEmailHtml(data);
    const emailText = this.generateInviteEmailText(data);

    try {
      await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM,
        subject: `You're invited to join ${data.organizationName} on GhostCRM`,
        html: emailHtml,
        text: emailText,
        // 🎯 DISABLE CLICK TRACKING for invitation emails  
        // This prevents SendGrid from wrapping invitation links with tracking domains
        trackingSettings: {
          clickTracking: {
            enable: false
          },
          openTracking: {
            enable: false
          }
        }
      });

      console.log(`✅ [EMAIL] Team invitation sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ [EMAIL] Failed to send team invitation:', error);
      return false;
    }
  }

  private generateInviteEmailHtml(data: TeamInviteEmailData): string {
    const expiresDate = new Date(data.expiresAt).toLocaleDateString();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Invitation - GhostCRM</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 40px 20px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .invitation-card { background-color: #f8fafc; border-left: 4px solid #667eea; padding: 24px; margin: 30px 0; border-radius: 8px; }
        .button { display: inline-block; background-color: #667eea; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: background-color 0.3s; }
        .button:hover { background-color: #5a67d8; }
        .details { background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .details h3 { margin-top: 0; color: #2d3748; }
        .details p { margin: 8px 0; color: #4a5568; }
        .footer { background-color: #2d3748; color: #a0aec0; text-align: center; padding: 30px; font-size: 14px; }
        .footer a { color: #667eea; text-decoration: none; }
        .expiry-notice { background-color: #fed7d7; border-left: 4px solid #f56565; padding: 16px; margin: 20px 0; border-radius: 4px; }
        .expiry-notice p { margin: 0; color: #742a2a; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤝 Team Invitation</h1>
            <p>You've been invited to join a dealership team on GhostCRM</p>
        </div>
        
        <div class="content">
            <h2>Hi ${data.inviteeName}!</h2>
            
            <p><strong>${data.inviterName}</strong> (${data.inviterEmail}) has invited you to join <strong>${data.organizationName}</strong> as a <strong>${data.role}</strong> on GhostCRM.</p>
            
            <div class="invitation-card">
                <h3>🎯 Your Role: ${data.role}</h3>
                <p>You'll be joining ${data.organizationName} with access to our comprehensive automotive CRM platform, including lead management, inventory tracking, customer communications, and team collaboration features.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.inviteUrl}" class="button">Accept Invitation & Join Team</a>
            </div>
            
            <div class="details">
                <h3>📋 Invitation Details</h3>
                <p><strong>Organization:</strong> ${data.organizationName}</p>
                <p><strong>Role:</strong> ${data.role}</p>
                <p><strong>Invited by:</strong> ${data.inviterName} (${data.inviterEmail})</p>
                <p><strong>Expires:</strong> ${expiresDate}</p>
            </div>

            <div style="background-color: #e6fffa; border: 2px solid #319795; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h3 style="color: #2c7a7b; margin-top: 0;">🔑 Your Temporary Login Credentials</h3>
                <p style="color: #2c7a7b; margin: 8px 0;"><strong>Email:</strong> ${data.inviteeEmail}</p>
                <p style="color: #2c7a7b; margin: 8px 0;"><strong>Temporary Password:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 16px; font-weight: bold;">${data.tempPassword}</code></p>
                <p style="color: #2c7a7b; font-size: 14px; margin-top: 12px;"><em>You'll be asked to create your own password after logging in</em></p>
            </div>
            
            <div class="expiry-notice">
                <p><strong>⏰ Important:</strong> This invitation expires on ${expiresDate}. Please accept it before then to join the team.</p>
            </div>
            
            <h3>🚀 What's Next?</h3>
            <p>1. Click the "Accept Invitation" button above</p>
            <p>2. Log in using your email and temporary password</p>
            <p>3. Complete your profile and create a new password</p>
            <p>4. Start collaborating with your team!</p>
            
            <p>If you have any questions, feel free to reach out to ${data.inviterName} at ${data.inviterEmail}.</p>
            
            <p>Welcome to the team!</p>
            <p><strong>The GhostCRM Team</strong></p>
        </div>
        
        <div class="footer">
            <p>© 2025 GhostCRM. All rights reserved.</p>
            <p>This invitation was sent to ${data.inviteeName} (${data.inviterEmail}). If you received this in error, please contact <a href="mailto:${data.inviterEmail}">${data.inviterEmail}</a>.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateInviteEmailText(data: TeamInviteEmailData): string {
    const expiresDate = new Date(data.expiresAt).toLocaleDateString();
    
    return `
Team Invitation - GhostCRM

Hi ${data.inviteeName}!

${data.inviterName} (${data.inviterEmail}) has invited you to join ${data.organizationName} as a ${data.role} on GhostCRM.

INVITATION DETAILS:
- Organization: ${data.organizationName}
- Role: ${data.role}
- Invited by: ${data.inviterName} (${data.inviterEmail})
- Expires: ${expiresDate}

YOUR TEMPORARY LOGIN CREDENTIALS:
- Email: ${data.inviteeEmail}
- Temporary Password: ${data.tempPassword}
(You'll create your own password after logging in)

ACCEPT YOUR INVITATION:
${data.inviteUrl}

IMPORTANT: This invitation expires on ${expiresDate}. Please accept it before then to join the team.

What's Next?
1. Click the invitation link above
2. Log in using your email and temporary password
3. Complete your profile and create a new password
4. Start collaborating with your team!

If you have any questions, feel free to reach out to ${data.inviterName} at ${data.inviterEmail}.

Welcome to the team!
The GhostCRM Team

---
© 2025 GhostCRM. All rights reserved.
This invitation was sent to ${data.inviteeName}. If you received this in error, please contact ${data.inviterEmail}.
`;
  }

  /**
   * Send email verification email with Supabase verification link
   */
  async sendVerificationEmail(
    email: string, 
    firstName: string,
    verificationUrl: string
  ): Promise<boolean> {
    console.log('[EMAIL] sendVerificationEmail called:', {
      email,
      firstName,
      hasVerificationUrl: !!verificationUrl,
      urlLength: verificationUrl?.length,
      isConfigured: this.isConfigured,
      hasSendgridKey: !!process.env.SENDGRID_API_KEY,
      sendgridFrom: process.env.SENDGRID_FROM
    });

    if (!this.isConfigured) {
      console.warn('⚠️ [EMAIL] SendGrid not configured, skipping verification email');
      return false;
    }

    if (!process.env.SENDGRID_FROM) {
      console.error('❌ [EMAIL] SENDGRID_FROM not configured');
      return false;
    }

    const emailHtml = this.generateVerificationEmailHtml(firstName, verificationUrl);
    const emailText = this.generateVerificationEmailText(firstName, verificationUrl);

    console.log('[EMAIL] About to call sgMail.send...');

    try {
      const sendResult = await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM,
        subject: 'Verify your GhostCRM account',
        html: emailHtml,
        text: emailText,
        // 🎯 DISABLE CLICK TRACKING for verification emails
        // This prevents SendGrid from wrapping verification links with tracking domains
        trackingSettings: {
          clickTracking: {
            enable: false
          },
          openTracking: {
            enable: false
          }
        }
      });

      console.log('✅ [EMAIL] SendGrid API call successful:', {
        statusCode: sendResult?.[0]?.statusCode,
        messageId: sendResult?.[0]?.headers?.['x-message-id']
      });
      console.log(`✅ [EMAIL] Verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ [EMAIL] SendGrid API call failed:', {
        message: error?.message,
        code: error?.code,
        response: error?.response?.body
      });
      console.error('❌ [EMAIL] Failed to send verification email:', error);
      return false;
    }
  }

  /**
   * Send email verification code (modern auth flow)
   */
  async sendVerificationCode(
    email: string, 
    firstName: string,
    verificationCode: string
  ): Promise<boolean> {
    console.log('[EMAIL] sendVerificationCode called:', {
      email,
      firstName,
      codeLength: verificationCode?.length,
      isConfigured: this.isConfigured
    });

    if (!this.isConfigured) {
      console.warn('⚠️ [EMAIL] SendGrid not configured, skipping verification code email');
      return false;
    }

    if (!process.env.SENDGRID_FROM) {
      console.error('❌ [EMAIL] SENDGRID_FROM not configured');
      return false;
    }

    const emailHtml = this.generateVerificationCodeEmailHtml(firstName, verificationCode);
    const emailText = this.generateVerificationCodeEmailText(firstName, verificationCode);

    try {
      const sendResult = await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM,
        subject: 'Your GhostCRM verification code',
        html: emailHtml,
        text: emailText,
        trackingSettings: {
          clickTracking: { enable: false },
          openTracking: { enable: false }
        }
      });

      console.log('✅ [EMAIL] Verification code email sent:', {
        statusCode: sendResult?.[0]?.statusCode,
        messageId: sendResult?.[0]?.headers?.['x-message-id']
      });
      return true;
    } catch (error) {
      console.error('❌ [EMAIL] Failed to send verification code email:', error);
      return false;
    }
  }

  private generateVerificationEmailHtml(firstName: string, verificationUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account - GhostCRM</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 40px 20px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .verification-card { background-color: #f8fafc; border-left: 4px solid #667eea; padding: 24px; margin: 30px 0; border-radius: 8px; }
        .button { display: inline-block; background-color: #667eea; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: background-color 0.3s; }
        .button:hover { background-color: #5a67d8; }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
        .security-notice { background-color: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 16px; border-radius: 8px; margin: 20px 0; }
        .logo { font-size: 32px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">👻</div>
            <h1>GhostCRM</h1>
            <p>Auto Dealership CRM Platform</p>
        </div>
        
        <div class="content">
            <h2 style="color: #374151; margin-bottom: 20px;">Welcome, ${firstName}!</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 24px;">
                Thank you for signing up for GhostCRM. To complete your account setup and start managing your dealership, please verify your email address by clicking the button below.
            </p>

            <div class="verification-card">
                <h3 style="color: #374151; margin: 0 0 16px 0;">🔐 Account Security</h3>
                <p style="color: #6b7280; margin: 0; line-height: 1.5;">
                    This verification step ensures the security of your account and enables all GhostCRM features including inventory management, customer tracking, and team collaboration.
                </p>
            </div>

            <div style="text-align: center;">
                <a href="${verificationUrl}" class="button" style="color: white; text-decoration: none;">
                    Verify My Account
                </a>
            </div>

            <div class="security-notice">
                <strong>⚠️ Security Notice:</strong> This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.
            </div>

            <p style="color: #9ca3af; font-size: 14px; line-height: 1.5;">
                If the button above doesn't work, you can copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
            </p>
        </div>
        
        <div class="footer">
            <p>© 2025 GhostCRM. All rights reserved.</p>
            <p>This email was sent to verify your account. If you didn't create an account, please ignore this email.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateVerificationEmailText(firstName: string, verificationUrl: string): string {
    return `
Welcome to GhostCRM, ${firstName}!

Thank you for signing up for GhostCRM. To complete your account setup and start managing your dealership, please verify your email address.

Click or copy this link to verify your account:
${verificationUrl}

This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.

Once verified, you'll have access to:
• Inventory management
• Customer relationship tracking  
• Sales pipeline management
• Team collaboration tools
• Analytics and reporting

If the link above doesn't work, you can copy and paste it into your browser.

Welcome to the GhostCRM family!

The GhostCRM Team

---
© 2025 GhostCRM. All rights reserved.
This email was sent to verify your account. If you didn't create an account, please ignore this email.
`;
  }

  /**
   * Send welcome email with subdomain login link after successful payment
   */
  async sendWelcomeSubdomainEmail(
    email: string, 
    firstName: string,
    subdomain: string,
    companyName: string
  ): Promise<boolean> {
    console.log('[EMAIL] sendWelcomeSubdomainEmail called:', {
      email,
      firstName,
      subdomain,
      companyName,
      isConfigured: this.isConfigured
    });

    if (!this.isConfigured) {
      console.warn('⚠️ [EMAIL] SendGrid not configured, skipping welcome email');
      return false;
    }

    if (!process.env.SENDGRID_FROM) {
      console.error('❌ [EMAIL] SENDGRID_FROM not configured');
      return false;
    }

    const emailHtml = this.generateWelcomeSubdomainEmailHtml(firstName, subdomain, companyName);
    const emailText = this.generateWelcomeSubdomainEmailText(firstName, subdomain, companyName);

    try {
      const sendResult = await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM,
        subject: `🎉 Welcome to GhostCRM! Your subdomain ${subdomain} is ready`,
        html: emailHtml,
        text: emailText,
        trackingSettings: {
          clickTracking: { enable: false },
          openTracking: { enable: false }
        }
      });

      console.log('✅ [EMAIL] Welcome subdomain email sent:', {
        statusCode: sendResult?.[0]?.statusCode,
        messageId: sendResult?.[0]?.headers?.['x-message-id']
      });
      return true;
    } catch (error) {
      console.error('❌ [EMAIL] Failed to send welcome subdomain email:', error);
      return false;
    }
  }

  /**
   * Send a notification email
   */
  async sendNotificationEmail(
    email: string, 
    emailTemplate: { subject: string; template: string }
  ): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('⚠️ [EMAIL] SendGrid not configured, skipping notification email');
      return false;
    }

    try {
      const msg = {
        to: email,
        from: {
          email: process.env.FROM_EMAIL || 'noreply@ghostcrm.ai',
          name: 'GhostCRM Notifications'
        },
        subject: emailTemplate.subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${emailTemplate.subject}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
              .content { margin-bottom: 30px; }
              .footer { text-align: center; font-size: 14px; color: #666; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; }
              h1, h2 { color: #2563eb; }
              .priority-high { color: #dc2626; font-weight: bold; }
              .priority-critical { color: #991b1b; font-weight: bold; background: #fee2e2; padding: 10px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">👻 GhostCRM</div>
                <p>Your Auto Dealership CRM Platform</p>
              </div>
              
              <div class="content">
                ${emailTemplate.template}
              </div>
              
              <div class="footer">
                <p>This notification was sent from your GhostCRM system.</p>
                <p>To manage your notification preferences, log in to your account and visit Settings > Notifications.</p>
                <p>© 2025 GhostCRM. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        // 🎯 DISABLE CLICK TRACKING for notification emails
        // This prevents SendGrid from wrapping notification links with tracking domains
        trackingSettings: {
          clickTracking: {
            enable: false
          },
          openTracking: {
            enable: false
          }
        }
      };

      const response = await sgMail.send(msg);
      console.log('✅ [EMAIL] Notification email sent successfully to:', email);
      return true;

    } catch (error) {
      console.error('❌ [EMAIL] Error sending notification email:', error);
      return false;
    }
  }

  private generateVerificationCodeEmailHtml(firstName: string, verificationCode: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code - GhostCRM</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 40px 20px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .code-container { background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-align: center; padding: 30px; border-radius: 12px; margin: 30px 0; }
        .code { font-family: 'Monaco', 'Menlo', monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 10px 0; }
        .code-label { font-size: 14px; opacity: 0.9; margin-bottom: 10px; }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
        .security-notice { background-color: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 16px; border-radius: 8px; margin: 20px 0; }
        .logo { font-size: 32px; margin-bottom: 10px; }
        .info-card { background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">👻</div>
            <h1>GhostCRM</h1>
            <p>Auto Dealership CRM Platform</p>
        </div>
        
        <div class="content">
            <h2 style="color: #374151; margin-bottom: 20px;">Hi ${firstName}!</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 24px;">
                Here's your verification code to complete your GhostCRM account setup:
            </p>

            <div class="code-container">
                <div class="code-label">YOUR VERIFICATION CODE</div>
                <div class="code">${verificationCode}</div>
                <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
                    Enter this code in your browser to continue
                </p>
            </div>

            <div class="info-card">
                <h3 style="color: #0ea5e9; margin: 0 0 12px 0;">📱 Quick & Secure</h3>
                <p style="color: #0f172a; margin: 0; line-height: 1.5;">
                    This code will expire in <strong>10 minutes</strong> for your security. Simply enter it when prompted to verify your email and access your GhostCRM dashboard.
                </p>
            </div>

            <div class="security-notice">
                <strong>🔒 Security:</strong> Never share this code with anyone. GhostCRM will never ask for your verification code.
            </div>
        </div>
        
        <div class="footer">
            <p>© 2026 GhostCRM. All rights reserved.</p>
            <p>This code was requested for your account. If you didn't request this, please ignore this email.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateVerificationCodeEmailText(firstName: string, verificationCode: string): string {
    return `
GhostCRM - Verification Code

Hi ${firstName}!

Here's your verification code to complete your GhostCRM account setup:

VERIFICATION CODE: ${verificationCode}

This code will expire in 10 minutes for your security.

Simply enter this code when prompted to verify your email and access your GhostCRM dashboard.

SECURITY NOTICE: Never share this code with anyone. GhostCRM will never ask for your verification code.

---
© 2026 GhostCRM. All rights reserved.
This code was requested for your account. If you didn't request this, please ignore this email.
`;
  }

  private generateWelcomeSubdomainEmailHtml(firstName: string, subdomain: string, companyName: string): string {
    const loginUrl = `https://${subdomain}.ghostcrm.ai/login`;
    const dashboardUrl = `https://${subdomain}.ghostcrm.ai/dashboard`;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to GhostCRM - Your Subdomain is Ready!</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-align: center; padding: 40px 20px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .welcome-card { background: linear-gradient(135deg, #10b981, #059669); color: white; text-align: center; padding: 30px; border-radius: 12px; margin: 30px 0; }
        .subdomain { font-family: 'Monaco', 'Menlo', monospace; font-size: 24px; font-weight: 700; margin: 15px 0; background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; }
        .button { display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 10px; transition: background-color 0.3s; }
        .button:hover { background-color: #059669; }
        .button.secondary { background-color: #6366f1; }
        .button.secondary:hover { background-color: #4f46e5; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .feature-card { background-color: #f8fafc; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
        .logo { font-size: 32px; margin-bottom: 10px; }
        .success-notice { background-color: #d1fae5; border: 1px solid #10b981; color: #065f46; padding: 16px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">👻</div>
            <h1>GhostCRM</h1>
            <p>Auto Dealership CRM Platform</p>
        </div>
        
        <div class="content">
            <h2 style="color: #374151; margin-bottom: 20px;">🎉 Welcome to GhostCRM, ${firstName}!</h2>
            
            <div class="success-notice">
                <strong>✅ Payment Successful!</strong> Your GhostCRM account for ${companyName} has been activated and is ready to use.
            </div>

            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 24px;">
                Congratulations! Your payment has been processed successfully and your personalized GhostCRM subdomain is now live and ready for your team.
            </p>

            <div class="welcome-card">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">YOUR PERSONALIZED SUBDOMAIN</div>
                <div class="subdomain">${subdomain}.ghostcrm.ai</div>
                <p style="margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">
                    This is your team's dedicated GhostCRM workspace
                </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" class="button" style="color: white; text-decoration: none;">
                    🔑 Login to Your Subdomain
                </a>
            </div>

            <div class="features-grid">
                <div class="feature-card">
                    <h3 style="color: #10b981; margin: 0 0 12px 0;">🚗 Inventory Management</h3>
                    <p style="color: #374151; margin: 0; font-size: 14px;">Track your entire vehicle inventory with detailed records, photos, and pricing. Set up automated alerts for low stock and aging inventory.</p>
                </div>
                <div class="feature-card">
                    <h3 style="color: #10b981; margin: 0 0 12px 0;">👥 Customer Tracking</h3>
                    <p style="color: #374151; margin: 0; font-size: 14px;">Manage leads, customer relationships, and sales pipeline efficiently. Automated follow-ups and customer communication tools included.</p>
                </div>
                <div class="feature-card">
                    <h3 style="color: #10b981; margin: 0 0 12px 0;">📊 Analytics & Reports</h3>
                    <p style="color: #374151; margin: 0; font-size: 14px;">Get insights with comprehensive reporting and analytics dashboard. Track sales performance, inventory turnover, and customer metrics.</p>
                </div>
                <div class="feature-card">
                    <h3 style="color: #10b981; margin: 0 0 12px 0;">🤝 Team Collaboration</h3>
                    <p style="color: #374151; margin: 0; font-size: 14px;">Invite team members and collaborate on deals and customer management. Role-based permissions and activity tracking.</p>
                </div>
            </div>

            <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #0c4a6e; margin: 0 0 15px 0;">🎯 Quick Start Guide for Auto Dealers</h3>
                <div style="color: #1e40af; font-size: 14px; line-height: 1.6;">
                    <p style="margin: 0 0 10px 0;"><strong>Day 1:</strong> Set up your inventory categories (New, Used, Certified Pre-Owned)</p>
                    <p style="margin: 0 0 10px 0;"><strong>Week 1:</strong> Import your current vehicle data and customer contacts</p>
                    <p style="margin: 0 0 10px 0;"><strong>Week 2:</strong> Configure your sales pipeline and automation rules</p>
                    <p style="margin: 0;"><strong>Month 1:</strong> Analyze your first month's data and optimize your processes</p>
                </div>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #92400e; margin: 0 0 15px 0;">📚 Helpful Resources</h3>
                <div style="color: #92400e; font-size: 14px; line-height: 1.6;">
                    <p style="margin: 0 0 8px 0;">• <strong>Video Tutorials:</strong> Step-by-step setup guides available in your dashboard</p>
                    <p style="margin: 0 0 8px 0;">• <strong>Live Chat Support:</strong> Available 9 AM - 6 PM EST for onboarding assistance</p>
                    <p style="margin: 0 0 8px 0;">• <strong>Industry Best Practices:</strong> Auto dealership CRM strategies and tips</p>
                    <p style="margin: 0 0 8px 0;">• <strong>Integration Guides:</strong> Connect with your existing tools and services</p>
                    <p style="margin: 0;">• <strong>Mobile App:</strong> Manage your dealership on the go (iOS & Android)</p>
                </div>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #92400e; margin: 0 0 12px 0;">🔐 Next Steps</h3>
                <ol style="color: #92400e; margin: 0; padding-left: 20px;">
                    <li>Click the login button above to access your subdomain</li>
                    <li>Complete your contact verification (email/phone setup)</li>
                    <li><strong>Import your existing data:</strong> Upload vehicle inventory via CSV or API</li>
                    <li><strong>Set up your team:</strong> Invite sales staff with appropriate permissions</li>
                    <li><strong>Configure lead sources:</strong> Connect your website forms and phone system</li>
                    <li><strong>Customize your pipeline:</strong> Set up your unique sales process stages</li>
                    <li><strong>Enable automations:</strong> Set up follow-up sequences and notifications</li>
                </ol>
            </div>

            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #065f46; margin: 0 0 12px 0;">💡 Pro Tips for Auto Dealers</h3>
                <div style="color: #065f46; font-size: 14px; line-height: 1.6;">
                    <p style="margin: 0 0 10px 0;"><strong>📸 Photo Management:</strong> Upload high-quality photos for better lead conversion - studies show listings with 10+ photos get 40% more inquiries.</p>
                    <p style="margin: 0 0 10px 0;"><strong>📱 Mobile Optimization:</strong> 70% of car shoppers use mobile devices - ensure your team updates inventory on-the-go.</p>
                    <p style="margin: 0 0 10px 0;"><strong>⚡ Quick Response:</strong> Respond to leads within 5 minutes for 21x higher conversion rates.</p>
                    <p style="margin: 0;"><strong>📊 Monthly Reviews:</strong> Check your analytics monthly to identify top-performing vehicles and sales trends.</p>
                </div>
            </div>

            <div style="text-align: center; background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #374151; margin: 0 0 15px 0;">🚀 Need Help Getting Started?</h3>
                <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                    Our success team is here to help you maximize your GhostCRM experience
                </p>
                <div style="font-size: 14px; color: #374151;">
                    <p style="margin: 5px 0;"><strong>📧 Email Support:</strong> <a href="mailto:success@ghostcrm.ai" style="color: #10b981;">success@ghostcrm.ai</a></p>
                    <p style="margin: 5px 0;"><strong>💬 Live Chat:</strong> Available in your dashboard (bottom right corner)</p>
                    <p style="margin: 5px 0;"><strong>📞 Phone Support:</strong> (555) 123-GHOST - Monday-Friday 9 AM-6 PM EST</p>
                    <p style="margin: 5px 0;"><strong>🎥 Video Onboarding:</strong> Schedule a free 30-minute setup session</p>
                </div>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                Your login credentials are the same email and password you used during registration. For security, we recommend enabling two-factor authentication in your account settings.
            </p>
        </div>
        
        <div class="footer">
            <p>© 2026 GhostCRM. All rights reserved.</p>
            <p>This welcome email was sent because your payment was processed successfully.</p>
            <p style="margin-top: 15px;">
                <strong>Your subdomain:</strong> <a href="${loginUrl}" style="color: #10b981;">${subdomain}.ghostcrm.ai</a>
            </p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateWelcomeSubdomainEmailText(firstName: string, subdomain: string, companyName: string): string {
    const loginUrl = `https://${subdomain}.ghostcrm.ai/login`;
    const dashboardUrl = `https://${subdomain}.ghostcrm.ai/dashboard`;
    
    return `
GhostCRM - Welcome! Your Subdomain is Ready

🎉 Welcome to GhostCRM, ${firstName}!

✅ PAYMENT SUCCESSFUL! Your GhostCRM account for ${companyName} has been activated and is ready to use.

Congratulations! Your payment has been processed successfully and your personalized GhostCRM subdomain is now live and ready for your team.

YOUR PERSONALIZED SUBDOMAIN:
${subdomain}.ghostcrm.ai

This is your team's dedicated GhostCRM workspace.

LOGIN NOW:
${loginUrl}

FEATURES AVAILABLE TO YOU:
🚗 Inventory Management - Track your entire vehicle inventory with detailed records, photos, and pricing. Set up automated alerts for low stock and aging inventory.

👥 Customer Tracking - Manage leads, customer relationships, and sales pipeline efficiently. Automated follow-ups and customer communication tools included.

📊 Analytics & Reports - Get insights with comprehensive reporting and analytics dashboard. Track sales performance, inventory turnover, and customer metrics.

🤝 Team Collaboration - Invite team members and collaborate on deals and customer management. Role-based permissions and activity tracking.

🎯 QUICK START GUIDE FOR AUTO DEALERS:
Day 1: Set up your inventory categories (New, Used, Certified Pre-Owned)
Week 1: Import your current vehicle data and customer contacts
Week 2: Configure your sales pipeline and automation rules  
Month 1: Analyze your first month's data and optimize your processes

📚 HELPFUL RESOURCES:
• Video Tutorials: Step-by-step setup guides available in your dashboard
• Live Chat Support: Available 9 AM - 6 PM EST for onboarding assistance
• Industry Best Practices: Auto dealership CRM strategies and tips
• Integration Guides: Connect with your existing tools and services
• Mobile App: Manage your dealership on the go (iOS & Android)

🔐 NEXT STEPS:
1. Click the login link above to access your subdomain
2. Complete your contact verification (email/phone setup)
3. Import your existing data: Upload vehicle inventory via CSV or API
4. Set up your team: Invite sales staff with appropriate permissions
5. Configure lead sources: Connect your website forms and phone system
6. Customize your pipeline: Set up your unique sales process stages
7. Enable automations: Set up follow-up sequences and notifications

💡 PRO TIPS FOR AUTO DEALERS:
📸 Photo Management: Upload high-quality photos for better lead conversion - studies show listings with 10+ photos get 40% more inquiries.
📱 Mobile Optimization: 70% of car shoppers use mobile devices - ensure your team updates inventory on-the-go.
⚡ Quick Response: Respond to leads within 5 minutes for 21x higher conversion rates.
📊 Monthly Reviews: Check your analytics monthly to identify top-performing vehicles and sales trends.

🚀 NEED HELP GETTING STARTED?
Our success team is here to help you maximize your GhostCRM experience

📧 Email Support: success@ghostcrm.ai
💬 Live Chat: Available in your dashboard (bottom right corner)  
📞 Phone Support: (555) 123-GHOST - Monday-Friday 9 AM-6 PM EST
🎥 Video Onboarding: Schedule a free 30-minute setup session

Your login credentials are the same email and password you used during registration. For security, we recommend enabling two-factor authentication in your account settings.

---
© 2026 GhostCRM. All rights reserved.
This welcome email was sent because your payment was processed successfully.

Your subdomain: ${subdomain}.ghostcrm.ai
`;
  }
}

export default EmailService;