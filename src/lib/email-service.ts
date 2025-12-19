import sgMail from '@sendgrid/mail';

interface TeamInviteEmailData {
  inviteeName: string;
  inviterName: string;
  inviterEmail: string;
  organizationName: string;
  role: string;
  inviteUrl: string;
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
      return false;
    }

    if (!process.env.SENDGRID_FROM) {
      console.error('❌ [EMAIL] SENDGRID_FROM not configured');
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
            
            <div class="expiry-notice">
                <p><strong>⏰ Important:</strong> This invitation expires on ${expiresDate}. Please accept it before then to join the team.</p>
            </div>
            
            <h3>🚀 What's Next?</h3>
            <p>1. Click the "Accept Invitation" button above</p>
            <p>2. Complete your account setup</p>
            <p>3. Start collaborating with your team!</p>
            
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

ACCEPT YOUR INVITATION:
${data.inviteUrl}

IMPORTANT: This invitation expires on ${expiresDate}. Please accept it before then to join the team.

What's Next?
1. Click the invitation link above
2. Complete your account setup
3. Start collaborating with your team!

If you have any questions, feel free to reach out to ${data.inviterName} at ${data.inviterEmail}.

Welcome to the team!
The GhostCRM Team

---
© 2025 GhostCRM. All rights reserved.
This invitation was sent to ${data.inviteeName}. If you received this in error, please contact ${data.inviterEmail}.
`;
  }
}

export default EmailService;