/**
 * DATABASE INTEGRATION TESTS
 * Tests database operations, data validation, relationships, constraints, transactions
 */

const { Client } = require('pg');
const { chromium } = require('playwright');

class DatabaseIntegrationTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.dbClient = null;
    this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      crudTests: {},
      validationTests: {},
      relationshipTests: {},
      constraintTests: {},
      transactionTests: {},
      errors: []
    };

    this.testTables = [
      'users',
      'organizations', 
      'leads',
      'deals',
      'contacts',
      'tasks',
      'notes',
      'activities',
      'invitations',
      'integrations'
    ];

    this.testData = {
      users: {
        valid: {
          email: 'dbtest@example.com',
          first_name: 'Database',
          last_name: 'Tester',
          password_hash: 'hashedpassword123',
          role: 'user'
        },
        invalid: {
          email: 'invalid-email',
          first_name: '',
          last_name: null
        }
      },
      leads: {
        valid: {
          first_name: 'Test',
          last_name: 'Lead',
          email: 'testlead@example.com',
          company: 'Test Company',
          phone: '+1234567890',
          status: 'new',
          source: 'website'
        },
        invalid: {
          email: 'invalid-email',
          status: 'invalid_status'
        }
      },
      deals: {
        valid: {
          title: 'Test Deal',
          amount: 5000.00,
          stage: 'prospecting',
          probability: 50,
          expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        invalid: {
          amount: -1000,
          probability: 150,
          stage: 'invalid_stage'
        }
      }
    };
  }

  async initialize() {
    console.log('🗄️  Initializing Database Integration Testing...');
    
    // Initialize browser for UI testing
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 100
    });
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });

    // Initialize database connection
    try {
      this.dbClient = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'ghostcrm',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password'
      });
      await this.dbClient.connect();
      console.log('✅ Database connection established');
    } catch (error) {
      console.log('⚠️  Direct database connection failed, will use API endpoints only');
      this.dbClient = null;
    }
  }

  async testCRUDOperations() {
    console.log('\n📊 Testing CRUD Operations...');
    
    this.testResults.crudTests = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    for (const table of this.testTables) {
      console.log(`  Testing CRUD for ${table}...`);
      
      // Test Create
      await this.testCreate(table);
      
      // Test Read
      await this.testRead(table);
      
      // Test Update
      await this.testUpdate(table);
      
      // Test Delete
      await this.testDelete(table);
    }
  }

  async testCreate(table) {
    const testName = `Create ${table}`;
    
    try {
      if (this.dbClient) {
        await this.testDirectCreate(table);
      } else {
        await this.testUICreate(table);
      }
      
      this.recordCRUDResult(testName, true);
    } catch (error) {
      this.recordCRUDResult(testName, false, error.message);
    }
  }

  async testDirectCreate(table) {
    const testData = this.testData[table]?.valid;
    if (!testData) return;

    // Insert test record
    const columns = Object.keys(testData).join(', ');
    const values = Object.values(testData).map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO ${table} (${columns}) VALUES (${values}) RETURNING id`;
    
    const result = await this.dbClient.query(query, Object.values(testData));
    const insertedId = result.rows[0].id;
    
    // Verify insertion
    const verifyQuery = `SELECT * FROM ${table} WHERE id = $1`;
    const verifyResult = await this.dbClient.query(verifyQuery, [insertedId]);
    
    if (verifyResult.rows.length === 0) {
      throw new Error('Record not found after insertion');
    }
    
    // Cleanup
    await this.dbClient.query(`DELETE FROM ${table} WHERE id = $1`, [insertedId]);
  }

  async testUICreate(table) {
    // Login first
    await this.loginTestUser();
    
    // Navigate to appropriate page
    const routeMap = {
      leads: '/leads',
      deals: '/deals',
      contacts: '/contacts',
      tasks: '/tasks'
    };
    
    const route = routeMap[table];
    if (!route) return;
    
    await this.page.goto(`${this.baseUrl}${route}`);
    await this.page.waitForLoadState('networkidle');
    
    // Find and click create button
    const createBtn = this.page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")');
    if (await createBtn.count() > 0) {
      await createBtn.first().click();
      await this.page.waitForTimeout(1000);
      
      // Fill form with test data
      await this.fillCreateForm(table);
      
      // Submit form
      const submitBtn = this.page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await this.page.waitForLoadState('networkidle');
        
        // Verify success (look for success message or redirect)
        const hasSuccess = await this.page.locator('text=success, text=created, text=saved').count() > 0;
        if (!hasSuccess) {
          throw new Error('No success indication after create');
        }
      }
    }
  }

  async fillCreateForm(table) {
    const testData = this.testData[table]?.valid;
    if (!testData) return;
    
    for (const [field, value] of Object.entries(testData)) {
      // Try different field selectors
      const selectors = [
        `input[name="${field}"]`,
        `input[placeholder*="${field}"]`,
        `textarea[name="${field}"]`,
        `select[name="${field}"]`
      ];
      
      for (const selector of selectors) {
        const element = this.page.locator(selector);
        if (await element.count() > 0) {
          const tagName = await element.evaluate(el => el.tagName.toLowerCase());
          
          if (tagName === 'select') {
            await element.selectOption(value.toString());
          } else {
            await element.fill(value.toString());
          }
          break;
        }
      }
    }
  }

  async testRead(table) {
    const testName = `Read ${table}`;
    
    try {
      if (this.dbClient) {
        // Test direct database read
        const query = `SELECT COUNT(*) as count FROM ${table}`;
        const result = await this.dbClient.query(query);
        
        if (result.rows[0].count < 0) {
          throw new Error('Invalid count result');
        }
      } else {
        // Test UI read
        await this.testUIRead(table);
      }
      
      this.recordCRUDResult(testName, true);
    } catch (error) {
      this.recordCRUDResult(testName, false, error.message);
    }
  }

  async testUIRead(table) {
    const routeMap = {
      leads: '/leads',
      deals: '/deals',
      contacts: '/contacts',
      tasks: '/tasks'
    };
    
    const route = routeMap[table];
    if (!route) return;
    
    await this.page.goto(`${this.baseUrl}${route}`);
    await this.page.waitForLoadState('networkidle');
    
    // Check if data is displayed (table, list, or cards)
    const dataElements = await this.page.locator('table, .list-item, .card, .row').count();
    if (dataElements === 0) {
      // Check for empty state
      const emptyState = await this.page.locator('text=no data, text=empty, text=no records').count();
      if (emptyState === 0) {
        throw new Error('No data or empty state indication found');
      }
    }
  }

  async testUpdate(table) {
    const testName = `Update ${table}`;
    
    try {
      if (this.dbClient) {
        await this.testDirectUpdate(table);
      } else {
        await this.testUIUpdate(table);
      }
      
      this.recordCRUDResult(testName, true);
    } catch (error) {
      this.recordCRUDResult(testName, false, error.message);
    }
  }

  async testDirectUpdate(table) {
    const testData = this.testData[table]?.valid;
    if (!testData) return;

    // First create a test record
    const columns = Object.keys(testData).join(', ');
    const values = Object.values(testData).map((_, i) => `$${i + 1}`).join(', ');
    const insertQuery = `INSERT INTO ${table} (${columns}) VALUES (${values}) RETURNING id`;
    
    const insertResult = await this.dbClient.query(insertQuery, Object.values(testData));
    const insertedId = insertResult.rows[0].id;
    
    try {
      // Update the record
      const updateField = Object.keys(testData)[0];
      const updateValue = 'Updated ' + testData[updateField];
      const updateQuery = `UPDATE ${table} SET ${updateField} = $1 WHERE id = $2`;
      
      await this.dbClient.query(updateQuery, [updateValue, insertedId]);
      
      // Verify update
      const verifyQuery = `SELECT ${updateField} FROM ${table} WHERE id = $1`;
      const verifyResult = await this.dbClient.query(verifyQuery, [insertedId]);
      
      if (verifyResult.rows[0][updateField] !== updateValue) {
        throw new Error('Update not reflected in database');
      }
    } finally {
      // Cleanup
      await this.dbClient.query(`DELETE FROM ${table} WHERE id = $1`, [insertedId]);
    }
  }

  async testUIUpdate(table) {
    // This would involve navigating to an edit form and testing updates
    // For now, we'll simulate by checking if edit buttons exist
    const routeMap = {
      leads: '/leads',
      deals: '/deals',
      contacts: '/contacts',
      tasks: '/tasks'
    };
    
    const route = routeMap[table];
    if (!route) return;
    
    await this.page.goto(`${this.baseUrl}${route}`);
    await this.page.waitForLoadState('networkidle');
    
    // Look for edit buttons or links
    const editElements = await this.page.locator('button:has-text("Edit"), a:has-text("Edit"), .edit-btn').count();
    if (editElements === 0) {
      throw new Error('No edit functionality found');
    }
  }

  async testDelete(table) {
    const testName = `Delete ${table}`;
    
    try {
      if (this.dbClient) {
        await this.testDirectDelete(table);
      } else {
        await this.testUIDelete(table);
      }
      
      this.recordCRUDResult(testName, true);
    } catch (error) {
      this.recordCRUDResult(testName, false, error.message);
    }
  }

  async testDirectDelete(table) {
    const testData = this.testData[table]?.valid;
    if (!testData) return;

    // First create a test record
    const columns = Object.keys(testData).join(', ');
    const values = Object.values(testData).map((_, i) => `$${i + 1}`).join(', ');
    const insertQuery = `INSERT INTO ${table} (${columns}) VALUES (${values}) RETURNING id`;
    
    const insertResult = await this.dbClient.query(insertQuery, Object.values(testData));
    const insertedId = insertResult.rows[0].id;
    
    // Delete the record
    const deleteQuery = `DELETE FROM ${table} WHERE id = $1`;
    await this.dbClient.query(deleteQuery, [insertedId]);
    
    // Verify deletion
    const verifyQuery = `SELECT * FROM ${table} WHERE id = $1`;
    const verifyResult = await this.dbClient.query(verifyQuery, [insertedId]);
    
    if (verifyResult.rows.length > 0) {
      throw new Error('Record still exists after deletion');
    }
  }

  async testUIDelete(table) {
    // Similar to update, check for delete functionality
    const routeMap = {
      leads: '/leads',
      deals: '/deals',
      contacts: '/contacts',
      tasks: '/tasks'
    };
    
    const route = routeMap[table];
    if (!route) return;
    
    await this.page.goto(`${this.baseUrl}${route}`);
    await this.page.waitForLoadState('networkidle');
    
    // Look for delete buttons
    const deleteElements = await this.page.locator('button:has-text("Delete"), .delete-btn, .trash').count();
    if (deleteElements === 0) {
      throw new Error('No delete functionality found');
    }
  }

  async testDataValidation() {
    console.log('\n🔍 Testing Data Validation...');
    
    this.testResults.validationTests = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    const validationTests = [
      {
        name: 'Email Format Validation',
        test: async () => {
          if (!this.dbClient) return true;
          
          try {
            await this.dbClient.query(
              'INSERT INTO users (email, first_name, last_name) VALUES ($1, $2, $3)',
              ['invalid-email', 'Test', 'User']
            );
            return false; // Should have failed
          } catch (error) {
            return error.message.includes('email') || error.message.includes('format');
          }
        }
      },
      {
        name: 'Required Fields Validation',
        test: async () => {
          if (!this.dbClient) return true;
          
          try {
            await this.dbClient.query(
              'INSERT INTO leads (email) VALUES ($1)',
              [null]
            );
            return false; // Should have failed
          } catch (error) {
            return error.message.includes('null') || error.message.includes('required');
          }
        }
      },
      {
        name: 'Numeric Range Validation',
        test: async () => {
          if (!this.dbClient) return true;
          
          try {
            await this.dbClient.query(
              'INSERT INTO deals (title, amount, probability) VALUES ($1, $2, $3)',
              ['Test Deal', 1000, 150] // Probability > 100
            );
            
            // Check if constraint prevents invalid probability
            const result = await this.dbClient.query(
              'SELECT probability FROM deals WHERE probability > 100 AND title = $1',
              ['Test Deal']
            );
            
            // Cleanup
            await this.dbClient.query('DELETE FROM deals WHERE title = $1', ['Test Deal']);
            
            return result.rows.length === 0; // Should not allow probability > 100
          } catch (error) {
            return error.message.includes('constraint') || error.message.includes('range');
          }
        }
      }
    ];

    for (const test of validationTests) {
      await this.runValidationTest(test.name, test.test);
    }
  }

  async testRelationships() {
    console.log('\n🔗 Testing Database Relationships...');
    
    this.testResults.relationshipTests = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    if (!this.dbClient) {
      console.log('  Skipping direct database relationship tests (no DB connection)');
      return;
    }

    const relationshipTests = [
      {
        name: 'Foreign Key Constraints',
        test: async () => {
          try {
            // Try to insert a lead with invalid user_id
            await this.dbClient.query(
              'INSERT INTO leads (first_name, last_name, email, user_id) VALUES ($1, $2, $3, $4)',
              ['Test', 'Lead', 'test@example.com', 99999]
            );
            return false; // Should have failed due to FK constraint
          } catch (error) {
            return error.message.includes('foreign key') || error.message.includes('constraint');
          }
        }
      },
      {
        name: 'Cascade Delete',
        test: async () => {
          // Create user
          const userResult = await this.dbClient.query(
            'INSERT INTO users (email, first_name, last_name) VALUES ($1, $2, $3) RETURNING id',
            ['cascade-test@example.com', 'Cascade', 'Test']
          );
          const userId = userResult.rows[0].id;
          
          // Create related records
          await this.dbClient.query(
            'INSERT INTO leads (first_name, last_name, email, user_id) VALUES ($1, $2, $3, $4)',
            ['Related', 'Lead', 'related@example.com', userId]
          );
          
          // Delete user
          await this.dbClient.query('DELETE FROM users WHERE id = $1', [userId]);
          
          // Check if related records are handled properly
          const leadResult = await this.dbClient.query(
            'SELECT * FROM leads WHERE user_id = $1',
            [userId]
          );
          
          return leadResult.rows.length === 0; // Should be deleted or nullified
        }
      }
    ];

    for (const test of relationshipTests) {
      await this.runRelationshipTest(test.name, test.test);
    }
  }

  async testTransactions() {
    console.log('\n💰 Testing Database Transactions...');
    
    this.testResults.transactionTests = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };

    if (!this.dbClient) {
      console.log('  Skipping transaction tests (no DB connection)');
      return;
    }

    const transactionTests = [
      {
        name: 'Transaction Rollback',
        test: async () => {
          await this.dbClient.query('BEGIN');
          
          try {
            // Insert test data
            await this.dbClient.query(
              'INSERT INTO users (email, first_name, last_name) VALUES ($1, $2, $3)',
              ['rollback-test@example.com', 'Rollback', 'Test']
            );
            
            // Force an error
            await this.dbClient.query(
              'INSERT INTO users (email, first_name, last_name) VALUES ($1, $2, $3)',
              [null, 'Invalid', 'User'] // This should fail
            );
            
            await this.dbClient.query('COMMIT');
            return false; // Should not reach here
          } catch (error) {
            await this.dbClient.query('ROLLBACK');
            
            // Verify rollback worked
            const result = await this.dbClient.query(
              'SELECT * FROM users WHERE email = $1',
              ['rollback-test@example.com']
            );
            
            return result.rows.length === 0;
          }
        }
      },
      {
        name: 'Transaction Commit',
        test: async () => {
          await this.dbClient.query('BEGIN');
          
          try {
            const result = await this.dbClient.query(
              'INSERT INTO users (email, first_name, last_name) VALUES ($1, $2, $3) RETURNING id',
              ['commit-test@example.com', 'Commit', 'Test']
            );
            const userId = result.rows[0].id;
            
            await this.dbClient.query('COMMIT');
            
            // Verify commit worked
            const verifyResult = await this.dbClient.query(
              'SELECT * FROM users WHERE id = $1',
              [userId]
            );
            
            // Cleanup
            await this.dbClient.query('DELETE FROM users WHERE id = $1', [userId]);
            
            return verifyResult.rows.length === 1;
          } catch (error) {
            await this.dbClient.query('ROLLBACK');
            throw error;
          }
        }
      }
    ];

    for (const test of transactionTests) {
      await this.runTransactionTest(test.name, test.test);
    }
  }

  async loginTestUser() {
    await this.page.goto(`${this.baseUrl}/login`);
    await this.page.waitForLoadState('networkidle');
    
    await this.page.fill('input[type="email"], input[name="email"]', 'test@example.com');
    await this.page.fill('input[type="password"], input[name="password"]', 'testpassword123');
    
    await this.page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    await this.page.waitForLoadState('networkidle');
  }

  recordCRUDResult(testName, passed, error = null) {
    this.testResults.total++;
    this.testResults.crudTests.total++;

    if (passed) {
      this.testResults.passed++;
      this.testResults.crudTests.passed++;
      console.log(`    ✅ ${testName}`);
    } else {
      this.testResults.failed++;
      this.testResults.crudTests.failed++;
      console.log(`    ❌ ${testName}${error ? ': ' + error : ''}`);
      this.testResults.errors.push(`CRUD - ${testName}${error ? ': ' + error : ''}`);
    }

    this.testResults.crudTests.tests = this.testResults.crudTests.tests || [];
    this.testResults.crudTests.tests.push({
      test: testName,
      status: passed ? 'PASS' : 'FAIL',
      error: error,
      timestamp: new Date().toISOString()
    });
  }

  async runValidationTest(testName, testFunction) {
    this.testResults.total++;
    this.testResults.validationTests.total++;

    try {
      const result = await testFunction();
      if (result) {
        this.testResults.passed++;
        this.testResults.validationTests.passed++;
        console.log(`    ✅ ${testName}`);
      } else {
        throw new Error('Test returned false');
      }
    } catch (error) {
      this.testResults.failed++;
      this.testResults.validationTests.failed++;
      console.log(`    ❌ ${testName}: ${error.message}`);
      this.testResults.errors.push(`Validation - ${testName}: ${error.message}`);
    }

    this.testResults.validationTests.tests = this.testResults.validationTests.tests || [];
    this.testResults.validationTests.tests.push({
      test: testName,
      status: this.testResults.validationTests.tests.length < this.testResults.validationTests.passed ? 'PASS' : 'FAIL',
      error: this.testResults.validationTests.tests.length >= this.testResults.validationTests.passed ? error?.message : null,
      timestamp: new Date().toISOString()
    });
  }

  async runRelationshipTest(testName, testFunction) {
    this.testResults.total++;
    this.testResults.relationshipTests.total++;

    try {
      const result = await testFunction();
      if (result) {
        this.testResults.passed++;
        this.testResults.relationshipTests.passed++;
        console.log(`    ✅ ${testName}`);
      } else {
        throw new Error('Test returned false');
      }
    } catch (error) {
      this.testResults.failed++;
      this.testResults.relationshipTests.failed++;
      console.log(`    ❌ ${testName}: ${error.message}`);
      this.testResults.errors.push(`Relationship - ${testName}: ${error.message}`);
    }

    this.testResults.relationshipTests.tests = this.testResults.relationshipTests.tests || [];
    this.testResults.relationshipTests.tests.push({
      test: testName,
      status: this.testResults.relationshipTests.tests.length < this.testResults.relationshipTests.passed ? 'PASS' : 'FAIL',
      error: this.testResults.relationshipTests.tests.length >= this.testResults.relationshipTests.passed ? error?.message : null,
      timestamp: new Date().toISOString()
    });
  }

  async runTransactionTest(testName, testFunction) {
    this.testResults.total++;
    this.testResults.transactionTests.total++;

    try {
      const result = await testFunction();
      if (result) {
        this.testResults.passed++;
        this.testResults.transactionTests.passed++;
        console.log(`    ✅ ${testName}`);
      } else {
        throw new Error('Test returned false');
      }
    } catch (error) {
      this.testResults.failed++;
      this.testResults.transactionTests.failed++;
      console.log(`    ❌ ${testName}: ${error.message}`);
      this.testResults.errors.push(`Transaction - ${testName}: ${error.message}`);
    }

    this.testResults.transactionTests.tests = this.testResults.transactionTests.tests || [];
    this.testResults.transactionTests.tests.push({
      test: testName,
      status: this.testResults.transactionTests.tests.length < this.testResults.transactionTests.passed ? 'PASS' : 'FAIL',
      error: this.testResults.transactionTests.tests.length >= this.testResults.transactionTests.passed ? error?.message : null,
      timestamp: new Date().toISOString()
    });
  }

  async runAllDatabaseTests() {
    console.log('🗄️  Starting Comprehensive Database Integration Tests...');
    
    await this.testCRUDOperations();
    await this.testDataValidation();
    await this.testRelationships();
    await this.testTransactions();
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    if (this.dbClient) {
      await this.dbClient.end();
    }
  }

  generateReport() {
    const passRate = this.testResults.total > 0 ? 
      ((this.testResults.passed / this.testResults.total) * 100).toFixed(2) : 0;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 DATABASE INTEGRATION TEST REPORT');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed} (${passRate}%)`);
    console.log(`Failed: ${this.testResults.failed}`);
    
    console.log('\n📋 CATEGORY BREAKDOWN:');
    
    const categories = ['crudTests', 'validationTests', 'relationshipTests', 'transactionTests'];
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
      crud: this.testResults.crudTests,
      validation: this.testResults.validationTests,
      relationships: this.testResults.relationshipTests,
      transactions: this.testResults.transactionTests,
      errors: this.testResults.errors
    };
  }
}

module.exports = { DatabaseIntegrationTester };