-- Required columns and sizes
IF COL_LENGTH('dbo.users','email') IS NULL
  ALTER TABLE dbo.users ADD email NVARCHAR(255) NOT NULL;
IF COL_LENGTH('dbo.users','password_hash') IS NULL
  ALTER TABLE dbo.users ADD password_hash NVARCHAR(255) NOT NULL;
IF COL_LENGTH('dbo.users','role') IS NULL
  ALTER TABLE dbo.users ADD role NVARCHAR(50) NOT NULL CONSTRAINT DF_users_role DEFAULT ('user');
IF COL_LENGTH('dbo.users','created_at') IS NULL
  ALTER TABLE dbo.users ADD created_at DATETIME2 NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSUTCDATETIME();

-- Make email unique (create only if it doesn't exist)
IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = 'UX_users_email' AND object_id = OBJECT_ID('dbo.users')
)
CREATE UNIQUE INDEX UX_users_email ON dbo.users(email);

-- (Optional) If you have a NOT NULL column with no default that breaks inserts,
-- find it here and either give it a default or allow NULLs.
-- SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME='users' AND IS_NULLABLE='NO'
