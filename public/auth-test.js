/**
 * Authentication Verification Script
 * 
 * This script helps verify that the Supabase authentication fixes are working correctly.
 * Run this in the browser console to check for any authentication issues.
 */

// Test authentication state
async function testAuth() {
  console.log('🔍 Testing Authentication State...');
  
  // Check for multiple client instances
  const allSupabaseClients = [];
  if (window._supabaseClient) allSupabaseClients.push('window._supabaseClient');
  if (window.supabase) allSupabaseClients.push('window.supabase');
  
  console.log('📊 Found Supabase client instances:', allSupabaseClients.length);
  if (allSupabaseClients.length > 1) {
    console.warn('⚠️ Multiple client instances detected:', allSupabaseClients);
  } else {
    console.log('✅ Single client instance - good!');
  }
  
  // Test session retrieval
  try {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Auth session valid:', data.user?.email);
    } else {
      console.log('ℹ️ No active session:', data.message);
    }
  } catch (error) {
    console.error('❌ Auth test failed:', error);
  }
  
  // Test refresh endpoint
  try {
    const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST' });
    const refreshData = await refreshResponse.json();
    
    if (refreshResponse.ok) {
      console.log('✅ Token refresh working');
    } else {
      console.log('ℹ️ Refresh response:', refreshData.message);
    }
  } catch (error) {
    console.error('❌ Refresh test failed:', error);
  }
}

// Check localStorage for auth tokens
function checkAuthStorage() {
  console.log('🔍 Checking Authentication Storage...');
  
  const keys = Object.keys(localStorage);
  const supabaseKeys = keys.filter(key => key.includes('supabase') || key.includes('sb-'));
  
  console.log('📊 Supabase storage keys found:', supabaseKeys.length);
  supabaseKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (parsed.access_token) {
          console.log(`✅ ${key}: Has access token`);
        } else {
          console.log(`ℹ️ ${key}: No access token`);
        }
      } catch {
        console.log(`ℹ️ ${key}: Not JSON format`);
      }
    }
  });
}

// Clear auth storage (use if needed)
function clearAuthStorage() {
  console.log('🧹 Clearing Authentication Storage...');
  
  const keys = Object.keys(localStorage);
  const supabaseKeys = keys.filter(key => key.includes('supabase') || key.includes('sb-'));
  
  supabaseKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed: ${key}`);
  });
  
  console.log('✅ Auth storage cleared');
}

// Export functions for manual use
window.authTest = {
  testAuth,
  checkAuthStorage,
  clearAuthStorage
};

console.log('🚀 Authentication test functions loaded. Use:');
console.log('- authTest.testAuth() - Test auth state');
console.log('- authTest.checkAuthStorage() - Check storage');
console.log('- authTest.clearAuthStorage() - Clear storage');

// Auto-run basic tests
testAuth();
checkAuthStorage();