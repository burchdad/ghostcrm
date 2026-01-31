// AI Response Handler - Processes customer speech and continues adaptive conversation
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const speechResult = formData.get('SpeechResult') as string;
    const confidence = formData.get('Confidence') as string;
    const digits = formData.get('Digits') as string;
    const callSid = formData.get('CallSid') as string;
    
    // Extract configuration from URL parameters
    const url = new URL(req.url);
    const voiceConfigString = url.searchParams.get("voice") || "";
    const leadDataString = url.searchParams.get("lead") || "";
    const conversationState = url.searchParams.get("state") || "language_check";
    
    let voiceConfig, leadData;
    try {
      voiceConfig = JSON.parse(decodeURIComponent(voiceConfigString));
      leadData = JSON.parse(decodeURIComponent(leadDataString));
    } catch (error) {
      console.error('Error parsing conversation parameters:', error);
      voiceConfig = {};
      leadData = {};
    }

    // Log customer response for analytics
    console.log('AI Conversation Response:', {
      callSid,
      speech: speechResult,
      confidence: parseFloat(confidence || '0'),
      digits,
      state: conversationState,
      leadName: leadData.name
    });

    // Process customer response with AI
    const aiResponse = await generateAIResponse(
      speechResult || digits, 
      voiceConfig, 
      leadData, 
      conversationState
    );

    // Determine next conversation state
    const nextState = determineNextState(speechResult, digits, conversationState);
    
    // Generate TwiML response
    const twiml = createAdaptiveTwiML(aiResponse, voiceConfig, leadData, nextState);

    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" }
    });

  } catch (error) {
    console.error('Error processing AI response:', error);
    
    // Fallback TwiML for errors
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">I apologize, but I'm having some technical difficulties. Let me transfer you to one of our team members, or I can call you back shortly.</Say>
  <Pause length="1"/>
  <Say>Thank you for your patience.</Say>
  <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" }
    });
  }
}

// Generate AI response based on customer input
async function generateAIResponse(
  customerInput: string, 
  voiceConfig: any, 
  leadData: any, 
  conversationState: string
) {
  if (!customerInput || customerInput.trim().length === 0) {
    return getNoResponseFallback(conversationState, voiceConfig);
  }

  try {
    // Call OpenAI for adaptive response generation
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate-ai-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerInput: customerInput,
        conversationState: conversationState,
        leadData: leadData,
        voiceConfig: voiceConfig,
        adaptiveMode: true
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.response || getFallbackResponse(conversationState, voiceConfig);
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
  }

  // Fallback to predetermined responses
  return getFallbackResponse(conversationState, voiceConfig);
}

// Determine next conversation state based on customer response
function determineNextState(speech: string, digits: string, currentState: string) {
  const input = (speech || digits || '').toLowerCase();
  
  switch (currentState) {
    case 'language_check':
      if (input.includes('spanish') || input.includes('español') || digits === '2') {
        return 'discovery_spanish';
      }
      return 'discovery_english';
      
    case 'discovery_english':
    case 'discovery_spanish':
      if (input.includes('not interested') || input.includes('no gracias') || digits === '9') {
        return 'polite_goodbye';
      }
      return 'presentation';
      
    case 'presentation':
      if (input.includes('yes') || input.includes('sí') || input.includes('interested') || digits === '1') {
        return 'scheduling';
      }
      return 'objection_handling';
      
    case 'objection_handling':
      return 'soft_close';
      
    case 'scheduling':
      return 'confirmation';
      
    default:
      return 'polite_goodbye';
  }
}

// Create adaptive TwiML based on AI response and conversation state
function createAdaptiveTwiML(
  aiResponse: string, 
  voiceConfig: any, 
  leadData: any, 
  nextState: string
) {
  const ttsVoice = getTwilioVoice(voiceConfig);
  const isSpanish = voiceConfig.language === 'es' || nextState.includes('spanish');
  const language = isSpanish ? 'es-US' : 'en-US';
  
  let gatherAction = '';
  let gatherTimeout = '8';
  
  if (nextState === 'polite_goodbye' || nextState === 'confirmation') {
    // Final states - no gather needed
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${ttsVoice}">${escapeXml(aiResponse)}</Say>
  <Pause length="1"/>
  <Hangup/>
</Response>`;
  }
  
  // Continue conversation with gather for response
  gatherAction = `/api/voice/twilio/ai-response?voice=${encodeURIComponent(JSON.stringify(voiceConfig))}&lead=${encodeURIComponent(JSON.stringify(leadData))}&state=${nextState}`;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${ttsVoice}">${escapeXml(aiResponse)}</Say>
  
  <Gather 
    input="speech dtmf" 
    speechTimeout="3" 
    timeout="${gatherTimeout}" 
    numDigits="1" 
    action="${gatherAction}" 
    method="POST"
    enhanced="true"
    speechModel="experimental_conversations"
    language="${language}"
  >
    <Pause length="2"/>
    <Say voice="${ttsVoice}">${escapeXml(getFollowUpPrompt(nextState, isSpanish))}</Say>
  </Gather>
  
  <!-- No response fallback -->
  <Say voice="${ttsVoice}">${escapeXml(getNoResponseMessage(isSpanish))}</Say>
  <Hangup/>
</Response>`;
}

// Get fallback response for when OpenAI is unavailable
function getFallbackResponse(state: string, voiceConfig: any) {
  const isSpanish = voiceConfig.language === 'es';
  
  const responses = {
    language_check: isSpanish 
      ? "Perfecto, continuemos en español. Me gustaría conocer más sobre sus necesidades de vehículo."
      : "Perfect! I'd love to learn more about your vehicle needs.",
      
    discovery_english: "That's great! What's most important to you in your next vehicle - reliability, fuel efficiency, or maybe performance?",
    
    discovery_spanish: "¡Excelente! ¿Qué es lo más importante para usted en su próximo vehículo - confiabilidad, eficiencia de combustible, o tal vez rendimiento?",
    
    presentation: "Based on what you've told me, I think I have exactly what you're looking for. Would you be interested in learning more about our options?",
    
    objection_handling: "I completely understand your concerns. Let me see how we can address that and find something that works perfectly for you.",
    
    scheduling: "Wonderful! When would be the best time for you to come in and see this vehicle in person?",
    
    confirmation: "Perfect! I'll get that scheduled for you right away. Thank you so much for your time today!"
  };
  
  return responses[state as keyof typeof responses] || responses.discovery_english;
}

function getNoResponseFallback(state: string, voiceConfig: any) {
  const isSpanish = voiceConfig.language === 'es';
  return isSpanish 
    ? "¿Sigue ahí? Me gustaría asegurarme de que pueda ayudarle con sus necesidades de vehículo."
    : "Are you still there? I want to make sure I can help you with your vehicle needs.";
}

function getFollowUpPrompt(state: string, isSpanish: boolean) {
  if (isSpanish) {
    return state === 'scheduling' 
      ? "¿Cuándo le funcionaría mejor?" 
      : "¿Qué piensa de eso?";
  }
  return state === 'scheduling' 
    ? "What time would work best for you?" 
    : "What do you think about that?";
}

function getNoResponseMessage(isSpanish: boolean) {
  return isSpanish 
    ? "Entiendo que puede estar ocupado. Le llamaremos en otro momento. ¡Que tenga un buen día!"
    : "I understand you might be busy. We'll try calling back another time. Have a great day!";
}

// Map voice configuration to Twilio TTS voices
function getTwilioVoice(voiceConfig: any) {
  const voiceMap = {
    'sarah': 'Polly.Joanna',
    'jessica': 'Polly.Amy', 
    'maria': 'Polly.Penelope',
    'michael': 'Polly.Matthew',
    'david': 'Polly.Brian',
    'carlos': 'Polly.Miguel',
  };
  
  return voiceMap[voiceConfig.id as keyof typeof voiceMap] || 'Polly.Joanna';
}

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, c => ({ 
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' 
  } as any)[c]);
}