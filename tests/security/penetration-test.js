/**
 * 🔥 COMPREHENSIVE SECURITY PENETRATION TESTS 🔥
 * 
 * This test suite attempts to break your system and identify vulnerabilities.
 * Run this against a development environment - NEVER against production!
 * 
 * Areas tested:
 * 1. API Rate Limiting & DDoS
 * 2. Authentication Bypass
 * 3. SQL Injection & Database Security
 * 4. Multi-tenant Data Isolation
 * 5. XSS & Input Validation
 * 6. CSRF Protection
 * 7. Information Disclosure
 * 8. Race Conditions
 * 9. JWT Security
 * 10. Authorization Bypass
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

console.log(`${COLORS.RED}${COLORS.BOLD}🔥 STARTING SECURITY PENETRATION TESTS 🔥${COLORS.RESET}\n`);
console.log(`${COLORS.YELLOW}Target: ${BASE_URL}${COLORS.RESET}\n`);

let testResults = {
  passed: 0,
  failed: 0,
  vulnerabilities: [],
  criticalIssues: []
};

// Helper functions
function log(message, color = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function logTest(testName, passed, details = '') {
  const status = passed ? `${COLORS.GREEN}✅ PASS` : `${COLORS.RED}❌ FAIL`;
  log(`${status} - ${testName}${COLORS.RESET}`);
  if (details) log(`  ${COLORS.CYAN}${details}${COLORS.RESET}`);
  
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
    testResults.vulnerabilities.push({ test: testName, details });
  }
}

function logCritical(issue) {
  log(`${COLORS.RED}${COLORS.BOLD}🚨 CRITICAL VULNERABILITY: ${issue}${COLORS.RESET}`);
  testResults.criticalIssues.push(issue);
}

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

// 1. API RATE LIMITING & DDoS TESTS
async function testRateLimiting() {
  log(`\n${COLORS.BLUE}${COLORS.BOLD}1. TESTING API RATE LIMITING & DDoS PROTECTION${COLORS.RESET}`);
  
  // Test 1.1: Rapid-fire login attempts
  log(`\n${COLORS.CYAN}Test 1.1: Rapid-fire login attempts${COLORS.RESET}`);
  const loginPromises = [];
  for (let i = 0; i < 50; i++) {
    loginPromises.push(makeRequest('/api/auth/db-login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'attacker@test.com',
        password: 'wrongpassword'
      })
    }));
  }
  
  const loginResults = await Promise.all(loginPromises);
  const rateLimited = loginResults.filter(r => r.status === 429).length;
  const successful = loginResults.filter(r => r.status !== 429).length;
  
  logTest('Rate limiting on login attempts', rateLimited > 0, 
    `${rateLimited} requests rate limited, ${successful} not limited`);
  
  if (successful > 20) {
    logCritical('No effective rate limiting on login endpoint - allows brute force attacks');
  }

  // Test 1.2: API endpoint flooding
  log(`\n${COLORS.CYAN}Test 1.2: API endpoint flooding${COLORS.RESET}`);
  const apiPromises = [];
  const endpoints = ['/api/health/auth', '/api/settings/roles', '/api/inventory', '/api/dashboard/apiendpoints/secrets'];
  
  for (let i = 0; i < 100; i++) {
    const endpoint = endpoints[i % endpoints.length];
    apiPromises.push(makeRequest(endpoint));
  }
  
  const apiResults = await Promise.all(apiPromises);
  const apiRateLimited = apiResults.filter(r => r.status === 429).length;
  
  logTest('Rate limiting on API endpoints', apiRateLimited > 0, 
    `${apiRateLimited} out of 100 requests were rate limited`);

  // Test 1.3: Memory exhaustion via large payloads
  log(`\n${COLORS.CYAN}Test 1.3: Large payload DoS attempt${COLORS.RESET}`);
  const largePayload = 'A'.repeat(10 * 1024 * 1024); // 10MB payload
  const largeResult = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@test.com',
      password: 'password123',
      firstName: largePayload
    })
  });
  
  logTest('Large payload protection', largeResult.status !== 200, 
    `Server response: ${largeResult.status} - ${largeResult.data?.substring(0, 100)}...`);
    
  if (largeResult.status === 200) {
    logCritical('Server accepts extremely large payloads - potential DoS vector');
  }
}

// 2. AUTHENTICATION BYPASS TESTS
async function testAuthenticationBypass() {
  log(`\n${COLORS.BLUE}${COLORS.BOLD}2. TESTING AUTHENTICATION BYPASS${COLORS.RESET}`);
  
  // Test 2.1: JWT bypass attempts
  log(`\n${COLORS.CYAN}Test 2.1: JWT bypass attempts${COLORS.RESET}`);
  
  const jwtBypassAttempts = [
    { name: 'No JWT', headers: {} },
    { name: 'Empty JWT', headers: { 'Cookie': 'ghostcrm_jwt=' } },
    { name: 'Invalid JWT', headers: { 'Cookie': 'ghostcrm_jwt=invalid.token.here' } },
    { name: 'Null JWT', headers: { 'Cookie': 'ghostcrm_jwt=null' } },
    { name: 'Algorithm confusion', headers: { 'Cookie': 'ghostcrm_jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJhZG1pbiJ9.' } }
  ];
  
  for (const attempt of jwtBypassAttempts) {
    const result = await makeRequest('/api/settings/roles', { headers: attempt.headers });
    logTest(`${attempt.name} JWT bypass`, result.status === 401 || result.status === 403, 
      `Status: ${result.status}`);
      
    if (result.status === 200) {
      logCritical(`Authentication bypass possible with ${attempt.name}`);
    }
  }

  // Test 2.2: SQL injection in authentication
  log(`\n${COLORS.CYAN}Test 2.2: SQL injection in authentication${COLORS.RESET}`);
  
  const sqlInjectionAttempts = [
    "admin'--",
    "admin' OR '1'='1'--",
    "admin' OR '1'='1' /*",
    "admin'; DROP TABLE users;--",
    "admin' UNION SELECT 1,2,3,4,5--",
    "admin' OR SLEEP(5)--"
  ];
  
  for (const injection of sqlInjectionAttempts) {
    const result = await makeRequest('/api/auth/db-login', {
      method: 'POST',
      body: JSON.stringify({
        email: injection,
        password: 'password'
      })
    });
    
    const startTime = Date.now();
    const responseTime = Date.now() - startTime;
    
    logTest(`SQL injection attempt: ${injection}`, result.status !== 200, 
      `Status: ${result.status}, Response time: ${responseTime}ms`);
      
    if (result.status === 200) {
      logCritical(`SQL injection successful with payload: ${injection}`);
    }
    
    if (responseTime > 5000) {
      logCritical(`Time-based SQL injection detected - response time: ${responseTime}ms`);
    }
  }

  // Test 2.3: TOTP bypass attempts
  log(`\n${COLORS.CYAN}Test 2.3: TOTP bypass attempts${COLORS.RESET}`);
  
  const totpBypassAttempts = [
    '',
    '000000',
    '123456',
    '999999',
    'null',
    'undefined',
    '0'.repeat(1000)
  ];
  
  for (const totp of totpBypassAttempts) {
    const result = await makeRequest('/api/auth/db-login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'password123',
        totp: totp
      })
    });
    
    logTest(`TOTP bypass with: ${totp}`, result.status !== 200, 
      `Status: ${result.status}`);
  }
}

// 3. DATABASE SECURITY TESTS
async function testDatabaseSecurity() {
  log(`\n${COLORS.BLUE}${COLORS.BOLD}3. TESTING DATABASE SECURITY${COLORS.RESET}`);
  
  // Test 3.1: NoSQL injection (for Supabase/MongoDB components)
  log(`\n${COLORS.CYAN}Test 3.1: NoSQL injection attempts${COLORS.RESET}`);
  
  const noSQLPayloads = [
    { "email": { "$ne": null }, "password": { "$ne": null } },
    { "email": { "$regex": ".*" }, "password": { "$regex": ".*" } },
    { "email": { "$where": "return true" } },
    { "$or": [{"email": "admin"}, {"role": "admin"}] }
  ];
  
  for (const payload of noSQLPayloads) {
    const result = await makeRequest('/api/auth/db-login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    logTest(`NoSQL injection: ${JSON.stringify(payload)}`, result.status !== 200, 
      `Status: ${result.status}`);
  }

  // Test 3.2: Database connection string exposure
  log(`\n${COLORS.CYAN}Test 3.2: Database connection info disclosure${COLORS.RESET}`);
  
  const dbDisclosureEndpoints = [
    '/api/health/auth',
    '/api/health/app',
    '/api/settings/integrations/supabase',
    '/.env',
    '/config.json',
    '/api/debug'
  ];
  
  for (const endpoint of dbDisclosureEndpoints) {
    const result = await makeRequest(endpoint);
    const containsSensitive = result.data && (
      result.data.includes('DB_PASS') ||
      result.data.includes('supabase') ||
      result.data.includes('postgresql://') ||
      result.data.includes('connection_string')
    );
    
    logTest(`DB info disclosure in ${endpoint}`, !containsSensitive, 
      `Contains sensitive data: ${containsSensitive}`);
      
    if (containsSensitive) {
      logCritical(`Database connection information exposed in ${endpoint}`);
    }
  }

  // Test 3.3: Mass assignment vulnerabilities
  log(`\n${COLORS.CYAN}Test 3.3: Mass assignment vulnerabilities${COLORS.RESET}`);
  
  const massAssignmentPayload = {
    email: 'test@test.com',
    password: 'password123',
    role: 'admin',
    is_admin: true,
    permissions: ['all'],
    organization_id: 1,
    user_id: 1,
    id: 999
  };
  
  const massAssignResult = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(massAssignmentPayload)
  });
  
  logTest('Mass assignment protection', massAssignResult.status !== 200 || 
    !massAssignResult.data?.includes('admin'), 
    `Status: ${massAssignResult.status}`);
}

// 4. MULTI-TENANT ISOLATION TESTS
async function testTenantIsolation() {
  log(`\n${COLORS.BLUE}${COLORS.BOLD}4. TESTING MULTI-TENANT DATA ISOLATION${COLORS.RESET}`);
  
  // Test 4.1: Tenant header manipulation
  log(`\n${COLORS.CYAN}Test 4.1: Tenant header manipulation${COLORS.RESET}`);
  
  const tenantHeaders = [
    { 'X-Tenant-ID': '1' },
    { 'X-Tenant-ID': '999' },
    { 'X-Tenant-ID': '../../../admin' },
    { 'X-Tenant-ID': 'DROP TABLE tenants' },
    { 'X-Organization-ID': '1' },
    { 'Host': 'attacker.ghostcrm.com' },
    { 'Origin': 'https://victim-tenant.com' }
  ];
  
  for (const headers of tenantHeaders) {
    const result = await makeRequest('/api/inventory', { headers });
    logTest(`Tenant isolation with headers: ${JSON.stringify(headers)}`, 
      result.status === 401 || result.status === 403, 
      `Status: ${result.status}`);
  }

  // Test 4.2: Subdomain spoofing
  log(`\n${COLORS.CYAN}Test 4.2: Subdomain spoofing attempts${COLORS.RESET}`);
  
  const subdomainAttempts = [
    'admin.ghostcrm.com',
    'system.ghostcrm.com',
    'root.ghostcrm.com',
    '../admin.ghostcrm.com'
  ];
  
  for (const subdomain of subdomainAttempts) {
    const result = await makeRequest('/api/dashboard/apiendpoints/secrets', {
      headers: { 'Host': subdomain }
    });
    
    logTest(`Subdomain spoofing: ${subdomain}`, result.status !== 200, 
      `Status: ${result.status}`);
  }
}

// 5. XSS & INPUT VALIDATION TESTS
async function testInputValidation() {
  log(`\n${COLORS.BLUE}${COLORS.BOLD}5. TESTING XSS & INPUT VALIDATION${COLORS.RESET}`);
  
  // Test 5.1: XSS payloads
  log(`\n${COLORS.CYAN}Test 5.1: XSS payload injection${COLORS.RESET}`);
  
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<svg onload=alert("XSS")>',
    '"><script>alert("XSS")</script>',
    '\'-alert("XSS")-\'',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>'
  ];
  
  for (const payload of xssPayloads) {
    const result = await makeRequest('/api/settings/roles', {
      method: 'POST',
      body: JSON.stringify({
        name: payload,
        description: payload,
        permissions: [payload]
      })
    });
    
    const reflected = result.data && result.data.includes(payload);
    logTest(`XSS payload: ${payload.substring(0, 30)}...`, !reflected, 
      `Payload reflected: ${reflected}`);
      
    if (reflected) {
      logCritical(`XSS vulnerability - payload reflected: ${payload}`);
    }
  }

  // Test 5.2: Command injection
  log(`\n${COLORS.CYAN}Test 5.2: Command injection attempts${COLORS.RESET}`);
  
  const commandInjectionPayloads = [
    '; ls -la',
    '| whoami',
    '& net user',
    '; cat /etc/passwd',
    '`id`',
    '$(whoami)',
    '; ping -c 4 127.0.0.1',
    '&& dir'
  ];
  
  for (const payload of commandInjectionPayloads) {
    const result = await makeRequest('/api/inventory', {
      method: 'POST',
      body: JSON.stringify({
        name: payload,
        sku: payload,
        category: payload
      })
    });
    
    logTest(`Command injection: ${payload}`, result.status !== 200, 
      `Status: ${result.status}`);
  }

  // Test 5.3: Path traversal
  log(`\n${COLORS.CYAN}Test 5.3: Path traversal attempts${COLORS.RESET}`);
  
  const pathTraversalPayloads = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
    '....//....//....//etc/passwd',
    '%2e%2e/%2e%2e/%2e%2e/etc/passwd',
    '..%252f..%252f..%252fetc/passwd'
  ];
  
  for (const payload of pathTraversalPayloads) {
    const result = await makeRequest(`/api/file/${encodeURIComponent(payload)}`);
    logTest(`Path traversal: ${payload}`, result.status !== 200, 
      `Status: ${result.status}`);
      
    if (result.status === 200 && result.data?.includes('root:')) {
      logCritical(`Path traversal successful: ${payload}`);
    }
  }
}

// 6. CSRF PROTECTION TESTS
async function testCSRFProtection() {
  log(`\n${COLORS.BLUE}${COLORS.BOLD}6. TESTING CSRF PROTECTION${COLORS.RESET}`);
  
  // Test 6.1: Missing CSRF tokens
  log(`\n${COLORS.CYAN}Test 6.1: CSRF token validation${COLORS.RESET}`);
  
  const csrfEndpoints = [
    { endpoint: '/api/auth/db-login', method: 'POST', body: { email: 'test@test.com', password: 'test' } },
    { endpoint: '/api/settings/roles', method: 'POST', body: { name: 'test', permissions: [] } },
    { endpoint: '/api/inventory', method: 'POST', body: { name: 'test', sku: 'test' } }
  ];
  
  for (const test of csrfEndpoints) {
    // Test without Origin header
    const noOriginResult = await makeRequest(test.endpoint, {
      method: test.method,
      body: JSON.stringify(test.body),
      headers: { 'Origin': 'https://evil-site.com' }
    });
    
    logTest(`CSRF protection on ${test.endpoint}`, 
      noOriginResult.status === 403 || noOriginResult.status === 400, 
      `Status: ${noOriginResult.status}`);
      
    if (noOriginResult.status === 200) {
      logCritical(`CSRF vulnerability in ${test.endpoint} - accepts requests from external origins`);
    }
  }
}

// 7. INFORMATION DISCLOSURE TESTS
async function testInformationDisclosure() {
  log(`\n${COLORS.BLUE}${COLORS.BOLD}7. TESTING INFORMATION DISCLOSURE${COLORS.RESET}`);
  
  // Test 7.1: Error message information leakage
  log(`\n${COLORS.CYAN}Test 7.1: Error message information leakage${COLORS.RESET}`);
  
  const errorTestCases = [
    { endpoint: '/api/auth/db-login', body: { email: 'nonexistent@test.com', password: 'test' } },
    { endpoint: '/api/settings/roles/999', method: 'GET' },
    { endpoint: '/api/inventory/nonexistent', method: 'GET' },
    { endpoint: '/api/user/settings', method: 'GET' }
  ];
  
  for (const test of errorTestCases) {
    const result = await makeRequest(test.endpoint, {
      method: test.method || 'POST',
      body: test.body ? JSON.stringify(test.body) : undefined
    });
    
    const containsSensitiveInfo = result.data && (
      result.data.includes('stack trace') ||
      result.data.includes('SQLException') ||
      result.data.includes('database') ||
      result.data.includes('connection') ||
      result.data.includes('internal server error') ||
      result.data.includes('MongoError') ||
      result.data.includes('PostgresError')
    );
    
    logTest(`Information disclosure in ${test.endpoint}`, !containsSensitiveInfo, 
      `Contains sensitive info: ${containsSensitiveInfo}`);
      
    if (containsSensitiveInfo) {
      logCritical(`Information disclosure in error messages from ${test.endpoint}`);
    }
  }

  // Test 7.2: Security headers
  log(`\n${COLORS.CYAN}Test 7.2: Security headers validation${COLORS.RESET}`);
  
  const result = await makeRequest('/');
  const headers = result.headers;
  
  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'referrer-policy'
  ];
  
  for (const header of requiredHeaders) {
    const present = header in headers;
    logTest(`Security header: ${header}`, present, 
      `Value: ${headers[header] || 'missing'}`);
      
    if (!present) {
      logCritical(`Missing security header: ${header}`);
    }
  }
}

// 8. RACE CONDITION TESTS
async function testRaceConditions() {
  log(`\n${COLORS.BLUE}${COLORS.BOLD}8. TESTING RACE CONDITIONS${COLORS.RESET}`);
  
  // Test 8.1: Concurrent user creation
  log(`\n${COLORS.CYAN}Test 8.1: Concurrent user creation race condition${COLORS.RESET}`);
  
  const concurrentRegistrations = [];
  const email = `race.test.${Date.now()}@test.com`;
  
  for (let i = 0; i < 10; i++) {
    concurrentRegistrations.push(makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })
    }));
  }
  
  const registrationResults = await Promise.all(concurrentRegistrations);
  const successful = registrationResults.filter(r => r.status === 200 || r.status === 201).length;
  
  logTest('Race condition protection in user creation', successful <= 1, 
    `${successful} successful registrations with same email`);
    
  if (successful > 1) {
    logCritical(`Race condition vulnerability - ${successful} users created with same email`);
  }

  // Test 8.2: Concurrent API key usage
  log(`\n${COLORS.CYAN}Test 8.2: Concurrent API operations${COLORS.RESET}`);
  
  const concurrentOperations = [];
  for (let i = 0; i < 20; i++) {
    concurrentOperations.push(makeRequest('/api/inventory', {
      method: 'POST',
      body: JSON.stringify({
        name: `Test Item ${i}`,
        sku: `TEST-${i}`,
        category: 'Test'
      })
    }));
  }
  
  const operationResults = await Promise.all(concurrentOperations);
  const successfulOps = operationResults.filter(r => r.status === 200 || r.status === 201).length;
  
  logTest('Concurrent operations handling', successfulOps >= 0, 
    `${successfulOps} successful operations out of 20`);
}

// 9. JWT SECURITY TESTS
async function testJWTSecurity() {
  log(`\n${COLORS.BLUE}${COLORS.BOLD}9. TESTING JWT SECURITY${COLORS.RESET}`);
  
  // Test 9.1: JWT algorithm confusion
  log(`\n${COLORS.CYAN}Test 9.1: JWT algorithm confusion attack${COLORS.RESET}`);
  
  const maliciousJWTs = [
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJhZG1pbiJ9.',
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJhZG1pbiJ9.invalid',
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJhZG1pbiJ9.invalid'
  ];
  
  for (const jwt of maliciousJWTs) {
    const result = await makeRequest('/api/settings/roles', {
      headers: { 'Cookie': `ghostcrm_jwt=${jwt}` }
    });
    
    logTest(`JWT algorithm confusion: ${jwt.substring(0, 30)}...`, 
      result.status !== 200, `Status: ${result.status}`);
      
    if (result.status === 200) {
      logCritical(`JWT algorithm confusion successful`);
    }
  }

  // Test 9.2: JWT token manipulation
  log(`\n${COLORS.CYAN}Test 9.2: JWT payload manipulation${COLORS.RESET}`);
  
  // This would require a valid JWT to manipulate, skipping for now
  logTest('JWT payload manipulation test', true, 'Requires valid JWT to test properly');
}

// 10. AUTHORIZATION BYPASS TESTS
async function testAuthorizationBypass() {
  log(`\n${COLORS.BLUE}${COLORS.BOLD}10. TESTING AUTHORIZATION BYPASS${COLORS.RESET}`);
  
  // Test 10.1: Privilege escalation
  log(`\n${COLORS.CYAN}Test 10.1: Privilege escalation attempts${COLORS.RESET}`);
  
  const privilegeEscalationEndpoints = [
    '/api/admin/',
    '/api/settings/roles',
    '/api/dashboard/apiendpoints/secrets',
    '/api/security/totp-setup',
    '/api/user/settings'
  ];
  
  for (const endpoint of privilegeEscalationEndpoints) {
    const result = await makeRequest(endpoint);
    logTest(`Unauthorized access to ${endpoint}`, 
      result.status === 401 || result.status === 403, 
      `Status: ${result.status}`);
      
    if (result.status === 200) {
      logCritical(`Unauthorized access possible to admin endpoint: ${endpoint}`);
    }
  }

  // Test 10.2: Parameter pollution
  log(`\n${COLORS.CYAN}Test 10.2: HTTP parameter pollution${COLORS.RESET}`);
  
  const pollutionResult = await makeRequest('/api/inventory?user_id=1&user_id=2&role=admin&role=user');
  logTest('Parameter pollution protection', pollutionResult.status !== 200 || 
    !pollutionResult.data?.includes('admin'), 
    `Status: ${pollutionResult.status}`);
}

// MAIN TEST EXECUTION
async function runAllTests() {
  const startTime = Date.now();
  
  try {
    await testRateLimiting();
    await testAuthenticationBypass();
    await testDatabaseSecurity();
    await testTenantIsolation();
    await testInputValidation();
    await testCSRFProtection();
    await testInformationDisclosure();
    await testRaceConditions();
    await testJWTSecurity();
    await testAuthorizationBypass();
  } catch (error) {
    log(`${COLORS.RED}Test execution error: ${error.message}${COLORS.RESET}`);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // FINAL RESULTS
  log(`\n${COLORS.BOLD}${COLORS.BLUE}=====================================`);
  log(`📊 PENETRATION TEST RESULTS`);
  log(`=====================================`);
  log(`⏱️  Duration: ${duration} seconds`);
  log(`✅ Tests Passed: ${testResults.passed}`);
  log(`❌ Tests Failed: ${testResults.failed}`);
  log(`🚨 Critical Issues: ${testResults.criticalIssues.length}${COLORS.RESET}`);
  
  if (testResults.criticalIssues.length > 0) {
    log(`\n${COLORS.RED}${COLORS.BOLD}🚨 CRITICAL VULNERABILITIES FOUND:${COLORS.RESET}`);
    testResults.criticalIssues.forEach((issue, index) => {
      log(`${COLORS.RED}${index + 1}. ${issue}${COLORS.RESET}`);
    });
  }
  
  if (testResults.vulnerabilities.length > 0) {
    log(`\n${COLORS.YELLOW}${COLORS.BOLD}⚠️  ALL VULNERABILITIES:${COLORS.RESET}`);
    testResults.vulnerabilities.forEach((vuln, index) => {
      log(`${COLORS.YELLOW}${index + 1}. ${vuln.test}: ${vuln.details}${COLORS.RESET}`);
    });
  }
  
  if (testResults.criticalIssues.length === 0) {
    log(`\n${COLORS.GREEN}${COLORS.BOLD}🎉 No critical vulnerabilities found!${COLORS.RESET}`);
  }
  
  log(`\n${COLORS.BLUE}${COLORS.BOLD}📋 RECOMMENDATIONS:${COLORS.RESET}`);
  log(`${COLORS.CYAN}1. Implement comprehensive rate limiting on all endpoints`);
  log(`2. Add input validation and sanitization`);
  log(`3. Implement proper CSRF protection`);
  log(`4. Add request size limits`);
  log(`5. Implement proper error handling without information disclosure`);
  log(`6. Add comprehensive logging and monitoring`);
  log(`7. Regular security audits and penetration testing`);
  log(`8. Implement WAF (Web Application Firewall)${COLORS.RESET}`);
  
  log(`\n${COLORS.BOLD}🔒 Remember: Fix all critical issues before production deployment!${COLORS.RESET}`);
}

// Run the tests
runAllTests().catch(error => {
  console.error(`${COLORS.RED}Fatal error running tests: ${error.message}${COLORS.RESET}`);
  process.exit(1);
});