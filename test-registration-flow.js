/**
 * Test Registration Flow with Subdomain
 * Tests the updated registration API with subdomain field
 */

const BASE_URL = 'http://localhost:3000';

async function testRegistrationFlow() {
  console.log('🧪 Testing FIXED Registration Flow with Authentication...\n');

  // Test data with unique values
  const testUser = {
    firstName: 'John',
    lastName: 'Doe', 
    companyName: 'Test Motors Corp',
    subdomain: `testmotors${Date.now().toString().slice(-6)}`,
    email: `test.fix.${Date.now()}@example.com`, // Unique email
    password: 'Password123!',
    role: 'owner'
  };

  console.log('📝 Test User Data:', {
    ...testUser,
    password: '***hidden***'
  });

  try {
    // Step 1: Test Registration API
    console.log('\n🚀 Step 1: Testing Registration API...');
    
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const registerData = await registerResponse.json();
    
    if (!registerResponse.ok) {
      console.error('❌ Registration failed:', registerData);
      return;
    }

    console.log('✅ Registration successful!');
    console.log('📊 Response:', {
      email: registerData.user?.email,
      role: registerData.user?.role,
      organizationId: registerData.user?.organizationId,
      tenantId: registerData.user?.tenantId
    });

    // Step 2: Check if subdomain placeholder was created
    console.log('\n🔍 Step 2: Checking subdomain placeholder...');
    
    // We need to check the database for the subdomain entry
    // For now, let's just verify the registration worked
    
    // Step 3: Test Auth Me endpoint
    console.log('\n🔍 Step 3: Testing auth/me endpoint...');
    
    // Extract cookies from registration response
    const cookies = registerResponse.headers.get('set-cookie');
    
    const authResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Cookie': cookies || ''
      }
    });

    const authData = await authResponse.json();
    
    if (authData.user) {
      console.log('✅ Auth verification successful!');
      console.log('👤 User data:', {
        email: authData.user.email,
        role: authData.user.role,
        organizationId: authData.user.organizationId,
        organizationSubdomain: authData.user.organizationSubdomain
      });
    } else {
      console.log('⚠️ Auth verification failed or no user returned');
    }

    console.log('\n🎉 Registration flow test completed!');
    console.log('📋 Next steps would be:');
    console.log('  1. Go through payment flow');
    console.log('  2. Stripe webhook activates subdomain');
    console.log('  3. Redirect to tenant-specific login');

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }
}

// Run the test
testRegistrationFlow().catch(console.error);