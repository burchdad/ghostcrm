// Custom Voice Processing Helper for Ghost CRM
// Handles tenant voice samples and synthesis

interface TenantVoiceConfig {
  tenantId: string;
  voiceType: 'primary' | 'sales' | 'support' | 'spanish' | 'custom';
  language?: string;
}

interface CustomAudioResponse {
  audioUrl?: string;
  fallbackText?: string;
  error?: string;
  voiceType?: string;
  isCustomVoice?: boolean;
}

/**
 * Generate speech using tenant's custom voice
 * Falls back to ElevenLabs if no custom voice available
 */
export async function generateCustomVoiceAudio(
  text: string,
  voiceConfig: TenantVoiceConfig,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://ghostcrm.ai'
): Promise<CustomAudioResponse> {
  try {
    console.log(`🎯 [CUSTOM VOICE] Generating with tenant voice: ${voiceConfig.tenantId}/${voiceConfig.voiceType}`);
    
    // First, try custom voice synthesis
    const response = await fetch(`${baseUrl}/api/voice/synthesize-custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        tenantId: voiceConfig.tenantId,
        voiceType: voiceConfig.voiceType,
        language: voiceConfig.language || 'en-US'
      })
    });

    const result = await response.json();
    
    if (response.ok && result.audioUrl) {
      console.log(`✅ [CUSTOM VOICE] Success with tenant voice: ${result.audioUrl}`);
      return { 
        audioUrl: result.audioUrl, 
        voiceType: result.voiceType,
        isCustomVoice: true 
      };
    } else {
      console.warn(`⚠️ [CUSTOM VOICE] Tenant voice failed, trying ElevenLabs fallback`);
      
      // Fall back to ElevenLabs
      return await fallbackToElevenLabs(text, voiceConfig, baseUrl);
    }
    
  } catch (error) {
    console.error('❌ [CUSTOM VOICE] Generation error:', error);
    return await fallbackToElevenLabs(text, voiceConfig, baseUrl);
  }
}

/**
 * Fallback to ElevenLabs if custom voice fails
 */
async function fallbackToElevenLabs(
  text: string,
  voiceConfig: TenantVoiceConfig,
  baseUrl: string
): Promise<CustomAudioResponse> {
  try {
    console.log(`🔄 [FALLBACK] Using ElevenLabs for: ${voiceConfig.voiceType}`);
    
    const response = await fetch(`${baseUrl}/api/voice/elevenlabs/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        voiceId: mapVoiceTypeToElevenLabs(voiceConfig.voiceType),
        language: voiceConfig.language || 'en-US'
      })
    });

    const result = await response.json();
    
    if (response.ok && result.audioUrl) {
      console.log(`✅ [FALLBACK] ElevenLabs success: ${result.audioUrl}`);
      return { audioUrl: result.audioUrl, isCustomVoice: false };
    } else {
      console.warn(`⚠️ [FALLBACK] ElevenLabs failed, using TTS fallback`);
      return { fallbackText: text };
    }
    
  } catch (error) {
    console.error('❌ [FALLBACK] ElevenLabs error:', error);
    return { fallbackText: text };
  }
}

/**
 * Map voice types to ElevenLabs voice IDs for fallback
 */
function mapVoiceTypeToElevenLabs(voiceType: string): string {
  const voiceMap: Record<string, string> = {
    'primary': 'sarah',
    'sales': 'jessica',
    'support': 'sarah', 
    'spanish': 'maria',
    'custom': 'sarah'
  };
  
  return voiceMap[voiceType] || 'sarah';
}

/**
 * Create Telnyx command for custom voice playback
 * Supports both custom voices and fallbacks
 */
export function createCustomVoiceCommand(
  audioResult: CustomAudioResponse,
  voiceConfig: TenantVoiceConfig,
  fallbackText: string
) {
  if (audioResult.audioUrl) {
    // Use custom or ElevenLabs audio
    const commandType = audioResult.isCustomVoice ? 'CUSTOM_VOICE' : 'ELEVENLABS_VOICE';
    console.log(`🔊 [AUDIO COMMAND] Using ${commandType}: ${audioResult.audioUrl}`);
    
    return {
      command: 'play_audio',
      audio_url: audioResult.audioUrl,
      loop: 1,
      overlay: false,
      // Metadata for debugging
      _voiceSource: audioResult.isCustomVoice ? 'tenant_custom' : 'elevenlabs_fallback',
      _voiceType: audioResult.voiceType || voiceConfig.voiceType
    };
  } else {
    // Fall back to basic Telnyx TTS
    console.log(`🔄 [AUDIO COMMAND] Using Telnyx TTS fallback`);
    return {
      command: 'speak',
      text: audioResult.fallbackText || fallbackText,
      voice: mapVoiceTypeToTelnyxVoice(voiceConfig.voiceType),
      language: voiceConfig.language || 'en-US',
      // Metadata for debugging
      _voiceSource: 'telnyx_tts_fallback',
      _voiceType: voiceConfig.voiceType
    };
  }
}

/**
 * Map voice types to Telnyx TTS voices (final fallback)
 */
function mapVoiceTypeToTelnyxVoice(voiceType: string): string {
  const voiceMap: Record<string, string> = {
    'primary': 'female',
    'sales': 'female',
    'support': 'female',
    'spanish': 'female', 
    'custom': 'female'
  };
  
  return voiceMap[voiceType] || 'female';
}

/**
 * Get tenant's available voices
 */
export async function getTenantVoices(tenantId: string): Promise<any[]> {
  try {
    const response = await fetch(`/api/voice/upload?tenantId=${tenantId}`);
    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error('Error fetching tenant voices:', error);
    return [];
  }
}

/**
 * Check if tenant has any active custom voices
 */
export async function hasCustomVoices(tenantId: string): Promise<boolean> {
  const voices = await getTenantVoices(tenantId);
  return voices.some(voice => voice.isActive);
}

export { mapVoiceTypeToElevenLabs, mapVoiceTypeToTelnyxVoice };