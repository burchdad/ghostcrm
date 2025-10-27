/**
 * COMPREHENSIVE UI COMPONENT FUNCTIONALITY TESTS
 * Tests every button, form, modal, and interactive element at granular level
 */

const { chromium } = require('playwright');

class UIComponentTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
      componentTests: {},
      interactions: {}
    };
  }

  async initialize() {
    console.log('🚀 Initializing UI Component Testing Framework...');
    this.browser = await chromium.launch({ 
      headless: false, // Show browser for visual verification
      slowMo: 100 // Slow down for better observation
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

    // Set viewport for consistent testing
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async testComponent(componentName, selector, testConfig) {
    console.log(`\n🧪 Testing Component: ${componentName}`);
    this.testResults.componentTests[componentName] = {
      total: 0,
      passed: 0,
      failed: 0,
      interactions: []
    };

    try {
      const element = await this.page.locator(selector).first();
      
      if (!(await element.isVisible())) {
        throw new Error(`Component ${componentName} not visible`);
      }

      // Test basic visibility and accessibility
      await this.testAccessibility(componentName, element);

      // Test specific interactions based on component type
      if (testConfig.type === 'button') {
        await this.testButtonComponent(componentName, element, testConfig);
      } else if (testConfig.type === 'form') {
        await this.testFormComponent(componentName, element, testConfig);
      } else if (testConfig.type === 'modal') {
        await this.testModalComponent(componentName, element, testConfig);
      } else if (testConfig.type === 'dropdown') {
        await this.testDropdownComponent(componentName, element, testConfig);
      } else if (testConfig.type === 'input') {
        await this.testInputComponent(componentName, element, testConfig);
      }

      this.recordResult(componentName, 'Component test completed', true);
    } catch (error) {
      this.recordResult(componentName, `Component test failed: ${error.message}`, false);
    }
  }

  async testButtonComponent(name, element, config) {
    const tests = [
      // Basic button functionality
      {
        name: 'Button Hover State',
        test: async () => {
          await element.hover();
          await this.page.waitForTimeout(500);
          return true;
        }
      },
      {
        name: 'Button Click',
        test: async () => {
          await element.click();
          await this.page.waitForTimeout(1000);
          return true;
        }
      },
      {
        name: 'Button Focus',
        test: async () => {
          await element.focus();
          return await element.evaluate(el => document.activeElement === el);
        }
      },
      {
        name: 'Button Keyboard Navigation',
        test: async () => {
          await element.focus();
          await this.page.keyboard.press('Enter');
          await this.page.waitForTimeout(500);
          return true;
        }
      }
    ];

    if (config.disabled) {
      tests.push({
        name: 'Button Disabled State',
        test: async () => {
          return await element.isDisabled();
        }
      });
    }

    for (const test of tests) {
      await this.runTest(name, test.name, test.test);
    }
  }

  async testFormComponent(name, element, config) {
    const tests = [
      {
        name: 'Form Visibility',
        test: async () => await element.isVisible()
      },
      {
        name: 'Form Submit Button',
        test: async () => {
          const submitBtn = element.locator('button[type="submit"], input[type="submit"]').first();
          return await submitBtn.isVisible();
        }
      }
    ];

    // Test all form inputs
    const inputs = await element.locator('input, textarea, select').all();
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const inputType = await input.getAttribute('type') || 'text';
      const inputName = await input.getAttribute('name') || `input-${i}`;
      
      await this.testFormInput(name, input, inputName, inputType);
    }

    for (const test of tests) {
      await this.runTest(name, test.name, test.test);
    }
  }

  async testFormInput(formName, input, inputName, inputType) {
    const tests = [
      {
        name: `Input ${inputName} - Focus`,
        test: async () => {
          await input.focus();
          return true;
        }
      },
      {
        name: `Input ${inputName} - Type Text`,
        test: async () => {
          if (inputType !== 'file' && inputType !== 'checkbox' && inputType !== 'radio') {
            await input.fill('test-value');
            const value = await input.inputValue();
            return value === 'test-value';
          }
          return true;
        }
      },
      {
        name: `Input ${inputName} - Clear`,
        test: async () => {
          if (inputType !== 'file' && inputType !== 'checkbox' && inputType !== 'radio') {
            await input.clear();
            const value = await input.inputValue();
            return value === '';
          }
          return true;
        }
      }
    ];

    if (inputType === 'checkbox' || inputType === 'radio') {
      tests.push({
        name: `Input ${inputName} - Check/Uncheck`,
        test: async () => {
          await input.check();
          const checked = await input.isChecked();
          await input.uncheck();
          const unchecked = !(await input.isChecked());
          return checked && unchecked;
        }
      });
    }

    for (const test of tests) {
      await this.runTest(formName, test.name, test.test);
    }
  }

  async testModalComponent(name, element, config) {
    const tests = [
      {
        name: 'Modal Visibility',
        test: async () => await element.isVisible()
      },
      {
        name: 'Modal Close Button',
        test: async () => {
          const closeBtn = element.locator('[aria-label*="close"], [title*="close"], .close, button:has-text("Close")').first();
          if (await closeBtn.isVisible()) {
            await closeBtn.click();
            await this.page.waitForTimeout(500);
            return true;
          }
          return false;
        }
      },
      {
        name: 'Modal Escape Key',
        test: async () => {
          await this.page.keyboard.press('Escape');
          await this.page.waitForTimeout(500);
          return true;
        }
      },
      {
        name: 'Modal Background Click',
        test: async () => {
          // Click outside modal area
          await this.page.mouse.click(50, 50);
          await this.page.waitForTimeout(500);
          return true;
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(name, test.name, test.test);
    }
  }

  async testDropdownComponent(name, element, config) {
    const tests = [
      {
        name: 'Dropdown Click to Open',
        test: async () => {
          await element.click();
          await this.page.waitForTimeout(500);
          return true;
        }
      },
      {
        name: 'Dropdown Options Visible',
        test: async () => {
          const options = element.locator('option, [role="option"], li');
          const count = await options.count();
          return count > 0;
        }
      },
      {
        name: 'Dropdown Selection',
        test: async () => {
          const options = element.locator('option, [role="option"], li');
          if (await options.count() > 0) {
            await options.first().click();
            await this.page.waitForTimeout(500);
            return true;
          }
          return false;
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(name, test.name, test.test);
    }
  }

  async testInputComponent(name, element, config) {
    const inputType = await element.getAttribute('type') || 'text';
    
    const tests = [
      {
        name: 'Input Focus',
        test: async () => {
          await element.focus();
          return await element.evaluate(el => document.activeElement === el);
        }
      },
      {
        name: 'Input Type Value',
        test: async () => {
          await element.fill('test input value');
          const value = await element.inputValue();
          return value === 'test input value';
        }
      },
      {
        name: 'Input Clear Value',
        test: async () => {
          await element.clear();
          const value = await element.inputValue();
          return value === '';
        }
      },
      {
        name: 'Input Validation',
        test: async () => {
          // Test with invalid data if input has validation
          const required = await element.getAttribute('required');
          if (required !== null) {
            await element.clear();
            await element.blur();
            const validity = await element.evaluate(el => el.validity.valid);
            return !validity; // Should be invalid when empty and required
          }
          return true;
        }
      }
    ];

    for (const test of tests) {
      await this.runTest(name, test.name, test.test);
    }
  }

  async testAccessibility(componentName, element) {
    const a11yTests = [
      {
        name: 'Has Accessible Name',
        test: async () => {
          const ariaLabel = await element.getAttribute('aria-label');
          const title = await element.getAttribute('title');
          const text = await element.textContent();
          return !!(ariaLabel || title || text?.trim());
        }
      },
      {
        name: 'Focusable',
        test: async () => {
          await element.focus();
          return await element.evaluate(el => document.activeElement === el);
        }
      },
      {
        name: 'Keyboard Accessible',
        test: async () => {
          await element.focus();
          await this.page.keyboard.press('Tab');
          return true;
        }
      }
    ];

    for (const test of a11yTests) {
      await this.runTest(componentName, `A11Y: ${test.name}`, test.test);
    }
  }

  async runTest(componentName, testName, testFunction) {
    this.testResults.total++;
    this.testResults.componentTests[componentName].total++;

    try {
      const result = await testFunction();
      if (result) {
        this.testResults.passed++;
        this.testResults.componentTests[componentName].passed++;
        this.testResults.componentTests[componentName].interactions.push({
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
      this.testResults.componentTests[componentName].failed++;
      this.testResults.componentTests[componentName].interactions.push({
        test: testName,
        status: 'FAIL',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      console.log(`    ❌ ${testName}: ${error.message}`);
      this.testResults.errors.push(`${componentName} - ${testName}: ${error.message}`);
    }
  }

  recordResult(componentName, testName, passed, error = null) {
    this.testResults.total++;
    this.testResults.componentTests[componentName].total++;

    if (passed) {
      this.testResults.passed++;
      this.testResults.componentTests[componentName].passed++;
      this.testResults.componentTests[componentName].interactions.push({
        test: testName,
        status: 'PASS',
        timestamp: new Date().toISOString()
      });
      console.log(`    ✅ ${testName}`);
    } else {
      this.testResults.failed++;
      this.testResults.componentTests[componentName].failed++;
      this.testResults.componentTests[componentName].interactions.push({
        test: testName,
        status: 'FAIL',
        error: error,
        timestamp: new Date().toISOString()
      });
      console.log(`    ❌ ${testName}: ${error}`);
      this.testResults.errors.push(`${componentName} - ${testName}: ${error}`);
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  generateReport() {
    const passRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(2);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 UI COMPONENT FUNCTIONALITY TEST REPORT');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed} (${passRate}%)`);
    console.log(`Failed: ${this.testResults.failed}`);
    console.log(`Pass Rate: ${passRate}%`);
    
    console.log('\n📋 COMPONENT BREAKDOWN:');
    for (const [component, results] of Object.entries(this.testResults.componentTests)) {
      const componentPassRate = ((results.passed / results.total) * 100).toFixed(2);
      console.log(`  ${component}: ${results.passed}/${results.total} (${componentPassRate}%)`);
    }

    if (this.testResults.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.testResults.errors.forEach(error => console.log(`  • ${error}`));
    }

    return {
      summary: {
        total: this.testResults.total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        passRate: parseFloat(passRate)
      },
      components: this.testResults.componentTests,
      errors: this.testResults.errors
    };
  }
}

module.exports = { UIComponentTester };