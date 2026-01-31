# 🚀 GhostCRM Production Domain Setup - ghostcrm.ai

## Overview
Complete configuration update to migrate GhostCRM from development/staging to production domain `ghostcrm.ai`. This document outlines all changes made and deployment steps required.

---

## 🔧 **Configuration Changes Made**

### **1. CORS Configuration (`src/lib/cors.ts`)**
✅ **Updated allowed origins:**
- Added `https://ghostcrm.ai`
- Added `https://www.ghostcrm.ai`
- Updated production domain logic
- Added ghostcrm.ai domain validation in URL parsing

### **2. Middleware Domain Handling (`src/middleware.ts`)**
✅ **Updated domain recognition:**
- Added ghostcrm.ai to marketing site detection
- Updated subdomain extraction for production domain
- Enhanced tenant URL generation for ghostcrm.ai

### **3. API Routes & Domain References**
✅ **Updated hardcoded URLs in:**
- `src/app/api/admin/testing/execute/route.ts` - Fixed tenant URL generation
- `src/app/api/admin/tenants/list/route.ts` - Updated tenant URLs and domain logic
- `src/lib/tenant/utils.ts` - Added ghostcrm.ai to marketing site check

### **4. Environment Configuration**
✅ **Updated environment variables in:**
- `VERCEL_ENV_SETUP.md` - Updated base URLs to ghostcrm.ai
- Added `NEXT_PUBLIC_APP_URL=https://ghostcrm.ai`

### **5. Stripe Payment Integration**
✅ **Required Stripe environment variables:**
- `STRIPE_SECRET_KEY` - Your Stripe secret key (production)
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (production)
- `STRIPE_WEBHOOK_SECRET` - Webhook endpoint secret for signature verification
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Client-side publishable key (if needed for frontend)

**Stripe Dashboard Configuration:**
- ✅ Webhook endpoint: `https://ghostcrm.ai/api/webhooks/stripe`
- ✅ Success URL: `https://ghostcrm.ai/billing/success`
- ✅ Cancel URL: `https://ghostcrm.ai/billing/cancel`
- ✅ Create subscription prices for each plan (starter, professional, enterprise)

### **6. Test Configuration**
✅ **Updated test base URLs in:**
- `playwright.config.ts`
- `tests/health.spec.ts`
- `tests/api-smoke.spec.ts`
- `integration-test.js`
- `tests/functionality/api-endpoint-tests.js`
- `scripts/setup-admin-testing.js`
- `.github/workflows/e2e.yml`

### **6. Next.js Configuration (`next.config.js`)**
✅ **Added production optimizations:**
- Image domain configuration for ghostcrm.ai
- Security headers for production
- Enhanced configuration for production deployment

---

## 🌐 **Required Environment Variables for Production**

### **In Vercel Dashboard → Settings → Environment Variables:**

```bash
# Application URLs
NEXT_PUBLIC_BASE_URL=https://ghostcrm.ai
NEXTAUTH_URL=https://ghostcrm.ai
NEXT_PUBLIC_APP_URL=https://ghostcrm.ai

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://nctlfyzkzzhpnidzzcnn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_EQa71IiHS73VAdym5okHzA_gZfamjOp
SUPABASE_SERVICE_ROLE_KEY=sb_secret_FSTLepb2jwJ3jCNJy78MsQ_OKKFZud0

# Security Keys
JWT_SECRET=ghostcrm_mvp_launch_secret_2025_super_secure_development_key_for_demo_and_testing_purposes
PROVIDER_SECRET_KEY=ghostcrm_provider_secret_2025
ENCRYPTION_MASTER_KEY=085227490f3caad70b3b7b391f2c39321b73bfeb385ad79bebaf1a2adf32ef91

# Owner Authentication
OWNER_MASTER_KEY=GhostCRM_Owner_Master_Key_2024!@
OWNER_ACCESS_CODE=GhostCRM_Admin_Access_2024
OWNER_VERIFICATION_PIN=789123

# External APIs (configure as needed)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM=noreply@ghostcrm.ai
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
```

---

## 📋 **Deployment Checklist**

### **Pre-Deployment**
- [ ] **Domain Setup**: Ensure `ghostcrm.ai` is configured in Vercel with SSL
- [ ] **DNS Configuration**: Set up wildcard DNS `*.ghostcrm.ai` pointing to Vercel
- [ ] **Environment Variables**: All variables above configured in Vercel
- [ ] **Supabase Configuration**: Update Supabase auth URLs to include ghostcrm.ai

### **Supabase Configuration Required**
Update in Supabase Dashboard → Authentication → URL Configuration:
```
Site URL: https://ghostcrm.ai
Additional Redirect URLs:
- https://ghostcrm.ai/auth/callback
- https://www.ghostcrm.ai/auth/callback
- https://*.ghostcrm.ai/auth/callback
```

### **Post-Deployment Testing**
- [ ] **Main Domain**: Test `https://ghostcrm.ai`
- [ ] **Authentication**: Login/logout functionality
- [ ] **API Endpoints**: Critical API routes working
- [ ] **Tenant Subdomains**: Test `https://tenant.ghostcrm.ai`
- [ ] **Marketing Pages**: Marketing site functionality
- [ ] **Admin Dashboard**: Owner access at `/owner` routes

---

## 🔒 **Security Considerations**

### **Headers Added**
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `Referrer-Policy: origin-when-cross-origin` - Limits referrer information

### **CORS Security**
- Strict origin validation for ghostcrm.ai
- Development/staging domains separate from production
- Environment-based domain validation

---

## 🚨 **Critical Notes**

1. **Wildcard Subdomains**: Ensure DNS is configured for `*.ghostcrm.ai`
2. **SSL Certificates**: Vercel should auto-provision SSL for custom domains
3. **Environment Variables**: Set for Production, Preview, and Development in Vercel
4. **Testing**: Run full test suite after deployment to verify all functionality

---

## 🔄 **Rollback Plan**

If issues occur, you can quickly rollback by:
1. Reverting environment variables to previous Vercel URLs
2. Using git to revert commits
3. All changes are backwards compatible with localhost development

---

## 📞 **Support URLs After Deployment**

- **Main App**: https://ghostcrm.ai
- **Marketing**: https://ghostcrm.ai (marketing routes)
- **Login**: https://ghostcrm.ai/login
- **Admin Testing**: https://ghostcrm.ai/admin/testing
- **Owner Dashboard**: https://ghostcrm.ai/owner
- **API Health**: https://ghostcrm.ai/api/health

---

## ✅ **Verification Commands**

```bash
# Test main domain
curl https://ghostcrm.ai/api/health

# Test tenant subdomain (after DNS setup)
curl https://demo.ghostcrm.ai/api/tenant/current

# Test API connectivity
curl https://ghostcrm.ai/api/sidebar/counts
```

All configurations are now ready for production deployment on ghostcrm.ai! 🎉