// ElevenLabs Voice API Configuration for Ghost Auto CRM
// Integration for high-quality AI voice synthesis

export interface ElevenLabsVoice {
  id: string;
  name: string;
  description: string;
  elevenLabsId: string;
  preview: string;
  traits: string[];
  gender: "male" | "female";
  language: "en" | "es" | "bilingual";
}

// ElevenLabs API Configuration
export const ELEVENLABS_CONFIG = {
  apiKey: process.env.ELEVENLABS_API_KEY || '',
  baseUrl: 'https://api.elevenlabs.io/v1',
  model: 'eleven_multilingual_v2', // Best for Spanish/English switching
  stability: 0.75, // Voice stability (0.0 - 1.0)
  similarityBoost: 0.8, // Voice similarity to original (0.0 - 1.0)
  style: 0.3, // Style exaggeration (0.0 - 1.0)
  speakerBoost: true // Enhance speaker clarity
};

// Voice synthesis function
export async function synthesizeVoice(text: string, voiceId: string, options?: {
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speakerBoost?: boolean;
}) {
  if (!ELEVENLABS_CONFIG.apiKey) {
    console.warn('ElevenLabs API key not configured');
    return null;
  }

  try {
    const response = await fetch(`${ELEVENLABS_CONFIG.baseUrl}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_CONFIG.apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: ELEVENLABS_CONFIG.model,
        voice_settings: {
          stability: options?.stability ?? ELEVENLABS_CONFIG.stability,
          similarity_boost: options?.similarityBoost ?? ELEVENLABS_CONFIG.similarityBoost,
          style: options?.style ?? ELEVENLABS_CONFIG.style,
          use_speaker_boost: options?.speakerBoost ?? ELEVENLABS_CONFIG.speakerBoost
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error synthesizing voice:', error);
    return null;
  }
}

// Get available voices from ElevenLabs
export async function getElevenLabsVoices() {
  if (!ELEVENLABS_CONFIG.apiKey) {
    console.warn('ElevenLabs API key not configured');
    return [];
  }

  try {
    const response = await fetch(`${ELEVENLABS_CONFIG.baseUrl}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_CONFIG.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();
    return data.voices;
  } catch (error) {
    console.error('Error fetching ElevenLabs voices:', error);
    return [];
  }
}

// Preview voice function for UI
export function playVoicePreview(voiceId: string, sampleText = "Hello, this is a voice preview for Ghost Auto CRM.") {
  const previewUrl = `${ELEVENLABS_CONFIG.baseUrl}/text-to-speech/${voiceId}/stream`;
  
  // Create audio element and play preview
  const audio = new Audio();
  audio.src = `${previewUrl}?text=${encodeURIComponent(sampleText)}`;
  
  return audio.play().catch(error => {
    console.error('Error playing voice preview:', error);
  });
}

// Environment setup instructions
export const SETUP_INSTRUCTIONS = `
ELEVENLABS INTEGRATION SETUP:

1. Get ElevenLabs API Key:
   - Go to https://elevenlabs.io/
   - Sign up for an account
   - Navigate to Profile > API Keys
   - Copy your API key

2. Environment Configuration:
   Add to your .env.local file:
   ELEVENLABS_API_KEY=your_api_key_here

3. Voice Selection:
   - Use the voice catalog in AICallScriptModal.tsx
   - Update elevenLabsId fields with actual voice IDs from your ElevenLabs account
   - Test voice previews in the UI

4. Production Considerations:
   - Monitor usage limits
   - Consider voice cloning for brand consistency
   - Implement caching for frequently used phrases
   - Add error handling for API failures

5. Advanced Features:
   - Voice cloning for custom brand voices
   - Emotion and style adjustments
   - Real-time voice streaming
   - Multi-language voice synthesis

Current Integration Status:
✅ Voice selection UI implemented
✅ ElevenLabs API configuration ready
🔧 Requires API key configuration
🔧 Voice ID mapping needed
🔧 Audio playback integration pending
`;

export default ELEVENLABS_CONFIG;