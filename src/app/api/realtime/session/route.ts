import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { offer, sessionConfig } = await req.json();

    if (!offer?.sdp) {
      return NextResponse.json(
        { error: "SDP offer is required" },
        { status: 400 }
      );
    }

    console.log('🌐 [REALTIME API] Creating WebRTC session for user:', user.id);

    // Create realtime session with OpenAI
    const realtimeResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        offer: {
          type: 'offer',
          sdp: offer.sdp
        },
        session: {
          model: 'gpt-4o-realtime-preview-2024-12-17',
          modalities: ['text', 'audio'],
          instructions: `You are ARIA, the intelligent AI assistant for Ghost CRM automotive dealership management system.
          
🤖 CORE CAPABILITIES:
- Real-time conversational AI with natural speech patterns
- Direct access to CRM systems (leads, deals, inventory, appointments)
- Automotive industry specialization and expertise
- Multi-system search and intelligent recommendations
- Live data analysis and real-time insights
- Dynamic response generation based on actual CRM context

🎯 PERSONALITY & STYLE:
- Professional yet approachable automotive sales assistant
- Knowledgeable about vehicles, financing, trade-ins, and dealership operations  
- Quick, concise responses optimized for voice interaction
- Proactive with helpful suggestions and next steps
- Adaptive based on user context and real-time data

🚗 AUTOMOTIVE CONTEXT:
- Vehicle sales pipeline management with real-time lead data
- Trade-in valuations using live market analysis
- Financing and loan assistance with current rates
- Inventory management with real-time availability
- Customer relationship management with interaction history
- Appointment scheduling with live calendar integration

🔊 VOICE INTERACTION GUIDELINES:
- Keep responses conversational and under 30 seconds when possible
- Use natural speech patterns, not formal written language
- Ask clarifying questions when needed based on missing CRM data
- Provide actionable next steps using real system capabilities
- Acknowledge user inputs and confirm understanding with data context
- Reference actual customer names, vehicle details, and deal status when relevant

🎭 DYNAMIC INTELLIGENCE:
- Generate responses based on real CRM data instead of templates
- Adapt conversation flow based on user's current page/context
- Use actual lead status, deal probability, and inventory data
- Provide real-time market insights and competitive intelligence
- Reference live customer interactions and appointment history

User Organization: ${user.organizationId || 'Default'}
Context: Real-time voice conversation in Ghost CRM interface with live data access`,
          voice: 'alloy', // Professional, clear voice
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500
          },
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'whisper-1'
          },
          temperature: 0.7,
          max_response_output_tokens: 4096,
          ...sessionConfig
        }
      })
    });

    if (!realtimeResponse.ok) {
      const errorText = await realtimeResponse.text();
      console.error('❌ [REALTIME API] Session creation failed:', errorText);
      return NextResponse.json(
        { error: "Failed to create realtime session" },
        { status: 500 }
      );
    }

    const { answer } = await realtimeResponse.json();
    
    console.log('✅ [REALTIME API] WebRTC session created successfully');

    return NextResponse.json({
      answer: answer,
      sessionId: `session_${Date.now()}`,
      model: 'gpt-4o-realtime-preview-2024-12-17',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("❌ [REALTIME API] Error:", error);
    
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "OpenAI API configuration error" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to create realtime session",
        details: error.message 
      },
      { status: 500 }
    );
  }
}