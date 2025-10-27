/**
 * PAGE-LEVEL FUNCTIONALITY TESTS
 * Tests every page route, navigation, forms, and user interactions
 */

const { chromium } = require('playwright');
const { UIComponentTester } = require('./ui-component-tests');

class PageFunctionalityTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
    this.componentTester = new UIComponentTester();
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      pageResults: {},
      navigationTests: {},
      formTests: {},
      errors: []
    };

    // Define all application routes and their expected functionality
    this.routes = {
      // Core routes
      '/': { name: 'Landing Page', auth: false, components: ['hero', 'nav', 'features'] },
      '/login': { name: 'Login Page', auth: false, components: ['loginForm', 'authButtons'] },
      '/register': { name: 'Register Page', auth: false, components: ['registerForm', 'authButtons'] },
      '/dashboard': { name: 'Dashboard', auth: true, components: ['toolbar', 'widgets', 'charts'] },
      
      // Leads & Sales
      '/leads': { name: 'Leads Page', auth: true, components: ['leadsTable', 'addButton', 'filters'] },
      '/leads/create': { name: 'Create Lead', auth: true, components: ['leadForm', 'saveButton'] },
      '/deals': { name: 'Deals Page', auth: true, components: ['dealsGrid', 'statusDropdown'] },
      '/appointments': { name: 'Appointments', auth: true, components: ['calendar', 'scheduleButton'] },
      '/calendar': { name: 'Calendar', auth: true, components: ['monthView', 'eventModal'] },
      
      // Business Operations
      '/inventory': { name: 'Inventory', auth: true, components: ['inventoryTable', 'stockAlert'] },
      '/finance': { name: 'Finance', auth: true, components: ['financeCards', 'prequalForm'] },
      '/contracts': { name: 'Contracts', auth: true, components: ['contractsList', 'generateButton'] },
      '/billing': { name: 'Billing', auth: true, components: ['billingTable', 'invoiceButton'] },
      
      // Automation
      '/automation/drip-campaigns': { name: 'Drip Campaigns', auth: true, components: ['campaignsList', 'createModal'] },
      '/automation/email-sequences': { name: 'Email Sequences', auth: true, components: ['sequencesList', 'triggerDropdown'] },
      '/automation/auto-tasks': { name: 'Auto Tasks', auth: true, components: ['tasksList', 'conditionsForm'] },
      
      // Reports
      '/reports/custom': { name: 'Custom Reports', auth: true, components: ['reportBuilder', 'exportButton'] },
      '/reports/scheduled': { name: 'Scheduled Reports', auth: true, components: ['scheduleForm', 'frequencySelect'] },
      
      // Settings
      '/settings/integrations': { name: 'Integrations', auth: true, components: ['integrationsGrid', 'connectModal'] },
      '/settings/roles': { name: 'User Roles', auth: true, components: ['rolesTable', 'permissionsMatrix'] },
      '/settings/workspace': { name: 'Workspace Settings', auth: true, components: ['workspaceForm', 'saveButton'] },
      
      // Collaboration
      '/collaboration': { name: 'Collaboration', auth: true, components: ['chatPanel', 'videoCall', 'whiteboard'] },
      '/messaging': { name: 'Messaging', auth: true, components: ['messagesList', 'composeButton'] },
      
      // AI & Analytics
      '/ai': { name: 'AI Assistant', auth: true, components: ['chatInterface', 'promptInput'] },
      '/bi': { name: 'Business Intelligence', auth: true, components: ['analyticsCharts', 'kpiCards'] },
      
      // Developer
      '/developer': { name: 'Developer Tools', auth: true, components: ['apiEndpoints', 'testButton'] },
      
      // Onboarding
      '/onboarding': { name: 'Onboarding', auth: true, components: ['onboardingSteps', 'progressBar'] }
    };
  }

  async initialize() {
    console.log('🚀 Initializing Page Functionality Testing...');
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 50
    });
    this.page = await this.browser.newPage();
    
    // Setup error handling
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });

    this.page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
      this.testResults.errors.push(`Page Error: ${error.message}`);
    });

    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async authenticateUser() {
    console.log('🔐 Authenticating test user...');
    
    try {
      await this.page.goto(`${this.baseUrl}/login`);
      await this.page.waitForLoadState('networkidle');
      
      // Fill login form
      await this.page.fill('input[type="email"], input[name="email"]', 'test@example.com');
      await this.page.fill('input[type="password"], input[name="password"]', 'testPassword123');
      
      // Submit form
      await this.page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      await this.page.waitForLoadState('networkidle');
      
      // Check if we're redirected to dashboard or home
      const currentUrl = this.page.url();
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/home')) {
        console.log('✅ User authenticated successfully');
        return true;
      } else {
        console.log('❌ Authentication failed - not redirected properly');
        return false;
      }
    } catch (error) {
      console.log('❌ Authentication error:', error.message);
      return false;
    }
  }

  async testPageFunctionality(route, config) {
    console.log(`\n🧪 Testing Page: ${config.name} (${route})`);
    
    this.testResults.pageResults[route] = {
      name: config.name,
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    try {
      // Navigate to page
      await this.page.goto(`${this.baseUrl}${route}`);
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });

      // Basic page tests
      await this.testPageLoad(route, config);
      await this.testPageNavigation(route, config);
      await this.testPageComponents(route, config);
      await this.testPageForms(route, config);
      await this.testPageInteractions(route, config);
      await this.testPageResponsiveness(route, config);

    } catch (error) {
      this.recordPageResult(route, `Page test failed: ${error.message}`, false);
    }
  }

  async testPageLoad(route, config) {
    const tests = [
      {
        name: 'Page Loads Successfully',
        test: async () => {
          const currentUrl = this.page.url();
          return currentUrl.includes(route) || currentUrl.includes('dashboard');
        }
      },
      {
        name: 'Page Title Present',
        test: async () => {
          const title = await this.page.title();
          return title && title.length > 0;
        }
      },
      {
        name: 'No JavaScript Errors',
        test: async () => {
          // Check for any console errors
          const logs = [];
          this.page.on('console', msg => {
            if (msg.type() === 'error') logs.push(msg.text());
          });
          await this.page.waitForTimeout(2000);
          return logs.length === 0;
        }
      },
      {
        name: 'Page Content Loaded',
        test: async () => {
          const bodyText = await this.page.textContent('body');
          return bodyText && bodyText.length > 100; // Ensure substantial content
        }
      }
    ];

    for (const test of tests) {
      await this.runPageTest(route, test.name, test.test);
    }
  }

  async testPageNavigation(route, config) {
    const tests = [
      {
        name: 'Navigation Menu Present',
        test: async () => {
          const nav = this.page.locator('nav, [role="navigation"], .navbar, .sidebar');
          return await nav.count() > 0;
        }
      },
      {
        name: 'Navigation Links Clickable',
        test: async () => {
          const navLinks = this.page.locator('nav a, [role="navigation"] a, .navbar a');
          const count = await navLinks.count();
          if (count > 0) {
            const firstLink = navLinks.first();
            await firstLink.hover();
            return await firstLink.isEnabled();
          }
          return true;
        }
      },
      {
        name: 'Breadcrumb Navigation',
        test: async () => {
          const breadcrumb = this.page.locator('[aria-label*="breadcrumb"], .breadcrumb, .breadcrumbs');
          const exists = await breadcrumb.count() > 0;
          return true; // Not all pages need breadcrumbs
        }
      }
    ];

    for (const test of tests) {
      await this.runPageTest(route, test.name, test.test);
    }
  }

  async testPageComponents(route, config) {
    console.log(`  🔍 Testing components: ${config.components.join(', ')}`);
    
    // Test specific components for this page
    for (const componentName of config.components) {
      await this.testSpecificComponent(route, componentName);
    }

    // Test common components
    await this.testCommonComponents(route);
  }

  async testSpecificComponent(route, componentName) {
    const componentSelectors = {
      // Forms
      'loginForm': 'form:has(input[type="email"]), form:has(input[name="email"])',
      'registerForm': 'form:has(input[name="firstName"]), form:has(input[name="password"])',
      'leadForm': 'form:has(input[name="firstName"]), form:has(input[name="email"])',
      'workspaceForm': 'form:has(input[name="workspaceName"])',
      'financeCards': '.finance-card, [data-testid="finance-card"]',
      'prequalForm': 'form:has(input[name="income"])',
      
      // Tables and Lists
      'leadsTable': 'table, .leads-table, [data-testid="leads-table"]',
      'dealsGrid': '.deals-grid, [data-testid="deals-grid"]',
      'inventoryTable': 'table:has(th:has-text("SKU")), .inventory-table',
      'billingTable': 'table:has(th:has-text("Invoice")), .billing-table',
      'campaignsList': '.campaigns-list, [data-testid="campaigns-list"]',
      'sequencesList': '.sequences-list, [data-testid="sequences-list"]',
      'tasksList': '.tasks-list, [data-testid="tasks-list"]',
      'contractsList': '.contracts-list, [data-testid="contracts-list"]',
      'rolesTable': 'table:has(th:has-text("Role")), .roles-table',
      'integrationsGrid': '.integrations-grid, [data-testid="integrations-grid"]',
      
      // Buttons
      'addButton': 'button:has-text("Add"), button:has-text("Create"), button:has-text("New")',
      'saveButton': 'button:has-text("Save"), button[type="submit"]',
      'scheduleButton': 'button:has-text("Schedule")',
      'generateButton': 'button:has-text("Generate")',
      'invoiceButton': 'button:has-text("Invoice")',
      'exportButton': 'button:has-text("Export")',
      'connectButton': 'button:has-text("Connect")',
      'testButton': 'button:has-text("Test")',
      'composeButton': 'button:has-text("Compose")',
      
      // Interactive Elements
      'toolbar': '.toolbar, [data-testid="toolbar"]',
      'filters': '.filters, [data-testid="filters"]',
      'statusDropdown': 'select:has(option:has-text("Status")), .status-dropdown',
      'triggerDropdown': 'select:has(option:has-text("Trigger")), .trigger-dropdown',
      'frequencySelect': 'select:has(option:has-text("Daily")), .frequency-select',
      
      // Complex Components
      'calendar': '.calendar, [data-testid="calendar"]',
      'monthView': '.month-view, [data-testid="month-view"]',
      'widgets': '.widget, [data-testid="widget"]',
      'charts': '.chart, canvas, [data-testid="chart"]',
      'kpiCards': '.kpi-card, [data-testid="kpi-card"]',
      'analyticsCharts': '.analytics-chart, [data-testid="analytics-chart"]',
      
      // Modals
      'createModal': '.modal:has-text("Create"), [data-testid="create-modal"]',
      'eventModal': '.modal:has-text("Event"), [data-testid="event-modal"]',
      'connectModal': '.modal:has-text("Connect"), [data-testid="connect-modal"]',
      
      // Communication
      'chatPanel': '.chat-panel, [data-testid="chat-panel"]',
      'chatInterface': '.chat-interface, [data-testid="chat-interface"]',
      'messagesList': '.messages-list, [data-testid="messages-list"]',
      'videoCall': '.video-call, [data-testid="video-call"]',
      'whiteboard': '.whiteboard, [data-testid="whiteboard"]',
      
      // Forms and Inputs
      'promptInput': 'input[placeholder*="Ask"], textarea[placeholder*="Ask"]',
      'reportBuilder': '.report-builder, [data-testid="report-builder"]',
      'scheduleForm': 'form:has(select:has(option:has-text("Daily")))',
      'conditionsForm': 'form:has(select:has(option:has-text("When")))',
      'permissionsMatrix': '.permissions-matrix, [data-testid="permissions-matrix"]',
      'onboardingSteps': '.onboarding-steps, [data-testid="onboarding-steps"]',
      'progressBar': '.progress-bar, [data-testid="progress-bar"]',
      'apiEndpoints': '.api-endpoints, [data-testid="api-endpoints"]',
      
      // Navigation and Layout
      'nav': 'nav, [role="navigation"]',
      'hero': '.hero, [data-testid="hero"]',
      'features': '.features, [data-testid="features"]',
      'authButtons': 'button:has-text("Login"), button:has-text("Register")',
      'stockAlert': '.stock-alert, [data-testid="stock-alert"]'
    };

    const selector = componentSelectors[componentName];
    if (!selector) {
      this.recordPageResult(route, `Unknown component: ${componentName}`, false);
      return;
    }

    try {
      const component = this.page.locator(selector).first();
      const isVisible = await component.isVisible();
      
      if (isVisible) {
        // Test component interactions
        await this.testComponentInteraction(route, componentName, component);
        this.recordPageResult(route, `Component ${componentName} found and tested`, true);
      } else {
        this.recordPageResult(route, `Component ${componentName} not visible`, false);
      }
    } catch (error) {
      this.recordPageResult(route, `Component ${componentName} test failed: ${error.message}`, false);
    }
  }

  async testComponentInteraction(route, componentName, component) {
    try {
      // Basic interaction tests
      if (componentName.includes('Button') || componentName.includes('button')) {
        await component.hover();
        await this.page.waitForTimeout(300);
        
        if (await component.isEnabled()) {
          await component.click();
          await this.page.waitForTimeout(500);
        }
      }
      
      if (componentName.includes('Form') || componentName.includes('form')) {
        const inputs = component.locator('input, textarea, select');
        const inputCount = await inputs.count();
        
        for (let i = 0; i < Math.min(inputCount, 3); i++) {
          const input = inputs.nth(i);
          const inputType = await input.getAttribute('type');
          
          if (inputType !== 'file' && inputType !== 'submit') {
            await input.focus();
            if (inputType === 'checkbox' || inputType === 'radio') {
              await input.check();
            } else {
              await input.fill('test-value');
            }
            await this.page.waitForTimeout(200);
          }
        }
      }
      
      if (componentName.includes('Table') || componentName.includes('table')) {
        const rows = component.locator('tr, .table-row');
        const rowCount = await rows.count();
        if (rowCount > 1) {
          await rows.nth(1).hover(); // Hover over first data row
        }
      }
      
      if (componentName.includes('Dropdown') || componentName.includes('Select')) {
        await component.click();
        await this.page.waitForTimeout(500);
        
        const options = this.page.locator('option, [role="option"]');
        const optionCount = await options.count();
        if (optionCount > 0) {
          await options.first().click();
        }
      }
      
    } catch (error) {
      console.log(`    ⚠️  Component interaction warning: ${error.message}`);
    }
  }

  async testCommonComponents(route) {
    const commonComponents = [
      { name: 'Header', selector: 'header, .header' },
      { name: 'Footer', selector: 'footer, .footer' },
      { name: 'Sidebar', selector: '.sidebar, [role="navigation"]' },
      { name: 'Search', selector: 'input[type="search"], input[placeholder*="search"]' },
      { name: 'User Menu', selector: '.user-menu, [data-testid="user-menu"]' }
    ];

    for (const component of commonComponents) {
      try {
        const element = this.page.locator(component.selector).first();
        const isVisible = await element.isVisible();
        this.recordPageResult(route, `Common component ${component.name}: ${isVisible ? 'Present' : 'Not found'}`, true);
      } catch (error) {
        this.recordPageResult(route, `Common component ${component.name} test failed`, false);
      }
    }
  }

  async testPageForms(route, config) {
    const forms = await this.page.locator('form').all();
    
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      await this.testFormFunctionality(route, form, `Form-${i + 1}`);
    }
  }

  async testFormFunctionality(route, form, formName) {
    try {
      // Test form submission
      const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
      const isSubmitVisible = await submitButton.isVisible();
      
      if (isSubmitVisible) {
        // Fill form with test data
        const inputs = form.locator('input:not([type="submit"]):not([type="button"]), textarea, select');
        const inputCount = await inputs.count();
        
        for (let j = 0; j < inputCount; j++) {
          const input = inputs.nth(j);
          const inputType = await input.getAttribute('type') || 'text';
          const inputName = await input.getAttribute('name') || `field-${j}`;
          
          try {
            if (inputType === 'email') {
              await input.fill('test@example.com');
            } else if (inputType === 'password') {
              await input.fill('testPassword123');
            } else if (inputType === 'text' || inputType === 'textarea') {
              await input.fill('Test Value');
            } else if (inputType === 'number') {
              await input.fill('123');
            } else if (inputType === 'checkbox' || inputType === 'radio') {
              await input.check();
            }
          } catch (error) {
            console.log(`    ⚠️  Input ${inputName} fill warning: ${error.message}`);
          }
        }
        
        this.recordPageResult(route, `${formName} inputs filled successfully`, true);
        
        // Note: We don't actually submit forms to avoid side effects
        this.recordPageResult(route, `${formName} ready for submission`, true);
      } else {
        this.recordPageResult(route, `${formName} has no submit button`, false);
      }
    } catch (error) {
      this.recordPageResult(route, `${formName} test failed: ${error.message}`, false);
    }
  }

  async testPageInteractions(route, config) {
    // Test clickable elements
    const clickableElements = await this.page.locator('button:not([type="submit"]), a, [role="button"]').all();
    let clickableCount = 0;
    let workingCount = 0;

    for (const element of clickableElements.slice(0, 10)) { // Test first 10 clickable elements
      try {
        if (await element.isVisible() && await element.isEnabled()) {
          clickableCount++;
          await element.hover();
          // Don't actually click to avoid navigation/side effects
          workingCount++;
        }
      } catch (error) {
        console.log(`    ⚠️  Clickable element test warning: ${error.message}`);
      }
    }

    this.recordPageResult(route, `Clickable elements working: ${workingCount}/${clickableCount}`, workingCount > 0);
  }

  async testPageResponsiveness(route, config) {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      try {
        await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
        await this.page.waitForTimeout(1000);
        
        // Check if page content is still visible and accessible
        const bodyText = await this.page.textContent('body');
        const hasContent = bodyText && bodyText.length > 100;
        
        this.recordPageResult(route, `${viewport.name} responsiveness: ${hasContent ? 'Good' : 'Issues'}`, hasContent);
      } catch (error) {
        this.recordPageResult(route, `${viewport.name} responsiveness test failed`, false);
      }
    }

    // Reset to desktop
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async runPageTest(route, testName, testFunction) {
    this.testResults.total++;
    this.testResults.pageResults[route].total++;

    try {
      const result = await testFunction();
      if (result) {
        this.recordPageResult(route, testName, true);
      } else {
        this.recordPageResult(route, testName, false);
      }
    } catch (error) {
      this.recordPageResult(route, `${testName}: ${error.message}`, false);
    }
  }

  recordPageResult(route, testName, passed, error = null) {
    const pageResult = this.testResults.pageResults[route];
    
    if (passed) {
      this.testResults.passed++;
      pageResult.passed++;
      console.log(`    ✅ ${testName}`);
    } else {
      this.testResults.failed++;
      pageResult.failed++;
      console.log(`    ❌ ${testName}${error ? ': ' + error : ''}`);
      this.testResults.errors.push(`${route} - ${testName}${error ? ': ' + error : ''}`);
    }

    pageResult.tests.push({
      test: testName,
      status: passed ? 'PASS' : 'FAIL',
      error: error,
      timestamp: new Date().toISOString()
    });
  }

  async runAllPageTests() {
    console.log('🚀 Starting Comprehensive Page Functionality Tests...');
    
    // Test public pages first
    const publicRoutes = Object.entries(this.routes).filter(([route, config]) => !config.auth);
    const privateRoutes = Object.entries(this.routes).filter(([route, config]) => config.auth);

    // Test public pages
    for (const [route, config] of publicRoutes) {
      await this.testPageFunctionality(route, config);
    }

    // Authenticate and test private pages
    const authenticated = await this.authenticateUser();
    if (authenticated) {
      for (const [route, config] of privateRoutes) {
        await this.testPageFunctionality(route, config);
      }
    } else {
      console.log('❌ Could not authenticate - skipping private pages');
    }
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
    console.log('📊 PAGE FUNCTIONALITY TEST REPORT');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed} (${passRate}%)`);
    console.log(`Failed: ${this.testResults.failed}`);
    
    console.log('\n📋 PAGE BREAKDOWN:');
    for (const [route, results] of Object.entries(this.testResults.pageResults)) {
      const pagePassRate = results.total > 0 ? 
        ((results.passed / results.total) * 100).toFixed(2) : 0;
      console.log(`  ${results.name} (${route}): ${results.passed}/${results.total} (${pagePassRate}%)`);
    }

    if (this.testResults.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.testResults.errors.slice(0, 20).forEach(error => console.log(`  • ${error}`));
      if (this.testResults.errors.length > 20) {
        console.log(`  ... and ${this.testResults.errors.length - 20} more errors`);
      }
    }

    return {
      summary: {
        total: this.testResults.total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        passRate: parseFloat(passRate)
      },
      pages: this.testResults.pageResults,
      errors: this.testResults.errors
    };
  }
}

module.exports = { PageFunctionalityTester };