/**
 * Test script to verify subdomain status API fix
 */

async function testSubdomainStatus() {
  console.log('🧪 Testing subdomain status API...');
  
  const testEmail = 'test@example.com';
  
  try {
    // Test POST method with userEmail (correct way)
    console.log('\n1. Testing POST with userEmail (should work):');
    const postResponse = await fetch('http://localhost:3000/api/subdomains/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userEmail: testEmail })
    });
    
    console.log('Status:', postResponse.status);
    const postData = await postResponse.json();
    console.log('Response:', postData);
    
    // Test GET method without parameters (old broken way)
    console.log('\n2. Testing GET without parameters (should fail):');
    const getResponse = await fetch('http://localhost:3000/api/subdomains/status');
    
    console.log('Status:', getResponse.status);
    const getData = await getResponse.json();
    console.log('Response:', getData);
    
    // Test GET method with email parameter (should work)
    console.log('\n3. Testing GET with email parameter (should work):');
    const getWithEmailResponse = await fetch(`http://localhost:3000/api/subdomains/status?email=${encodeURIComponent(testEmail)}`);
    
    console.log('Status:', getWithEmailResponse.status);
    const getWithEmailData = await getWithEmailResponse.json();
    console.log('Response:', getWithEmailData);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testSubdomainStatus();