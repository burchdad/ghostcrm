-- Verify that all tables from the migration exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check specific missing tables that were created
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collaboration_channels') THEN 'EXISTS'
    ELSE 'MISSING'
  END as collaboration_channels,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collaboration_messages') THEN 'EXISTS'
    ELSE 'MISSING'
  END as collaboration_messages,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_memberships') THEN 'EXISTS'
    ELSE 'MISSING'
  END as organization_memberships,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN 'EXISTS'
    ELSE 'MISSING'
  END as subscriptions,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promo_codes') THEN 'EXISTS'
    ELSE 'MISSING'
  END as promo_codes,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subdomains') THEN 'EXISTS'
    ELSE 'MISSING'
  END as subdomains;

-- Check migration record
SELECT * FROM _migrations WHERE id = 'missing_tables_2026_01_05';