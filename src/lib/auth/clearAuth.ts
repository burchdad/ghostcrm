/**
 * SECURITY FIX: Clear all authentication storage
 * This will be executed when users visit the login page to ensure clean state
 */

if (typeof window !== 'undefined') {
  // Clear all localStorage authentication data
  localStorage.removeItem('ghostcrm_user');
  localStorage.removeItem('ghostcrm_session_time');
  localStorage.removeItem('ghostcrm_demo_mode');
  localStorage.removeItem('ghostcrm_trial_mode');
  localStorage.removeItem('ghostcrm_auth_token');
  
  // Clear any cookies by setting them to expire
  document.cookie = 'ghostcrm_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;';
  document.cookie = 'ghostcrm_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  console.log('🔒 [SECURITY] Cleared all stored authentication data');
}

export const clearAuthStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ghostcrm_user');
    localStorage.removeItem('ghostcrm_session_time');
    localStorage.removeItem('ghostcrm_demo_mode');
    localStorage.removeItem('ghostcrm_trial_mode');
    localStorage.removeItem('ghostcrm_auth_token');
    
    // Clear cookies
    document.cookie = 'ghostcrm_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;';
    document.cookie = 'ghostcrm_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};