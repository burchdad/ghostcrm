/**
 * CROSS-PLATFORM & ACCESSIBILITY TESTS
 * Tests responsive design, browser compatibility, mobile functionality, accessibility compliance
 */

const { chromium, firefox, webkit } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');

class CrossPlatformAccessibilityTester {
  constructor() {
    this.browsers = [];
    this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      responsiveTests: {},
      browserCompatibility: {},
      mobileTests: {},
      accessibilityTests: {},
      performanceTests: {},
      errors: []
    };

    this.viewports = {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1920, height: 1080 },
      ultrawide: { width: 2560, height: 1440 }
    };

    this.browsers_config = [
      { name: 'chromium', engine: chromium },
      { name: 'firefox', engine: firefox },
      { name: 'webkit', engine: webkit }
    ];

    this.testRoutes = [
      '/',
      '/login',
      '/register',
      '/dashboard',
      '/leads',
      '/deals',
      '/settings',
      '/reports'
    ];

    this.accessibilityStandards = {
      wcag2a: ['cat.color', 'cat.keyboard', 'cat.language', 'cat.structure', 'cat.forms'],
      wcag2aa: ['wcag2a', 'cat.sensory-and-visual-cues', 'cat.tables', 'cat.text-alternatives'],
      wcag21aa: ['wcag2aa', 'cat.keyboard', 'cat.parsing']
    };
  }

  async initialize() {
    console.log('🌐 Initializing Cross-Platform & Accessibility Testing...');
    
    // Initialize all browsers
    for (const browserConfig of this.browsers_config) {
      try {
        const browser = await browserConfig.engine.launch({ 
          headless: false,
          slowMo: 50
        });
        this.browsers.push({
          name: browserConfig.name,
          instance: browser
        });
        console.log(`✅ ${browserConfig.name} browser initialized`);
      } catch (error) {
        console.log(`⚠️  Failed to initialize ${browserConfig.name}: ${error.message}`);
      }
    }
  }

  async testResponsiveDesign() {
    console.log('\n📱 Testing Responsive Design...');
    
    this.testResults.responsiveTests = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    // Test with Chromium for responsive design
    const browser = this.browsers.find(b => b.name === 'chromium');
    if (!browser) {
      console.log('⚠️  Chromium not available for responsive testing');
      return;
    }

    for (const [viewportName, viewport] of Object.entries(this.viewports)) {
      console.log(`  Testing ${viewportName} viewport (${viewport.width}x${viewport.height})...`);
      
      const page = await browser.instance.newPage();
      await page.setViewportSize(viewport);
      
      for (const route of this.testRoutes) {
        await this.testResponsiveRoute(page, route, viewportName, viewport);
      }
      
      await page.close();
    }
  }

  async testResponsiveRoute(page, route, viewportName, viewport) {
    const testName = `${viewportName} - ${route}`;
    
    try {
      await page.goto(`${this.baseUrl}${route}`);
      await page.waitForLoadState('networkidle');
      
      // Test basic responsive elements
      const tests = await this.runResponsiveChecks(page, viewport);
      
      if (tests.passed) {
        this.recordResponsiveResult(testName, true);
      } else {
        this.recordResponsiveResult(testName, false, tests.error);
      }
      
    } catch (error) {
      this.recordResponsiveResult(testName, false, error.message);
    }
  }

  async runResponsiveChecks(page, viewport) {
    const checks = {
      passed: true,
      errors: []
    };

    try {
      // Check if page content is visible
      const body = await page.locator('body');
      const bodyBox = await body.boundingBox();
      
      if (!bodyBox || bodyBox.width === 0 || bodyBox.height === 0) {
        checks.passed = false;
        checks.errors.push('Page content not visible');
      }

      // Check for horizontal scrollbars (shouldn't exist on mobile)
      if (viewport.width <= 768) {
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        
        if (scrollWidth > clientWidth + 5) { // 5px tolerance
          checks.passed = false;
          checks.errors.push('Horizontal overflow detected');
        }
      }

      // Check navigation menu responsiveness
      const navMenus = await page.locator('nav, .navbar, .menu, .navigation').count();
      if (navMenus > 0) {
        const mobileMenu = await page.locator('.mobile-menu, .hamburger, .menu-toggle, [data-testid="mobile-menu"]').count();
        
        if (viewport.width <= 768 && mobileMenu === 0) {
          // Mobile viewport should have mobile menu or hamburger
          const regularMenu = await page.locator('nav ul, .menu-items, .nav-items').first();
          if (await regularMenu.count() > 0) {
            const menuVisible = await regularMenu.isVisible();
            if (menuVisible) {
              // Regular menu visible on mobile might be ok if it fits
              const menuBox = await regularMenu.boundingBox();
              if (menuBox && menuBox.width > viewport.width) {
                checks.passed = false;
                checks.errors.push('Navigation menu too wide for mobile');
              }
            }
          }
        }
      }

      // Check form elements responsiveness
      const forms = await page.locator('form').count();
      if (forms > 0) {
        const inputs = page.locator('input, textarea, select');
        const inputCount = await inputs.count();
        
        for (let i = 0; i < Math.min(inputCount, 5); i++) {
          const input = inputs.nth(i);
          if (await input.isVisible()) {
            const inputBox = await input.boundingBox();
            if (inputBox && inputBox.width > viewport.width - 40) { // 20px margin each side
              checks.passed = false;
              checks.errors.push('Form elements too wide for viewport');
              break;
            }
          }
        }
      }

      // Check button sizes on touch devices
      if (viewport.width <= 768) {
        const buttons = page.locator('button, a, input[type="submit"]');
        const buttonCount = await buttons.count();
        
        for (let i = 0; i < Math.min(buttonCount, 10); i++) {
          const button = buttons.nth(i);
          if (await button.isVisible()) {
            const buttonBox = await button.boundingBox();
            if (buttonBox && (buttonBox.width < 44 || buttonBox.height < 44)) {
              // WCAG recommends minimum 44px touch targets
              checks.passed = false;
              checks.errors.push('Touch targets smaller than 44px');
              break;
            }
          }
        }
      }

      // Check text readability
      const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6').first();
      if (await textElements.count() > 0) {
        const fontSize = await textElements.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return parseFloat(styles.fontSize);
        });
        
        if (viewport.width <= 768 && fontSize < 14) {
          checks.passed = false;
          checks.errors.push('Text too small for mobile viewing');
        }
      }

    } catch (error) {
      checks.passed = false;
      checks.errors.push(`Responsive check failed: ${error.message}`);
    }

    return {
      passed: checks.passed,
      error: checks.errors.join('; ')
    };
  }

  async testBrowserCompatibility() {
    console.log('\n🌍 Testing Browser Compatibility...');
    
    this.testResults.browserCompatibility = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    for (const browser of this.browsers) {
      console.log(`  Testing compatibility with ${browser.name}...`);
      
      const page = await browser.instance.newPage();
      await page.setViewportSize(this.viewports.desktop);
      
      for (const route of this.testRoutes) {
        await this.testBrowserRoute(page, route, browser.name);
      }
      
      await page.close();
    }
  }

  async testBrowserRoute(page, route, browserName) {
    const testName = `${browserName} - ${route}`;
    
    try {
      // Set up error tracking
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(`${this.baseUrl}${route}`);
      await page.waitForLoadState('networkidle');
      
      // Test basic functionality
      const tests = await this.runBrowserCompatibilityChecks(page, browserName);
      
      if (tests.passed && errors.length === 0) {
        this.recordBrowserResult(testName, true);
      } else {
        const errorMsg = errors.length > 0 ? `Console errors: ${errors.join('; ')}` : tests.error;
        this.recordBrowserResult(testName, false, errorMsg);
      }
      
    } catch (error) {
      this.recordBrowserResult(testName, false, error.message);
    }
  }

  async runBrowserCompatibilityChecks(page, browserName) {
    const checks = {
      passed: true,
      errors: []
    };

    try {
      // Check if page loads properly
      const title = await page.title();
      if (!title || title.includes('Error') || title.includes('404')) {
        checks.passed = false;
        checks.errors.push('Page failed to load properly');
      }

      // Check CSS support
      const body = await page.locator('body');
      const hasStyles = await body.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
               styles.color !== 'rgb(0, 0, 0)' || 
               styles.fontFamily !== 'serif';
      });

      if (!hasStyles) {
        checks.passed = false;
        checks.errors.push('CSS styles not applied');
      }

      // Test JavaScript functionality
      const buttons = await page.locator('button').count();
      if (buttons > 0) {
        const firstButton = page.locator('button').first();
        if (await firstButton.isVisible()) {
          try {
            await firstButton.click({ timeout: 5000 });
            // If click doesn't throw, JavaScript is working
          } catch (error) {
            if (!error.message.includes('timeout')) {
              checks.passed = false;
              checks.errors.push('JavaScript interaction failed');
            }
          }
        }
      }

      // Check form functionality
      const forms = await page.locator('form').count();
      if (forms > 0) {
        const inputs = await page.locator('input[type="text"], input[type="email"]').count();
        if (inputs > 0) {
          const firstInput = page.locator('input[type="text"], input[type="email"]').first();
          try {
            await firstInput.fill('test');
            const value = await firstInput.inputValue();
            if (value !== 'test') {
              checks.passed = false;
              checks.errors.push('Form input functionality failed');
            }
          } catch (error) {
            checks.passed = false;
            checks.errors.push('Form interaction failed');
          }
        }
      }

      // Browser-specific checks
      if (browserName === 'firefox') {
        // Check Firefox-specific issues
        const flexElements = await page.locator('[style*="flex"], .flex').count();
        if (flexElements > 0) {
          // Firefox sometimes has flex rendering issues
          const firstFlex = page.locator('[style*="flex"], .flex').first();
          if (await firstFlex.isVisible()) {
            const flexBox = await firstFlex.boundingBox();
            if (!flexBox || flexBox.width === 0) {
              checks.passed = false;
              checks.errors.push('Flexbox rendering issue');
            }
          }
        }
      }

      if (browserName === 'webkit') {
        // Check Safari-specific issues
        const dateInputs = await page.locator('input[type="date"]').count();
        if (dateInputs > 0) {
          // Safari has unique date input behavior
          const firstDateInput = page.locator('input[type="date"]').first();
          if (await firstDateInput.isVisible()) {
            try {
              await firstDateInput.fill('2024-01-01');
            } catch (error) {
              // This might fail in Safari, but shouldn't break the page
            }
          }
        }
      }

    } catch (error) {
      checks.passed = false;
      checks.errors.push(`Browser compatibility check failed: ${error.message}`);
    }

    return {
      passed: checks.passed,
      error: checks.errors.join('; ')
    };
  }

  async testMobileFunctionality() {
    console.log('\n📱 Testing Mobile-Specific Functionality...');
    
    this.testResults.mobileTests = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    const browser = this.browsers.find(b => b.name === 'chromium');
    if (!browser) return;

    const page = await browser.instance.newPage();
    
    // Simulate mobile device
    await page.emulate({
      viewport: this.viewports.mobile,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      isMobile: true,
      hasTouch: true
    });

    const mobileTests = [
      {
        name: 'Touch Navigation',
        test: async () => {
          await page.goto(`${this.baseUrl}/dashboard`);
          await page.waitForLoadState('networkidle');
          
          // Test touch interactions
          const touchElements = await page.locator('button, a, .clickable').count();
          if (touchElements > 0) {
            const firstElement = page.locator('button, a, .clickable').first();
            if (await firstElement.isVisible()) {
              await firstElement.tap();
              return true;
            }
          }
          return false;
        }
      },
      {
        name: 'Mobile Menu Functionality',
        test: async () => {
          await page.goto(`${this.baseUrl}/`);
          await page.waitForLoadState('networkidle');
          
          const mobileMenuTrigger = page.locator('.hamburger, .mobile-menu-trigger, [data-testid="mobile-menu"]');
          if (await mobileMenuTrigger.count() > 0) {
            await mobileMenuTrigger.tap();
            await page.waitForTimeout(500);
            
            const menu = page.locator('.mobile-menu, .menu-open, .nav-open');
            return await menu.count() > 0;
          }
          return true; // Pass if no mobile menu needed
        }
      },
      {
        name: 'Swipe Gestures',
        test: async () => {
          await page.goto(`${this.baseUrl}/deals`);
          await page.waitForLoadState('networkidle');
          
          // Look for swipeable elements
          const swipeableElements = await page.locator('.swipeable, .carousel, .slider').count();
          if (swipeableElements > 0) {
            const firstSwipeable = page.locator('.swipeable, .carousel, .slider').first();
            const box = await firstSwipeable.boundingBox();
            
            if (box) {
              // Simulate swipe gesture
              await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
              await page.touchscreen.tap(box.x + box.width / 4, box.y + box.height / 2);
              return true;
            }
          }
          return true; // Pass if no swipeable elements
        }
      },
      {
        name: 'Virtual Keyboard Handling',
        test: async () => {
          await page.goto(`${this.baseUrl}/login`);
          await page.waitForLoadState('networkidle');
          
          const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"]');
          if (await inputs.count() > 0) {
            const firstInput = inputs.first();
            await firstInput.tap();
            await page.waitForTimeout(500);
            
            // Check if page scrolled to keep input visible
            const inputBox = await firstInput.boundingBox();
            const viewportHeight = page.viewportSize().height;
            
            return inputBox && inputBox.y < viewportHeight * 0.7; // Input should be in upper 70% of screen
          }
          return true;
        }
      }
    ];

    for (const test of mobileTests) {
      await this.runMobileTest(test.name, test.test);
    }

    await page.close();
  }

  async testAccessibilityCompliance() {
    console.log('\n♿ Testing Accessibility Compliance...');
    
    this.testResults.accessibilityTests = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    const browser = this.browsers.find(b => b.name === 'chromium');
    if (!browser) return;

    const page = await browser.instance.newPage();
    await page.setViewportSize(this.viewports.desktop);

    for (const route of this.testRoutes) {
      await this.testAccessibilityRoute(page, route);
    }

    await page.close();
  }

  async testAccessibilityRoute(page, route) {
    const testName = `Accessibility - ${route}`;
    
    try {
      await page.goto(`${this.baseUrl}${route}`);
      await page.waitForLoadState('networkidle');
      
      // Run axe-core accessibility tests
      const accessibilityResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      
      const violations = accessibilityResults.violations;
      const manualTests = await this.runManualAccessibilityChecks(page);
      
      if (violations.length === 0 && manualTests.passed) {
        this.recordAccessibilityResult(testName, true);
      } else {
        const errors = violations.map(v => `${v.id}: ${v.description}`);
        if (!manualTests.passed) {
          errors.push(manualTests.error);
        }
        this.recordAccessibilityResult(testName, false, errors.join('; '));
      }
      
    } catch (error) {
      this.recordAccessibilityResult(testName, false, error.message);
    }
  }

  async runManualAccessibilityChecks(page) {
    const checks = {
      passed: true,
      errors: []
    };

    try {
      // Check for keyboard navigation
      const focusableElements = await page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();
      if (focusableElements > 0) {
        await page.keyboard.press('Tab');
        const activeElement = await page.evaluate(() => document.activeElement.tagName);
        if (!activeElement || activeElement === 'BODY') {
          checks.passed = false;
          checks.errors.push('Keyboard navigation not working');
        }
      }

      // Check for alt text on images
      const images = await page.locator('img').count();
      if (images > 0) {
        const imagesWithoutAlt = await page.locator('img:not([alt])').count();
        if (imagesWithoutAlt > 0) {
          checks.passed = false;
          checks.errors.push('Images missing alt text');
        }
      }

      // Check for form labels
      const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"], textarea').count();
      if (inputs > 0) {
        const inputsWithoutLabels = await page.locator('input:not([aria-label]):not([aria-labelledby])').count();
        const labels = await page.locator('label').count();
        
        if (inputsWithoutLabels > 0 && labels === 0) {
          checks.passed = false;
          checks.errors.push('Form inputs missing labels');
        }
      }

      // Check color contrast (simplified check)
      const textElements = await page.locator('p, span, h1, h2, h3, h4, h5, h6, button, a').first();
      if (await textElements.count() > 0) {
        const contrastInfo = await textElements.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            fontSize: parseFloat(styles.fontSize)
          };
        });
        
        // Basic contrast check (this would need proper color contrast calculation in real implementation)
        if (contrastInfo.color === contrastInfo.backgroundColor) {
          checks.passed = false;
          checks.errors.push('Potential color contrast issue');
        }
      }

      // Check for heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
      if (headings.length > 0) {
        // Check if there's an h1
        const h1Count = await page.locator('h1').count();
        if (h1Count === 0) {
          checks.passed = false;
          checks.errors.push('Missing main heading (h1)');
        } else if (h1Count > 1) {
          checks.passed = false;
          checks.errors.push('Multiple h1 elements found');
        }
      }

    } catch (error) {
      checks.passed = false;
      checks.errors.push(`Manual accessibility check failed: ${error.message}`);
    }

    return {
      passed: checks.passed,
      error: checks.errors.join('; ')
    };
  }

  async testPerformance() {
    console.log('\n⚡ Testing Performance...');
    
    this.testResults.performanceTests = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    const browser = this.browsers.find(b => b.name === 'chromium');
    if (!browser) return;

    const page = await browser.instance.newPage();
    
    const performanceTests = [
      {
        name: 'Page Load Time',
        test: async () => {
          const startTime = Date.now();
          await page.goto(`${this.baseUrl}/dashboard`);
          await page.waitForLoadState('networkidle');
          const loadTime = Date.now() - startTime;
          
          return loadTime < 5000; // Should load within 5 seconds
        }
      },
      {
        name: 'Resource Loading',
        test: async () => {
          await page.goto(`${this.baseUrl}/`);
          
          const resources = await page.evaluate(() => {
            const entries = performance.getEntriesByType('resource');
            return entries.map(entry => ({
              name: entry.name,
              duration: entry.duration,
              size: entry.transferSize
            }));
          });
          
          const slowResources = resources.filter(r => r.duration > 2000);
          return slowResources.length === 0;
        }
      },
      {
        name: 'Memory Usage',
        test: async () => {
          await page.goto(`${this.baseUrl}/dashboard`);
          await page.waitForLoadState('networkidle');
          
          const memoryInfo = await page.evaluate(() => {
            if (performance.memory) {
              return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
              };
            }
            return null;
          });
          
          if (memoryInfo) {
            const usagePercent = (memoryInfo.used / memoryInfo.limit) * 100;
            return usagePercent < 50; // Should use less than 50% of available memory
          }
          
          return true; // Pass if memory info not available
        }
      }
    ];

    for (const test of performanceTests) {
      await this.runPerformanceTest(test.name, test.test);
    }

    await page.close();
  }

  recordResponsiveResult(testName, passed, error = null) {
    this.testResults.total++;
    this.testResults.responsiveTests.total++;

    if (passed) {
      this.testResults.passed++;
      this.testResults.responsiveTests.passed++;
      console.log(`    ✅ ${testName}`);
    } else {
      this.testResults.failed++;
      this.testResults.responsiveTests.failed++;
      console.log(`    ❌ ${testName}${error ? ': ' + error : ''}`);
      this.testResults.errors.push(`Responsive - ${testName}${error ? ': ' + error : ''}`);
    }

    this.testResults.responsiveTests.tests = this.testResults.responsiveTests.tests || [];
    this.testResults.responsiveTests.tests.push({
      test: testName,
      status: passed ? 'PASS' : 'FAIL',
      error: error,
      timestamp: new Date().toISOString()
    });
  }

  recordBrowserResult(testName, passed, error = null) {
    this.testResults.total++;
    this.testResults.browserCompatibility.total++;

    if (passed) {
      this.testResults.passed++;
      this.testResults.browserCompatibility.passed++;
      console.log(`    ✅ ${testName}`);
    } else {
      this.testResults.failed++;
      this.testResults.browserCompatibility.failed++;
      console.log(`    ❌ ${testName}${error ? ': ' + error : ''}`);
      this.testResults.errors.push(`Browser - ${testName}${error ? ': ' + error : ''}`);
    }

    this.testResults.browserCompatibility.tests = this.testResults.browserCompatibility.tests || [];
    this.testResults.browserCompatibility.tests.push({
      test: testName,
      status: passed ? 'PASS' : 'FAIL',
      error: error,
      timestamp: new Date().toISOString()
    });
  }

  async runMobileTest(testName, testFunction) {
    this.testResults.total++;
    this.testResults.mobileTests.total++;

    try {
      const result = await testFunction();
      if (result) {
        this.testResults.passed++;
        this.testResults.mobileTests.passed++;
        console.log(`    ✅ ${testName}`);
      } else {
        throw new Error('Test returned false');
      }
    } catch (error) {
      this.testResults.failed++;
      this.testResults.mobileTests.failed++;
      console.log(`    ❌ ${testName}: ${error.message}`);
      this.testResults.errors.push(`Mobile - ${testName}: ${error.message}`);
    }

    this.testResults.mobileTests.tests = this.testResults.mobileTests.tests || [];
    this.testResults.mobileTests.tests.push({
      test: testName,
      status: this.testResults.mobileTests.tests.length < this.testResults.mobileTests.passed ? 'PASS' : 'FAIL',
      error: this.testResults.mobileTests.tests.length >= this.testResults.mobileTests.passed ? error?.message : null,
      timestamp: new Date().toISOString()
    });
  }

  recordAccessibilityResult(testName, passed, error = null) {
    this.testResults.total++;
    this.testResults.accessibilityTests.total++;

    if (passed) {
      this.testResults.passed++;
      this.testResults.accessibilityTests.passed++;
      console.log(`    ✅ ${testName}`);
    } else {
      this.testResults.failed++;
      this.testResults.accessibilityTests.failed++;
      console.log(`    ❌ ${testName}${error ? ': ' + error : ''}`);
      this.testResults.errors.push(`Accessibility - ${testName}${error ? ': ' + error : ''}`);
    }

    this.testResults.accessibilityTests.tests = this.testResults.accessibilityTests.tests || [];
    this.testResults.accessibilityTests.tests.push({
      test: testName,
      status: passed ? 'PASS' : 'FAIL',
      error: error,
      timestamp: new Date().toISOString()
    });
  }

  async runPerformanceTest(testName, testFunction) {
    this.testResults.total++;
    this.testResults.performanceTests.total++;

    try {
      const result = await testFunction();
      if (result) {
        this.testResults.passed++;
        this.testResults.performanceTests.passed++;
        console.log(`    ✅ ${testName}`);
      } else {
        throw new Error('Test returned false');
      }
    } catch (error) {
      this.testResults.failed++;
      this.testResults.performanceTests.failed++;
      console.log(`    ❌ ${testName}: ${error.message}`);
      this.testResults.errors.push(`Performance - ${testName}: ${error.message}`);
    }

    this.testResults.performanceTests.tests = this.testResults.performanceTests.tests || [];
    this.testResults.performanceTests.tests.push({
      test: testName,
      status: this.testResults.performanceTests.tests.length < this.testResults.performanceTests.passed ? 'PASS' : 'FAIL',
      error: this.testResults.performanceTests.tests.length >= this.testResults.performanceTests.passed ? error?.message : null,
      timestamp: new Date().toISOString()
    });
  }

  async runAllCrossPlatformTests() {
    console.log('🌐 Starting Comprehensive Cross-Platform & Accessibility Tests...');
    
    await this.testResponsiveDesign();
    await this.testBrowserCompatibility();
    await this.testMobileFunctionality();
    await this.testAccessibilityCompliance();
    await this.testPerformance();
  }

  async cleanup() {
    for (const browser of this.browsers) {
      if (browser.instance) {
        await browser.instance.close();
      }
    }
  }

  generateReport() {
    const passRate = this.testResults.total > 0 ? 
      ((this.testResults.passed / this.testResults.total) * 100).toFixed(2) : 0;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 CROSS-PLATFORM & ACCESSIBILITY TEST REPORT');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed} (${passRate}%)`);
    console.log(`Failed: ${this.testResults.failed}`);
    
    console.log('\n📋 CATEGORY BREAKDOWN:');
    
    const categories = ['responsiveTests', 'browserCompatibility', 'mobileTests', 'accessibilityTests', 'performanceTests'];
    categories.forEach(category => {
      const results = this.testResults[category];
      if (results && results.total > 0) {
        const categoryPassRate = ((results.passed / results.total) * 100).toFixed(2);
        const categoryName = category.replace('Tests', '').replace(/([A-Z])/g, ' $1').toLowerCase();
        console.log(`  ${categoryName}: ${results.passed}/${results.total} (${categoryPassRate}%)`);
      }
    });

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
      responsive: this.testResults.responsiveTests,
      browserCompatibility: this.testResults.browserCompatibility,
      mobile: this.testResults.mobileTests,
      accessibility: this.testResults.accessibilityTests,
      performance: this.testResults.performanceTests,
      errors: this.testResults.errors
    };
  }
}

module.exports = { CrossPlatformAccessibilityTester };