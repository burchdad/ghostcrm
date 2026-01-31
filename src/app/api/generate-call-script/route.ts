import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateAdvancedFallbackScript } from '../../../utils/call-scripts/fallbackScriptManager';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Agent types definition for fallback script generation
const agentTypes = [
  {
    id: "professional-female",
    name: "Professional Sales Agent (Female)",
    description: "Balanced, consultative approach",
    features: ["Industry expertise", "Consultative style"],
    voice: "female",
    language: "en"
  },
  {
    id: "professional-male",
    name: "Professional Sales Agent (Male)", 
    description: "Balanced, consultative approach",
    features: ["Industry expertise", "Consultative style"],
    voice: "male",
    language: "en"
  },
  {
    id: "aggressive-male", 
    name: "Aggressive Closer (Male)",
    description: "Direct, urgency-focused approach",
    features: ["High pressure", "Quick close"],
    voice: "male", 
    language: "en"
  },
  {
    id: "friendly-female",
    name: "Friendly Casual (Female)", 
    description: "Warm, relationship-focused approach",
    features: ["Personal connection", "Conversational"],
    voice: "female",
    language: "en"
  },
  {
    id: "consultative-male",
    name: "Expert Advisor (Male)",
    description: "Educational, problem-solving approach", 
    features: ["Market insights", "Advisory style"],
    voice: "male",
    language: "en"
  },
  {
    id: "professional-female-es",
    name: "Professional Sales Agent (Female - Spanish)",
    description: "Balanced, consultative approach in Spanish",
    features: ["Industry expertise", "Bilingual support"],
    voice: "female",
    language: "es"
  },
  {
    id: "friendly-male-es",
    name: "Friendly Casual (Male - Spanish)",
    description: "Warm, relationship-focused approach in Spanish", 
    features: ["Personal connection", "Bilingual support"],
    voice: "male",
    language: "es"
  }
];

export async function POST(request: NextRequest) {
  // Initialize OpenAI with environment credentials at runtime
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  try {
    const { 
      prompt, 
      agentType, 
      leadData, 
      conversationType, 
      transcriptionEnabled,
      multilingualEnabled,
      primaryLanguage,
      supportedLanguages
    } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, using enhanced fallback script generation');
      return NextResponse.json({
        script: generateAdvancedFallbackScript(leadData, agentType, agentTypes),
        source: 'enhanced_fallback',
        conversationType: conversationType || 'standard',
        transcriptionEnabled: transcriptionEnabled || false,
        multilingualEnabled: multilingualEnabled || false,
        supportedLanguages: supportedLanguages || ['en']
      });
    }

    // Enhanced system prompt for live AI agent conversations with multilingual support
    const systemPrompt = conversationType === 'live-ai-agent' ? 
      `You are a live AI sales agent conducting real-time phone conversations with car buyers. Your responses will be spoken aloud by an AI voice system and monitored by Whisper transcription in real-time.

${multilingualEnabled ? `
MULTILINGUAL CAPABILITIES:
- You can seamlessly switch between languages during conversations
- Always start with language preference check in opening
- Supported languages: ${supportedLanguages?.join(', ') || 'English, Spanish'}
- If customer requests unsupported language, offer to connect with specialist
- Maintain same personality and sales approach regardless of language
- Use culturally appropriate communication styles for each language
- Whisper transcription logs remain in English for internal processing
` : ''}

LIVE CONVERSATION OPTIMIZATION:
- Generate natural, flowing conversation guides that work for real-time interactions
- Include strategic pause points marked as [PAUSE FOR RESPONSE]
- Use clear, distinct speech patterns optimized for voice synthesis
- Structure responses for natural back-and-forth dialogue
- Include empathy markers and active listening cues
- Optimize for Whisper transcription accuracy with clear pronunciation
- Build in conversation recovery points for unexpected responses
- Include objection handling and redirect strategies

REAL-TIME INTERACTION PRINCIPLES:
1. Sound completely natural when spoken aloud by AI voice
2. Include conversational connectors and transitions
3. Use customer name strategically for engagement
4. Build rapport through genuine interest and empathy
5. Ask engaging questions that invite detailed responses
6. Provide clear value propositions based on customer inputs
7. Guide toward specific actions (appointment, test drive, callback)
${multilingualEnabled ? '8. Always accommodate customer language preferences with cultural sensitivity' : ''}

Your output will be used by a live AI agent system with Whisper transcription monitoring every word.` :
      `You are an expert automotive sales trainer who creates natural, conversational call scripts. Your scripts should sound like real human conversations, not robotic templates. Focus on building rapport, understanding customer needs, and providing value.

Key principles:
1. Sound completely natural and conversational
2. Use contractions and natural speech patterns
3. Include empathy and active listening cues
4. Be customer-focused, not sales-focused
5. Build trust through expertise and helpfulness
6. Use open-ended questions to engage
7. Avoid sounding scripted or pushy
${multilingualEnabled ? '8. Include language preference accommodation' : ''}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Optimized for real-time conversation generation
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: conversationType === 'live-ai-agent' ? 0.8 : 0.7, // Higher creativity for live conversations
      max_tokens: conversationType === 'live-ai-agent' ? 1500 : 1000, // More tokens for complex live interactions
    });

    const script = completion.choices[0]?.message?.content || generateAdvancedFallbackScript(leadData, agentType, agentTypes);

    // Add Whisper transcription and multilingual metadata if enabled
    const responseData: any = {
      script: script,
      source: 'openai',
      agentType: agentType,
      leadData: leadData,
      conversationType: conversationType || 'standard',
      transcriptionEnabled: transcriptionEnabled || false,
      multilingualEnabled: multilingualEnabled || false,
      primaryLanguage: primaryLanguage || 'en',
      supportedLanguages: supportedLanguages || ['en']
    };

    // Add live conversation metadata
    if (conversationType === 'live-ai-agent') {
      responseData.liveAgentMetadata = {
        voiceOptimized: true,
        whisperReady: transcriptionEnabled,
        multilingualReady: multilingualEnabled,
        conversationFlow: 'dynamic',
        pausePoints: script.split('[PAUSE FOR RESPONSE]').length - 1,
        languageSwitchPoints: multilingualEnabled ? script.split('LANGUAGE').length - 1 : 0,
        estimatedDuration: Math.ceil(script.length / 150) // Rough estimate in minutes
      };
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error generating AI call script:', error);
    
    // Enhanced fallback for live AI agent scenarios
    const { leadData, agentType, conversationType, transcriptionEnabled, multilingualEnabled } = await request.json();
    return NextResponse.json({
      script: generateAdvancedFallbackScript(leadData, agentType, agentTypes),
      source: 'enhanced_fallback',
      conversationType: conversationType || 'standard',
      transcriptionEnabled: transcriptionEnabled || false,
      multilingualEnabled: multilingualEnabled || false,
      error: 'AI generation failed, using enhanced fallback optimized for live conversations with language support'
    });
  }
}