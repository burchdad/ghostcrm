# Missing Database Tables Analysis

## Overview

Based on analysis of the API endpoints and existing schema, the following tables are referenced in the code but missing from the database schema:

## 🔴 Critical Missing Tables (Referenced in Active APIs)

### 1. Collaboration System Tables

#### `collaboration_channels`
**Referenced in:** `/api/collaboration/channels/route.ts`, `/api/collaboration/messages/route.ts`, `/api/collaboration/start-call/route.ts`
```sql
CREATE TABLE collaboration_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'text', -- text, voice, video, general
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_by UUID, -- User ID who created the channel
  member_count INTEGER DEFAULT 0,
  last_message_id UUID,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `collaboration_messages`
**Referenced in:** `/api/collaboration/messages/route.ts`, `/api/collaboration/channels/route.ts`
```sql
CREATE TABLE collaboration_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES collaboration_channels(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Supabase auth user ID
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'text', -- text, image, file, system
  reply_to_id UUID REFERENCES collaboration_messages(id),
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `collaboration_calls`
**Referenced in:** `/api/collaboration/start-call/route.ts`
```sql
CREATE TABLE collaboration_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES collaboration_channels(id) ON DELETE CASCADE,
  initiated_by TEXT NOT NULL, -- User ID who started the call
  call_type VARCHAR(50) DEFAULT 'voice', -- voice, video, screen_share
  status VARCHAR(50) DEFAULT 'active', -- active, ended, failed
  participants JSONB DEFAULT '[]',
  recording_url TEXT,
  duration INTEGER DEFAULT 0, -- seconds
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `collaboration_meetings`
**Referenced in:** `/api/collaboration/schedule-meeting/route.ts`
```sql
CREATE TABLE collaboration_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES collaboration_channels(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  organized_by TEXT NOT NULL, -- User ID
  attendees JSONB DEFAULT '[]',
  meeting_url TEXT,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `collaboration_files`
**Referenced in:** `/api/collaboration/upload/route.ts`
```sql
CREATE TABLE collaboration_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES collaboration_channels(id) ON DELETE CASCADE,
  uploaded_by TEXT NOT NULL, -- User ID
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_size BIGINT,
  mime_type VARCHAR(100),
  storage_path TEXT NOT NULL,
  download_url TEXT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Workflow & Automation Tables

#### `workflow_triggers`
**Referenced in:** `/api/workflowtriggers/route.ts`
```sql
CREATE TABLE workflow_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(100) NOT NULL, -- lead_created, contact_updated, etc.
  conditions JSONB DEFAULT '{}',
  actions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Billing & Subscription Tables

#### `subscriptions`
**Referenced in:** `/api/webhooks/stripe/route.ts`
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status VARCHAR(50) NOT NULL, -- active, canceled, past_due, etc.
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  plan_id VARCHAR(255),
  quantity INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `tenant_subscriptions`
**Referenced in:** `/api/webhooks/payment/route.ts`
```sql
CREATE TABLE tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  subscription_id VARCHAR(255) UNIQUE,
  customer_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  plan VARCHAR(100),
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `billing_events`
**Referenced in:** `/api/webhooks/payment/route.ts`
```sql
CREATE TABLE billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `billing_sessions`
**Referenced in:** `/api/admin/run-migration/route.ts`
```sql
CREATE TABLE billing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_session_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  success_url TEXT,
  cancel_url TEXT,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `promo_codes`
**Referenced in:** `/api/webhooks/stripe/promo-codes/route.ts`
```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  stripe_promo_code_id VARCHAR(255),
  stripe_coupon_id VARCHAR(255),
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'amount')),
  discount_value DECIMAL(10,2),
  currency VARCHAR(3),
  max_redemptions INTEGER,
  times_redeemed INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. User Management Tables

#### `users` (Enhanced)
**Referenced in:** Multiple APIs for user lookups
```sql
-- Note: This might already exist but needs these columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
```

#### `organization_memberships`
**Referenced in:** `/api/organization/route.ts`, `/api/admin/run-migration/route.ts`
```sql
CREATE TABLE organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Supabase auth user ID
  role VARCHAR(50) DEFAULT 'member',
  permissions JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active',
  invited_by TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `user_organizations`
**Referenced in:** `/api/collaboration/route.ts`
```sql
CREATE TABLE user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. System Tables

#### `subdomains`
**Referenced in:** `/api/webhooks/stripe/route.ts`
```sql
CREATE TABLE subdomains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, active, suspended
  ssl_enabled BOOLEAN DEFAULT false,
  custom_domain VARCHAR(255),
  dns_configured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `user_notification_preferences`
**Referenced in:** `/api/user/settings/export-import/route.ts`
```sql
CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  notification_types JSONB DEFAULT '{}',
  quiet_hours JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🟡 System Migration Tables

#### `_migrations`
**Referenced in:** `/api/admin/run-migration/route.ts`
```sql
CREATE TABLE _migrations (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checksum VARCHAR(64)
);
```

## 📋 Action Items

### Immediate Priority (Production Critical)
1. **Create collaboration tables** - Required for collaboration features
2. **Create billing/subscription tables** - Required for Stripe integration
3. **Create user management tables** - Required for multi-tenant features

### Medium Priority
1. **Create workflow tables** - Required for automation features  
2. **Create system tables** - Required for subdomain management

### Migration Strategy
1. Create tables in dependency order (organizations first, then dependent tables)
2. Add proper indexes and constraints
3. Enable RLS policies for all tables
4. Update existing APIs to handle new table structure
5. Test thoroughly in development before production deployment

## ⚠️ Impact Analysis

**Without these tables, the following features will fail:**
- ❌ Collaboration channels and messaging
- ❌ Stripe billing integration  
- ❌ Multi-tenant user management
- ❌ Workflow automation
- ❌ Subdomain management
- ❌ User settings export/import

**Current API behavior:**
- APIs return fallback responses to prevent crashes
- Detailed error logging shows "relation does not exist" errors
- Frontend remains stable but features are non-functional