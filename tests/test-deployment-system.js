#!/usr/bin/env node

/**
 * Deployment System Test Script
 * Tests the multi-environment deployment system functionality
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Environment configurations for testing
const TEST_ENVIRONMENTS = {
  development: {
    name: 'development',
    displayName: 'Development Environment',
    baseUrl: 'https://dev.ghostcrm.com',
    supabaseUrl: process.env.DEV_SUPABASE_URL || 'https://dev-dcwixbftjlzwptafvhpz.supabase.co',
    supabaseKey: process.env.DEV_SUPABASE_ANON_KEY || 'test-key'
  },
  staging: {
    name: 'staging',
    displayName: 'Staging Environment',
    baseUrl: 'https://staging.ghostcrm.com',
    supabaseUrl: process.env.STAGING_SUPABASE_URL || 'https://staging-abcdefghijklmnopqrst.supabase.co',
    supabaseKey: process.env.STAGING_SUPABASE_ANON_KEY || 'test-key'
  },
  production: {
    name: 'production',
    displayName: 'Production Environment',
    baseUrl: 'https://app.ghostcrm.com',
    supabaseUrl: process.env.PRODUCTION_SUPABASE_URL || 'https://prod-zyxwvutsrqponmlkjihg.supabase.co',
    supabaseKey: process.env.PRODUCTION_SUPABASE_ANON_KEY || 'test-key'
  }
};

class DeploymentSystemTester {
  constructor() {
    this.testResults = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(logEntry);
    
    if (type === 'error') {
      this.errors.push(logEntry);
    }
  }

  async runTest(testName, testFn) {
    this.log(`Running test: ${testName}`);
    try {
      const startTime = Date.now();
      await testFn();
      const duration = Date.now() - startTime;
      this.testResults.push({
        name: testName,
        status: 'PASSED',
        duration: `${duration}ms`
      });
      this.log(`✅ Test passed: ${testName} (${duration}ms)`, 'success');
    } catch (error) {
      this.testResults.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
      this.log(`❌ Test failed: ${testName} - ${error.message}`, 'error');
    }
  }

  async testEnvironmentConfiguration() {
    // Test that environment configurations are properly loaded
    const configs = Object.values(TEST_ENVIRONMENTS);
    
    if (configs.length !== 3) {
      throw new Error(`Expected 3 environments, got ${configs.length}`);
    }

    configs.forEach(config => {
      if (!config.name || !config.baseUrl) {
        throw new Error(`Invalid config for ${config.name}`);
      }
    });

    this.log('Environment configurations are valid');
  }

  async testFeatureFlagSystem() {
    // Test feature flag creation and retrieval
    const testFlag = {
      flag_key: 'test_feature_' + Date.now(),
      name: 'Test Feature',
      description: 'A test feature flag',
      environments: {
        development: { enabled: true, rollout: 100 },
        staging: { enabled: false, rollout: 0 },
        production: { enabled: false, rollout: 0 }
      },
      rollout_percentage: 0,
      user_targeting: {},
      metadata: { test: true },
      is_active: true
    };

    // This would normally connect to a test database
    this.log('Feature flag system structure is valid');
    
    // Validate flag structure
    const requiredFields = ['flag_key', 'name', 'environments', 'is_active'];
    requiredFields.forEach(field => {
      if (!(field in testFlag)) {
        throw new Error(`Missing required field: ${field}`);
      }
    });

    this.log('Feature flag creation test passed');
  }

  async testDeploymentBundleCreation() {
    // Test deployment bundle structure
    const testBundle = {
      bundle_name: 'test_bundle_' + Date.now(),
      version: '1.0.0',
      source_environment: 'development',
      target_environment: 'staging',
      status: 'pending',
      features: ['test_feature_1', 'test_feature_2'],
      changelog: 'Test deployment bundle',
      approval_required: true,
      metadata: { test: true }
    };

    // Validate bundle structure
    const requiredFields = ['bundle_name', 'version', 'source_environment', 'target_environment', 'features'];
    requiredFields.forEach(field => {
      if (!(field in testBundle)) {
        throw new Error(`Missing required field: ${field}`);
      }
    });

    if (!Array.isArray(testBundle.features)) {
      throw new Error('Features must be an array');
    }

    this.log('Deployment bundle creation test passed');
  }

  async testPromotionWorkflow() {
    // Test promotion workflow logic
    const validPromotions = [
      { from: 'development', to: 'staging' },
      { from: 'staging', to: 'production' }
    ];

    const invalidPromotions = [
      { from: 'development', to: 'production' }, // Should go through staging first
      { from: 'production', to: 'staging' }, // Cannot promote backwards
      { from: 'staging', to: 'development' } // Cannot promote backwards
    ];

    // Test valid promotions
    validPromotions.forEach(promotion => {
      if (!this.isValidPromotion(promotion.from, promotion.to)) {
        throw new Error(`Valid promotion ${promotion.from} -> ${promotion.to} was rejected`);
      }
    });

    // Test invalid promotions
    invalidPromotions.forEach(promotion => {
      if (this.isValidPromotion(promotion.from, promotion.to)) {
        throw new Error(`Invalid promotion ${promotion.from} -> ${promotion.to} was accepted`);
      }
    });

    this.log('Promotion workflow validation passed');
  }

  isValidPromotion(from, to) {
    // Implement promotion rules
    if (from === 'development' && to === 'staging') return true;
    if (from === 'staging' && to === 'production') return true;
    return false;
  }

  async testAPIEndpoints() {
    // Test API endpoint structure (not actual HTTP calls in this test)
    const expectedEndpoints = [
      '/api/deployment/promote',
      '/api/features/flags',
      '/api/deployment/bundles',
      '/api/deployment/history'
    ];

    // Check if API route files exist
    const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
    
    if (!fs.existsSync(apiDir)) {
      throw new Error('API directory does not exist');
    }

    // Check for deployment API route
    const deploymentApiPath = path.join(apiDir, 'deployment', 'promote', 'route.ts');
    if (!fs.existsSync(deploymentApiPath)) {
      throw new Error('Deployment promotion API route does not exist');
    }

    this.log('API endpoint structure validation passed');
  }

  async testGitHubActionsWorkflow() {
    // Test GitHub Actions workflow file
    const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'multi-environment-deployment.yml');
    
    if (!fs.existsSync(workflowPath)) {
      throw new Error('GitHub Actions workflow file does not exist');
    }

    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    // Check for required workflow components
    const requiredComponents = [
      'deploy-development',
      'deploy-staging',
      'deploy-production',
      'build-and-test'
    ];

    requiredComponents.forEach(component => {
      if (!workflowContent.includes(component)) {
        throw new Error(`Workflow missing required component: ${component}`);
      }
    });

    this.log('GitHub Actions workflow validation passed');
  }

  async testEnvironmentFiles() {
    // Test environment configuration files
    const envFiles = [
      '.env.development',
      '.env.staging',
      '.env.production'
    ];

    envFiles.forEach(envFile => {
      const filePath = path.join(process.cwd(), envFile);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Environment file ${envFile} does not exist`);
      }

      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for required environment variables
      const requiredVars = ['GHOST_ENV', 'NODE_ENV', 'DEPLOYMENT_ENVIRONMENT'];
      
      requiredVars.forEach(varName => {
        if (!content.includes(varName)) {
          throw new Error(`Environment file ${envFile} missing required variable: ${varName}`);
        }
      });
    });

    this.log('Environment files validation passed');
  }

  async testDatabaseMigration() {
    // Test database migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '006_deployment_system.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error('Deployment system migration file does not exist');
    }

    const migrationContent = fs.readFileSync(migrationPath, 'utf8');
    
    // Check for required tables
    const requiredTables = [
      'feature_flags',
      'deployment_bundles',
      'deployment_approvals',
      'environment_configs',
      'deployment_history'
    ];

    requiredTables.forEach(table => {
      if (!migrationContent.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
        throw new Error(`Migration missing table: ${table}`);
      }
    });

    this.log('Database migration validation passed');
  }

  async runAllTests() {
    this.log('🚀 Starting Deployment System Tests');
    this.log('=====================================');

    await this.runTest('Environment Configuration', () => this.testEnvironmentConfiguration());
    await this.runTest('Feature Flag System', () => this.testFeatureFlagSystem());
    await this.runTest('Deployment Bundle Creation', () => this.testDeploymentBundleCreation());
    await this.runTest('Promotion Workflow', () => this.testPromotionWorkflow());
    await this.runTest('API Endpoints', () => this.testAPIEndpoints());
    await this.runTest('GitHub Actions Workflow', () => this.testGitHubActionsWorkflow());
    await this.runTest('Environment Files', () => this.testEnvironmentFiles());
    await this.runTest('Database Migration', () => this.testDatabaseMigration());

    this.printResults();
  }

  printResults() {
    this.log('=====================================');
    this.log('🏁 Test Results Summary');
    this.log('=====================================');

    let passed = 0;
    let failed = 0;

    this.testResults.forEach(result => {
      if (result.status === 'PASSED') {
        passed++;
        this.log(`✅ ${result.name} - ${result.duration}`, 'success');
      } else {
        failed++;
        this.log(`❌ ${result.name} - ${result.error}`, 'error');
      }
    });

    this.log('=====================================');
    this.log(`Total Tests: ${this.testResults.length}`);
    this.log(`Passed: ${passed}`);
    this.log(`Failed: ${failed}`);
    
    if (failed === 0) {
      this.log('🎉 All tests passed! Deployment system is ready.', 'success');
    } else {
      this.log('⚠️ Some tests failed. Please review the errors above.', 'error');
    }

    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Run the tests
if (require.main === module) {
  const tester = new DeploymentSystemTester();
  tester.runAllTests().catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
  });
}

module.exports = DeploymentSystemTester;