# Telnyx Webhook Configuration Guide

## 🔗 Setting Up Webhooks in Telnyx Dashboard

### **Step 1: Access Your Connection**
1. Login to [Telnyx Dashboard](https://portal.telnyx.com)
2. Go to **Voice** → **Connections**
3. Find your SIP connection (ID: `YOUR_CONNECTION_ID_HERE`)
4. Click on it to open settings

### **Step 2: Configure Webhooks**

#### **For Production (ghostcrm.ai):**
Set these URLs in your connection:

```
Primary Webhook URL: https://ghostcrm.ai/api/voice/telnyx/ai-answer
Method: POST
Failover Webhook URL: https://ghostcrm.ai/api/voice/telnyx/ai-status  
Method: POST
```

#### **For Local Testing:**
If testing locally, you'll need ngrok:

1. Install ngrok: `npm install -g ngrok`
2. Start your app: `npm run dev` (on port 3000)
3. In another terminal: `ngrok http 3000`
4. Copy the https URL (e.g., `https://abc123.ngrok.io`)

Then set in Telnyx:
```
Primary Webhook URL: https://abc123.ngrok.io/api/voice/telnyx/ai-answer
Failover Webhook URL: https://abc123.ngrok.io/api/voice/telnyx/ai-status
```

### **Step 3: Webhook Events to Enable**

In your connection settings, make sure these events are enabled:
- ✅ **call.initiated** - When call starts
- ✅ **call.answered** - When call is answered
- ✅ **call.hangup** - When call ends
- ✅ **call.machine.detection.ended** - Voicemail detection
- ✅ **call.speak.ended** - When AI finishes speaking
- ✅ **call.gather.ended** - When speech input is complete

### **Step 4: Test Webhook Connectivity**

You can test if your webhooks are reachable:

```bash
# Test production endpoint
curl https://ghostcrm.ai/api/voice/telnyx/ai-answer

# Test local endpoint (if using ngrok)
curl https://abc123.ngrok.io/api/voice/telnyx/ai-answer
```

Expected response:
```json
{
  "status": "Telnyx AI Answer Handler Active",
  "timestamp": "2025-11-10T..."
}
```

### **Step 5: Assign Phone Number to Connection**

Make sure your phone number (+1XXXXXXXXXX) is assigned to your SIP connection:

1. Go to **Numbers** → **My Numbers**
2. Find your number: `+1XXX-XXX-XXXX`
3. Click **Settings** 
4. Set **Connection**: Your SIP connection
5. **Save**

## 🚨 **Important Notes**

- **Webhook URLs must be HTTPS** (except localhost for testing)
- **Response time matters** - Telnyx expects responses within 10 seconds
- **Test thoroughly** - Make a test call to verify webhooks work
- **Monitor logs** - Check your app logs when calls come in

## 🔧 **Troubleshooting**

**Webhook not receiving calls?**
- Check if number is assigned to correct connection
- Verify webhook URLs are correct and accessible
- Check Telnyx connection is active
- Review webhook event settings

**Calls failing?**
- Verify API key and connection ID are correct
- Check account balance
- Ensure outbound calling profile is configured
- Review connection status in dashboard