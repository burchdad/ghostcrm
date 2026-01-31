#!/usr/bin/env node

// Test registration API with subdomain conflict scenarios
// This test verifies that the registration endpoint properly handles duplicate subdomains

const baseUrl = 'http://localhost:3000';

async function testRegistration(testCase, userData) {
  console.log(`\n🧪 Testing: ${testCase}`);
  console.log('📊 User Data:', JSON.stringify(userData, null, 2));
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful:', result);
      return { success: true, data: result };
    } else {
      console.log('❌ Registration failed:', result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('💥 Network error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Registration Subdomain Fix Tests');
  console.log('📍 Testing against:', baseUrl);

  // Test Case 1: Registration with potentially conflicting subdomain
  const testUser1 = {
    email: `test-${Date.now()}-1@example.com`,
    password: 'TestPassword123!',
    firstName: 'John',
    lastName: 'Doe',
    companyName: 'Burch Motors', // This should generate 'burchmotors' subdomain
    subdomain: 'burchmotors3' // Force the conflict subdomain from the logs
  };

  // Test Case 2: Registration without explicit subdomain (auto-generation)
  const testUser2 = {
    email: `test-${Date.now()}-2@example.com`,
    password: 'TestPassword123!',
    firstName: 'Jane',
    lastName: 'Smith',
    companyName: 'Burch Motors Test Company' // Should generate unique subdomain
  };

  // Test Case 3: Registration with reserved subdomain
  const testUser3 = {
    email: `test-${Date.now()}-3@example.com`,
    password: 'TestPassword123!',
    firstName: 'Bob',
    lastName: 'Johnson',
    companyName: 'Admin Company',
    subdomain: 'admin' // This is reserved
  };

  const results = [];

  // Run tests
  results.push(await testRegistration('Explicit conflicting subdomain (burchmotors3)', testUser1));
  results.push(await testRegistration('Auto-generated subdomain from company name', testUser2));
  results.push(await testRegistration('Reserved subdomain (admin)', testUser3));

  // Summary
  console.log('\n\n📈 TEST SUMMARY:');
  console.log('=' .repeat(50));

  let passed = 0;
  let failed = 0;

  results.forEach((result, index) => {
    const testNumber = index + 1;
    if (result.success) {
      console.log(`✅ Test ${testNumber}: PASSED`);
      if (result.data.subdomain) {
        console.log(`   📍 Assigned subdomain: ${result.data.subdomain.name || result.data.subdomain}`);
      }
      passed++;
    } else {
      console.log(`❌ Test ${testNumber}: FAILED`);
      console.log(`   💬 Error: ${result.error.error || result.error}`);
      failed++;
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Registration subdomain handling is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the registration logic.');
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    return response.ok;
  } catch (error) {
    try {
      // Try a basic GET to root
      const response = await fetch(baseUrl);
      return response.status < 500;
    } catch (error2) {
      return false;
    }
  }
}

async function main() {
  console.log('🔍 Checking server health...');
  
  const serverUp = await checkServerHealth();
  if (!serverUp) {
    console.error('❌ Server not responding. Make sure the dev server is running:');
    console.error('   npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running');
  await runTests();
}

main().catch(console.error);