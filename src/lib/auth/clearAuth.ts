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
  
  // Clear sessionStorage preserved auth state - KEY FIX!
  sessionStorage.removeItem('ghost_auth_state');
  sessionStorage.removeItem('ghost_auth_backup');
  
  // Clear any cookies by setting them to expire
  const cookiesToClear = ['ghostcrm_jwt'];
  const domains = ['', window.location.hostname, `.${window.location.hostname}`];
  const paths = ['/', '/login'];
  
  cookiesToClear.forEach(cookieName => {
    domains.forEach(domain => {
      paths.forEach(path => {
        const cookieString = domain 
          ? `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`
          : `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
        document.cookie = cookieString;
      });
    });
  });
  
  console.log('🔒 [SECURITY] Cleared all stored authentication data including preserved state');
}

export const clearAuthStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ghostcrm_user');
    localStorage.removeItem('ghostcrm_session_time');
    localStorage.removeItem('ghostcrm_demo_mode');
    localStorage.removeItem('ghostcrm_trial_mode');
    localStorage.removeItem('ghostcrm_auth_token');
    
    // Clear sessionStorage preserved auth state - KEY FIX!
    sessionStorage.removeItem('ghost_auth_state');
    sessionStorage.removeItem('ghost_auth_backup');
    
    // Clear cookies with multiple configurations
    const cookiesToClear = ['ghostcrm_jwt'];
    const domains = ['', window.location.hostname, `.${window.location.hostname}`];
    const paths = ['/', '/login'];
    
    cookiesToClear.forEach(cookieName => {
      domains.forEach(domain => {
        paths.forEach(path => {
          const cookieString = domain 
            ? `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`
            : `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
          document.cookie = cookieString;
        });
      });
    });
  }
};