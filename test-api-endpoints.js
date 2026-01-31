// Simple test for API endpoints
export async function testAPIEndpoints() {
  const endpoints = [
    '/api/voice/initiate-ai-call',
    '/api/voice/call/start'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await fetch(endpoint, { method: 'GET' });
      console.log(`${endpoint}: ${response.status} - ${response.statusText}`);
    } catch (error) {
      console.error(`${endpoint}: FAILED -`, error);
    }
  }
}

// Export for global access in browser console
if (typeof window !== 'undefined') {
  (window as any).testAPIEndpoints = testAPIEndpoints;
}