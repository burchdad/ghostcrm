// Simple mock hook for user authentication
export function useUser() {
  // In a real application, this would return the actual user data
  return {
    role: 'admin', // 'admin', 'manager', 'sales', 'user'
    name: 'John Doe',
    id: 'user-123'
  };
}