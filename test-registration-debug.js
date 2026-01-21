// Test registration to reproduce 400 errors from Vercel logs
const API_BASE = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

async function testRegistration() {
  console.log('🧪 Testing registration with various scenarios...');
  
  const testCases = [
    {
      name: "Valid registration",
      data: {
        email: `test-${Date.now()}@example.com`,
        password: "Password123!",
        firstName: "John",
        lastName: "Doe", 
        companyName: "Test Company",
        subdomain: `test-${Date.now()}`,
        role: "owner"
      }
    },
    {
      name: "Missing password",
      data: {
        email: `test-${Date.now()}@example.com`,
        firstName: "John",
        lastName: "Doe", 
        companyName: "Test Company"
      }
    },
    {
      name: "Invalid email",
      data: {
        email: "invalid-email",
        password: "Password123!",
        firstName: "John",
        lastName: "Doe"
      }
    },
    {
      name: "Reserved subdomain",
      data: {
        email: `test-${Date.now()}@example.com`,
        password: "Password123!",
        firstName: "John", 
        lastName: "Doe",
        companyName: "Test Company",
        subdomain: "admin" // Reserved
      }
    },
    {
      name: "Invalid subdomain format", 
      data: {
        email: `test-${Date.now()}@example.com`,
        password: "Password123!",
        firstName: "John",
        lastName: "Doe", 
        companyName: "Test Company",
        subdomain: "AB" // Too short
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });
      
      const result = await response.json().catch(() => ({}));
      
      console.log(`📊 Status: ${response.status}`);
      if (response.status === 400) {
        console.log(`🔍 400 Error Details:`, {
          error: result.error,
          detail: result.detail,
          suggestion: result.suggestion
        });
      } else if (!response.ok) {
        console.log(`❌ Error:`, result);
      } else {
        console.log(`✅ Success:`, { 
          userId: result.user?.id, 
          organizationId: result.organization?.id 
        });
      }
      
    } catch (fetchError) {
      console.error(`💥 Fetch Error:`, fetchError.message);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run the tests
testRegistration().catch(console.error);