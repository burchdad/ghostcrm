// Telnyx AI Response Handler - Processes customer speech and continues conversation
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Telnyx AI Response Webhook:', body);
    
    const event = body.data;
    const callId = event.id;
    const speechResult = event.speech_result;
    
    // Extract customer speech
    const customerSpeech = speechResult?.transcript || '';
    const confidence = speechResult?.confidence || 0;
    
    console.log(`Customer speech (${confidence}): "${customerSpeech}"`);
    
    // Low confidence - ask for clarification
    if (confidence < 0.6) {
      return NextResponse.json({
        commands: [
          {
            command: 'speak',
            text: "I'm sorry, I didn't catch that. Could you repeat that please?",
            voice: 'female'
          },
          {
            command: 'gather_using_speech',
            speech_timeout: 10000,
            speech_end_timeout: 2000,
            webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/telnyx/ai-response`
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
      commands = [
        {
          command: 'speak',
          text: aiResponse,
          voice: 'female',
          language: isSpanish ? 'es-US' : 'en-US'
        },
        {
          command: 'gather_using_speech', 
          speech_timeout: 15000,
          speech_end_timeout: 3000,
          language: isSpanish ? 'es-US' : 'en-US',
          webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/telnyx/ai-response`
        }
      ];
    } else if (conversationState === 'not_interested') {
      commands = [
        {
          command: 'speak',
          text: aiResponse,
          voice: 'female',
          language: isSpanish ? 'es-US' : 'en-US'
        },
        {
          command: 'hangup'
        }
      ];
    } else if (conversationState === 'schedule_callback') {
      commands = [
        {
          command: 'speak', 
          text: aiResponse,
          voice: 'female',
          language: isSpanish ? 'es-US' : 'en-US'
        },
        {
          command: 'gather_using_speech',
          speech_timeout: 10000,
          speech_end_timeout: 2000,
          language: isSpanish ? 'es-US' : 'en-US',
          webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/telnyx/ai-response`
        }
      ];
    } else {
      // Continue conversation
      commands = [
        {
          command: 'speak',
          text: aiResponse,
          voice: 'female',
          language: isSpanish ? 'es-US' : 'en-US'
        },
        {
          command: 'gather_using_speech',
          speech_timeout: 12000,
          speech_end_timeout: 2500,
          language: isSpanish ? 'es-US' : 'en-US',
          webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/telnyx/ai-response`
        }
      ];
    }
    
    return NextResponse.json({ commands });

  } catch (error) {
    console.error('Error processing Telnyx AI response:', error);
    
    // Fallback graceful ending
    return NextResponse.json({
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