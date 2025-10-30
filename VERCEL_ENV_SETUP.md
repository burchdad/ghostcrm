# Vercel Environment Variables Setup

## Issue
Your Vercel deployment is failing because environment variables are not configured in Vercel.

## Required Environment Variables

Add these to your Vercel project settings:

### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=https://nctlfyzkzzhpnidzzcnn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_EQa71IiHS73VAdym5okHzA_gZfamjOp
SUPABASE_SERVICE_ROLE_KEY=sb_secret_FSTLepb2jwJ3jCNJy78MsQ_OKKFZud0
```

### Application Configuration
```bash
JWT_SECRET=ghostcrm_mvp_launch_secret_2025_super_secure_development_key_for_demo_and_testing_purposes
PROVIDER_SECRET_KEY=ghostcrm_provider_secret_2025
ENCRYPTION_MASTER_KEY=085227490f3caad70b3b7b391f2c39321b73bfeb385ad79bebaf1a2adf32ef91
NEXT_PUBLIC_BASE_URL=https://ghostcrm-liard.vercel.app
NEXTAUTH_URL=https://ghostcrm-liard.vercel.app
```

### Owner Authentication
```bash
OWNER_MASTER_KEY=GhostCRM_Owner_Master_Key_2024!@
OWNER_ACCESS_CODE=GhostCRM_Admin_Access_2024
OWNER_VERIFICATION_PIN=789123
```

### External APIs
```bash
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

## How to Add to Vercel

1. Go to https://vercel.com/dashboard
2. Select your ghostcrm project
3. Go to Settings → Environment Variables
4. Add each variable above
5. Set Environment to: Production, Preview, Development (check all)
6. Click Save
7. Redeploy your project

## Getting Correct Supabase Keys

Your Supabase keys from the new API Keys format:

1. **Publishable Key** (replaces anon public): `sb_publishable_EQa71IiHS73VAdym5okHzA_gZfamjOp`
2. **Secret Key** (replaces service_role): `sb_secret_FSTLepb2jwJ3jCNJy78MsQ_OKKFZud0`

These are the new API key format that Supabase now uses instead of the legacy JWT-based keys.

## Current Issue RESOLVED
Your SUPABASE_SERVICE_ROLE_KEY is actually correct for the new format:
`sb_secret_FSTLepb2jwJ3jCNJy78MsQ_OKKFZud0`

The new format uses shorter, more manageable keys instead of the long JWT tokens.