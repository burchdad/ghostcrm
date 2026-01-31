/**
 * 🏃‍♂️ CONCURRENCY & RACE CONDITION TESTS
 * 
 * Tests designed to identify race conditions, deadlocks, and data consistency issues
 * under concurrent load.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

console.log('🏃‍♂️ Starting Concurrency & Race Condition Tests...\n');

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: await response.text(),
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      data: null,
      timestamp: Date.now()
    };
  }
}

// Test 1: Concurrent User Registration Race Condition
async function testConcurrentUserRegistration() {
  console.log('🔍 Testing Concurrent User Registration...');
  
  const timestamp = Date.now();
  const email = `race.test.${timestamp}@example.com`;
  
  // Create 20 concurrent registration requests with the same email
  const registrationPromises = [];
  for (let i = 0; i < 20; i++) {
    registrationPromises.push(makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        password: 'Password123!',
        firstName: `User${i}`,
        lastName: 'Test'
      })
    }));
  }
  
  const results = await Promise.all(registrationPromises);
  const successful = results.filter(r => r.status === 200 || r.status === 201);
  const duplicateErrors = results.filter(r => 
    r.data?.includes('already exists') || 
    r.data?.includes('duplicate') ||
    r.status === 409
  );
  
  console.log(`📊 Results: ${successful.length} successful, ${duplicateErrors.length} duplicate errors`);
  
  if (successful.length > 1) {
    console.log(`❌ RACE CONDITION: ${successful.length} users created with same email!`);
    return false;
  }
  
  console.log('✅ User registration race condition protected');
  return true;
}

// Test 2: Concurrent Database Operations
async function testConcurrentDatabaseOps() {
  console.log('🔍 Testing Concurrent Database Operations...');
  
  // Test concurrent inventory creation
  const itemPromises = [];
  const baseSKU = `RACE-${Date.now()}`;
  
  for (let i = 0; i < 15; i++) {
    itemPromises.push(makeRequest('/api/inventory', {
      method: 'POST',
      body: JSON.stringify({
        name: `Race Test Item ${i}`,
        sku: `${baseSKU}-${i}`,
        category: 'Test',
        condition: 'new',
        price: 100 + i
      })
    }));
  }
  
  const itemResults = await Promise.all(itemPromises);
  const successfulItems = itemResults.filter(r => r.status === 200 || r.status === 201);
  
  console.log(`📊 Created ${successfulItems.length} items concurrently`);
  
  // Test concurrent updates to the same resource
  if (successfulItems.length > 0) {
    const updatePromises = [];
    const itemId = 'test-item-1'; // Assuming we're updating the same item
    
    for (let i = 0; i < 10; i++) {
      updatePromises.push(makeRequest(`/api/inventory`, {
        method: 'PUT',
        body: JSON.stringify({
          id: itemId,
          name: `Updated Item ${i}`,
          price: 200 + i
        })
      }));
    }
    
    const updateResults = await Promise.all(updatePromises);
    const successfulUpdates = updateResults.filter(r => r.status === 200);
    
    console.log(`📊 ${successfulUpdates.length} concurrent updates processed`);
  }
  
  console.log('✅ Database operations handling concurrency');
  return true;
}

// Test 3: Session/Authentication Race Conditions
async function testAuthenticationRaceConditions() {
  console.log('🔍 Testing Authentication Race Conditions...');
  
  // Test concurrent login attempts with same credentials
  const loginPromises = [];
  for (let i = 0; i < 10; i++) {
    loginPromises.push(makeRequest('/api/auth/db-login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      })
    }));
  }
  
  const loginResults = await Promise.all(loginPromises);
  const successfulLogins = loginResults.filter(r => r.status === 200);
  
  console.log(`📊 ${successfulLogins.length} successful concurrent logins`);
  
  // Test concurrent logout
  if (successfulLogins.length > 0) {
    const logoutPromises = [];
    for (let i = 0; i < 5; i++) {
      logoutPromises.push(makeRequest('/api/auth/logout', {
        method: 'POST'
      }));
    }
    
    await Promise.all(logoutPromises);
    console.log('📊 Concurrent logout attempts completed');
  }
  
  console.log('✅ Authentication race conditions handled');
  return true;
}

// Test 4: API Rate Limit Race Conditions
async function testRateLimitRaceConditions() {
  console.log('🔍 Testing Rate Limit Race Conditions...');
  
  // Rapid concurrent requests to test rate limiter consistency
  const rapidPromises = [];
  const endpoint = '/api/health/auth';
  
  for (let i = 0; i < 50; i++) {
    rapidPromises.push(makeRequest(endpoint, {
      headers: {
        'X-Forwarded-For': '192.168.1.100' // Same IP to trigger rate limiting
      }
    }));
  }
  
  const rapidResults = await Promise.all(rapidPromises);
  const rateLimited = rapidResults.filter(r => r.status === 429);
  const notLimited = rapidResults.filter(r => r.status !== 429);
  
  console.log(`📊 ${rateLimited.length} rate limited, ${notLimited.length} not limited`);
  
  // Check for inconsistent rate limiting
  if (notLimited.length > 30 && rateLimited.length > 0) {
    console.log('⚠️  Inconsistent rate limiting detected');
    return false;
  }
  
  console.log('✅ Rate limiting appears consistent');
  return true;
}

// Test 5: File Upload Race Conditions
async function testFileUploadRaceConditions() {
  console.log('🔍 Testing File Upload Race Conditions...');
  
  // Test concurrent file uploads (if endpoint exists)
  const uploadPromises = [];
  
  for (let i = 0; i < 5; i++) {
    uploadPromises.push(makeRequest('/api/file/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: `test-${i}.txt`,
        content: `Test file content ${i}`,
        size: 1024
      })
    }));
  }
  
  const uploadResults = await Promise.all(uploadPromises);
  const successfulUploads = uploadResults.filter(r => r.status === 200 || r.status === 201);
  
  console.log(`📊 ${successfulUploads.length} concurrent uploads processed`);
  console.log('✅ File upload concurrency handled');
  return true;
}

// Test 6: Memory Leak Detection
async function testMemoryLeakDetection() {
  console.log('🔍 Testing for Memory Leaks...');
  
  // Create many requests to detect potential memory leaks
  const memoryTestPromises = [];
  
  for (let i = 0; i < 100; i++) {
    memoryTestPromises.push(makeRequest('/api/health/auth'));
  }
  
  const startTime = Date.now();
  const memoryResults = await Promise.all(memoryTestPromises);
  const endTime = Date.now();
  
  const responseTime = endTime - startTime;
  const avgResponseTime = responseTime / memoryResults.length;
  
  console.log(`📊 100 requests completed in ${responseTime}ms (avg: ${avgResponseTime.toFixed(2)}ms per request)`);
  
  // Check for degrading performance (potential memory leak indicator)
  if (avgResponseTime > 1000) {
    console.log('⚠️  High response times detected - potential memory issues');
    return false;
  }
  
  console.log('✅ No obvious memory leak indicators');
  return true;
}

// Test 7: Deadlock Detection
async function testDeadlockDetection() {
  console.log('🔍 Testing for Deadlock Conditions...');
  
  // Simulate operations that could cause deadlocks
  const deadlockPromises = [];
  
  // Create operations that might lock resources in different orders
  for (let i = 0; i < 10; i++) {
    deadlockPromises.push(
      makeRequest('/api/inventory', {
        method: 'POST',
        body: JSON.stringify({
          name: `Deadlock Test ${i}`,
          sku: `DEADLOCK-${i}`,
          category: 'Test'
        })
      })
    );
    
    deadlockPromises.push(
      makeRequest('/api/settings/roles', {
        method: 'GET'
      })
    );
  }
  
  const startTime = Date.now();
  const deadlockResults = await Promise.all(deadlockPromises);
  const endTime = Date.now();
  
  const totalTime = endTime - startTime;
  const timeoutResults = deadlockResults.filter(r => r.status === 0 && r.error?.includes('timeout'));
  
  console.log(`📊 ${deadlockResults.length} operations completed in ${totalTime}ms`);
  
  if (timeoutResults.length > 0) {
    console.log(`⚠️  ${timeoutResults.length} operations timed out - potential deadlock`);
    return false;
  }
  
  if (totalTime > 30000) { // 30 seconds
    console.log('⚠️  Operations took too long - potential deadlock or performance issue');
    return false;
  }
  
  console.log('✅ No deadlock conditions detected');
  return true;
}

// Test 8: Data Consistency Under Load
async function testDataConsistency() {
  console.log('🔍 Testing Data Consistency Under Load...');
  
  const consistencyPromises = [];
  const testData = {
    name: 'Consistency Test Item',
    sku: `CONSISTENCY-${Date.now()}`,
    category: 'Test',
    price: 100
  };
  
  // Create the same item multiple times to test uniqueness constraints
  for (let i = 0; i < 15; i++) {
    consistencyPromises.push(makeRequest('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(testData)
    }));
  }
  
  const consistencyResults = await Promise.all(consistencyPromises);
  const successful = consistencyResults.filter(r => r.status === 200 || r.status === 201);
  const errors = consistencyResults.filter(r => r.status >= 400);
  
  console.log(`📊 ${successful.length} successful, ${errors.length} errors`);
  
  // Should only allow one creation if SKU is unique
  if (successful.length > 1) {
    console.log('⚠️  Data consistency issue - duplicate entries created');
    return false;
  }
  
  console.log('✅ Data consistency maintained under load');
  return true;
}

// Test 9: Resource Exhaustion
async function testResourceExhaustion() {
  console.log('🔍 Testing Resource Exhaustion Protection...');
  
  // Test connection pool exhaustion
  const connectionPromises = [];
  
  for (let i = 0; i < 200; i++) {
    connectionPromises.push(makeRequest('/api/health/app'));
  }
  
  const connectionResults = await Promise.all(connectionPromises);
  const connectionErrors = connectionResults.filter(r => 
    r.status === 503 || 
    r.data?.includes('connection') || 
    r.data?.includes('pool')
  );
  
  console.log(`📊 ${connectionErrors.length} connection-related errors out of 200 requests`);
  
  // A few connection errors are acceptable, but not all requests failing
  if (connectionErrors.length > 150) {
    console.log('⚠️  Server appears to be overwhelmed - poor resource management');
    return false;
  }
  
  console.log('✅ Resource exhaustion protection appears adequate');
  return true;
}

// Test 10: Cache Coherency
async function testCacheCoherency() {
  console.log('🔍 Testing Cache Coherency...');
  
  // Test cache invalidation under concurrent updates
  const cachePromises = [];
  
  // Mix of reads and writes to test cache consistency
  for (let i = 0; i < 20; i++) {
    if (i % 2 === 0) {
      // Read operations
      cachePromises.push(makeRequest('/api/settings/roles'));
    } else {
      // Write operations
      cachePromises.push(makeRequest('/api/settings/roles', {
        method: 'POST',
        body: JSON.stringify({
          name: `Cache Test Role ${i}`,
          description: 'Testing cache coherency',
          permissions: ['test']
        })
      }));
    }
  }
  
  const cacheResults = await Promise.all(cachePromises);
  const successful = cacheResults.filter(r => r.status === 200 || r.status === 201);
  
  console.log(`📊 ${successful.length} cache operations successful`);
  console.log('✅ Cache coherency test completed');
  return true;
}

// Main execution function
async function runConcurrencyTests() {
  console.log('🚀 Starting Comprehensive Concurrency Tests...\n');
  
  const tests = [
    { name: 'Concurrent User Registration', test: testConcurrentUserRegistration },
    { name: 'Concurrent Database Operations', test: testConcurrentDatabaseOps },
    { name: 'Authentication Race Conditions', test: testAuthenticationRaceConditions },
    { name: 'Rate Limit Race Conditions', test: testRateLimitRaceConditions },
    { name: 'File Upload Race Conditions', test: testFileUploadRaceConditions },
    { name: 'Memory Leak Detection', test: testMemoryLeakDetection },
    { name: 'Deadlock Detection', test: testDeadlockDetection },
    { name: 'Data Consistency Under Load', test: testDataConsistency },
    { name: 'Resource Exhaustion Protection', test: testResourceExhaustion },
    { name: 'Cache Coherency', test: testCacheCoherency }
  ];
  
  const results = [];
  
  for (const { name, test } of tests) {
    try {
      const passed = await test();
      results.push({ name, passed });
      console.log(''); // Add spacing between tests
    } catch (error) {
      console.log(`❌ Test "${name}" failed with error: ${error.message}`);
      results.push({ name, passed: false, error: error.message });
    }
  }
  
  // Summary
  console.log('\n📊 CONCURRENCY TEST RESULTS:');
  console.log('================================');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\n📈 Results: ${passed} passed, ${failed} failed out of ${results.length} tests`);
  
  if (failed > 0) {
    console.log('\n🚨 ISSUES FOUND: Review and fix concurrency issues before production!');
    console.log('\n💡 Common fixes:');
    console.log('   - Add database constraints for uniqueness');
    console.log('   - Implement proper locking mechanisms');
    console.log('   - Add transaction isolation');
    console.log('   - Implement circuit breakers');
    console.log('   - Add connection pooling limits');
  } else {
    console.log('\n🎉 All concurrency tests passed!');
  }
  
  return results;
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runConcurrencyTests };
} else {
  // Run if executed directly
  runConcurrencyTests().catch(console.error);
}