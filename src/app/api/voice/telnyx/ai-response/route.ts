// Telnyx AI Response Handler - Processes customer speech and continues conversation
import { NextRequest, NextResponse } from "next/server";
import { generateCustomVoiceAudio, createCustomVoiceCommand } from "@/lib/voice/customVoiceHelper";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('🎤 [AI-RESPONSE] Telnyx AI Response Webhook received:', JSON.stringify(body, null, 2));
    
    const event = body.data;
    const callId = event.call_control_id || event.id;
    
    // Check if this is a speech result or another event type
    if (!event.speech_result && event.event_type !== 'call.gather.ended') {
      console.log('⚠️ [AI-RESPONSE] No speech result in event, event type:', event.event_type);
      
      // Handle different event types that might come to this endpoint
      if (event.event_type === 'call.speak.ended') {
        console.log('🔊 [AI-RESPONSE] Speak command completed, waiting for customer response...');
        return NextResponse.json({ success: true, message: 'Speak ended, awaiting response' });
      }
      
      // For other events without speech results, return a simple acknowledgment
      return NextResponse.json({ success: true, message: 'Event received' });
    }
    
    // Handle gather timeout (customer didn't respond)
    if (event.event_type === 'call.gather.ended' && !event.speech_result) {
      console.log('⏰ [AI-RESPONSE] Gather timeout - customer did not respond');
      return NextResponse.json({
        commands: [
          {
            command: 'speak',
            text: "Hello? Are you still there? I'm calling about your interest in our services. Please let me know if you can hear me.",
            voice: 'female'
          },
          {
            command: 'gather_using_speech',
            speech_timeout: 8000,
            speech_end_timeout: 1500,
            language: 'en-US',
            webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ghostcrm.ai'}/api/voice/telnyx/ai-response`,
            inter_digit_timeout: 3000
          }
        ]
      });
    }
    
    const speechResult = event.speech_result;
    
    // Extract customer speech
    const customerSpeech = speechResult?.transcript || '';
    const confidence = speechResult?.confidence || 0;
    
    console.log(`🗣️ [AI-RESPONSE] Customer speech detected - Call ID: ${callId}`);
    console.log(`📝 [AI-RESPONSE] Transcript: "${customerSpeech}"`);
    console.log(`📊 [AI-RESPONSE] Confidence: ${confidence}`);
    
    // Handle empty or very low confidence responses
    if (!customerSpeech || customerSpeech.trim().length === 0) {
      console.log('🤷 [AI-RESPONSE] Empty speech detected, prompting again...');
      return NextResponse.json({
        commands: [
          {
            command: 'speak',
            text: "I didn't catch that. Are you still there? Please say something so I know you can hear me.",
            voice: 'female'
          },
          {
            command: 'gather_using_speech',
            speech_timeout: 12000,
            speech_end_timeout: 2000,
            language: 'en-US',
            webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ghostcrm.ai'}/api/voice/telnyx/ai-response`
          }
        ]
      });
    }
    
    // Low confidence - ask for clarification
    if (confidence < 0.5) {
      console.log('⚠️ [AI-RESPONSE] Low confidence speech, asking for clarification...');
      return NextResponse.json({
        commands: [
          {
            command: 'speak',
            text: "I'm sorry, I didn't catch that clearly. Could you repeat that please?",
            voice: 'female'
          },
          {
            command: 'gather_using_speech',
            speech_timeout: 12000,
            speech_end_timeout: 2000,
            language: 'en-US',
            webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ghostcrm.ai'}/api/voice/telnyx/ai-response`
          }
        ]
      });
    }
    
    // Detect language and intent
    const isSpanish = detectSpanishSpeech(customerSpeech);
    const conversationState = analyzeCustomerResponse(customerSpeech);
    
    // Generate AI response based on customer input
    const aiResponse = await generateAIResponse(customerSpeech, conversationState, isSpanish);
    
    // Determine next action based on conversation state
    let commands: any[] = [];
    
    if (conversationState === 'interested') {
      // Generate high-quality custom voice audio
      const audioResult = await generateCustomVoiceAudio(aiResponse, {
        tenantId: 'current_tenant', // TODO: Extract from call context
        voiceType: 'sales',
        language: isSpanish ? 'es-US' : 'en-US'
      });
      
      const audioCommand = createCustomVoiceCommand(audioResult, {
        tenantId: 'current_tenant',
        voiceType: 'sales',
        language: isSpanish ? 'es-US' : 'en-US'
      }, aiResponse);
      
      commands = [
        audioCommand,
        {
          command: 'gather_using_speech', 
          speech_timeout: 15000,
          speech_end_timeout: 3000,
          language: isSpanish ? 'es-US' : 'en-US',
          webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/telnyx/ai-response`
        }
      ];
    } else if (conversationState === 'not_interested') {
      // Generate custom voice audio for polite goodbye
      const audioResult = await generateCustomVoiceAudio(aiResponse, {
        tenantId: 'current_tenant',
        voiceType: 'primary',
        language: isSpanish ? 'es-US' : 'en-US'
      });
      
      const audioCommand = createCustomVoiceCommand(audioResult, {
        tenantId: 'current_tenant',
        voiceType: 'primary',
        language: isSpanish ? 'es-US' : 'en-US'
      }, aiResponse);
      
      commands = [
        audioCommand,
        {
          command: 'hangup'
        }
      ];
    } else if (conversationState === 'schedule_callback') {
      // Generate custom voice audio for callback scheduling
      const audioResult = await generateCustomVoiceAudio(aiResponse, {
        tenantId: 'current_tenant',
        voiceType: 'support',
        language: isSpanish ? 'es-US' : 'en-US'
      });
      
      const audioCommand = createCustomVoiceCommand(audioResult, {
        tenantId: 'current_tenant',
        voiceType: 'support',
        language: isSpanish ? 'es-US' : 'en-US'
      }, aiResponse);
      
      commands = [
        audioCommand,
        {
          command: 'gather_using_speech',
          speech_timeout: 10000,
          speech_end_timeout: 2000,
          language: isSpanish ? 'es-US' : 'en-US',
          webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/telnyx/ai-response`
        }
      ];
    } else {
      // Continue conversation with tenant's custom voice
      const audioResult = await generateCustomVoiceAudio(aiResponse, {
        tenantId: 'current_tenant',
        voiceType: isSpanish ? 'spanish' : 'primary',
        language: isSpanish ? 'es-US' : 'en-US'
      });
      
      const audioCommand = createCustomVoiceCommand(audioResult, {
        tenantId: 'current_tenant',
        voiceType: isSpanish ? 'spanish' : 'primary',
        language: isSpanish ? 'es-US' : 'en-US'
      }, aiResponse);
      
      commands = [
        audioCommand,
        {
          command: 'gather_using_speech',
          speech_timeout: 12000,
          speech_end_timeout: 2500,
          language: isSpanish ? 'es-US' : 'en-US',
          webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/telnyx/ai-response`
        }
      ];
    }
    
    return new Response(JSON.stringify({ commands }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error processing Telnyx AI response:', error);
    
    // Fallback graceful ending
    const fallbackCommands = {
      commands: [
        {
          command: 'speak',
          text: "Thank you for your time. Someone from our team will follow up with you soon. Have a great day!",
          voice: 'female'
        },
        {
          command: 'hangup'
        }
      ]
    };
    return new Response(JSON.stringify(fallbackCommands), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Detect if customer is speaking Spanish
function detectSpanishSpeech(speech: string): boolean {
  const spanishKeywords = [
    'sí', 'no', 'hola', 'gracias', 'por favor', 'disculpe', 
    'qué', 'cómo', 'cuándo', 'dónde', 'español', 'habla'
  ];
  
  const lowerSpeech = speech.toLowerCase();
  return spanishKeywords.some(keyword => lowerSpeech.includes(keyword));
}

// Analyze customer response to determine conversation state
function analyzeCustomerResponse(speech: string): string {
  const lowerSpeech = speech.toLowerCase();
  
  // Check for interest indicators
  const interestedKeywords = [
    'interested', 'yes', 'tell me more', 'sounds good', 'how much',
    'pricing', 'cost', 'when', 'demo', 'trial', 'sí', 'interesado'
  ];
  
  // Check for disinterest indicators
  const notInterestedKeywords = [
    'not interested', 'no thanks', 'busy', 'not now', 'remove',
    'stop calling', 'no gracias', 'ocupado', 'ahora no'
  ];
  
  // Check for callback requests
  const callbackKeywords = [
    'call back', 'later', 'busy now', 'different time', 
    'schedule', 'más tarde', 'ocupado'
  ];
  
  if (interestedKeywords.some(keyword => lowerSpeech.includes(keyword))) {
    return 'interested';
  }
  
  if (notInterestedKeywords.some(keyword => lowerSpeech.includes(keyword))) {
    return 'not_interested';
  }
  
  if (callbackKeywords.some(keyword => lowerSpeech.includes(keyword))) {
    return 'schedule_callback';
  }
  
  return 'continue';
}

// Generate AI response using OpenAI
async function generateAIResponse(customerSpeech: string, conversationState: string, isSpanish: boolean) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return getFallbackResponse(conversationState, isSpanish);
    }
    
    const language = isSpanish ? 'Spanish' : 'English';
    const prompt = `You are a professional AI sales assistant. A customer just said: "${customerSpeech}". 
    
    Conversation state: ${conversationState}
    
    Generate a natural, conversational response in ${language} that:
    - Acknowledges what they said
    - ${conversationState === 'interested' ? 'Provides helpful information and asks a follow-up question' : ''}
    - ${conversationState === 'not_interested' ? 'Respectfully acknowledges their position and offers to remove them from calls' : ''}
    - ${conversationState === 'schedule_callback' ? 'Offers to schedule a better time and asks when works for them' : ''}
    - ${conversationState === 'continue' ? 'Keeps the conversation flowing naturally' : ''}
    - Stays under 50 words
    - Sounds natural and human-like`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.8
      })
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content?.trim();
    
    return aiResponse || getFallbackResponse(conversationState, isSpanish);

  } catch (error) {
    console.error('Error generating AI response:', error);
    return getFallbackResponse(conversationState, isSpanish);
  }
}

// Fallback responses when OpenAI is not available
function getFallbackResponse(conversationState: string, isSpanish: boolean): string {
  const responses = {
    interested: {
      en: "That's great to hear! Our solution can really help streamline your operations. What's your biggest challenge right now?",
      es: "¡Excelente! Nuestra solución puede realmente ayudar a optimizar sus operaciones. ¿Cuál es su mayor desafío actualmente?"
    },
    not_interested: {
      en: "I completely understand. Thank you for your time, and we'll make sure to remove you from our call list.",
      es: "Entiendo completamente. Gracias por su tiempo, y nos aseguraremos de removerlo de nuestra lista de llamadas."
    },
    schedule_callback: {
      en: "Of course! I'd be happy to schedule a better time. What day and time works best for you?",
      es: "¡Por supuesto! Me complace programar un mejor momento. ¿Qué día y hora le conviene más?"
    },
    continue: {
      en: "I understand. Let me ask you this - what's most important to you when choosing a solution like this?",
      es: "Entiendo. Déjeme preguntarle esto - ¿qué es lo más importante para usted al elegir una solución como esta?"
    }
  };
  
  const lang = isSpanish ? 'es' : 'en';
  return responses[conversationState as keyof typeof responses]?.[lang] || responses.continue[lang];
}

// Health check endpoint
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    status: 'Telnyx AI Response Handler Active',
    timestamp: new Date().toISOString() 
  });
}