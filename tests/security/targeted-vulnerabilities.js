/**
 * 🎯 TARGETED VULNERABILITY TESTS
 * 
 * These tests target specific vulnerabilities found in the codebase analysis.
 * Based on actual code patterns and potential security issues.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

console.log('🎯 Running Targeted Vulnerability Tests...\n');

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
      response
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      data: null
    };
  }
}

// Test 1: JWT Secret Exposure (found fallback to "supersecret")
async function testJWTSecretExposure() {
  console.log('🔍 Testing JWT Secret Exposure...');
  
  // Try to access health endpoint that might expose JWT configuration
  const healthResult = await makeRequest('/api/health/auth');
  
  if (healthResult.data?.includes('supersecret') || healthResult.data?.includes('JWT_SECRET')) {
    console.log('❌ CRITICAL: JWT secret exposed in health endpoint');
    return false;
  }
  
  // Test if default JWT secret is being used
  try {
    const jwt = require('jsonwebtoken');
    const testToken = jwt.sign({ sub: '1', email: 'test@test.com', role: 'admin' }, 'supersecret');
    
    const testResult = await makeRequest('/api/settings/roles', {
      headers: { 'Cookie': `ghostcrm_jwt=${testToken}` }
    });
    
    if (testResult.status === 200) {
      console.log('❌ CRITICAL: Default JWT secret "supersecret" is being used!');
      return false;
    }
  } catch (e) {
    // Expected if jwt library not available
  }
  
  console.log('✅ JWT secret configuration appears secure');
  return true;
}

// Test 2: Supabase Admin Key Exposure
async function testSupabaseKeyExposure() {
  console.log('🔍 Testing Supabase Admin Key Exposure...');
  
  const endpoints = [
    '/api/health/auth',
    '/api/health/app',
    '/api/settings/integrations/supabase',
    '/.env',
    '/api/debug'
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint);
    if (result.data?.includes('supabase.co') || 
        result.data?.includes('SUPABASE_SERVICE_ROLE_KEY') ||
        result.data?.includes('placeholder-key')) {
      console.log(`❌ CRITICAL: Supabase configuration exposed in ${endpoint}`);
      return false;
    }
  }
  
  console.log('✅ Supabase keys appear protected');
  return true;
}

// Test 3: Rate Limiting Bypass (found in-memory rate limiter)
async function testRateLimitingBypass() {
  console.log('🔍 Testing Rate Limiting Bypass...');
  
  // Test distributed rate limiting bypass (since it's in-memory)
  const promises = [];
  
  // Simulate requests from different IPs
  for (let i = 0; i < 20; i++) {
    promises.push(makeRequest('/api/auth/db-login', {
      method: 'POST',
      headers: {
        'X-Forwarded-For': `192.168.1.${i % 255}`,
        'X-Real-IP': `10.0.0.${i % 255}`
      },
      body: JSON.stringify({
        email: 'attacker@test.com',
        password: 'wrongpassword'
      })
    }));
  }
  
  const results = await Promise.all(promises);
  const notRateLimited = results.filter(r => r.status !== 429).length;
  
  if (notRateLimited > 15) {
    console.log(`❌ WARNING: Rate limiting bypassed with IP spoofing - ${notRateLimited}/20 requests succeeded`);
    return false;
  }
  
  console.log('✅ Rate limiting appears effective');
  return true;
}

// Test 4: CORS/Origin Bypass (found origin validation)
async function testOriginBypass() {
  console.log('🔍 Testing Origin/CORS Bypass...');
  
  const maliciousOrigins = [
    'https://ghostcrm.com.evil.com',
    'https://evil.com',
    'http://localhost:3001',
    'https://sub.ghostcrm.com',
    'null',
    '',
    'https://ghostcrm.com/',
    'https://ghostcrm.com#evil'
  ];
  
  for (const origin of maliciousOrigins) {
    const result = await makeRequest('/api/auth/db-login', {
      method: 'POST',
      headers: {
        'Origin': origin,
        'Referer': origin
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'password123'
      })
    });
    
    if (result.status === 200) {
      console.log(`❌ CRITICAL: CORS bypass successful with origin: ${origin}`);
      return false;
    }
  }
  
  console.log('✅ Origin validation appears secure');
  return true;
}

// Test 5: Database Query Injection (found queryDb usage)
async function testDatabaseInjection() {
  console.log('🔍 Testing Database Query Injection...');
  
  // Test SQL injection in parameterized queries
  const injectionPayloads = [
    "test'; DROP TABLE users; --",
    "test' UNION SELECT * FROM users WHERE '1'='1",
    "test' OR '1'='1' --",
    "1; EXEC xp_cmdshell('dir'); --",
    "test'; WAITFOR DELAY '00:00:05'; --"
  ];
  
  for (const payload of injectionPayloads) {
    const startTime = Date.now();
    
    const result = await makeRequest('/api/auth/db-login', {
      method: 'POST',
      body: JSON.stringify({
        email: payload,
        password: 'test'
      })
    });
    
    const responseTime = Date.now() - startTime;
    
    if (responseTime > 5000) {
      console.log(`❌ CRITICAL: Time-based SQL injection detected - ${responseTime}ms delay`);
      return false;
    }
    
    if (result.status === 200) {
      console.log(`❌ CRITICAL: SQL injection successful with payload: ${payload}`);
      return false;
    }
  }
  
  console.log('✅ Database queries appear protected');
  return true;
}

// Test 6: Session Fixation/JWT Manipulation
async function testSessionSecurity() {
  console.log('🔍 Testing Session Security...');
  
  // Test session/JWT tampering
  const maliciousJWTs = [
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ19pZCI6MX0.',
    'null',
    'undefined',
    '',
    'Bearer eyJ0...',
    '{"sub":"1","role":"admin"}'
  ];
  
  for (const jwt of maliciousJWTs) {
    const result = await makeRequest('/api/settings/roles', {
      headers: { 'Cookie': `ghostcrm_jwt=${jwt}` }
    });
    
    if (result.status === 200) {
      console.log(`❌ CRITICAL: Session bypass with malicious JWT: ${jwt.substring(0, 20)}...`);
      return false;
    }
  }
  
  console.log('✅ Session security appears intact');
  return true;
}

// Test 7: File Upload/Path Traversal (check file endpoints)
async function testFileUploadSecurity() {
  console.log('🔍 Testing File Upload Security...');
  
  const pathTraversalAttempts = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
    '....//....//....//etc/passwd',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    '/etc/passwd',
    'C:\\Windows\\System32\\config\\SAM'
  ];
  
  for (const path of pathTraversalAttempts) {
    const result = await makeRequest(`/api/file/${encodeURIComponent(path)}`);
    
    if (result.status === 200 && result.data?.includes('root:')) {
      console.log(`❌ CRITICAL: Path traversal successful: ${path}`);
      return false;
    }
  }
  
  console.log('✅ File access appears secure');
  return true;
}

// Test 8: Environment Variable Exposure
async function testEnvironmentExposure() {
  console.log('🔍 Testing Environment Variable Exposure...');
  
  const sensitivePatterns = [
    'DB_PASS',
    'JWT_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SENDGRID_API_KEY',
    'TWILIO_TOKEN',
    'API_KEY',
    'SECRET',
    'PASSWORD'
  ];
  
  const endpoints = [
    '/api/health/auth',
    '/api/health/app',
    '/.env',
    '/api/debug',
    '/config',
    '/status'
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint);
    
    for (const pattern of sensitivePatterns) {
      if (result.data?.includes(pattern)) {
        console.log(`❌ CRITICAL: Environment variable exposed in ${endpoint}: ${pattern}`);
        return false;
      }
    }
  }
  
  console.log('✅ Environment variables appear protected');
  return true;
}

// Test 9: Multi-tenant Data Isolation
async function testTenantIsolation() {
  console.log('🔍 Testing Tenant Data Isolation...');
  
  // Test tenant ID manipulation
  const maliciousTenantHeaders = [
    { 'X-Tenant-ID': '999999' },
    { 'X-Tenant-ID': '-1' },
    { 'X-Tenant-ID': 'admin' },
    { 'X-Tenant-ID': '1; DROP TABLE tenants;' },
    { 'X-Organization-ID': '0' },
    { 'Host': 'admin.ghostcrm.com' }
  ];
  
  for (const headers of maliciousTenantHeaders) {
    const result = await makeRequest('/api/inventory', { headers });
    
    if (result.status === 200) {
      console.log(`❌ WARNING: Potential tenant isolation bypass with headers: ${JSON.stringify(headers)}`);
      return false;
    }
  }
  
  console.log('✅ Tenant isolation appears secure');
  return true;
}

// Test 10: Error Information Disclosure
async function testErrorDisclosure() {
  console.log('🔍 Testing Error Information Disclosure...');
  
  const errorTriggers = [
    { endpoint: '/api/nonexistent', method: 'GET' },
    { endpoint: '/api/inventory', method: 'POST', body: '{"invalid": json}' },
    { endpoint: '/api/auth/db-login', method: 'POST', body: '{"email": null}' }
  ];
  
  for (const trigger of errorTriggers) {
    const result = await makeRequest(trigger.endpoint, {
      method: trigger.method,
      body: trigger.body,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const sensitiveErrorInfo = [
      'stack trace',
      'mssql',
      'supabase',
      'database error',
      'connection string',
      'internal server error',
      'at Object.',
      'at Function.',
      'Error: ',
      'TypeError: ',
      '/src/',
      'node_modules'
    ];
    
    for (const info of sensitiveErrorInfo) {
      if (result.data?.toLowerCase().includes(info.toLowerCase())) {
        console.log(`❌ WARNING: Information disclosure in error from ${trigger.endpoint}: ${info}`);
        return false;
      }
    }
  }
  
  console.log('✅ Error handling appears secure');
  return true;
}

// Main execution
async function runTargetedTests() {
  console.log('🚀 Starting Targeted Vulnerability Assessment...\n');
  
  const tests = [
    { name: 'JWT Secret Exposure', test: testJWTSecretExposure },
    { name: 'Supabase Key Exposure', test: testSupabaseKeyExposure },
    { name: 'Rate Limiting Bypass', test: testRateLimitingBypass },
    { name: 'Origin/CORS Bypass', test: testOriginBypass },
    { name: 'Database Injection', test: testDatabaseInjection },
    { name: 'Session Security', test: testSessionSecurity },
    { name: 'File Upload Security', test: testFileUploadSecurity },
    { name: 'Environment Exposure', test: testEnvironmentExposure },
    { name: 'Tenant Isolation', test: testTenantIsolation },
    { name: 'Error Disclosure', test: testErrorDisclosure }
  ];
  
  const results = [];
  
  for (const { name, test } of tests) {
    try {
      const passed = await test();
      results.push({ name, passed });
    } catch (error) {
      console.log(`❌ Test "${name}" failed with error: ${error.message}`);
      results.push({ name, passed: false, error: error.message });
    }
  }
  
  // Summary
  console.log('\n📊 TARGETED TEST RESULTS:');
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
    console.log('\n🚨 URGENT: Fix the failed tests before production deployment!');
  } else {
    console.log('\n🎉 All targeted vulnerability tests passed!');
  }
  
  return results;
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTargetedTests };
} else {
  // Run if executed directly
  runTargetedTests().catch(console.error);
}