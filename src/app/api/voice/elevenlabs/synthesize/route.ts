import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const dynamic = 'force-dynamic';

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Voice mapping from UI selection to ElevenLabs voice IDs
const VOICE_MAPPING = {
  // Female voices
  'sarah': 'EXAVITQu4vr4xnSDxMaL',
  'maria': 'ErXwobaYiN019PkySvjV', 
  'jessica': 'cgSgspJ2msm6clMCkdW9',
  
  // Male voices
  'michael': 'flq6f7yk4E4fJM5XTYuZ',
  'carlos': 'onwK4e9ZLuTAKqWW03F9',
  'david': 'pNInz6obpgDQGcFmaJgB'
};

export async function POST(req: NextRequest) {
  try {
    if (!ELEVENLABS_API_KEY) {
      console.error('❌ [ELEVENLABS] API key not configured');
      return NextResponse.json({ 
        error: 'ElevenLabs API key not configured',
        fallbackText: true 
      }, { status: 500 });
    }

    const { text, voiceId = 'sarah', language = 'en-US' } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log(`🎤 [ELEVENLABS] Synthesizing: "${text.substring(0, 50)}..." with voice: ${voiceId}`);

    // Map voice selection to ElevenLabs voice ID
    const elevenLabsVoiceId = VOICE_MAPPING[voiceId as keyof typeof VOICE_MAPPING] || VOICE_MAPPING.sarah;
    
    // Generate audio with ElevenLabs
    const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${elevenLabsVoiceId}/stream`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2', // Best for Spanish/English
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [ELEVENLABS] API Error: ${response.status} - ${errorText}`);
      
      return NextResponse.json({ 
        error: `ElevenLabs API error: ${response.status}`,
        fallbackText: text // Return text for Telnyx TTS fallback
      }, { status: response.status });
    }

    // Convert response to buffer
    const audioBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);
    
    console.log(`✅ [ELEVENLABS] Generated audio: ${buffer.length} bytes`);

    // Create unique filename
    const timestamp = Date.now();
    const filename = `ai-voice-${timestamp}-${voiceId}.mp3`;
    
    // Ensure public/audio directory exists
    const audioDir = join(process.cwd(), 'public', 'audio');
    if (!existsSync(audioDir)) {
      await mkdir(audioDir, { recursive: true });
    }
    
    // Save audio file
    const filePath = join(audioDir, filename);
    await writeFile(filePath, buffer);
    
    // Return public URL that Telnyx can access
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ghostcrm.ai';
    const audioUrl = `${baseUrl}/audio/${filename}`;
    
    console.log(`🔊 [ELEVENLABS] Audio available at: ${audioUrl}`);
    
    return NextResponse.json({
      audioUrl,
      voiceId: elevenLabsVoiceId,
      duration: Math.ceil(text.length / 10), // Rough estimate
      size: buffer.length
    });

  } catch (error) {
    console.error('❌ [ELEVENLABS] Synthesis error:', error);
    
    return NextResponse.json({ 
      error: 'Audio synthesis failed',
      fallbackText: true 
    }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ElevenLabs synthesis endpoint active',
    configured: !!ELEVENLABS_API_KEY,
    voices: Object.keys(VOICE_MAPPING)
  });
}