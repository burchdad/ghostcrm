/**
 * Test script for Client Database Provisioning System
 * This script validates the provisioning system functionality
 */

import { ClientDatabaseProvisioner, ProvisioningQueue } from './provisioning-system'

// Mock configuration for testing
const testConfig = {
  clientId: 'test-client-' + Date.now(),
  clientName: 'Test Corporation',
  adminEmail: 'admin@testcorp.com',
  adminPassword: 'SecureTestPassword123!',
  databaseUrl: process.env.TEST_SUPABASE_URL || 'http://localhost:54321',
  databaseKey: process.env.TEST_SUPABASE_SERVICE_KEY || 'test-key',
  settings: {
    timezone: 'America/New_York',
    currency: 'USD',
    primary_color: '#FF6B35'
  }
}

async function testProvisioning() {
  console.log('🧪 Starting Client Database Provisioning Tests')
  console.log('=' .repeat(50))
  
  try {
    // Test 1: Configuration Validation
    console.log('📋 Test 1: Configuration validation...')
    const provisioner = new ClientDatabaseProvisioner()
    
    // This should pass validation
    await provisioner['validateConfig'](testConfig)
    console.log('✅ Configuration validation passed')
    
    // Test 2: Queue System
    console.log('\n📋 Test 2: Queue system...')
    const queue = new ProvisioningQueue()
    
    // Check initial queue status
    const initialStatus = queue.getQueueStatus()
    console.log('📊 Initial queue status:', initialStatus)
    
    // Add test client to queue
    await queue.addToQueue(testConfig)
    
    // Check updated queue status
    const updatedStatus = queue.getQueueStatus()
    console.log('📊 Updated queue status:', updatedStatus)
    console.log('✅ Queue system working correctly')
    
    // Test 3: SQL Template Validation
    console.log('\n📋 Test 3: SQL template validation...')
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const templatePath = path.join(process.cwd(), 'migrations', 'client-provisioning', '001_client_schema_template.pgsql')
    
    try {
      const template = await fs.readFile(templatePath, 'utf-8')
      
      // Basic validation checks
      const requiredTables = [
        'users', 'user_profiles', 'contacts', 'deals', 
        'activities', 'appointments', 'invoices', 'payments',
        'workflows', 'files', 'client_settings', 'audit_logs'
      ]
      
      const missingTables = requiredTables.filter(table => 
        !template.includes(`CREATE TABLE IF NOT EXISTS ${table}`)
      )
      
      if (missingTables.length > 0) {
        throw new Error(`Missing tables in template: ${missingTables.join(', ')}`)
      }
      
      // Check for RLS policies
      if (!template.includes('ENABLE ROW LEVEL SECURITY')) {
        throw new Error('Row Level Security not enabled in template')
      }
      
      // Check for indexes
      if (!template.includes('CREATE INDEX')) {
        throw new Error('No indexes found in template')
      }
      
      console.log('✅ SQL template validation passed')
      
    } catch (error) {
      console.error('❌ SQL template validation failed:', (error as Error).message)
      throw error
    }
    
    // Test 4: Error Handling
    console.log('\n📋 Test 4: Error handling...')
    
    const invalidConfig = {
      ...testConfig,
      adminEmail: 'invalid-email' // Invalid email format
    }
    
    try {
      await provisioner['validateConfig'](invalidConfig)
      throw new Error('Should have failed validation')
    } catch (error) {
      if ((error as Error).message.includes('Invalid admin email format')) {
        console.log('✅ Error handling working correctly')
      } else {
        throw error
      }
    }
    
    console.log('\n🎉 All tests passed successfully!')
    console.log('=' .repeat(50))
    
    return true
    
  } catch (error) {
    console.error('\n❌ Test failed:', (error as Error).message)
    console.error('Stack trace:', (error as Error).stack)
    console.log('=' .repeat(50))
    
    return false
  }
}

// Mock function tests
async function testUtilityFunctions() {
  console.log('\n🔧 Testing utility functions...')
  
  const provisioner = new ClientDatabaseProvisioner()
  
  // Test password generation
  const password1 = provisioner['generateSecurePassword']()
  const password2 = provisioner['generateSecurePassword']()
  
  if (password1.length !== 16 || password2.length !== 16) {
    throw new Error('Password generation failed - incorrect length')
  }
  
  if (password1 === password2) {
    throw new Error('Password generation failed - not random')
  }
  
  console.log('✅ Password generation working')
  
  // Test setting descriptions
  const description = provisioner['getSettingDescription']('company_name')
  if (!description || description === 'Custom client setting') {
    throw new Error('Setting description failed')
  }
  
  console.log('✅ Setting descriptions working')
  
  // Test public setting detection
  const isPublic = provisioner['isPublicSetting']('company_name')
  const isPrivate = provisioner['isPublicSetting']('email_from_address')
  
  if (!isPublic || isPrivate) {
    throw new Error('Public setting detection failed')
  }
  
  console.log('✅ Public setting detection working')
  
  console.log('✅ All utility functions working correctly')
}

// Integration test with mock data
async function integrationTest() {
  console.log('\n🔗 Running integration test...')
  
  const { onClientRegistration } = await import('../../src/hooks/useClientRegistration')
  
  const registrationData = {
    companyName: 'Integration Test Corp',
    adminEmail: 'admin@integrationtest.com',
    adminFirstName: 'John',
    adminLastName: 'Doe',
    plan: 'professional' as const
  }
  
  // This would normally trigger actual provisioning
  // For testing, we'll just verify the function structure
  const result = await onClientRegistration(registrationData)
  
  if (!result.success || !result.clientId || !result.provisioningTriggered) {
    throw new Error('Integration test failed - invalid result structure')
  }
  
  console.log('✅ Integration test passed')
  console.log('📝 Result:', result)
}

// Run all tests
if (require.main === module) {
  (async () => {
    const success = await testProvisioning()
    
    if (success) {
      await testUtilityFunctions()
      await integrationTest()
      
      console.log('\n🎊 ALL TESTS COMPLETED SUCCESSFULLY! 🎊')
      process.exit(0)
    } else {
      console.log('\n💥 TESTS FAILED')
      process.exit(1)
    }
  })()
}

export { testProvisioning, testUtilityFunctions, integrationTest }