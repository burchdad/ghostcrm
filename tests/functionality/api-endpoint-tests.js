/**
 * COMPREHENSIVE API ENDPOINT TESTING
 * Tests all API endpoints with various input scenarios, validation, error handling
 */

const fetch = require('node-fetch');

class APIEndpointTester {
  constructor() {
    this.baseUrl = process.env.TEST_BASE_URL || 'https://ghostcrm.ai';
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      endpointResults: {},
      errors: []
    };

    // Define all API endpoints and their expected behavior
    this.endpoints = {
      // Authentication endpoints
      'POST /api/auth/login': {
        method: 'POST',
        path: '/api/auth/login',
        requiresAuth: false,
        testCases: [
          {
            name: 'Valid Login',
            payload: { email: 'test@example.com', password: 'testPassword123' },
            expectedStatus: [200, 201],
            expectedFields: ['success', 'user']
          },
          {
            name: 'Invalid Email',
            payload: { email: 'invalid-email', password: 'testPassword123' },
            expectedStatus: [400, 401],
            expectedFields: ['error']
          },
          {
            name: 'Missing Password',
            payload: { email: 'test@example.com' },
            expectedStatus: [400],
            expectedFields: ['error']
          },
          {
            name: 'SQL Injection Attempt',
            payload: { email: "'; DROP TABLE users; --", password: 'test' },
            expectedStatus: [400, 401],
            expectedFields: ['error']
          }
        ]
      },
      
      'POST /api/auth/register': {
        method: 'POST',
        path: '/api/auth/register',
        requiresAuth: false,
        testCases: [
          {
            name: 'Valid Registration',
            payload: { 
              email: 'newuser@example.com', 
              password: 'newPassword123',
              firstName: 'Test',
              lastName: 'User',
              companyName: 'Test Company'
            },
            expectedStatus: [200, 201],
            expectedFields: ['success', 'user']
          },
          {
            name: 'Duplicate Email',
            payload: { 
              email: 'test@example.com', 
              password: 'testPassword123',
              firstName: 'Test',
              lastName: 'User'
            },
            expectedStatus: [409, 400],
            expectedFields: ['error']
          },
          {
            name: 'Weak Password',
            payload: { 
              email: 'weak@example.com', 
              password: '123',
              firstName: 'Test',
              lastName: 'User'
            },
            expectedStatus: [400],
            expectedFields: ['error']
          }
        ]
      },

      'POST /api/auth/request-reset': {
        method: 'POST',
        path: '/api/auth/request-reset',
        requiresAuth: false,
        testCases: [
          {
            name: 'Valid Reset Request',
            payload: { email: 'test@example.com' },
            expectedStatus: [200],
            expectedFields: ['success']
          },
          {
            name: 'Invalid Email Format',
            payload: { email: 'invalid-email' },
            expectedStatus: [400],
            expectedFields: ['error']
          }
        ]
      },

      // Leads endpoints
      'GET /api/leads': {
        method: 'GET',
        path: '/api/leads',
        requiresAuth: true,
        testCases: [
          {
            name: 'Get All Leads',
            payload: null,
            expectedStatus: [200],
            expectedFields: ['leads', 'total']
          },
          {
            name: 'Get Leads with Pagination',
            payload: null,
            queryParams: { page: 1, limit: 10 },
            expectedStatus: [200],
            expectedFields: ['leads']
          }
        ]
      },

      'POST /api/leads': {
        method: 'POST',
        path: '/api/leads',
        requiresAuth: true,
        testCases: [
          {
            name: 'Create Valid Lead',
            payload: {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              phone: '+1234567890',
              company: 'Test Company'
            },
            expectedStatus: [200, 201],
            expectedFields: ['success', 'lead']
          },
          {
            name: 'Create Lead Missing Email',
            payload: {
              firstName: 'John',
              lastName: 'Doe',
              phone: '+1234567890'
            },
            expectedStatus: [400],
            expectedFields: ['error']
          },
          {
            name: 'Create Lead Invalid Email',
            payload: {
              firstName: 'John',
              lastName: 'Doe',
              email: 'invalid-email-format',
              phone: '+1234567890'
            },
            expectedStatus: [400],
            expectedFields: ['error']
          }
        ]
      },

      // Deals endpoints
      'GET /api/deals': {
        method: 'GET',
        path: '/api/deals',
        requiresAuth: true,
        testCases: [
          {
            name: 'Get All Deals',
            payload: null,
            expectedStatus: [200],
            expectedFields: ['deals']
          }
        ]
      },

      'POST /api/deals': {
        method: 'POST',
        path: '/api/deals',
        requiresAuth: true,
        testCases: [
          {
            name: 'Create Valid Deal',
            payload: {
              title: 'Test Deal',
              value: 10000,
              leadId: 'test-lead-id',
              stage: 'proposal'
            },
            expectedStatus: [200, 201],
            expectedFields: ['success', 'deal']
          },
          {
            name: 'Create Deal Invalid Value',
            payload: {
              title: 'Test Deal',
              value: 'invalid-number',
              leadId: 'test-lead-id'
            },
            expectedStatus: [400],
            expectedFields: ['error']
          }
        ]
      },

      // Inventory endpoints
      'GET /api/inventory': {
        method: 'GET',
        path: '/api/inventory',
        requiresAuth: true,
        testCases: [
          {
            name: 'Get Inventory',
            payload: null,
            expectedStatus: [200],
            expectedFields: ['inventory']
          }
        ]
      },

      'POST /api/inventory': {
        method: 'POST',
        path: '/api/inventory',
        requiresAuth: true,
        testCases: [
          {
            name: 'Add Inventory Item',
            payload: {
              sku: 'TEST-SKU-001',
              name: 'Test Product',
              quantity: 100,
              price: 99.99
            },
            expectedStatus: [200, 201],
            expectedFields: ['success']
          }
        ]
      },

      // Settings endpoints
      'GET /api/settings/workspace': {
        method: 'GET',
        path: '/api/settings/workspace',
        requiresAuth: true,
        testCases: [
          {
            name: 'Get Workspace Settings',
            payload: null,
            expectedStatus: [200],
            expectedFields: ['settings']
          }
        ]
      },

      'POST /api/settings/workspace': {
        method: 'POST',
        path: '/api/settings/workspace',
        requiresAuth: true,
        testCases: [
          {
            name: 'Update Workspace Settings',
            payload: {
              workspaceName: 'Updated Test Workspace',
              timezone: 'UTC'
            },
            expectedStatus: [200],
            expectedFields: ['success']
          }
        ]
      },

      'GET /api/settings/integrations': {
        method: 'GET',
        path: '/api/settings/integrations',
        requiresAuth: true,
        testCases: [
          {
            name: 'Get Integrations',
            payload: null,
            expectedStatus: [200],
            expectedFields: ['integrations']
          }
        ]
      },

      // Reports endpoints
      'GET /api/reports/custom': {
        method: 'GET',
        path: '/api/reports/custom',
        requiresAuth: true,
        testCases: [
          {
            name: 'Get Custom Reports',
            payload: null,
            expectedStatus: [200],
            expectedFields: ['reports']
          }
        ]
      },

      // AI endpoints
      'POST /api/ai/chat': {
        method: 'POST',
        path: '/api/ai/chat',
        requiresAuth: true,
        testCases: [
          {
            name: 'Valid AI Chat Request',
            payload: {
              message: 'Hello, how can you help me?',
              context: 'general'
            },
            expectedStatus: [200],
            expectedFields: ['response']
          },
          {
            name: 'Empty Message',
            payload: {
              message: '',
              context: 'general'
            },
            expectedStatus: [400],
            expectedFields: ['error']
          }
        ]
      },

      // Health check
      'GET /api/health': {
        method: 'GET',
        path: '/api/health',
        requiresAuth: false,
        testCases: [
          {
            name: 'Health Check',
            payload: null,
            expectedStatus: [200],
            expectedFields: ['status']
          }
        ]
      },

      // Admin endpoints (should be protected)
      'POST /api/admin/run-migration': {
        method: 'POST',
        path: '/api/admin/run-migration',
        requiresAuth: true,
        testCases: [
          {
            name: 'Unauthorized Migration Attempt',
            payload: {},
            expectedStatus: [403, 401],
            expectedFields: ['error']
          }
        ]
      }
    };

    this.authToken = null;
  }

  async initialize() {
    console.log('🚀 Initializing API Endpoint Testing...');
    
    // Try to authenticate to get a token for protected endpoints
    await this.authenticate();
  }

  async authenticate() {
    console.log('🔐 Authenticating for API tests...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testPassword123'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Extract token from cookie or response
        const cookies = response.headers.get('set-cookie');
        if (cookies) {
          const tokenMatch = cookies.match(/ghostcrm_jwt=([^;]+)/);
          if (tokenMatch) {
            this.authToken = tokenMatch[1];
            console.log('✅ Authentication successful');
            return true;
          }
        }
        
        // Alternative: check if token is in response
        if (data.token) {
          this.authToken = data.token;
          console.log('✅ Authentication successful');
          return true;
        }
      }
      
      console.log('❌ Authentication failed - will test public endpoints only');
      return false;
    } catch (error) {
      console.log(`❌ Authentication error: ${error.message}`);
      return false;
    }
  }

  async testEndpoint(endpointName, config) {
    console.log(`\n🧪 Testing Endpoint: ${endpointName}`);
    
    this.testResults.endpointResults[endpointName] = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    // Skip protected endpoints if not authenticated
    if (config.requiresAuth && !this.authToken) {
      console.log('⏭️  Skipping protected endpoint - no auth token');
      return;
    }

    for (const testCase of config.testCases) {
      await this.runEndpointTest(endpointName, config, testCase);
    }
  }

  async runEndpointTest(endpointName, config, testCase) {
    console.log(`  🔍 Testing: ${testCase.name}`);
    
    this.testResults.total++;
    this.testResults.endpointResults[endpointName].total++;

    try {
      const url = new URL(config.path, this.baseUrl);
      
      // Add query parameters if specified
      if (testCase.queryParams) {
        Object.entries(testCase.queryParams).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      const options = {
        method: config.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      // Add auth token if required
      if (config.requiresAuth && this.authToken) {
        options.headers['Cookie'] = `ghostcrm_jwt=${this.authToken}`;
      }

      // Add body for POST/PUT requests
      if (testCase.payload && (config.method === 'POST' || config.method === 'PUT')) {
        options.body = JSON.stringify(testCase.payload);
      }

      const response = await fetch(url.toString(), options);
      const responseData = await this.parseResponse(response);

      // Test status code
      const statusMatch = testCase.expectedStatus.includes(response.status);
      if (!statusMatch) {
        throw new Error(`Expected status ${testCase.expectedStatus.join(' or ')}, got ${response.status}`);
      }

      // Test response structure
      if (testCase.expectedFields && responseData) {
        for (const field of testCase.expectedFields) {
          if (!(field in responseData)) {
            throw new Error(`Expected field '${field}' not found in response`);
          }
        }
      }

      // Additional security tests
      await this.performSecurityTests(endpointName, config, testCase, response, responseData);

      this.recordEndpointResult(endpointName, testCase.name, true);
      
    } catch (error) {
      this.recordEndpointResult(endpointName, testCase.name, false, error.message);
    }
  }

  async parseResponse(response) {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      return null;
    }
  }

  async performSecurityTests(endpointName, config, testCase, response, responseData) {
    // Test for information disclosure
    const responseText = JSON.stringify(responseData).toLowerCase();
    const sensitivePatterns = [
      'password', 'secret', 'key', 'token', 'credential',
      'supabase', 'database', 'connection', 'env'
    ];

    for (const pattern of sensitivePatterns) {
      if (responseText.includes(pattern) && !responseText.includes('[redacted]')) {
        console.log(`    ⚠️  Security Warning: Response may contain sensitive information (${pattern})`);
      }
    }

    // Test response headers
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];

    for (const header of securityHeaders) {
      if (!response.headers.get(header)) {
        console.log(`    ⚠️  Security Warning: Missing security header ${header}`);
      }
    }

    // Test for proper error handling
    if (response.status >= 400 && responseData) {
      const errorResponse = JSON.stringify(responseData);
      if (errorResponse.includes('stack') || errorResponse.includes('trace')) {
        console.log('    ⚠️  Security Warning: Error response contains stack trace');
      }
    }
  }

  async testRateLimiting(endpointName, config) {
    if (!config.requiresAuth) return; // Only test rate limiting on protected endpoints

    console.log(`  🔒 Testing rate limiting for ${endpointName}`);
    
    const testCase = config.testCases[0]; // Use first test case for rate limiting
    let consecutiveRequests = 0;
    let rateLimited = false;

    for (let i = 0; i < 20; i++) { // Send 20 rapid requests
      try {
        const url = new URL(config.path, this.baseUrl);
        const options = {
          method: config.method,
          headers: {
            'Content-Type': 'application/json'
          }
        };

        if (this.authToken) {
          options.headers['Cookie'] = `ghostcrm_jwt=${this.authToken}`;
        }

        if (testCase.payload && (config.method === 'POST' || config.method === 'PUT')) {
          options.body = JSON.stringify(testCase.payload);
        }

        const response = await fetch(url.toString(), options);
        
        if (response.status === 429) {
          rateLimited = true;
          break;
        }
        
        consecutiveRequests++;
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        break;
      }
    }

    if (rateLimited) {
      console.log(`    ✅ Rate limiting active after ${consecutiveRequests} requests`);
    } else {
      console.log(`    ⚠️  No rate limiting detected after 20 requests`);
    }
  }

  recordEndpointResult(endpointName, testName, passed, error = null) {
    const endpointResult = this.testResults.endpointResults[endpointName];
    
    if (passed) {
      this.testResults.passed++;
      endpointResult.passed++;
      console.log(`    ✅ ${testName}`);
    } else {
      this.testResults.failed++;
      endpointResult.failed++;
      console.log(`    ❌ ${testName}: ${error}`);
      this.testResults.errors.push(`${endpointName} - ${testName}: ${error}`);
    }

    endpointResult.tests.push({
      test: testName,
      status: passed ? 'PASS' : 'FAIL',
      error: error,
      timestamp: new Date().toISOString()
    });
  }

  async runAllEndpointTests() {
    console.log('🚀 Starting Comprehensive API Endpoint Tests...');
    
    for (const [endpointName, config] of Object.entries(this.endpoints)) {
      await this.testEndpoint(endpointName, config);
      
      // Test rate limiting for protected endpoints
      if (config.requiresAuth && this.authToken) {
        await this.testRateLimiting(endpointName, config);
      }
    }
  }

  generateReport() {
    const passRate = this.testResults.total > 0 ? 
      ((this.testResults.passed / this.testResults.total) * 100).toFixed(2) : 0;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 API ENDPOINT FUNCTIONALITY TEST REPORT');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed} (${passRate}%)`);
    console.log(`Failed: ${this.testResults.failed}`);
    
    console.log('\n📋 ENDPOINT BREAKDOWN:');
    for (const [endpoint, results] of Object.entries(this.testResults.endpointResults)) {
      const endpointPassRate = results.total > 0 ? 
        ((results.passed / results.total) * 100).toFixed(2) : 0;
      console.log(`  ${endpoint}: ${results.passed}/${results.total} (${endpointPassRate}%)`);
    }

    if (this.testResults.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.testResults.errors.slice(0, 15).forEach(error => console.log(`  • ${error}`));
      if (this.testResults.errors.length > 15) {
        console.log(`  ... and ${this.testResults.errors.length - 15} more errors`);
      }
    }

    return {
      summary: {
        total: this.testResults.total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        passRate: parseFloat(passRate)
      },
      endpoints: this.testResults.endpointResults,
      errors: this.testResults.errors
    };
  }
}

module.exports = { APIEndpointTester };