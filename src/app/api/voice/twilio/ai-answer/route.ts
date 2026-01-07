// Enhanced TwiML endpoint for AI-driven conversations
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const script = url.searchParams.get("script") || "";
  const voiceConfigString = url.searchParams.get("voice") || "";
  const leadDataString = url.searchParams.get("lead") || "";
  const personalityMode = url.searchParams.get("mode") || "adaptive";

  let voiceConfig;
  let leadData;
  
  try {
    voiceConfig = voiceConfigString ? JSON.parse(decodeURIComponent(voiceConfigString)) : {};
    leadData = leadDataString ? JSON.parse(decodeURIComponent(leadDataString)) : {};
  } catch (error) {
    console.error('Error parsing AI call parameters:', error);
    voiceConfig = {};
    leadData = {};
  }

  // Determine TTS voice based on voice configuration
  const ttsVoice = getTwilioVoice(voiceConfig);
  const decodedScript = decodeURIComponent(script);
  
  // Create adaptive TwiML based on lead data and voice config
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <!-- Initial AI greeting with language detection -->
  <Say voice="${ttsVoice}">${escapeXml(getAdaptiveGreeting(leadData, voiceConfig))}</Say>
  
  <!-- Gather response for language preference and initial engagement -->
  <Gather 
    input="speech dtmf" 
    speechTimeout="3" 
    timeout="10" 
    numDigits="1" 
    action="/api/voice/twilio/ai-response?voice=${encodeURIComponent(JSON.stringify(voiceConfig))}&lead=${encodeURIComponent(JSON.stringify(leadData))}" 
    method="POST"
    enhanced="true"
    speechModel="experimental_conversations"
    language="${voiceConfig.language === 'es' ? 'es-US' : 'en-US'}"
  >
    <!-- Brief pause for customer to process -->
    <Pause length="1"/>
    
    <!-- Follow-up prompt if no immediate response -->
    <Say voice="${ttsVoice}">I'm here to help you with ${leadData.vehicleInterest || 'your vehicle needs'}. Are you still there?</Say>
  </Gather>
  
  <!-- Fallback if no response -->
  <Say voice="${ttsVoice}">I'll try calling back at a better time. Have a great day!</Say>
  <Hangup/>
</Response>`;

  return new NextResponse(twiml, { 
    status: 200, 
    headers: { 
      "Content-Type": "text/xml",
      "Cache-Control": "no-cache"
    }
  });
}

export async function POST(req: NextRequest) {
  // Handle call status updates and machine detection
  const formData = await req.formData();
  const callStatus = formData.get('CallStatus');
  const answeredBy = formData.get('AnsweredBy');
  const callSid = formData.get('CallSid');
  
  console.log('AI Call Status Update:', {
    callSid,
    status: callStatus,
    answeredBy
  });

  if (answeredBy === 'machine_start') {
    // Detected answering machine - leave appropriate message
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Hi, this is an automated message from Ghost CRM. We'd love to speak with you about your vehicle inquiry. Please call us back at your earliest convenience. Thank you!</Say>
  <Hangup/>
</Response>`;
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" }});
  }

  // For human answers, redirect to main AI flow
  return new NextResponse('', { status: 200 });
}

// Generate adaptive greeting based on lead data and time of day
function getAdaptiveGreeting(leadData: any, voiceConfig: any) {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const leadName = leadData.name || 'there';
  const agentName = voiceConfig.name || 'the team';
  
  // Multilingual greeting
  if (voiceConfig.language === 'es') {
    const spanishTimeGreeting = hour < 12 ? 'Buenos días' : hour < 17 ? 'Buenas tardes' : 'Buenas noches';
    return `${spanishTimeGreeting} ${leadName}, soy ${agentName} de Ghost CRM. ¿Prefiere continuar en español o cambiar a inglés?`;
  }
  
  return `${timeGreeting} ${leadName}! This is ${agentName} from Ghost CRM. Before we begin, are you comfortable continuing in English, or would you prefer to speak in Spanish?`;
}

// Map voice configuration to Twilio TTS voices
function getTwilioVoice(voiceConfig: any) {
  const voiceMap = {
    // Female voices
    'sarah': 'Polly.Joanna',
    'jessica': 'Polly.Amy', 
    'maria': 'Polly.Penelope', // Spanish-capable
    
    // Male voices  
    'michael': 'Polly.Matthew',
    'david': 'Polly.Brian',
    'carlos': 'Polly.Miguel', // Spanish voice
  };
  
  const voiceId = voiceConfig.id || 'sarah';
  return voiceMap[voiceId as keyof typeof voiceMap] || 'Polly.Joanna';
}

// Escape XML characters for TwiML
function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, c => ({ 
    '<': '&lt;', 
    '>': '&gt;', 
    '&': '&amp;', 
    "'": '&apos;', 
    '"': '&quot;' 
  } as any)[c]);
}