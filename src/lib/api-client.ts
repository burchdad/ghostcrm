// Utility to handle API requests with automatic token refresh
export async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  // Ensure credentials are included
  const requestOptions: RequestInit = {
    ...options,
    credentials: 'include'
  };

  // Make the initial request
  let response = await fetch(url, requestOptions);

  // If we get a 401 with TOKEN_EXPIRED, try to refresh the token
  if (response.status === 401) {
    try {
      const errorData = await response.json();
      
      if (errorData.code === 'TOKEN_EXPIRED') {
        console.log('🔄 Token expired, attempting refresh...');
        
        // Try to refresh the token
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });

        if (refreshResponse.ok) {
          console.log('✅ Token refreshed successfully');
          
          // Retry the original request with the new token
          response = await fetch(url, requestOptions);
        } else {
          const refreshError = await refreshResponse.json();
          if (refreshError.requiresLogin) {
            // 🚨 CRITICAL FIX: Don't redirect to login from billing success page
            const currentPath = window.location.pathname;
            if (currentPath === '/billing/success') {
              console.log('🛡️ Token refresh failed but suppressing redirect on billing success page');
              return response; // Return original 401 response without redirecting
            }
            
            console.log('❌ Token refresh failed, redirecting to login');
            window.location.href = '/login';
            return response; // Return original 401 response
          }
        }
      }
    } catch (error) {
      console.error('Error handling token refresh:', error);
    }
  }

  return response;
}

// Wrapper for common HTTP methods
export const api = {
  get: (url: string, options: RequestInit = {}) => 
    apiRequest(url, { ...options, method: 'GET' }),
    
  post: (url: string, data?: any, options: RequestInit = {}) => 
    apiRequest(url, { 
      ...options, 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: data ? JSON.stringify(data) : undefined
    }),
    
  put: (url: string, data?: any, options: RequestInit = {}) => 
    apiRequest(url, { 
      ...options, 
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: data ? JSON.stringify(data) : undefined
    }),
    
  delete: (url: string, options: RequestInit = {}) => 
    apiRequest(url, { ...options, method: 'DELETE' })
};