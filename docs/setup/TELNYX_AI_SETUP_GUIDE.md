# Telnyx AI Telephony Setup Guide

## 🚀 Quick Setup for Telnyx AI Calling

Your AI telephony integration is now configured to use Telnyx instead of Twilio. Here's what you need to set up:

### 1. **Environment Variables**
Add these to your `.env.local`:

```env
# Telnyx Configuration
TELNYX_API_KEY=YOUR_TELNYX_API_KEY_HERE
TELNYX_CONNECTION_ID="YOUR_CONNECTION_ID_HERE"
BUSINESS_PHONE_NUMBER="+1XXXXXXXXXX"

# AI Configuration
ELEVENLABS_API_KEY="your_elevenlabs_api_key" 
OPENAI_API_KEY="your_openai_api_key"
NEXT_PUBLIC_BASE_URL="https://ghostcrm.ai"  # Production
# NEXT_PUBLIC_BASE_URL="http://localhost:3000"  # Local testing
```

### 2. **Telnyx Dashboard Webhooks**
Configure these webhook URLs in your Telnyx dashboard:

**For Production (ghostcrm.ai):**
- **Call Control Webhook**: `https://ghostcrm.ai/api/voice/telnyx/ai-answer`
- **Status Webhook**: `https://ghostcrm.ai/api/voice/telnyx/ai-status` 
- **Recording Webhook**: `https://ghostcrm.ai/api/voice/telnyx/ai-recording`

**For Local Testing:**
- **Call Control Webhook**: `http://localhost:3000/api/voice/telnyx/ai-answer`
- **Status Webhook**: `http://localhost:3000/api/voice/telnyx/ai-status`
- **Recording Webhook**: `http://localhost:3000/api/voice/telnyx/ai-recording`

*Note: For local testing, you'll need to use ngrok to expose your localhost to Telnyx*

### 3. **Provider Account Configuration**
In your database, ensure your Telnyx provider account has:

```json
{
  "provider": "telnyx",
  "meta": {
    "apiKey": "YOUR_TELNYX_API_KEY_HERE",
    "connectionId": "YOUR_CONNECTION_ID_HERE", 
    "defaultFrom": "+1XXXXXXXXXX"
  }
}
```

## 🎯 **Features Enabled**

### **AI Conversation Flow**
1. **Call Initiation** → Uses your existing telephony infrastructure
2. **Machine Detection** → Automatically handles voicemail vs human
3. **Adaptive Greetings** → AI generates contextual opening based on lead info
4. **Natural Conversation** → OpenAI powers real-time responses
5. **Language Detection** → Switches between English/Spanish automatically
6. **Call Recording** → Automatic recording with optional transcription

### **Professional Voice Selection**
- **Female**: Sarah, Maria (bilingual), Jessica
- **Male**: Michael, Carlos (bilingual), David
- **Adaptive Personality** → AI adjusts tone based on customer responses

### **Smart Call Handling**
- **No Answer/Busy** → Automatic retry scheduling
- **Brief Conversations** → Follow-up task creation  
- **Full Conversations** → High-priority lead marking
- **Voicemail** → Professional message with callback request

## 🔧 **Integration Points**

### **Existing Systems**
✅ Uses your current `src/lib/telephony/` infrastructure  
✅ Integrates with existing provider account system  
✅ Respects org-based phone number configuration  
✅ Compatible with your database schema  

### **New API Endpoints**
- `/api/voice/initiate-ai-call` → Main call initiation
- `/api/voice/telnyx/ai-answer` → Call handling & conversation start
- `/api/voice/telnyx/ai-response` → Customer speech processing  
- `/api/voice/telnyx/ai-status` → Call event tracking
- `/api/voice/telnyx/ai-recording` → Post-call analysis

## 🎮 **How to Use**

1. **Select Voice & Language** in the AI Call Script Modal
2. **Click "Start AI Call"** → Uses your business number via Telnyx
3. **AI Agent Adapts** → Natural conversation based on customer responses
4. **Automatic Follow-up** → Creates tasks based on call outcome

## 🔄 **vs Twilio Differences**

| Feature | Telnyx | Twilio |
|---------|---------|---------|
| Webhooks | JSON format | Form data |
| Voice Commands | `speak`, `gather_using_speech` | TwiML XML |
| Recording | Built-in MP3 | Requires configuration |
| Machine Detection | Native support | Additional cost |
| Pricing | Generally lower | Higher for international |

Your Telnyx AI calling system is ready to go! 🚀