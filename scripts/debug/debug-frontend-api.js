// Simple debug script to test the frontend API call directly
async function debugFrontendAPI() {
  try {
    console.log('🔍 [FRONTEND DEBUG] Testing /api/leads call...');
    
    const res = await fetch('/api/leads');
    console.log('📊 [FRONTEND DEBUG] Response status:', res.status, res.statusText);
    
    if (!res.ok) {
      console.error('❌ [FRONTEND DEBUG] Response not OK:', res.status);
      return;
    }
    
    const data = await res.json();
    console.log('📦 [FRONTEND DEBUG] Full API response:', data);
    
    if (data.records) {
      console.log('✅ [FRONTEND DEBUG] Found data.records array with', data.records.length, 'items');
      console.log('📋 [FRONTEND DEBUG] Sample lead structure:', data.records[0]);
      
      // Check for expected fields
      const sampleLead = data.records[0];
      console.log('🔍 [FRONTEND DEBUG] Lead field check:');
      console.log('  - Full Name:', sampleLead["Full Name"]);
      console.log('  - Email Address:', sampleLead["Email Address"]);
      console.log('  - Phone Number:', sampleLead["Phone Number"]);
      console.log('  - Company:', sampleLead["Company"]);
      console.log('  - Stage:', sampleLead["Stage"]);
      console.log('  - opted_out:', sampleLead.opted_out);
    } else {
      console.warn('⚠️ [FRONTEND DEBUG] No data.records found in response');
      console.log('🔍 [FRONTEND DEBUG] Available keys:', Object.keys(data));
    }
    
  } catch (error) {
    console.error('💥 [FRONTEND DEBUG] Error:', error);
  }
}

// Run the debug
debugFrontendAPI();