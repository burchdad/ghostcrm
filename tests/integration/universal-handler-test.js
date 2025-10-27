// Test script to verify the universal integration handler
const fetch = require('node-fetch');
const testIntegrations = [
  {
    id: 'hubspot',
    type: 'api-key',
    category: 'CRM',
    config: { apiKey: 'test-key-123' }
  },
  {
    id: 'slack',
    type: 'oauth',
    category: 'Productivity',
    config: { clientId: 'test-client', clientSecret: 'test-secret' }
  },
  {
    id: 'sendgrid',
    type: 'api-key',
    category: 'Email',
    config: { apiKey: 'SG.test-key-123' }
  }
];

async function testUniversalHandler() {
  console.log('Testing Universal Integration Handler...\n');
  
  for (const integration of testIntegrations) {
    console.log(`Testing ${integration.id} (${integration.type}, ${integration.category})...`);
    
    try {
      const response = await fetch('http://localhost:3000/api/settings/integrations/generic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId: integration.id,
          configuration: integration.config,
          testOnly: true
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${integration.id}: SUCCESS`);
        console.log(`   - Connection time: ${result.data?.connectionTime || 0}ms`);
        console.log(`   - Type: ${result.data?.metadata?.type || 'unknown'}`);
        if (result.data?.metadata?.authUrl) {
          console.log(`   - Auth URL: ${result.data.metadata.authUrl}`);
        }
      } else {
        console.log(`❌ ${integration.id}: FAILED`);
        console.log(`   - Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`💥 ${integration.id}: EXCEPTION`);
      console.log(`   - Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Test integration info endpoint
  console.log('Testing integration info endpoint...');
  try {
    const response = await fetch('http://localhost:3000/api/settings/integrations/generic');
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Integration info: SUCCESS`);
      console.log(`   - Available integrations: ${result.data.availableIntegrations}`);
      console.log(`   - Supported types: ${result.data.supportedTypes.join(', ')}`);
      console.log(`   - Categories: ${result.data.categories.join(', ')}`);
    }
  } catch (error) {
    console.log(`💥 Integration info: EXCEPTION - ${error.message}`);
  }
}

// Run the test if this is being executed directly
if (typeof window === 'undefined') {
  testUniversalHandler();
} else {
  // Browser environment - expose as global function
  window.testUniversalHandler = testUniversalHandler;
  console.log('Universal handler test loaded. Run testUniversalHandler() to test.');
}

module.exports = { testUniversalHandler };