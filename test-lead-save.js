// Test script to verify lead save functionality
// Run this in the browser console after opening a lead detail modal

console.log('=== Testing Lead Save Functionality ===');

// 1. First, let's check if the enhanced fields are available in the database
async function testDatabaseColumns() {
  try {
    const response = await fetch('/api/leads');
    const leads = await response.json();
    
    if (leads.length > 0) {
      const firstLead = leads[0];
      console.log('Sample lead structure:', firstLead);
      
      // Check if enhanced fields exist
      const enhancedFields = ['email', 'address', 'city', 'state', 'zip_code', 'country', 'budget', 'budget_range', 'timeframe', 'vehicle_interest', 'lead_score', 'referred_by', 'campaign_source'];
      const availableFields = enhancedFields.filter(field => field in firstLead);
      
      console.log('Available enhanced fields:', availableFields);
      console.log('Missing enhanced fields:', enhancedFields.filter(field => !(field in firstLead)));
    }
  } catch (error) {
    console.error('Error testing database columns:', error);
  }
}

// 2. Test the save functionality
async function testLeadSave() {
  console.log('To test lead save:');
  console.log('1. Open a lead detail modal');
  console.log('2. Edit some fields (email, address, budget)');
  console.log('3. Click Save and watch the console for:');
  console.log('   - "PUT request received with body:" (from API)');
  console.log('   - "Updating lead with payload:" (from API)');
  console.log('   - "Database update result:" (from API)');
  console.log('   - "Save successful:" (from frontend)');
  console.log('4. Close modal and reopen to verify persistence');
}

// Run the tests
testDatabaseColumns();
testLeadSave();