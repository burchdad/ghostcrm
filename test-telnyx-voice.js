// Test Telnyx Voice without ElevenLabs
// This will help identify if the issue is with voice synthesis or call routing

const TELNYX_API_KEY = process.env.TELNYX_API_KEY;
const CALL_CONTROL_ID = "test-call-id"; // Replace with actual call ID during test

async function testTelnyxVoice() {
  console.log('🎤 Testing Telnyx Voice (No ElevenLabs Required)...\n');
  
  if (!TELNYX_API_KEY) {
    console.log('❌ TELNYX_API_KEY not found in environment');
    return;
  }
  
  console.log('✅ Telnyx API Key found');
  console.log(`   Key: ${TELNYX_API_KEY.substring(0, 12)}...${TELNYX_API_KEY.slice(-8)}\n`);
  
  // Test speak command structure (what your app actually uses)
  const speakCommand = {
    method: "POST",
    url: `https://api.telnyx.com/v2/calls/${CALL_CONTROL_ID}/actions/speak`,
    headers: {
      Authorization: `Bearer ${TELNYX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payload: {
        voice: "female",
        language: "en-US", 
        text: "Hello, this is a test of Telnyx voice synthesis. Can you hear me clearly?"
      }
    })
  };
  
  console.log('🔊 Telnyx Speak Command Structure:');
  console.log(JSON.stringify(speakCommand, null, 2));
  console.log('\n📋 Debugging Checklist:');
  console.log('1. ✅ API Key configured');
  console.log('2. ❓ Call Control ID valid (check during active call)');
  console.log('3. ❓ Webhook URL accessible from internet');
  console.log('4. ❓ Phone number has proper calling permissions');
  console.log('5. ❓ Audio codecs compatible');
  
  console.log('\n🔍 Common Voice Issues:');
  console.log('• Call connects but no audio = Webhook/routing issue');
  console.log('• No call connection = API key/connection issue');
  console.log('• Garbled audio = Codec/network issue');
  console.log('• Delayed audio = Latency/processing issue');
  
  console.log('\n💡 Next Steps:');
  console.log('1. Make a test AI call');
  console.log('2. Check browser console for webhook responses');
  console.log('3. Verify call logs in Telnyx dashboard');
  console.log('4. Test with simple speak command first');
}

if (!process.env.TELNYX_API_KEY) {
  console.log('❌ Please add TELNYX_API_KEY to your environment');
  console.log('💡 Set temporarily: $env:TELNYX_API_KEY="your_key_here"; node test-telnyx-voice.js');
} else {
  testTelnyxVoice().catch(console.error);
}