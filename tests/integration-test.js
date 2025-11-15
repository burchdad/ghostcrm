// =============================================================================
// COMPREHENSIVE API & INTEGRATION CONNECTIVITY TEST
// Tests all external services, APIs, and integrations in GhostCRM
// =============================================================================

const fs = require('fs');
const path = require('path');

class IntegrationTester {
  constructor() {
    this.baseUrl = process.env.TEST_BASE_URL || 'https://ghostcrm.ai';
    this.results = {
      timestamp: new Date().toISOString(),
      overall_status: 'unknown',
      tests_run: 0,
      tests_passed: 0,
      tests_failed: 0,
      categories: {}
    };
  }

  /**
   * Test HTTP endpoint connectivity
   */
  async testEndpoint(name, url, options = {}) {
    const method = options.method || 'GET';
    const headers = options.headers || {};
    const expectedStatus = options.expectedStatus || 200;
    
    try {
      console.log(`🔍 Testing ${name}: ${method} ${url}`);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      const isSuccess = response.status === expectedStatus;
      
      if (isSuccess) {
        console.log(`✅ ${name}: OK (${response.status})`);
      } else {
        console.log(`❌ ${name}: Failed (${response.status})`);
      }

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = await response.text();
      }

      return {
        name,
        status: isSuccess ? 'pass' : 'fail',
        response_code: response.status,
        response_data: responseData,
        error: isSuccess ? null : `Expected ${expectedStatus}, got ${response.status}`
      };

    } catch (error) {
      console.log(`❌ ${name}: Error - ${error.message}`);
      return {
        name,
        status: 'fail',
        response_code: null,
        response_data: null,
        error: error.message
      };
    }
  }

  /**
   * Test internal API routes
   */
  async testInternalAPIs() {
    console.log('\n🔧 Testing Internal API Routes...');
    
    const apiTests = [
      {
        name: 'Health Check',
        url: `${this.baseUrl}/api/_health/version`,
        expectedStatus: 200
      },
      {
        name: 'Demo Login API Info',
        url: `${this.baseUrl}/api/auth/demo-login`,
        expectedStatus: 200
      },
      {
        name: 'Integrations List',
        url: `${this.baseUrl}/api/settings/integrations`,
        expectedStatus: 200
      },
      {
        name: 'Demo Admin Info',
        url: `${this.baseUrl}/api/admin/demo`,
        expectedStatus: 200
      },
      {
        name: 'Templates API',
        url: `${this.baseUrl}/api/templates`,
        expectedStatus: 200
      },
      {
        name: 'WebSocket Health',
        url: `${this.baseUrl}/api/websocket/dashboard`,
        expectedStatus: 200
      }
    ];

    const results = [];
    for (const test of apiTests) {
      const result = await this.testEndpoint(test.name, test.url, { expectedStatus: test.expectedStatus });
      results.push(result);
      this.updateStats(result);
    }

    this.results.categories.internal_apis = {
      total: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      tests: results
    };
  }

  /**
   * Test authentication flows
   */
  async testAuthentication() {
    console.log('\n🔐 Testing Authentication Systems...');
    
    const authTests = [
      {
        name: 'Demo Login',
        url: `${this.baseUrl}/api/auth/demo-login`,
        method: 'POST',
        body: {
          email: 'demo@ghostcrm.com',
          password: 'demo123'
        },
        expectedStatus: 200
      },
      {
        name: 'Login Endpoint',
        url: `${this.baseUrl}/api/auth/login`,
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'invalidpassword'
        },
        expectedStatus: 401 // Should fail with invalid credentials
      },
      {
        name: 'Logout Endpoint',
        url: `${this.baseUrl}/api/auth/logout`,
        method: 'POST',
        expectedStatus: 200
      }
    ];

    const results = [];
    for (const test of authTests) {
      const result = await this.testEndpoint(test.name, test.url, test);
      results.push(result);
      this.updateStats(result);
    }

    this.results.categories.authentication = {
      total: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      tests: results
    };
  }

  /**
   * Test external service connections
   */
  async testExternalServices() {
    console.log('\n🌐 Testing External Service Connections...');
    
    const externalTests = [
      {
        name: 'Supabase Health',
        url: 'https://supabase.com',
        expectedStatus: 200
      },
      {
        name: 'SendGrid API',
        url: 'https://api.sendgrid.com/v3/user/profile',
        expectedStatus: 401 // Should fail without API key - but connection works
      },
      // Skipping Twilio per user request
      {
        name: 'OpenAI API Health',
        url: 'https://api.openai.com/v1/models',
        expectedStatus: 401 // Should fail without API key - but connection works
      },
      {
        name: 'Stripe API Health',
        url: 'https://api.stripe.com/v1/account',
        expectedStatus: 401 // Should fail without API key - but connection works
      }
    ];

    const results = [];
    for (const test of externalTests) {
      const result = await this.testEndpoint(test.name, test.url, test);
      results.push(result);
      this.updateStats(result);
    }

    this.results.categories.external_services = {
      total: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      tests: results
    };
  }

  /**
   * Test integration endpoints
   */
  async testIntegrationAPIs() {
    console.log('\n🔗 Testing Integration APIs...');
    
    const integrationTests = [
      {
        name: 'Integration Test Endpoint',
        url: `${this.baseUrl}/api/integrations/test`,
        method: 'POST',
        body: {
          type: 'rest-api',
          credentials: {
            baseUrl: 'https://jsonplaceholder.typicode.com',
            authType: 'none'
          }
        },
        expectedStatus: 200
      },
      {
        name: 'Generic Integration Connect',
        url: `${this.baseUrl}/api/settings/integrations/generic`,
        method: 'POST',
        body: {
          integrationId: 'rest-api',
          configuration: {
            baseUrl: 'https://api.example.com',
            authType: 'none'
          }
        },
        expectedStatus: 200
      }
    ];

    const results = [];
    for (const test of integrationTests) {
      const result = await this.testEndpoint(test.name, test.url, test);
      results.push(result);
      this.updateStats(result);
    }

    this.results.categories.integration_apis = {
      total: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      tests: results
    };
  }

  /**
   * Test webhook endpoints
   */
  async testWebhooks() {
    console.log('\n🪝 Testing Webhook Endpoints...');
    
    const webhookTests = [
      {
        name: 'Stripe Webhook',
        url: `${this.baseUrl}/api/webhooks/stripe`,
        method: 'POST',
        body: { type: 'test' },
        expectedStatus: 400 // Should fail without proper signature
      },
      {
        name: 'SendGrid Webhook',
        url: `${this.baseUrl}/api/webhooks/sendgrid`,
        method: 'POST',
        body: [{ event: 'test' }],
        expectedStatus: 200
      }
      // Skipping Twilio webhook per user request
    ];

    const results = [];
    for (const test of webhookTests) {
      const result = await this.testEndpoint(test.name, test.url, test);
      results.push(result);
      this.updateStats(result);
    }

    this.results.categories.webhooks = {
      total: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      tests: results
    };
  }

  /**
   * Test data API endpoints
   */
  async testDataAPIs() {
    console.log('\n📊 Testing Data API Endpoints...');
    
    const dataTests = [
      {
        name: 'Inventory API',
        url: `${this.baseUrl}/api/inventory`,
        expectedStatus: 200
      },
      {
        name: 'User Settings API',
        url: `${this.baseUrl}/api/user/settings`,
        expectedStatus: 401 // Should require authentication
      },
      {
        name: 'Organization Users API',
        url: `${this.baseUrl}/api/organization/users`,
        expectedStatus: 401 // Should require authentication
      }
    ];

    const results = [];
    for (const test of dataTests) {
      const result = await this.testEndpoint(test.name, test.url, test);
      results.push(result);
      this.updateStats(result);
    }

    this.results.categories.data_apis = {
      total: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      tests: results
    };
  }

  /**
   * Update statistics
   */
  updateStats(result) {
    this.results.tests_run++;
    if (result.status === 'pass') {
      this.results.tests_passed++;
    } else {
      this.results.tests_failed++;
    }
  }

  /**
   * Generate final report
   */
  generateReport() {
    const passRate = (this.results.tests_passed / this.results.tests_run) * 100;
    this.results.overall_status = passRate >= 70 ? 'healthy' : passRate >= 50 ? 'warning' : 'critical';
    this.results.pass_rate = `${passRate.toFixed(1)}%`;

    console.log('\n' + '='.repeat(60));
    console.log('📋 INTEGRATION CONNECTIVITY REPORT');
    console.log('='.repeat(60));
    console.log(`🕐 Timestamp: ${this.results.timestamp}`);
    console.log(`📊 Overall Status: ${this.results.overall_status.toUpperCase()}`);
    console.log(`✅ Tests Passed: ${this.results.tests_passed}/${this.results.tests_run}`);
    console.log(`❌ Tests Failed: ${this.results.tests_failed}/${this.results.tests_run}`);
    console.log(`📈 Pass Rate: ${this.results.pass_rate}`);

    // Category breakdown
    console.log('\n📂 Category Breakdown:');
    Object.entries(this.results.categories).forEach(([category, data]) => {
      const categoryPassRate = (data.passed / data.total) * 100;
      const status = categoryPassRate === 100 ? '✅' : categoryPassRate >= 50 ? '⚠️' : '❌';
      console.log(`${status} ${category.replace(/_/g, ' ').toUpperCase()}: ${data.passed}/${data.total} (${categoryPassRate.toFixed(1)}%)`);
    });

    // Failed tests
    if (this.results.tests_failed > 0) {
      console.log('\n❌ Failed Tests:');
      Object.values(this.results.categories).forEach(category => {
        category.tests.filter(test => test.status === 'fail').forEach(test => {
          console.log(`   • ${test.name}: ${test.error || 'Unknown error'}`);
        });
      });
    }

    // Key findings
    console.log('\n🔍 Key Findings:');
    
    // Check for critical services
    const criticalServices = ['Health Check', 'Demo Login', 'Supabase Health'];
    const criticalFailures = [];
    Object.values(this.results.categories).forEach(category => {
      category.tests.forEach(test => {
        if (criticalServices.includes(test.name) && test.status === 'fail') {
          criticalFailures.push(test.name);
        }
      });
    });

    if (criticalFailures.length === 0) {
      console.log('✅ All critical services are functional');
    } else {
      console.log(`❌ Critical services down: ${criticalFailures.join(', ')}`);
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (this.results.overall_status === 'healthy') {
      console.log('✅ All systems are functioning well. No immediate action required.');
    } else if (this.results.overall_status === 'warning') {
      console.log('⚠️ Some non-critical issues detected. Review failed tests and address when convenient.');
    } else {
      console.log('🚨 Critical issues detected. Immediate attention required for failed services.');
    }

    console.log('\n' + '='.repeat(60));

    return this.results;
  }

  /**
   * Save results to file
   */
  async saveResults(filename = 'integration-test-results.json') {
    const filePath = path.join(process.cwd(), filename);
    await fs.promises.writeFile(filePath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Results saved to: ${filePath}`);
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Integration Tests...\n');
    
    try {
      await this.testInternalAPIs();
      await this.testAuthentication();
      await this.testExternalServices();
      await this.testIntegrationAPIs();
      await this.testWebhooks();
      await this.testDataAPIs();
      
      const results = this.generateReport();
      await this.saveResults();
      
      return results;
    } catch (error) {
      console.error('❌ Test runner error:', error);
      throw error;
    }
  }
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IntegrationTester;
}

// Run tests if called directly
if (typeof require !== 'undefined' && require.main === module) {
  const tester = new IntegrationTester();
  tester.runAllTests().catch(console.error);
}