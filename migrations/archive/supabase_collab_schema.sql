-- Supabase/Postgres schema for advanced collaboration features

-- Notifications
CREATE TABLE IF NOT EXISTS collab_notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  channel TEXT,
  type TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Permissions
CREATE TABLE IF NOT EXISTS collab_permissions (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  role TEXT,
  permission TEXT,
  dashboard_id TEXT,
  view_id TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled Shares
CREATE TABLE IF NOT EXISTS collab_scheduled_shares (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  target TEXT,
  dashboard_id TEXT,
  view_id TEXT,
  scheduled_time TIMESTAMP,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comments
CREATE TABLE IF NOT EXISTS collab_comments (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  dashboard_id TEXT,
  view_id TEXT,
  text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Version History
CREATE TABLE IF NOT EXISTS collab_versions (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  dashboard_id TEXT,
  view_id TEXT,
  state JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity Log
CREATE TABLE IF NOT EXISTS collab_activity (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  action TEXT,
  target TEXT,
  source TEXT,
  item_type TEXT,
  item_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
