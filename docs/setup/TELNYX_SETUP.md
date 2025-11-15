# Telnyx Phone System Setup Guide

## Quick Setup Steps

### 1. Get Your Telnyx Credentials

Login to your [Telnyx Mission Portal](https://portal.telnyx.com/) and gather:

- **API Key (v2)**: Go to Auth → API Keys → Create new v2 API Key
- **Phone Number**: Go to Numbers → My Numbers → Copy your number (format: +1234567890)  
- **Connection ID**: Go to Connections → Create SIP Connection → Copy Connection ID
- **Messaging Profile ID**: Go to Messaging → Profiles → Create Profile → Copy Profile ID

### 2. Update Environment Variables

Edit your `.env.local` file and replace these values:

```bash
# Replace with your actual Telnyx credentials
TELNYX_API_KEY=KEY0123456789ABCDEF_your_actual_api_key_here
TELNYX_PHONE_NUMBER=+1234567890
TELNYX_CONNECTION_ID=1234567890-abcd-efgh-ijkl-123456789012
TELNYX_MESSAGING_PROFILE_ID=40123456-7890-abcd-efgh-123456789012
BUSINESS_PHONE_NUMBER=+1234567890
```

### 3. Run Database Migration

```bash
# Apply the call logs table migration
npm run migrate
```

### 4. Configure Telnyx Webhooks

In your Telnyx Portal:
1. Go to Connections → Your SIP Connection → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/voice/telnyx/webhook`
3. Enable events: `call.initiated`, `call.answered`, `call.ended`, `call.recording.saved`

### 5. Test the Phone System

1. Navigate to your leads page
2. Click the phone icon next to any lead
3. The AI Call Script Modal should open
4. Click "Initiate AI Call"
5. Check console for successful call initiation

## Troubleshooting

### Common Issues:

1. **"Telnyx configuration missing"** error:
   - Verify all environment variables are set correctly
   - Restart your development server after updating .env.local

2. **"Connection failed"** error:
   - Check your Connection ID is correct
   - Ensure your Telnyx connection is active

3. **No webhook events received**:
   - Verify webhook URL is accessible from internet
   - Check Telnyx webhook configuration matches your endpoint

### Test Environment Variables

Add this temporary endpoint to test your configuration:

```typescript
// /api/test/telnyx/route.ts
export async function GET() {
  const config = {
    hasApiKey: !!process.env.TELNYX_API_KEY,
    hasConnectionId: !!process.env.TELNYX_CONNECTION_ID,
    hasPhoneNumber: !!process.env.TELNYX_PHONE_NUMBER,
    hasMessagingProfile: !!process.env.TELNYX_MESSAGING_PROFILE_ID
  };
  
  return Response.json(config);
}
```

Visit `/api/test/telnyx` to verify all credentials are loaded.

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migration applied
- [ ] Telnyx webhooks configured
- [ ] Test calls working
- [ ] Call logging functional
- [ ] Recording storage configured