// Telnyx AI Call Answer Handler - Initiates AI conversation when call is answered
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('🎯 [TELNYX WEBHOOK] Received event:', {
      eventType: body.data?.event_type,
      callId: body.data?.id,
      fullBody: body
    });
    
    // Extract call information from Telnyx webhook
    const event = body.data;
    const callId = event.id;
    const callState = event.client_state;
    
    console.log('📞 [TELNYX WEBHOOK] Call details:', {
      callId,
      eventType: event.event_type,
      hasClientState: !!callState,
      to: event.to,
      from: event.from
    });
    
    // Decode voice configuration from client_state
    let voiceConfig, leadPhone;
    try {
      const decodedState = JSON.parse(atob(callState));
      voiceConfig = decodedState.voiceConfig;
      leadPhone = decodedState.leadPhone;
      console.log('🧠 [TELNYX WEBHOOK] Decoded voice config:', { voiceConfig, leadPhone });
    } catch (e) {
      console.error('❌ Error decoding client_state:', e);
      voiceConfig = { voice: 'sarah', language: 'en' };
      leadPhone = event.to;
    }

    // Handle different call events
    if (event.event_type === 'call.answered') {
      console.log(`🎉 [TELNYX WEBHOOK] AI call ${callId} answered - starting conversation`);
      
      // Generate adaptive AI greeting
      const aiGreeting = await generateAIGreeting(leadPhone, voiceConfig);
      console.log(`🗣️ [TELNYX WEBHOOK] Generated greeting: "${aiGreeting}"`);
      
      // Create Telnyx response commands
      const commands = [
        {
          command: 'speak',
          text: aiGreeting,
          voice: mapVoiceToTelnyx(voiceConfig.voice),
          language: voiceConfig.language || 'en-US'
        },
        {
          command: 'gather_using_speech',
          speech_timeout: 10000,
          speech_end_timeout: 2000,
          language: voiceConfig.language || 'en-US',
          webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/telnyx/ai-response`
        }
      ];

      console.log(`🎮 [TELNYX WEBHOOK] Sending commands:`, commands);
      return NextResponse.json({
        commands: commands
      });
    }
    
    // Handle machine detection
    if (event.event_type === 'call.machine.detection.ended') {
      if (event.machine_detection_result === 'machine') {
        console.log(`Voicemail detected for call ${callId} - leaving message`);
        
        const voicemailMessage = await generateVoicemailMessage(leadPhone, voiceConfig);
        
        return NextResponse.json({
          commands: [
            {
              command: 'speak',
              text: voicemailMessage,
              voice: mapVoiceToTelnyx(voiceConfig.voice)
            },
            {
              command: 'hangup'
            }
          ]
        });
      }
    }

    // Handle any other call events (for debugging)
    console.log(`🤔 [TELNYX WEBHOOK] Unhandled event type: ${event.event_type}`);

    // Default response for other events
    return NextResponse.json({ 
      message: 'Event received',
      commands: []
    });

  } catch (error) {
    console.error('Error processing Telnyx AI answer:', error);
    
    // Fallback response
    return NextResponse.json({
      commands: [
        {
          command: 'speak',
          text: "Hello! Thank you for your interest. Let me connect you with someone who can help.",
          voice: 'female'
        },
        {
          command: 'hangup'
        }
      ]
    });
  }
}

// Generate adaptive AI greeting based on lead information
async function generateAIGreeting(phoneNumber: string, voiceConfig: any) {
  try {
    const isSpanish = voiceConfig.language?.includes('es');
    
    // TODO: Fetch lead information from your database
    // const leadInfo = await getLeadByPhone(phoneNumber);
    
    // Generate contextual greeting using OpenAI
    const prompt = isSpanish 
      ? `Genera un saludo profesional en español para una llamada de ventas. Sé natural y conversacional, menciona que estás llamando sobre su interés en nuestros servicios. Mantén el saludo bajo 30 palabras.`
      : `Generate a professional, natural greeting for a sales call. Mention you're calling about their interest in our services. Keep it under 30 words and conversational.`;
    
    // If OpenAI is available, generate dynamic greeting
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      const aiGreeting = data.choices?.[0]?.message?.content?.trim();
      
      if (aiGreeting) return aiGreeting;
    }
    
    // Fallback greetings
    return isSpanish 
      ? "¡Hola! Soy Sarah de su equipo de ventas. ¿Es un buen momento para hablar sobre nuestros servicios?"
      : "Hello! This is Sarah from your sales team. Is now a good time to discuss our services?";
    
  } catch (error) {
    console.error('Error generating AI greeting:', error);
    return "Hello! Thank you for your interest in our services. How can I help you today?";
  }
}

// Generate voicemail message
async function generateVoicemailMessage(phoneNumber: string, voiceConfig: any) {
  const isSpanish = voiceConfig.language?.includes('es');
  
  return isSpanish 
    ? "Hola, soy Sarah del equipo de ventas. Lamento no haber podido contactarte directamente. Te volveré a llamar pronto, o puedes llamarnos cuando sea conveniente para ti. ¡Gracias!"
    : "Hello, this is Sarah from the sales team. Sorry I missed you! I'll try calling back soon, or feel free to call us when it's convenient. Thank you!";
}

// Map voice selection to Telnyx voice options
function mapVoiceToTelnyx(voiceName: string) {
  const voiceMap: Record<string, string> = {
    'sarah': 'female',
    'maria': 'female', 
    'jessica': 'female',
    'michael': 'male',
    'carlos': 'male',
    'david': 'male'
  };
  
  return voiceMap[voiceName] || 'female';
}

// Health check endpoint
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    status: 'Telnyx AI Answer Handler Active',
    timestamp: new Date().toISOString() 
  });
}