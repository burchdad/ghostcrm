require('dotenv').config({ path: '.env.local' });

async function testFrontendAPICall() {
  console.log('🔍 Testing Frontend API Call to /api/leads\n');

  try {
    const response = await fetch('http://localhost:3000/api/leads', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; test)',
      }
    });

    const responseText = await response.text();
    
    console.log('📊 API Response Details:');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Raw Response:', responseText);

    try {
      const data = JSON.parse(responseText);
      console.log('\n📋 Parsed Response:');
      console.log('Records Count:', data.records?.length || 0);
      
      if (data.records && data.records.length > 0) {
        console.log('Sample Record:', JSON.stringify(data.records[0], null, 2));
      } else {
        console.log('⚠️ No records returned');
      }
    } catch (parseError) {
      console.log('❌ Failed to parse JSON:', parseError.message);
    }

  } catch (error) {
    console.error('❌ API call failed:', error.message);
  }
}

testFrontendAPICall();