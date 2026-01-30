-- Selective Data Cleanup Script for Specific Emails/Organizations
-- Run this in Supabase SQL Editor to clear data for specific users/organizations
-- WARNING: This will delete ALL data associated with the specified emails or organization IDs

-- ============================================
-- CONFIGURATION: Set your target criteria here
-- ============================================

-- EXAMPLE: Clean up test data (modify these values)
DO $$
DECLARE
  target_emails TEXT[] := ARRAY['burchsl4@gmail.com', 'missyburch90@gmail.com', 'stephen.burch6@student.ctuonline.edu'];
  target_subdomains TEXT[] := ARRAY['test%', 'burchmotors'];
  user_ids UUID[];
  org_ids UUID[];
  deleted_count INTEGER;
BEGIN
  -- Disable RLS temporarily
  SET session_replication_role = replica;
  
  -- Collect target user IDs
  SELECT ARRAY_AGG(DISTINCT u.id) INTO user_ids
  FROM users u 
  WHERE u.email = ANY(target_emails)
     OR u.organization_id IN (
       SELECT id FROM organizations 
       WHERE subdomain = ANY(target_subdomains) 
          OR subdomain LIKE ANY(target_subdomains)
     );
  
  -- Collect target organization IDs
  SELECT ARRAY_AGG(DISTINCT org_id) INTO org_ids
  FROM (
    SELECT id as org_id FROM organizations 
    WHERE subdomain = ANY(target_subdomains) 
       OR subdomain LIKE ANY(target_subdomains)
    UNION
    SELECT DISTINCT organization_id FROM users 
    WHERE email = ANY(target_emails) AND organization_id IS NOT NULL
  ) t;
  
  RAISE NOTICE 'Target emails: %', target_emails;
  RAISE NOTICE 'Found % users to delete', COALESCE(array_length(user_ids, 1), 0);
  RAISE NOTICE 'Found % organizations to delete', COALESCE(array_length(org_ids, 1), 0);
  
  -- Delete from tables that exist (with error handling)
  
  -- Business data tables
  BEGIN
    DELETE FROM leads WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % leads', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table leads does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM contacts WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % contacts', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table contacts does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM deals WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % deals', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table deals does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM activities WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % activities', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table activities does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM notifications WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % notifications', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table notifications does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM calendar_events WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % calendar_events', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table calendar_events does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM analytics_metrics WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % analytics_metrics', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table analytics_metrics does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM organization_settings WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % organization_settings', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table organization_settings does not exist, skipping';
  END;
  
  -- Collaboration data tables
  BEGIN
    DELETE FROM collab_notifications WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % collab_notifications', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table collab_notifications does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM collab_permissions WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % collab_permissions', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table collab_permissions does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM collab_scheduled_shares WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % collab_scheduled_shares', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table collab_scheduled_shares does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM collab_comments WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % collab_comments', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table collab_comments does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM collab_versions WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % collab_versions', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table collab_versions does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM collab_activity WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % collab_activity', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table collab_activity does not exist, skipping';
  END;
  
  -- Billing and subscription data
  BEGIN
    DELETE FROM subscriptions WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % subscriptions', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table subscriptions does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM tenant_subscriptions WHERE tenant_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % tenant_subscriptions', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table tenant_subscriptions does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM billing_events WHERE tenant_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % billing_events', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table billing_events does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM billing_sessions WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % billing_sessions', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table billing_sessions does not exist, skipping';
  END;
  
  -- Tenant membership and audit data
  BEGIN
    DELETE FROM tenant_memberships 
    WHERE user_id = ANY(user_ids) OR tenant_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % tenant_memberships', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table tenant_memberships does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM audit_events 
    WHERE actor_id = ANY(user_ids) 
       OR org_id = ANY(org_ids)
       OR entity_id::text = ANY(ARRAY(SELECT user_id::text FROM unnest(user_ids) AS user_id));
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % audit_events', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table audit_events does not exist, skipping';
  END;
  
  -- Core organization structure (delete in order)
  BEGIN
    DELETE FROM organization_memberships 
    WHERE user_id = ANY(user_ids) OR organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % organization_memberships', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table organization_memberships does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM subdomains WHERE organization_id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % subdomains', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table subdomains does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM users WHERE id = ANY(user_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % users', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table users does not exist, skipping';
  END;
  
  BEGIN
    DELETE FROM organizations WHERE id = ANY(org_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % organizations', deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table organizations does not exist, skipping';
  END;
  
  -- Re-enable RLS
  SET session_replication_role = DEFAULT;
  
  RAISE NOTICE 'CLEANUP COMPLETED SUCCESSFULLY';
  
END $$;