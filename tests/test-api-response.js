// Test the exact API call that the frontend makes
async function testAPIResponse() {
  try {
    console.log('🧪 [API TEST] Making request to /api/leads...');
    
    const response = await fetch('/api/leads', {
      method: 'GET',
      credentials: 'include' // Include cookies for authentication
    });
    
    console.log('📊 [API TEST] Response status:', response.status);
    console.log('📊 [API TEST] Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error('❌ [API TEST] Response not OK:', response.status, response.statusText);
      return;
    }
    
    const rawText = await response.text();
    console.log('📄 [API TEST] Raw response text:', rawText);
    
    try {
      const data = JSON.parse(rawText);
      console.log('📦 [API TEST] Parsed JSON:', data);
      
      if (data.records) {
        console.log('✅ [API TEST] Found records array with length:', data.records.length);
        
        if (data.records.length > 0) {
          console.log('📋 [API TEST] First record structure:');
          const firstRecord = data.records[0];
          console.log('  - id:', firstRecord.id);
          console.log('  - Full Name:', firstRecord["Full Name"]);
          console.log('  - Email Address:', firstRecord["Email Address"]);
          console.log('  - Stage:', firstRecord["Stage"] || firstRecord.stage);
          console.log('  - opted_out:', firstRecord.opted_out);
          console.log('  - All keys:', Object.keys(firstRecord));
        }
      } else {
        console.warn('⚠️ [API TEST] No records found in response');
        console.log('Available keys:', Object.keys(data));
      }
      
    } catch (parseError) {
      console.error('💥 [API TEST] JSON parse error:', parseError);
    }
    
  } catch (error) {
    console.error('💥 [API TEST] Fetch error:', error);
  }
}

// Run the test
testAPIResponse();