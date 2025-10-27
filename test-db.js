// Test database connectivity
const testDatabase = async () => {
  try {
    console.log('🔍 Testing database connection...');
    
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
    
    return result;
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return null;
  }
};

// Run the test
testDatabase();