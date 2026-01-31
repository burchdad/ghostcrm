const http = require('http');

function triggerSync() {
  console.log('🔄 Triggering Stripe product sync...');
  
  const postData = JSON.stringify({});
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/stripe/sync-products',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('📊 Sync result:', JSON.stringify(result, null, 2));
        
        if (res.statusCode === 200) {
          console.log('✅ Sync completed successfully!');
        } else {
          console.log('❌ Sync failed:', result);
        }
      } catch (error) {
        console.log('📊 Raw response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Error triggering sync:', error);
  });
  
  req.write(postData);
  req.end();
}

triggerSync();