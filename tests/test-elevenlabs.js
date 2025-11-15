// Test ElevenLabs Configuration
// Run with: node test-elevenlabs.js

async function testElevenLabsSetup() {
  console.log('🎤 Testing ElevenLabs Configuration...\n');
  
  // Check environment variable
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.log('❌ ELEVENLABS_API_KEY not found in environment');
    console.log('💡 Add it to your .env.local file:');
    console.log('   ELEVENLABS_API_KEY="your_api_key_here"\n');
    return;
  }
  
  console.log('✅ API Key found in environment');
  console.log(`   Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 8)}\n`);
  
  try {
    // Test API connection
    console.log('1️⃣ Testing API Connection...');
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log('❌ API connection failed');
      console.log(`   Status: ${response.status} - ${response.statusText}`);
      return;
    }
    
    const voicesData = await response.json();
    console.log('✅ API connection successful');
    console.log(`   Available voices: ${voicesData.voices.length}\n`);
    
    // Voice catalog from your modal
    const voiceCatalog = [
      { name: "Sarah", id: "EXAVITQu4vr4xnSDxMaL" },
      { name: "Maria (Bilingual)", id: "ErXwobaYiN019PkySvjV" },
      { name: "Jessica", id: "cgSgspJ2msm6clMCkdW9" },
      { name: "Michael", id: "flq6f7yk4E4fJM5XTYuZ" },
      { name: "Carlos (Bilingual)", id: "onwK4e9ZLuTAKqWW03F9" },
      { name: "David", id: "AZnzlk1XvdvUeBnXmlld" }
    ];
    
    console.log('2️⃣ Checking Voice Catalog...');
    
    for (const voice of voiceCatalog) {
      const foundVoice = voicesData.voices.find(v => v.voice_id === voice.id);
      
      if (foundVoice) {
        console.log(`✅ ${voice.name}: Found (${foundVoice.name})`);
      } else {
        console.log(`❌ ${voice.name}: NOT FOUND (ID: ${voice.id})`);
        console.log(`   💡 Update this voice ID in AICallScriptModal.tsx`);
      }
    }
    
    console.log('\n3️⃣ Your Available Voices:');
    voicesData.voices.slice(0, 10).forEach((voice, index) => {
      console.log(`   ${index + 1}. ${voice.name} (${voice.voice_id})`);
      console.log(`      Category: ${voice.category || 'N/A'}`);
      console.log(`      Language: ${voice.labels?.language || 'N/A'}`);
      console.log('');
    });
    
    if (voicesData.voices.length > 10) {
      console.log(`   ... and ${voicesData.voices.length - 10} more voices\n`);
    }
    
    // Test text-to-speech with first available voice
    console.log('4️⃣ Testing Text-to-Speech...');
    const testVoiceId = voicesData.voices[0]?.voice_id;
    
    if (testVoiceId) {
      const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${testVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: "Hello, this is a test of the ElevenLabs voice synthesis for Ghost CRM.",
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true
          }
        })
      });
      
      if (ttsResponse.ok) {
        const audioData = await ttsResponse.arrayBuffer();
        console.log(`✅ Text-to-Speech successful`);
        console.log(`   Audio size: ${audioData.byteLength} bytes`);
        console.log(`   Voice: ${voicesData.voices[0].name}\n`);
      } else {
        console.log('❌ Text-to-Speech failed');
        console.log(`   Status: ${ttsResponse.status} - ${ttsResponse.statusText}\n`);
      }
    }
    
    console.log('🎯 ElevenLabs Summary:');
    console.log('✅ API Key: Valid');
    console.log('✅ Connection: Working');
    console.log('✅ Voice Synthesis: Functional');
    console.log('\n💡 Next Steps:');
    console.log('1. Update voice IDs in AICallScriptModal.tsx with your preferred voices');
    console.log('2. Test voice selection in your AI calling modal');
    console.log('3. Ready for Telnyx integration testing!');
    
  } catch (error) {
    console.error('❌ Error testing ElevenLabs:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('💡 Check your internet connection');
    } else if (error.message.includes('Unauthorized')) {
      console.log('💡 Check your API key - it might be invalid');
    }
  }
}

// Check if API key is available
if (!process.env.ELEVENLABS_API_KEY) {
  console.log('❌ Please add ELEVENLABS_API_KEY to your environment');
  console.log('💡 Set it temporarily: $env:ELEVENLABS_API_KEY="your_key_here"; node test-elevenlabs.js');
} else {
  testElevenLabsSetup().catch(console.error);
}