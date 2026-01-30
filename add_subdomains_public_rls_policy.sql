-- Fix for Issue 2: Public tenant routes may be blocked by RLS on subdomains
-- This policy allows public discovery of active subdomains for tenant routing

-- Public RLS policy for subdomain discovery
CREATE POLICY "Allow public read of active subdomains" ON subdomains
FOR SELECT TO anon, authenticated
USING (status = 'active');

-- Note: This policy ensures that:
-- 1. Unauthenticated users can access /login and /register on tenant subdomains
-- 2. The middleware can properly route to tenant-specific pages
-- 3. Only active subdomains are discoverable (security maintained)