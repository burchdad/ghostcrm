// ElevenLabs Integration Helper for Telnyx AI Calls
// Provides high-quality voice synthesis for AI calling system

interface VoiceConfig {
  id?: string;
  voice?: string;
  language?: string;
}

interface AudioResponse {
  audioUrl?: string;
  fallbackText?: string;
  error?: string;
}

/**
 * Generate high-quality audio using ElevenLabs API
 * Falls back to Telnyx TTS if ElevenLabs fails
 */
export async function generateAIAudio(
  text: string, 
  voiceConfig: VoiceConfig,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://ghostcrm.ai'
): Promise<AudioResponse> {
  try {
    console.log(`🎯 [AI-AUDIO] Generating with ElevenLabs: "${text.substring(0, 50)}..."`);
    
    const response = await fetch(`${baseUrl}/api/voice/elevenlabs/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        voiceId: voiceConfig.id || voiceConfig.voice || 'sarah',
        language: voiceConfig.language || 'en-US'
      })
    });

    const result = await response.json();
    
    if (response.ok && result.audioUrl) {
      console.log(`✅ [AI-AUDIO] ElevenLabs success: ${result.audioUrl}`);
      return { audioUrl: result.audioUrl };
    } else {
      console.warn(`⚠️ [AI-AUDIO] ElevenLabs failed, using fallback: ${result.error}`);
      return { fallbackText: text };
    }
    
  } catch (error) {
    console.error('❌ [AI-AUDIO] Generation error:', error);
    return { fallbackText: text };
  }
}

/**
 * Create Telnyx command for high-quality audio playback
 * Uses ElevenLabs audio URL or falls back to TTS
 */
export function createTelnyxAudioCommand(
  audioResult: AudioResponse,
  voiceConfig: VoiceConfig,
  fallbackText: string
) {
  if (audioResult.audioUrl) {
    // Use high-quality ElevenLabs audio
    return {
      command: 'play_audio',
      audio_url: audioResult.audioUrl,
      loop: 1,
      overlay: false
    };
  } else {
    // Fall back to Telnyx TTS
    console.log(`🔄 [AI-AUDIO] Using Telnyx TTS fallback`);
    return {
      command: 'speak',
      text: audioResult.fallbackText || fallbackText,
      voice: mapVoiceToTelnyx(voiceConfig.voice || 'sarah'),
      language: voiceConfig.language || 'en-US'
    };
  }
}

/**
 * Map voice selection to Telnyx voice (fallback only)
 */
function mapVoiceToTelnyx(voiceName: string): string {
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

export { mapVoiceToTelnyx };