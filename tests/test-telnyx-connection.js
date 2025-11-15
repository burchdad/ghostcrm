// Test Telnyx API Connection and Configuration
// Run with: node test-telnyx-connection.js

async function testTelnyxConnection() {
  const apiKey = process.env.TELNYX_API_KEY || 'YOUR_TELNYX_API_KEY_HERE';
  const phoneNumber = process.env.BUSINESS_PHONE_NUMBER || '+1XXXXXXXXXX';
  const connectionId = process.env.TELNYX_CONNECTION_ID || 'YOUR_CONNECTION_ID_HERE';
  
  console.log('🔍 Testing Telnyx API Connection...\n');
  
  try {
    // Test API authentication with direct HTTP call
    console.log('1️⃣ Testing API Authentication...');
    const accountResponse = await fetch('https://api.telnyx.com/v2/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!accountResponse.ok) {
      console.log('❌ API authentication failed');
      console.log(`   Status: ${accountResponse.status} - ${accountResponse.statusText}`);
      return;
    }
    
    const accountData = await accountResponse.json();
    console.log('✅ API Key Valid');
    console.log(`   Account: ${accountData.data?.company_name || 'N/A'}`);
    console.log(`   Balance: $${accountData.data?.balance || 'N/A'}\n`);
    
    // Test phone numbers
    console.log('2️⃣ Checking Your Phone Number...');
    const numbersResponse = await fetch('https://api.telnyx.com/v2/phone_numbers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (numbersResponse.ok) {
      const numbersData = await numbersResponse.json();
      const myNumber = numbersData.data?.find(num => num.phone_number === phoneNumber);
      
      if (myNumber) {
        console.log('✅ Phone Number Found');
        console.log(`   Number: ${myNumber.phone_number}`);
        console.log(`   Status: ${myNumber.status}`);
        console.log(`   Connection: ${myNumber.connection_id || 'None assigned'}`);
        console.log(`   Matches Config: ${myNumber.connection_id === connectionId ? '✅ YES' : '❌ NO'}\n`);
      } else {
        console.log('❌ Phone number not found in account\n');
        console.log('📱 Available numbers:');
        numbersData.data?.slice(0, 5).forEach(num => {
          console.log(`   - ${num.phone_number} (${num.status})`);
        });
        console.log('');
      }
    }
    
    // Test connection
    console.log('3️⃣ Checking Your SIP Connection...');
    const connectionResponse = await fetch(`https://api.telnyx.com/v2/connections/${connectionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (connectionResponse.ok) {
      const connectionData = await connectionResponse.json();
      console.log('✅ Connection Found');
      console.log(`   Name: ${connectionData.data?.connection_name || 'Unnamed'}`);
      console.log(`   ID: ${connectionData.data?.id}`);
      console.log(`   Type: ${connectionData.data?.connection_type}`);
      console.log(`   Active: ${connectionData.data?.active ? '✅ YES' : '❌ NO'}`);
      console.log(`   Webhook URL: ${connectionData.data?.webhook_event_url || 'Not set'}\n`);
    } else {
      console.log('❌ Connection not found or not accessible\n');
      console.log('🔍 Available connections:');
      
      // List all connections
      const connectionsResponse = await fetch('https://api.telnyx.com/v2/connections', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (connectionsResponse.ok) {
        const connectionsData = await connectionsResponse.json();
        connectionsData.data?.slice(0, 5).forEach((conn, index) => {
          console.log(`   ${index + 1}. ${conn.connection_name || 'Unnamed'} (${conn.id})`);
          console.log(`      Type: ${conn.connection_type}, Active: ${conn.active}`);
        });
        console.log('');
      }
    }
    
    // Test call simulation
    console.log('4️⃣ Testing Call Configuration...');
    console.log('📞 Call would use these parameters:');
    console.log(`   To: [Target number]`);
    console.log(`   From: ${phoneNumber}`);
    console.log(`   Connection ID: ${connectionId}`);
    console.log(`   Webhook: https://ghostcrm.ai/api/voice/telnyx/ai-answer\n`);
    
    console.log('✅ Configuration Summary:');
    console.log('Your .env.local should have:');
    console.log(`TELNYX_API_KEY="${apiKey}"`);
    console.log(`BUSINESS_PHONE_NUMBER="${phoneNumber}"`);
    console.log(`TELNYX_CONNECTION_ID="${connectionId}"`);
    console.log(`NEXT_PUBLIC_BASE_URL="https://ghostcrm.ai"`);
    
    console.log('\n🔗 Next Steps:');
    console.log('1. Configure webhooks in Telnyx dashboard');
    console.log('2. Set webhook URL: https://ghostcrm.ai/api/voice/telnyx/ai-answer');
    console.log('3. Assign phone number to connection if needed');
    console.log('4. Test with a real call');
    
  } catch (error) {
    console.error('❌ Error testing Telnyx connection:');
    console.error(error.message);
    
    if (error.message.includes('fetch')) {
      console.log('💡 Check your internet connection');
    } else if (error.message.includes('401')) {
      console.log('💡 Check your API key - it might be invalid');
    }
  }
}

// Run the test
testTelnyxConnection().catch(console.error);