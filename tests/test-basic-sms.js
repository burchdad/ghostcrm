const Telnyx = require('telnyx');
require('dotenv').config({ path: '.env.local' });

async function testBasicSMS() {
  try {
    const client = Telnyx(process.env.TELNYX_API_KEY);
    
    console.log('🧪 Testing basic SMS send...');
    
    const messageData = {
      text: 'Test message from Ghost CRM',
      from: process.env.TELNYX_PHONE_NUMBER,
      to: '+19037074281', // The lead's number from the error logs
      messaging_profile_id: process.env.TELNYX_MESSAGING_PROFILE_ID
    };
    
    console.log('📋 Test Message Data:');
    console.log('- From:', messageData.from);
    console.log('- To:', messageData.to);  
    console.log('- Text:', messageData.text);
    console.log('- Profile ID:', messageData.messaging_profile_id);
    console.log('- API Key present:', !!process.env.TELNYX_API_KEY);
    
    console.log('\n🚀 Attempting to send test SMS...');
    const result = await client.messages.create(messageData);
    
    console.log('✅ SUCCESS! SMS sent successfully!');
    console.log('📬 Message ID:', result.data.id);
    console.log('📊 Full result:', JSON.stringify(result.data, null, 2));
    
  } catch (error) {
    console.error('❌ SMS Test Failed:');
    console.error('Message:', error.message);
    console.error('Type:', error.type);
    
    if (error.raw && error.raw.errors) {
      console.error('📋 Detailed Errors:');
      error.raw.errors.forEach((err, index) => {
        console.error(`  ${index + 1}. ${err.title}: ${err.detail}`);
        if (err.source) {
          console.error(`     Source: ${JSON.stringify(err.source)}`);
        }
      });
    }
    
    if (error.headers) {
      console.error('📡 Response Headers:', error.headers);
    }
    
    console.error('🔍 Full Error Object:', JSON.stringify(error, null, 2));
  }
}

testBasicSMS();