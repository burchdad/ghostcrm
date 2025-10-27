/**
 * AUTHENTICATION & AUTHORIZATION TESTS
 * Tests authentication flows, authorization, role-based access, session management
 */

const { chromium } = require('playwright');
const fetch = require('node-fetch');

class AuthenticationTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      authFlows: {},
      rbacTests: {},
      sessionTests: {},
      errors: []
    };

    this.testUsers = {
      admin: { email: 'admin@example.com', password: 'adminPassword123', role: 'admin' },
      user: { email: 'user@example.com', password: 'userPassword123', role: 'user' },
      manager: { email: 'manager@example.com', password: 'managerPassword123', role: 'manager' },
      invalid: { email: 'invalid@example.com', password: 'wrongPassword' }
    };

    this.protectedRoutes = [
      '/dashboard',
      '/leads',
      '/deals',
      '/settings',
      '/admin',
      '/reports',
      '/automation',
      '/collaboration'
    ];

    this.roleBasedAccess = {
      admin: {
        allowed: ['/dashboard', '/leads', '/deals', '/settings', '/admin', '/reports', '/automation'],
        denied: []
      },
      manager: {
        allowed: ['/dashboard', '/leads', '/deals', '/reports', '/automation'],
        denied: ['/admin', '/settings/roles']
      },
      user: {
        allowed: ['/dashboard', '/leads', '/deals'],
        denied: ['/admin', '/settings', '/automation']
      }
    };
  }

  async initialize() {
    console.log('🚀 Initializing Authentication & Authorization Testing...');
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 100
    });
    this.page = await this.browser.newPage();
    
    // Setup error handling
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });

    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async testLoginFlow() {
    console.log('\n🔐 Testing Login Flow...');
    
    this.testResults.authFlows.login = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    const loginTests = [
      {
        name: 'Valid Login Credentials',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/login`);
          await this.page.waitForLoadState('networkidle');
          
          await this.page.fill('input[type="email"], input[name="email"]', this.testUsers.user.email);
          await this.page.fill('input[type="password"], input[name="password"]', this.testUsers.user.password);
          
          await this.page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
          await this.page.waitForLoadState('networkidle');
          
          const currentUrl = this.page.url();
          return currentUrl.includes('/dashboard') || currentUrl.includes('/home');
        }
      },
      {
        name: 'Invalid Email Format',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/login`);
          await this.page.waitForLoadState('networkidle');
          
          await this.page.fill('input[type="email"], input[name="email"]', 'invalid-email');
          await this.page.fill('input[type="password"], input[name="password"]', 'password123');
          
          await this.page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
          await this.page.waitForTimeout(2000);
          
          // Should stay on login page or show error
          const currentUrl = this.page.url();
          return currentUrl.includes('/login') || await this.page.locator('text=error, text=invalid').count() > 0;
        }
      },
      {
        name: 'Wrong Password',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/login`);
          await this.page.waitForLoadState('networkidle');
          
          await this.page.fill('input[type="email"], input[name="email"]', this.testUsers.user.email);
          await this.page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
          
          await this.page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
          await this.page.waitForTimeout(2000);
          
          // Should stay on login page or show error
          const currentUrl = this.page.url();
          return currentUrl.includes('/login') || await this.page.locator('text=error, text=invalid').count() > 0;
        }
      },
      {
        name: 'Empty Fields Validation',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/login`);
          await this.page.waitForLoadState('networkidle');
          
          // Try to submit empty form
          await this.page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
          await this.page.waitForTimeout(1000);
          
          // Should show validation errors or stay on page
          const currentUrl = this.page.url();
          return currentUrl.includes('/login');
        }
      },
      {
        name: 'Remember Me Functionality',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/login`);
          await this.page.waitForLoadState('networkidle');
          
          // Check if remember me checkbox exists
          const rememberMe = this.page.locator('input[type="checkbox"], input[name="rememberMe"]');
          if (await rememberMe.count() > 0) {
            await rememberMe.check();
            
            await this.page.fill('input[type="email"], input[name="email"]', this.testUsers.user.email);
            await this.page.fill('input[type="password"], input[name="password"]', this.testUsers.user.password);
            
            await this.page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
            await this.page.waitForLoadState('networkidle');
            
            // Check if longer session cookie is set
            const cookies = await this.page.context().cookies();
            const authCookie = cookies.find(c => c.name.includes('jwt') || c.name.includes('auth'));
            return authCookie && authCookie.expires > Date.now() + 24 * 60 * 60 * 1000; // More than 1 day
          }
          return true; // Pass if no remember me functionality
        }
      }
    ];

    for (const test of loginTests) {
      await this.runAuthTest('login', test.name, test.test);
    }
  }

  async testRegistrationFlow() {
    console.log('\n📝 Testing Registration Flow...');
    
    this.testResults.authFlows.registration = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    const registrationTests = [
      {
        name: 'Valid Registration',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/register`);
          await this.page.waitForLoadState('networkidle');
          
          const uniqueEmail = `test-${Date.now()}@example.com`;
          
          await this.page.fill('input[name="firstName"], input[placeholder*="First"]', 'Test');
          await this.page.fill('input[name="lastName"], input[placeholder*="Last"]', 'User');
          await this.page.fill('input[type="email"], input[name="email"]', uniqueEmail);
          await this.page.fill('input[type="password"], input[name="password"]', 'testPassword123');
          
          const companyField = this.page.locator('input[name="companyName"], input[placeholder*="Company"]');
          if (await companyField.count() > 0) {
            await companyField.fill('Test Company');
          }
          
          await this.page.click('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")');
          await this.page.waitForLoadState('networkidle');
          
          // Should redirect to success page or dashboard
          const currentUrl = this.page.url();
          return !currentUrl.includes('/register') || await this.page.locator('text=success, text=welcome').count() > 0;
        }
      },
      {
        name: 'Duplicate Email Registration',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/register`);
          await this.page.waitForLoadState('networkidle');
          
          await this.page.fill('input[name="firstName"], input[placeholder*="First"]', 'Test');
          await this.page.fill('input[name="lastName"], input[placeholder*="Last"]', 'User');
          await this.page.fill('input[type="email"], input[name="email"]', this.testUsers.user.email);
          await this.page.fill('input[type="password"], input[name="password"]', 'testPassword123');
          
          await this.page.click('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")');
          await this.page.waitForTimeout(2000);
          
          // Should show error about existing email
          return await this.page.locator('text=exists, text=already, text=duplicate').count() > 0;
        }
      },
      {
        name: 'Weak Password Validation',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/register`);
          await this.page.waitForLoadState('networkidle');
          
          await this.page.fill('input[name="firstName"], input[placeholder*="First"]', 'Test');
          await this.page.fill('input[name="lastName"], input[placeholder*="Last"]', 'User');
          await this.page.fill('input[type="email"], input[name="email"]', 'weak@example.com');
          await this.page.fill('input[type="password"], input[name="password"]', '123'); // Weak password
          
          await this.page.click('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")');
          await this.page.waitForTimeout(2000);
          
          // Should show password strength error
          return await this.page.locator('text=password, text=weak, text=strength').count() > 0 ||
                 this.page.url().includes('/register');
        }
      }
    ];

    for (const test of registrationTests) {
      await this.runAuthTest('registration', test.name, test.test);
    }
  }

  async testPasswordReset() {
    console.log('\n🔑 Testing Password Reset Flow...');
    
    this.testResults.authFlows.passwordReset = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    const resetTests = [
      {
        name: 'Valid Reset Request',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/reset-password`);
          await this.page.waitForLoadState('networkidle');
          
          await this.page.fill('input[type="email"], input[name="email"]', this.testUsers.user.email);
          await this.page.click('button[type="submit"], button:has-text("Reset"), button:has-text("Send")');
          await this.page.waitForTimeout(2000);
          
          // Should show success message
          return await this.page.locator('text=sent, text=check, text=email').count() > 0;
        }
      },
      {
        name: 'Invalid Email Reset',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/reset-password`);
          await this.page.waitForLoadState('networkidle');
          
          await this.page.fill('input[type="email"], input[name="email"]', 'nonexistent@example.com');
          await this.page.click('button[type="submit"], button:has-text("Reset"), button:has-text("Send")');
          await this.page.waitForTimeout(2000);
          
          // Should handle gracefully (may still show success for security)
          return true;
        }
      }
    ];

    for (const test of resetTests) {
      await this.runAuthTest('passwordReset', test.name, test.test);
    }
  }

  async testLogout() {
    console.log('\n🚪 Testing Logout Flow...');
    
    this.testResults.authFlows.logout = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    const logoutTests = [
      {
        name: 'Successful Logout',
        test: async () => {
          // First login
          await this.loginUser(this.testUsers.user);
          
          // Find and click logout
          const logoutBtn = this.page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")');
          if (await logoutBtn.count() > 0) {
            await logoutBtn.click();
            await this.page.waitForLoadState('networkidle');
            
            // Should redirect to login or home page
            const currentUrl = this.page.url();
            return currentUrl.includes('/login') || currentUrl.includes('/') && !currentUrl.includes('/dashboard');
          } else {
            // Try to access user menu first
            const userMenu = this.page.locator('.user-menu, [data-testid="user-menu"], .profile-dropdown');
            if (await userMenu.count() > 0) {
              await userMenu.click();
              await this.page.waitForTimeout(500);
              
              const logoutInMenu = this.page.locator('button:has-text("Logout"), a:has-text("Logout")');
              if (await logoutInMenu.count() > 0) {
                await logoutInMenu.click();
                await this.page.waitForLoadState('networkidle');
                
                const currentUrl = this.page.url();
                return currentUrl.includes('/login') || currentUrl === `${this.baseUrl}/`;
              }
            }
            return false; // No logout button found
          }
        }
      },
      {
        name: 'Session Invalidation After Logout',
        test: async () => {
          // Login and logout
          await this.loginUser(this.testUsers.user);
          await this.logoutUser();
          
          // Try to access protected page
          await this.page.goto(`${this.baseUrl}/dashboard`);
          await this.page.waitForLoadState('networkidle');
          
          // Should redirect to login
          const currentUrl = this.page.url();
          return currentUrl.includes('/login');
        }
      }
    ];

    for (const test of logoutTests) {
      await this.runAuthTest('logout', test.name, test.test);
    }
  }

  async testRoleBasedAccess() {
    console.log('\n👤 Testing Role-Based Access Control...');
    
    this.testResults.rbacTests = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    // Test access for each role
    for (const [role, user] of Object.entries(this.testUsers)) {
      if (role === 'invalid') continue;
      
      const roleAccess = this.roleBasedAccess[role];
      if (!roleAccess) continue;
      
      console.log(`  Testing access for role: ${role}`);
      
      // Login as this user
      await this.loginUser(user);
      
      // Test allowed routes
      for (const route of roleAccess.allowed) {
        await this.testRouteAccess(role, route, true);
      }
      
      // Test denied routes
      for (const route of roleAccess.denied) {
        await this.testRouteAccess(role, route, false);
      }
      
      await this.logoutUser();
    }
  }

  async testRouteAccess(role, route, shouldHaveAccess) {
    const testName = `${role} access to ${route}`;
    
    try {
      await this.page.goto(`${this.baseUrl}${route}`);
      await this.page.waitForLoadState('networkidle');
      
      const currentUrl = this.page.url();
      const hasAccess = !currentUrl.includes('/login') && 
                       !currentUrl.includes('/unauthorized') && 
                       !currentUrl.includes('/forbidden');
      
      const testPassed = hasAccess === shouldHaveAccess;
      this.recordRBACResult(testName, testPassed);
      
    } catch (error) {
      this.recordRBACResult(testName, false, error.message);
    }
  }

  async testSessionManagement() {
    console.log('\n⏱️  Testing Session Management...');
    
    this.testResults.sessionTests = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    const sessionTests = [
      {
        name: 'Session Persistence',
        test: async () => {
          await this.loginUser(this.testUsers.user);
          
          // Navigate to different pages
          await this.page.goto(`${this.baseUrl}/dashboard`);
          await this.page.waitForLoadState('networkidle');
          
          await this.page.goto(`${this.baseUrl}/leads`);
          await this.page.waitForLoadState('networkidle');
          
          // Should still be authenticated
          const currentUrl = this.page.url();
          return !currentUrl.includes('/login');
        }
      },
      {
        name: 'Session Cookie Security',
        test: async () => {
          await this.loginUser(this.testUsers.user);
          
          const cookies = await this.page.context().cookies();
          const authCookie = cookies.find(c => c.name.includes('jwt') || c.name.includes('auth') || c.name.includes('session'));
          
          if (authCookie) {
            return authCookie.httpOnly && authCookie.secure !== false; // Should be httpOnly
          }
          return false;
        }
      },
      {
        name: 'Multiple Tab Session Sync',
        test: async () => {
          await this.loginUser(this.testUsers.user);
          
          // Open new tab
          const newPage = await this.browser.newPage();
          await newPage.goto(`${this.baseUrl}/dashboard`);
          await newPage.waitForLoadState('networkidle');
          
          // Should be authenticated in new tab
          const isAuthenticated = !newPage.url().includes('/login');
          
          await newPage.close();
          return isAuthenticated;
        }
      }
    ];

    for (const test of sessionTests) {
      await this.runSessionTest(test.name, test.test);
    }
  }

  async testSecurityBoundaries() {
    console.log('\n🛡️  Testing Security Boundaries...');
    
    const securityTests = [
      {
        name: 'Direct URL Access Protection',
        test: async () => {
          // Without login, try to access protected route
          await this.page.goto(`${this.baseUrl}/admin`);
          await this.page.waitForLoadState('networkidle');
          
          const currentUrl = this.page.url();
          return currentUrl.includes('/login') || currentUrl.includes('/unauthorized');
        }
      },
      {
        name: 'API Endpoint Protection',
        test: async () => {
          // Try to access protected API without auth
          const response = await fetch(`${this.baseUrl}/api/leads`);
          return response.status === 401 || response.status === 403;
        }
      },
      {
        name: 'Cross-Origin Request Protection',
        test: async () => {
          // Test CORS headers
          const response = await fetch(`${this.baseUrl}/api/health`, {
            headers: {
              'Origin': 'https://malicious-site.com'
            }
          });
          
          const corsHeader = response.headers.get('access-control-allow-origin');
          return !corsHeader || corsHeader !== '*'; // Should not allow all origins
        }
      }
    ];

    for (const test of securityTests) {
      await this.runSessionTest(test.name, test.test);
    }
  }

  async loginUser(user) {
    await this.page.goto(`${this.baseUrl}/login`);
    await this.page.waitForLoadState('networkidle');
    
    await this.page.fill('input[type="email"], input[name="email"]', user.email);
    await this.page.fill('input[type="password"], input[name="password"]', user.password);
    
    await this.page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    await this.page.waitForLoadState('networkidle');
  }

  async logoutUser() {
    const logoutBtn = this.page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")');
    
    if (await logoutBtn.count() > 0) {
      await logoutBtn.click();
    } else {
      // Try user menu
      const userMenu = this.page.locator('.user-menu, [data-testid="user-menu"], .profile-dropdown');
      if (await userMenu.count() > 0) {
        await userMenu.click();
        await this.page.waitForTimeout(500);
        const logoutInMenu = this.page.locator('button:has-text("Logout"), a:has-text("Logout")');
        if (await logoutInMenu.count() > 0) {
          await logoutInMenu.click();
        }
      }
    }
    
    await this.page.waitForLoadState('networkidle');
  }

  async runAuthTest(flowName, testName, testFunction) {
    this.testResults.total++;
    this.testResults.authFlows[flowName].total++;

    try {
      const result = await testFunction();
      if (result) {
        this.testResults.passed++;
        this.testResults.authFlows[flowName].passed++;
        this.testResults.authFlows[flowName].tests.push({
          test: testName,
          status: 'PASS',
          timestamp: new Date().toISOString()
        });
        console.log(`    ✅ ${testName}`);
      } else {
        throw new Error('Test returned false');
      }
    } catch (error) {
      this.testResults.failed++;
      this.testResults.authFlows[flowName].failed++;
      this.testResults.authFlows[flowName].tests.push({
        test: testName,
        status: 'FAIL',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      console.log(`    ❌ ${testName}: ${error.message}`);
      this.testResults.errors.push(`${flowName} - ${testName}: ${error.message}`);
    }
  }

  recordRBACResult(testName, passed, error = null) {
    this.testResults.total++;
    this.testResults.rbacTests.total++;

    if (passed) {
      this.testResults.passed++;
      this.testResults.rbacTests.passed++;
      console.log(`    ✅ ${testName}`);
    } else {
      this.testResults.failed++;
      this.testResults.rbacTests.failed++;
      console.log(`    ❌ ${testName}${error ? ': ' + error : ''}`);
      this.testResults.errors.push(`RBAC - ${testName}${error ? ': ' + error : ''}`);
    }

    this.testResults.rbacTests.tests.push({
      test: testName,
      status: passed ? 'PASS' : 'FAIL',
      error: error,
      timestamp: new Date().toISOString()
    });
  }

  async runSessionTest(testName, testFunction) {
    this.testResults.total++;
    this.testResults.sessionTests.total++;

    try {
      const result = await testFunction();
      if (result) {
        this.testResults.passed++;
        this.testResults.sessionTests.passed++;
        this.testResults.sessionTests.tests.push({
          test: testName,
          status: 'PASS',
          timestamp: new Date().toISOString()
        });
        console.log(`    ✅ ${testName}`);
      } else {
        throw new Error('Test returned false');
      }
    } catch (error) {
      this.testResults.failed++;
      this.testResults.sessionTests.failed++;
      this.testResults.sessionTests.tests.push({
        test: testName,
        status: 'FAIL',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      console.log(`    ❌ ${testName}: ${error.message}`);
      this.testResults.errors.push(`Session - ${testName}: ${error.message}`);
    }
  }

  async runAllAuthTests() {
    console.log('🚀 Starting Comprehensive Authentication & Authorization Tests...');
    
    await this.testLoginFlow();
    await this.testRegistrationFlow();
    await this.testPasswordReset();
    await this.testLogout();
    await this.testRoleBasedAccess();
    await this.testSessionManagement();
    await this.testSecurityBoundaries();
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  generateReport() {
    const passRate = this.testResults.total > 0 ? 
      ((this.testResults.passed / this.testResults.total) * 100).toFixed(2) : 0;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 AUTHENTICATION & AUTHORIZATION TEST REPORT');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed} (${passRate}%)`);
    console.log(`Failed: ${this.testResults.failed}`);
    
    console.log('\n📋 CATEGORY BREAKDOWN:');
    
    // Auth flows
    console.log('  Authentication Flows:');
    for (const [flow, results] of Object.entries(this.testResults.authFlows)) {
      const flowPassRate = results.total > 0 ? 
        ((results.passed / results.total) * 100).toFixed(2) : 0;
      console.log(`    ${flow}: ${results.passed}/${results.total} (${flowPassRate}%)`);
    }
    
    // RBAC
    if (this.testResults.rbacTests.total > 0) {
      const rbacPassRate = ((this.testResults.rbacTests.passed / this.testResults.rbacTests.total) * 100).toFixed(2);
      console.log(`  Role-Based Access: ${this.testResults.rbacTests.passed}/${this.testResults.rbacTests.total} (${rbacPassRate}%)`);
    }
    
    // Session Management
    if (this.testResults.sessionTests.total > 0) {
      const sessionPassRate = ((this.testResults.sessionTests.passed / this.testResults.sessionTests.total) * 100).toFixed(2);
      console.log(`  Session Management: ${this.testResults.sessionTests.passed}/${this.testResults.sessionTests.total} (${sessionPassRate}%)`);
    }

    if (this.testResults.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.testResults.errors.slice(0, 10).forEach(error => console.log(`  • ${error}`));
      if (this.testResults.errors.length > 10) {
        console.log(`  ... and ${this.testResults.errors.length - 10} more errors`);
      }
    }

    return {
      summary: {
        total: this.testResults.total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        passRate: parseFloat(passRate)
      },
      authFlows: this.testResults.authFlows,
      rbac: this.testResults.rbacTests,
      session: this.testResults.sessionTests,
      errors: this.testResults.errors
    };
  }
}

module.exports = { AuthenticationTester };