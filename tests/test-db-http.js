const http = require('http');

// Test database connectivity using built-in http module
const testDatabase = () => {
  return new Promise((resolve, reject) => {
    console.log('🔍 Testing database connection...');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/test/database',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
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
          
          resolve(result);
        } catch (error) {
          console.error('❌ Failed to parse response:', error.message);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.end();
  });
};

// Run the test
testDatabase().catch(console.error);