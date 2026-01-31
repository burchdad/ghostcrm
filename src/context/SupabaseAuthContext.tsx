// ❌ DEPRECATED: This context has been replaced by @/contexts/auth-context
// ChatGPT's "never happens again" solution eliminated this to prevent Multiple GoTrueClient instances

throw new Error(`
🚨 SupabaseAuthContext is deprecated and causes Multiple GoTrueClient instances warnings!

✅ Use @/contexts/auth-context instead:
   import { useAuth } from '@/contexts/auth-context';

This hard failure prevents accidentally importing the legacy context and 
breaking the bulletproof authentication architecture.
`);