// Test script to check payment gateway functionality
const https = require('https');

// Test the payment gateway endpoint with a mock session ID
async function testPaymentGateway() {
  console.log('🧪 Testing payment gateway...');
  
  const testUrl = 'http://localhost:3000/api/billing/payment-gateway?session_id=test_session_12345';
  
  try {
    const response = await fetch(testUrl);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 302) {
      console.log('Redirect location:', response.headers.get('location'));
    } else {
      const text = await response.text();
      console.log('Response body:', text);
    }
  } catch (error) {
    console.error('Error testing gateway:', error);
  }
}

testPaymentGateway();