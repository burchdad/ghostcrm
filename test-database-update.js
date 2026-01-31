// Manual test script to update subdomain status
console.log('🧪 Manual database test script...');

// This script will:
// 1. Check current subdomain status
// 2. Manually update it to 'active'
// 3. Verify the update worked

// Run this against the actual database
const testQueries = `
-- 1. Check current status
SELECT id, subdomain, status, organization_id, created_at, updated_at 
FROM subdomains 
WHERE subdomain = 'burchmotors';

-- 2. Update to active
UPDATE subdomains 
SET status = 'active', 
    updated_at = NOW(), 
    provisioned_at = NOW() 
WHERE subdomain = 'burchmotors';

-- 3. Verify update
SELECT id, subdomain, status, organization_id, created_at, updated_at, provisioned_at
FROM subdomains 
WHERE subdomain = 'burchmotors';
`;

console.log('📋 SQL Queries to run manually:');
console.log(testQueries);
console.log('\n🔍 After running these queries, test the success page to see if status changes from pending to green!');