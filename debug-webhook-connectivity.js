// Quick webhook connectivity test
// Run this to check if webhooks can reach our production server

const webhookUrls = [
  'https://ghostcrm.vercel.app/api/voice/telnyx/webhook-test',
  'https://ghostcrm.vercel.app/api/voice/telnyx/ai-answer',
];

async function testWebhookConnectivity() {
  console.log('🧪 Testing webhook connectivity...');
  
  for (const url of webhookUrls) {
    try {
      console.log(`\n🔗 Testing: ${url}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          event_type: 'call.answered',
          timestamp: new Date().toISOString()
        })
      });
      
      const result = await response.text();
      console.log(`✅ Status: ${response.status}`);
      console.log(`📝 Response: ${result}`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

testWebhookConnectivity();