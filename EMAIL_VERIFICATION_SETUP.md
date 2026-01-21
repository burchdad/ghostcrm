# Email Verification Setup Guide

## 🎯 Current Status
- ✅ Registration route updated to require email verification (`email_confirm: false`)
- ✅ Callback handler created at `/auth/callback/route.ts`
- ✅ Success page created at `/email-verified/page.tsx`
- ✅ Redirect URL configured in registration process

## 📧 Email Configuration (Supabase Dashboard)

### 1. Configure Email Templates
Go to **Authentication > Email Templates** in your Supabase dashboard:

**Confirm signup template:**
- Subject: `Verify your GhostCRM account`
- Body should include: `{{ .ConfirmationURL }}`

### 2. Site URL Configuration
Go to **Authentication > URL Configuration**:
- **Site URL:** `https://ghostcrm.ai` (production) or `http://localhost:3000` (dev)
- **Redirect URLs:** Add these allowed redirects:
  ```
  https://ghostcrm.ai/auth/callback
  https://*.ghostcrm.ai/auth/callback
  http://localhost:3000/auth/callback
  ```

### 3. Default Email Template (Recommended)
```html
<h2>Confirm your GhostCRM Account</h2>
<p>Hello {{.Name}},</p>
<p>Thank you for registering with GhostCRM! Please click the button below to verify your email address and activate your account:</p>
<p>
  <a href="{{ .ConfirmationURL }}" 
     style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
    Verify Email Address
  </a>
</p>
<p>If the button doesn't work, you can copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 24 hours.</p>
<p>If you didn't create this account, you can safely ignore this email.</p>
<p>Best regards,<br>The GhostCRM Team</p>
```

## 🔄 Email Verification Flow

### Current Flow:
1. **User registers** → Account created with unverified email
2. **Supabase sends email** → With verification link to `/auth/callback`
3. **User clicks link** → Callback handler processes verification
4. **Email verified** → ✅ **`auth.users.email_confirmed_at` updated** (source of truth)
5. **Database triggers** → May sync verification status to `public.users` (optional)
6. **User can login** → Full access to dashboard (pending subdomain activation)

### Verification Link Format:
```
https://your-project.supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=https://ghostcrm.ai/auth/callback
```

## 🎯 **Important: Email Verification Updates `auth.users` Table**

**Source of Truth:** Email verification status is stored in `auth.users` (Supabase Auth schema)
- ✅ `auth.users.email_confirmed_at` → timestamp when verified
- ✅ `auth.users.email_confirmed` → boolean true/false
- ✅ Updated automatically by `supabase.auth.exchangeCodeForSession()`

**Profile Cache:** `public.users` may be synced via triggers but is NOT the verification source
- `public.users` is for additional profile data
- Database triggers can copy verification status if needed
- Always check `auth.users` for actual verification status

**Middleware should validate:** `user.email_confirmed_at` from the session (which comes from `auth.users`)

## 🛠️ Testing Email Verification

### 1. Development Testing
- Use your own email address
- Check spam folder if email doesn't arrive
- Verify the callback URL is accessible

### 2. Production Checklist
- [ ] Email templates configured in Supabase
- [ ] Site URL and redirect URLs set correctly
- [ ] SMTP provider configured (if using custom email)
- [ ] DNS records set for email domain (if using custom domain)

### 3. Troubleshooting
- Check Supabase logs for email delivery issues
- Verify callback route is accessible
- Test with different email providers
- Check browser console for errors during callback

## 📱 User Experience
- User registers → sees "Check your email" message
- User opens email → clicks verification button/link
- User is redirected → sees "Email Verified!" success page
- User can login → access their subdomain dashboard

## 🎯 Next Steps
1. Deploy the callback handler and success page
2. Configure email templates in Supabase dashboard
3. Test the complete registration → verification → login flow
4. Customize email templates with your branding