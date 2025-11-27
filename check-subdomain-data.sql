-- Check subdomain table data to understand the optimization
-- Run this to see current subdomain entries and their owner_email values

SELECT 
    id,
    subdomain_name,
    owner_email,
    status,
    created_at,
    activated_at
FROM subdomains 
ORDER BY created_at DESC 
LIMIT 10;