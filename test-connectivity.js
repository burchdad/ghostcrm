// Simple server connectivity test
const testConnectivity = async () => {
  try {
    console.log('🔍 Testing basic server connectivity...');
    
    const response = await fetch('http://localhost:3000/api/sidebar/counts');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.text();
    console.log('✅ Server is accessible');
    console.log('Response:', result);
    
    return true;
    
  } catch (error) {
    console.error('❌ Server connectivity test failed:', error.message);
    return false;
  }
};

// Test basic connectivity first
testConnectivity().then(async (isConnected) => {
  if (isConnected) {
    console.log('\n🔍 Now testing database endpoint...');
    
    try {
      const response = await fetch('http://localhost:3000/api/test/database');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      console.log('📊 Database Test Results:');
      console.log('========================');
      console.log(`Timestamp: ${result.timestamp}`);
      console.log(`Tests Passed: ${result.summary.passed}`);
      console.log(`Tests Failed: ${result.summary.failed}`);
      console.log(`Total Tests: ${result.summary.total}`);
      console.log('');
      
      console.log('Individual Test Results:');
      console.log('------------------------');
      result.tests.forEach(test => {
        const status = test.status === 'PASS' ? '✅' : '❌';
        console.log(`${status} ${test.table} (${test.operation}): ${test.message}`);
      });
      
    } catch (error) {
      console.error('❌ Database test failed:', error.message);
    }
  }
});